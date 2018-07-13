// pages/index-new/myself.js
var app = getApp();
import { Api } from '../../utils/api_2';
import { getPhoneNumber } from '../template/get-tel.js';
let uid = wx.getStorageSync('userUid');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName:'',
    userImg:'',
    uid:'',
    phoneFlag: false,//是否弹手机模板
    templateData: { url: './bingPhone' },//绑定手机跳转路径
  },
  // getPhoneNumber: getPhoneNumber,
  /**验证是否获取手机号 */
  checkPhone() {
    let that = this;
    let flag = wx.getStorageSync('hasPhone');
    that.setData({ phoneFlag: !flag });
  },
  /** 去设置页面*/
  goSetting() {
    wx.navigateTo({
      url: './setting'
    });
  },
  goSearch (){
    wx.navigateTo({
      url: '../shopping/my-order'
    });
  },
  mycard (){
    console.log(22222);
    wx.navigateTo({
      url: '../card/mycard'
    });
  },
  gostore (){
    wx.navigateTo({
      url: '../store/store-list'
    });
  },
  goaddress (){
    wx.navigateTo({
      url: '../shopping/address-list'
    });
  },
  gogroup (e){
    console.log(e,33333);
    var group = e.currentTarget.dataset.group
    wx.navigateTo({
      url: '../shopping/my-order?group=' + group
    });
  },
  goToList(e){
    console.log(e, 44444);
    var list = e.currentTarget.dataset.list
    wx.navigateTo({
      url: '../shopping/my-order?list=' + list
    });
  },
  goStoreServer(){
    wx.navigateTo({
      url: '../index-new/server-wechat'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取uid
    var that = this;
     uid = wx.getStorageSync('userUid');
    if(!uid){
      wx.switchTab({
        url: './index-new',
      })
    }
    that.setData({uid});
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女
        var province = userInfo.province
        var city = userInfo.city
        var country = userInfo.country
        console.log(userInfo, nickName);
        that.setData({
          nickName: nickName,
          userImg: avatarUrl
        })
      }
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
    uid = wx.getStorageSync('userUid');
    if (!uid) {
      wx.switchTab({
        url: './index-new',
      })
    }
    this.checkPhone();
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


})