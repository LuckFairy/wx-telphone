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
    showHide:true,
    isSale:true
  },
  calling(){
    app.calling();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options,334433);
    var orderId = options.orderId;
    var orderProductId = options.orderProductId;
    var uid = options.uid;
    that.setData({
      orderId: orderId,
      orderProductId: orderProductId,
      uid: uid
    })

    var params = {
      "order_no": orderId,
      "pigcms_id": orderProductId,
      "uid": uid
    };
    console.log('请求参数', params);
    var url = 'wxapp.php?c=return&a=applyReturn';
    app.api.postApi(url, { params }, (err, response) => {
      console.log('applyReturn接口返回数据=', response);
      if (err) return;
      if (response.err_code != 0) {

        wx.showModal({
          title: '错误提示',
          content: response.err_msg.err_log,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#FF0000',
          confirmText: '好的',
        });


      } else {
        wx.hideLoading();
        var product = response.err_msg.returndata;
        console.log('商品信息', product);
        that.setData({
          dataList: product
        })
      }
    });

  },
  // 提交申请
  goSubmit(e) {
    var that = this;
    var turnStatus = e.target.dataset.status;
    //var orderId = this.data.orderId;
    var orderProductId = this.data.orderProductId;
    var orderId = this.data.orderId;
    var uid = this.data.uid;
    that.setData({
      isSale: false,
    })

    if (turnStatus == null) {
      wx.showToast({
        title: '请选择服务类型',
        icon: 'loading',
        duration: 2000
      })
    } else {
      setTimeout(() => {
        var params = {
          "order_no": orderId,
          "pigcms_id": orderProductId,
          "uid": uid,
          "type": turnStatus
        };
        console.log('请求参数', params);
        var url = 'wxapp.php?c=return&a=doReturn';
        app.api.postApi(url, { params }, (err, resp) => {
          if (resp.err_code == 0) {
            that.setData({
              isSale: false,
              showHide: false
            })
            wx.showToast({
              title: '提交成功',
              icon: 'loading',
              duration: 1500
            })
          } else {
            that.setData({
              isSale: true,
            })
          }
        });
      }, 1000)
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