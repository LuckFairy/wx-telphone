// pages/message/message.js
var app = getApp();
const log = 'message.js --- ';

Page({
  data:{
    loading: true,      // 正在加载
    pageData: null,     // 页面数据 
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    
  },
  onReady:function(){
    // 页面渲染完成
    this._loadData();
  },

  /**
   * 加载数据
   */
  _loadData() {
    let url = 'user/msg_list';
    app.api.fetchApi(url, (err, response) => {
      if(!err) {
        console.log(log + 'pageData');
        console.log(response);
      } else {
        console.log(log + '返回数据错误');
        console.log(e);
      }
    });

    let pageData = [
      {
        id: 1,
        image: '../../image/ap_home_gift.png',
        title: '恭喜，您的美赞臣奶粉新品试用申请我们已经通过，请去以下门店提取。',
        where: {
          shop: '美赞臣店',
          address: '广州市海珠区赤岗北路6号B区301镇',
          distance: '5.6公里'
        },
        time: '2017.3.16',
        gotted: false
      },
      {
        id: 2,
        image: '../../image/ap_home_gift.png',
        title: '恭喜，您的美赞臣奶粉新品试用申请我们已经通过，请去以下门店提取。',
        where: {
          shop: '美赞臣店',
          address: '广州市海珠区赤岗北路6号B区301镇',
          distance: '5.6公里'
        },
        time: '2017.3.16',
        gotted: true
      }
    ];

    this.setData({
      loading: false,
      pageData
    });
  },

  /**
   * 点击地址
   */
  tabAddress() {
   console.log(log + '点击地址'); 
  },

  /**
   * 兑换
   */
  convert() {
    console.log(log + '兑换');
    wx.navigateTo({
      url: './no-conform'
    });
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