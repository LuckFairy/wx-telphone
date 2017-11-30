// pages/cluster/cluster.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userDataList:{},
    hotshop:{},
    groupId: '',
    groupbuyOrderId:'',
    groupbuyId: '',
    orderid:''
  },
  goSeachGrounp(ev) {
    console.log(ev,22222222222)
    var statusNum = ev.currentTarget.dataset.statusnum;
    var groupId = ev.currentTarget.dataset.id;
    var groupbuyId = ev.currentTarget.dataset.groupbuyid;
    var groupbuyOrderId = ev.currentTarget.dataset.groupbuyorderid;
    var orderid = ev.currentTarget.dataset.orderid;
    console.log(groupId, groupbuyOrderId,11111);
    wx.navigateTo({
      url: "../cluster/cluser-wait?productId=" + groupId + "&Groupbuy_order_id=" + groupbuyOrderId + "&statusNum=" + statusNum + "&groupbuyId=" + groupbuyId + "&orderid=" + orderid
    })
  },
  goRefund(){
    wx.navigateTo({
      url: '../sale-after/purchase-refund',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this;
    console.log(options,1233211221);
    var orderid = options.orderid;
    that.setData({
      orderid: orderid
    })
    var groupId = options.productId;
    var groupbuyId = options.groupbuyId;
    var groupbuyOrderId = options.Groupbuy_order_id;
    var datalist = 'Order/OrderDetail/' + groupbuyOrderId + "/" + orderid
    app.api.fetchApi(datalist, (err, resp) => {
      if(err){
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 2000
        })
      } else if (resp){
        console.log(resp,555555555555)
        var userlist = resp.data;
        console.log(resp.data,33333333)
        var userDataList=[];
        userDataList.push(resp.data);
        console.log(userDataList[0],11122121211)
        that.setData({
          userDataList: userDataList[0],
          groupId: groupId,
          groupbuyOrderId: groupbuyOrderId,
          groupbuyId: groupbuyId
        })
      }
    })

    var product_type = 2;  //拼团商品推荐
    let url = 'shop/hotLists';
    app.api.postApi(url, { product_type }, (err, response) => {
      //app.api.fetchApi('shop/hotsale/2', (err, response) => {
      wx.hideLoading();
      if (err) return;
      let { rtnCode, rtnMessage, data } = response;
      if (rtnCode != 0) return;
      console.log('购物车下面的推荐数据：');
      console.log(data);
      //let hotsaleGoing = [], hotsaleIncoming = [];
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
    //console.log(e);
    var prodId = e.currentTarget.dataset.productid;
    var groupbuyId = e.currentTarget.dataset.groupbyid;
    var selldetail = e.currentTarget.dataset.selldetail;
    wx.navigateTo({
      //url: '../group-buying/group-buying?prodId={{item.productId}}&groupbuyId={{item.groupbuyId}}&sellout={{datasellin}}'
      url: '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + selldetail
    })
  },  
})