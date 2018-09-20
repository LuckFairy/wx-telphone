// page/distribution/invite.js
let app = getApp();
const _urlDetail = "wxapp.php?c=voucher&a=voucher_info";//获取活动详情   有活动id
const _urlDetail_v2 = "wxapp.php?c=voucher&a=store_voucher";//获取活动详情  没有活动id的

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ac_detail:{
      nodes:'<p>哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇问问<img src="https://zy.qutego.com//upload/images/000/000/293/201809/5b91fe17519d5.png"/></p>'
    },
    ac_title:'挣钱计划',
    ac_time:'2018-09-01 00:00:00 至 2018-10-31 00:00:00',
    page: 1,//从上面页面进入，1我的 ，2分享赚钱
    isCheck:1,//是否需要审核，1是 0否
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