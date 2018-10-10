// page/distribution/my_record.js
const withDrawUrl ='app.php?c=drp_ucenter&a=extract_list';
const incomUrl ='app.php?c=drp_ucenter&a=brokeragetab_v2'
const app = getApp();
var store_id
Page({

  /**
   * 页面的初始数据
   */
  data: {

    index:0

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let index = options.type;
    let index = options.type;

    store_id = app.store_id;
    let title='';
    this.setData({
      index
    });
    if (index==0){
      title ='收支明细';
    }else{
      title ='提现记录'
    }
    wx.setNavigationBarTitle({
      title//页面标题为路由参数
    })
    this.getList(index);
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


  getList(index){
    let that=this;
    let params = { store_id, "uid": "83046", "page": "1" };

    if(index==0){
      app.api.postApi(incomUrl, { params }, (err, resp) => {
        // wx.hideLoading();
        if (resp && resp.err_code==0){
          that.setData({
            list0: resp.err_msg.result
          });

        }
      });
    }else{

      app.api.postApi(withDrawUrl, { params }, (err, resp) => {
        // wx.hideLoading();
        if (resp && resp.err_code == 0) {
          that.setData({
            list1: resp.err_msg.extract_list
          });

        }
      });

    }

  }

})