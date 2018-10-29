// page/distribution/invite.js
let app = getApp();
const _get_user = "wxapp.php?c=fx_user_middle&a=get_self_user";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curActIndex:0,
    list0:[],
    list1:[],
    list2: [],
    storeId: app.store_id,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getCustomers(0);

  },

  getCustomers(index){
    let that=this;
    that.setData({
      curActIndex: index,
    });
    //分类(‘all’:全部客户,’my’:未跑路客户,’others’:已跑路客户)
    let type ='all';
    if(index==1){
      type ='my';
    }else if(index==2){
      type = 'others';
    }
    let fxid = wx.getStorageSync('fxid');
    if (fxid) {
      var params = {
        "fx_id": fxid,
        type,
        "store_id": this.data.storeId
      };
      app.api.postApi(_get_user, { params }, (err, resp) => {
        wx.hideLoading();
        if (resp) {
          if (resp.err_code == 0) {
            let list = resp.err_msg.data;

            if (index == 0) {
              that.setData({
                list0: list,
              });
            } else if (index == 1){
              that.setData({
                list1: list,
              });
            } else if (index == 2) {
              that.setData({
                list2: list,
              });
            }
            console.log(index + ' ：' + JSON.stringify(that.data.list0));

          }

        }

      });

    } else {
      wx.navigateBack();
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


  // 点击切换
  swichSwiperItem: function (event) {
    var that = this;
    let index = event.target.dataset.idx;
  
    that.getCustomers(index);
  },
  swiperChange: function (e) {
    console.log("current：" + e.detail.current);
    let index = e.detail.current;//待拼团对应下标
    let that = this;
    this.getCustomers(index);
  }



})