const util = require('util.js');
const VERSION = '1.0.0';
const APP_ID = 13;
const systemInfo = wx.getSystemInfoSync();
const AGENT_ID = 2;   // 上线时需要根据实际数据修改
//配置数据
const configData = {
  APP_VERSION:'1.0.0', 
  APP_ID: 13,
  //APP_ID: 'wx57d5cde97d7e1fd3', 
  BRAND_CODE: "abx890",
  //QR_CODE_PREFIX: 'http://api.qutego.com/?code=wxapp&data=',   // 二维码前缀
  QR_CODE_PREFIX: 'http://api.ljxhlaw.com/?code=wxapp&data=',   // 二维码前缀
};

var SERVER_URL = 'https://api.ljxhlaw.com/index.php/wxapp/';
var Network = {
  fetchApi (url, header, callback) {
    url = SERVER_URL + url;
    console.log('fetchApi:' + url)
    wx.request({
      url,
      data: {},
      header: header,
      success (res) {
        typeof callback === 'function' && callback(null, res.data)
        console.log(res.data)
      },
      fail (e) {
        typeof callback === 'function' && callback(e)
      }
    })
  },
  postApi (url, params, header, callback) {
    url = SERVER_URL + url;
    wx.request({
      url,
      data: params,
      method: 'POST',
      header: header,
      success (res) {
        typeof callback === 'function' && callback(null, res.data)
        console.log(res.data)
      },
      fail (e) {
        typeof callback === 'function' && callback(e)
      }
    })
  },
};
var Api = {
  // GET 方式请求，要自己拼装URL参数
  fetchApi (url, callback) {
    let timestamp = parseInt(new Date().getTime() / 1000) + '';
    let pos = url.indexOf('?') + 1;
    let urlparams = pos === 0 ? '' : url.substring(pos);
    let sign = util.signUrl(urlparams, timestamp);
    let header = {'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };
    Network.fetchApi(url, header, callback);
  },
  // POST 方式请求
  postApi (url, params, callback) {
    let formdata = '';
    for (var key in params) {
      formdata += '&' + key + '=' + params[key];
    }
    let timestamp = parseInt(new Date().getTime() / 1000) + "";
    let sign = util.signUrl(formdata, timestamp);
    let header = { 'Content-Type': 'application/x-www-form-urlencoded','X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };
    Network.postApi(url, params, header, callback);
  },
  /*用户登陆授权*/
  signin: function(callback, tryTimes = 3) {
    var that = this;
    // 1、调用微信登录
    wx.login({
      success: (resp) => {
        console.log('wx.login()成功！', resp);
        // 进入第2步
        _getUserInfo(resp.code);
      },
      fail: (resp) => {
        console.log('wx.login()失败！', resp);
        _tryAgain(resp);
      }
    });
    /* 2、调用 wx.getUserInfo() 获取微信用户信息}*/
    function _getUserInfo(jscode) {
      wx.getUserInfo({
        success: (resp) => {
          console.log('wx.getUserInfo()获取用户信息成功!');
          console.log(resp);
          let {userInfo, rawData, signature, encryptedData, iv} = resp;
          // wx.setStorageSync('userInfo', userInfo);
          // getApp().userInfo = userInfo;
          // 进入第3步
          _doSignin(jscode, rawData, encryptedData, iv);
          },
        fail: (resp) => {
              let autTip = '您已拒绝小程序程序授权，请删除小程序后重新进入，并在提示授权时，点击“允许”按钮。';
              let canUseSetting = false;
              if (wx.openSetting){
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
     */
    function _doSignin(jscode, userInfoData = '', encryptedData = '', iv = '') {
      let {language, model, platform, version, system, windowWidth, windowHeight, pixelRatio} = systemInfo;
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
      console.log('服务端配置信息！', params); 
      let header = {'Content-Type': 'application/x-www-form-urlencoded', 'X-Agent-Id': AGENT_ID};
      Network.postApi('user/signin', params, header, (err, resp) => {
        if (err) {
          console.error('调用服务端登录接口出错！', err);
          _tryAgain(err);
          return;
        }
        let {rtnCode, rtnMessage, data} = resp;
        if (rtnCode != 0) {
          console.error('登录失败！', resp);
          _tryAgain({ rtnCode, rtnMessage });
          return;
        }
        // 进入第4步
        console.log('调用服务端登录接口成功！', resp);
        wx.setStorageSync('userOpenid', data.openid);//存储openid  
        _onSignin(data);
        typeof callback == 'function' && callback();
      });
    }
    /* 4、登录成功，保存tokenId, secretKey*/
    function _onSignin(data) {
      let {tokenId, tokenExpires, serverUrl, secretKey, uidTemp, bcCode} = data;
      if (serverUrl) {
        SERVER_URL = serverUrl;
        wx.setStorageSync('serverUrl', serverUrl);
      }
      getApp().hasSignin = true;
    }
    /*尝试再次登录*/
    function _tryAgain(err) {
      tryTimes--;
      if (tryTimes < 1) {
        console.error('登录失败...');
        console.error('err = %o', err);
        typeof callback == 'function' && callback(err, null);
        return ;
      }
      console.log('正在尝试第 %d 次登录...', (4 - tryTimes));
      that.signin(callback, tryTimes);
    }
  },
};
module.exports = {Api, Network};