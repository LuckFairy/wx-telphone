// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
var that;
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
    dataStatus: 0,
    curActIndex: "",
    store_id: '',
    uid: '',
    image: '',
    showHide: true,
    typeText: '门店券',
    category: 3,
    selectedArray:[],
    submitText:'已选0张，可抵扣0.00元',
    normal: [{ cname: '咿呀20周年巨献抵用券', limit_money: '60', start_time_str: '2013', end_time_str: '2014', id: '124', card_no: '456', face_money: 89.69 }, { cname: '咿呀20周年巨献抵用券', limit_money: '60', start_time_str: '2013', end_time_str: '2014', id: '2222', card_no: '33333', face_money: 899 }]
  },

  onCheckChange: function (e) {
    var arrays = e.detail.value;
    var submitText;
    var size = arrays.length;
    if (size==0){
      submitText ='已选0张，可抵扣0.00元';
      console.log('submitText');
    }else{
      var total=0;
      var i,j;
      var normal = that.data.normal;
      for(i=0;i<size;i++){
        for (j = 0; j < normal.length;j++){
          if(arrays[i]==normal[j].id){
            total = total + normal[j].face_money;
          }
        }
      }
      submitText = "已选" + size+"张，可抵扣"+total+"元";
      console.log('total：', total);
    }

    that.setData({
      selectedArray: arrays,
      submitText: submitText
    });
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
    that = this;
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
   
  },
  loadData2: function (that) {
    console.log('loadData2');
    
  }

})