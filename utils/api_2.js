var config = require('../config.js');
var post = require('./api_3');

var Api = {
  /*用户登陆授权*/
  signin: function (callback, tryTimes = 3, user_info) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if(uid){console.log('已经登录成功了');return;}
    console.info('login.......', uid);
    // 1、调用微信登录
    wx.login({
      success: (resp) => {
        console.log('wx.login()成功！');
        // 进入第2步
        _getUserInfo(resp.code).then((rep)=>{
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
        url: "https://saas.qutego.com/wxapp.php?c=wechatapp&a=login_new",
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
          getApp().hasSignin = true;
          //进入第5步：验证是否有手机号
          checkBingPhone(data.err_msg.uid).then(flag => {
            console.log('有手机号');
          }, err => {
            console.error(err);
          })  
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
    function checkBingPhone(uid){
      return new Promise((resolve, reject) => {
        var params = {
          "store_id": config.sid,
          "uid": uid ? uid : wx.getStorageSync('userUid')
        };
        post.Api.postApi(config.checkBingUrl, { params }, (error, rep) => {
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
    /*尝试再次登录*/
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

};
var sign = Api;
module.exports = { Api, sign };