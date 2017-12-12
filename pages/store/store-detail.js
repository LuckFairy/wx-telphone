// pages/store/store-detail.js
var app = getApp();
const log = 'store-detail.js --- ';

const DetailURL = 'store/detail';    // 门店详情

Page({
  data:{
    loading: true,         // 正在加载数据
    pageData: null,        // 门店详情数据
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    app.api.fetchApi(DetailURL + '/' + options.storeId, (err, res) => {
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
  
  /**
   * 点击查看街景
   */
  seeStreet() {
    let geoCode = this.data.pageData.geocode;
    let geoCodeArray = geoCode.split(",");
    if (geoCodeArray.length == 2){
        wx.openLocation({
            latitude: geoCodeArray[0],
            longitude: geoCodeArray[1]
        });
    }
  },
  
   /**
   * 点击查看图集
   */
  previewAlbum(e) {
    let {albums} = e.currentTarget.dataset;
  
    wx.previewImage({
      current: albums, // 当前显示图片的http链接
      urls: [albums] // 需要预览的图片http链接列表
    });
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