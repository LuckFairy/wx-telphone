// pages/in-ex-details/in-ex-details.js
var app = getApp();
const log = 'in-ex-details.js --- ';

Page({
  data:{
    pageData: null,    // 页面数据
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this._loadData();
  },
  
  /**
   * 加载页面数据
   */
  _loadData() {
    let pageData = [
      {
        id: 1,
        title: '购物送积分 (商品名: 婴儿美赞臣奶粉)',
        time: '2017-04-25 11:24:34',
        score: '+50' 
      },
      {
        id: 2,
        title: '购物送积分 (商品名: 婴儿美赞臣奶粉)',
        time: '2017-04-25 11:24:34',
        score: '+50' 
      },
      {
        id: 3,
        title: '购物送积分 (商品名: 婴儿美赞臣奶粉)',
        time: '2017-04-25 11:24:34',
        score: '-400' 
      },
      {
        id: 4,
        title: '购物送积分 (商品名: 婴儿美赞臣奶粉)',
        time: '2017-04-25 11:24:34',
        score: '+50' 
      },
    ];

    this.setData({pageData});
  },
  
  /**
   * 立马兑换
   */
  goToExChange() {
    console.log(log + '立马兑换');
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