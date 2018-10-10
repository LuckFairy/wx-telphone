let app = getApp();
const getCategoryList = 'wxapp.php?c=fx_product&a=fx_product_list';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    dataLis:[],
    dataListone: [],
    dataListtwo: [],
    dataListthree: [],
    dataListthour: [],
    pageone:1,
    pagetwo:1,
    pagethree:1,
    pagethour:1,
    loadingone: true,
    loadingtwo: true,
    loadingthree: true,
    loadingthour: true,
    cat_list: '',
    store_id: app.store_id,//店铺id
    uid:null,
  },
  getDataList(e,opts) {
    let that = this, current = null, sort = null;
    let { dataListone, dataListtwo, dataListthree, dataListthour } = that.data;
    if (e) {//点击事件
      current = e.currentTarget.dataset.current;
      sort = e.currentTarget.dataset.sort;
      if(current==that.data.currentTab){return;}
      switch(current){
        case '0': that.setData({ loadingone: true }); break;
        case '1': that.setData({ loadingtwo: true }); break;
        case '2': that.setData({ loadingthree: true }); break;
        case '3': that.setData({ loadingthour: true }); break;
      }
    
    }
   
    let old = {
      store_id: that.data.store_id,
      uid:this.data.uid,
      sort: sort||'commission',
      page:1
    }
    let params = Object.assign(old,opts);
    console.log(params);

    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi(getCategoryList, { params }, (err, resp) => {
      wx.hideLoading();
      if(err||resp.err_code!=0){console.error(resp.err_msg);return;}
      let list = resp.err_msg.list || [], dataList=[];
      if (params.page > 1) { //翻页事件
         dataList = [...that.data.dataList, ...list];
         if(list.length>0){
           switch(params.sort){
             case 'commission': that.setData({ pageone: params.page }); break;
             case 'hot': that.setData({ pagetwo: params.page }); break;
             case 'new': that.setData({ pagethree: params.page }); break;
             case 'price': that.setData({ pagethour:params.page});break;
           }
         }else{
           switch (params.sort) {
             case 'commission': that.setData({ loadingone: false}); break;
             case 'hot': that.setData({ loadingtwo: false}); break;
             case 'new': that.setData({ loadingthree: false}); break;
             case 'price': that.setData({ loadingthour: false}); break;
           }
         }
      }else{
        dataList=list;
      }
      that.setData({
        dataList: dataList
      });
      if (current) { that.setData({ currentTab: current})}
    });
  },
  lower(){
    let that = this, opts = {}; 
    let { currentTab, loadingone, pageone, pagetwo, loadingtwo, pagethree, loadingthree, pagethour, loadingthour} = that.data;
    console.log(loadingone, loadingtwo, loadingthree, loadingthour)
    switch(currentTab){
      case '0': if (!loadingone) { return; } pageone++; opts.page = pageone; opts.sort = "commission"; that.getDataList(null, opts);break;
      case '1': if (!loadingtwo) { return; }pagetwo++; opts.page = pagetwo; opts.sort = "hot"; that.getDataList(null, opts);break;
      case '2': if (!loadingthree) { return; } pagethree++; opts.page = pagethree; opts.sort = "new"; that.getDataList(null, opts);break;
      case '3': if (!loadingthour) { return; } pagethour++; opts.page = pagethour; opts.sort = "price"; that.getDataList(null, opts);break;
    }
    
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
    let { currentTab} = that.data;
    var searchValue = e.detail.value;
    if (!searchValue) {
      switch (currentTab) {
        case '0': that.setData({ loadingone: true }); break;
        case '1': that.setData({ loadingtwo: true }); break;
        case '2': that.setData({ loadingthree: true }); break;
        case '3': that.setData({ loadingthour: true }); break;
      }
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