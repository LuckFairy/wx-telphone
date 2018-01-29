// pages/cluster/submit-order.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
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


  //发送模板消息测试
  fromid: function (e) {
    console.log(e.detail.formId);
    var user_id = app.d.userId; //测试参数
    var formId = e.detail.formId;
    let url = 'buy/sendmsg';
    app.api.postApi(url, { user_id, formId}, (err, resp) => {
      //console.log({ err, resp });
      if (err) {
        //return this._showError('加载数据出错，请重试');
        wx.showToast({
          title: '加载数据出错，请重试',
          icon: 'loading',
          duration: 2000
        });
        return;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        //return this._showError(rtnMessage);
      }
      console.log('发送模板消息测试');
      console.log(data);

    });
  },


})