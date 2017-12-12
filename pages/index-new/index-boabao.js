// pages/index-new/index-boabao.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    tabList:0,
    dataList:{},
    cat_list:''
  },
  goToList(e){
    console.log(e,33443333)
    var that = this;
    var curTab = that.data.currentTab;
    var insideTab = e.currentTarget.dataset.current;
    var catId = e.currentTarget.dataset.catId;
    if (curTab == insideTab){
      return false;
    }else{
      that.setData({
        currentTab: insideTab,
        tabList: insideTab
      })
    }
    // var category_id;
    // if (insideTab == 0) {
    //   category_id = 79;
    // } else if (insideTab == 1) {
    //   category_id = 75;
    // } else if (insideTab == 2) {
    //   category_id = 81;
    // } else if (insideTab == 3) {
    //   category_id = 82;
    // } else if (insideTab == 4) {
    //   category_id = 83;
    // }
    wx.showLoading({
      title: '加载中'
    })
    wx.showLoading({ title: '加载中...', mask: true, });
    var params = {
      categoryId: catId
    }
    app.api.postApi('wxapp.php?c=product&a=babyCategory', { params }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 344444)
      var dataList = resp.err_msg.products
      that.setData({
        dataList: dataList
      });
    });  
  },
  goDetails (e){
    wx.showLoading({
      title: '加载中'
    })
    var categoryid = e.currentTarget.dataset.categoryid;
    var productid = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '../shopping/goods-detail?prodId='+productid
    })
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 5个tab数据 仅仅头部tab 不包括列表
    var that = this;
    app.api.fetchApi('wxapp.php?c=category&a=get_category_by_pid&categoryId=96', (err, response) => {
      wx.hideLoading();
      if (err) return;
      var cat_list = response.err_msg.cat_list;
      console.log("53423233423", cat_list);
      this.setData({ cat_list: cat_list });
    });
    // 5个tab数据结束
    // 选项卡载入时判断是进入哪一个
    var listId = options.listld;
    var catId = options.catId;
    var curTab = that.data.currentTab;
      that.setData({
        currentTab: listId,
        tabList: listId
      })
    var category_id;
    if (listId == 0){
      category_id = catId;
    } else if (listId == 1){
      category_id = catId
    } else if (listId == 2){
      category_id = catId
    } else if (listId == 3){
      category_id = catId
    } else if (listId == 4){
      category_id = catId
    }
    var params = {
      categoryId: category_id
    }
    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi('wxapp.php?c=product&a=babyCategory', { params }, (err, resp) => {
      wx.hideLoading();
      // 列表数据
      console.log(resp,344444)
      var dataList = resp.err_msg.products
      that.setData({
        dataList: dataList
      });
    });
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