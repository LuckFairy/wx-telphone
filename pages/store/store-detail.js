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
    console.log(log);  
    console.log(options);
    
    app.api.fetchApi(DetailURL + '/' + options.storeId, (err, res) => {
      if (!err && res.rtnCode == 0) {
        console.log(log + '获取门店详情数据');
        console.log(res.data);
        let {data:pageData} = res;
        this.setData({
          loading: false,
          pageData
        });
      } else {
        console.log(log + '获取门店详情数据错误');
        console.log(err);
        
        // let pageData = {
        //   "storeId": 1,            // 门店ID
        //   "name": "珠江新城店",      // 门店名称
        //   "agentId": 2,            // 渠道商编号
        //   "address": "广东省广州市赤岗北路6号瑞福大厦",   // 门店地址
        //   "telephone": "1888888888",                 // 联系电话
        //   "fax": "020-22133332",   // 传真
        //   "comment": "备注",        // 备注
        //   "image": "catalog/demo/banners/banner_left.jpg",  // 门店主图
        //   "images": ["http://img15.3lian.com/2015/h1/317/d/42.jpg", "http://img15.3lian.com/2015/h1/317/d/42.jpg", "http://img15.3lian.com/2015/h1/317/d/42.jpg"],            // 门店图集
        //   "workingTime": "9:30 - 21:30",             // 营业时间
        //   "geocode": ""            // LBS地理位置code
        // };
        // this.setData({
        //   pageData,
        //   loading: false
        // });
      }
    });
  },
  
  /**
   * 点击查看街景
   */
  seeStreet() {
    console.log(log + '点击查看街景');
    let geoCode = this.data.pageData.geocode;
    let geoCodeArray = geoCode.split(",");
    console.log("geoCodeArray" + JSON.stringify(geoCodeArray));
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