<<<<<<< HEAD
import { sign } from './utils/api_3';
let config = require('./config.js');
App({
  api: sign.api,
  store_id: sign.store_id,
  sign: sign.signin,
  globalData: {
    systemInfo: wx.getSystemInfoSync(),//系统信息
    userInfo: "",//用户信息
    TOKEN_ID: "",//token_id
    uid: '',//用户id
    sid: config.sid,//商店id
    openid: '',//用户openid
    phone: '',//用户手机
    logLat: '',//当前位置
    hasSign: false,//是否登录
    formIds: [],//消息推送id
    info_flag: true,//是否一键授权用户信息
  },
  onLaunch: function (opts) {
    // console.log('App Launch', opts)
=======
//app.js
import { Api } from './utils/api_3';
import { sign } from './utils/api_2';

App({
  api: Api,
  store_id: sign.store_id,
  //getlocation: sign.getLocation,
  onLaunch: function () {
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
    let that = this;
    //处理兼容高频使用的高版本方法。
    if (!wx.showLoading) {
      wx.showLoading = (obj) => { console.log('mock wx.showLoading. do nothing...'); }
    }
    if (!wx.hideLoading) {
      wx.hideLoading = () => { console.log('mock wx.hideLoading. do nothing...'); }
    }
<<<<<<< HEAD

  },
  onShow: function (opts) {
    // console.log('App Show', opts)
  },
  login: function (info,callback2,locationid) {
    let that = this;
    that.sign(null, null, info, callback2,locationid);
  
  
    
    // that.sign(null, null,info).then(opt => {
    //   // wx.getUserInfo({
    //   //   success: function (res) {
    //   //     that.globalData.userInfo = res.userInfo;
    //   //   }
    //   // });
    //   if (opt.hasSign) {//用户登录成功
    //     that.globalData = Object.assign(that.globalData, {
    //       uid: wx.getStorageSync('userUid'),
    //       sid: that.store_id,
    //       openid: wx.getStorageSync('userOpenid'),
    //       hasSign: true
    //     })
    //   }
    //   if (opt.hasPhone) {//获取用户手机号码成功
    //     that.globalData = Object.assign(that.globalData, {
    //       uid: wx.getStorageSync('userUid'),
    //       sid: that.store_id,
    //       openid: wx.getStorageSync('userOpenid'),
    //       hasSign: true,
    //       phone: wx.getStorageSync('phone'),
    //     })
    //   }
    //   if (opt.logLat) {//获取用户位置成功
    //     that.globalData = Object.assign(that.globalData, {
    //       uid: wx.getStorageSync('userUid'),
    //       sid: that.store_id,
    //       openid: wx.getStorageSync('userOpenid'),
    //       hasSign: true,
    //       // phone: wx.getStorageSync('phone'),
    //       logLat: wx.getStorageSync('logLat')
    //     })
    //   }
    // })
  },
  onHide: function () {
    console.log('App Hide')
=======
    let hasSignin = wx.getStorageSync('hasSignin');
    if (hasSignin == undefined || hasSignin == null || hasSignin == '') {
      sign.signin(() => {
        sign.getLocation(() => {
          console.log('app.globalData.....赋值');
          that.globalData.logLat = wx.getStorageSync('logLat');
          that.globalData.openid = wx.getStorageSync('userOpenid');
          that.globalData.uid = wx.getStorageSync('userUid');
          that.globalData.hasSignin = wx.getStorageSync('hasSignin');
        })
      })
    }else{
      that.globalData.logLat = wx.getStorageSync('logLat');
      that.globalData.openid = wx.getStorageSync('userOpenid');
      that.globalData.uid = wx.getStorageSync('userUid');
      that.globalData.hasSignin = wx.getStorageSync('hasSignin');
    }
    that.systemInfo = wx.getSystemInfoSync();
  },
  onShow: function () {
    console.log('App onShow() ...');
  },
  globalData: {
    userInfo: "",
    TOKEN_ID: "",
    image: { mode: "aspectFit", lazyLoad: "true" },
    uid: '',//用户id
    sid: '',//商店id
    openid: '',//用户openid
    formIds: [],//formId数组
    logLat: '',//当前位置
    hasSignin: false,//是否登录
  },
  d: {
    hostUrl: 'https://wxplus.paoyeba.com/index.php',
    hostImg: 'http://img.ynjmzb.net',
    hostVideo: 'http://zhubaotong-file.oss-cn-beijing.aliyuncs.com',
    userId: 1,
    appId: "",
    appKey: "",
    //ceshiUrl:'https://wxplus.paoyeba.com/index.php',
    ceshiUrl: 'http://leoxcxshop.com/index.php',
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
  },

  /**
   * 拨打电话
   */
<<<<<<< HEAD
  calling: function (phone = config.serverPhone) {
=======
  calling: function (phone = '4006088520') {
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
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
<<<<<<< HEAD
    console.info('form提交..... ', e.detail);
    var that = this;
    
    return new Promise((resolve, reject) => {
      var uid = wx.getStorageSync('userUid');
      if (uid == undefined || uid == '') {
        wx.switchTab({
          url: './page/tabBar/home/index-new',
        })
        console.error('uid为空');
        reject('uid为空');
      } else {
        that.globalData.uid = uid;
      }
      let { detail: { formId = '' } } = e;
      let timeStamp = Date.parse(new Date()) / 1000;//时间戳
      if (formId.includes('formId')) {
        wx.showToast({
          title: '请用手机调试',
          icon: 'loading',
          duration: 2000
        });
        reject('要使用手机调试才有formId！');
      };
      if (formId == '') { reject('formId不能为空'); }
      let ids = that.globalData.formIds || [];
      ids.push({
        timeStamp,
        token: formId,
      })
      that.globalData.formIds = ids;
      console.info('form提交.....ids ', ids);
      resolve(ids);
    })
=======
    console.log('登录状态', this.globalData.hasSignin);
    var that = this;
    //用户登录成功,获取uid,sid,openid
    if (that.hasSignin) {
      that.globalData = Object.assign(that.globalData, {
        uid: wx.getStorageSync('userUid'),
        sid: that.store_id,
        openid: wx.getStorageSync('userOpenid')
      })
    } else { return; }
    console.log('form提交 ', e.detail);
    let { detail: { formId = [] } } = e;
    let timeStamp = Date.parse(new Date()) / 1000;//时间戳

    if (formId.includes('formId')) {
      wx.showToast({
        title: '请用手机调试',
        icon: 'loading',
        duration: 2000
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
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
  },
  /**
 * 提交订单
 */
<<<<<<< HEAD
  saveId: function (formIds) {
    var that = this; var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
      return;
    } else {
      that.globalData.uid = uid;
    }
    if (formIds.length == 0) {
      wx.showToast({ title: '推送消息失败，无formIds', });
      return;
    };
    let arr=[];
    if(formIds.length>1){
      for(var i in formIds){
        var item = formIds[i];
        if (item.timeStamp != undefined && item.token!=undefined&&item.timeStamp!=''&&item.token!=''){
          arr.push(item);
          break;
        }
      };
    }
    let arr2=arr.length>0?arr:formIds;
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      "tokens": arr2
    }
    console.log('submit params', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=formid_save', { params }, (err, rep) => {
      console.log('submit ', rep);
      if (err && rep.err_code != 0) { console.error(err || rep.err_msg) };
    });
  },
  /**发送消息 */
  send: function (order_no) {
    var that = this; var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
     return;
    } else {
      that.globalData.uid = uid;
    }
    var params = {
      "uid":uid,
      "sid": that.globalData.sid,
      order_no
    };
    console.info('send.......', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=send', { params }, (err, rep) => {
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
    })
  },
  loadJumpPin() {
    var that = this;
    var params = { "num": 4 };
    return new Promise(resolve => {
      that.api.postApi(config.jumpintuanUrl, { params }, (err, rep) => {
        if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
        else {
          resolve(rep.err_msg);
        }
      })
=======
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
      console.log('send....rep', rep);
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
    })
  }
})


