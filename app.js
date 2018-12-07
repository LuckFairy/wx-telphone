
import  ajax  from './utils/api_1';
import WxService from './utils/WxService'
import { getLocation } from './utils/util'
let config = require('./config.js');
global.regeneratorRuntime = require('./lib/regenerator/runtime-module')
const { regeneratorRuntime } = global
App({
  onLaunch: function (opts) {
    getLocation();
    this.getTelWx();
  },
  onShow: function (opts) {
    // console.log('App Show', opts)
  },
  onHide: function () {
    console.log('App Hide')
  },
  onError(msg) {
    console.error("[APP ERROR]", msg)
  },
  api: ajax,
  store_id: config.sid,
  WxService: new WxService,
  config:config,
  globalData: {
    userInfo: null,//用户信息
    uid: null,//用户id
    sid: config.sid,//商店id
    openid: null,//用户openid
    phone: null,//用户手机
    logLat: null,//当前位置
    formIds: [],//消息推送id
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
  /**获取用户信息 */
  async getuserinfo(e) {
    // console.log('info弹窗。。。getUserInfo....', e.detail);
    try{
      let that = this;
      /**获取jscode */
      let jscode = await that.WxService.login();
      console.log('jscode...',jscode);
      let { userInfo, rawData, signature, encryptedData, iv } = e.detail;
      let params = {
        jscode:jscode.code,
        userInfo,
        store_id: config.sid,
        userInfoData: rawData,
        encryptedData,
        iv
      }
      console.log('doSign....params..', params);
      let data =await that.doSign(params);
      return data;
    }catch(err){
      console.error("+++1+++ error:", err)
    }
  },
  doSign(params){
    let that = this;
    return new Promise((resolve,reject)=>{
      that.api.postApi(that.config.loginUrl, {
        params
      }, (err, resp) => {
        if (err || resp.err_code != 0) {
          reject (err || resp.err_msg);
        } else {
          resolve(resp.err_msg);
        }
      })
    })
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
    *formId  获取form的ids数组
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
        reject('要使用手机调试才有formId！');
        return;
      };

      if (formId == '') { reject('formId不能为空'); return; }
      let re = new RegExp(/\d{13}$/g);
      if (!re.test(formId)) { reject('formId不符合要求'); return; }
      let ids = [];
      ids.push({
        timeStamp,
        token: formId,
      })
      console.info('form提交.....ids ', ids);
      resolve(ids);
    })
  },
  /**
   * 将form的formid保存到数据库
   */
  saveId: function (formIds) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
      return;
    } else {
      that.globalData.uid = uid;
    }
    if (!formIds || formIds.length == 0) {
      wx.showToast({
        title: '推送消息失败，无formIds',
      });
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
      "uid": uid,
      "sid": that.globalData.sid,
      "tokens": arr2
    }
    console.log('submit params', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=formid_save', {
      params
    }, (err, rep) => {
      console.log('submit ', rep);
      if (err && rep.err_code != 0) {
        console.error(err || rep.err_msg)
      };
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
  },
  //生成二维码图片
  creatImg(id, that) {
    let params = { "uid": that.data.uid, "store_id": that.data.sid, "type": 2 };
    console.log(id);
    //商品id 如果type=1，这个值必须传。type=2，不需要
    if (id) {
      params = { "uid": that.data.uid, "store_id": that.data.store_id, "type": 1, "product_id": id };
    }
    return new Promise((resolve, reject) => {
      this.api.postApi(config.posterUrl, { params }, (err, res) => {
        if (res.err_code == 0) {
          resolve(res.err_msg.url);
        } else {
          console.error(err || res.err_msg);
          reject(err || res.err_msg);
        }
      })
    })
  },
})
