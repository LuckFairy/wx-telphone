// pages/store/store-list.js
var app = getApp();
import { store_Id } from '../../utils/store_id';
Page({
  data:{
    pageData: null,        // 门店列表数据
    storeId: store_Id.shopid,
    page: 1,
    windowHeight:'',
    windowWidth:'',
    physical_list:[],
    checkModel:false,//默认是门店指南模块
    index:false ,//是否是首页切换门店
  },
  onLoad:function(options){
    var {check , index } = options;
    if (check) {
      this.setData({ checkModel: true , index }); wx.setNavigationBarTitle({
        title: '门店列表'
      })};
    
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    // 自动获取手机宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    this._loadData();
  },
  gobottom(e) {
    console.log(e);
    var that = this;
    var page = that.data.page;
    page++
    that.setData({
      page
    })
    that._loadData();
  },
  /**
   * 选择门店
   */
  checkStore(e){
    var phy_id = e.target.dataset.locationId;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.loadLocation(phy_id);
    wx.navigateBack();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  
  /**
   * 加载页面数据  加载门店列表数据
   */
  _loadData() {
    var that = this;
    var store_id = that.data.storeId;
    var page = that.data.page;
    var params = {
      store_id, page
    }
    wx.showLoading({
      title: '加载中'
    });
    app.api.postApi('wxapp.php?c=address&a=physical_list', { params }, (err, resp) => {
      // 列表数据
      console.log(resp, 344444)
      if (resp) {
        wx.hideLoading();
        if (resp.err_code == 0) {
          for (var j = 0; j < resp.err_msg.physical_list.length;j++){
            that.data.physical_list.push(resp.err_msg.physical_list[j])
          }
          that.setData({
            physical_list: that.data.physical_list
          })
        }else{
          wx.showToast({
            title: '亲，没有了',
            icon: 'success',
            duration: 1000
          })
        }
      } else {
        //  错误
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