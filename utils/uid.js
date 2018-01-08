var UID = {
  goUid: function () {
    var that =this;
    return wx.login({
      success: (resp) => {
        var jscode = resp.code
        wx.getUserInfo({
          success: (resp) => {
            var userInfo = resp.userInfo;
            var params = {
              jscode: jscode,
              userInfo: userInfo
            }
            wx.request({
              url: "https://saas.qutego.com/wxapp.php?c=wechatapp&a=login",
              data: {
                params
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              method: 'POST',
              success(resp) {
                var uid = resp.data.err_msg.uid;
                var openid = resp.data.err_msg.openid;
              },
              fail(err) {
                return;
              }
            })
          },
          fail: (resp) => {
            // 拒绝授权
          }
        })
      },
      fail: (resp) => {
      }
    });
  }
}
module.exports = { UID };