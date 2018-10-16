// page/distribution/my_withdraw.js

const app = getApp();
const _detailUrl = "wxapp.php?c=fx_user&a=get_fx_detail";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    money:0,
    sid: app.store_id,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      money:options.money
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
    let uid = wx.getStorageSync("userUid");
    console.log(uid)
    this.setData({ uid }, () => {
      this.load();
    })

  },

  load() {
    let params = {
      uid: this.data.uid,
      store_id: this.data.sid
    }
    app.api.postApi(_detailUrl, { params }, (err, rep) => {
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
      this.setData({ money: rep.err_msg.forward_money });
    })
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