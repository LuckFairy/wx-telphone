//index.js 
const log = "index.js --- ";
import {getUrlQueryParam} from '../../utils/util';
//获取应用实例
var app = getApp()
var indexData;
var checkTimer = null;     // 若还没登录，启用定时器


var loadCounter = 0;
Page({
  data: {
    loading: true,
    yiyaDataList:{}
  },
  goSearchGroup (){
    wx.navigateTo({
      url: '../cluster/grouplist'   
    })
  },
  onLoad: function () {
    var that = this;
    // let url = 'http://www.baidu.com?code=wxapp&data={"act":"12card", "id":123}';
    // let ret = getUrlQueryParam(url, 'data');
    
    /*
    // 拼团列表数据
    app.api.fetchApi("Groupbuy/GroupbuyLists", (err, resp) => {
      if (err){
          wx.showToast({
            title: '网络错误',
            icon: 'loading',
            duration: 2000
          })
      } else if (resp){
        var yiyadata=[];
        yiyadata.push(resp.data);
        console.log(yiyadata[0],3333333333);
        that.setData({
          yiyaDataList: yiyadata[0]
        })
      }
    })
    */

  },
  onUnload() {

  },
  onShow(){
      this._prepare();    // 等待登录才开始加载数据
  },
  onShareAppMessage(res){
      return { title: '', path: ''}
  },
  
  /**
   * 若还没登录，启用定时器
   */
  _prepare() {
    clearInterval(checkTimer);
    checkTimer = setInterval(() => {
      console.log(log + getApp().hasSignin);
      if (getApp().hasSignin) {
        clearInterval(checkTimer);
        this.loadData();    // 加载数据，关闭定时器
      }
    }, 200);
  },

  /**
   * 加载首页数据
   */
  loadData() {
      this.loadIndexData();
  },

  loadIndexData:function(){
      app.api.fetchApi('home/indexPage2', (err, response) => {
          if (err) return;
          let {data} = response;
          data[0].data.userInfo = wx.getStorageSync('userInfo');
          this.setData({ loading: false, indexData: data });
      });
  },

  _loadVIPCardData(){
      let url = 'home/vipCard';
      return new Promise((resolve, reject) => {
          app.api.fetchApi(url, (err, response) => {
              if (err) reject(err);
              let {data} = response;
              data.userInfo = wx.getStorageSync('userInfo');
              let indexData = {
                  type: 'mem_card',
                  data
              };
              resolve(indexData);
          });
      });
  },

  /**
   * 加载首页卡片数据
   */
  _loadGridData() {
    let url = 'home/grid';
    return new Promise((resolve, reject) => {
      app.api.fetchApi(url, (err, response) => {
        if (err) reject(err);
        let {data} = response;
        let indexData = {
          type: 'func_grid',
          data
        };
        resolve(indexData);
        
        //保存首页数据
        // wx.setStorageSync('indexData', indexData);

        //更新数据
        // this.setData({ loading: false, indexData: indexData });
      });
    });
  },

   /**
   * 加载精选活动数据（任意一方加载完数据都可以先显示）
   */
  _loadActivityData() {
    let url = 'home/hotsale';
    return new Promise((resolve, reject) => {
      app.api.fetchApi(url, (err, response) => {
        if (err) reject(err);
        let {data} = response;
        let indexData = {
          type: 'func_hotsale',
          data
        };
        resolve(indexData);
        
        // //保存首页数据
        // // wx.setStorageSync('indexData', indexData);

        // //更新数据
        // this.setData({ loading: false, indexData: indexData });
      });
    });
  },

   /**
   * 加载数据
   */
  // loadData: function () {
  //   let tokenId = wx.getStorageSync('tokenId');
  //   let url = 'home/index';
  //   app.api.fetchApi(url, (err, response) => {
  //     if (err) return;
  //     // let {rtnCode, data, count, user_info} = response;
  //     // if (rtnCode != 0) return;
  //     // indexData = data.indexData;
      
  //     //保存首页数据
  //     // wx.setStorageSync('indexData', indexData);

  //     let userInfo = wx.getStorageSync('userInfo');

  //     let that = this;
  //     if (!userInfo) {
  //       wx.getUserInfo({
  //         success: function (res) {
  //           wx.setStorageSync('userInfo', res.userInfo);
  //           indexData[0].data.userInfo = res.userInfo;
  //           //that.setData({ loading: false, indexData: indexData });
            
  //           app.api.postApi("user/update", { encryptedData: res.encryptedData, iv: res.iv },
  //             (err, resData)=> {
  //               if (err) {
  //                 console.log("注册用户失败。");
  //               } else {
  //                 if(resData.rtnCode == '1'){
  //                   // var indexData = wx.getStorageSync('indexData');
  //                   if(resData.data && resData.data.bcCode){
  //                     wx.setStorageSync('bcCode', resData.data.bcCode);
  //                   }
  //                   // wx.setStorageSync('indexData', indexData);
  //                   console.log("注册用户成功。");
  //                 }else{
  //                   console.log("注册用户失败。");
  //                 }
  //               }
  //             });
  //         },
  //         fail: function () {
  //           // fail
  //           indexData[0].data.userInfo = { "nickName": wx.getStorageSync('uidTemp'), "avatarUrl": "http://obkoarv43.bkt.clouddn.com/redbox/default_weixin_headimg_new.jpg" };
  //           //that.setData({ loading: false, indexData: indexData });
  //         },
  //       });
  //     }else{
  //       indexData[0].data.userInfo = userInfo;
  //     }
      
  //     // indexData = wx.getStorageSync('indexData');
  //     indexData[0].data.bcode = wx.getStorageSync('bcCode');
  //     //更新数据
  //     this.setData({ loading: false, indexData: indexData });

  //   });
  // },


  //扫描二维码
  doScanQr:function(){
    wx.scanCode({
      success:function(res){
        console.log('扫描二维码:', res);
        var scanData = res.result;
        var navigateUrl = null;
        console.log('scan result:-----------' + scanData);

        // 去掉前缀
        let prefix = app.globalData.QR_CODE_PREFIX;
        if (scanData.startsWith(prefix)) {
          scanData = scanData.substring(prefix.length);
        }
        let data = JSON.parse(scanData);
        let {act, id} = data;
        if (act === 'buy') {   // 从大屏扫描二维码购买
          navigateUrl = '../shopping/buy?prodId=' + id;
        } else if (act === 'card') {  // 从大屏扫描优惠券二维码
          navigateUrl = "../card/card_summary?cardId=" + id;
        } else if (act === 'trail') {  // 从大屏扫描试用申请二维码

        } else if (act === 'redbox') { // 红包

        }

        if (!navigateUrl) return;

        wx.navigateTo({ url: navigateUrl });
      },
      fail:function(){
        console.log('scan fail:-----------');
      },
      complete:function(){

      }
    });
  }
})
