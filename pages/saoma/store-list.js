// pages/store/store-list.js
var app = getApp();
let phy_id = null;//选择的门店id
const physicalUrl = 'wxapp.php?c=physical&a=qrcode_physical_list';//门店列表老接口
const physicalNewUrl = 'wxapp.php?c=physical&a=physical_list';//门店列表新接口


let store_id = app.store_id;
let uid = app.globalData.uid;
let logLat = app.globalData.logLat;

Page({
  data: {
    pageData: null,        // 门店列表数据
    page: 1,
    windowHeight: '',
    windowWidth: '',
    physical_list: [],
    checkModel: false,//默认是门店指南模块
    index: false,//是否是首页切换门店
    physicalClost: '',//最近门店信息
    locationTip:'正在定位，请稍等..',
 
  },
  onLoad: function (options) {
    // let store_id = app.store_id;
    // let uid = wx.getStorageSync('userUid');
    // let logLat = wx.getStorageSync('logLat');

    // this.setData({
    //   store_id,uid,logLat
    // })
    var { check, index } = options;
    if (check) {
      this.setData({ checkModel: true, index }); wx.setNavigationBarTitle({
        title: '门店列表'
      })
    };

    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    // 自动获取手机宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    this._loadData();
  },
  gobottom(e) {
    console.log(e);
    var that = this;
    var page = that.data.page;
    page++
    that.setData({
      page
    })
    that._loadData();
  },
  /**
   * 首页选择门店
   */
  selectPhysical(e) {
    let { locationId, index, type } = e.currentTarget.dataset;
    let that = this;
    var list = that.data.physical_list;
    list[index].select_physical = (list[index].select_physical==0?1:1);
    var select = list[index].select_physical;
    for (let i = 0; i < list.length; i++) {
      if (i != index) { list[i].select_physical = 0}
    }
    that.setData({
      physical_list: list,
      physicalClost:list[index]
    })
    phy_id = locationId;
  },
  setStore() {
    var params = { "store_id":this.data.store_id, "uid":this.data.uid, "physical_id":phy_id }
    var url = 'wxapp.php?c=physical&a=select_physical';
    app.api.postApi(url, { params }, (err, resp) => {

      if (resp.err_code == 0){
        console.log('更改门店成功');
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setLocation(this.data.physicalClost);
      }
      if(resp.err_code==0 || resp.err_code==1001){
        wx.navigateBack();
      }
    })
    
  },
  /**
   * 选择门店
   */
  checkStore(e) {
    var phy_id = e.currentTarget.dataset.locationId;

    var params = { "store_id": store_id, "uid":uid, "physical_id": phy_id }
    var url = 'wxapp.php?c=physical&a=select_physical';
    app.api.postApi(url, { params }, (err, resp) => {

      // if (resp.err_code == 0) {
      //   console.log('更改门店成功');
      //   let pages = getCurrentPages();
      //   let prevPage = pages[pages.length - 2];
      //   prevPage.setLocation(this.data.physicalClost);
      // }
      if (resp.err_code == 0 || resp.err_code == 1001) {
        console.log('更改门店成功');
        wx.navigateBack();
      }
    })

    // let pages = getCurrentPages();
    // let prevPage = pages[pages.length - 2];
    // prevPage.loadLocation(phy_id);
    // wx.navigateBack();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },

  /**
   * 加载页面数据  加载门店列表数据
   */
  _loadData() {
    var that = this;
    // let logLat = that.data.logLat;
    // let uid = that.data.uid;
    // let store_id = that.data.store_id;

    if(that.data.check){
      if(!logLat || logLat == ''){return;}
      var url = physicalNewUrl;
      var params = {
          uid,
          store_id,
          page: '1',
          long: logLat[0],
          lat: logLat[1]
        }
    }else{
      var url = physicalUrl;
      var params = {
        uid,
        store_id,
        page: '1',
        long: logLat[0],
        lat: logLat[1]
      }
    }

    wx.showLoading({
      title: '加载中'
    });
    app.api.postApi(url, { params }, (err, resp) => {
      console.log('门店指南。。。',resp);
      // 列表数据
      if (resp) {
        wx.hideLoading();
        if (resp.err_code == 0) {
          that.setData({
            physical_list: resp.err_msg.physical_list
          })
          if (that.data.index) {
            for (var j = 0; j < resp.err_msg.physical_list.length; j++) {
              if (resp.err_msg.physical_list[j].select_physical==1){
                phy_id = resp.err_msg.physical_list[j].phy_id;
              }
            }
          }
        } else {
          that.setData({
            locationTip: resp.err_msg.err_log
          })
          wx.showToast({
            title: '亲，没有数据了',
            image: '../../image/use-ruler.png',
            duration: 1000
          })
        }
      } 
    });
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})