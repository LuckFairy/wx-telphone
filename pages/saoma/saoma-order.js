// pages/saoma/saoma-order.js
const app = getApp();
import { Api } from '../../utils/api_2';
Api.signin();//获取以及存储openid、uid
let that;
// 获取uid
Page({

  /**
   * 页面的初始数据
   */
  data: {
    style:"0",
    isHaveAddress:true,
    products:[{},{}],
    isdefaultAddress:0
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;

  },

  onStyleChange: function (event){
    console.log(event)
    let index = event.currentTarget.id;
    that.setData({ 'style': index });

  },
  
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/group-mes.png', mask: true });
    return false;
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