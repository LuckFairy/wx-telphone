
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
const ORDER_TUAN_PENDING = 5;   // 待拼团对应的index是5

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


const util = require('../../../utils/util.js');
let share = require('../template/share.js');
const shareLaterUrl = 'wxapp.php?c=activity&a=tuan_share_coupon';//拼团活动分享之后的优惠券列表
var app = getApp();
let errModalConfig = {
  image: '../../../image/ma_icon_store_1.png',
  title: '将二维码出示给门店核销员由门店员核销即可',
};
let successModalConfig = {
  firstText: '提示',
  confirmText: '确认'
}

let that;
let timer;

Page({
  data: {
    showFlag: false,
    allOrders: [],     //全部订单
    momentOrders: [],   //临时
    unpayOrders: [],    //待付款 （待支付订单）
    processingOrders: [], //待发货
    shippedOrders: [],   //已发货
    finishedOrders: [], // 已完成
    canceledOrders: [],  //已取消
    refundingOrders: [],   //退款中
    ReceivedOrders: [],  //已收货
    transOrders: [],    // 待收货(已发货)
    sku_arr: [],//多属性列表


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
    showshare: false,
    groupbuyId: '',
    groupbuyOrderId: '',
    prodId: '',
    uid: '',
    storeId: app.store_id,
    showSale: true,//售后是否无数据，true无，false有
    dataList: [],
    shipping_method: 'express',
    addressId: 0,
    postage_list: "",
    user_coupon_id: 0,
    is_app: false,
    payType: 'weixin',
    showErrModal: false,//错误模式层
    showSuccessModal: false,//确认模式层
    showShareModal: false,//分享成功后模式层
    shareData: [],//分享数据
    isShow: true,//是否显示,默认全部显示
  },
  onShareAppMessage: function (res) {
    let that = this, dataset = res.target.dataset;
    let store_id = that.data.storeId, uid = that.data.uid;
    let opt, order;
    order = dataset.params;
    that.setData({ showShareModal: false });
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }

    var tip = `快来参团！${dataset.price}元包邮${dataset.title}这里比其他平台购买还便宜！！！猛戳.......`;
    let url = `/page/group-buying/group-join?tuanId=${order.tuan_info.tuan_id}&type=${order.status}&itemId=${order.tuan_info.team_id}&teamId=${order.tuan_info.team_id}`;
    return {
      title: tip,
      path: url,
      imageUrl: dataset.imgurl,
      success: function (res) {
        //开启分享成功弹窗
        share.shareOpen({
          store_id,
          uid,
          url: shareLaterUrl
        }).then(opt => {
          let { showModel, couponList, coupon_id_arr = [] } = opt;
          that.setData({
            showShareModal: showModel,
            shareData: { couponList },
            coupon_id_arr
          })
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '分享失败！',
        })
      }
    }
  },
  getCoupon() {
    let that = this;
    let { store_id, uid, coupon_id_arr } = that.data;
    share.getCoupon({
      store_id,
      uid,
      coupon_id_arr
    }).then(opt => {
      let { showModel } = opt;
      that.setData({
        showShareModal: showModel
      })
    });
  },
  cancelCoupon() {
    let that = this;
    let { store_id, uid } = that.data;
    share.cancelCoupon({
      store_id,
      uid
    }).then(opt => {
      let { showModel } = opt;
      that.setData({
        showShareModal: showModel
      })
    });
  },
  onLoad: function (options) {
    var that = this;
    var groupbuyId = options.groupbuyId;
    var groupbuyOrderId = options.groupbuyOrderId;
    var prodId = options.prodId;
    var listsIndex = options.listsIndex;

    var orderstatus = options.orderstatus;
    var groundBuy = options.groundBuy;
    var group = options.group;
    var list = options.list;
    var goodsindex = options.goodsindex;
    var showFlag = options.show;
    if (showFlag != 'undefined' && showFlag == 1) {
      that.setData({
        showFlag: true
      });
    }
    let uid = wx.getStorageSync('userUid');
    // let uid = 7;

    // 页面初始化 options为页面跳转所带来的参数
    let { page = 0 } = options;
    if (list) { page = list; }
    this.setData({ curSwiperIdx: page, curActIndex: page, currentTab: 0, groupbuyId: groupbuyId, groupbuyOrderId: groupbuyOrderId, prodId: prodId, uid: uid });
    // wx.getStorage({
    //   key: 'showclose',
    //   success: function (res) {
    //     that.setData({
    //       showclose: res.data
    //     })
    //   }
    // })
    // // 判断是否从“我的”页面跳到拼团
    // if (group == 0) {
    //   that.setData({ curSwiperIdx: 1, curActIndex: 1, currentTab: 0 });
    // }
    // if(list==0){
    //   that.setData({ curSwiperIdx: 0, curActIndex: 0});
    // }else if(list==1){
    //   that.setData({ curSwiperIdx: 1, curActIndex: 1, currentTab: 1 });
    // } else if (list == 2) {
    //   that.setData({ curSwiperIdx: 2, curActIndex: 2});
    // } else if (list == 3) {
    //   that.setData({ curSwiperIdx: 3, curActIndex: 3 });
    // } else if (orderstatus==2){
    //   that.setData({ curSwiperIdx: 2, curActIndex: 2 });
    // } else if (list == 4){
    //   that.setData({ curSwiperIdx: 4, curActIndex: 4 });
    // }
    // else if (groundBuy == 1) { 
    //   //拿到点击了“不再提醒”后的存储值，以后都不再显示这个分享框
    //   var stoList = wx.getStorageSync("showshare");
    //   if (stoList == "false"){
    //       that.setData({
    //         showshare : false
    //       })
    //   }else{
    //       that.setData({
    //         showshare : true
    //       })
    //   }
    //   that.setData({
    //     curSwiperIdx: 1,
    //     curActIndex: 1,
    //     currentTab: 1,
    //   });
    // }
    // else if (orderstatus == 2) {
    //   that.setData({ curSwiperIdx: 2, curActIndex: 2});
    // } else if (listsIndex ==4){
    //   that.setData({ curSwiperIdx: 4, curActIndex: 4 });
    // }
    // // 确认收货跳转
    // this.setData({ curSwiperIdx: goodsindex, curActIndex: goodsindex});
    // 退换售后开始
    that.listReturnFun();
  },
  listReturnFun: function () {
    var that = this;
    wx.showLoading({
      title: '加载中'
    })
    var params = {
      "uid": this.data.uid,
      "page ": 1,
      "store_id": this.data.storeId
    };
    console.log('售后数据请求参数', params);
    var url = 'wxapp.php?c=return&a=listOfReturn';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      if (resp) {
        if (resp.err_code == 0) {
          if (resp.err_msg.return_list) {
            if (resp.err_msg.return_list.length > 0) {
              var dataList = resp.err_msg.return_list;
              that.setData({
                showSale: false,
                dataList: dataList
              })
            }
          }
        } else {
          that.setData({
            showSale: true
          })
        }

      }

    });
  },
  goDetail(e) {
    var theId = e.target.dataset.theId;
    var order_no = e.target.dataset.orderNo;
    var statustxt = e.target.dataset.orderStatus_txt;

    wx.navigateTo({
      url: '../../my/pages/purchase-detail?theId=' + theId + '&order_no=' + order_no + '&statustxt=' + statustxt
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
    clearInterval(timer);
  },
  swiperChange: function (e) {
    console.log("current：" + e.detail.current);
    let index = e.detail.current;//待拼团对应下标
    let that = this;
    if (index == 4) {
      that.listReturnFun();
    }
    that.setData({ curSwiperIdx:index});
  },
  swichSwiperItem: function (event) {
    var that = this;
    this.setData({
      curSwiperIdx: event.target.dataset.idx,
      curActIndex: event.target.dataset.idx
    });
    if (event.detail.current == 4) {
      that.listReturnFun();
    } else if (event.detail.current == 5) {
      // that.loadTuanData();
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

  onOrdeDetailClick(e) {
    var orderNo = e.currentTarget.dataset.orderNo
    var dateText = e.currentTarget.dataset.orderDate
    wx.navigateTo({
      url: '../../group-buying/detail?&order_no=' + orderNo + '&date_text=' + dateText

    })
  },

  /**查看團詳情 */
  lookOrder(e) {
    var params = e.currentTarget.dataset.params;
    params.tuan_id = params.tuan_info.tuan_id;
    params.type = 1;
    params.item_id = params.tuan_info.item_id;
    params.team_id = params.tuan_info.team_id;

    params = escape(JSON.stringify(params));
    wx.navigateTo({
      url: `../../group-buying/tuan-detail?params=${params}`
    })
  },

  goSeachGrounp(event) {
    var groupbuyOrderId = event.currentTarget.dataset.groupbuyorderid;
    var groupStatus = event.currentTarget.dataset.status;
    var groupId = event.currentTarget.dataset.id;
    var groupbuyId = event.currentTarget.dataset.groupbuyid;
    var orderId = event.currentTarget.dataset.order;
    if (groupStatus == 2) {
      wx.navigateTo({
        url: '../../my/pages/cluster-success?Groupbuy_order_id=' + groupbuyOrderId + "&groupbuyId=" + groupbuyId + "&prodId=" + groupId + "&orderId=" + orderId
      })
    } else if (groupStatus == 3) {
      wx.navigateTo({
        url: "../../my/pages/cluser-wait?productId=" + groupId + "&Groupbuy_order_id=" + groupbuyOrderId + "&statusNum=" + groupStatus + "&groupbuyId=" + groupbuyId + "&orderId=" + orderId
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
        url: "../../my/pages/failed?productId=" + groupId + "&Groupbuy_order_id=" + groupbuyOrderId + "&groupbuyId=" + groupbuyId + "&orderid=" + orderid
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
  _loadOrderData(onLoaded, opt) {
    var that = this;
    wx.showLoading({ title: '加载中...', mask: true, });
    //新方法
    var params = Object.assign({ "uid": this.data.uid, store_id: this.data.storeId, type: "all" }, opt);

    console.log('请求的参数params ', params)
    app.api.postApi("wxapp.php?c=order_v2&a=order_list", { "params": params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      //console.info('订单数据 ',resp)
      let { err_code, err_msg: { next_page, order_list = [] } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }
      //订单状态status,0  临时订单 1 未支付 2 未发货（待发货） 3已发货（待收货） 4 已完成 、7 已收货（已收货） 5已取消 6 退款中（处理中）
      //拼团状态tuan_info.status,0=进行中，1=成功，2=失效，3=去支付
      //allOrders 全部,momentOrders 临时,unpayOrders 待付款,processingOrders 待发货,shippedOrders 已发货,finishedOrders 已完成
      //canceledOrders 已取消,refundingOrders 退款中,ReceivedOrders 已收货,transOrders 待收货(已发货),waitOrders 待成团，groupOrders\groupOrders团购（新接口不使用）
      let groupOrders = [], //没有用到
        groupbuyOrders = [], //没有用到
        uncheckOrders = [],  // 待审核订单（赠品）
        waitOrders = [], //待成团
        allOrders = [], //全部订单
        momentOrders = [], //临时
        unpayOrders = [], //待付款 （待支付订单）
        processingOrders = [], //待发货
        shippedOrders = [], //已发货
        finishedOrders = [], // 已完成
        canceledOrders = [], //已取消
        refundingOrders = [], //退款中
        ReceivedOrders = [], //已收货
        transOrders = []; // 待收货(已发货)
      let now = new Date().getTime();
      order_list.forEach(item => {
        allOrders.push(item); //全部
        let typeOrder = item.groupbuyOrderId; //团购，新接口不使用
        if (typeOrder != 0) {
          groupOrders.push(item);
        }

        //0  临时订单 1 未支付 2 未发货（待发货） 3已发货（待收货） 4 已完成 7 已收货（已收货） 5已取消 6 退款中（处理中）
        let status = parseInt(item.status);
        let tuan_flag = item.is_tuan == 1 ? true : false; //是否是团订单
        if (tuan_flag) { //拼团订单
          let expireTime = item.tuan_info.end_time * 1000;
          item.tuan_info.diffTime = (expireTime - now) / 1000;
          item.tuan_info.datelineText = util.formatTime(item.tuan_info.end_time);
          let tuan_status = parseInt(item.tuan_info.status);//拼团状态,0=进行中，1=成功，2=失效，3=去支付
          if (tuan_status == 1) {
            if (status == 2 || status == 3) {
              transOrders.push(item); //待收货
            } else {
              ReceivedOrders.push(item);//已收货
            }
          } else if (tuan_status == 0) {
            waitOrders.push(item);//待成团
          } else if (tuan_status == 3) {
            unpayOrders.push(item);//待付款
          }
        } else { //普通订单
          switch (status) {
            case 0: momentOrders.push(item); break;//临时订单
            case 1: unpayOrders.push(item); break;//待付款
            case 2: transOrders.push(item); break;//未发货
            case 3: transOrders.push(item); break;//已发货
            case 4: ReceivedOrders.push(item); break;//已完成
            case 5: canceledOrders.push(item); break;//5已取消
            case 6: refundingOrders.push(item); break;//退款中（处理中）
            case 7: ReceivedOrders.push(item); break;//已收货（已收货）
          }
        }

      });

      this.setData({ allOrders, momentOrders, unpayOrders, transOrders, ReceivedOrders, finishedOrders, uncheckOrders, groupOrders, waitOrders });
      that.nowTime();
      timer = setInterval(that.nowTime, 1000);
      typeof onLoaded === 'function' && onLoaded();
    });

  },

  /**
   * 确认收货
   */
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
  switchtap(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
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
      this.setData({ curSwiperIdx: 4, curActIndex: 4 });
      // 刷新订单数据
      this._loadOrderData();

    });
  },

  onClickHome: function (event) {
    wx.reLaunch({
      url: '../../../page/tabBar/home/index-new'
    })
  },


  /**
   * 删除订单
   */
  delOrder: function (event) {
    let orderId = event.currentTarget.dataset.orderId;
    let index = event.currentTarget.dataset.index;
    let uid = this.data.uid;
    // console.log("请求的参数", orderId, uid); return;
    wx.showModal({
      title: '删除订单',
      // content: "确定要删除该宝贝吗？\r\n还差一步\r\n宝贝就可以直接带回家了哦\r\n\r\n",
      content: "确定要删除该宝贝吗？",
      success: (res) => {
        if (res.confirm) {
          this._doDelOrder(orderId, uid, index);
        }
      }
    });
  },

  _doDelOrder(orderId, uid, index) {
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.postApi('wxapp.php?c=order_v2&a=cancel', { "params": { "uid": uid, "order_no": orderId } }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        //不能删除的订单，直接隐藏
        this.showModal('success', {
          firstText: resp.err_msg
        });
        return;
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
    let addressId = event.currentTarget.dataset.addressId;
    let postage_list = event.currentTarget.dataset.fx_postage;
    this.setData({ addressId, postage_list });
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
          //推送消息
          app.send(orderId);
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
      var data = resp.err_msg;
      // 调起微信支付
      if (resp.err_code != 0) {
        wx.showModal({
          title: '支付失败',
          content: data,
          confirmText: '好的',
        });

      } else {
        // 调起微信支付
        if (resp.err_dom) {
          wx.navigateTo({
            url: './my-order?goodsindex=' + 2
          })
        } else {

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
    //2018年1月3日09:52:02
    wx.removeStorageSync('couponInfo');
    this.giveCard(this.data.orderId);

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
  /*
  * 再次购买
  */
  againBuy(e) {
    let { proId } = e.currentTarget.dataset;
    wx.reLaunch({
      // url: './goods-detail?prodId=' + proId
      url: '../../tabBar/home/index-new'
    })
  },
  /*新品试用，确认取货
  *
  */
  confirmNewGoods(e) {
    var trial_product_qrcode = e.currentTarget.dataset.qrcode;
    trial_product_qrcode = trial_product_qrcode.replace(/\\/g, '');
    this.showModal('err', { image: trial_product_qrcode });
  },

  /**
   * 查看订单详情 
   */
  pushToOrderDetail(e) {
    let { orderId, productId, status, newTrial } = e.currentTarget.dataset;
    wx.navigateTo(
      { url: '../../shopping/pages/order-detail?orderId=' + orderId + '&productId=' + productId + '&newTrial=' + newTrial }
    );
  },

  /**
   * 查看商品详情
   */
  pushToGoodsDetail(e) {
    let { productId } = e.currentTarget.dataset;
    wx.navigateTo(
      { url: `../../home/pages/goods-detail?prodId=${productId}&action=havealook` }
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
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
  },

  //购物车为空，去下单
  goToHotSale() {
    console.log('购物车为空，去下单');
    wx.reLaunch({ url: '../../tabBar/home/index-new' });

  },

  /**
 * 团购订单列表
 */
  loadGroupbuyOrder() {
    // wx.showLoading({ title: '加载中...', mask: true, });

    // let groupbuyOrders = [], waitOrders = [], endOrders = [], failOrders = [];
    // app.api.fetchApi("order/OrderList", (err, resp) => {
    //   wx.hideLoading();
    //   if (err) {
    //     return this._showError('网络出错，请稍候重试');
    //   }
    //   let { rtnCode, rtnMessage, data = [] } = resp;
    //   if (rtnCode != 0) {
    //     return this._showError(rtnMessage);
    //   }
    //   let groupbuyOrders = data;
    //   data.forEach(item => {
    //     let status = item.groupbuyOrderStatus;
    //     if (status == 1) {
    //       waitOrders.push(item);
    //     } else if (status == 2) {
    //       endOrders.push(item);
    //     } else {
    //       failOrders.push(item);
    //     }
    //   });
    //   this.setData({ groupbuyOrders, waitOrders, endOrders, failOrders });
    // });
  },

  //处理分享的数据
  listClick: function (event) {
    var groupbuyOrderId = event.currentTarget.groupbuyOrderId

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
   * 加载订单数据 //加载订单数据，新接口使用post方法
   * onLoaded: 加载成功回调函数
   * opt是传过来的参数type(类型),page（页码）,store_id（店铺id),uid(用户id)
   */
  loadTuanData(onLoaded, opt) {
    var that = this;
    // 获取uid


    wx.showLoading({ title: '加载中...', mask: true, });
    //新方法
    var params = Object.assign({ "uid": this.data.uid, store_id: this.data.storeId, type: 1, page: 1 }, opt);

    app.api.postApi("wxapp.php?c=groupbuy&a=my_tuan", { "params": params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      //console.info('订单数据 ',resp)
      let { err_code, err_msg: { next_page, order_list = [] } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }

      let waitOrders = [];
      let now = new Date().getTime();
      order_list.forEach(item => {
        let expireTime = item.end_time * 1000;
        item.diffTime = (expireTime - now) / 1000;
        item.datelineText = util.formatTime(item.dateline);
        waitOrders.push(item);
      });

      this.setData({ waitOrders });
      that.nowTime();
      timer = setInterval(that.nowTime, 1000);
      typeof onLoaded === 'function' && onLoaded();
    });

  },
  nowTime() {//时间函数  
    let that = this;
    var isUpdate = false;
    let allOrders = that.data.allOrders;
    let allOrdersTemp;
    if (!allOrders || allOrders.length < 1) {
      clearInterval(timer);
      return;
    }

    let waitOrdersTemp = [];


    let len = allOrders.length;//时间数据长度 
    for (var i = 0; i < len; i++) {
      let isTuan = allOrders[i].is_tuan;

      if (isTuan == 1) {
        var status = allOrders[i].tuan_info.status;
        if (status == '1') {
          continue;
        }
        var intDiff = allOrders[i].tuan_info.diffTime;//获取数据中的时间戳  
        // console.log(intDiff)  
        var day = 0, hour = 0, minute = 0, second = 0;
        if (intDiff > 0) {//转换时间  
          day = Math.floor(intDiff / (60 * 60 * 24));
          hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
          minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
          second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
          hour = day * 24 + hour;
          if (hour <= 9) hour = '0' + hour;
          if (minute <= 9) minute = '0' + minute;
          if (second <= 9) second = '0' + second;
          allOrders[i].tuan_info.diffTime = allOrders[i].tuan_info.diffTime - 1;
          var str = hour + ':' + minute + ':' + second + '后结束';
        } else {
          // allOrders[i].tuan_info.status=3;
          var str = "";
          // clearInterval(timer);
        }
        allOrders[i].tuan_info.countdownText = str;//在数据中添加difftime参数名，把时间放进去 
        if (allOrders[i].tuan_info.diffTime > 0) {
          waitOrdersTemp.push(allOrders[i]);
        } else {
          // clearInterval(timer);
          // that._loadOrderData();
          // isUpdate = false;
          // break;
        }
      }

      isUpdate = true;

    }
    if (isUpdate) {
      that.setData({
        allOrders,
        waitOrders: waitOrdersTemp
      })
    }


  }




})