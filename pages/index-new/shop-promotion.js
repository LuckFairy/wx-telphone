// pages/index-new/shop-promotion.js
var app = getApp();
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    activityId:236,
    logo:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 获取店铺id shopId
    var store_id = store_Id.store_Id();
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    var openId = wx.getStorageSync('userOpenid');
    console.log(uid, 'uid');
    console.log(store_id, 'store_id');
    console.log(openId, 'openId');
    var page = that.data.page;
    var activityId = that.data.activityId;
    var params = {
      uid,
      store_id,
      page,
      activityId
    }
    app.api.postApi('wxapp.php?c=coupon&a=coupon_list', { params }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 666666666)
      var activity_err_msg = resp.err_msg.list;
      var logo = resp.err_msg.logo;
      that.setData({
        activity_err_msg,
        logo
      });
    });
  },
  goDetail(e){
    var id = e.currentTarget.dataset.id;
    var source = e.currentTarget.dataset.source;
    wx.navigateTo({
      url: '../card/card_summary?id=' + id + '&source=' + source
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})