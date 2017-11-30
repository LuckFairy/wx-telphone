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
        console.log(log + '获取社群列表');
        console.log(pageData);
        this.setData({pageData, loading: false});
      } else {
        console.log(log + '获取社群列表失败');
        console.log(err);
        // let pageData = [
        //   {
        //     "id": 1,
        //     "agentId": 2,
        //     "storeId": 0,
        //     "name": "母婴奶粉交流群1",
        //     "code": 0,
        //     "description": "母婴宝宝妈妈交流群，妈妈首选的备孕，怀孕，育儿早教等育儿纯交流群",
        //     "coverImgUrl": "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1495433828369&di=839eff139ed2eb9948ab3dc624e003a5&imgtype=0&src=http%3A%2F%2Fpic61.nipic.com%2Ffile%2F20150310%2F5450641_155105194261_2.jpg",
        //     "memberCount": 369,
        //     "maxLimitCount": 500,
        //     "status": 1
        //   },
        //   {
        //     "id": 2,
        //     "agentId": 2,
        //     "storeId": 0,
        //     "name": "母婴奶粉交流群2",
        //     "code": 0,
        //     "description": "母婴宝宝妈妈交流群，妈妈首选的备孕，怀孕，育儿早教等育儿纯交流群",
        //     "coverImgUrl": "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1495433828369&di=839eff139ed2eb9948ab3dc624e003a5&imgtype=0&src=http%3A%2F%2Fpic61.nipic.com%2Ffile%2F20150310%2F5450641_155105194261_2.jpg",
        //     "memberCount": 499,
        //     "maxLimitCount": 500,
        //     "status": 1
        //   }
        // ];
        // this.setData({
        //   loading: false,
        //   pageData
        // });
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
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
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