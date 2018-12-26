
import { toBarcode, toQrcode } from '../../../utils/util.js';
let app = getApp();
const _getUrl = 'wxapp.php?c=coupon&a=coupon_detail_v2';//优惠券详情接口
const W = wx.getSystemInfoSync().windowWidth;
const rate = 750.0 / W;
// 300rpx 在6s上为 150px
const qrcode_w = 260 / rate;
let that;
Page({
  data: {
    store_id: '',
    uid: '',
    barcode: '',
    code: '',
    qrcode_w,
    msg: {},
    id: '',//优惠券id
  },
  onLoad: function (options) {
    that = this; let { id  } = options;
    let { store_id, uid } = that.data;
    uid = wx.getStorageSync('userUid') || 142734;
    store_id = app.store_id;
    that.setData({ uid, store_id });
    if (id) {
      that.setData({ id }, () => {
        that.loadCode();
      })
    }


  },
  onReady: function () {

  },
  onShow: function () {

  },
  loadCode() {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let { id } = that.data;
    if (!id || id == '') { return; }
    let params = {
      id
    }
    app.api.postApi(_getUrl, { params }, (err, rep) => {
     
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); wx.hideLoading();return; }
      let { err_code, err_msg } = rep;
    
  
      let qrcode = toQrcode('qrcode', err_msg.qrcode, qrcode_w, qrcode_w);
      toBarcode('barcode', err_msg.card_no, 592, 144);
      err_msg.card_no = err_msg.card_no.replace(/(\w{4})(?=\w)/g, '$1 ')
      that.setData({
        msg: err_msg
      }, () => { wx.hideLoading();})
    })
  },
  onHide: function () {

  },
  onUnload: function () {

  }
})