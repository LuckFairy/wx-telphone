//app.js
let config = require('./config.js');
import { Api } from './utils/api_3';
import { sign } from './utils/api_2';
App({
  api: Api,
  store_id: config.sid, 
  title:config.title,
  globalData: {
    userInfo: "",
    TOKEN_ID: "",
    image: { mode: "aspectFit", lazyLoad: "true" },
    uid: "",//用户id
    sid: "",//商店id
    openid: "",//用户openid
    formIds: [],//formId数组
    info_flag: true,//是否一键授权用户信息
  },
  onLaunch: function () {
    console.log('App onLaunch');

    //处理兼容高频使用的高版本方法。
    if (!wx.showLoading){
        wx.showLoading = (obj) => { console.log('mock wx.showLoading. do nothing...');}
    }
    if (!wx.hideLoading) {
        wx.hideLoading = () => { console.log('mock wx.hideLoading. do nothing...');}
    }

    // wx.clearStorageSync();
    this.systemInfo = wx.getSystemInfoSync();
    // sign.signin();
  },
  onShow: function () {
    console.log('App onShow() ...');
  },
  login: function (info) {
    sign.signin(null, null, info);
  },
  d: {
    // hostUrl: 'https://wxplus.paoyeba.com/index.php',
    // hostImg: 'http://img.ynjmzb.net',
    // hostVideo: 'http://zhubaotong-file.oss-cn-beijing.aliyuncs.com',
    userId: 1,
    // appId: "",
    // appKey: "",
    // //ceshiUrl:'https://wxplus.paoyeba.com/index.php',
    // ceshiUrl: 'http://leoxcxshop.com/index.php',
  },
  calling: function (phone = config.serverPhone) {
    wx.makePhoneCall({
      phoneNumber: phone, 
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  /**
   **推送消息
   *formId  获取form提交生活的form的id
   */
  pushId(e) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    //用户登录成功,获取uid,sid,openid
    if (uid) {
      that.globalData = Object.assign(that.globalData, {
        uid: wx.getStorageSync('userUid'),
        sid: that.store_id,
        openid: wx.getStorageSync('userOpenid')
      })
    } else { return; }
    console.log('form提交 ', e.detail);
    let formId = e.detail.formId;
    let timeStamp = Date.parse(new Date()) /1000;//时间戳
   console.log(formId);
    if (formId.indexOf('formId')!=-1) {
      wx.showToast({
        title: '请用手机调试',
        icon: 'loading',
        duration: 4000
      });
      return;
    };
    let ids = that.globalData.formIds;
    ids.push({
      timeStamp,
      token: formId,
    })
    that.globalData.formIds = ids;
    console.log('formIds......', formId);
    //提交订单
    that.submit();
  },
  /**
 * 提交订单
 */
  submit: function () {
    var that = this;
    if (that.globalData.formIds.length == 0) {
      wx.showToast({ title: '没有formid值，请点击菜单获取', });
      return;
    };
    var params = {
      "uid": that.globalData.uid,
      "sid": that.globalData.sid,
      "tokens": that.globalData.formIds
    }
    console.log('submit params', params);
    that.api.postApi('wxapp.php?c=product_v2&a=test_save', { params }, (err, rep) => {
      console.log('submit ', rep);
      if (!err && rep.err_code == 0) {
        that.globalData.formIds = [];
        that.send();
      }
    });
  },
  send: function (e) {
    var that = this;
    var params = {
      "uid": that.globalData.uid,
      "sid": that.globalData.sid,
    };
    console.log('send ', params);
    that.api.postApi('wxapp.php?c=product_v2&a=test_send', { params }, (err, rep) => {
      console.log('send....rep',rep);
    })
  },
  
})


