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
      blocks: [
        {
          width: 690,
          height: 808,
          x: 30,
          y: 183,
          borderWidth: 2,
          borderColor: '#f0c2a0',
          borderRadius: 20,
        },
        {
          width: 634,
          height: 74,
          x: 59,
          y: 770,
          backgroundColor: '#fff',
          opacity: 0.5,
          zIndex: 100,
        },
      ],
      texts: [
        {
          x: 113,
          y: 61,
          baseLine: 'middle',
          text: '推荐人',
          fontSize: 32,
          color: '#8d8d8d',
        },
        {
          x: 30,
          y: 113,
          baseLine: 'top',
          text: '发现一个好物，推荐给你呀',
          fontSize: 38,
          color: '#080808',
        },
        {
          x: 92,
          y: 810,
          fontSize: 38,
          baseLine: 'middle',
          text: '测试标题标题',
          width: 570,
          lineNum: 1,
          color: '#8d8d8d',
          zIndex: 200,
        },
        {
          x: 59,
          y: 895,
          baseLine: 'middle',
          text: [
            {
              text: '2人拼',
              fontSize: 28,
              color: '#ec1731',
            },
            {
              text: '¥99',
              fontSize: 36,
              color: '#ec1731',
              marginLeft: 30,
            }
          ]
        },
        {
          x: 522,
          y: 895,
          baseLine: 'middle',
          text: '已拼2件',
          fontSize: 28,
          color: '#929292',
        },
        {
          x: 59,
          y: 945,
          baseLine: 'middle',
          text: [
            {
              text: '商家发货&售后',
              fontSize: 28,
              color: '#929292',
            },
            {
              text: '七天退货',
              fontSize: 28,
              color: '#929292',
              marginLeft: 50,
            },
            {
              text: '运费险',
              fontSize: 28,
              color: '#929292',
              marginLeft: 50,
            },
          ]
        },
        {
          x: 360,
          y: 1065,
          baseLine: 'top',
          text: '长按识别小程序码',
          fontSize: 38,
          color: '#080808',
        },
        {
          x: 360,
          y: 1123,
          baseLine: 'top',
          text: '超值好货一起拼',
          fontSize: 28,
          color: '#929292',
        },
      ],
      images: [
        {
          width: 62,
          height: 62,
          x: 30,
          y: 30,
          borderRadius: 62,
          url: 'https://zy.qutego.com//upload/images/000/000/293/201808/5b84c6c37f028.png',
        },
        {
          width: 634,
          height: 634,
          x: 59,
          y: 210,
          url: 'https://zy.qutego.com//upload/images/000/000/293/201808/5b861e3aeb9fd.png',
        },
        {
          width: 220,
          height: 220,
          x: 92,
          y: 1020,
          url: 'https://lc-I0j7ktVK.cn-n1.lcfile.com/d719fdb289c955627735.jpg',
        },
        {
          width: 750,
          height: 90,
          x: 0,
          y: 1244,
          url: 'https://lc-I0j7ktVK.cn-n1.lcfile.com/67b0a8ad316b44841c69.png',
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
  showShare() {
    this.setData({ shareShade: true })
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
  
  load(uid){
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