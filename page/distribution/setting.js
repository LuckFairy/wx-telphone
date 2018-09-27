// page/distribution/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bank:'',
    card:'',
    name:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    if (currPage.data.bank != "") {
      this.setData({//将携带的参数赋值
        bank: currPage.data.bank
      });
    } 


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

  bindCardChange: function (e){
    this.setData({
      card: e.detail.value
    })
  },

  bindNameChange: function (e){
    this.setData({
      name: e.detail.value
    })

  },

  onOkClick(){

    let bank=this.data.bank;
    let card=this.data.card;
    let name=this.data.name;
    if(!bank){
      wx.showToast({
        title: '银行不能为空！',
        icon: 'success',
        duration: 2000
      })
      return;
    } else if (!card){
      wx.showToast({
        title: '卡号不能为空！',
        icon: 'success',
        duration: 2000
      })
      return;
    } else if (!name) {
      wx.showToast({
        title: '姓名不能为空！',
        icon: 'success',
        duration: 2000
      })
      return;
    }

    let data = this.data;

    wx.setStorage({
      key: 'bankAccount',
      data: data,
      success:function(){
        wx.navigateBack(); 
      }
    })


  },
  onBankClick(){
    wx.navigateTo({
      url: './bank'
    });
  }

})