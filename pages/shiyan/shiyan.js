var app = getApp();
// const APP_ID = '';//输入小程序appid
// const APP_SECRET = '';//输入小程序app_secret
// var OPEN_ID = ''//储存获取到openid
// var SESSION_KEY = ''//储存获取到session_key
// import { Api } from '../../utils/api_2';
import { UID } from '../../utils/uid';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgurl: 'http://admin.ljxhlaw.com/index.php/pub/qr?data={"resType":"card","resId":"2000449","activityId":"236","checkCode":"","uid":"o8AMa0TF4eUD66893iOEXVVfuQv0","agentId":"2"}',
    motto: 'Hello World',
    imgurl2: 'https://saas.qutego.com/wxapp.php?c=coupon&a=coupon_qrcode&data={\"resType\":\"card\",\"resId\":\"55\",\"activityId\":\"236\",\"checkCode\":\"YA112736\",\"uid\":\"7\",\"agentId\":\"6\"}',
    qrUrl: '',
    array: ['Android', 'IOS', 'ReactNativ', 'WeChat', 'Web'],
    index: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //Api.signin();
    // wx.login({
    //   success:function(CODE){
    //     console.log(CODE,"777")
    //       wx.request({
    //         url: "https://saas.qutego.com/wap/store_coupon.php?action=get_usercoupon_list&id=5&couponid=0",
    //         header:{
    //           "content-tyoe":"application/json"
    //         },
    //         success:function(resp){
    //           console.log(resp,"00000000000000000000000000000000000")
    //         }       
    //       }) 
    //   }
    // })

    this.couponDetail();
  },
  listenerPickerSelected: function (e) {
    //改变index值，通过setData()方法重绘界面
    this.setData({
      index: e.detail.value
    });
  }, 
  //优惠券详情
  couponDetail: function() {
    console.log("优惠券详情start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      activityId: '237',   //236 门店促销 237 母婴服务——儿童摄影 238 母婴服务——早教 239 母婴服务——游泳馆 241 母婴服务——其他
      id: '52', //优惠券id
    }

    let url = "wxapp.php?c=coupon&a=coupon_detail";

    console.log(params);
    app.api.postApi(url, { params }, (err, resp) => {
      //console.log(resp, "111111222222333333");
      let qrUrl = resp.err_msg.qrUrl;
      //console.log(qrUrl, "11111111111111");
      this.setData({ qrUrl });
    })
  },
  getUID(){
    UID.goUid();
  },
  //二维码
  qrcode: function () {
    console.log("二维码start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      activityId: '237',   //236 门店促销 237 母婴服务——儿童摄影 238 母婴服务——早教 239 母婴服务——游泳馆 241 母婴服务——其他
      id: '32', //优惠券id
    }

    let url = "wxapp.php?c=coupon&a=coupon_qrcode";

    console.log(params);
    app.api.postApi(url, { params }, (err, resp) => {
      console.log(resp, "111111222222333333");
    })
  },
  //领取优惠券
  getCoupon: function () {
    console.log("领取优惠券start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      activityId: '237',   //236 门店促销 237 母婴服务——儿童摄影 238 母婴服务——早教 239 母婴服务——游泳馆 241 母婴服务——其他
      id: '32', //优惠券id
    }

    let url = "wxapp.php?c=coupon&a=get_coupon";

    console.log(params);
    app.api.postApi(url, { params }, (err, resp) => {
      console.log(resp, "111111222222333333");
    })
  },
  //优惠券列表
  couponHotSale: function () {
    console.log("优惠券列表start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      //activityId: '236',   //236 门店促销 237 母婴服务——儿童摄影 238 母婴服务——早教 239 母婴服务——游泳馆 241 母婴服务——其他
      activityId: '237', 
      page: 1
    }
    
    let url = "wxapp.php?c=coupon&a=coupon_list";
    
    console.log(params);
    app.api.postApi(url, { params }, (err, resp) => {
      console.log(resp, "111111222222333333");
    })
  },
  //异业券头部列表
  couponOther: function () {
    console.log("优惠券列表start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      page: 1,
      //type: 'all',  //all 全部卡券  used 已使用  unused 未使用 unget 未领取  expired 已过期
      //type: 'expired',   //已过期
      //type: 'used',   //已使用
      type: 'unused',   //未使用
    }
    console.log(params);
    app.api.postApi("wxapp.php?c=coupon&a=my", { params }, (err, resp) => {
      console.log(resp, "111111222222333333");
    })
  },  
  //优惠券列表
  couponList: function () {
    console.log("优惠券列表start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      page: 1,
      //type: 'all',  //all 全部卡券  used 已使用  unused 未使用 unget 未领取  expired 已过期
      //type: 'expired',   //已过期
      //type: 'used',   //已使用
      type: 'unused',   //未使用
    }
    console.log(params);
    app.api.postApi("wxapp.php?c=coupon&a=my", { params }, (err, resp) => {
      console.log(resp, "111111222222333333");
    })
  },   
  //我的优惠券
  getMyCoupon: function () {
    console.log("我的优惠券测试start")
    var that = this;
    let params = {
      uid: 7,
      store_id: 6,
      page:1,
      //type: 'all',  //all 全部卡券  used 已使用  unused 未使用 unget 未领取  expired 已过期
      //type: 'expired',   //已过期
      //type: 'used',   //已使用
      type: 'unused',   //未使用
    }
    console.log(params);
    app.api.postApi("wxapp.php?c=coupon&a=my", { params }, (err, resp) => {  
      console.log(resp, "111111222222333333");
    })
  },
  //大转盘
  lottery: function () {
    console.log("大转盘抽奖start")
    var that = this;
    let params = {
      id: 7,
      uid: 7,
    }
    console.log(params);
    app.api.postApi("wxapp.php?c=lottery&a=detail", { params }, (err, resp) => {
      console.log(resp, "111111222222333333");
    })
  },
  //获取个人信息
  getOpenId:function () {
    console.log("99999999999999999999")
    var that = this;
    wx.login({
      success: function (res) {
        // var CODE = res.code;
        let params = {
          jscode: res.code,
        }
        console.log(res.code,"22222222222222222222222222");
        //app.api.postApi("wxapp.php?c=wechatapp&a=login", {jscode: CODE},(err, resp) => {
        app.api.postApi("wxapp.php?c=wechatapp&a=login", { params }, (err, resp) => {  
          
          console.log(resp,"111111222222333333");
        })
      }
   })
  },
  getPay(){
    //wap/saveorder.php?action=pay_xcx 
    app.api.postApi("wap/saveorder.php?action=pay_xcx", {
      payType: 'weixin'
      , orderNo: 'PIG20171128111233304093'
      , is_app: false
      , postage_list:"",
      shipping_method: 'express', address_id:6 }, (err, resp) => {
      console.log(resp, "4444");
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  testWeb: function () {
    console.log('shiyan_2');
    wx.navigateTo({
      url: '../shiyan/shiyan_2',
    })
  },
})