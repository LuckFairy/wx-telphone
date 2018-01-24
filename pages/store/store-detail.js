// pages/store/store-detail.js
var app = getApp();

const DetailURL = 'store/detail';    // 门店详情

Page({
  data:{
    loading: true,         // 正在加载数据
    pageData: null,        // 门店详情数据
    physical_detail:''
  },
  onLoad:function(options){
    console.log(options,'options')
    var that = this;
    var phy_id = options.phy_id;
    var params = {
      phy_id
    }
    app.api.postApi('wxapp.php?c=address&a=physical_detail', { params }, (err, resp) => {
      // 列表数据
      console.log(resp, 344444)
      if (resp) {
        if (resp.err_code == 0) {
          var physical_detail = resp.err_msg.physical_detail;
          that.setData({
            physical_detail
          })
        }
      } else {
        //  错误
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
    console.log(e,'eeeeee')
    var index = e.target.dataset.index;
    var imgs = e.currentTarget.dataset.imgs;
    wx.previewImage({
      current: imgs[index], 
      urls: [imgs][0]
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
  }
})