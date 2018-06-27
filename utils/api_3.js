<<<<<<< HEAD
import { ajax } from './api_1';
import config from '../config';

var Api = {
  api: ajax,
  store_id: config.sid,
  /*用户登陆授权*/
  signin: function (callback, tryTimes = 3, user_info,callback2,locationid) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid) { console.log('已经登录成功了'); return; }
    //判断用户是否授权
    wx.getSetting({
      success: (res) => {
        console.log(res);
        var flag = res.authSetting['scope.userInfo'];
        if(flag==false){
          callback2();
          return;
        }


        // 1、调用微信登录
        wx.login({
          success: (resp) => {
            console.log('wx.login()成功！');
            // 进入第2步
            _getUserInfo(resp.code).then((rep) => {
              console.log('_getUserInfo成功！');
              let { userInfo, rawData, signature, encryptedData, iv } = rep;
              // 进入第3步
              _doSignin(resp.code, rawData, encryptedData, iv, userInfo);
            });
          },
          fail: (resp) => {
            console.log('wx.login()失败！', resp);
            _tryAgain(resp);
          }
        });
      
      }
    })
    
 
    /* 2、调用 wx.getUserInfo() 获取微信用户信息}*/
    function _getUserInfo(jscode) {
      return new Promise((resolve, reject) => {
        if (user_info) {
          resolve(user_info);
        } else {
          reject('app.globalData.userinfo为空');
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
    //function _doSignin(jscode,userInfo) {
    function _doSignin(jscode, userInfoData = '', encryptedData = '', iv = '', userInfo) {
      let params = {
        jscode: jscode,
        userInfo: userInfo,
        store_id: config.sid,
        userInfoData: userInfoData,
        encryptedData: encryptedData,
        iv: iv
      }
      //console.log('开始服务端配置信息！', params); 
      // 'X-Agent-Id': AGENT_ID
      wx.request({
        url: config.host + "wxapp.php?c=wechatapp&a=login_new",
        data: {
          params
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        success(resp) {

          console.log("_doSignin成功！")
          let { rtnCode, rtnMessage, data } = resp;
          // // 进入第4步
          // _onSignin(data);
          wx.setStorageSync('userOpenid', data.err_msg.openid);//存储openid
          wx.setStorageSync('userUid', data.err_msg.uid);//存储uid
          wx.setStorageSync('hasSignin', 'true');//存储uid
          getApp().globalData.hasSignin = true;
          getApp().globalData.info_flag=false;
          //进入第5步：验证是否有手机号
          checkBingPhone(data.err_msg.uid).then(flag => {
            console.log('有手机号');
          }, err => {
            console.error(err);
          })
          //6、绑定门店屏
          if(locationid){checkUserFirstVisitNew(data.err_msg.uid);}
          typeof callback == 'function' && callback();

          return data.err_msg.openid;
        },
        fail(err) {
          console.error('调用服务端登录接口出错！', err);
          _tryAgain(err);
          return;
        }
      })
    }
    /* 4、登录成功，保存tokenId, secretKey*/
    function _onSignin(data) {
      console.log("_onSignin成功！")
    }
    /**5、是否存在手机号 */
    function checkBingPhone(uid) {
      return new Promise((resolve, reject) => {
        var params = {
          "store_id": config.sid,
          "uid": uid ? uid : wx.getStorageSync('userUid')
        };
        that.api.postApi(config.checkBingUrl, { params }, (error, rep) => {
          var { err_code = '', err_msg } = rep;
          if (err_code == 0 && err_msg.is_phone == 1) {
            wx.setStorageSync('phone', err_msg.phone);
            wx.setStorageSync("hasPhone", "true");
            resolve(true);
          } else {
            reject('用户没有绑定手机');
          }
        })
      })
    }
    /**6、 绑定用户归属门店**/
    function checkUserFirstVisitNew(uid) {
      var params = {
        store_id: config.sid,
        item_store_id: locationid,
        uid: uid
      }
      that.api.postApi('screen.php?c=index&a=binding_user', { params }, (err, resp) => {
        console.info('绑定门店屏返回值', resp);
        if (err) return;
        return true;
      });
    }
    /*尝试再次登录*/
    function _tryAgain(err) {
      tryTimes--;
      if (tryTimes < 1) {
        console.error('登录失败...');
        console.error('err = %o', err);
        //typeof callback == 'function' && callback(err, null);
        return;
      }
      console.log('正在尝试第 %d 次登录...', (4 - tryTimes));
      that.signin(callback, tryTimes, user_info, callback2,locationid);
    }
  },

};
var sign = Api;
module.exports = { Api, sign };
=======
const util = require('util.js');
const VERSION = '1.0.0';
const APP_ID = 13;
const systemInfo = wx.getSystemInfoSync();
const IS_DEBUG=false;

const AGENT_ID = 2;   // 上线时需要根据实际数据修改
// let SERVER_URL ="https://saas.qutego.com/";
let SERVER_URL = "https://api.ljxhlaw.com/";
var Network = {
  fetchApi(url, header, callback) {
    url = SERVER_URL + url;
    wx.request({
      url,
      data: {},
      header: header,
      success(res) {
        typeof callback === 'function' && callback(null, res.data)
        if (IS_DEBUG) {
          console.log("GET请求的url：" + url + " 参数：" + JSON.stringify(params) + " 数据返回：" + JSON.stringify(res.data))
        }      
      },
      fail(e) {
        typeof callback === 'function' && callback(e)
      }
    })
  },
  postApi(url, params, header, callback) {
    url = SERVER_URL + url;
    wx.request({
      url,
      data: params,
      method: 'POST',
      header: header,
      success(res) {
        typeof callback === 'function' && callback(null, res.data, res.statusCode)
        if (IS_DEBUG){
          console.log("POST请求的url：" + url + " 参数：" + JSON.stringify(params) + " 数据返回：" + JSON.stringify(res.data))
        }
      },
      fail(e) {
        typeof callback === 'function' && callback(e)
      }
    })
  }
};
var Api = {
  // GET 方式请求，要自己拼装URL参数
  fetchApi(url, callback) {
    let timestamp = parseInt(new Date().getTime() / 1000) + '';
    let pos = url.indexOf('?') + 1;
    let urlparams = pos === 0 ? '' : url.substring(pos);
    let sign = util.signUrl(urlparams, timestamp);
    let header = { 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };
    Network.fetchApi(url, header, callback);
  },
  // POST 方式请求
  postApi(url, params, callback) {
    let formdata = '';
    for (var key in params) {
      formdata += '&' + key + '=' + params[key];
    }
    let timestamp = parseInt(new Date().getTime() / 1000) + "";
    let sign = util.signUrl(formdata, timestamp);
    let header = { 'Content-Type': 'application/json', 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };
    Network.postApi(url, params, header, callback);
  }
  
}

// module.exports.Api = Api;
module.exports = { Api, Network};
>>>>>>> 21901e419ae1221bb76d7fc9fb9ef2e4806801a0
