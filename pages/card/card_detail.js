// pages/card/card_detail.js
// var WxParse = require('../wxParse/wxParse.js');
var app = getApp();
Page({
  data:{
    start:'',
    end:'',
    detail:''
  },
  onLoad:function(options){
    console.log('详情页参数',options)
    var start = options.start;
    var end = options.end;
    var detail = options.detail;
    this.setData({
      start,
      end,
      detail
    })
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
  onShareAppMessage(res) {
    return { title: app.title, path: '/pages/card/card_detail' }
  },

})