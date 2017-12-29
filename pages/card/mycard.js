// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
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
    curActIndex: "",
    store_id: '',
    uid: '',
    image: '',
    ex_image: '',
    use_image: '',
    showHide: true,
    typeText: '门店券',
    category: 3,
    selectCardone: 0,
    selectCardtwo: 0,
    selectCardthree: 0

  },
  getCoupon() {
    wx.navigateTo({
      url: '../index-new/shop-promotion',
    })
  },
  // 点击弹出选择券类型
  goSelect() {
    this.setData({
      showHide: false
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
    var indexSelect = e.target.dataset.select;
    if (indexSelect == 0) {
      this.setData({
        typeText: '线上券',
        showHide: true,
        category: 1,
        pagesone: 1,
        pagestwo: 1,
        pagesthree: 1,
        selectCardone: 1,
        selectCardtwo: 1,
        selectCardthree: 1
      });
      console.log(that.data.normal.length, '线上券normal数据')
      that.loadData1(that);
      that.loadData2(that);
      that.loadData3(that);
    } else if (indexSelect == 1) {
      this.setData({
        typeText: '门店券',
        showHide: true,
        category: 3,
        pagesone: 1,
        pagestwo: 1,
        pagesthree: 1,
        selectCardone: 1,
        selectCardtwo: 1,
        selectCardthree: 1 // 判断是否切换
      });
      console.log(that.data.normal.length, '是否点击门店券normal数据')
      that.loadData1(that);
      that.loadData2(that);
      that.loadData3(that);
    }
  },
  pullUpLoadone(e) {
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
      wx.hideLoading();
    }, 1000)
    // 上拉加载结束 
  },
  pullUpLoadtwo(e) {
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
    // 扫码跳转判断
    var that = this;
    var num = 1;
    if (num < 5) {
      setTimeout(function () {

        var store_id = store_Id.store_Id();//store_id
        Api.signin();//获取以及存储openid、uid
        // 获取uid
        var uid = wx.getStorageSync('userUid');
        console.log(uid, store_id);
        that.setData({ curSwiperIdx: 0, curActIndex: 0, uid: uid, store_id: store_id });
        // 自动获取手机宽高
        wx.getSystemInfo({
          success: function (res) {
            that.setData({
              windowHeight: res.windowHeight,
              windowWidth: res.windowWidth
            })
          }
        })
        that.loadData1(that);
        that.loadData2(that);
        that.loadData3(that);
        num++;
      }, 2000)
    }



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
  loadData1: function (that) {
    console.log('loadData1');
    var selectCardone = that.data.selectCardone;//0/1之间判断切换
    console.log('判断是否切换线上线下1为已经切换', selectCardone)
    var msgList = that.data.msgList;//空数组
    console.log('msgList长度', msgList.length)
    if (selectCardone == 1) {
      msgList.splice(0, msgList.length);//splice方法直接更改原始数组以及返回被删除/更改的项目
      console.log('清空之后msgList长度', msgList.length)
    }
    var pagesone = that.data.pagesone;//页码
    var store_id = that.data.store_id;
    var uid = that.data.uid;
    var category = that.data.category;
    console.log('category', category)
    console.log(pagesone, store_id, uid)
    console.log('页码', pagesone)
    var params = {
      page: pagesone, store_id: store_id, uid: uid, type: 'unused', category: category
    }
    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, response) => {
      wx.hideLoading();
      if (err) return;
      // 数据是否为空，空时是空数组
      var coupon_list = response.err_msg.coupon_list;
      var image = response.err_msg.image;
      console.log(response, 'response');
      for (var j = 0; j < coupon_list.length; j++) {
        msgList.push(coupon_list[j]);
      }
      console.log('push之后msgList长度', msgList.length)
      //更新数据
      that.setData({
        loading: false,
        normal: msgList,
        image: image,
        selectCardone: 0
      });
      console.log('判断是否切换重置为0', that.data.selectCardone)
      console.log(that.data.normal.length, '加载时normal数据')
      wx.hideLoading();
    });
  },
  loadData2: function (that) {
    console.log('loadData2');
    var selectCardtwo = that.data.selectCardtwo;
    var expiredMsg = that.data.expiredMsg;//空数组
    if (selectCardtwo == 1) {
      expiredMsg.splice(0, expiredMsg.length);
    }
    var pagestwo = that.data.pagestwo;
    var store_id = that.data.store_id;
    var uid = that.data.uid;
    var category = that.data.category;
    console.log(pagestwo, store_id, uid)
    var params = {
      page: pagestwo, store_id: store_id, uid: uid, type: 'expired', category: category
    }
    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, response) => {
      if (err) return;
      console.log('res2', response);
      var expired = response.err_msg.coupon_list;
      var ex_image = response.err_msg.image;
      for (var r = 0; r < expired.length; r++) {
        expiredMsg.push(expired[r]);
      }
      //更新数据
      that.setData({
        loading: false,
        expired: expiredMsg,
        ex_image: ex_image,
        selectCardtwo: 0
      });
      wx.hideLoading();
    });
  },
  loadData3: function (that) {
    console.log('loadData3');
    var selectCardthree = that.data.selectCardthree;
    var usedMsg = that.data.usedMsg;
    if (selectCardthree == 1) {
      usedMsg.splice(0, usedMsg.length);
    }
    var pagesthree = that.data.pagesthree;
    var store_id = that.data.store_id;
    var uid = that.data.uid;
    var category = that.data.category;
    var params = {
      page: pagesthree, store_id: store_id, uid: uid, type: 'use', category: category
    }
    console.log('params', params)
    app.api.postApi('wxapp.php?c=coupon&a=my', { params }, (err, response) => {
      if (err) return;
      console.log('res3', response);
      var used = response.err_msg.coupon_list;
      var use_image = response.err_msg.image;
      for (var k = 0; k < used.length; k++) {
        usedMsg.push(used[k]);
      }
      //更新数据
      that.setData({
        loading: false,
        used: usedMsg,
        use_image: use_image,
        selectCardthree: 0
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