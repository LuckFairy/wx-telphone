// pages/shopping/order-detail.js
import { formatTime } from '../../utils/util';
import { store_Id } from '../../utils/store_id';
var app = getApp();
const log = 'order-detail.js --- ';

const orderUrl = 'wxapp.php?c=order&a=mydetail';    // 订单详情接口
const logisticsUrl = 'order/track/';  // 订单物流查询接口
let _orderId = '';
let _kuaidiCompanyCode , _kuaidiNumber, _kuaidiCompanyName;
let errModalConfig = {
  image: '../../image/ma_icon_store_1.png',
  title: '将二维码出示给门店核销员由门店员核销即可',
};

Page({
  data:{
    orderData: null, // 订单数据
    order_no:'',
    productId:'',
    rtnCode:'' ,
    orderTime:'',
    uid: '',
    storeId: store_Id.shopid,
    shipping_method: 'express',
    addressId: 0,
    postage_list: "",
    user_coupon_id: 0,
    is_app: false,
    payType: 'weixin',
    showErrModal: false,//错误模式层
    userTel:'',//收货人电话号码
    newType:1,//是否新品试用，1是，0否        
  },
  onLoad:function(options){
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    let { orderId, newTrial } = options;
    let { productId } = options;
    that.setData({
      orderId: orderId,
      productId: productId,
      newType: newTrial
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
    var orderProductId = e.currentTarget.dataset.orderProductId;

    console.log('orderId', orderId);
    console.log('orderProductId', orderProductId);
    var uid = this.data.uid;
    //判断是否能申请售后，如果可以才跳到售后界面
    var params = {
      "order_no": orderId, 
      "pigcms_id": orderProductId, 
      "uid": uid  
    };
    console.log('请求参数', params);
    var url = 'wxapp.php?c=return&a=checkReturn';
    app.api.postApi(url, { params }, (err, response) => {
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
        wx.navigateTo({
          url: '../sale-after/apply-sales?orderId=' + orderId + '&orderProductId=' + orderProductId + '&uid=' + uid
        })
      }
    });
    return; //后面是老的代码

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
  /**
 * 付款
 */
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
          //this._doPrePay(pigOrderId);
        }
      },
    });
  },
  _doPrePay(orderId) {

    let addressId = this.data.addressId;
    //let addressId = 47;
    let payType = this.data.payType;
    let is_app = this.data.is_app;
    //let postage_list = this.data.postage_list;
    let postage_list = "a:1:{i:6;d:0;}";
    let uid = this.data.uid;
    let store_id = this.data.storeId;
    let user_coupon_id = this.data.user_coupon_id;
    let shipping_method = this.data.shipping_method;
    //console.log('22222-addressId=' + addressId); //return;
    var params = {
      payType: payType,
      orderNo: orderId,
      is_app: is_app,
      postage_list: postage_list,
      shipping_method: shipping_method,
      address_id: addressId,
      uid: uid,
      store_id: store_id,
      user_coupon_id: 0,
    }
    //console.log('支付的请求参数=', params);return;
    app.api.postApi('wap/wxapp_saveorder.php?action=pay_xcx', { params }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 344444)
      var data = resp.err_msg;
      console.log(data);
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
    app.api.postApi(orderUrl, {"params": {"order_no": params } },(err,rep) => {
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
        var tel = rep.err_msg.orderdata.address_tel.substring(0, 3) + "****" + rep.err_msg.orderdata.address_tel.substring(8, 11);
        self.setData({
          orderData: rep.err_msg.orderdata,
          orderTime: formatTime(rep.err_msg.orderdata.add_time),
          uid: rep.err_msg.orderdata.uid,
          addressId: rep.err_msg.orderdata.address.address_id,
          postage_list: rep.err_msg.orderdata.postage,
          order_no: rep.err_msg.orderdata.order_no,
          shipping_method: rep.err_msg.orderdata.shipping_method,
          user_coupon_id: rep.err_msg.orderdata.user_coupon_id,
          userTel: tel
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
  },

  //2017年12月26日16:24:29 by leo 确认收货
  confirmDeliver(event) {
    let orderId = event.currentTarget.dataset.orderId;
    let uid = this.data.uid;

    console.log('确认收货订单号和用户id', orderId, uid);//return;

    wx.showModal({
      title: '确认收货',
      // content: `确认您的订单[${orderId}]已收到货了？`,
      content: `请确定已经收到货了哦，免得钱财两空`,
      showCancel: true,
      cancelText: '没呢',
      cancelColor: '#FF0000',
      confirmText: '确定收货',
      success: (res) => {
        if (res.confirm) {
          this._doConfirmDeliver(orderId, uid);
        }
      },
    });
  },
  /*新品试用，确认取货
  *
  */
  confirmNewGoods() {
    this.setData({ showErrModal: true });
    this.showModal('err', errModalConfig);
  },
  //查看 售后
  showSales() {
    console.log('购物车为空，去下单');
    //wx.reLaunch({ url: '../index-new/index-new' });
    wx.navigateTo({
      url: './my-order?goodsindex=' + 4
    })
  },
  _doConfirmDeliver(orderId, uid) {

    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.postApi('wxapp.php?c=order&a=receive', { "params": { "uid": uid, "order_no": orderId } }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      let rtnMessage = resp.err_msg.err_log;
      if (resp.err_code != 0) {
        return this._showError(rtnMessage);
      }
      // 跳转到已收货页面
      //this.setData({ curSwiperIdx: 2, curActIndex: 2 });
      // 刷新订单数据
      //this._loadOrderData();
      //跳到订单列表
      wx.navigateTo({
        url: './my-order?goodsindex=' + 3
      }) 

    });
  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
  },
  
  /**
 * 显示模态框
 */
  showModal(type = 'err', config) {  // type: success||err
    if (type === 'success') {
      this.setData({
        successModalConfig: config || successModalConfig,
        showSuccessModal: true
      });
    } else {
      this.setData({
        errModalConfig: config || errModalConfig,
        showErrModal: true
      });
    }
  },

  /**
   * 点击隐藏模态框(错误模态框)
   */
  tabModal() {
    this.setData({ showErrModal: false });
  },

  /**
   * 点击模态框的确定(关闭确定模态框)
   */
  tabConfirm() {
    this.setData({ showSuccessModal: false });
  },
  

})