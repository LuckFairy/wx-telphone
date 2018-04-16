var app = getApp();
var Api = {
  /*用户登陆授权*/
  signin: function(callback, tryTimes = 3) {
    var that = this;
    // 1、调用微信登录
    wx.login({
      success: (resp) => {
        //console.log('wx.login()成功！', resp);
        // 进入第2步
        _getUserInfo(resp.code);
      },
      fail: (resp) => {
        //console.log('wx.login()失败！', resp);
        _tryAgain(resp);
      }
    });
    /* 2、调用 wx.getUserInfo() 获取微信用户信息}*/
    function _getUserInfo(jscode) {
      wx.getUserInfo({
        success: (resp) => {
          //console.log('wx.getUserInfo()获取用户信息成功!',resp);

          //console.log(resp.userInfo,"111111111111111")
          let {userInfo, rawData, signature, encryptedData, iv} = resp;
              //let {userInfo} = resp;

          // 进入第3步
              //_doSignin(jscode, userInfo);
              _doSignin(jscode, rawData, encryptedData, iv, userInfo);
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
    //function _doSignin(jscode,userInfo) {
    function _doSignin(jscode, userInfoData = '', encryptedData = '', iv = '', userInfo) {  
      let params = {
        jscode: jscode,
        userInfo: userInfo,
        store_id: app.store_id,
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
          let { rtnCode, rtnMessage, data } = resp;
            // 进入第4步
          _onSignin(data);
          wx.setStorageSync('userOpenid', data.err_msg.openid);//存储openid
          wx.setStorageSync('userUid', data.err_msg.uid);//存储uid
          typeof callback == 'function' && callback();
          // console.log(data.err_msg.openid,"存储openid")
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
      getApp().hasSignin = true;
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
module.exports = {Api};