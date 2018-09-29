import sign from './utils/api_4'
import __config from './config'
import { ajax } from './utils/api_1'
import { getLocation } from './utils/util'
import WxService from './utils/WxService'
App({
  onLaunch: function() {
    // var logs = wx.getStorageSync('logs') || []
    // unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs);
    getLocation();
    this.getTelWx();
  },
  api: ajax,
  store_id: __config.sid,
  WxService: new WxService,
  config: __config,
  globalData: {
    code: null,
    userInfo: null,
    sessionKey: null,
    phone: null,
    openid: null,
    uid: null, //用户id
    sid: __config.sid, //商店id
    logLat: null, //当前位置
    formIds: [], //消息推送id
  },
  getTelWx:function(){
      let that = this;
      let params={store_id:that.store_id};
    that.api.postApi(that.config.getTelWxUrl,{params},(err,res)=>{
      if(res.err_code==0){
        //客服电话
        that.config.serverPhone = res.err_msg.TelnWx.service_tel;

        //客服电话txt
        that.config.phoneTxt = res.err_msg.TelnWx.service_tel.replace(/(.{3})/g, "$1-");
        // that.config.phoneTxt = res.err_msg.TelnWx.service_tel;

        //客服微信
        that.config.serverTxt = res.err_msg.TelnWx.service_weixin;
      }
    })
  },
  checkphone:function(){
    let that = this;
    let uid = wx.getStorageSync('userUid');
    if (uid) {
      console.log('已经有uid了,不弹窗');
      return new Promise(resolve => {
        var opts = { is_phone: 1, uid: uid, openid: wx.getStorageSync('openid'), phone: wx.getStorageSync('phone') }
        resolve(opts);
      });
    }
    //1、登录
    return new Promise((resolve, reject) => {
      that.WxService.login()
      .then(data => {
          console.log('jscode', data);
          that.globalData.code = data.code;
          var params = {
            "jscode": data.code,
            "store_id": __config.sid
          };
          // 2、获取sessionkey
          return that.getSessionkey(params);
        }).then(data => {
          console.log('获取sessionkey',data);
          that.globalData.sessionKey = data.session_key;
          that.globalData.openid = data.openid;
          wx.setStorageSync('sessionKey', data.session_key);
          wx.setStorageSync('openid', data.openid);
          var params = {
            "store_id": __config.sid,
            "openid": data.openid
          }
          // 3、是否绑定手机
          return that.checkPhone(params)
        }).then(data=>{
          resolve(data);
        }).catch(data=>{
          reject(data)
        })
    })
  },
  login: function (__opts) {
    console.log('弹窗登陆。。。');
    let that = this;
    let iv = __opts.iv, encryptedData = __opts.encryptedData, key = that.globalData.sessionKey;
    var params = { "session_key": key, iv, encryptedData, "store_id": __config.sid };
    return that.getPhone(params)
      .then(data => {
        that.globalData.phone = data.phone;
        wx.setStorageSync('phone', data.phone);
        var params = {
          "store_id": __config.sid,
          "openid": that.globalData.openid,
          "phone": data.phone
        }
        return that.loginNew(params);
      }).then(data => {
        console.log('uid',data.uid);
        that.globalData.uid = data.uid;
        wx.setStorageSync('userUid', data.uid); //存储uid
        //绑定门店
        if (__opts.locationid) {
          var opts = {
            store_id: __config.sid,
            item_store_id: __opts.locationid,
            uid: data.uid
          }
          that.bingUserScreen(opts);
        }
      })
  },
  /**
  *1、 获取sessionkey
  */
  getSessionkey: function (params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('getSessionkey--params', params);
      that.api.postApi(__config.sessionUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
        }
      })
    })
  },
  /**
   *2、 判断用户是否已经绑定了手机号码
   */
  checkPhone(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('checkPhone--params', params);
      that.api.postApi(__config.checkBingUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0 || rep.err_msg.is_phone == 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_msg.is_phone == 1) {
          resolve(rep.err_msg);
        }
      })
    })
  },
  /**
 *3、 如果没有绑定手机，调用小程序的授权获取手机号码
 */
  getPhone(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('checkPhone--params', params);
      that.api.postApi(__config.getPhoneUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
        }
      })
    })
  },
  /**
   * 4、获取到手机号码之后，开始第四个接口，创建用户，返回uid
   */
  loginNew(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('loginNew--params', params);
      that.api.postApi(__config.loginNewUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg)
          reject(rep.err_msg);
        }
        if (rep.err_code == 0) {
          resolve(rep.err_msg);
        }
      })
    })
  },
  /**
   * 5、绑定用户归属门店
   */
  bingUserScreen(params) {
    var that = this;
    return new Promise((resolve, reject) => {
      console.log('bingUserScreen--params', params);
      that.api.postApi(__config.bingScreenUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(rep.err_msg.err_log)
        }
        if (rep.err_code == 0) {
          console.log(rep.err_msg.result);
        }
      })
    })
  },
  /**
   * 拨打电话
   */
  calling: function(phone = __config.serverPhone) {
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function() {
        console.log("拨打电话成功！")
      },
      fail: function() {
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
        reject('要使用手机调试才有formId！');
        return;
      };

      if (formId == '') { reject('formId不能为空'); return; }
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
   * 提交订单
   */
  saveId: function(formIds) {
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
    if (formIds.length == 0) {
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
  send: function(order_no) {
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
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      order_no
    };
    console.info('send.......', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=send', {
      params
    }, (err, rep) => {
      if (err || rep.err_code != 0) {
        console.error(err || rep.err_msg);
        return;
      }
    })
  },
  //弹窗提示参团信息
  loadJumpPin() {
    var that = this;
    var params = {
      "num": 4,
      "store_id": that.store_id
    };
    return new Promise(resolve => {
      that.api.postApi(__config.jumpintuanUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(err || rep.err_msg);
          return;
        } else {
          resolve(rep.err_msg);
        }
      })

    })
  }
})