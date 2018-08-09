const tuanlistsUrl = 'wxapp.php?c=tuan_v2&a=hot_tuan_lists';//拼团活动列表
let app = getApp();
let store_id = app.store_id;
let uid = wx.getStorageSync('userUid');
let that

Page({

  data: {
    order_type: null,
    dateText: '',
    address: null,
    product_list: null,
    hotData: [],    // 热门推荐数据
    tuan: null,
    statusText:''
  },

  onTuanDetailClick() {

    wx.navigateTo({
      url: './tuan-detail?&status=' + '0' + '&prodId=' + that.data.product_list.product_id + '&tuanId=' + that.data.tuan.tuan_id + '&type=' + that.data.order_type.type +
      '&itemId=' + that.data.tuan.item_id + '&teamId=' + that.data.tuan.team_id
    })
  },

  onLoad: function (options) {
    that = this;
    if (!uid) {
      uid = wx.getStorageSync('userUid');
    }
    this.loadHotData(); //热门推荐数据
    var params = { "uid": uid, order_no: options.order_no };
    this.setData({
      dateText: options.date_text
    });

    app.api.postApi("wxapp.php?c=tuan_v2&a=order_detail", { "params": params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      console.info('订单数据 ', resp)
      let { err_code, err_msg: { address, product_list, tuan, order_type } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }

      that.setData({ address, product_list, tuan, order_type });


    });

  },

  /**
* 热门推荐数据处理
*
*/
  loadHotData() {
    var that = this;
    var page = 1;

    app.api.postApi(tuanlistsUrl, { "params": { store_id, page } }, (err, rep) => {

      if (err || rep.err_code != 0) return;
      var hotData = rep.err_msg;
      that.setData({
        hotData
      })
    });
  },
  //跳到拼团商品页
  goGroupDetail: function (e) {
    var { prodid, tuanid, quantity } = e.currentTarget.dataset;//商品id,团购id，数量
    if (quantity > 0) {
      var sellout = 1;
    } else {
      var sellout = 0;
    }
    var url = './group-buying?prodId=' + prodid + '&tuanId=' + tuanid + '&sellout=' + sellout;
    wx.navigateTo({ url });
  },

})