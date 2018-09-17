var app = getApp();
const _getUrl = 'wxapp.php?c=order&a=get_self_code';
Page({
  data: {
    store_id:'',
    order_no:null,
    uid:'',
    code:'',
  },
  onLoad: function (options) {
    let that =this,{order_no}=options;
    let { store_id,uid}=that.data;
    uid = wx.getStorageSync('userUid');
    store_id = app.store_id;
    if (order_no) { that.setData({ order_no})}
    that.setData({ uid, store_id});
  
  },
  onReady: function () {

  },
  onShow: function () {
    console.log('uid', app.globalData.uid);
    this.loadCode();
  },
  loadCode(){
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let { uid, store_id, order_no}=that.data;
    if (!store_id||!uid||!order_no){return;}
    let params = {
      "order_no": order_no,
      "store_id": store_id,
      "uid": uid
    }
    app.api.postApi(_getUrl,{params},(err,rep)=>{
      wx.hideLoading();
      if (rep.err_code) { that.setData({ code: rep.err_msg.qrurl})}
    })
  },
  onHide: function () {

  },
  onUnload: function () {

  }
})