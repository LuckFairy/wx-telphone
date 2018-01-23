// pages/saoma/coupon-list.js
const app = getApp();
import { Api } from '../../utils/api_2';
Api.signin();//获取以及存储openid、uid
// 获取uid
const uid = wx.getStorageSync('userUid');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store_id: app.store_Id,
    uid: uid,
    shopCoupon: [], //线上优惠券
    coupon_value: [],//线上优惠券面值数组
    coupon_list: [],//线上优惠券数组
    showList: false,//是否显示优惠券列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    //线上优惠券信息
    app.api.postApi('wxapp.php?c=coupon&a=store_coupon', { "params": { "uid":this.data.uid, "store_id": this.data.store_id, "product_id": this.data.product_id } }, (err, resp) => {
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        var coupon_value = [];
        var len = resp.err_msg.coupon_count > 2 ? 2 : resp.err_msg.coupon_count;
        for (var i = 0; i < len; i++) {
          coupon_value.push(resp.err_msg.coupon_value[i]);
        }
        that.setData({
          shopCoupon: resp.err_msg,
          coupon_list: resp.err_msg.coupon_list,
          coupon_value: coupon_value
        });
      }
    });   

  },
  // 领取优惠券
  getCoupon(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id,
      "id": e.currentTarget.dataset.couponId
    };
    app.api.postApi('wxapp.php?c=coupon&a=get_coupon', { params }, (err, resp) => {
      if (err || resp.err_code != 0) {
        var error = err || resp.err_msg;
        that._showError(error);
        return;
      }
      if (resp.err_code == 0) {
        var coupon_list = that.data.coupon_list;
        coupon_list[index].is_get = 0;
        that.setData({
          coupon_list
        })
        that._showError(resp.err_msg);
      }
    });
  },
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    //this.setData({ error: errorMsg });
    return false;
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