let app = getApp();
let store_id = app.store_id;
const phoneUrl = 'wxapp.php?c=wechatapp_v2&a=get_phone';//獲取用戶手機號
const bingPhoneUrl = 'wxapp.php?c=wechatapp_v2&a=bind_phone';//绑定手机号
/**
 * 登陆获取jscoode
 */
function login() {
  return new Promise(resolve => {
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        var jscode = wx.getStorageSync('jscode');
        resolve(jscode);
      },
      fail: function () {
        //登录态过期
        wx.login({
          success: function (res) {
            resolve(res.code);
          }
        })

      }
    })
  })
}
/**
 * 獲取session_key
 */
function getSessionKey(code) {
  return new Promise(resolve => {
    var params = { "jscode": code, "store_id": store_id }
    app.api.postApi(sessionUrl, { params }, (error, rep) => {
      if (rep.err_code == 0) { resolve(rep.err_msg.session_key) }
    })
  })
}
/**
 * 触发微信获取用户电话接口函数
 */
function getPhoneNumber(e) {
  let that = this;
  new Promise(resolve => {
    console.log('this',e);
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    let iv = e.detail.iv, encryptedData = e.detail.encryptedData;
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '同意授权',
        success: function (res) {
          resolve({ iv, encryptedData });
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) { }
      })
    }
  }).then(opt => {
    let { iv, encryptedData } = opt;
    getPhone().then(key => {
      var params = { "session_key": key, iv, encryptedData, "store_id": store_id };
      app.api.postApi(phoneUrl, { params }, (error, rep) => {
        let { err_code, err_msg } = rep;
        if (err_code == 0) {
          wx.setStorageSync('phone', err_msg.phone);
          var phone = err_msg.phone;
          bingPhone(phone).then(()=>{
            that.cancelPhone();
          })
        }
      })
    })
  })
}
/**
 * 獲取用戶手機號
 */
function getPhone() {
  return new Promise(resolve => {
    var session_key = wx.getStorageSync('sessionKey');
    resolve(session_key);
  })
}
/**绑定手机号 */
function bingPhone(phone) {
  wx.setStorageSync('phone', phone);
  return new Promise(resolve=>{
    let uid = wx.getStorageSync('userUid');
    console.log('绑定手机获取uid',uid);
    var params = { store_id, uid, phone };
    app.api.postApi(bingPhoneUrl, { params }, (error, rep) => {
      var msg ='';
      if (rep.err_code == 0) {
        msg = '绑定手机号码成功！'; wx.setStorageSync('hasPhone', true);
        resolve();
      } 
      else {  msg = rep.err_msg;}
      wx.showToast({ title: msg, image: '../../../image/use-ruler.png', mask: true });
    })
  })
}

module.exports = { getPhoneNumber };