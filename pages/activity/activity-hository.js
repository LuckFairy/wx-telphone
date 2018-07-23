var app = getApp();
const activityHistoryUrl = 'wxapp.php?c=voucher&a=join_record';//我的参与记录接口
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cat_list: '',
    store_id: app.store_id,//店铺id
    uid : wx.getStorageSync('userUid'),
    passList: [],
    dataList: [],
    refuList:[],
    currentTab: 0,//默认是已通过
    status: 1,
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opts) {
    let uid = wx.getStorageSync('userUid');
    if(uid){
      this.setData({ uid});
      var list = [1,0,-1];
      for(var i in list){
        this.goToList(list[i]);
      }
      if(opts.page){
        this.setData({currentTab:opts.page})
      }
    }else{
      wx.redirectTo({
        url: '../index-new/index-new',
      })
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

  },
  //去详情
  goDetail(e){
    let that = this,{item} = e.target.dataset;
    var data = JSON.stringify(item);
    wx.navigateTo({
      url: `./activity-hosDet?data=${data}`,
    })
    
  },
  // 去查看
  goLook(){
    wx.navigateTo({
      url: './mycard',
    })
  },
  //重新上传
  goUp(e){
    var activity_id = e.currentTarget.dataset.activity_id;
    console.log('重新上传 活动id=', activity_id);
    var url = './activity-join?id=' + activity_id;
    wx.navigateTo({
      url
    })

  },
  // 滑动切换
  swiperChange: function (e) {
    console.log(e);
    var that = this;
    if (e.currentTarget.dataset.current){
      var insideTab = e.currentTarget.dataset.current;
    }else{
      var insideTab = e.detail.current;
    }
    that.setData({
      currentTab: insideTab,
    });


  },
  goToList(status) {
    var that = this;
    wx.showLoading({ title: '加载中...', mask: true, });
    var params = {
      uid: this.data.uid, 
      store_id: that.data.store_id,
      status
    }
    app.api.postApi(activityHistoryUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        return false;
      }
      var dataList = resp.err_msg;
      if(status==1){
        that.setData({
          passList: dataList,
        });
      }else if(status==0){
        that.setData({
          dataList: dataList,
        });
      }else{
        that.setData({
          refuList: dataList,
        });
      }
    });
  },

})