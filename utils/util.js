import config from '../config.js';
import  ajax from './api_1';

function formatTime(date) {
  var date = new Date(date * 1000); //如果date为10位不需要乘1000
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDuration(duration) {
  let m = Math.floor(duration / 60);
  let s = duration % 60;
  s = s < 10 ? '0' + s : s;
  return m + ':' + s;
}

function getUrlQueryParam(url, paramName) {
  var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
  if (url) {
    let urlSplitArray = url.split("?");
    if (urlSplitArray && urlSplitArray.length > 1) {
      let paramStr = urlSplitArray[1];
      let result = paramStr.match(reg);
      if (result != null) {
        return decodeURIComponent(result[2]);
      }
    }
  }
  return '';
}

function formatMoney(money) {
  return '￥' + money / 100;
}

/**
 * 验证手机号码
 * 
 * 移动号码段:139、138、137、136、135、134、150、151、152、157、158、159、182、183、187、188、147
 * 联通号码段:130、131、132、136、185、186、145
 * 电信号码段:133、153、180、189
 * 
 * @param cellphone
 * @return
 */
function checkMobile(str) {
  return /^1[3|4|5|7|8][0-9]\d{8}$/.test(str);
}

/**
 * 调用微信地址
 */
function getAddress() {
  return new Promise((resolve, reject) => {
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address	']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.chooseAddress({
                success: function(res) {
                  resolve(res);
                },
                fail: function(err) {
                  reject(err || '用户收货地址调取失败')
                }
              })
            }
          })
        }
      }
    })
  })
}

/**
 * 调用微信地址
 */
function getAddress() {
  return new Promise((resolve, reject) => {
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.chooseAddress({
                success: function(res) {
                  resolve(res);
                },
                fail: function(err) {
                  reject(err || '用户收货地址调取失败')
                }
              })
            }
          })
        }
      }
    })
  })
}
/**
 * 调用定位接口
 */
function getLocation() {
  return new Promise((resolve, reject) => {
    let logLat = wx.getStorageSync("logLat");
    if (logLat && logLat != []) {
      resolve(logLat)
    } else {
      wx.getLocation({
        success: function(res) {
          var latitude = res.latitude,
            longitude = res.longitude //维度，经度
          var logLat = [longitude, latitude];
          wx.setStorageSync('logLat', logLat);
          resolve(logLat);
        },
        fail: function(err) {
          reject(err || '用户定位失敗')
        }
      })
    }
  })
}
/**检验是否绑定手机 */
function checkBingPhone(params) {
  return new Promise((resolve, reject) => {
    ajax.postApi(config.checkBingUrl, {
      params
    }, (error, rep) => {
      var {
        err_code = '', err_msg
      } = rep;
      if (err_code == 0 && err_msg.is_phone == 1) {
        wx.setStorageSync('phone', err_msg.phone);
        wx.setStorageSync('hasPhone', true);
        getApp().globalData.hasPhone = true;
        getApp().globalData.phone = err_msg.phone;
        resolve(err_msg.phone);
      } else {
        wx.setStorageSync('hasPhone', false);
        getApp().globalData.hasPhone = false;
        reject('用户没有绑定手机');
      }
    })
  })
}
/**
 * 登陆获取jscoode
 */
function login() {
  return new Promise(resolve => {
    // 1、调用微信登录
    wx.login({
      success: (res) => {
        resolve(res.code);
      },
      fail: (res) => {
        console.log('wx.login()失败！', res);
      }
    });
  })
}
/**
 * 獲取session_key
 */
function getSessionKey(params) {
  return new Promise(resolve => {
    ajax.postApi(config.sessionUrl, {
      params
    }, (error, rep) => {
      if (rep.err_code == 0) {
        wx.setStorageSync('sessionKey', rep.err_msg.session_key);
        resolve(rep.err_msg.session_key)
      } else {
        console.error(rep.err_msg);
      }
    })
  })
}
/**获取手机号 */
function getPhone(params) {
  return new Promise((resolve, reject) => {
    ajax.postApi(config.getPhoneUrl, {
      params
    }, (error, rep) => {
      if (rep.err_code == 0) {
        wx.setStorageSync('phone', rep.err_msg.phone);
        wx.setStorageSync('hasPhone', true);
        getApp().globalData.hasPhone = true;
        getApp().globalData.phone = rep.err_msg.phone;
        resolve(rep.err_msg.phone);
      } else {
        wx.setStorageSync('hasPhone', false);
        getApp().globalData.hasPhone = false;
        reject(rep.err_msg);
      }
    })
  })
}
/**绑定手机号 */
function bingPhone(params) {
  return new Promise(resolve => {
    ajax.postApi(config.bingPhoneUrl, {
      params
    }, (error, rep) => {
      var msg = '';
      if (rep.err_code == 0) {
        msg = '绑定手机号码成功！';
        wx.setStorageSync('hasPhone', true);
        resolve();
      } else {
        msg = rep.err_msg;
      }
      console.error(msg);
    })
  })
}
/**
 * 触发微信获取用户电话接口函数
 */
function getPhoneNumber(e) {
  let that = this;
  let iv = e.detail.iv,
    encryptedData = e.detail.encryptedData;
  return new Promise((resolve, reject) => {
    new Promise(resolve => {
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '同意授权',
          success: function(res) {
            resolve();
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '未授权',
          success: function(res) {
            reject();
          }
        })
      }
    }).then(() => {
      //1、login获取jscode
      return login();
    }).then(data => {
      let params = {
        "jscode": data,
        "store_id": config.sid
      }
      //2.获取ssionKey
      return getSessionKey(params)
    }).then(data => {

      let params2 = {
        "session_key": data,
        "iv": iv,
        "encryptedData": encryptedData,
        "store_id": config.sid
      }
      //3、获取手机号
      return getPhone(params2)
    }).then(data => {
      wx.setStorageSync('phone', data);
      wx.setStorageSync('hasPhone', true);
      getApp().globalData.hasPhone = true;
      getApp().globalData.phone = data;
      resolve(data);
      //4、绑定手机号
      let params3 = {
        store_id: config.sid,
        uid: getApp().globalData.uid||wx.getStorageSync("userUid"),
        phone: data
      }
      bingPhone(params3);
    }).catch(err => {
      reject();
      console.error(err);
    })
  })

}

module.exports = {
  formatTime,
  formatDuration,
  getUrlQueryParam,
  formatMoney,
  checkMobile,
  getAddress,
  getLocation,
  getAddress,
  checkBingPhone,
  getPhoneNumber
}