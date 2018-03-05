
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
    if(logLat){return;}
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
        userInfo: userInfo,
        store_id: that.store_id,
        userInfoData: userInfoData,
        encryptedData: encryptedData,
        iv: iv
      }

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