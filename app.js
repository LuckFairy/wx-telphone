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
    sid: config.sid,//商店id
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
  login: function (info,callback2,locationid) {
    sign.signin(null, null, info,callback2,locationid);
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
    console.info('form提交..... ', e.detail);
    var that = this;
    return new Promise((resolve, reject) => {
      var uid = wx.getStorageSync('userUid');
      if (uid == undefined || uid == '') {
        wx.switchTab({
          url: './pages/index-new/index-new',
        })
        console.error('uid为空');
        reject('uid为空');
      }else{
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
        reject('要使用手机调试才有formId！');return;
      };
      if (formId == '') { reject('formId不能为空'); return;}
      let ids = that.globalData.formIds || [];
      ids.push({
        timeStamp,
        token: formId,
      })
      that.globalData.formIds = ids;
      console.info('form提交.....ids。。。。', ids);
      resolve(ids);
   
    })
  },
  /**
 * 提交订单
 */
  saveId: function (formIds) {
    var that = this;
    if (formIds.length == 0) {
      wx.showToast({ title: '推送消息失败，无formIds', });
      return;
    };
    let arr = [];
    if (formIds.length > 1) {
      for (var i in formIds) {
        var item = formIds[i];
        if (item.timeStamp != undefined && item.token != undefined && item.timeStamp != '' && item.token != '') {
          arr.push(item);
          break;
        }
      };
    }
    let arr2 = arr.length > 0 ? arr : formIds;
    var params = {
      "uid": that.globalData.uid,
      "sid": that.globalData.sid,
      "tokens": arr2
    }
    console.log('saveId params。。。。', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=formid_save', { params }, (err, rep) => {
      console.log('submit ', rep);
      if (err && rep.err_code != 0) { console.error(err || rep.err_msg) };
    });
  },
  send: function (order_no) {
    var that = this;
    var params = {
      "uid": that.globalData.uid,
      "sid": that.globalData.sid,
      order_no
    };
    console.log('send ', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=send', { params }, (err, rep) => {
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
    })
  },
  
})


