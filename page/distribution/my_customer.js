// page/distribution/invite.js
let app = getApp();
const _get_user = "wxapp.php?c=fx_user_middle&a=get_self_user";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curActIndex:0,
    list0:[],
    list1:[],
    storeId: app.store_id,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var params = {
      "fx_id": 2,
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


  // 点击切换
  swichSwiperItem: function (event) {
    var that = this;
    this.setData({
      curActIndex: event.target.dataset.idx,
    });
  },



})