// pages/index-new/index-baokuan.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [], //数据数组
  },
  /**
   * 加载商品列表数据
   */
  getProductData(opt) {
    
    let url = 'wxapp.php?c=product&a=get_product_list';
    app.api.postApi(url, { "params": opt }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      console.log(`节日区数据 `, resp);
      var { err_code, err_msg: { products: data = [] } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }
      
      data = null ? [] : data;
      this.setData({ dataList: data });

    });
  },
  /**
* 首页爆款专区数据
*/
  loadData(opt) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    var { categoryid, page, store_id } = opt;
    var params = { "store_id": store_id, "page": page, "categoryid": categoryid };

    this.getProductData(params);
  },
  goDetails(e) {
    wx.showLoading({
      title: '加载中'
    })
    var categoryid = e.currentTarget.dataset.categoryid;
    var productid = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '../shopping/goods-detail?prodId=' + productid 
    })
    wx.hideLoading();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(`参数 `, options);
    this.loadData(options)
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