// pages/sale-after/apply-sales.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    turnStatus:null,
    dataList:'',
    orderId:'',
    productId:'',
    rtnCode:'',
    showHide:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options,334433);
    var orderId = options.orderId;
    var productId = options.productId;
    var rtnCode = options.rtnCode;
    that.setData({
      orderId: orderId,
      productId: productId,
      rtnCode: rtnCode
    })
    //order/info 拿到订单数据
    app.api.fetchApi("order/info/" + orderId, (err, resp) => {
            if (resp) {
              var dataList = resp.data.products[0];
              that.setData({
                dataList: dataList
              })
              console.log(dataList,555555);
            }
          })
  },
  // 提交申请
  goSubmit(e){
    var that = this;
    var turnStatus = e.target.dataset.status;
    var orderId = e.target.dataset.orderId;
    var productId = e.target.dataset.productId;
    console.log("提交申请之后");
    console.log(turnStatus, orderId,productId)
    if (turnStatus==null){
      wx.showToast({
        title: '请选择服务类型',
        icon: 'loading',
        duration: 2000
      })
    }else{
      app.api.postApi('order/doReturn', { 'order_id': orderId, 'product_id': productId, 'c_status_id': turnStatus }, (err, resp) => {
        if (resp) {
          console.log("提交申请之后", resp);
          wx.showModal({
            title: '提交申请成功',
            content: '加客服微信可加快处理速度哦',
            success: function (res) {
              if (res.confirm) {
                that.setData({
                  showHide:false
                })
              } else if (res.cancel) {
                that.setData({
                  showHide: false
                })
              }
            }
          })
        }
      });
    }
    
  },
  // 选择服务类型
  turnColor(e){
    var that = this;
    var turnStatus = e.target.dataset.status;
    console.log(turnStatus,333)
    that.setData({
      turnStatus: turnStatus
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