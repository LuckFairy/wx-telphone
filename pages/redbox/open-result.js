// pages/redbox/open-result.js
var app = getApp();
const log = 'open-result.js --- ';

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = JSON.parse(options.data);
    this.setData({
      hit: data.hit,
      name: data.name,
      resType: data.resType,
      userInfo: wx.getStorageSync('userInfo')
    });
  },
  
  /**
   * 再玩一次
   */
  playAgain() {
    wx.navigateBack();
  },

  /**
   * 前去充值
   */
  goToRecharge() {
    var resType = this.data.resType;
    if(resType !== 'card') {
      wx.navigateTo({
        url: './mydata'
      });
    } else {
      wx.navigateTo({
        url: '/pages/card/mycard'
      })
    }
   
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  }
})