// pages/activity/hotsale.js

var app = getApp();

Page({
  data:{
    tabName: 'going',
    hotsaleGoing:[],      // 闪购正在进行
    hotsaleIncoming: [],  // 闪购即将开始
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.loadData();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this.startCountDown();
  },
  onHide:function(){
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload:function(){
    // 页面关闭
  },

  bindBannerLoad(e) {
    let {tab, index} = e.currentTarget.dataset;
    let {width, height} = e.detail;
    let h = 750 * (height / width);
    let {hotsaleGoing, hotsaleIncoming} = this.data;
    if (tab == '1') {
      hotsaleGoing[index].height = h;
      this.setData({ hotsaleGoing });
    } else {
      hotsaleIncoming[index].height = h;
      this.setData({ hotsaleIncoming });
    }
  },

  switchTab: function(evt){
    console.log(evt);
      var status = evt.target.dataset.status;
      this.setData({"tabName": status});
  },

  loadData: function() {
    wx.showLoading({ title: '加载中' });
    app.api.fetchApi('shop/hotsale/2', (err, response) => {
      wx.hideLoading();
      if (err) return;
      let {rtnCode, rtnMessage, data} = response;
      if (rtnCode != 0) return;
      console.log('闪购数据：');
      console.log(data);

      let hotsaleGoing = [], hotsaleIncoming = [];

      let now = new Date().getTime();
      data.forEach(item => {
        
        // let day = parseInt(leftTime / 24 / 60 / 60);
        // let hour = parseInt((leftTime - day * 24 * 60 * 60) / 60 / 60);
        // let minute = parseInt((leftTime - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
        // let second = parseInt(leftTime - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);
        let validTime = item.validTime * 1000;
        if (validTime <= now) {  // 正在进行
          let expireTime = item.expireTime * 1000;
          let leftTime = Math.abs(now - expireTime) / 1000;
          item.countDown = this.countDown(leftTime);
          hotsaleGoing.push(item);
        } else {  // 即将开始
          let leftTime = Math.abs(now - validTime) / 1000;
          item.countDown = this.countDown(leftTime);
          hotsaleIncoming.push(item);
        }
      });

      this.setData({hotsaleGoing, hotsaleIncoming});
    });
  },

  /**
   * 闪购活动倒计时
   */
  startCountDown() {
    this.timer = setInterval(() => {
      let {hotsaleGoing, hotsaleIncoming} = this.data;
      let now = new Date().getTime();

      // 即将开始
      for (let i = hotsaleIncoming.length - 1; i >= 0; i--) {
        let item = hotsaleIncoming[i];
        let validTime = item.validTime * 1000;
        let leftTime = (validTime - now) / 1000;
        if (leftTime < 0) {
          hotsaleIncoming.splice(i, 1);   // 到了开始时间，从[即将开始]里删除
          hotsaleGoing.unshift(item);    // 并将项目添加到[正在进行]的头部
          continue;
        }
        item.countDown = this.countDown(leftTime);
      }

      // 正在进行
      for (let i = hotsaleGoing.length - 1; i >= 0; i--) {
        let item = hotsaleGoing[i];
        let expireTime = item.expireTime * 1000;
        let leftTime = (expireTime - now) / 1000;
        if (leftTime < 0) {
          hotsaleGoing.splice(i, 1);   // 到了失效时间，从活动里删除
          continue;
        }
        item.countDown = this.countDown(leftTime);
      }

      // hotsaleGoing.forEach(item => {
      //   let expireTime = Date.parse(item.expireTime);
      //   let leftTime = Math.abs(now - expireTime) / 1000;
      //   item.countDown = this.countDown(leftTime);
      // });
      // hotsaleIncoming.forEach(item => {
      //   let validTime = Date.parse(item.validTime);
      //   let leftTime = Math.abs(now - validTime) / 1000;
      //   item.countDown = this.countDown(leftTime);
      // });

      this.setData({hotsaleGoing, hotsaleIncoming});
    }, 1000);
  },
  /**
   * 停止倒计时
   */
  stopCountDown() {
    this.timer && clearInterval(this.timer);
  },

  /**
   * 格式化倒计时显示
   */
  countDown(leftTime) {
    let day = parseInt(leftTime / 24 / 60 / 60);
    let hour = parseInt((leftTime - day * 24 * 60 * 60) / 60 / 60);
    let minute = parseInt((leftTime - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
    let second = parseInt(leftTime - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);

    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;

    return {day, hour, minute, second};
  },
  onShareAppMessage(res) {
      return { title: '', path: '' }
  },


  //2017年9月11日16:54:26 团购
  gotoGroup: function () {
    let url = "../cluster/cluster";
    //let url = './buy?prodId=108';
    //console.log(url);
    //wx.navigateTo({ url });
    //wx.redirectTo({ url });
    wx.redirectTo({
      url: '../cluster/grouplist'
    });
    //let url = './buy?prodId=89&skuid=56&num=2&cartId=' + toastStr;
    //wx.navigateTo({ url });

  },

})