// pages/credit/credit.js
var app = getApp();
const log = 'credit.js --- ';

Page({
  data:{
    loading: true,     // 是否正在加载数据
    pageData: null,    // 页面数据
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
   * 加载页面数据
   */
  _loadData() {
    let url = 'credit/products';  // 积分商品列表 积分商品（流量包）详情
    
    let pageData = {
      myCredit: 500,
      goodsList: [
        {
          id: 1,
          operator: '移动',
          title: '移动50M流量包',
          credit: 800,
          oldPrice: 8
        },
        {
          id: 2,
          operator: '移动',
          title: '移动50M流量包',
          credit: 800,
          oldPrice: 8
        },
        {
          id: 3,
          operator: '移动',
          title: '移动50M流量包',
          credit: 800,
          oldPrice: 8
        },
        {
          id: 4,
          operator: '移动',
          title: '移动50M流量包',
          credit: 800,
          oldPrice: 8
        }
      ]
    };
    this.setData({
      loading: false,
      pageData
    });
  },
  
  /**
   * 点击卡片
   * 调至兑换页面
   */
  clickCard(e) {
    let {card} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `./credit-exchange?data=${JSON.stringify(card)}`
    });
  },
  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})