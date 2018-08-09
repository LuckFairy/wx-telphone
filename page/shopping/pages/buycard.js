// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁
Page({
  data: {
    loading: true,
    status: true,
    windowHeight: '',
    windowWidth: '',
    msgList: [],
    usedMsg: [],
    expiredMsg: [],
    scrollTop: 0,
    scrollHeight: 0,
    pagesone: 1,
    pagestwo: 1,
    pagesthree: 1,
    dataStatus: 0,
    //2017年12月22日16:50:36
    normal_coupon_count: 0, //可用优惠券数量
    unnormal_coupon_count: 0, //不可用优惠券数量
    //2017年12月25日10:43:12
    thetype: false,
    borId: '',
    cname: '',
    couponid: '',
    face_money: 0,
    index: '',
    recid: '',
    couponInfo: '',
    uid: '',
    store_id: '',
    showSuccessModal: false,//显示成功模态框
    zhang: 0
  },
  pullUpLoadone(e) {
    return;//不需要这个东西 2017年12月25日10:01:39 by leo
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var pagesone = that.data.pagesone;
      pagesone++;
      that.setData({
        pagesone: pagesone
      })
      that.loadData1(that);
      wx.hideLoading()
    }, 1000)
    // 上拉加载结束 
  },
  pullUpLoadonetwo(e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var pagestwo = that.data.pagestwo;
      pagestwo++;
      that.setData({
        pagestwo: pagestwo
      })
      that.loadData2(that);
      wx.hideLoading()
    }, 1000)

    // 上拉加载结束 
  },
  pullUpLoadthree(e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var pagesthree = that.data.pagesthree;
      pagesthree++;
      that.setData({
        pagesthree: pagesthree
      })
      that.loadData3(that);
      wx.hideLoading()
    }, 1000)
    // 上拉加载结束
  },
  onLoad: function (options) {
    var that = this;
    var store_id = app.store_id;
    var uid = wx.getStorageSync('userUid');
    var userOpenid = wx.getStorageSync("userOpenid");
    this.setData({ uid, store_id });
    wx.showLoading({ title: '加载中' });
    that.setData({ curSwiperIdx: 0, curActIndex: 0 });
    // 自动获取手机宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

    var pro_price = options.pro_price;//商品总价
    var product_id = options.product_id;//商品总id
    that.loadCouponData(pro_price, product_id);
    // var uid = wx.getStorageSync('userUid');
    // if (!userOpenid){
    //   that.loadData1(that);
    // }
  },
  loadCouponData: function (pro_price, product_id) {
    var that = this;
    product_id = product_id.split(',');
    wx.showLoading({
      title: '加载中'
    })
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id,
      "product_id": product_id,
      "total_price": pro_price
    };

    var url = 'wxapp.php?c=coupon&a=store_coupon_use';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) { that._showError(err || resp.err_msg); return; }
      if (resp.err_msg.coupon_list) {
        var normal = resp.err_msg.coupon_list['normal_coupon_list'];
        var expired = resp.err_msg.coupon_list['unnormal_coupon_list'];
        //更新数据
        that.setData({
          loading: false,
          normal: normal,
          expired: expired,
          normal_coupon_count: resp.err_msg.normal_coupon_count,
          unnormal_coupon_count: resp.err_msg.unnormal_coupon_count
        });
      }
    });
  },
  goChooseCard(e) {
    var that = this;
    console.log(e, 'e')
    var index = e.currentTarget.dataset.index;
    let recId = e.currentTarget.dataset.recid;
    var normal = that.data.normal;
    var borId = normal[index].id;
    let couponid = e.currentTarget.dataset.couponid;
    let cname = e.currentTarget.dataset.cname;
    let face_money = e.currentTarget.dataset.face_money;
    that.setData({
      borId,
      recid: recId,
      index: index,
      face_money: face_money,
      cname: cname,
      couponid: couponid,
      zhang: 1
    })

  },
  goConfirm(e) {
    var that = this;
    var cname = e.currentTarget.dataset.cname;
    var couponid = e.currentTarget.dataset.couponid;
    var face_money = e.currentTarget.dataset.face_money;
    var index = e.currentTarget.dataset.index;
    var recid = e.currentTarget.dataset.recid;
    var couponInfo = [];
    couponInfo.push(recid); //要是的我的优惠券记录id而不是优惠券的id
    couponInfo.push(cname);
    couponInfo.push(face_money);
    wx.setStorageSync('couponInfo', couponInfo)
    that.setData({
      couponInfo: couponInfo
    })
    wx: wx.navigateBack({
      delta: 1,
    })
  },
  goDetails() {

    this.showModal('success');
  },
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
  // 滑动切换
  swiperChange: function (event) {
    var that = this;
    this.setData({
      curActIndex: event.detail.current,
      dataStatus: event.detail.current
    });
  },
  // 点击切换
  swichSwiperItem: function (event) {
    var that = this;
    this.setData({
      curSwiperIdx: event.target.dataset.idx,
      curActIndex: event.target.dataset.idx,
      dataStatus: event.target.dataset.idx
    });
  },


  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showCheckQr: function (event) {
    let qrUrl = event.currentTarget.dataset.qrImageUrl;
    this.setData({ qrImageUrl: qrUrl, showOverlay: true });
  },
  scroll: function (event) {
    var that = this;
    that.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  //加载页面数据

  gotoDetail(e) {
    if (_tapLock) return;
    console.log(this.tabLock);
    let param = e.currentTarget.dataset.urlParam;
    let checkQrImgUrl = e.currentTarget.dataset.qrUrl;
    wx.setStorageSync('checkQrImgUrl', checkQrImgUrl);
    wx.navigateTo({
      url: '../card/card_summary?' + param
    })
  },

  /**
   * 长按删除
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  deleteCard(e) {
    _tapLock = true;
    let recId = e.currentTarget.dataset.recid;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认删除卡券',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          app.api.postApi('card/deleteCardRecord', { recId: recId }, (err, response) => {
            if (err) return;
            let { rtnCode } = response;
            let tip = '';
            if (rtnCode != 0) {
              tip = '系统繁忙，删除失败。';
            } else {
              tip = '删除成功';
            }
            wx.showToast({
              title: tip,
            });
            that.loadData();
            wx.hideLoading();
          });


        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },
      complete: () => _tapLock = false

    });

    // wx.showActionSheet({
    //   itemList: ['删除卡券'],
    //   success: function(res) {
    //     console.log(res.tapIndex);
    //     if(res.tapIndex === 0) {   // 确认删除
    //       console.log('删除');
    //     }
    //   },
    //   fail: function(res) {
    //     console.log(res.errMsg)
    //   }
    // });
  },

  /**
  * 显示模态框
  */
  showModal(type = 'err', config) {  // type: success||err
    var successModalConfig = {
      image: '../resources/conupon-img.png',
      title: '优惠券使用说明',
      firstText: '1、通用券和指定券不能同时使用',
      secondText: '2、当全的金额大于订单应付金额时，差额不予退还。',
      threeText: '3、通用券和指定券都不能叠加使用。',
      confirmText: '确定'
    }
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