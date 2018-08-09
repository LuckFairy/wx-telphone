// pages/cluster/cluster-success.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userdata: {},
    hotshop: {},
    prodId: null,
    groupbuyId: null,
  },
  goGrounpTab(){
    wx.navigateTo({
      url: '../../group-buying/grouplist'
    })
  },
  shopDetail(){

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var prodId = options.prodId;
    var groupbuyId = options.groupbuyId;
    var groupbuyOrderId = options.Groupbuy_order_id;
    var orderId = options.orderId;
    this.setData({
      prodId: prodId,
      groupbuyId: groupbuyId
    });  
    var that = this;
    var datalist = 'Order/GroupDetail';
    app.api.postApi(datalist, { groupbuyOrderId, orderId }, (err, resp) => {  
      if (err) {
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 2000
        })
      } else if (resp) {
        var userlist = [];
        userlist.push(resp.data);
        that.setData({
          userdata: userlist[0]
        })
      }
    });

    var product_type = 2;  //拼团商品推荐
    let url = 'shop/hotLists';
    app.api.postApi(url, { product_type }, (err, response) => {
      //app.api.fetchApi('shop/hotsale/2', (err, response) => {
      wx.hideLoading();
      if (err) return;
      let { rtnCode, rtnMessage, data } = response;
      if (rtnCode != 0) return;
      let hotsaleGoing = data;
      this.setData({ hotsaleGoing });
    });




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

  },

  //跳到拼团商品详情页
  goGroupDetail(e) {
    var prodId = e.currentTarget.dataset.productid;
    var groupbuyId = e.currentTarget.dataset.groupbyid;
    var selldetail = e.currentTarget.dataset.selldetail;
    wx.navigateTo({
      //url: '../group-buying/group-buying?prodId={{item.productId}}&groupbuyId={{item.groupbuyId}}&sellout={{datasellin}}'
      url: '../../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + selldetail
    })
  }, 
  
   
})