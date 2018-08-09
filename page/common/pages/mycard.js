var app = getApp();
var _tapLock = false;    // 点击锁
const categoryUrl = 'wxapp.php?c=coupon&a=get_tag';//tab菜单接口

Page({
  data: {
    loading: true,
    loadingone: true,//待使用是否上拉刷新
    offlineData: [],//门店数据
    loadingtwo: true,//已过期是否上拉刷新
    onlineData: [],//线上数据
  
    status: true,
    windowHeight: '',
    windowWidth: '',
    msgList: [],
    usedMsg: [],
    onlineDataMsg: [],
    image: '',
    ex_image: '',
    use_image: '',
    scrollTop: 0,
    scrollHeight: 0,
    pagesone: 1,
    pagestwo: 1,
    pagesthree: 1,
    curActIndex: "",
    store_id: '',
    uid: '',

    tagData:[],//标签数据

    mendiancard: '',
    onlinecard: '',
    showHide: true,
    typeText: '全部',//菜单选项，默认是全部
    category:3,//线上券1，门店券3
    keynum: 0,//下拉选项下标，默认是全部0
    keyword: [],//下拉选项菜单

    // keyword:['全部','精选','奶粉','纸尿裤','玩具','棉品','辅食','其它'],//下拉选项菜单
  },
  getCoupon() {
    var store_id = app.store_id;
    wx.navigateTo({
      url: `./index-mom?categoryid=100&page=1&store_id=${store_id}`,
    })
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
  // 选择keyword全部，玩具等类型券
  goChooseCard(e) {
    var that = this;
    // 事件代理拿到点击目标
    var { keynum,keyword, onlineData, offlineData} = that.data;
    var index = e.target.dataset.select;//选项下标
    if (keynum == index) { return; }
    var typeText = keyword[index];
    that.setData({
      keynum: index, typeText, onlineData: [], offlineData: [], loadingone: true, loadingtwo: true, showHide: true, pagesone: 1, pagestwo: 1,
    })
    that.loadData1(that);
    that.loadData2(that);
  },
  // 选择门店券还是线上券
  goChooseCate(e){
    var that =this;
    var { category, onlineData, offlineData, used } = that.data;
    var select = e.target.dataset.select;//category数值
    if (category==select){return;}
    that.setData({
      category: select, onlineData: [], offlineData: [], loadingone: true, loadingtwo: true, loadingthress: true, showHide: true, pagesone: 1, pagestwo: 1, pagesthree: 1
    });
    that.loadData1(that);
    that.loadData2(that);
  },
  pullUpLoadone(e) {
    var that = this;
    var { loadingone, pagesone } = that.data;
    if (!loadingone) {//全部加载完成
      return;
    }
    wx.showLoading({ title: '加载中',mask:true });
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
  onLoad: function (options) {
    var that = this;
    that.setData({
      mendiancard:'mendiancard',
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    var store_id = app.store_id;//store_id
    var uid = wx.getStorageSync('userUid');
    that.setData({ curSwiperIdx: 0, curActIndex: 0, uid: uid, store_id: store_id });
    // 自动获取手机宽高
    that.loadData1(that);
    that.loadData2(that);
  
  },

  onReady: function () {
    var that=this;
    var store_id = app.store_id;
    var keyword = [];
    keyword.push(this.data.typeText);
    

    // 页面渲染完成
    var params = {
      store_id,
    }
    app.api.postApi(categoryUrl, { params }, (err, resp) => {
      wx.hideLoading();
      var activity_err_msg = resp.err_msg;
      if(activity_err_msg&&activity_err_msg.length>0){
        var j,len;
        var tagData=[];
        var defaultData = { tagId: 0};
        tagData.push(defaultData);
        for (j = 0, len = activity_err_msg.length; j < len; j++) {
          keyword.push(activity_err_msg[j].tagName);
          tagData.push(activity_err_msg[j]);
        }
        console.log(tagData);
        console.log(tagData[0].tagId);

        that.setData({
          keyword,
          tagData
        });
      }
      

      // that.setData({
      //   activity_err_msg
      // });
    });
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
    });
  },
  // 点击切换
  swichSwiperItem: function (event) {
    var that = this;
    this.setData({
      curSwiperIdx: event.target.dataset.idx,
      curActIndex: event.target.dataset.idx,
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
    var { offlineData = [], pagesone, store_id, uid, keynum, tagData} = that.data;//msgList长度;0/1之间判断切换
    var tagId = 0;
    if(keynum!=0){
      tagId=tagData[keynum].tagId;
    }
    
    var params = {
      page: pagesone, store_id, uid: uid, type: 3, tagId
    }
    app.api.postApi('wxapp.php?c=coupon&a=my_v2', { params }, (err, reps) => {
      wx.hideLoading();
      if (err && reps.err_code != 0) return;
      var { image, coupon_list = [], next_page } = reps.err_msg;
      var list = [...offlineData, ...coupon_list];
      //更新数据
      that.setData({
        loadingone: next_page,
        loading: false,
        offlineData: list,
        image: image,
      });
      wx.hideLoading();
    });
  },
  loadData2: function (that) {
    var { onlineData, pagestwo, store_id, uid, loadingtwo, keynum, tagData } = that.data;
    var tagId = 0;
    if (keynum != 0) {
      tagId = tagData[keynum].tagId;
    }

    var params = {
      page: pagestwo, store_id, uid: uid, type: 1, tagId
    }
    app.api.postApi('wxapp.php?c=coupon&a=my_v2', { params }, (err, reps) => {
      wx.hideLoading();
      if (err && reps.err_code != 0) return;
      that.setData({
        isLoaded2: true
      });
      var { image, coupon_list, next_page, next_page } = reps.err_msg;
      var list = [...onlineData, ...coupon_list];
      //更新数据
      that.setData({
        loadingtwo: next_page,
        loading: false,
        onlineData: list,
        image: image,
      });
      wx.hideLoading();
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
        url: './card_summary?id=' + id + '&distinguish=' + distinguish
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