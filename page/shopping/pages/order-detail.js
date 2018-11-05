import { formatTime } from '../../../utils/util';
var app = getApp();
const orderUrl = 'wxapp.php?c=order&a=mydetail';    // 订单详情接口
const logisticsUrl = 'order/track/';  // 订单物流查询接口
let _orderId = '';
let _kuaidiCompanyCode, _kuaidiNumber, _kuaidiCompanyName;
let errModalConfig = {
  image: '../../image/ma_icon_store_1.png',
  title: '将二维码出示给门店核销员由门店员核销即可',
};
// orderId = 20180919143520383544 & productId=1985 & newTrial=0
Page({
  data: {
    orderData: null, // 订单数据
    order_no: '',
    productId: '',
    rtnCode: '',
    orderTime: '',
    uid: '',
    storeId: app.store_id,
    shipping_method: 'express',
    addressId: 0,
    postage_list: "",
    user_coupon_id: 0,
    is_app: false,
    payType: 'weixin',
    showErrModal: false,//错误模式层
    userTel: '',//收货人电话号码
    newType: 0,//是否新品试用，1是，0否     
    send_type: 1,//1邮寄，2自提   
    physical_info: null,//自提門店信息
  },
  onLoad: function (options) {
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    let { orderId, newTrial, productId } = options;
    that.setData({
      orderId: orderId,
      productId: productId,
      newType: newTrial
    })

    if (orderId) {
      _orderId = orderId;
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this._loadData(orderId);
    }
  },
  /**
 * 自提二维码
 */
  goErwei(e) {
    let { orderId, physical } = e.currentTarget.dataset;
    physical = JSON.stringify(physical);
    if (!orderId) { return; }
    wx.navigateTo({
      url: `../../my/pages/erwei?order_no=${orderId}&physical_info=${physical}`,
    })
  },
  // 查看售后
  searchSales() {
    wx.redirectTo({
      url: '../../common/pages/my-order?page=5'
    })
  },
  // 再次购买了
  timesBuy(e) {
    wx.switchTab({
      url: '../../tabBar/home/index-new'
    })

  },
  goSales(e) {
    var that = this;
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
          url: '../../my/pages/apply-sales?orderId=' + orderId + '&orderProductId=' + orderProductId + '&uid=' + uid
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
          url: '../../my/pages/apply-sales?orderId=' + orderId + '&productId=' + productId + '&rtnCode=' + rtnCode
        })
      } else {
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
    this.setData({
      orderId: orderId,
    })
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
    let postage_list = this.data.postage_list;
    //let postage_list = "a:1:{i:6;d:0;}";
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
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.postApi('wap/wxapp_saveorder.php?action=pay_xcx', { params }, (err, resp) => {
      wx.hideLoading();
      //console.log(resp, 344444)
      var data = resp.err_msg;
      //console.log(data);
      // 调起微信支付

      if (resp.err_code != 0) {
        //console.log('不能支付，原因是：', data)

        wx.showModal({
          title: '支付失败',
          content: data,
          confirmText: '好的',
        });
      } else {
        // 调起微信支付
        if (resp.err_dom) {

          //console.log('不需要支付');

          wx.navigateTo({
            url: '../../common/pages/my-order?page=' + 2
          })
        } else {

          //console.log('需要支付');

          // 调起微信支付
          this._startPay(data);
        }
      }


    });

  },

  /**
   * 调起微信支付
   */
  _startPay(payParams) {
    let param = {
      timeStamp: payParams.timeStamp + "",
      nonceStr: payParams.nonceStr,
      //"package": "prepay_id=" + payParams.prepayId,
      "package": payParams.package,
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
    //2018年1月8日14:31:34
    wx.removeStorageSync('couponInfo');
    this.giveCard(this.data.orderId);

    // setTimeout(() => {
    //   // 跳转到待收货页面
    //   this.setData({ curSwiperIdx: 1, curActIndex: 1 });
    //   // 刷新订单数据
    //   this._loadOrderData();
    // }, 1000);

    //跳到订单列表 待收货
    wx.navigateTo({
      url: '../../common/pages/my-order?page=' + 2
    })


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

  goGoods(e) {
    wx.showModal({
      title: '确认收货',
      content: '请确保你先收到货了，避免钱财两空哦',
      success: function (res) {
        if (res.confirm) {
          var orderId = e.currentTarget.dataset.orderid;
          app.api.fetchApi("order/complete/" + orderId, (err, resp) => {
            if (resp) {
              wx.navigateTo({
                url: './my-order?page=' + 3
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
    let self = this;
    let params = orderId;
    if (!orderId.includes('PIG')) {
      params = 'PIG' + orderId;
    }
    app.api.postApi(orderUrl, { "params": { "order_no": params } }, (err, rep) => {
      wx.hideLoading();
      if (rep.err_code != 0) {
        wx.showToast({
          title: rep.err_msg,
        })
        setTimeout(function () {
          wx.navigateBack();
        }, 2000)

      }
      if (!err && rep.err_code == 0) {
        let { orderdata } = rep.err_msg;
        if (orderdata.send_type != 2) {
          let tel = orderdata.address_tel.substring(0, 3) + "****" + orderdata.address_tel.substring(8, 11);
          self.setData({ userTel: tel });
        } else {//自提
          let physical_info = {
            name: orderdata.take_physical_name,
            id: orderdata.take_physical_id,
            address: orderdata.take_physical_address
          }
          self.setData({ physical_info });
        }

        self.setData({
          orderData: orderdata,
          send_type: orderdata.send_type,
          orderTime: formatTime(orderdata.add_time),
          uid: orderdata.uid,
          addressId: orderdata.address.address_id,
          postage_list: orderdata.postage,
          order_no: orderdata.order_no,
          shipping_method: orderdata.shipping_method,
          user_coupon_id: orderdata.user_coupon_id,
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

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
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
  confirmNewGoods(e) {
    var trial_product_qrcode = e.currentTarget.dataset.qrcode;
    trial_product_qrcode = trial_product_qrcode.replace(/\\/g, '');
    this.showModal('err', { image: trial_product_qrcode });
  },
  //查看 售后
  showSales() {
    console.log('购物车为空，去下单');
    //wx.reLaunch({ url: '../../tabBar/pages/index-new' });
    wx.navigateTo({
      url: '../../common/pages/my-order?page=5'
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
        url: '../../common/pages/my-order?page=' + 3
      })

    });
  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
  },

  /**
 * 显示模态框
 */
  /**
  * 显示模态框
  */
  showModal(type = 'err', config) {  // type: success||err
    if (type === 'success') {
      successModalConfig = Object.assign(successModalConfig, config);
      this.setData({
        successModalConfig: successModalConfig,
        showSuccessModal: true
      });
    } else {
      errModalConfig = Object.assign(errModalConfig, config);
      this.setData({
        errModalConfig: errModalConfig,
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

  /**
* 购买给卡包
*/
  giveCard: function (order_no) {

    var params = {
      order_no: order_no
    };
    app.api.postApi('wxapp.php?c=order&a=save_card_set', { params }, (err, resp) => {
      // if (err) return;
      // if (resp.err_code != 0) {
      //   wx.showLoading({
      //     title: resp.err_msg,
      //   })
      // } else {
      //   wx.hideLoading();
      //   console.log(resp, 1111111)
      //   var data = resp.err_msg;
      //   console.log('获取第一行的图标', data);
      //   this.setData({ iconOne: data });
      // }
    });
  },
})