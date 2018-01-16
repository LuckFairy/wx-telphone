// pages/test/index.js
import { store_Id } from '../../utils/store_id';
Page({
  app:getApp(),
  sub: function (e) {
    console.log('submit事件');
    console.log(e);
    if(e.detail.formId.indexOf('formId') >= 0) {
      wx.showToast({
        title: '请用手机调试',
        icon: 'success',
        duration: 2000
      });
      return false;
    }

    wx.showToast({
      title: e.detail.target.dataset.text,
      icon: 'success',
      duration: 2000
    });

    let ids = this.app.globalData.formIds;

    if(ids.length < 0) {
      ids = [];
    }

    ids.push({
      token: e.detail.formId,
      uid: wx.getStorageSync('userUid'),
      sid: store_Id.shopid,
      openid: wx.getStorageSync('userOpenid')
    });

    console.log(getApp());
    console.log(e.detail.target.dataset);
  },
  submit:function (e) {
    this.app.api.postApi('wxapp.php?c=product_v2&a=test_save', {
      "params": {
        "uid": wx.getStorageSync('userUid'),
        "sid": store_Id.shopid,
        "tokens": this.app.globalData.formIds
      }
    }, (err, rep) => {
      this.app.globalData.formIds = [];
        wx.showToast({
          title: rep.err_msg,
          icon: 'success',
          duration: 2000
        });
    })
  },

  send:function (e) {
    this.app.api.postApi('wxapp.php?c=product_v2&a=test_send', {
      "params": {
        "uid": wx.getStorageSync('userUid'),
        "sid": store_Id.shopid,
      }
    }, (err, rep) => {
      wx.showToast({
        title: rep.err_msg,
        icon: 'success',
        duration: 2000
      });
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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