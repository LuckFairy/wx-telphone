// page/distribution/my_withdraw_detail.js
const url = 'app.php?c=drp_ucenter&a=fx_find_account'
var that;
const app = getApp();
var store_id

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:'去设置',
    account:null,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    store_id = app.store_id;


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
    let params = { store_id, "uid": "83046"};
   

    app.api.postApi(url, { params }, (err, reps) => {
      if (err && reps.err_code != 0) return;
      let account = reps.err_msg.fx_account;
      let tip=that.data.tip;
      if (account && account.bank_name){
        tip = '去修改';
      }
      that.setData({
        account,
        tip
      });
    });

    // wx.getStorage({
    //   key: 'bankAccount',
    //   success: function(res) {
    //     console.log(res.data);
    //     let account = res.data;
    //     if(account){
    //       let tip ='去修改';
    //         that.setData({
    //           account,
    //           tip
    //         })
    //     }
        
    //   },
    // })


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

  onSettingClick(){
    wx.navigateTo({
      url: './setting'
    });
  }
  
})