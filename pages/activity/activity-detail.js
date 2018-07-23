// page/common/pages/activity-detail.js
let app = getApp();
const _urlDetail = "wxapp.php?c=voucher&a=voucher_info";//获取活动详情   有活动id
const _urlDetail_v2 = "wxapp.php?c=voucher&a=store_voucher";//获取活动详情  没有活动id的
var WxParse = require('../../utils/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeId: app.store_id,//店铺id
    id:null,//活动id
    uid: null,
    activity_detail:'',//活动内容
    title: '',//活动标题
    date_msg:'', //活动日期
    //富文本内容处理
    dkheight: 300,
    able:1,//1可以参与，0不可以
    dkcontent: "你好<br/>nihao, <br/><br/><br/><br/><br/><br/><br/>这个是测试<br/><br/>你同意了吗<br/><br/><br/>hehe<b>n你好啊，我加粗了kk</b >",  //富文本测试内容,
    uid:'',
    error:null,
    limit:0,//參與次數0不限制
    tip:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获得高度
    let winPage = this;
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log('高度是=',winHeight);
        winPage.setData({
          dkheight: winHeight - winHeight * 0.05 - 80
        })
      }
    })

    let {id,uid} = this.data;
    uid = wx.getStorageSync("userUid");
    if(uid){
      console.log('uid',uid);
      this.setData({uid})
      if (options.id) { id = options.id;this.setData({ id: options.id }) }
      // this.getData(id);
    }else{
      wx.switchTab({
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
    let { id, uid } = this.data;
    uid = wx.getStorageSync("userUid");
    if (uid) {
      console.log('uid', uid);
      this.setData({ uid })
      this.getData(id,uid);
    } else {
      wx.switchTab({
        url: '../index-new/index-new',
      })
    }
  },
  getData(id){
    let that = this;
    if (!id) { 
      var params = {
        uid: that.data.uid,
        store_id: that.data.storeId
      }
      var postUrl = _urlDetail_v2;
    
    }else{
      var params = {
        id: id,
        uid: that.data.uid,
        store_id: that.data.storeId
      }
      var postUrl = _urlDetail;

    }
    console.log('参数',params,'相片活动请求的url=', postUrl);
    app.api.postApi(postUrl, { params},(err,rep)=>{
      console.log('返回数据',rep);
      if (err || rep.err_code != 0) {
       that._showError(rep.err_msg);
      ;return;}
      var date_msg = rep.err_msg.start_time_date + ' 至 ' + rep.err_msg.end_time_date;
      WxParse.wxParse('activity_detail', 'html', rep.err_msg.detail, that, 5);
     // WxParse.wxParse('dkheight', 'html', that.data.dkcontent, that, 5); //富文本测试内容
 
      that.setData({
        "title": rep.err_msg.title,
        "date_msg": date_msg,
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
    if (able!=1){
      this.setData({error:'有错'});return;
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