// page/distribution/my_withdraw_detail.js
const AccoutUrl = 'app.php?c=drp_ucenter&a=fx_find_account';
const WithDrawUrl ='app.php?c=drp_ucenter&a=extract_info_v2';
const _detailUrl = "wxapp.php?c=fx_user&a=get_fx_detail";

var that;
const app = getApp();
var uid;
var hasLoad=false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:'去设置',
    account:null,
    blance:0,//余额
    money:0,
    store_id: app.store_id,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    uid = wx.getStorageSync("userUid");


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
    let store_id = this.data.store_id;
    let params = { store_id, uid};
   
    app.api.postApi(AccoutUrl, { params }, (err, reps) => {
      if (err && reps.err_code != 0) return;
      let account = reps.err_msg.fx_account;
      let tip = that.data.tip;
      if (account && account.bank_name) {
        tip = '去修改';
      }
      that.setData({
        tip
      });
      if(account){
        that.setData({
          account
        });
      }
    });
   

    app.api.postApi(_detailUrl, { params }, (err, rep) => {
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); return; }
      this.setData({ blance: rep.err_msg.forward_money });
    })
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
    let store_id = this.data.store_id;
    let blance = this.data.blance;
    let uid = wx.getStorageSync("userUid")

    let money=that.data.money;
    let accout=that.data.account;
    if (!money || money == 0 || money > blance){
      wx.showToast({
        title: '金额输入不正确！',
        icon: 'success',
        duration: 2000
      })
    }else if(!accout){

      wx.showToast({
        title: '请设置银行账户！',
        icon: 'success',
        duration: 2000
      })
    } else if (money >=50000){

      wx.showToast({
        title: '提现金额不得超过50000',
        icon: 'success',
        duration: 2000
      })

    }else{

      let params = { store_id, "uid": uid, "extract_money": money, "available_money": blance, "account_id": accout.id, "bank_id": accout.bank_id };


      app.api.postApi(WithDrawUrl, { params }, (err, reps) => {
        if (err && reps.err_code != 0) return;
        wx.showToast({
          title: reps.err_msg,
          success: function () {
            wx.navigateBack();
          }
        })
      });
      
 

    }


   


  }
  
})