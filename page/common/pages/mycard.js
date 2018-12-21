let app = getApp();
var _tapLock = false;    // 点击锁
const categoryUrl = 'wxapp.php?c=coupon&a=my_coupon_card';//tab菜单接口

Page({
  data: {
    refreshone:false,//点击刷新
    offlineData: [],//门店数据
    loadingone: true,//待使用是否上拉刷新
    pagesone: 1,
    curSwiperIdx:0,
    store_id: '',
    uid: '',
    showHide: true,
    keyword:''

  },
  getCoupon() {
    var store_id = app.store_id;
    wx.navigateTo({
      url: `./index-mom?categoryid=100&page=1&store_id=${store_id}`,
    })
  },
 
  // 搜索卡包
  searchCard(e) {
    var that = this;
    var searchValue = e.detail.value;//搜索值
    if (searchValue) {
      that.setData({
        pagesone: 1,
        keyword: searchValue,
        offlineData: [],
      });
    }
    that.loadData1();
  },
  goNull(e) {
    var that = this;
    var searchValue = e.detail.value;
    if (!searchValue) {
      that.setData({
        pagesone: 1,
        keyword: '',
        offlineData: [],
      });
      that.loadData1();
    }
  },
  pullUpLoadone() {
    var that = this;
    var { loadingone, pagesone } = that.data;
    if (!loadingone) {//全部加载完成
      return;
    }
    wx.showLoading({ title: '加载中',mask:true });
    pagesone++;
    that.setData({ pagesone })
    setTimeout(function () {
      that.loadData1();
    }, 1000)
  },
  
  update(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      that.loadData1();
 
    }, 1000)
  },

  onLoad: function (options) {
    var that = this;
   
    var store_id = app.store_id;//store_id
    var uid = wx.getStorageSync('userUid') || 142734;
    that.setData({  uid: uid, store_id: store_id });
    that.loadData1();
  },

  onReady: function () {
    var that=this;
    var store_id = app.store_id;
  },
  onShow: function () {
    // 页面显示
    // let that = this;
    // that.setData({
    //   pagesone: 1,
    //   keyword: '',
    //   offlineData: []
    // })
    // that.loadData1();

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  goAll(e){
    console.log(e)
    let index = e.currentTarget.dataset.index;
    let package_id = this.data.offlineData[index].package_id;
 wx.navigateTo({
   url: `./allcard?package_id=${package_id}`,
 })

  },
  closeOverlay: function () {
    this.setData({ showOverlay: false });
  },
  showCheckQr: function (event) {
    let qrUrl = event.currentTarget.dataset.qrImageUrl;
    this.setData({ qrImageUrl: qrUrl, showOverlay: true });
  },
 
  //加载页面数据
  loadData1: function () {
    let that = this;
    let { offlineData, pagesone, store_id, uid, keyword} = that.data;
    var params = { "page": pagesone, "store_id": store_id, "uid": uid, "keyword": keyword }
    app.api.postApi(categoryUrl, { params }, (err, reps,code) => {
      wx.hideLoading();
      //网络异常
      if (err || code != 200 || reps.err_code != 0) {that.setData({ refreshone:true}); return;}
      var { card_list=[],image, next_page } = reps.err_msg;
      var list = [...offlineData, ...card_list];
      
      //更新数据
      that.setData({
        loadingone: next_page,
        refreshone: false,
        offlineData: list,
      });
    });
  },
  goHistory(e){
    wx.navigateTo({
      url: './mycardHistory'
    })
  },
  goDetail(e) {
    if (_tapLock) return;
    
    // 区分是否从卡包进入
    var distinguish = e.currentTarget.dataset.distinguish;
    var id = e.currentTarget.dataset.id;
    var _type = e.currentTarget.dataset.type;
    if (_type == 3) {
      // 门店券
      wx.navigateTo({
        url: './card_summary2?id=' + id + '&distinguish=' + distinguish
      })
    } else {
      wx.navigateTo({
        url: './index-boabao'
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