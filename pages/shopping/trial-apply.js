// pages/shopping/trial-apply.js
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
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

  doTrialApply: function(event){
    var goodsId = event.currentTarget.dataset.goodsId;
    //TODO:发送申请到后台，成功后显示提示
    this.setData({applySuccess:1});

  }
})