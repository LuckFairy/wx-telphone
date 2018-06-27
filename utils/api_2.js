import { ajax } from './api_1';
import config from '../config.js';
var Api = {
  /*用户登陆授权*/
  api: ajax,
  store_id: config.sid,
  signin(callback) {
    let that = this;
    that.tryTimes = 3;
    return new Promise((resolve, reject) => {
      // //獲取地理位置
      // getLocation().then(logLat => {
      //   wx.setStorageSync('logLat', logLat);
      // }, (err) => {
      //   console.error(err);
      // })
      _login().then(code => {
        that.code = code;
        _getUserInfo().then((rep) => {
          _doSignin(rep).then(rep => {
            wx.setStorageSync('hasSignin', true);//登录成功
            wx.setStorageSync('userOpenid', rep.openid);//存储openid
            wx.setStorageSync('userUid', rep.uid);//存储uid
            typeof callback == 'function' && callback();
            resolve({ hasSign: true });
            getLocation().then(logLat => {
              wx.setStorageSync('logLat', logLat);
              resolve({ logLat: true });
            }, (err) => {
              console.error(err);
            })
            // checkBingPhone(rep.uid).then(flag => {
            //   wx.setStorageSync("hasPhone", flag);
            //   resolve({ hasPhone: true });
            // }, err => {
            //   console.error(err);
            // })
          }, err => {
            _tryAgain(err, _doSignin(rep));
          });
        }, err => {
          _tryAgain(err, _getUserInfo);
        });
        // getSessionKey().then(key => {
        // wx.setStorageSync('sessionKey', key);
        // }, err => {
        //   _tryAgain(err, getSessionKey);
        // })
      }, err => {
        _tryAgain(err, _login);
      });
    })



    function getLocation() {
      let logLat = wx.getStorageSync('logLat');
      return new Promise((resolve, reject) => {
        if (logLat) { resolve(logLat); } else {
          wx.getLocation({
            success: function (res) {
              var latitude = res.latitude, longitude = res.longitude //维度，经度
              var logLat = [longitude, latitude];
              resolve(logLat);
            },
            fail: () => {
              reject('获取地理位置失败!');
            },
            cancel: () => {
              reject('用户拒绝位置授权！')
            }
          })
        }
      })
    }
    function checkBingPhone(uid) {
      return new Promise((resolve, reject) => {
        var params = {
          "store_id": that.store_id,
          "uid": uid ? uid : wx.getStorageSync('userUid')
        };
        that.api.postApi(config.checkBingUrl, { params }, (error, rep) => {
          var { err_code = '', err_msg } = rep;
          if (err_code == 0 && err_msg.is_phone == 1) {
            wx.setStorageSync('phone', err_msg.phone);
            resolve(true);
          } else {
            reject('用户没有绑定手机');
          }

        })
      })
    }
    function getSessionKey() {
      return new Promise((resolve, reject) => {
        var params = { "jscode": that.code, "store_id": that.store_id }
        that.api.postApi(config.sessionUrl, { params }, (error, rep) => {
          if (rep.err_code == 0) { resolve(rep.err_msg.session_key); } else { reject(error || '获取sessionkey失败！') }
        })
      })
    }
    /**1、调用微信登录接口 */
    function _login() {
      return new Promise((resolve, reject) => {
        //登录态过期
        wx.login({
          success: (resp) => {
            resolve(resp.code);
          },
          fail: (resp) => {
            reject('login登陆失败！');
          }
        });

      })
    }
    /* 2、调用 wx.getUserInfo() 获取微信用户信息*/
    function _getUserInfo() {
      return new Promise((resolve, reject) => {
        wx.getUserInfo({
          success: (resp) => {
            resolve(resp);
          },
          fail: (resp) => {
            let autTip = '您已拒绝小程序程序授权，请删除小程序后重新进入，并在提示授权时，点击“允许”按钮。';
            reject(autTip);
          }
        })
      })
    }
    /**
   * 3、调用服务端登录接口
   * @param  {string}  jscode 调用 wx.login() 返回的 code
   * @param  {string}  userInfoData 用户信息数据，是调用wx.getUserInfo()返回的rawData
   * @param  {string}  encryptedData 用户信息的加密数据，是调用wx.getUserInfo()返回的encryptedData
   * @param  {string}  iv 加密算法的初始向量 调用wx.getUserInfo()返回的 iv
   */
    function _doSignin(opts) {
      let { userInfoData = '', encryptedData = '', iv = '', userInfo = {} } = opts;
      let params = {
        jscode: that.code,
        // sessionKey: wx.getStorageSync('sessionKey'),
        userInfo: userInfo,
        store_id: that.store_id,
        userInfoData: userInfoData,
        encryptedData: encryptedData,
        iv: iv
      }
      return new Promise((resolve, reject) => {
        that.api.postApi(config.openIdOldUrl, { params }, (err, resp, statusCode) => {
          if (statusCode == 200 && resp.err_code == 0) {
            resolve(resp.err_msg);
          } else {
            reject(err || '调用_dosignin失败！');
          };
        })
      })
    }
    /*尝试再次登录*/
    function _tryAgain(err, fun) {
      console.error(err);
      if (that.tryTimes > 0) {
        that.tryTimes = that.tryTimes - 1;
        console.log('_tryAgain....that.tryTimes', that.tryTimes);
        setTimeout(() => {
          typeof fun == 'function' && fun();
        }, 5000)
      }
    }
    function _showError() {

    }
  },
};
var sign = Api;
module.exports = { Api, sign };