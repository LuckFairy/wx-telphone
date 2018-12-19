
import { toBarcode, toQrcode } from '../../../utils/util.js';
let app = getApp();
const _getUrl = 'wxapp.php?c=coupon&a=coupon_detail_v2';//优惠券详情接口
let that;
Page({
  data: {
    store_id: '',
    uid: '',
    barcode: '',
    code:'',
    msg:{},
    id:'',//优惠券id
  },
  onLoad: function (options) {
    that = this; let { id } = options;
    let { store_id, uid } = that.data;
    uid = wx.getStorageSync('userUid') ||142734;
    store_id = app.store_id;
    that.setData({ uid, store_id });
   if(id){that.setData({id},()=>{
     that.loadCode();
   })}


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
    let {id}=that.data;
    if(!id|| id==''){return;}
    let params = {
     id
    }
    app.api.postApi(_getUrl, { params }, (err, rep) => {
      wx.hideLoading();
      if(err||rep.err_code!=0){console.error(err||rep.err_msg);return;}
      let { err_code,err_msg}=rep;
      toQrcode('qrcode', JSON.stringify(err_msg.qrcode), 210, 210);
      // toBarcode('barcode', err_msg.card_no, 280, 60);
      that.setData({
        msg:err_msg
      })
    })
  },
  onHide: function () {

  },
  onUnload: function () {

  }
})