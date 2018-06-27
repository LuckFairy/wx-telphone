
var app = getApp();
const uid = wx.getStorageSync('userUid');
const openid = wx.getStorageSync('openid');
const store_id = app.store_id;
// let categoryUrl = 'wxapp.php?c=coupon&a=get_category_activity';//tab菜单接口
let categoryUrl = 'wxapp.php?c=coupon&a=get_category_activity_v2';//tab菜单接口
let listUrl = 'wxapp.php?c=coupon&a=coupon_list';//获取分类列表数据
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    dataList:'',
    page:1,
    activityid:236,
    activity_err_msg:'',//tab列表
    logo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 拿到页码
    var page = that.data.page;
    var activityid = that.data.activityid;
 
    // 头部信息接口开始
    var params = {
      store_id,
     // cate_id:2
    }
    app.api.postApi(categoryUrl, { params}, (err, resp) => {
      wx.hideLoading();
      var activity_err_msg = resp.err_msg;
      that.setData({
        activity_err_msg
      });
    });
    // 头部信息接口结束
    that.goHead(uid, store_id, page, activityid);

  },
  goHead(uid, store_id, page, activityid){
    // 列表信息接口开始
    var that = this;
    var activityId = that.data.activityid;
    var params = { uid, store_id, page, activityId}
    
    app.api.postApi(listUrl, { params }, (err, resp) => {
      wx.hideLoading();
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
    // 拿到页码
    let page = that.data.page;
    // 获取current确定点击哪里
   let { current,activityid } = e.currentTarget.dataset;
    console.log(e,current,activityid);
    that.setData({
      current, activityid
    });
    // var activityid;
    // switch(current){
    //   case 0: activityid= 237;break;
    //   case 1: activityid = 237;break;
    //   case 2: activityid = 238;break;
    //   case 3: activityid = 239;break;
    //   case 4: activityid = 241;break;
    //   default: activityid = 237; break;
    // }
    // that.setData({ activityid})
    that.goHead(uid, store_id, page, activityid);
  },
  goDetail(e){
    var activityid = e.currentTarget.dataset.activityId;
    var id = e.currentTarget.dataset.id;
    var endTime = e.currentTarget.dataset.endTime
    var faceMoney = e.currentTarget.dataset.faceMoney
    var name = e.currentTarget.dataset.name
    var originalPrice = e.currentTarget.dataset.originalPrice
    var startTime = e.currentTarget.dataset.startTime
    var logo = e.currentTarget.dataset.logo
    var source = e.currentTarget.dataset.source
    wx.navigateTo({
      url: './card_summary?activityid=' + activityid + '&id=' + id + '&endTime=' + endTime + '&faceMoney=' + faceMoney + '&name=' + name + '&originalPrice=' + originalPrice + '&startTime=' + startTime + '&logo=' + logo + '&source=' + source
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