// page/distribution/bank.js
const url ='app.php?c=drp_ucenter&a=bank_info'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();

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

  },

  onItemClick(e){
    let value = e.target.dataset.value;
    let bankId = e.target.dataset.id

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({//直接给上移页面赋值
      bank: value,
      bankId: bankId
    });
    wx.navigateBack({
      delta: 1
    })
  },

  getList(){
    let that=this;
    app.api.postApi(url, {  }, (err, reps) => {
      if (err && reps.err_code != 0) return;
      that.setData({
        list: reps.err_msg.bank_info
      });
      wx.hideLoading();
    });
  }


})