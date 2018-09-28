// page/distribution/invite.js
import Poster from '../components/poster/poster/poster'

let app = getApp();
let WxParse = require('../../utils/wxParse/wxParse.js');
const _urlDetail = "wxapp.php?c=voucher&a=voucher_info";//获取活动详情   有活动id
const _urlDetail_v2 = "wxapp.php?c=voucher&a=store_voucher";//获取活动详情  没有活动id的
const _urlPoster = "wxapp.php?c=promote&a=wxapp_qrcode";//生成小程序推广二维码
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ac_detail:{
      nodes:'<p>哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇哇问问<img src="https://zy.qutego.com//upload/images/000/000/293/201809/5b91fe17519d5.png"/></p>'
    },
    ac_title:'挣钱计划',
    ac_time:'2018-09-01 00:00:00 至 2018-10-31 00:00:00',
    page: 2,//从上面页面进入，1我的 ，2分享赚钱
    isCheck:0,//是否需要审核，1是 0否
    uid:null,
    sid:null,
    imgurl:null,//二维码图片
    proId:null,//产品id
    checkShade:false,
    shareShade:false,
    posterConfig: {
      width:"700rpx",
      height:"1000rpx",
      backgroundColor: '#fff',
      images:[{
        url:null,
        x:"30rpx",
        y:"40rpx",
        width:"200rpx",
        height:"200rpx"
      }]
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync('userUid'),sid = app.store_id,that= this;
    let { page = 2, prodId, isCheck} = options;
    // this.setData({uid,sid},()=>{
    //   that.creatimg().then(data => {
    //     let posterConfig = that.data.posterConfig;
    //     posterConfig.images[0].url = data;
    //     that.setData({ posterConfig }, () => {
    //       Poster.create();
    //     });
    //   })
    // })
    if(prodId){this.setData({prodId})}
    
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
    wx.hideShareMenu();
    let {page,isCheck}=this.data;
    
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return;
    let that = this, dataset = res.target.dataset;
    let store_id = that.data.storeId, uid = that.data.uid;
    let opt, params;
    params = dataset.params.tuan_info;
    params.prodId = dataset.params.order_product_list[0].id;
    params = JSON.stringify(params);
    that.setData({ showShareModal: false });
    console.log('params', params);
    var tip = `你的好友向你推荐了`;
    let url = `/page/group-buying/group-join?params=${params}`;
    return {
      title: tip,
      path: url,
      imageUrl: dataset.imgurl,
      success: function (res) {
        //开启分享成功弹窗
        share.shareOpen({
          store_id,
          uid,
          url: shareLaterUrl
        }).then(opt => {
          let { showModel, couponList, coupon_id_arr = [] } = opt;
          that.setData({
            showShareModal: showModel,
            shareData: { couponList },
            coupon_id_arr
          })
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '分享失败！',
        })
      }
    }
  },
  /**
   * 生成二维码图片
   */
  creatimg(id){
    let that = this;
    let params = { "uid": that.data.uid, "store_id": that.data.sid, "type": 2 };
    //商品id 如果type=1，这个值必须传。type=2，不需要
    if(id){
      params = { "uid": that.data.uid, "store_id": that.data.sid, "type": 1,"product_id":id};
    }
    return new Promise((resolve, reject)=>{
      app.api.postApi(_urlPoster,{params},(err,res)=>{
        if(res.err_code==0){
          resolve(res.err_msg.url);
        }else{
          console.error(err || res.err_msg);
          reject(err || res.err_msg);
        }
      })
    })
  },
  onPosterSuccess(e) {
    const { detail } = e;
    console.log(e)
    // wx.previewImage({
    //   current: detail,
    //   urls: [detail]
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
  cacelShade(){
    this.setData({ shareShade:false})
  },
  shareShade(){
    this.setData({ shareShade:true})
  },
  checkShade(){
    this.setData({checkShade:true})
  },
  goMoneyIndex(){
    wx.redirectTo({
      url:'./moneyIndex'
    })
  },
  goback(){
    let pages = getCurrentPages();//当前页面栈
    let prevPage = pages[pages.length - 2];  //上一个页面
    wx.navigateBack();//返回上一页
  }
})