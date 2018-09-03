import { sign } from './utils/api_3';
let config = require('./config.js');
App({
  onLaunch: function (opts) {
    let that = this;
    //处理兼容高频使用的高版本方法。
    if (!wx.showLoading) {
      wx.showLoading = (obj) => { console.log('mock wx.showLoading. do nothing...'); }
    }
    if (!wx.hideLoading) {
      wx.hideLoading = () => { console.log('mock wx.hideLoading. do nothing...'); }
    }
    this.getTelWx();
  },
  onShow: function (opts) {
    // console.log('App Show', opts)
  },
  api: sign.api,
  store_id: sign.store_id,
  sign: sign.signin,
  config:config,
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
  getTelWx: function () {
    let that = this;
    let params = { store_id: that.store_id };
    that.api.postApi(that.config.getTelWxUrl, { params }, (err, res) => {
      if (res.err_code == 0) {
        //客服电话
        that.config.serverPhone = res.err_msg.TelnWx.service_tel;

        //客服电话txt
        that.config.phoneTxt = res.err_msg.TelnWx.service_tel.replace(/(.{3})/g, "$1-");
        console.log('电话', that.config.phoneTxt)
        //客服微信
        that.config.serverTxt = res.err_msg.TelnWx.service_weixin;
      }
    })
  },
  
  login: function (info, callback2, locationid) {
    let that = this;
    that.sign(null, 3, info, callback2, locationid);



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
  },

  /**
   * 拨打电话
   */
  calling: function (phone = this.config.serverPhone) {
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
        // wx.showToast({
        //   title: '请用手机调试',
        //   icon: 'loading',
        //   duration: 2000
        // });
      };
  
      if (formId == '') { reject('formId不能为空');return;}
      let ids =[];
      ids.push({
        timeStamp,
        token: formId,
      })
      console.info('form提交.....ids ', ids);
      resolve(ids);
    })
  },
  /**
 * 收集formid
 */
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
    if (!formIds||formIds.length <=0) {
      // wx.showToast({ title: '推送消息失败，无formIds', });
      return;
    };
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      "tokens": formIds
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
      "uid": uid,
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
    var params = { "num": 4 ,"store_id":that.store_id};
    return new Promise(resolve => {
      that.api.postApi(config.jumpintuanUrl, { params }, (err, rep) => {
        if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
        else {
          resolve(rep.err_msg);
        }
      })
    })
  }
})
