// pages/index-new/index-baokuan.js
var app = getApp();
let store_id = app.store_id;
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
    var { categoryid, page} = opt;
    var params = { "store_id": store_id, "page": page , "categoryid": categoryid };
    let url = 'wxapp.php?c=product&a=get_product_list';
    app.api.postApi(url, { "params": params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }

      let { err_code, err_msg: { products: data = [] } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }
      data = null ? [] : data;
      console.log(`爆款区数据 `, data);
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
      url: '../shopping/goods-detail?prodId=' + productid 
    })
    wx.hideLoading();
  },

  /**
* 首页爆款专区数据
*/
  loadBaoKuanData(categoryid) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getProductData(categoryid);
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(`参数 `,options);
    this.loadBaoKuanData(options)
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
    return { title: '爆款专区', path: '/pages/index-new/index-baokuan' }
  }
})