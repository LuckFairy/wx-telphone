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
  },
  goToList(e){
    
    var that = this;
    var curTab = that.data.currentTab;
    var insideTab = e.currentTarget.dataset.current;
    if (curTab == insideTab){
      return false;
    }else{
      that.setData({
        currentTab: insideTab,
        tabList: insideTab
      })
    }
    var category_id;
    if (insideTab == 0) {
      category_id = 88;
    } else if (insideTab == 1) {
      category_id = 89;
    } else if (insideTab == 2) {
      category_id = 90;
    } else if (insideTab == 3) {
      category_id = 91;
    } else if (insideTab == 4) {
      category_id = 92;
    }
    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi('shop/babyCategory', { "category_id": category_id }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 3737373);
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      var dataList = resp.data;
      that.setData({
        dataList: dataList
      });
    });
    
  },
  goDetails (e){
    wx.showLoading({
      title: '加载中'
    })
    console.log(e,222222222);
    var categoryid = e.currentTarget.dataset.categoryid;
    var productid = e.currentTarget.dataset.productid;
    console.log(categoryid, productid);
    wx.navigateTo({
      // url: '../shopping/goods-detail?cateId=' + categoryid + '&prodId=' + productid
      url: '../shopping/goods-detail?prodId='+productid
    })
    // wx.navigateTo({
    //   url: '../shopping/goods-detail?categoryid=153&categoryid=77'
    // })
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    // 选项卡载入时判断是进入哪一个
    console.log(options,"index");
    var listId = options.listld;
    var that = this;
    var curTab = that.data.currentTab;
      that.setData({
        currentTab: listId,
        tabList: listId
      })
    var category_id;
    if (listId == 0) {
      category_id = 88;
    } else if (listId == 1) {
      category_id = 89;
    } else if (listId == 2) {
      category_id = 90;
    } else if (listId == 3) {
      category_id = 91;
    } else if (listId == 4) {
      category_id = 92;
    }
    console.log("categoryId", category_id);
    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi('shop/babyCategory', { "category_id": category_id }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 3737373);
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      var dataList = resp.data;
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