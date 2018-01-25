//app.js
import { Api } from './utils/api_3';
App({
  api: Api,
  onLaunch: function () {
    console.log('App onLaunch');
    //处理兼容高频使用的高版本方法。
    if (!wx.showLoading){
        wx.showLoading = (obj) => { console.log('mock wx.showLoading. do nothing...');}
    }
    if (!wx.hideLoading) {
        wx.hideLoading = () => { console.log('mock wx.hideLoading. do nothing...');}
    }

    // wx.clearStorageSync();
    this.systemInfo = wx.getSystemInfoSync();
    // Api.signin();
    var logLat = wx.getStorageSync('logLat') ? wx.getStorageSync('logLat') : null;
    var that = this;
    wx.getLocation({
      success: (res) => {
        var latitude = res.latitude //维度
        var longitude = res.longitude //经度
        var speed = res.speed //速度，浮点数，单位m/s
        var accuracy = res.accuracy  //位置的精确度
        logLat = [longitude, latitude];
        wx.setStorageSync('logLat', logLat);
      },
      fail: () => {
        if (this.fail()) { console.log('获取位置失败'); return null; }
        this.success();
      },
      cancel: () => {
        console.log('用户拒绝授权获取地理位置')
      }
    })
  },
  onShow: function () {
    console.log('App onShow() ...')
  },
  globalData:{
    userInfo: "",
    TOKEN_ID: "",
    image: { mode:"aspectFit",lazyLoad:"true"},
    uid: "",//用户id
    sid: "",//商店id
    openid: "",//用户openid
    formIds: [],//formId数组
    phy_id :"5",//门店id，默认是总店5
  },
  d: {
    hostUrl: 'https://wxplus.paoyeba.com/index.php',
    hostImg: 'http://img.ynjmzb.net',
    hostVideo: 'http://zhubaotong-file.oss-cn-beijing.aliyuncs.com',
    userId: 1,
    appId: "",
    appKey: "",
    //ceshiUrl:'https://wxplus.paoyeba.com/index.php',
    ceshiUrl: 'http://leoxcxshop.com/index.php',
  },
  /**
   * 获取位置
   * 
   */
  getLocation: function (){
    var logLat = wx.getStorageSync('logLat') ? wx.getStorageSync('logLat'):null;
    var that = this;
    wx.getLocation({
      success: (res) => {
        var latitude = res.latitude //维度
        var longitude = res.longitude //经度
        var speed = res.speed //速度，浮点数，单位m/s
        var accuracy = res.accuracy  //位置的精确度
         logLat = [longitude,latitude];
         wx.setStorageSync('logLat',logLat);
      },
      fail:()=>{
          if(this.fail()){console.log('获取位置失败');return null;}
          this.success();
      },
      cancel:()=>{
        console.log('用户拒绝授权获取地理位置')
      }
    })
    
  },
  /**
   * 拨打电话
   */
  calling: function (phone = '4006088520') {
    wx.makePhoneCall({
      phoneNumber: phone, 
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  /**
   **推送消息
   *formId  获取form提交生活的form的id
   */
  pushId(e) {
    console.log('app.hasSignin', this.hasSignin);
    var that = this;
    //用户登录成功,获取uid,sid,openid
    if (that.hasSignin) {
      that.globalData = Object.assign(that.globalData, {
        uid: wx.getStorageSync('userUid'),
        sid: that.store_id,
        openid: wx.getStorageSync('userOpenid')
      })
    } else { return; }
    console.log('form提交 ', e.detail);
    let { detail: { formId = [] } } = e;
    let timeStamp = Date.parse(new Date()) /1000;//时间戳
   
    if (formId.includes('formId')) {
      wx.showToast({
        title: '请用手机调试',
        icon: 'loading',
        duration: 2000
      });
      return;
    };
    let ids = that.globalData.formIds;
    ids.push({
      timeStamp,
      token: formId,
    })
    that.globalData.formIds = ids;
    console.log('formIds......', formId);
    //提交订单
    that.submit();
  },
  /**
 * 提交订单
 */
  submit: function () {
    var that = this;
    if (that.globalData.formIds.length == 0) {
      wx.showToast({ title: '没有formid值，请点击菜单获取', });
      return;
    };
    var params = {
      "uid": that.globalData.uid,
      "sid": that.globalData.sid,
      "tokens": that.globalData.formIds
    }
    console.log('submit params', params);
    that.api.postApi('wxapp.php?c=product_v2&a=test_save', { params }, (err, rep) => {
      console.log('submit ', rep);
      if (!err && rep.err_code == 0) {
        that.globalData.formIds = [];
        that.send();
      }
    });
  },
  send: function (e) {
    var that = this;
    var params = {
      "uid": that.globalData.uid,
      "sid": that.globalData.sid,
    };
    console.log('send ', params);
    that.api.postApi('wxapp.php?c=product_v2&a=test_send', { params }, (err, rep) => {
      console.log('send....rep',rep);
    })
  },
  store_id:6, //2018年1月5日17:50:51 店铺id by leo 63 中亿店铺 6 婴众趣购
})


