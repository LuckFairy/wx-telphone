// pages/activity/activity.js
var app = getApp();
Page({
  data: { 
    hotsaleGoing:[],      // 闪购正在进行
    hotsaleIncoming: [],  // 闪购即将开始
  },

  onLoad:function(options){
    wx.showLoading({ title: '加载中' });
    // 页面初始化 options为页面跳转所带来的参数
    let {actIndex} = options;
    if(isNaN(actIndex)){
      actIndex = '0';
    }
    this.setData({curSwiperIdx:actIndex, curActIndex:actIndex, "tabName": "going", "data":this.data});
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this.loadData();
    this.startCountDown();
  },
  onHide:function(){
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload:function(){
    // 页面关闭
  },

  loadData: function () {
    this.loadHotsale();
    app.api.postApi('card/ls', {cateId:1}, (err, response) => {
      if (err) return;
      let {rtnCode, data, count, user_info} = response;
      if (rtnCode != 0) return;

      if(data){
        let {activityId, result} = data;
        wx.setStorageSync('curActivityId', activityId);
        //更新数据
        this.setData({ loading: false, cardList: result });

      }

      wx.hideLoading();
    });
  },


  getCard: function(event){
    var cardId = event.target.dataset.cardId;
    wx.navigateTo({
      url: '../card/card_summary?cardId='+cardId
    });
  },

  swiperChange:function(event){
    var that = this;
    this.setData({
      curActIndex:event.detail.current
    });
  },
  swichSwiperItem:function(event){
    this.setData({
      curSwiperIdx:event.target.dataset.idx, 
      curActIndex:event.target.dataset.idx
    });
  },

  //-------------------优惠券----------------------
  getCard: function(event){
    var available = event.currentTarget.dataset.available;
    var cardId = event.currentTarget.dataset.cardId;
    var activityId = event.currentTarget.dataset.activityId;
    
    if(available){
      wx.navigateTo({
        url: '../card/card_summary?cardId=' + cardId + '&activityId=' + activityId
      });
    }else{
      this.setData({showOverlay:'1',overlayText:'您已经领过啦，试试领别的吧'});
    }

  },


  //-------------------闪购-------------------
  switchTab: function(evt){
      var status = evt.target.dataset.status;
      this.setData({"tabName": status});
  },

  loadHotsale: function() {
    app.api.fetchApi('shop/hotsale/2', (err, response) => {
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
        let validTime = Date.parse(item.validTime);
        if (validTime <= now) {  // 正在进行
          let expireTime = Date.parse(item.expireTime);
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

  //--------------------申请试用 ----------------
  goApplyTrial: function(event){
    var isApplied = event.currentTarget.dataset.isApplied;
    if(isApplied == '1'){
      this.setData({showOverlay:'1',overlayText:'您已经申请过啦，试试申请别的吧'});
    }else{
      wx.navigateTo({
        url: '../shopping/trial-apply?goodsId='
      });
    }
  },
  hideOverlay: function(event){
    this.setData({showOverlay:'0'})
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
        let validTime = Date.parse(item.validTime);
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
        let expireTime = Date.parse(item.expireTime);
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

})