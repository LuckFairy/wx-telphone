// pages/shopping/order-express.js
var app = getApp();
const log = 'order-express.js --- ';

const logisticsUrl = 'order/track/';  // 订单物流查询接口

Page({
  data:{
    kuaidiCompanyName: '',
    kuaidiNumber: '',
    kuaidiData: null
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let {kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName} = options;
    console.log(log + 'options');
    console.log(kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName);

    if(kuaidiCompanyCode && kuaidiNumber) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this._loadData(kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName);
    }
  },

  _loadData(kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName) {
    app.api.postApi(logisticsUrl, {kuaidiCompanyCode, kuaidiNumber}, (err, kuaidiData) => {
      wx.hideLoading();
        if(!err && kuaidiData.rtnCode == 0) {
          console.log(log + '查询快递接口返回成功');
          console.log(kuaidiData);

          this.setData({
            kuaidiCompanyName,
            kuaidiNumber,
            kuaidiData: kuaidiData.data.reverse()
          });
        } else {
          console.log(log + '查询快递接口返回错误');
          console.log(err);
        }
      });
  },
  pay(event) {
    let orderId = event.currentTarget.dataset.orderId;
    wx.showModal({
      title: '订单付款',
      content: `确认为订单[${orderId}]进行支付？`,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#FF0000',
      confirmText: '马上支付',
      success: (res) => {
        if (res.confirm) {
          this._doPrePay(orderId);
        }
      },
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