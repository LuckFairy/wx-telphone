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
    normal: [{ cname: '咿呀20周年巨献抵用券', limit_money: '60', start_time_str: '2013', end_time_str: '2014', id: '124', card_no: '456', face_money: 899 }, { cname: '咿呀20周年巨献抵用券', limit_money: '60', start_time_str: '2013', end_time_str: '2014', id: '2222', card_no: '33333', face_money: 899 }]
  },

  onCheckChange: function (e) {
    var arrays = e.detail.value;
    if(arrays.length==0){
      console.log('数组为空');
    }else{
      console.log('checkbox发生change事件，携带value值为：', arrays[0].id);
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
  onLoad: function (options) {
    var that = this;
    that.setData({
      mendiancard: 'mendiancard',
      shopCard: "shopCard"
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

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
  }

})