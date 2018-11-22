


let app = getApp();
let WxParse = require('../../utils/wxParse/wxParse.js');

const _urlFxEn = "wxapp.php?c=fx_user&a=fx_entrance";//分销入口
const _urlCheck = "wxapp.php?c=fx_user&a=add_fx_user";// 申请为分销用户或修改上级分销
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ac_detail:{},
    ac_title:'',
    ac_time:'',
    page: 1,//从上面页面进入，1我的 ，2分享赚钱
    satus: -1,//0审核中，1审核通过，2已经拉黑，-1审核拒绝
    isCheck:true,//是否点击申请
    uid:null,
    sid:null,
    pid:null,
    phone:null,
    imgurl:null,//二维码图片
    proId:null,//产品id
    checkShade:false,

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this, dataset = res.target.dataset;
    let store_id = that.data.sid, uid = that.data.uid;
    let pid = uid;
    let tip = `加入分享挣钱计划`;
    let url = `/page/distribution/invite?pid=${pid}`;
    let imgurl = `${app.config.host}upload/wxapp/images/fx_share.jpg`;
    
    return {
      title: tip,
      path: url,
      imageUrl:imgurl,
      success: function (res) {
      
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync('userUid'), sid = app.store_id, phone = wx.getStorageSync("phone") || app.globalData.phone,that= this;
    console.log(phone)
    let pid = null;
    if (!options.scene) {
      pid = options.pid;
    } else {
      let querystr = {};
      let strs = decodeURIComponent(options.scene).split('&');
      console.log('strs....', strs);
      //取得全部并赋值
      for (let i = 0; i < strs.length; i++) {
        querystr[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
      pid = querystr['fx_uid'];
    }
    if(!uid){
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
      if(pid){wx.setStorageSync(pid, 'pid')}
    }else{
      pid = pid||wx.getStorageSync("pid");
      console.log(options, 'pid...', pid);
      this.setData({uid,sid,phone,pid},()=>{
          that.loadDetail({pid});
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
    // wx.hideShareMenu();
  
    
  },
  loadDetail(opt,func){
    let that = this;
    let params = {
      uid: opt.uid || this.data.uid,
      store_id:opt.sid||this.data.sid,
    }
    params = Object(params,opt);
    app.api.postApi(_urlFxEn,{params},(err,rep)=>{
      if(rep.err_code==0){
        WxParse.wxParse('ac_detail', 'html', rep.err_msg.detail, that);
        let status = rep.err_msg.status;
        let title = rep.err_msg.title ||'加入分享赚钱计划';
        wx.setNavigationBarTitle({
          title: title
        })
        let isCheck = (status==1)?false:true;//0审核中，1审核通过，2已经拉黑，-1审核拒绝
        let checkShade = (status==0)?true:false;
        that.setData({ status, isCheck, checkShade},()=>{
          if(!isCheck){
            typeof func =='function' &&func();
            wx.redirectTo({
              url: `./moneyIndex?pid=${opt.pid}`,
            })
          }
        })
      }
    })

  },
  oncheckShade() {
    let that = this;
    let params = {
      "uid": that.data.uid,
      "phone": that.data.phone,
      "store_id": that.data.sid,
      "pid":that.data.pid
    }
    app.api.postApi(_urlCheck, { params }, (err, rep) => {
      if(rep.err_code==0){
        wx.removeStorageSync('pid');
        let status = rep.err_msg.status;//0审核中1跳页
        that.setData({isCheck:true},()=>{
            if (status == 0) { that.setData({ checkShade:true})}
            else{
              that.goMoneyIndex();
            }
        })
      }
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
  cacelShade(){
    // this.setData({ checkShade:false})
  },
 

  goMoneyIndex(){
    wx.redirectTo({
      url:'./moneyIndex'
    })
  },
  goback(){
    wx.switchTab({
      url: '../tabBar/my/myself'
    })
  }
})