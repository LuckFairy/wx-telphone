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
        
      });
    });
  },


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
