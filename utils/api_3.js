import { ajax } from './api_1';
import config from '../config.js';

var Api = {
  api: ajax,
  store_id: config.sid,
  /*用户登陆授权*/
  signin: function (callback, tryTimes = 3, user_info, callback2, locationid) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid) { console.log('已经登录成功了'); return; }
    //判断用户是否授权
    wx.getSetting({
      success: (res) => {
        console.log(res);
        var flag = res.authSetting['scope.userInfo'];
        if (flag == false) {
          callback2();
          return;
        }
        _login();

      }
    })

  /**第一步登录 */
  function _login(){
    // 1、调用微信登录
    wx.login({
      success: (resp) => {
        that.jscode = resp.code;
        console.log('wx.login()成功！jscode', resp.code);
        // 进入第2步
        _getUserInfo().then((rep) => {
          console.log('_getUserInfo成功！');
          let { userInfo, rawData, signature, encryptedData, iv } = rep;
          // 进入第3步
          _doSignin( rawData, encryptedData, iv, userInfo);
        });
      },
      fail: (resp) => {
        console.log('wx.login()失败！', resp);
        _tryAgain(resp);
      }
    });
  }
    /* 2、调用 wx.getUserInfo() 获取微信用户信息}*/
    function _getUserInfo() {
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
    function _doSignin( userInfoData = '', encryptedData = '', iv = '', userInfo) {
      console.log('调用的jscode',that.jscode)
      let params = {
        jscode: that.jscode,
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
          let { rtnCode, rtnMessage, data } = resp;
          if (data.err_code != 0) { console.log("_doSignin失败！","加密失败"); _tryAgain(); callback2(); return;}
          console.log("_doSignin成功！")
          wx.setStorageSync('userOpenid', data.err_msg.openid);//存储openid
          wx.setStorageSync('userUid', data.err_msg.uid);//存储uid
          wx.setStorageSync('hasSignin', 'true');//存储uid
          getApp().globalData.hasSignin = true;
          getApp().globalData.info_flag = false;
          //进入第5步：验证是否有手机号
          checkBingPhone(data.err_msg.uid).then(flag => {
            console.log('有手机号');
          }, err => {
            console.error(err);
          })
          //6、绑定门店屏
          if (locationid) { checkUserFirstVisitNew(data.err_msg.uid); }
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
      console.log('正在尝试第 %d 次登录...', (tryTimes));
      if (tryTimes < 1) {
        console.error('登录失败...',err);
        //typeof callback == 'function' && callback(err, null);
        return;
      }
      return setTimeout(function(){
        callback2();
        _login();
      },5000);
    }
  },

};
var sign = Api;
module.exports = { Api, sign };