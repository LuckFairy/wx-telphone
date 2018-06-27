import config from '../config.js';
import { Api } from './api_1';
function formatTime(date) {
  var date = new Date(date * 1000);//如果date为10位不需要乘1000
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
/**检验是否绑定手机 */
function checkBingPhone(uid, store_id) {
  return new Promise((resolve, reject) => {
    var params = {
      "store_id": store_id,
      "uid": uid ? uid : wx.getStorageSync('userUid')
    };
    Api.postApi(config.checkBingUrl, { params }, (error, rep) => {
      var { err_code = '', err_msg } = rep;
      if (err_code == 0 && err_msg.is_phone == 1) {
        wx.setStorageSync('phone', err_msg.phone);
        wx.setStorageSync("hasPhone", "true");
        getApp().globalData.hasPhone = true;
        resolve(true);
      } else {
        reject('用户没有绑定手机');
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
        if (!res.authSetting['scope.address	']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.chooseAddress({
                success: function (res) {
                  resolve(res);
                  // console.log(res.userName)
                  // console.log(res.postalCode)
                  // console.log(res.provinceName)
                  // console.log(res.cityName)
                  // console.log(res.countyName)
                  // console.log(res.detailInfo)
                  // console.log(res.nationalCode)
                  // console.log(res.telNumber)
                },
                fail: function (err) {
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


module.exports = { formatTime, formatDuration, getUrlQueryParam, formatMoney, checkMobile, checkBingPhone, getAddress}
