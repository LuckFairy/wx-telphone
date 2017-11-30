// pages/mine/change-name.js
var app = getApp();
const log = 'change-name.js --- ';

Page({
  data:{
    nickname :""
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let {nickname} = options;
    this.setData({nickname});
  },
  
  onInput(e) {
    let {value:nickname} = e.detail;
    this.setData({nickname});
  },
  
  /**
   * 保存名字
   */
  save() {
    let {nickname} = this.data;
    console.log(nickname);
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
  }
})