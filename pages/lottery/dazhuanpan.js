// pages/lottery/dazhuanpan.js
import { Api } from '../../utils/api_2';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store_id: '',
    lottery_url: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({ title: '加载中...', mask: true, });
    var store_id = app.store_id;
    this.setData({store_id})
    var params = {
      store_id
    };
    app.api.postApi('wxapp.php?c=coupon&a=lottery_url', { params }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 1111111)
      var data = resp.err_msg;
      console.log(data);
      this.setData({
        lottery_url: data.lottery_url
      })

    });
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
  
  },
  /**
   * 测试方法
   */
  storeList: function () {
    wx.showLoading({ title: '加载中...', mask: true, });
    var params = {
      store_id: this.data.store_id,
      page: 1,
    };
    app.api.postApi('wxapp.php?c=address&a=physical_list', { params }, (err, resp) => {
      if (err) return;
      if (response.err_code != 0) {
        wx.showLoading({
          title: response.err_msg,
        })
      } else {
        wx.hideLoading();
        console.log(resp, 1111111)
        var data = resp.err_msg;
        console.log(data);

      }
    });
  },
})