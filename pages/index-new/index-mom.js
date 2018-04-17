// pages/index-new/index-mom.js
var app = getApp();
import { Api } from '../../utils/api_2';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    dataList:'',
    page:1,
    activityId:237,
    activity_err_msg:'',
    logo: '',
    store_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 获取店铺id shopId
    var store_id = app.store_id;
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    var openId = wx.getStorageSync('userOpenid');
that.setData({store_id});
    // 拿到页码
    var page = that.data.page;
    var activityId = that.data.activityId;
    console.log('page', page);
    console.log('activityId', activityId);
    // 头部信息接口开始
    var params = {
      store_id: store_id,
      cate_id:2
    }
    app.api.postApi('wxapp.php?c=coupon&a=get_category_activity', { params}, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 666666666)
      var activity_err_msg = resp.err_msg;
      that.setData({
        activity_err_msg
      });
    });
    // 头部信息接口结束
     // 列表信息接口开始
    that.goHead(uid, store_id, page, activityId);
     //列表信息接口结束
  },
  goHead(uid, store_id, page, activityId){
    // 列表信息接口开始
    var that = this;
    var activityId = that.data.activityId;
    console.log("点击之后", activityId)
    var params = { uid: uid, store_id: store_id, page: page, activityId: activityId }
    
    app.api.postApi('wxapp.php?c=coupon&a=coupon_list', { params }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 344444)
      var dataList = resp.err_msg.list;
      var logo = resp.err_msg.logo;
      that.setData({
        dataList: dataList,
        logo: logo
      });
    });
    //列表信息接口结束
  },
  clickGo(e){
    var that = this;
    var store_id = this.data.store_id;
    var uid = that.data.uid;
    var openId = wx.getStorageSync('userOpenid');

    // 拿到页码
    var page = that.data.page;
    // 获取current确定点击哪里
    var current = e.currentTarget.dataset.current;
    console.log('current',current)
    that.setData({
      current: current
    });
    console.log('当前点击current',current)
    var activityId;
    if (current==0){
      that.setData({
        activityId: 237
      })
    } else if (current==1){
      console.log("dhfshgglskhsfl")
      that.setData({
        activityId: 238
      })
    } else if (current==2){
      that.setData({
        activityId: 239
      })
    } else if (current==3){
      that.setData({
        activityId: 241
      })
    }
    that.goHead(uid, store_id, page, activityId);
  },
  goDetail(e){
    console.log('各种id',e)
    var activityId = e.currentTarget.dataset.activityId;
    var id = e.currentTarget.dataset.id;
    var endTime = e.currentTarget.dataset.endTime
    var faceMoney = e.currentTarget.dataset.faceMoney
    var name = e.currentTarget.dataset.name
    var originalPrice = e.currentTarget.dataset.originalPrice
    var startTime = e.currentTarget.dataset.startTime
    var logo = e.currentTarget.dataset.logo
    var source = e.currentTarget.dataset.source
    wx.navigateTo({
      url: '../card/card_summary?activityId=' + activityId + '&id=' + id + '&endTime=' + endTime + '&faceMoney=' + faceMoney + '&name=' + name + '&originalPrice=' + originalPrice + '&startTime=' + startTime + '&logo=' + logo + '&source=' + source
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})