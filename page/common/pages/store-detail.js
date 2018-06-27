var app = getApp();

const DetailURL = 'wxapp.php?c=address&a=physical_detail';    // 门店详情
const newDetailURL = 'wxapp.php?c=address&a=physical_detail_v2';    // 新门店详情

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
    app.api.postApi(newDetailURL, { params }, (err, resp) => {
      // 列表数据
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
   * 拨打电话
   */
  calling:function(e){
    var { telphone } = e.currentTarget.dataset;
    app.calling(telphone);
  },
  /**
   * 点击查看街景
   */
  seeStreet() {
    let geoCode = this.data.physical_detail.geocode;
    console.log(geoCode,'geoCode');
    if (geoCode.length == 2){
        wx.openLocation({
          latitude: Number(geoCode[1]),
          longitude: Number(geoCode[0])
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