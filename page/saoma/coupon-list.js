// pages/saoma/coupon-list.js
const app = getApp();
let store_id = app.globalData.sid;
let uid = app.globalData.uid;
let that, ids=[];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    store_id: store_id,
    uid: uid,
    // shopCoupon: [], //线上优惠券
    coupon_value: [],//线上优惠券面值数组
    page:1,//当前页数
    page_total:null//总页数
    // coupon_list: [],//线上优惠券数组
    // showList: false,//是否显示优惠券列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    store_id = app.globalData.sid;
    uid = app.globalData.uid;
    if (!uid) {
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
      return;
    }
    var cart_list = JSON.parse(options.cart_list);
    var carLength = cart_list.length;
    if (carLength == 0) {
      wx.redirectTo({
        url: './saoma-index'
      })
      return;
    }
    console.log(cart_list, carLength);
    for (var i = 0; i < carLength; i++) {
      ids[i] = cart_list[i].product_id;
    }
   
    that.loadCoupon();

  },
  loadCoupon(page=1){
    let { coupon_value, page_total}=that.data;
    var params = {
      uid, uid,
      sid: store_id,
      ids: ids, page
    }
    //线上优惠券信息
    app.api.postApi('wxapp.php?c=coupon&c=coupon_v2&a=inventory', { params }, (err, resp) => {
      if (resp.err_code == 0) {
        page_total = resp.err_msg.page.page_total;
        coupon_value = [...coupon_value, ...resp.err_msg.item];
        that.setData({
          coupon_value, page_total
        });
      }
    });  
  },
  lower(){
    let { page, page_total}=that.data;
    if (page >= page_total){return;}
    page++;
    that.loadCoupon(page);
  },
  // 领取优惠券
  getCoupon(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    console.log("index："+index);
    var params = {
      "uid": uid,
      "store_id":store_id,
      "id": e.currentTarget.dataset.couponId
    };
    app.api.postApi('wxapp.php?c=coupon&a=get_coupon', { params }, (err, resp) => {
      if (err || resp.err_code != 0) {
        var error = err || resp.err_msg;
        that._showError(error);
        return;
      }
      if (resp.err_code == 0) {
        var coupon_value = that.data.coupon_value;
        coupon_value[index].is_get = 0;
        that.setData({
          coupon_value
        })
        wx.showToast({
          title: '领取成功',
          icon: 'success',
          duration: 2000
        })
      }
    });
  },
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../image/group-mes.png', mask: true });
    return false;
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
  
  }
})