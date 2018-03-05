// pages/activity/hotsale.js

var app = getApp();

Page({
  data:{
    //tabName: 'going',
    tabName: 'shopping',
    hotsaleGoing:[],      // 闪购正在进行
    hotsaleIncoming: [],  // 闪购即将开始
    datasellout:0,
    datasellin:1,
    err_msg:''
  },
  goGroupDetail (e){
    var prodId = e.currentTarget.dataset.productid;
    var groupbuyId = e.currentTarget.dataset.groupbyid;
    var selldetail = e.currentTarget.dataset.selldetail;
    wx.navigateTo({
      //url: '../group-buying/group-buying?prodId={{item.productId}}&groupbuyId={{item.groupbuyId}}&sellout={{datasellin}}'
      url: '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + selldetail
    })
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
    //this.startCountDown();
  },
  onHide:function(){
    // 页面隐藏
    //this.stopCountDown();
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
      var status = evt.target.dataset.status;
      this.setData({"tabName": status});
  },

  loadData: function() {
    var that = this;
    wx.showLoading({ title: '加载中' });
    app.api.fetchApi('wxapp.php?c=tuan&a=store_list&store_id=6', (err, response) => {
      wx.hideLoading();
      if (err) return;
      var dataList = [];
      var err_msg = response.err_msg;
      console.log(err_msg, 3333)
      that.setData({
        err_msg: err_msg
      })
      let {rtnCode, rtnMessage, data} = response;
      
      if (rtnCode != 0) return;

      let hotsaleGoing = [], hotsaleIncoming = [];
      data.forEach(item => {
        hotsaleGoing.push(item);
      });
      this.setData({ hotsaleGoing, hotsaleIncoming});
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
    wx.redirectTo({
      url: '../cluster/cluster'
    });
  },
  //2017年9月11日20:24:41 跳回爆款闪购
  gotoGoing: function () {
    wx.redirectTo({
      url: '../activity/hotsale'
    });
  },

  gotoIncoming: function () {
    wx.redirectTo({
      url: "../activity/hotsale"
    });

  },

  //测试模板消息
  formid: function (e) {
      var user_id = app.d.userId; //测试参数
      var formId = e.detail.formId;
      let url = 'buy/sendmsg';
      app.api.postApi(url, { user_id, formId }, (err, resp) => {
        if (err) {
          wx.showToast({
            title: '加载数据出错，请重试',
            icon: 'loading',
            duration: 2000
          });
          return;
        }
      });  
  },
  

  //跳到咿呀拼多多商品页
  clickGoGroupProduct: function (e) {
    var prodId = e.currentTarget.dataset.prodid; //商品ID
    var groupbuyId = e.currentTarget.dataset.groupbuyid; //商品团活动ID
    var quantity = e.currentTarget.dataset.quantity; //商品数量
    if (quantity>0){
      var sellout=1;
    }else{
      var sellout = 0;
    }
    var url = '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + sellout;
    wx.navigateTo({ url });

    /*
    if (quantity>0){
      //未售罄
      
    }else{
      //售罄

    }
    */


  },


})