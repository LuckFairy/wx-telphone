// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁
var isFirst = true;//是否首次进入页面

Page({
  data: {
    loadingone: true,
    pagesone: 1,
    curActIndex: "",
    store_id: '',
    uid: '',
    normal: [],//数据数组
    showHide: true,
    typeText: '门店券',
    category: 3,//优惠券的类别 1线上 3门店
    searchValue: null,
    isSearch: false,//是否搜索
    package_id:null
  },
  // 搜索卡包
  searchCard(e) {
    var that = this;
    var searchValue = e.detail.value;//搜索值
    if (searchValue) {
      that.setData({
        searchValue: searchValue,
        pagesone: 1,
        isSearch: true,
      });
    }
    that.loadData1(that);
  },
  goNull(e) {
    var that = this;
    var searchValue = e.detail.value;
    if (!searchValue) {
      that.setData({
        searchValue: searchValue,
        pagesone: 1,
        isSearch: true,
      });
      that.loadData1(that);
    }
  },
  getCoupon() {
    wx.navigateTo({
      url: './index-mom',
    })
  },
  // 点击弹出选择券类型
  goSelect() {
    var showHide = !this.data.showHide;
    this.setData({
      showHide
    });
  },
  // 选择券类型
  goChooseCard(e) {
    let that = this;
    // 事件代理拿到点击目标
    let { category, typeText}=that.data;
    let categoryNew = e.target.dataset.category;
    if (categoryNew == category) { return; }
    if (categoryNew == 1) { typeText ='线上券'}
    else if (categoryNew == 3) { typeText ='门店券'}
    that.setData({
      category: categoryNew, typeText, normal: [], showHide: true, pagesone: 1, loadingone: true,isSearch:false
    });
    that.loadData1(that);
  },
  pullUpLoadone(e) {
    var that = this;
    var { loadingone, pagesone } = that.data;
    if (!loadingone) {//全部加载完成
      return;
    }
    wx.showLoading({ title: '加载中' });
    pagesone++;
    that.setData({ pagesone })
    setTimeout(function () {
      that.loadData1(that, true);
      wx.hideLoading();
    }, 1000)
  },
  onLoad: function (options) {
    var that = this;
    var store_id = app.store_id;
    var uid = wx.getStorageSync('userUid');
    let { package_id } = options;
    if (package_id) { that.setData({ package_id }) }
    that.setData({ curSwiperIdx: 0, curActIndex: 0, uid: uid, store_id });
    that.loadData1(that);
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    if (!isFirst) {
      var that = this;
      that.loadData1(that);
    } else {
      isFirst = false;
    }


  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showCheckQr: function (event) {
    let qrUrl = event.currentTarget.dataset.qrImageUrl;
    this.setData({ qrImageUrl: qrUrl, showOverlay: true });
  },

  //加载页面数据
  loadData1: function (that, isLoadMore) {
    wx.showLoading({
      title: '加载中',
    })
    var { searchValue, pagesone, store_id, uid, category, searchFlag, normal = [],package_id } = that.data;
    var params = {
      page: pagesone, store_id, uid: uid, type: category, tagId: 0, package_id, keyword: searchValue
    }
    app.api.postApi('wxapp.php?c=coupon&a=my_v2', { params }, (err, reps) => {
      if (err && reps.err_code != 0) { wx.hideLoading(); return; }
      var {  coupon_list = [], next_page } = reps.err_msg;
      if (isLoadMore) {
        normal = [...normal, ...coupon_list];
      } else {
        normal = coupon_list;
      }
      that.setData({
        loadingone: next_page,
        normal
      });
      wx.hideLoading();
    });
  },
  goDetail(e) {
    if (_tapLock) return;
    console.log(this.tabLock);
    console.log('参数', e)
    // 区分是否从卡包进入
    var distinguish = e.currentTarget.dataset.distinguish;
    var id = e.currentTarget.dataset.id;
    var _type = e.currentTarget.dataset.type;
    if (_type == 3) {
      // 线下券
      wx.navigateTo({
        url: './card_summary?id=' + id + '&distinguish=' + distinguish
      })
    } else {
      // 线上券跳到某个商品详情
      wx.navigateTo({
        url: '../index-new/index-boabao'
      })
    }
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
    wx.showActionSheet({
      itemList: ['删除卡券'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex === 0) {   // 确认删除
          console.log('删除');
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    });
  }
})