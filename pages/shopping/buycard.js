// pages/card/mycard.js
var app = getApp();
var _tapLock = false;    // 点击锁
Page({
  data: {
    loading: true,
    status:true,
    windowHeight:'',
    windowWidth:'',
    msgList: [],
    usedMsg:[],
    expiredMsg:[],
    scrollTop: 0,
    scrollHeight: 0,
    pagesone: 1,
    pagestwo: 1,
    pagesthree:1,
    dataStatus:0,
    //2017年12月22日16:50:36
    normal_coupon_count:0, //可用优惠券数量
    unnormal_coupon_count: 0, //不可用优惠券数量
    //2017年12月25日10:43:12
    couponInfo:[],
  },
  pullUpLoadone(e) {
    return ;//不需要这个东西 2017年12月25日10:01:39 by leo
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function(){
      var pagesone = that.data.pagesone;
          pagesone++;
          that.setData({
            pagesone: pagesone
          })
          that.loadData1(that);
          wx.hideLoading()
    },1000)
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
    // 页面初始化 options为页面跳转所带来的参数
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
    that.loadCouponData();
    //that.loadData1(that);
    //that.loadData2(that);
    //that.loadData3(that);

    var userOpenid = wx.getStorageSync("userOpenid");
    var uid = wx.getStorageSync('userUid');
    if (!userOpenid){
      that.loadData1(that);
      //that.loadData2(that);
      //that.loadData3(that);
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

  loadData1: function (that){
    var that = this;
    wx.showLoading({
      title: '加载中'
    })
    var params = {
      "uid": 91,
      "store_id": 6,
      "product_id": 23,
      "total_price": "79"
    };

    console.log('线上优惠券列表(可用和不可用)请求参数params=', params);
    var allMsg = that.data.msgList;
    var pagesone = that.data.pagesone;
    var url = 'wxapp.php?c=coupon&a=store_coupon_use';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      
      if (resp) {
        
        if (resp.err_code == 0) {
          console.log('resp.err_code == 0');
          if (resp.err_msg.coupon_list) {
            console.log('resp.err_msg.coupon_list存在');

            var normalList = resp.err_msg.coupon_list['normal_coupon_list'];
              console.log('normalList', normalList);
              for (var j = 0; j < normalList.length; j++) {
                allMsg.push(normalList[j]);
              }
              //更新数据
              that.setData({
                loading: false,
                normal: allMsg,
                normal_coupon_count: resp.err_msg.normal_coupon_count,
                unnormal_coupon_count: resp.err_msg.unnormal_coupon_count
              });
              
          }
        } else {
          console.log('resp.err_code ！= 0');
          return;
        }

      }
      console.log('normal', this.data.normal);
    });  
  },
    loadData2: function (that) {
      var that = this;
      wx.showLoading({
        title: '加载中'
      })
      var params = {
        "uid": 91,
        "store_id": 6,
        "product_id": 23,
        "total_price": "79"
      };

      console.log('线上优惠券列表(可用和不可用)请求参数params=', params);
      var expiredMsg = that.data.expiredMsg;
      var pagestwo = that.data.pagestwo;
      var url = 'wxapp.php?c=coupon&a=store_coupon_use';
      app.api.postApi(url, { params }, (err, resp) => {
        wx.hideLoading();

        if (resp) {

          if (resp.err_code == 0) {
            console.log('resp.err_code == 0');
            if (resp.err_msg.coupon_list) {
              console.log('resp.err_msg.coupon_list存在');

              var normalList = resp.err_msg.coupon_list['normal_coupon_list'];
              console.log('normalList', normalList);
              for (var j = 0; j < normalList.length; j++) {
                allMsg.push(normalList[j]);
              }
              //更新数据
              that.setData({
                loading: false,
                normal: allMsg,
                normal_coupon_count: resp.err_msg.normal_coupon_count,
                unnormal_coupon_count: resp.err_msg.unnormal_coupon_count
              });

            }
          } else {
            console.log('resp.err_code ！= 0');
            return;
          }

        }
        console.log('normal', this.data.normal);
      }); 





      console.log(pagestwo, "2222222222222222222222222222222222222222222222")
      var userOpenid = wx.getStorageSync("userOpenid");
      app.api.postApi('card/my_newer', { page: pagestwo, perPage: 10, dataStatus: 1, userOpenid: userOpenid}, (err, response) => {
        if (err) return;
        var rtnCode = response.rtnCode;
        if (rtnCode != 0) return;
        var expired = response.data.expired;
        for (var r = 0; r < expired.length; r++) {
          expiredMsg.push(expired[r]);
        }
        //更新数据
        that.setData({
          loading: false,
          expired: expiredMsg
        });
        wx.hideLoading();
      }); 
  },
    loadData3: function (that) {
      var usedMsg = that.data.usedMsg;
      var pagesthree = that.data.pagesthree;
      console.log(pagesthree, "333333333333333333333333333333333333333333333333333")
      var userOpenid = wx.getStorageSync("userOpenid");
      app.api.postApi('card/my_newer', { page: pagesthree, perPage: 10, dataStatus: 2, userOpenid: userOpenid}, (err, response) => {
        if (err) return;
        var rtnCode = response.rtnCode;
        if (rtnCode != 0) return;
        var used = response.data.used;
        for (var k = 0; k < used.length; k++) {
          usedMsg.push(used[k]);
        }
        //更新数据
        that.setData({
          loading: false,
          used: usedMsg
        });
        wx.hideLoading();
      }); 
    },

















  // loadData: function (that) {
  //     var dataStatus = that.data.dataStatus;
  //     if (dataStatus==0){
  //       var allMsg = that.data.msgList;
  //       var pagesone = that.data.pagesone;
  //       app.api.postApi('card/my_newer', { page: pagesone, perPage: 10, dataStatus: dataStatus }, (err, response) => {
  //         if (err) return;
  //         var rtnCode = response.rtnCode;
  //         var normalList = response.data.normal;
  //         if (rtnCode != 0) return;
  //         for (var j = 0; j < normalList.length; j++) {
  //           allMsg.splice(0, 0, normalList[j]);
  //         }
  //         //更新数据
  //         that.setData({
  //           loading: false,
  //           normal: allMsg
  //         });
  //         wx.hideLoading();
  //       }); 
  //     } else if (dataStatus == 1){
  //       var expiredMsg = that.data.expiredMsg;
  //       var pagestwo = that.data.pagestwo;
  //       app.api.postApi('card/my_newer', { page: pagestwo, perPage: 10, dataStatus: dataStatus}, (err, response) => {
  //         console.log(response,"0000000000000000000000000000000000000000000000000000000000000000000000")
  //         if (err) return;
  //         var rtnCode = response.rtnCode;
  //         if (rtnCode != 0) return;
  //         var expired = response.data.expired;
  //         for (var r = 0; r < expired.length; r++) {
  //           expiredMsg.splice(0, 0, expired[r]);
  //         }
  //         //更新数据
  //         that.setData({
  //           loading: false,
  //           expired: expiredMsg
  //         });
  //         wx.hideLoading();
  //       }); 
  //     } else if (dataStatus == 2){
  //       var usedMsg = that.data.usedMsg;
  //       var pagesthree = that.data.pagesthree;
  //       app.api.postApi('card/my_newer', { page: pagesthree, perPage: 10, dataStatus: 2 }, (err, response) => {
  //         if (err) return;
  //         var rtnCode = response.rtnCode;
  //         if (rtnCode != 0) return;
  //         var used = response.data.used;
  //         for (var k = 0; k < used.length; k++) {
  //           usedMsg.splice(0, 0, used[k]);
  //         }
  //         //更新数据
  //         that.setData({
  //           loading: false,
  //           used: usedMsg
  //         });
  //         wx.hideLoading();
  //       }); 
  //     }
  // },

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
  loadCouponData: function (that) {
    var that = this;
    wx.showLoading({
      title: '加载中'
    })
    var params = {
      "uid": 91,
      "store_id": 6,
      "product_id": 23,
      "total_price": "79"
    };

    console.log('线上优惠券列表(可用和不可用)请求参数params=', params);

    var url = 'wxapp.php?c=coupon&a=store_coupon_use';
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();

      if (resp) {

        if (resp.err_code == 0) {
          console.log('resp.err_code == 0');
          if (resp.err_msg.coupon_list) {
            console.log('resp.err_msg.coupon_list存在');

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
        } else {          
          return;
        }

      }
      console.log('normal', this.data.normal);
      console.log('expired', this.data.expired);
    });
  },
  //选择优惠券
  selectCoupon(e) {
    let that = this;
    let recId = e.currentTarget.dataset.recid;
    let couponid = e.currentTarget.dataset.couponid;
    let cname = e.currentTarget.dataset.cname;
    let face_money = e.currentTarget.dataset.face_money;
    var couponInfo = [];
    couponInfo.push(couponid);
    couponInfo.push(cname);
    couponInfo.push(face_money);

    // couponInfo['couponid'] = couponid;
    // couponInfo['cname'] = cname;
    // couponInfo['face_money'] = face_money;
    that.setData({
      couponInfo: couponInfo
    })
    console.log('选择的优惠券信息',couponInfo);
    
    //wx.setStorageSync('couponInfo', couponInfo);//存储选择的优惠券的信息couponInfo
    //console.log('88888888', this.data.couponInfo);
    wx.setStorageSync('couponInfo', this.data.couponInfo)
  },

})