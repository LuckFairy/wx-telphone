
var app = getApp();
Page({
  data:{
    start:'',
    end:'',
    detail:''
  },
  onLoad:function(options){
    let { start,end,detail} = options;
  
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


})