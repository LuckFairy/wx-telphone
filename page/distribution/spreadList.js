let app = getApp();
const getCategoryList = 'wxapp.php?c=fx_product&a=fx_product_list';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    dataList: {},
    pageone:1,
    pagetwo:1,
    pagethree:1,
    pagethour:1,
    cat_list: '',
    store_id: app.store_id,//店铺id
    uid:null,
  },
  getDataList(e,opts) {
    let that = this,current=null,sort=null;
    if (e) {
      current = e.currentTarget.dataset.current;
      sort = e.currentTarget.dataset.sort;
      if(current==that.data.currentTab){return;}
    }
    let old = {
      store_id: that.data.store_id,
      uid:this.data.uid,
      sort: sort||'commission',
      page:1
    }
    
    wx.showLoading({
      title: '加载中'
    })
    wx.showLoading({ title: '加载中...', mask: true, });
    let params = Object.assign(old,opts);
    app.api.postApi(getCategoryList, { params }, (err, resp) => {
      wx.hideLoading();
      if(err||resp.err_code!=0){console.error(resp.err_msg);return;}
      let dataList = resp.err_msg.list;
      
      that.setData({
        dataList: dataList,
      });
      if (current) { that.setData({ currentTab: current})}
    });
  },
  lower(){
    let that = this,opts={};let { currentTab,pageone,pagetwo,pagethree,pagethour} = that.data;
    switch(currentTab){
      case 0:pageone++;opts.page = pageone;break;
      case 2:pagetwo++;opts.page = pagetwo;break;
      case 2:pagethree++;opts.page = pagethree;break;
      case 3:pagethour++;opts.page = pagethour;break;
    }
    that.getDataList(null,opts);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opts) {
    var that = this;
    let uid = wx.getStorageSync("userUid");
    that.setData({uid})
    //列表数据
    that.getDataList(null,opts);
  },
  // 搜索卡包
  searchCard(e) {
    var that = this,opts={};
    var searchValue = e.detail.value;//搜索值
    if (searchValue) {
      opts.keyword = searchValue;
      that.getDataList(null, opts);
    }
  
  },
  goNull(e) {
    var that = this,opts={};
    var searchValue = e.detail.value;
    if (!searchValue) {
      that.getDataList(null, opts);
    }
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