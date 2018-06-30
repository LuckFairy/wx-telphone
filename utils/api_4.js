import {
  ajax
} from './api_1'
import WxService from './WxService'
import __config from '../config.js'

export default {
  api: ajax,
  WxService: new WxService,
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
  getLocation:function(){
    this.WxService.getLocation()
      .then(res => {
        var latitude = res.latitude, longitude = res.longitude //维度，经度
        var logLat = [longitude, latitude];
        wx.setStorageSync('logLat', logLat);
      })
  },
  signin: function(__opts) {
    let that = this;
    let uid = wx.getStorageSync('userUid');
    if (uid) {
      console.log('已经登录成功了');
      return;
    }
    //1、登录
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
        console.log(data);
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
       
      }).then(data => {
        that.globalData.uid = data.uid;
        that.globalData.phone = data.phone;
        wx.setStorageSync('userUid', data.uid); //存储uid
        wx.setStorageSync('phone', data.phone); //存储uid
        //绑定门店
        if (__opts.locationid) {
          var opts = {
            store_id: __config.sid,
            item_store_id: __opts.locationid,
            uid: data.uid
          }
          that.bingUserScreen(opts);
        }
      }).catch(data => {
        //手机弹窗
        let iv = __opts.iv, encryptedData = __opts.encryptedData, key = that.globalData.sessionKey;
        var params = { "session_key": key, iv, encryptedData, "store_id": __config.sid };
        that.getPhone(params)
          .then(data => {
            that.globalData.phone = data.phone;
            wx.setStorageSync('phone', data.phone);
            var params = {
              "store_id": __config.sid,
              "openid": wx.getStorageSync('openid'),
              "phone": data.phone
            }
            return that.loginNew(params);
          }).then(data => {
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
      })
  },

  /**
   *1、 获取sessionkey
   */
  getSessionkey: function(params) {
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
}