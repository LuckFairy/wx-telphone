// pages/score/score.js
var app = getApp();
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.loadData();
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

  loadData: function () {
    let action = 'showScore';
    app.api.fetchApi(action, (err, response) => {
      if (err) return;
      let {rtnCode, records, total} = response;
      if (rtnCode != 0) return;
      //更新数据
      console.log("***********************************");
      this.setData({loading: false, total:total, scoreRecList:records})
    })
  },

})