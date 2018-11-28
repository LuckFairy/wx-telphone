// pages/index-new/bingPhone.js
import { checkMobile } from '../../../utils/util';
let app = getApp();
let hasSignin = wx.getStorageSync('hasSignin');
let store_id = app.store_id;
let uid = wx.getStorageSync('userUid');

const sendUrl = 'wxapp.php?c=wxapp_login&a=sendsms';//发送验证码
const checkUrl = 'wxapp.php?c=wxapp_login&a=checksms';//修改手机号
const phoneLoginUrl = "wxapp.php?c=wechatapp_v2&a=phone_login";//根据手机号码和验证码登录小程序（第一版，给腾讯审核人员专用）
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    userImg: '',
    uid: '',
    phone:'',//手机号码
    clearShow:false,//是否显示clear图标
    phoneClear:false,//是否显示清楚图标
    code:'',//验证码
    codeFlag:false,//验证码是否正确
    codeClear:false,//是否显示清楚图标
    password:'',//密码
    passClear:false,//是否显示
    getCode:true,//可以点击获取验证码
    times:'60',
    submit:false,//是否提交表单
  },
  /**
   * 发送验证码
   */
  sendTel(){
    var that = this;
    var phone = this.data.phone;
    var flag = checkMobile(phone);
    if(flag){
      new Promise(resolve => {
        var params = { "store_id": store_id, "phone": phone }; 
        app.api.postApi(sendUrl,{params},(err,rep)=>{
          if (rep.err_code != 0) { that._showError('请输入正确的手机号'); }else{
            resolve(true);
          }
        })
      }).then(r=>{
        that.getCode();
      });
    }else{
      that._showError('请输入正确的手机号'); return false;
    }
    
  },
/**
 * 获取验证码
 */
  getCode(){
    var that = this;
    var times = 60;
    that.setData({getCode:false});
    clearInterval(codeIntel);
    var codeIntel=  setInterval(()=>{
          times = Number(times);
          times--;
          that.setData({times});
          if(times<1){
            clearInterval(codeIntel);
            that.setData({getCode:true})
          }
        },1000);
  },
  /**
   * 手机号码输入
   */
  phoneInput:function(e){
    var that = this;
    var value = e.detail.value;
    that.setData({ phone:value, phoneClear:true});
  },
  /**
   * 密码输入
   */
  passInput:function(e){
    let that = this;
    let value = e.detail.value;
    that.setData({password:value,passClear:true})
  },
  /**
   * 验证码输入
   */
  codeInput:function(e){
    var that = this;
    var getcode = that.data.getcode;
    if (getcode) { that._showError('请获取验证码');return;}
    var value = e.detail.value;
    that.setData({ code:value,codeClear:true});
  },
  /**
   * 清除value
   */
  clear:function(e){
    console.log('e',e);
    var that = this;
    var type = e.currentTarget.dataset.type;
    switch(type){
      case 'code': that.setData({ code: '', codeClear: false });break;
      case 'phone': that.setData({ phone: '', phoneClear: false }); break;
      case 'password': that.setData({ password: '', passClear:false});break;
    }
  },
  /**formSubmit事件
   * 
   */
  formSubmit: function (e) {
    let that = this;
    let code = that.data.password,phone = that.data.phone;
    let flag = checkMobile(phone);
    if(flag){

        if(code.length>0){
          var params =  {"code": code, "store_id": store_id, "phone": phone } ;
          app.api.postApi(phoneLoginUrl, { params }, (err, rep) => {
            if (rep.err_code != 0 || rep.err_msg.is_phone!=1) { var msg = rep.err_msg; that._showError(msg);}else{
              wx.setStorageSync('openid', rep.err_msg.openid);
              wx.setStorageSync('phone', rep.err_msg.phone);
              wx.setStorageSync('userUid', rep.err_msg.uid);
              app.globalData.openid = rep.err_msg.openid;
              app.globalData.phone = rep.err_msg.phone;
              app.globalData.uid = rep.err_msg.uid;
              setTimeout(()=>{
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 2];  //上一个页面
                prevPage.setData({ isInfo: true, hasPhone:true,uid:rep.err_msg.uid},()=>{
                  prevPage._parse();
                })
              wx.navigateBack();
              },2000);
            }
      
          })
        }else{
          that._showError('密码不能为空，请重新输入'); return false;
        }
    }else{
      that._showError('请输入正确的手机号码'); return false;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    store_id = app.store_id;
     uid = wx.getStorageSync('userUid');
    if(uid){
      that.setData({
        nickName: app.globalData.userInfo.nickName,
        userImg: app.globalData.userInfo.avatarUrl
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
* 显示错误信息
*/
  _showError(errorMsg) {
    this.setData({ error: errorMsg });
    setTimeout(()=>{
      this.setData({ error: '' });
    },1500);
    return false;
  },
})