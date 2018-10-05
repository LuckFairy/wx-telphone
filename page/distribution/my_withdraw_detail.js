// page/distribution/my_withdraw_detail.js
const AccoutUrl = 'app.php?c=drp_ucenter&a=fx_find_account';
const WithDrawUrl ='app.php?c=drp_ucenter&a=extract_info_v2';
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
    money:0,

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
   

    app.api.postApi(AccoutUrl, { params }, (err, reps) => {
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
  },

  bindMoneyInpu: function (e){

    this.setData({
      money: e.detail.value
    })

  },

  onOkClick(){
     let that=this;
    // let money=that.data.money;
    // let accout=that.data.account;
    // if(!money||money==0){
    //   wx.showToast({
    //     title: '金额输入不正确！',
    //     icon: 'success',
    //     duration: 2000
    //   })
    // }else if(!accout){

    //   wx.showToast({
    //     title: '请设置银行账户！',
    //     icon: 'success',
    //     duration: 2000
    //   })
    // }else{
      
    //   let params = { "store_id": store_id, "uid": "83046", "extract_money": "1", "available_money": "11", "account_id": "3", "bank_id": "1" };


    //   app.api.postApi(AccoutUrl, { params }, (err, reps) => {
    //     if (err && reps.err_code != 0) return;
    //     let account = reps.err_msg.fx_account;
    //     let tip = that.data.tip;
    //     if (account && account.bank_name) {
    //       tip = '去修改';
    //     }
    //     that.setData({
    //       account,
    //       tip
    //     });
    //   });

    // }

    let params = { "store_id": store_id, "uid": "83046", "extract_money": "1", "available_money": "11", "account_id": "3", "bank_id": "1" };


    app.api.postApi(WithDrawUrl, { params }, (err, reps) => {
      if (err && reps.err_code != 0) return;
      wx.showToast({
        title: reps.err_msg,
        success:function(){
          wx.navigateBack();
        }
      })
    });


  }
  
})