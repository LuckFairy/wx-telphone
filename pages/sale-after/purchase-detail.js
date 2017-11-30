// pages/sale-after/purchase-detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options,"传过来的某某id");
    var theId = options.theId;
    app.api.postApi('order/detailOfReturn', { "id": theId}, (err, resp) => {
      if (resp) {
        console.log(resp.data)
        console.log("传过去id后的返回");
        that.setData({
          dataList:resp.data[0]
        })
      }
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
  
  }
})