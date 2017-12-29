// pages/store/store-list.js
var app = getApp();
const log = 'store-list.js --- ';
import { store_Id } from '../../utils/store_id';
Page({
  data:{
    loading: true,         // 是否正在加载
    pageData: null,        // 门店列表数据
    storeId: store_Id.shopid
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
    var that = this;
    var store_id = that.data.storeId
    var params = {
      store_id
    }
    app.api.postApi('wxapp.php?c=address&a=physical_list', { params }, (err, resp) => {
      wx.hideLoading();
      // 列表数据
      console.log(resp, 344444)
      var dataList = resp.err_msg.products
      that.setData({
        dataList: dataList
      });
    });
  },
  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})