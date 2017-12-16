// pages/shopping/my-order.js
/*
const ORDER_STATUS_DEFAULT = 0;   // 订单状态 已提交
const ORDER_STATUS_FINISHED = 1;  // 订单状态 已结单
const ORDER_STATUS_CANCELED = 2;  // 订单状态 已取消

const PAY_STATUS_NO_NEED = 0;   // 支付状态 无须支付
const PAY_STATUS_UN_PAY  = 1;   // 支付状态 未支付
const PAY_STATUS_PAYING  = 2;   // 支付状态 支付中
const PAY_STATUS_SUCCESS = 3;   // 支付状态 支付成功
const PAY_STATUS_FAILED  = 4;   // 支付状态 支付失败

const DELIVER_STATUS_NO_NEED = 0;  // 物流状态 无须发货
const DELIVER_STATUS_UN_SEND = 1;  // 物流状态 未发货
const DELIVER_STATUS_SEND    = 2;  // 物流状态 已发货
const DELIVER_STATUS_GOT     = 3;  // 物流状态 已收货
*/
const ORDER_STATUS_MOMENT = 0;    // 临时
const ORDER_STATUS_PENDING = 1;    // 待处理（待付款）
const ORDER_STATUS_PROCESSING = 2;    // 处理中（待发货）
const ORDER_STATUS_SHIPPED = 3;    // 已发货
const ORDER_STATUS_COMPLETE = 4;    // 已完成
const ORDER_STATUS_CANCELED = 5;    // 已取消
const ORDER_STATUS_REFUNDING = 6;   //退款中
const ORDER_STATUS_RECEIVED = 7;   //已收货
const ORDER_STATUS_DENIED = 8;    // 已拒绝（赠品申请时可拒绝）
const ORDER_STATUS_FAILED = 10;   // 失败
const ORDER_STATUS_UNCHECK = 17;   // 待审核（赠品申请时，订单状态为待审核）

/*
order_status_id	name	name
1   等待处理	Pending
2	  处理中	  Processing
3	  已配送	  Shipped
5	  完成	   Complete
7	  已取消	  Canceled
8	  已拒绝	  Denied
9	  撤销取消	Canceled Reversal
10	失败	   Failed
11	已退款	   Refunded
12	已撤单　	Reversed
13	拒付	   Chargeback
14	失效	   Expired
15	已处理	   Processed
16	无效	   Voided
*/
// 订单分类type
/*
order_type  name
unpay        待付款
unsend      待发货
send        待收货
complete    已完成
all         全部
*/
/*订单状态码id
order_status_id		name
0     临时
1     未支付
2     未发货
3     已发货
4     已完成
5     已取消
6     退款中
7     已收货
*/


const util = require('../../utils/util.js');
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
var app = getApp();


Page({
  data: {
    allOrders : [],     //全部订单
    momentOrders: [],   //临时
    unpayOrders: [],    //待付款 （待支付订单）
    //processingOrders:[], //待发货
    shippedOrders:[],   //已发货
    finishedOrders: [], // 已完成
    canceledOrders:[],  //已取消
    refundingOrders:[],   //退款中
    ReceivedOrders:[],  //已收货
    transOrders: [],    // 待收货(已发货)

    showOverlay: false, // 弹窗遮掩层
    checkQrImgUrl: null,   // 赠品领用核销二维码url
    uncheckOrders: [],  // 待审核订单（赠品）
    groupOrders: [], // 团购订单
    groupbuyOrders: [], // 团购订单 使用新接口获取如果这个可以的话，就不用groupOrders了
    currentTab: 0,
    showclose: true,
    waitOrders: [],  //待成团
    endOrders: [],  //已成团
    failOrders: [],  //已成团
    curSwiperIdx: '',
    curActIndex: '',
    showshare:false,
    groupbuyId:'',
    groupbuyOrderId:'',
    prodId:'',
    uid:'',
    storeId: store_Id.shopid,
    // 购买成功后的分享，丢弃……
    // groupbuyOrderIdShare:"",
    // groupbuyIdShare:"",
    // prodIdShare:"",
    // flag:"",
    // imgName:"",
    // imgUrl:"",
    // showSale:true,
    // dataList:''
    shipping_method: 'express',
    addressId: 0,
    postage_list:"",
    user_coupon_id: 0,
    is_app: false,
    payType: 'weixin'
  },
  onLoad: function (options) {
    var that = this;
    var groupbuyId = options.groupbuyId;
    var groupbuyOrderId = options.groupbuyOrderId;
    var prodId = options.prodId;
    var listsIndex = options.listsIndex;

    var orderstatus = options.orderstatus;
    var groundBuy=options.groundBuy;
    var group = options.group;
    var list = options.list;
    var goodsindex = options.goodsindex;

    Api.signin();//获取以及存储openid、uid
    // 获取uid
    let uid = wx.getStorageSync('userUid');
    // let uid = 7;
    
    // 页面初始化 options为页面跳转所带来的参数
    let { page = 0 } = options;
    this.setData({ curSwiperIdx: page, curActIndex: page, currentTab: 0, groupbuyId: groupbuyId, groupbuyOrderId: groupbuyOrderId, prodId: prodId , uid: uid});
    wx.getStorage({
      key: 'showclose',
      success: function (res) {
        that.setData({
          showclose: res.data
        })
      }
    })
    // 判断是否从“我的”页面跳到拼团
    if (group == 0) {
      that.setData({ curSwiperIdx: 1, curActIndex: 1, currentTab: 0 });
    }
    if(list==0){
      that.setData({ curSwiperIdx: 0, curActIndex: 0});
    }else if(list==1){
      that.setData({ curSwiperIdx: 1, curActIndex: 1, currentTab: 1 });
    } else if (list == 2) {
      that.setData({ curSwiperIdx: 2, curActIndex: 2});
    } else if (list == 3) {
      that.setData({ curSwiperIdx: 3, curActIndex: 3 });
    } else if (orderstatus==2){
      that.setData({ curSwiperIdx: 2, curActIndex: 2 });
    } else if (list == 4){
      that.setData({ curSwiperIdx: 4, curActIndex: 4 });
    }
    else if (groundBuy == 1) { 
      //拿到点击了“不再提醒”后的存储值，以后都不再显示这个分享框
      var stoList = wx.getStorageSync("showshare");
      if (stoList == "false"){
          that.setData({
            showshare : false
          })
      }else{
          that.setData({
            showshare : true
          })
      }
      that.setData({
        curSwiperIdx: 1,
        curActIndex: 1,
        currentTab: 1,
      });
    }
    else if (orderstatus == 2) {
      that.setData({ curSwiperIdx: 2, curActIndex: 2});
    } else if (listsIndex ==4){
      that.setData({ curSwiperIdx: 4, curActIndex: 4 });
    }
    // 确认收货跳转
    this.setData({ curSwiperIdx: goodsindex, curActIndex: goodsindex});
    // 退换售后开始
    //that.listReturnFun();
  },
  listReturnFun:function(){
    var that = this;
    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi('order/listOfReturn', {}, (err, resp) => {
      if (resp) {
        if (resp.rtnCode == 0) {
          wx.hideLoading();
          var dataList = resp.data;
          var dataList = [];
          dataList.push(resp.data)
          that.setData({
            showSale: false,
            dataList: dataList
          })
        } else {
          that.setData({
            showSale: true
          })
        }

      }
    });
  },
  goDetail(e){
    var theId = e.target.dataset.theId;
    wx.navigateTo({
      url: '../sale-after/purchase-detail?theId=' + theId
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this._loadOrderData();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  swiperChange: function (event) {
    var that =this;
    this.setData({
      curActIndex: event.detail.current
    });
    if (event.detail.current==4){
      //that.listReturnFun();
    }
  },
  swichSwiperItem: function (event) {
    var that =this;
    this.setData({
      curSwiperIdx: event.target.dataset.idx,
      curActIndex: event.target.dataset.idx
    });
    if (event.detail.current == 4) {
      //that.listReturnFun();
    }
  },
  // showExpressInfo: function (e) {
  //   let { kuaidiCompanyCode, kuaidiNumber, kuaidiCompanyName } = e.currentTarget.dataset;
  //   wx.navigateTo({
  //     url: `./order-express?kuaidiCompanyCode=${kuaidiCompanyCode}&kuaidiNumber=${kuaidiNumber}&kuaidiCompanyName=${kuaidiCompanyName}`
  //   });
  // },
  //不再提醒
  noPrompt() {
    var that = this;
    that.setData({
      showshare: false,
    })
    var stoList = false;
    wx.setStorageSync('showshare', stoList);
  },
  //知道了
  know() {
    this.setData({
      showshare: false
    });
  },
  
  goSeachGrounp(event) {
    var groupbuyOrderId = event.currentTarget.dataset.groupbuyorderid;
    var groupStatus = event.currentTarget.dataset.status;
    var groupId = event.currentTarget.dataset.id;
    var groupbuyId = event.currentTarget.dataset.groupbuyid;
    var orderId = event.currentTarget.dataset.order;
    if (groupStatus == 2) {
      wx.navigateTo({
        url: '../cluster/cluster-success?Groupbuy_order_id=' + groupbuyOrderId + "&groupbuyId=" + groupbuyId + "&prodId=" + groupId + "&orderId=" + orderId
      })
    } else if (groupStatus == 3) {
      wx.navigateTo({
        //url: "../cluster/cluser-wait?productId="+groupId+"&Groupbuy_order_id="+groupbuyOrderId
        url: "../cluster/cluser-wait?productId=" + groupId + "&Groupbuy_order_id=" + groupbuyOrderId + "&statusNum=" + groupStatus + "&groupbuyId=" + groupbuyId + "&orderId=" + orderId
      })
    }

  },
  goSearOrderlist(e) {
    var that = this;
    var groupbuyOrderId = e.currentTarget.dataset.groupbuyorderid;
    var orderid = e.currentTarget.dataset.order;
    var status = e.currentTarget.dataset.status;
    var groupId = e.currentTarget.dataset.id;
    var groupbuyId = e.currentTarget.dataset.groupbuyid;
    if (status == 1 || status == 3) {
      wx.navigateTo({
        url: "../cluster/failed?productId=" + groupId + "&Groupbuy_order_id=" + groupbuyOrderId + "&groupbuyId=" + groupbuyId + "&orderid=" + orderid
      })
    } else {
      that.setData({
        curSwiperIdx: 2,
        curActIndex: 2
      });
    }

  },

  /**
   * 加载订单数据 //加载订单数据，新接口使用post方法
   * onLoaded: 加载成功回调函数
   * opt是传过来的参数type(类型),page（页码）,store_id（店铺id),uid(用户id)
   */
  _loadOrderData(onLoaded , opt) {
    wx.showLoading({ title: '加载中...', mask: true, });
    //新方法
    var params = Object.assign({ "uid": this.data.uid, store_id: this.data.storeId },opt);
    console.log('params ', params)
    app.api.postApi("wxapp.php?c=order_v2&a=order_list", { "params": params }  , (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      console.info('订单数据 ',resp)
      let { err_code, err_msg: {next_page , order_list = []} } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }

      let allOrders = [], momentOrders = [], unpayOrders = [], processingOrders = [], shippedOrders = [], finishedOrders = [],
         canceledOrders = [], refundingOrders = [], uncheckOrders = [], ReceivedOrders = [],groupOrders = [], 
         groupbuyOrders = [], transOrders = [];
      order_list.forEach(item => {
        allOrders.push(item);
        let status = item.status;
        if (status == ORDER_STATUS_MOMENT  ){     //临时
          momentOrders.push(item);
        } if (status == ORDER_STATUS_PENDING) { //待付款
          unpayOrders.push(item);
        } else if (status == ORDER_STATUS_PROCESSING ) {//待发货
          processingOrders.push(item);
        }  else if (status == ORDER_STATUS_SHIPPED  ) {//已发货
          transOrders.push(item);
        } else if (status == ORDER_STATUS_COMPLETE  ){//已完成
          finishedOrders.push(item);
        } else if (status == ORDER_STATUS_CANCELED  ){//已取消
          canceledOrders.push(item);
        } else if (status == ORDER_STATUS_REFUNDING  ){//退款中
          refundingOrders.push(item)
        } else if (status == ORDER_STATUS_RECEIVED ) {// //已收货
          ReceivedOrders.push(item);
        }

        let typeOrder = item.groupbuyOrderId;//团购，新接口不使用
        if (typeOrder != 0) {
          groupOrders.push(item);
        }

      });
      //2017年9月18日14:51:15 调用新接口，获取团购订单列表
      //this.loadGroupbuyOrder();
      //====end
      console.log('unpayOrders ', unpayOrders, 'transOrders ', transOrders);
      this.setData({ allOrders, momentOrders, unpayOrders, processingOrders, transOrders, finishedOrders, uncheckOrders, groupOrders });
      typeof onLoaded === 'function' && onLoaded();
    });
    // app.api.fetchApi("order/ls", (err, resp) => {
    //   wx.hideLoading();
    //   if (err) {
    //     return this._showError('网络出错，请稍候重试');
    //   }

    //   let { rtnCode, rtnMessage, data = [] } = resp;
    //   if (rtnCode != 0) {
    //     return this._showError(rtnMessage);
    //   }

    //   let unpayOrders = [], transOrders = [], finishedOrders = [], uncheckOrders = [], groupOrders = [], groupbuyOrders = [];
    //   data.forEach(item => {
    //     let status = item.orderStatusId;
    //     if (status == ORDER_STATUS_PENDING) {
    //       unpayOrders.push(item);
    //     } else if (status == ORDER_STATUS_PROCESSING || status == ORDER_STATUS_SHIPPED) {
    //       transOrders.push(item);
    //     } else if (status == ORDER_STATUS_COMPLETE) {
    //       finishedOrders.push(item);
    //     } else if (status == ORDER_STATUS_UNCHECK) {
    //       item.orderStatusId = 2;
    //       item.shippingMethod = 'pickup.pickup'
    //       transOrders.push(item);
    //     }

    //     let typeOrder = item.groupbuyOrderId;
    //     if (typeOrder != 0) {
    //       groupOrders.push(item);
    //     }


    //   });
    //   //2017年9月18日14:51:15 调用新接口，获取团购订单列表
    //   this.loadGroupbuyOrder();
    //   //====end
    //   this.setData({ unpayOrders, transOrders, finishedOrders, uncheckOrders, groupOrders });
    //   typeof onLoaded === 'function' && onLoaded();
    // });
  },

  /**
   * 确认收货
   */
  confirmDeliver(event) {
    let orderId = event.currentTarget.dataset.orderId;
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
          this._doConfirmDeliver(orderId);
        }
      },
    });
  },
  switchtap(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
    })
  },
  _doConfirmDeliver(orderId) {
    let url = 'order/complete/' + orderId;
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.fetchApi(url, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }

      // 跳转到已收货页面
      this.setData({ curSwiperIdx: 2, curActIndex: 2 });
      // 刷新订单数据
      this._loadOrderData();
    });
  },

  /**
   * 删除订单
   */
  delOrder: function (event) {
    let orderId = event.currentTarget.dataset.orderId;
    wx.showModal({
      title: '删除订单',
      // content: "确定要删除该宝贝吗？\r\n还差一步\r\n宝贝就可以直接带回家了哦\r\n\r\n",
      content: "确定要删除该宝贝吗？",
      success: (res) => {
        if (res.confirm) {
          this._doDelOrder(orderId);
        }
      }
    });
  },

  _doDelOrder(orderId) {
    let url = 'order/cancel/' + orderId;
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.fetchApi(url, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);;
      }

      // 刷新订单数据
      this._loadOrderData(() => {
        wx.showToast({ title: "删除订单成功！", icon: "success", duration: 1000 });
      });
    });
  },

  /**
   * 付款
   */
  pay(event) {
    let orderId = event.currentTarget.dataset.orderId;
    let address_id = event.currentTarget.dataset.addressId;
    let postage_list = event.currentTarget.dataset.fx_postage;
    //console.log('address_id=' + address_id);
    console.log('postage_list=' + postage_list);
    this.setData(address_id, postage_list);
    let pigOrderId = "PIG" + orderId;
    wx.showModal({
      title: '订单付款',
      content: `确认为订单[${orderId}]进行支付？`,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#FF0000',
      confirmText: '马上支付',
      success: (res) => {
        if (res.confirm) {
          //this._doPrePay(orderId);
          this._doPrePay(pigOrderId);
        }
      },
    });
  },
  _doPrePay(orderId) {
    
    let address_id = this.data.address_id;
    //let address_id = 47;
    let payType = this.data.payType;
    let is_app = this.data.is_app;
    //let postage_list = this.data.postage_list;
    let postage_list = "a:1:{i:6;d:0;}";
    let uid = this.data.uid;
    let store_id = this.data.storeId;
    let user_coupon_id = this.data.user_coupon_id;
    let shipping_method = this.data.shipping_method;

    var params = {
      payType: payType,
      orderNo: orderId,
      is_app: is_app,
      postage_list: postage_list,
      shipping_method: shipping_method,
      address_id: address_id,
      uid: uid,
      store_id: store_id,
      user_coupon_id: 0,
    }
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

  /**
   * 查看订单详情 
   */
  pushToOrderDetail(e) {
    let { orderId } = e.currentTarget.dataset;
    let { productId } = e.currentTarget.dataset;
    wx.navigateTo(
      { url: './order-detail?orderId=' + orderId + '&productId=' + productId}
    );
  },

  /**
   * 查看商品详情
   */
  pushToGoodsDetail(e) {
    let { productId } = e.currentTarget.dataset;
    wx.navigateTo(
      { url: `../shopping/goods-detail?prodId=${productId}&action=havealook` }
    );
  },

  showTrialQRcode(e) {
    let qr = e.currentTarget.dataset.qr;
    if (!qr) return;
    this.setData({ checkQrImgUrl: qr, showOverlay: true });
  },

  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showOverlay: function () {
    this.setData({ showOverlay: true });
  },

  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
  },

  goToHotSale() {
    wx.navigateTo({
      url: '../activity/hotsale'
    });
  },

  //分享功能
  onShareAppMessage(res) { 
    if (res.from === 'button'){
      // 来自页面内转发按钮，这是直接在待成团里的分享
      var title = res.target.dataset.productname;
      var imageUrl = res.target.dataset.productpic;
      var prodId = res.target.dataset.productid;
      var groupbuyId = res.target.dataset.groupbuyid;
      var groupbuyOrderId = res.target.dataset.groupbuyorderid;
      var path = '/pages/group-buying/group-join?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId;
      return {
        title: title,
        path: path,
        imageUrl: imageUrl,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
    // 下方的购买成功后分享功能，丢弃……
    // var that=this;
    // if (res.from === 'button') {
    //   if (that.data.flag!=1){
    //     // 来自页面内转发按钮，这是直接在待成团里的分享
    //     var title = res.target.dataset.productname;
    //     var imageUrl = res.target.dataset.productpic;
    //     var prodId = res.target.dataset.productid;
    //     var groupbuyId = res.target.dataset.groupbuyid;
    //     var groupbuyOrderId = res.target.dataset.groupbuyorderid;
    //     var path = '/pages/group-buying/group-join?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId;
    //     return {
    //       title: title,
    //       path: path,
    //       imageUrl: imageUrl,
    //       success: function (res) {
    //         // 转发成功
    //       },
    //       fail: function (res) {
    //         // 转发失败
    //       }
    //     }
    //   }else{
    //     //这是拼团购买成功后，点击分享需要的参数，商品的图片，地址，id等
    //     var title = that.data.imgName;
    //     var imageUrl = that.data.imgUrl;
    //     var prodIdShare = that.data.prodIdShare;
    //     var groupbuyIdShare = that.data.groupbuyIdShare;
    //     var groupbuyOrderIdShare = that.data.groupbuyOrderIdShare;
    //     var flag = that.data.flag;
    //     var path = '/pages/group-buying/group-join?prodId=' + prodIdShare + '&groupbuyId=' + groupbuyIdShare + '&groupbuyOrderId=' + groupbuyOrderIdShare
    //     return {
    //       title: title,
    //       path: path,
    //       imageUrl: imageUrl,
    //       success: function (res) {
    //         this.setData({
    //           showshare: false
    //         })
    //         // 转发成功
    //       },
    //       fail: function (res) {
    //         // 转发失败
    //       }
    //     }
    //   }
    // }
  },

  /**
 * 团购订单列表
 */
  loadGroupbuyOrder() {
    wx.showLoading({ title: '加载中...', mask: true, });
    
    let groupbuyOrders = [], waitOrders = [], endOrders = [], failOrders = [];
    app.api.fetchApi("order/OrderList", (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      let groupbuyOrders = data;
      data.forEach(item => {
        let status = item.groupbuyOrderStatus;
        if (status == 1) {
          waitOrders.push(item);
        } else if (status == 2) {
          endOrders.push(item);
        } else {
          failOrders.push(item);
        }
      });
      this.setData({ groupbuyOrders, waitOrders, endOrders, failOrders });
    });
  },

  //处理分享的数据
  listClick: function (event) {
    var groupbuyOrderId = event.currentTarget.groupbuyOrderId

  }

})