// page/common/pages/activity-detail.js
let app = getApp();
const _urlDetail = "wxapp.php?c=voucher&a=voucher_info";//获取活动详情   有活动id
const _urlDetail_v2 = "wxapp.php?c=voucher&a=store_voucher";//获取活动详情  没有活动id的
let WxParse = require('../../../utils/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: app.store_id,//店铺id
    id:null,//活动id
    uid: null,
    ac_detail: {},
    ac_title: '',
    ac_time: '',

    able:1,//1可以参与，0不可以
    uid:'',
    error:null,
    limit:0,//參與次數0不限制
    tip:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {id,uid} = this.data;
    uid = wx.getStorageSync("userUid");
    if(uid){
      console.log('uid',uid);
      this.setData({uid})
      if (options.id) { id = options.id;this.setData({ id: options.id }) }
      // this.getData(id);
    }else{
      wx.switchTab({
        url: '../../tabBar/home/index-new',
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
    let { id, uid } = this.data;
    uid = wx.getStorageSync("userUid");
    if (uid) {
      console.log('uid', uid);
      this.setData({ uid })
      this.getData(id);
    } else {
      wx.switchTab({
        url: '../../tabBar/home/index-new',
      })
    }
  },
  getData(id,uid){
    let that = this;
    if (!id) { 
      var params = {
        uid:that.data.uid,
        store_id: that.data.storeId
      }
      var postUrl = _urlDetail_v2;
      
    }else{
      var params = {
        id: id,
        uid:that.data.uid,
        store_id: that.data.storeId
      }
      var postUrl = _urlDetail;

    }
    console.log('uid',that.data.uid,'相片活动请求的url=', postUrl);
    app.api.postApi(postUrl, { params},(err,rep)=>{
      if (err || rep.err_code != 0) {
        this.setData({ error: rep.err_msg,able:0});
      ;return;}
      let date_msg = rep.err_msg.start_time_date + ' 至 ' + rep.err_msg.end_time_date;
      WxParse.wxParse('ac_detail', 'html', rep.err_msg.detail, that);

      that.setData({
        "ac_title": rep.err_msg.title,
        "ac_time": date_msg,
        "able": rep.err_msg.able,
        "limit": rep.err_msg.limit,
        "id": rep.err_msg.id
      });
     
    })
  },
  gohisitory(e){
    this.setData({ error: null });
    var url = './activity-hository?page=1';
    wx.navigateTo({
      url,
    })
  },
  gojoin(e){
    var able = this.data.able;
    var limit = this.data.limit;
    if (able!=1){
      this.setData({ error:`本活动每人最多可参与${limit}次，您已参与过可去查看您的参与记录`});return;
    }
    var id = e.currentTarget.dataset.id;
    var url = './activity-join?id=' + id;
    wx.navigateTo({
      url,
    })
  },
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    this.setData({ tip: errorMsg });
    setTimeout(() => {
      this.setData({ tip: null });
    }, 3000);
    return false;
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