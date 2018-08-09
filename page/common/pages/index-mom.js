
var app = getApp();
let uid = wx.getStorageSync('userUid');
let openid = wx.getStorageSync('openid');
let store_id = app.store_id;
var isFirst = true;//是否首次进入页面
// let categoryUrl = 'wxapp.        php?c=coupon&a=get_category_activity';//tab菜单接口
const categoryUrl = 'wxapp.php?c=coupon&a=get_tag';//tab菜单接口
const listUrl = 'wxapp.php?c=coupon&a=coupon_list_v2';//获取分类列表数据
Page({

  /**
   * 页面的初始数据
   */
  data: {

    scrollLeftValue: 0,
    isPickerShow: false,
    isBgNeed: false,
    isEmpty:true,
    dataLength: 0,
    showBjHeight:0,//显示分类时下部分背景高度
    loadingone:false,//是否有下一页，true有，false没有
    current: 0,
    dataList:null,
    page:1,
    activityid:1,
    activity_err_msg:'',//tab列表
    logo: ''
  },

  navbarTap: function (e) {
    //将顶部导航栏自动移动到合适的位置
    var idx = e.currentTarget.dataset.idx;
    this.autoScrollTopNav(idx);

    //自动收回
    if (this.data.isPickerShow) {
      this.navbarBtnClick();
    }
    this.setData({
      current: idx
    })
    this.loadIndexData();
  },

  /**
 * 用于自动调整顶部类别滑动栏滑动距离，使滑动到用户可接受的合适位置，但自适应上还未考虑太周到
 * @param {number} idx - The index of currentTap.
 */
  autoScrollTopNav: function (idx) {
    if (idx <= 2) {
      this.data.scrollLeftValue = 0;
    } else {
      this.data.scrollLeftValue = (idx - 2) * 60;
    }
    this.setData({
      scrollLeftValue: this.data.scrollLeftValue
    })
  },

  /**
 * 页面左右滑动事件 - 构造滑动动画，若当前页面无数据，自动加载，需要完善加载函数
 */
  swiperChange: function (e) {
    var idx = e.detail.current;
    this.autoScrollTopNav(idx);

    this.setData({
      current: e.detail.current,
      isBgNeed:false,
      isPickerShow: false
    })
    this.loadIndexData();

    // //若无数据，自动加载
    // if (this.data.commodities[idx].length == 0) {
    //   this.downloadMoreItem();
    // }
  },

  /**
 * 导航栏右侧箭头按钮点击事件 - 切换模糊背景开闭状态以及展开栏开闭状态
 */
  navbarBtnClick: function (e) {
    this.data.isBgNeed = !this.data.isPickerShow
    this.setData({
      isBgNeed: this.data.isBgNeed
    })

    this.data.isPickerShow = !this.data.isPickerShow
    this.setData({
      isPickerShow: this.data.isPickerShow,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 拿到页码
    var page = that.data.page;
    var activityid = that.data.activityid;
    uid = wx.getStorageSync('userUid');//uid再次获取
    // 头部信息接口开始
    var params = {
      store_id,
     // cate_id:2
    }
    app.api.postApi(categoryUrl, { params}, (err, resp) => {
      wx.hideLoading();
      var activity_err_msg = resp.err_msg;
      that.setData({
        activity_err_msg
      });

      if(activity_err_msg){
        let tagId = activity_err_msg[0].tagId;
        if(tagId){
          that.setData({
            activityid: tagId
          });
          // 加载内容
          that.loadData(uid, store_id, page, tagId);
        }
      }
      
  
    });
    isFirst=false;
   
  },
  loadData(uid, store_id, page, activityid){
    // 列表信息接口开始
    var that = this;
    var activityId = that.data.activityid;//优惠券类型，精选，奶粉，纸尿裤，玩具，棉品，辅食，其他
    var params = { uid, store_id, page, tagId: activityid}
    
    app.api.postApi(listUrl, { params }, (err, resp) => {
      wx.hideLoading();
      var dataList = resp.err_msg.list;
      var logo = resp.err_msg.logo;
      var loadingone = !resp.err_msg.noNextPage;
      var dataLength=0;
      if(dataList&&dataList.length>0){
        dataLength = dataList.length;
      }
      that.setData({
        dataList: dataList,
        logo: logo,
        loadingone,
        dataLength
      });
    });
    //列表信息接口结束
  },
  clickGo(e){
    var that = this;
    // 拿到页码
    let page = that.data.page;
    // 获取current确定点击哪里
   let { current,activityid } = e.currentTarget.dataset;
    console.log(e,current,activityid);
    that.setData({
      current, activityid
    });
    that.loadIndexData();
    
    // that.loadData(uid, store_id, page, activityid);
  },

  loadIndexData(){
    // 拿到页码
    let page = this.data.page;
    let index=parseInt(this.data.current);
    let activity_err_msg = this.data.activity_err_msg;
    var activityid = activity_err_msg[index].tagId ? activity_err_msg[index].tagId:'';
    this.loadData(uid, store_id, page, activityid);
  },

  goDetail(e){
    var activityid = e.currentTarget.dataset.activityId;
    var id = e.currentTarget.dataset.id;
    var endTime = e.currentTarget.dataset.endTime
    var faceMoney = e.currentTarget.dataset.faceMoney
    var name = e.currentTarget.dataset.name
    var originalPrice = e.currentTarget.dataset.originalPrice
    var startTime = e.currentTarget.dataset.startTime
    var logo = e.currentTarget.dataset.logo
    var source = e.currentTarget.dataset.source
    wx.navigateTo({
      url: './card_summary?activityid=' + activityid + '&id=' + id + '&endTime=' + endTime + '&faceMoney=' + faceMoney + '&name=' + name + '&originalPrice=' + originalPrice + '&startTime=' + startTime + '&logo=' + logo + '&source=' + source
    })
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
    if(!isFirst){
      this.loadIndexData();
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
  
  }
})