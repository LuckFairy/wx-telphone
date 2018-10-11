// page/distribution/moneyIndex.js
let app = getApp();
const _detailUrl = "wxapp.php?c=fx_user&a=get_fx_detail";//分享详情
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:null,
    uid:null,
    sid:app.store_id,
    shareShade: false,
    shareOpt: {
      title: '立即邀请好友',
      shareImg: '../image/distribution/qugo_03.png',
      shareTxt: '微信好友',
      posterImg: '../image/distribution/qugo_05.png',
      posterTxt: '邀请卡'
    },
    qrcodeUrl: null,//小程序二维码
    jdConfig: {
      width: 750,
      height: 1334,
      backgroundColor: '#fff',
      debug: false,
      texts: [
        {
          x: 350,
          y: 360,
          baseLine: 'top',
          textAlign: 'center',
          text: 'amy',
          fontSize: 36,
          color: '#222222',
          zIndex:2
        },
        {
          x: 350,
          y: 1056,
          baseLine: 'top',
          textAlign:'center',
          text: '长按识别小程序码',
          fontSize: 26,
          color: '#999',
          zIndex:2
        }
        
      ],
      images: [
        {
          width: 750,
          height: 1334,
          x: 0,
          y: 0,
          url: 'https://zy.qutego.com/upload/wxapp/images/fx_qrcode_bg.png',
          zIndex:1
        },
        {
          width: 160,
          height: 160,
          x: 296,
          y: 180,
          url: 'https://zy.qutego.com//upload/images/000/000/293/201808/5b861e3aeb9fd.png',
          borderRadius:160,
          borderWidth:6,
          borderColor:'#fff',
          zIndex: 2
        },
        {
          width: 280,
          height: 280,
          x: 236,
          y: 740,
          url: 'https://zy.qutego.com//upload/images/000/000/293/201808/5b861e3aeb9fd.png',
          zIndex: 2
        }
      ]

    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync("userUid");
    console.log(uid)
    this.setData({uid},()=>{
      this.load();
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

  },
  onGotUserInfo: function (e) {
    console.log("nickname=" + e.detail.userInfo.nickName);
    let { userInfo } = e.detail;
    let that = this; 
    that.setData({ shareShade: true})
    wx.showLoading({
      mask:true,
      title: '加载中',
    })
    let jdConfig = that.data.jdConfig;
    jdConfig.texts[0].text = userInfo.nickName
    jdConfig.images[1].url = userInfo.avatarUrl
    app.creatImg(null, that).then(data => {
      jdConfig.images[2].url = data;
      console.log(data, jdConfig);
      that.setData({ qrcodeUrl: data, jdConfig },()=>{
        wx.hideLoading();
      })
    })
  
  },
  load(uid){
    let that =this;
    let params={
      uid:this.data.uid,
      store_id:this.data.sid
    }
    app.api.postApi(_detailUrl,{params},(err,rep)=>{
      if(err||rep.err_code!=0){console.error(err||rep.err_msg);return;}
      this.setData({detail:rep.err_msg});
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

  }
})