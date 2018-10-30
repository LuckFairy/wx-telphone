// page/distribution/invite.js
let app = getApp();
const _detailUrl = "wxapp.php?c=fx_user&a=get_fx_detail";//分享详情

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: app.store_id,
    detail: null,
    curActIndex:0,
    list0:[],
    list1:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync("userUid");

    this.setData({
      uid
    });
  },

  
  load(uid) {
    let that = this;
    let params = {
      uid: this.data.uid,
      store_id: this.data.sid
    }
    app.api.postApi(_detailUrl, { params }, (err, rep) => {
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
      this.setData({ detail: rep.err_msg });
      wx.setStorageSync('fxid', rep.err_msg.id);//分销用户ID
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
    this.load();
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

  onItemclick(){
    wx.navigateTo({
      url: './spreadOrder'
    });
  }



})