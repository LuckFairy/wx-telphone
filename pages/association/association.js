// association.js
var app = getApp();
const log = 'association.js --- ';

const CommunityListURL = 'home/communityList';     // 超级社群列表接口

Page({
  data:{
    loading: true,
    pageData: null
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    app.api.fetchApi(CommunityListURL, (err, res) => {    // 获取社群列表
      if(!err && res.rtnCode == 0) {
        let {data: pageData} = res;
     
        this.setData({pageData, loading: false});
      } else {
      }
    });
  },
  
  /**
   * 点击其中一个 item 时
   */
  tabItem(e) {
    let data = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `./association-detail?data=${encodeURIComponent(JSON.stringify(data))}`
    });
  },

  /**
   * 复制微信号到剪切板
   * @param {[type]} e [description]
   */
  addCodeToClipBoard(e) {
    let {code} = e.currentTarget.dataset;
    wx.setClipboardData({
      data: code,
      success: function(res) {
        wx.showModal({
          title: '复制成功',
          content: '微信号已经复制到剪切板，去微信加好友进群吧',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
             
            } else if (res.cancel) {
             
            }
          }
        })
      }
    })
  },
  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})