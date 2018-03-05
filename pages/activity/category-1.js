// pages/activity/category-1.js

import {ActivityScript} from '../template/retail-activities';

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
      ActivityScript.loadTemplateData(this, 1, 0, false);
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  onShareAppMessage(res) {
      return { title: '', path: '' }
  },
})