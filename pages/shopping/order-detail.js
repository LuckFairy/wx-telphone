// pages/shopping/order-detail.js
import { formatTime } from '../../utils/util';
var app = getApp();
const log = 'order-detail.js --- ';

const orderUrl = 'wxapp.php?c=order&a=mydetail';    // 订单详情接口
const logisticsUrl = 'order/track/';  // 订单物流查询接口
let _orderId = '';
let _kuaidiCompanyCode , _kuaidiNumber, _kuaidiCompanyName;

Page({
  data:{
    orderData: null, // 订单数据
    orderId:'',
    productId:'',
    rtnCode:'' ,
     orderTime:'',        
  },
  onLoad:function(options){
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    let { orderId } = options;
    let { productId } = options;
    that.setData({
      orderId: orderId,
      productId: productId
    })
    // 检测是否已经提交过申请
    // app.api.postApi('order/checkReturn', { "order_id": orderId}, (err, resp) => {
    //   if (err) {
    //     return this._showError('网络出错，请稍候重试');
    //   }
    //   var rtnCode = resp.rtnCode;
    //   if (rtnCode==-1){
    //     that.setData({
    //       rtnCode: rtnCode
    //     })
    //   }
    // });
    // 检测是否已经提交过申请结束
    
    if(orderId) {
      _orderId = orderId;
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this._loadData(orderId);
    }
  },
  // 查看售后
  searchSales() {
    wx.redirectTo({
      url: './my-order?listsIndex=4'
    })
  },
  // 再次购买了
  timesBuy(e){
    wx.switchTab({
      url: '../index-new/index-new'
    })

  },
  goSales(e){
    var that =this;
    var orderId = e.currentTarget.dataset.orderId;
    var productId = e.currentTarget.dataset.productId;
    var rtnCode = e.currentTarget.dataset.rtnCode;
    // 检测是否已经提交过申请
    app.api.postApi('order/checkReturn', { "order_id": orderId }, (err, resp) => {
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      var rtnCode = resp.rtnCode;
      if (rtnCode == -1) {
        that.setData({
          rtnCode: rtnCode
        })
        wx.navigateTo({
          url: '../sale-after/apply-sales?orderId=' + orderId + '&productId=' + productId + '&rtnCode=' + rtnCode
        })
      }else{
        wx.showModal({
          title: '申请提示',
          content: '您已经提交过申请',
          success: function (res) {
            if (res.confirm) {
            } else if (res.cancel) {
            }
          }
        })
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
  _doPrePay(orderId) {
    let url = 'order/pay/' + orderId;
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.postApi(url, null, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);;
      }

      // 调起微信支付
      this._startPay(data);
    });
  },

  /**
   * 调起微信支付
   */
  _startPay(payParams) {
    let param = {
      timeStamp: payParams.timeStamp + "",
      nonceStr: payParams.nonceStr,
      "package": "prepay_id=" + payParams.prepayId,
      signType: 'MD5',
      paySign: payParams.paySign,
      success: res => this._onPaySuccess(res),
      fail: err => this._onPayFail(err)
    };
    wx.requestPayment(param);
  },

  /**
   * 支付成功
   */
  _onPaySuccess(res) {
    wx.showToast({ title: "订单支付成功", icon: "success", duration: 1000 });

    setTimeout(() => {
      // 跳转到待收货页面
      this.setData({ curSwiperIdx: 1, curActIndex: 1 });
      // 刷新订单数据
      this._loadOrderData();
    }, 1000);
  },

  /**
   * 支付失败
   */
  _onPayFail(err) {
    wx.showModal({
      title: '支付失败',
      content: '订单支付失败，请刷新订单列表，重新尝试',
      confirmText: '好的',
    });
  },
 
  goGoods (e) {
    wx.showModal({
      title: '确认收货',
      content: '请确保你先收到货了，避免钱财两空哦',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.orderid;
          app.api.fetchApi("order/complete/" + orderId, (err, resp) => {
            if (resp) {
              wx.navigateTo({
                url: './my-order?goodsindex='+3
              })
            }
          })
        } else if (res.cancel) {
          return false;
        }
      }
    })
    
  },
  /**
   * 获取订单详情数据
   */
  _loadData(orderId) {
    // app.api.fetchApi(orderUrl + orderId, (err, data) => {   // 赠品领用提交
    //   if(!err && data.rtnCode == 0) {
    //     let {kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName} = data.data;
    //     [_kuaidiCompanyCode, _kuaidiNumber, _kuaidiCompanyName] = [kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName];

    //     if(kuaidiCompanyCode && kuaidiNumber) {
    //       app.api.postApi(logisticsUrl, {kuaidiCompanyCode, kuaidiNumber}, (err, kuaidiData) => {
    //         wx.hideLoading();
    //         if(!err && kuaidiData.rtnCode == 0) {
    //           this.setData({
    //             orderData: data.data,
    //             kuaidiData: kuaidiData.data
    //           });
    //         } else {
    //           this.setData({
    //             orderData: data.data,
    //             kuaidiData: null
    //           });
    //         }
    //       });
    //     } else {
    //       wx.hideLoading();
    //       this.setData({
    //         orderData: data.data,
    //         kuaidiData: null
    //       });
    //     }
    //   } else {
    //   }
    // });

    //2017-12-16amy
    var self = this;
    // var pages = getCurrentPages();
    // console.log('pages ',pages);
    var params = orderId;
    if (! orderId.includes('PIG')){
       params = 'PIG' + orderId;
    }
    app.api.postApi(orderUrl, {
      "params": {
        "order_no": params } },(err,rep) => {
      wx.hideLoading();
      if (rep.err_code != 0){
        wx.showToast({
         title : rep.err_msg,
        })
        setTimeout(function () {
          wx.navigateBack();
        }, 2000)
        
      }
      if(!err && rep.err_code==0){
  
        self.setData({
          orderData: rep.err_msg.orderdata,
          orderTime: formatTime(rep.err_msg.orderdata.add_time)
        });
        
      }
    })
  },
  
  /**
   * 查看快递信息
   */
  // pushToKuaiDi() {
  //   wx.navigateTo({
  //     url: `./order-express?kuaidiCompanyCode=${_kuaidiCompanyCode}&kuaidiNumber=${_kuaidiNumber}&kuaidiCompanyName=${_kuaidiCompanyName}`
  //   });
  // },
  
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