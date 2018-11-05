var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [], //数据数组
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.title) {
      wx.setNavigationBarTitle({
        title: options.title
      })
    }
    this.loadData(options)
  },
  /**
     * 加载商品列表数据
     */
  getProductData(opt) {
    var { categoryid, page, store_id, title } = opt;

    var params = { "store_id": store_id, "page": page, "categoryid": categoryid };
    let url = 'wxapp.php?c=product&a=get_product_list';
    app.api.postApi(url, { "params": params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      if(!resp.err_msg.products){return;}
      let { err_code, err_msg: { products: data = [] } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }
      data = null ? [] : data;
      if (data.length > 1) {
        for (var i in data) {
          data[i].diff = Number(data[i].original_price - data[i].price).toFixed(2);
        }
      }
      this.setData({ dataList: data });

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
* 专区数据
*/
  loadData(categoryid) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getProductData(categoryid);
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