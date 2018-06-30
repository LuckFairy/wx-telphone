import sign from './utils/api_4'
import __config from './config'
App({
  onLaunch: function() {
    var logs = wx.getStorageSync('logs') || []
    // unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
  },
  api: sign.api,
  store_id: __config.sid,
  globalData: sign.globalData,
  login: function(opts) {
    let that = this;
    sign.getLocation();
    sign.signin(opts);
  },
  /**
   * 拨打电话
   */
  calling: function(phone = __config.serverPhone) {
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function() {
        console.log("拨打电话成功！")
      },
      fail: function() {
        console.log("拨打电话失败！")
      }
    })
  },
  /**
   **推送消息
   *formId  获取form提交生活的form的id
   */
  pushId(e) {
    console.info('form提交..... ', e.detail);
    var that = this;
    return new Promise((resolve, reject) => {
      var uid = wx.getStorageSync('userUid');
      if (uid == undefined || uid == '') {
        wx.switchTab({
          url: './page/tabBar/home/index-new',
        })
        console.error('uid为空');
        reject('uid为空');
      } else {
        that.globalData.uid = uid;
      }
      let {
        detail: {
          formId = ''
        }
      } = e;
      let timeStamp = Date.parse(new Date()) / 1000; //时间戳
      if (formId.includes('formId')) {
        wx.showToast({
          title: '请用手机调试',
          icon: 'loading',
          duration: 2000
        });
        reject('要使用手机调试才有formId！');
      };
      if (formId == '') {
        reject('formId不能为空');
      }
      let ids = that.globalData.formIds || [];
      ids.push({
        timeStamp,
        token: formId,
      })
      that.globalData.formIds = ids;
      console.info('form提交.....ids ', ids);
      resolve(ids);
    })

  },
  /**
   * 提交订单
   */
  saveId: function(formIds) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
      return;
    } else {
      that.globalData.uid = uid;
    }
    if (formIds.length == 0) {
      wx.showToast({
        title: '推送消息失败，无formIds',
      });
      return;
    };
    let arr = [];
    if (formIds.length > 1) {
      for (var i in formIds) {
        var item = formIds[i];
        if (item.timeStamp != undefined && item.token != undefined && item.timeStamp != '' && item.token != '') {
          arr.push(item);
          break;
        }
      };
    }
    let arr2 = arr.length > 0 ? arr : formIds;
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      "tokens": arr2
    }
    console.log('submit params', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=formid_save', {
      params
    }, (err, rep) => {
      console.log('submit ', rep);
      if (err && rep.err_code != 0) {
        console.error(err || rep.err_msg)
      };
    });
  },
  /**发送消息 */
  send: function(order_no) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: './page/tabBar/home/index-new',
      })
      console.error('uid为空');
      return;
    } else {
      that.globalData.uid = uid;
    }
    var params = {
      "uid": uid,
      "sid": that.globalData.sid,
      order_no
    };
    console.info('send.......', params);
    that.api.postApi('wxapp.php?c=tempmsg&a=send', {
      params
    }, (err, rep) => {
      if (err || rep.err_code != 0) {
        console.error(err || rep.err_msg);
        return;
      }
    })
  },
  //弹窗提示参团信息
  loadJumpPin() {
    var that = this;
    var params = {
      "num": 4
    };
    return new Promise(resolve => {
      that.api.postApi(__config.jumpintuanUrl, {
        params
      }, (err, rep) => {
        if (err || rep.err_code != 0) {
          console.error(err || rep.err_msg);
          return;
        } else {
          resolve(rep.err_msg);
        }
      })

    })
  }
})