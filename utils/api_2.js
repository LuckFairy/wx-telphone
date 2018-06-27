<<<<<<< HEAD
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
=======

// let SERVER_URL ="https://saas.qutego.com/";
let SERVER_URL = "https://api.ljxhlaw.com/";

var  Api = {
  /*用户登陆授权*/
  tryTimes:3,
  setTimes:5000,
  store_id: 589, //2018年1月5日17:50:51 店铺id by leo 63 中亿店铺 6 婴众趣购 604趣购零销售
  getLocation: function (callback){
    let that = this;
    let logLat = wx.getStorageSync('logLat');
    console.log('logLat....', logLat);
    if(logLat){
      typeof callback == "function" && callback();
      return;
    }
    //获取当前位置
    let promise = new Promise(function (resolve, reject) {
      wx.getLocation({
        success: (res) => {
          console.log('获取位置数据。。。。',res);
          var latitude = res.latitude //维度
          var longitude = res.longitude //经度
          var speed = res.speed //速度，浮点数，单位m/s
          var accuracy = res.accuracy  //位置的精确度
          var logLat = [longitude, latitude];
          wx.setStorageSync('logLat', logLat);
          console.log('当前位置...logLat', logLat);
          resolve(callback);
        },
        fail: () => {
          wx.setStorageSync('refuse', true);
          reject( callback);
        },
        cancel: () => {
          wx.setStorageSync('refuse', true);
          reject( callback)
        },
        
      })
    });
    promise.then(callback => {
      console.log('执行回调函数');
      typeof callback == "function" && callback();
      wx.hideLoading();
    },callback =>{
      wx.hideLoading();
      typeof callback == "function" && callback();
      console.log('位置获取失败,加载总店信息！');
    })
    
  },
  signin: function (callback) {
    var that = this;
    _login();
   
    /**1、调用微信登录接口 */
    function _login(){
      wx.login({
        success: (resp) => {
          console.log('wx.login()成功！', resp);
          // 进入第2步
          _getUserInfo(resp.code);

        },
        fail: (resp) => {
          console.log('wx.login()失败！', resp);
          that.tryTimes--;
          _tryAgain(_login);
        }
      });
    }
    /* 2、调用 wx.getUserInfo() 获取微信用户信息}*/
    function _getUserInfo(jscode) {
      wx.getUserInfo({
        success: (resp) => {
          console.log('wx.getUserInfo()获取用户信息成功!', resp);
          let { userInfo, rawData, signature, encryptedData, iv } = resp;
          // 进入第3步
          _doSignin(jscode, rawData, encryptedData, iv, userInfo);
        },
        fail: (resp) => {
          let autTip = '您已拒绝小程序程序授权，请删除小程序后重新进入，并在提示授权时，点击“允许”按钮。';
          let canUseSetting = false;
          if (wx.openSetting) {
            canUseSetting = true;
            autTip = '您已拒绝小程序程序授权，请设置为允许授权后重新进入.';
          }
          wx.showModal({
            title: '提示',
            content: autTip,
            showCancel: false,
            success: (res) => {
              if (res.confirm && canUseSetting) {
                wx.openSetting({
                  success: (res) => {
                    // that.signin(callback);
                    that.tryTimes--;
                    _tryAgain(()=>{
                      _getUserInfo(jscode);
                    });
                    
                  }
                });
              }
            }
          });
        }
      })
    }
    /**
     * 3、调用服务端登录接口
     * @param  {string}  jscode 调用 wx.login() 返回的 code
     * @param  {string}  userInfoData 用户信息数据，是调用wx.getUserInfo()返回的rawData
     * @param  {string}  encryptedData 用户信息的加密数据，是调用wx.getUserInfo()返回的encryptedData
     * @param  {string}  iv 加密算法的初始向量 调用wx.getUserInfo()返回的 iv
     */
    function _doSignin(jscode, userInfoData = '', encryptedData = '', iv = '', userInfo) {
      let params = {
        jscode: jscode,
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
        userInfo: userInfo,
        store_id: that.store_id,
        userInfoData: userInfoData,
        encryptedData: encryptedData,
        iv: iv
      }
<<<<<<< HEAD
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
=======

      wx.request({
        url: SERVER_URL + "wxapp.php?c=wechatapp&a=login_new",
        data: {
          params
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        success(resp) {
          let { data = {err_code, err_msg}  } = resp;
          if (resp.statusCode == 200 && resp.data.err_code==0) {
            console.log('_doSignin()调用成功');
            // 进入第4步
            _onSignin(resp.data.err_msg);
          } else {
            console.error('调用服务端登录接口出错！', resp.data.err_msg);
            that.tryTimes--;
            _tryAgain(() => {
              _doSignin(jscode, userInfoData , encryptedData , iv , userInfo);
            });
            
          };
          return;
        },
        fail(err) {
          console.error('调用服务端登录接口出错！', err);
          that.tryTimes--;
          _tryAgain(() => {
            _doSignin(jscode, userInfoData, encryptedData, iv, userInfo);
          });
          return;
        }
      })
    }
    /* 4、登录成功，保存tokenId, secretKey*/
    function _onSignin(data) {
      wx.setStorageSync('hasSignin', true);//登录成功
      wx.setStorageSync('userOpenid', data.openid);//存储openid
      wx.setStorageSync('userUid', data.uid);//存储uid
     

      console.log('用户uid', data.uid);
      typeof callback == 'function' && callback();
      return;
    }
    /*尝试再次登录*/
    function _tryAgain(fun) {
          if(that.tryTimes>0){
            typeof fun == 'function' && fun();
          }
    }
   
  },
};
var sign = Api;
module.exports = { Api, sign};
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
