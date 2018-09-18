
var app = getApp();
let hasPhone = wx.getStorageSync('hasPhone');
let phone = wx.getStorageSync('phone');
let uid = wx.getStorageSync('userUid');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid,
    phone:null,
    hasPhone,//是否有手机login
  },
  getPhoneNumber(e) {
    let that = this;
    console.log(e.detail);
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      let iv = e.detail.iv,
        encryptedData = e.detail.encryptedData,
        locationid = wx.getStorageSync('locationid');
      var params = {
        iv,
        encryptedData,
        locationid
      }
      app.login(params);
    } else {
      that.setData({
        hasPhone: false
      })
    }
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    var that = this;
    //检查是否有手机号

    // app.checkphone().then(data => {
    //   console.log(data);
    //   that.setData({ hasPhone: true,uid:data.uid,phone:data.phone });
    //   app.globalData.uid = data.uid;
    //   app.globalData.phone = data.phone;
     
    //   wx.setStorageSync('userUid', data.uid); //存储uid
    //   wx.setStorageSync('phone', data.phone); //存储uid
    // }).catch(data => {
    //   that.setData({ hasPhone: false });
    // })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideShareMenu();
    let that =this;
    uid = wx.getStorageSync("userUid");
    phone = wx.getStorageSync("phone");
    if(!uid){
      that.setData({ hasPhone: false });
      wx.switchTab({
        url: '../home/index-new',
      })
    }else{
      that.setData({ hasPhone: true, uid: uid, phone: phone });
    }
  },

  /**手机号脱敏 */
  substring(str) {
    if (typeof str == 'string') { //参数为字符串类型
      let ruten = str.substring(3, 8); //提取字符串下标之间的字符。
      return str.replace(ruten, '*****'); //字符串中用字符替换另外字符，或替换一个与正则表达式匹配的子串。
    }
  },
  showPhone(opt){
    var phone = opt;
    phone = this.substring(phone);
    this.setData({phone})
  },
  /** 去设置页面*/
  goSetting() {
    wx.navigateTo({
      url: '../../my/pages/setting'
    });
  },
  goSearch (){
    wx.navigateTo({
      url: '../../common/pages/my-order'
    });
  },
  mycard (){
    wx.navigateTo({
      url: '../../common/pages/mycard'
    });
  },
  goMoney(){
    wx.navigateTo({
      url: '../../distribution/invite'
    });
  },
  gostore (){
    wx.navigateTo({
      url: '../../common/pages/store-list'
    });
  },
  goaddress (){
    wx.navigateTo({
      url: '../../common/pages/address-list?is_from_my=0'
    });
  },
  gogroup (e){
    var group = e.currentTarget.dataset.group
    wx.navigateTo({
      url: '../../common/pages/my-order?group=' + group
    });
  },
  goToList(e){
    var list = e.currentTarget.dataset.list
    wx.navigateTo({
      url: '../../common/pages/my-order?list=' + list
    });
  },
  goStoreServer(){
    wx.navigateTo({
      url: '../../my/pages/server-wechat'
    });
  },
  myGroupGo(){
    wx.navigateTo({
      url: '../../group-buying/my-order'
    });
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