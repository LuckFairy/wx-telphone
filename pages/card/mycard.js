// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁

Page({
  data: {
    isLoaded2: false,//是否已经加载了已过期数据
    isLoaded3: false,//是否已经加载了已使用数据
    loading: true,
    loadingone: true,//待使用是否上拉刷新
    normal: [],//待使用数据
    loadingtwo: true,//已过期是否上拉刷新
    expired: [],//已经过期数据
    loadingthree: true, //已使用是否上拉刷新
    used: [],//已使用数据
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
    curActIndex: 0,
    store_id: '',
    uid: '',
    image: '',
    ex_image: '',
    use_image: '',
    showHide: true,
    typeText: '门店券',
    indexSelect: 0,//门店券0，线上券1
    category: 3,
    selectCardone: 0,
    selectCardtwo: 0,
    selectCardthree: 0,
    mendiancard: '',
    onlinecard: '',
    shopCard: ''
  },
  getCoupon() {
    wx.navigateTo({
      url: '../index-new/shop-promotion',
    })
  },
  closeBtn(){
    this.goSelect();
  },
  // 点击弹出选择券类型
  goSelect() {
    var showHide = this.data.showHide;
    this.setData({
      showHide: !showHide
    });
  },
  goInput() {
    wx.navigateTo({
      url: './search-card'
    })
  },
  // 选择券类型
  goChooseCard(e) {
    var that = this;
    // 事件代理拿到点击目标
    var { indexSelect, expired, normal, used} = that.data.indexSelect;
    var select = e.target.dataset.select;
    if (indexSelect == select) { return;}
    that.setData({
      indexSelect: select, expired: [], normal: [], used: [], loadingone:true,loadingtwo:true,loadingthress:true, showHide: true, pagesone: 1,
      pagestwo: 1,
      pagesthree: 1,
    });
    if (select == 0) {
      this.setData({
        typeText: '线上券',
        category: 1,
        onlinecard: 'onlinecard',
        mendiancard: '',
        xianshangCard: 'xianshangCard',
        shopCard: ''
      });
    } else if (select == 1) {
      this.setData({
        typeText: '门店券',
        category: 3,
        mendiancard: 'mendiancard',
        onlinecard: '',
        xianshangCard: '',
        shopCard: 'shopCard'
      });
    }
    that.loadData1(that);
    that.loadData2(that);
    that.loadData3(that);
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
      that.loadData1(that);

    }, 1000)
  },
  pullUpLoadtwo(e) {
    var that = this;
    var { loadingtwo, pagestwo } = that.data;
    if (!loadingtwo) {//全部加载完成
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    pagestwo++;
    that.setData({
      pagestwo: pagestwo
    })
    setTimeout(function () {
      that.loadData2(that);

    }, 1000)
  },
  pullUpLoadthree(e) {
    var that = this;
    var { loadingthree, pagesthree } = that.data;
    if (!loadingthree) {//全部加载完成
      return;
    }
    wx.showLoading({
      title: '加载中',
    })

    pagesthree++;
    that.setData({
      pagesthree: pagesthree
    })
    setTimeout(function () {
      that.loadData3(that);

    }, 1000)
  },
  onLoad: function (options) {
    var that = this;
    var store_id = app.store_id;//store_id
    var uid = wx.getStorageSync('userUid');
    that.setData({
      mendiancard: 'mendiancard',
      shopCard: "shopCard",uid,store_id
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    that.loadData1(that);
    
  },

  loadAll(){
    var that=this;
    that.loadData1(that);
    that.loadData2(that);
    that.loadData3(that);
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
    let currentIndex = event.detail.current;
    console.log('swiperChange：' + currentIndex);
    var that = this;
    this.setData({
      curActIndex: currentIndex,
      dataStatus: currentIndex
    });
    let isLoaded2 = that.data.isLoaded2;
    let isLoaded3 = that.data.isLoaded3;
    if(currentIndex==1&&!isLoaded2){
      wx.showLoading({ title: '加载中' });
      that.loadData2(that);
    } else if (currentIndex == 2 && !isLoaded3){
      wx.showLoading({ title: '加载中' });
      that.loadData3(that);
    }
  },
  // 点击切换
  swichSwiperItem: function (event) {
    console.log('swichSwiperItem：' + event.target.dataset.idx);
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
  loadData1: function (that) {
    var { normal=[], pagesone, store_id, uid, category } = that.data;//msgList长度;0/1之间判断切换
    var params = {
      page: pagesone, store_id, uid: uid, type: 'unused', category
    }
    console.log('params..',params);
    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, reps) => {
        wx.hideLoading();
      if (err && reps.err_code != 0) return;
      var { image, coupon_list=[], next_page } = reps.err_msg;
      var list = [...normal, ...coupon_list];
      //更新数据
      that.setData({
        loadingone: next_page,
        loading: false,
        normal: list,
        image: image,
      });
      wx.hideLoading();
    });
  },
  loadData2: function (that) {
    var { expiredMsg, expired, ex_image, pagestwo, store_id, uid, category, loadingtwo } = that.data;
    
    var params = {
      page: pagestwo, store_id, uid: uid, type: 'expired', category
    }
    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, reps) => {
      wx.hideLoading();
      if (err && reps.err_code != 0) return;
      that.setData({
        isLoaded2: true
      });
      var { image, coupon_list, next_page, next_page } = reps.err_msg;
      var list = [...expired, ...coupon_list];
      var imageList = [...image, ...ex_image];
      //更新数据
      that.setData({
        loadingtwo: next_page,
        loading: false,
        expired: list,
        ex_image: imageList,
      });
      wx.hideLoading();
    });
  },
  loadData3: function (that) {
    var { usedMsg, used, use_image, pagesthree, store_id, uid, category } = that.data;
  
    var params = {
      page: pagesthree, store_id, uid: uid, type: 'use', category
    }

    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, reps) => {
      wx.hideLoading();
      if (err && reps.err_code != 0) return;
      that.setData({
        isLoaded3: true
      });
      var { image, coupon_list, next_page, next_page } = reps.err_msg;
      var list = [...used, ...coupon_list];
      var imageList = [...image, ...use_image];
     
      //更新数据
      that.setData({
        loadingthree: next_page,
        loading: false,
        used: list,
        use_image: imageList,
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
      // 门店券
      wx.navigateTo({
        url: './card_summary?id=' + id + '&distinguish=' + distinguish
      })
    } else {
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