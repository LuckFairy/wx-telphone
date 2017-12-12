// pages/store/store-list.js
var app = getApp();
const log = 'store-list.js --- ';

const ListURL = 'store/ls';    // 门店列表

Page({
  data:{
    loading: true,         // 是否正在加载
    pageData: null,        // 门店列表数据
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this._loadData();
  },
  
  /**
   * 加载页面数据  加载门店列表数据
   */
  _loadData() {
    app.api.fetchApi(ListURL, (err, res) => {   // 获取门店列表数据
      if (!err && res.rtnCode == 0) {
        let {data:pageData} = res;  
        this.setData({
          loading: false,
          pageData
        });
      } else {
      }
    });
  },
  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})