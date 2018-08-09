var app = getApp();
const getCategoryUrl = 'wxapp.php?c=category&a=get_category_by_pid';//宝宝title名称数据
const getCategoryList = 'wxapp.php?c=product&a=babyCategory';//宝宝列表数据
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    dataList: {},
    cat_list: '',
    store_id: app.store_id,//店铺id
  },
  goToList(e) {
    var that = this;
    var curTab = that.data.currentTab;
    var insideTab = e.currentTarget.dataset.current || curTab;
    var catId = e.currentTarget.dataset.catId || '92';
    if (curTab == insideTab) {
      return false;
    } 

    wx.showLoading({
      title: '加载中'
    })
    wx.showLoading({ title: '加载中...', mask: true, });
    var params = {
      categoryId: catId, store_id: that.data.store_id
    }
    app.api.postApi(getCategoryList, { params }, (err, resp) => {
      wx.hideLoading();
      var dataList = resp.err_msg.products || [];
      that.setData({
        dataList: dataList,
        currentTab: insideTab
      });
    });
  },
  getDataList(opts){
    var that = this;
    var curTab = opts.listId || that.data.currentTab;
    var catId =  opts.catId || '92';
    wx.showLoading({
      title: '加载中'
    })
    wx.showLoading({ title: '加载中...', mask: true, });
    var params = {
      categoryId: catId, store_id: that.data.store_id
    }
    app.api.postApi(getCategoryList, { params }, (err, resp) => {
      wx.hideLoading();
      var dataList = resp.err_msg.products
      that.setData({
        dataList: dataList,
        currentTab: curTab
      });
    });
  },
  goDetails(e) {
    wx.showLoading({
      title: '加载中'
    })
    var categoryid = e.currentTarget.dataset.categoryid;
    var productid = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: './goods-detail?prodId=' + productid
    })
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opts) {
    var that = this;
    // 5个tab数据 仅仅头部tab 不包括列表
    app.api.postApi('wxapp.php?c=index&a=get_icon', { params:{ store_id: that.data.store_id } }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        this.setData({
          cat_list: rep.err_msg.icon_list
        })
      }
    })
    //列表数据
    that.getDataList(opts);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})