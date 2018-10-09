// pages/index-new/bingPhone.js
import { checkMobile } from '../../../utils/util';
let app = getApp();
let hasSignin = wx.getStorageSync('hasSignin');
let store_id = app.store_id;
let uid = wx.getStorageSync('userUid');

const sendUrl = 'wxapp.php?c=wxapp_login&a=sendsms';//发送验证码
const checkUrl = 'wxapp.php?c=wxapp_login&a=checksms';//修改手机号
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    userImg: '',
    uid: '',
    clearShow: false,//是否显示clear图标
    phone: '',//手机号码
    phoneClear: false,//是否显示清楚图标
    code: '',//验证码
    codeFlag: false,//验证码是否正确
    codeClear: false,//是否显示清楚图标
    getCode: true,//可以点击获取验证码
    times: '60',
    submit: false,//是否提交表单
  },
  /**
   * 发送验证码
   */
  sendTel() {
    var that = this;
    var phone = this.data.phone;
    console.log('手机号码', phone);
    var flag = checkMobile(phone);
    if (flag) {
      new Promise(resolve => {
        var params = { "store_id": store_id, "phone": phone };
        app.api.postApi(sendUrl, { params }, (err, rep) => {
          if (rep.err_code != 0) { that._showError('请输入正确的手机号'); } else {
            resolve(true);
          }
        })
      }).then(r => {
        that.getCode();
      });
    } else {
      that._showError('请输入正确的手机号'); return false;
    }

  },
  /**
   * 获取验证码
   */
  getCode() {
    var that = this;
    var times = 60;
    that.setData({ getCode: false });
    clearInterval(codeIntel);
    var codeIntel = setInterval(() => {
      times = Number(times);
      times--;
      that.setData({ times });
      if (times < 1) {
        clearInterval(codeIntel);
        that.setData({ getCode: true })
      }
    }, 1000);
  },
  /**
   * 手机号码输入
   */
  phoneInput: function (e) {
    var that = this;
    var value = e.detail.value;
    that.setData({ phone: value, phoneClear: true });
  },
  /**
   * 验证码输入
   */
  codeInput: function (e) {
    var that = this;
    var getcode = that.data.getcode;
    if (getcode) { that._showError('请获取验证码'); return; }
    var value = e.detail.value;
    that.setData({ code: value, codeClear: true });
  },
  /**
   * 清除value
   */
  clear: function (e) {
    console.log('e', e);
    var that = this;
    var type = e.currentTarget.dataset.type;
    switch (type) {
      case 'code': that.setData({ code: '', codeClear: false }); break;
      case 'phone': that.setData({ phone: '', phoneClear: false }); break;
    }
  },
  /**formSubmit事件
   * 
   */
  formSubmit: function (e) {
    let that = this;
    let code = that.data.code, phone = that.data.phone;
    if (code.length > 0) {
      var params = { "uid": uid, "code": code, "store_id": store_id, "phone": phone };
      app.api.postApi(checkUrl, { params }, (err, rep) => {
        if (rep.err_code != 0) { var msg = rep.err_msg.err_log; that._showError(msg); } else {
          wx.setStorageSync("hasPhone", "true");
          wx.setStorageSync("phone", rep.err_msg.phone);
          // let pages = getCurrentPages();
          // let prevPage = pages[pages.length - 2];  //上一个页面
          // prevPage.showPhone(phone);
          wx.navigateBack();
        }

      })
    } else {
      that._showError('验证码不正确，请重新输入'); return false;
    }
  },
  checkPhone() {
    let that = this;
    clearInterval(phoneTime);
    let phoneTime = setInterval(() => {
      var hasPhone = wx.getStorageSync('hasPhone');
      // var userInfo = wx.getStorageSync('userInfo');
      if (hasPhone) {
        clearInterval(phoneTime);
        that.setData({ hasPhone });
        return;
        // that.setData({
        //   nickName: userInfo.nickName,
        //   userImg: userInfo.avatarUrl
        // })
      }
    }, 5000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    hasSignin = wx.getStorageSync('hasSignin');
    store_id = app.store_id;
    uid = wx.getStorageSync('userUid');
   

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
* 显示错误信息
*/
  _showError(errorMsg) {
    this.setData({ error: errorMsg });
    setTimeout(() => {
      this.setData({ error: '' });
    }, 1500);
    return false;
  },
})