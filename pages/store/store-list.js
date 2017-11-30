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
        console.log(log + '获取门店列表数据');
        console.log(res.data);
        let {data:pageData} = res;
        
        this.setData({
          loading: false,
          pageData
        });
      } else {
        console.log(log + '获取门店列表数据错误');
        console.log(err);
        
        // let pageData = [
        //   {
        //     "storeId": 1,            // 门店ID
        //     "name": "珠江新城店",      // 门店名称
        //     "agentId": 2,            // 渠道商编号
        //     "address": "广东省广州市赤岗北路6号瑞福大厦",   // 门店地址
        //     "telephone": "1888888888",                 // 联系电话
        //     "fax": "020-22133332",   // 传真
        //     "comment": "备注",        // 备注
        //     "image": "catalog/demo/banners/banner_left.jpg",  // 门店主图
        //     "images": [],            // 门店图集
        //     "workingTime": "9:30 - 21:30",             // 营业时间
        //     "geocode": ""            // LBS地理位置code
        //   }
        // ];
        // this.setData({
        //   pageData,
        //   loading: false
        // });
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