// pages/shopping/list.js
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({"tabName": "online"});
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
    let action = 'getOnlineGoods';
    app.api.fetchApi(action, (err, response) => {
      if (err) return;
      let { rtnCode, data } = response;
      if (rtnCode != 0) return;
      //更新数据
      this.setData({ loading: false, cardList: data });
    });
  },
  switchTab: function(evt){
      var status = evt.target.dataset.status;
      this.setData({"tabName": status});

  },
})