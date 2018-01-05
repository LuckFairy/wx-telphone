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
  },
  onShow: function () {
    console.log('App onShow() ...')
  },
  globalData:{
    userInfo: "",
    TOKEN_ID: "",
    image: { mode:"aspectFit",lazyLoad:"true"},
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
  store_id:6, //2018年1月3日15:20:33 店铺id by leo
})


