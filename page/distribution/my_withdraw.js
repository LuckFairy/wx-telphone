// page/distribution/my_withdraw.js
let app = getApp();
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

    var params = {
      "fx_id": 83046,
      "type": 'my',
      "store_id": this.data.storeId
    };
    app.api.postApi(_get_user, { params }, (err, resp) => {
      wx.hideLoading();
      if (resp) {
        if (resp.err_code == 0) {

        } else {

        }

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

  },

  onWithDrawClick(){
    wx.navigateTo({
      url: './my_withdraw_detail'
    });
  },
  onDetailClick(){
    wx.navigateTo({
      url: './my_record?type=0'
    });
  },
  onRecordClick(){
    wx.navigateTo({
      url: './my_record?type=1'
    });
  }

})