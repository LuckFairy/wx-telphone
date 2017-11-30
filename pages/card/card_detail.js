// pages/card/card_detail.js
var WxParse = require('../wxParse/wxParse.js');
var app = getApp();
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let {cardId} = options;
    console.log('-----------------card detail page in parameters='+ JSON.stringify(options));
    this.loadData(cardId);
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  loadData: function (cardId) {
    if(!cardId){
        let cardInfo = wx.getStorageSync('currentCardInfo');
        let article = cardInfo.cardRule;
        let that = this;
        WxParse.wxParse('article', 'html', article, that, 0);
        this.setData({loading: false, cardInfo:cardInfo});
        return;
    }
    let action = 'getCardInfo&cardId=' + cardId;
    app.api.fetchApi(action, (err, response) => {
      if (err) return;
      let {rtnCode, data} = response;
      if (rtnCode != 0) return;
      //更新数据
      this.setData({ loading: false, cardInfo: data });
    });

    
  },
  onShareAppMessage(res) {
      return { title: '', path: '' }
  },

})