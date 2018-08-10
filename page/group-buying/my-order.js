let util = require('../../utils/util.js');
let config = require('../../config.js');
let share = require('../common/template/share.js');
const shareLaterUrl = 'wxapp.php?c=activity&a=tuan_share_coupon';//拼团活动分享之后的优惠券列表
const ORDER_TYPE_PENDING = 0;   // 进行中
const ORDER_TYPE_SUCCESS = 1;   // 成功
const ORDER_TYPE_FAIL = 2;   // 失败
let pageNum = 1;
let app = getApp();
let store_id = app.store_id;
let uid = wx.getStorageSync('userUid');

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
    store_id: '',
    uid: '',
    coupon_id_arr: [],
    showOverlay: false, // 弹窗遮掩层
    showErrModal: false,//错误模式层
    showSuccessModal: false,//确认模式层
    showShareModal: false,//分享成功后模式层
    shareData: [],//分享数据
    isShow: true,//是否显示,默认全部显示
    currentTab: 0,
    showclose: true,
    waitOrders: [],  //待成团
    endOrders: [],  //已成团
    failOrders: [],  //未成团
    allOrders: [],//所有
    curSwiperIdx: '',
    curActIndex: '0',
    

  },
  onShareAppMessage: function (res) {
    let that = this;
    let { store_id, uid } = that.data;
    let opt = res.target.dataset.params;
    let dataset = res.target.dataset;
    that.setData({ showShareModal: false });
    var tip = `快来参团！${dataset.price}元包邮${dataset.title}这里比其他平台购买还便宜！！！猛戳.......`;
    return {
      title: tip,
      path: `/page/group-buying/group-join?tuanId=${opt.tuan_id}&type=${opt.type}&itemId=${opt.item_id}&teamId=${opt.team_id}`,
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
  onClickHome: function (event) {
    wx.reLaunch({
      url: '../../page/tabBar/home/index-new'
    })
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
    let that = this;
    var showFlag = options.show;
    if (showFlag != 'undefined' && showFlag == 1) {
      that.setData({
        showFlag: true
      });
    }
    let { orderstatus } = options;
    if (orderstatus == 0) { that.setData({ curActIndex: 1, curActIndex: 1 }) }//待成团
    else if (orderstatus == 1) { that.setData({ curActIndex: 2, curActIndex: 2 }) };//已成团
    uid = wx.getStorageSync('userUid');
    that.setData({
      store_id,
      uid,
    })
  },
  goDetail(e) {
    var theId = e.target.dataset.theId;
    var order_no = e.target.dataset.orderNo;
    var statustxt = e.target.dataset.orderStatus_txt;

    wx.navigateTo({
      url: '../../my/pages/purchase-detail?theId=' + theId + '&order_no=' + order_no + '&statustxt=' + statustxt
    })
  },
  /**查看團詳情 */
  lookOrder(e) {
    var params = e.currentTarget.dataset.params;
    params = escape(JSON.stringify(params));
    wx.navigateTo({
      url: `./tuan-detail?params=${params}`
    })
  },
  onOrdeDetailClick(e) {

    var index = this.data.curActIndex;

    if (index == '0' && e.currentTarget.dataset.orderStatus == '1') {
      wx.navigateTo({
        url: '../common/pages/my-order?list=3'
      });
    } else {
      var orderNo = e.currentTarget.dataset.orderNo
      var dateText = e.currentTarget.dataset.orderDate
      wx.navigateTo({
        url: './detail?&order_no=' + orderNo + '&date_text=' + dateText
      })

    }



  },

  /**
   * 跳转到代发货
   */
  onGoUnsendClick(e) {
    wx.navigateTo({
      url: '../common/pages/my-order?list=3'
    });
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    wx.hideShareMenu();
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
  swiperChange: function (event) {
    var that = this;
    this.setData({
      curActIndex: event.detail.current
    });
    if (event.detail.current == 4) {
      that.listReturnFun();
    }
  },
  swichSwiperItem: function (event) {
    var that = this;
    this.setData({
      curSwiperIdx: event.target.dataset.idx,
      curActIndex: event.target.dataset.idx
    });

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

  onInviteFriends() {

  },

  /**
   * 加载订单数据 //加载订单数据，新接口使用post方法
   * onLoaded: 加载成功回调函数
   * opt是传过来的参数type(类型),page（页码）,store_id（店铺id),uid(用户id)
   */
  _loadOrderData(onLoaded, opt) {
    that = this;
    wx.showLoading({ title: '加载中...', mask: true, });
    //新方法
    var params = Object.assign({ "uid": uid, store_id: store_id, type: 0, page: 1 }, opt);

    // var params = Object.assign({ "uid": 9587, store_id: 590, type: 1, page: 1 }, opt);

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
      let now = new Date().getTime();
      let allOrders = [], waitOrders = [], endOrders = [];
      order_list.forEach(item => {
        item.datelineText = util.formatTime(item.dateline);
        let expireTime = item.end_time * 1000;
        item.diffTime = (expireTime - now) / 1000;
        allOrders.push(item);
        let status = item.status;
        if (status == ORDER_TYPE_PENDING) {     //0：进行中
          waitOrders.push(item);
        } if (status == ORDER_TYPE_SUCCESS) { //1：成功
          endOrders.push(item);
        }
      });

      this.setData({ allOrders, waitOrders, endOrders });
      that.nowTime();
      timer = setInterval(that.nowTime, 1000);
      // typeof onLoaded === 'function' && onLoaded();
    });

  },
  nowTime() {//时间函数  
    let that = this;
    let allOrders = that.data.allOrders;
    if (!allOrders || allOrders.length < 1) {
      clearInterval(timer);
      return;
    }

    let waitOrders = []
    let allOrdersTemp = []

    let len = allOrders.length;//时间数据长度 
    for (var i = 0; i < len; i++) {
      let status = allOrders[i].status;
      if (status == ORDER_TYPE_PENDING) {
        var intDiff = allOrders[i].diffTime;//获取数据中的时间戳  
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
          allOrders[i].diffTime = allOrders[i].diffTime - 1;
          var str = hour + ':' + minute + ':' + second
        } else {
          var str = "已结束！";
          clearInterval(timer);
        }
        allOrders[i].countdownText = str;//在数据中添加difftime参数名，把时间放进去 
        if (allOrders[i].diffTime > 0) {
          waitOrders.push(allOrders[i]);
          allOrdersTemp.push(allOrders[i]);
        }
      } else {
        allOrdersTemp.push(allOrders[i]);
      }
    }
    that.setData({
      allOrders: allOrdersTemp, waitOrders
    })

  },



  switchtap(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
    })
  }
  ,
  /**
   * 查看商品详情
   */
  pushToGoodsDetail(e) {
    let { productId } = e.currentTarget.dataset;
    wx.navigateTo(
      { url: `../../home/pages/goods-detail?prodId=${productId}&action=havealook` }
    );
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
})