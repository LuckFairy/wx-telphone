// api.js

const util = require('util.js');

const VERSION = '1.0.0';
const APP_ID = 13;
//const APP_ID='wx57d5cde97d7e1fd3';
const systemInfo = wx.getSystemInfoSync();
const AGENT_ID = 2;   // 上线时需要根据实际数据修改

//配置数据
const configData = {
  APP_VERSION: '1.0.0',
  APP_ID: 13,
  //APP_ID: 'wx57d5cde97d7e1fd3', 
  BRAND_CODE: "abx890",
  //QR_CODE_PREFIX: 'http://api.qutego.com/?code=wxapp&data=',   // 二维码前缀
  QR_CODE_PREFIX: 'http://api.ljxhlaw.com/?code=wxapp&data=',   // 二维码前缀
};

//var SERVER_URL = 'https://api.qutego.com/index.php/wxapp/';
var SERVER_URL = 'https://api.ljxhlaw.com/index.php/wxapp/';

var TOKEN_ID = wx.getStorageSync('tokenId');
var TOKEN_EXPIRES = wx.getStorageSync('tokenExpires') || 0;
var SECRET_KEY = wx.getStorageSync('secretKey');

var debug_code = "10974";


var Network =
  {
    fetchApi(url, header, callback) {
      // return callback(null, top250)
      url = SERVER_URL + url;

      // 开发debug使用
      if (url.indexOf("?") > 0) url = url + "&XDEBUG_SESSION_START=" + debug_code;
      else url = url + "?XDEBUG_SESSION_START=" + debug_code;

      console.log('fetchApi:' + url)
      wx.request({
        url,
        data: {},
        header: header,
        success(res) {
          typeof callback === 'function' && callback(null, res.data)
          console.log(res.data)
        },
        fail(e) {
          typeof callback === 'function' && callback(e)
        }
      })
    },

    postApi(url, params, header, callback) {
      url = SERVER_URL + url;
      console.log('postApi:' + url);
      console.log('params = %o', params);

      // 开发debug使用
      if (url.indexOf("?") > 0) url = url + "&XDEBUG_SESSION_START=" + debug_code;
      else url = url + "?XDEBUG_SESSION_START=" + debug_code;

      wx.request({
        url,
        data: params,
        method: 'POST',
        // header: {'Content-Type': 'application/x-www-form-urlencoded', 'Token': TOKEN_ID},
        header: header,
        success(res) {
          typeof callback === 'function' && callback(null, res.data)
          console.log(res.data)
        },
        fail(e) {
          typeof callback === 'function' && callback(e)
        }
      })
    },

    // postApi (url, params, callback) {
    //   url = SERVER_URL + url + '&tokenId=' + TOKEN_ID;
    //   console.log('postApi:' + url);
    //   console.log('params:');
    //   console.log(params);
    //   let formdata = '';
    //   for (var key in params) {
    //     formdata += '&' + key + '=' + encodeURIComponent(params[key]);
    //   }
    //   // if (formdata && formdata.length > 0) {
    //   //   formdata = formdata.substring(0, formdata.length - 1);
    //   // }
    //   url += formdata;
    //   wx.request({
    //     url,
    //     // data: params,
    //     // method: 'GET',
    //     // header: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //     success (res) {
    //       callback(null, res.data)
    //       console.log(res.data)
    //     },
    //     fail (e) {
    //       callback(e)
    //     }
    //   })
    // },
  };

var Api =
  {
    // 接口监听器  
    apiListeners: [],

    // 添加接口监听器
    addListener(l) {
      this.apiListeners.push(l);
    },

    // 移除接口监听器
    removeListener(l) {
      let index = this.apiListeners.indexOf(l);
      if (index > -1) {
        this.apiListeners.splice(index, 1);
      }
    },

    // 触接口事件
    _fireApiEvent(event) {
      this.apiListeners.forEach((l) => {
        typeof l.onApiEvent === 'function' && l.onApiEvent(event);
      });
    },

    // 调用URL，不触发接口事件
    // GET 方式请求，要自己拼装URL参数
    fetchApi(url, callback) {
      this._checkToken((err) => {
        if (err) {
          console.error('获取token失败！');
          callback({ rtnCode: -1, rtnMessage: '获取token失败！' });
          return;
        }

        let timestamp = parseInt(new Date().getTime() / 1000) + '';
        let pos = url.indexOf('?') + 1;
        let urlparams = pos === 0 ? '' : url.substring(pos);
        let sign = util.signUrl(urlparams, TOKEN_ID, SECRET_KEY, timestamp);
        let header = { 'X-Token': TOKEN_ID, 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };

        Network.fetchApi(url, header, callback);
      });
    },

    // POST 方式请求
    postApi(url, params, callback) {
      this._checkToken((err) => {
        if (err) {
          console.error('获取token失败！');
          typeof callback === 'function' && callback({ rtnCode: -1, rtnMessage: '获取token失败！' });
          return;
        }

        let formdata = '';
        for (var key in params) {
          formdata += '&' + key + '=' + params[key];
        }

        // formdata = url + formdata;

        let timestamp = parseInt(new Date().getTime() / 1000) + "";
        let sign = util.signUrl(formdata, TOKEN_ID, SECRET_KEY, timestamp);
        let header = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': TOKEN_ID, 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };

        Network.postApi(url, params, header, callback);
      });
    },

    _checkToken(callback) {
      let timestamp = new Date().getTime() / 1000;

      if (!TOKEN_ID || !TOKEN_EXPIRES || TOKEN_EXPIRES < timestamp || !SECRET_KEY) {
        this.signin(callback);
        return;
      }

      // token还有7天失效，需要刷新token
      if (TOKEN_EXPIRES - timestamp < 60 * 60 * 24 * 7) {
        // this._refreshTokenId(callback);
        this.signin(callback);
        return;
      }

      typeof callback === 'function' && callback(null);
    },

    /**
     * 刷新token
     * @param  callback  回调函数
     * @param  tryTimes  尝试次数
     * @return {[type]}
     */
    refreshTokenId(callback) {
      let url = 'user/refreshToken';
      let timestamp = parseInt(new Date().getTime() / 1000) + '';
      let sign = util.signUrl(url, TOKEN_ID, SECRET_KEY, timestamp);
      let header = { 'X-Token': TOKEN_ID, 'X-Sign': sign, 'X-Timestamp': timestamp };

      Network.fetchApi(url, header, (err, data) => {
        if (err) {
          typeof callback === 'function' && callback(err);
          return;
        }

        let { tokenId, tokenExpires } = data;
        if (!tokenId || !tokenExpires) {
          callback({ rtnCode: -1, rtnMessage: '接口没有返回tokenId或tokenExpires' });
          return;
        }

        TOKEN_ID = tokenId;
        TOKEN_EXPIRES = tokenExpires;

        wx.setStorageSync('tokenId', tokenId);
        wx.setStorageSync('tokenExpires', tokenExpires);

        typeof callback === 'function' && callback(null, data);
      });
    },

    /**
     * 获取用户授权
     * @param  {[type]}
     * @return {[type]}
     */
    auth(callback) {
      let app = getApp();
      if (app.userInfo) {
        typeof callback === 'function' && callback(null, app.userInfo);
        return;
      }
      wx.login({
        success: (res) => {
          console.log('wx.login()成功！');
          console.log(res);
          wx.getUserInfo({
            success: (resp) => {
              console.log('wx.getUserInfo()获取用户信息成功!');
              console.log(resp);
              let { userInfo, rawData, signature, encryptedData, iv } = resp;

              // 调用后台接口更新用户资料
              this.postApi('user/update', { userInfoData: rawData });

              app.userInfo = userInfo;
              wx.setStorage({
                key: "userInfo",
                data: userInfo
              });
              typeof callback === 'function' && callback(null, userInfo);
            },
            fail: (resp) => {
              typeof callback === 'function' && callback(resp);
            }
          })
        },
        fail: (res) => {
          typeof callback === 'function' && callback(res);
        },
      })
    },

    /**
     * @param  {int}  tryTimes  尝试登录次数
     * @return {[type]}
     */
    signin: function (callback, tryTimes = 3) {
      var that = this;

      // 1、调用微信登录
      wx.login({
        success: (resp) => {
          console.log('wx.login()成功！');
          console.log(resp);
          // 进入第2步
          _getUserInfo(resp.code);
          //_doSignin(resp.code);
        },
        fail: (resp) => {
          console.log('wx.login()失败！');
          console.log(resp);
          _tryAgain(resp);
        }
      });

      /**
       * 2、调用 wx.getUserInfo() 获取微信用户信息
       * @param  {string}  jscode  调用wx.login()返回的code
       * @return {[type]}
       */
      function _getUserInfo(jscode) {
        wx.getUserInfo({
          success: (resp) => {
            console.log('wx.getUserInfo()获取用户信息成功!');
            console.log(resp);
            let { userInfo, rawData, signature, encryptedData, iv } = resp;
            wx.setStorageSync('userInfo', userInfo);
            getApp().userInfo = userInfo;
            // 进入第3步
            _doSignin(jscode, rawData, encryptedData, iv);
            //return false;
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
                      that.signin(callback);
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
       * @return {[type]}
       */
      function _doSignin(jscode, userInfoData = '', encryptedData = '', iv = '') {
        let { language, model, platform, version, system, windowWidth, windowHeight, pixelRatio } = systemInfo;
        let params = {
          appId: APP_ID,
          curVersion: VERSION,
          languageCode: language,
          model: model,
          systemName: platform,
          systemVersion: version,
          jscode: jscode,
          userInfoData: userInfoData,
          encryptedData: encryptedData,
          iv: iv
        }
        console.log('服务端配置信息！');
        console.log(params);
        //return false;
        let header = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Agent-Id': AGENT_ID };
        Network.postApi('user/signin', params, header, (err, resp) => {
          if (err) {
            console.error('调用服务端登录接口出错！');
            console.error(err);
            _tryAgain(err);
            return;
          }

          let { rtnCode, rtnMessage, data } = resp;
          if (rtnCode != 0) {
            console.error('登录失败！');
            console.error(resp);
            _tryAgain({ rtnCode, rtnMessage });
            //   callback(resp);   // 登录失败，例如用户名密码错误，不需要重试
            return;
          }

          // 服务端接口没有返回tokenId或secretKey
          if (!data || !data.tokenId || !data.secretKey) {
            _tryAgain({ rtnCode: -1, rtnMessage: '服务端接口没有返回tokenId或secretKey' });
            return;
          }

          // 进入第4步
          console.log('调用服务端登录接口成功！');
          console.log(resp);
          wx.setStorageSync('userOpenid', data.openid);//存储openid  
          _onSignin(data);
          wx.setStorageSync('userOpenid', data.openid);//存储openid  
          typeof callback == 'function' && callback();
          that._fireApiEvent({ action: 'signin' })
        });
      }

      /**
       * 4、登录成功，保存tokenId, secretKey
       * @param  {[type]}
       * @param  {[type]}
       * @return {[type]}
       */
      function _onSignin(data) {
        let { tokenId, tokenExpires, serverUrl, secretKey, uidTemp, bcCode } = data;
        TOKEN_ID = tokenId;
        TOKEN_EXPIRES = tokenExpires;
        SECRET_KEY = secretKey;
        wx.setStorageSync('tokenId', tokenId);
        wx.setStorageSync('tokenExpires', tokenExpires);
        wx.setStorageSync('secretKey', secretKey);
        wx.setStorageSync('uidTemp', uidTemp);
        wx.setStorageSync('bcCode', bcCode);
        if (serverUrl) {
          SERVER_URL = serverUrl;
          wx.setStorageSync('serverUrl', serverUrl);
        }
        getApp().hasSignin = true;
      }

      /**
       * 尝试再次登录
       * @return {void}
       */
      function _tryAgain(err) {
        tryTimes--;
        if (tryTimes < 1) {
          console.error('登录失败...');
          console.error('err = %o', err);
          typeof callback == 'function' && callback(err, null);
          return;
        }
        console.log('正在尝试第 %d 次登录...', (4 - tryTimes));
        that.signin(callback, tryTimes);
      }
    },


    //自写的公共样式，查询是否有openid
    selectOpenId() {
      wx.login({
        success: function (res) {
          var CODE = res.code;
          app.api.postApi("user/getWxinfo", { jscode: CODE }, (err, resp) => {
            wx.setStorageSync('userOpenid', resp.data.openid);//存储openid  
            getApp().hasOpenId = true;
          })
        }
      })
    }
  };
module.exports = { Api, Network };