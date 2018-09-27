// page/distribution/spreadOrder.js
let app = getApp();
const listUrl = "wxapp.php?c=promote&a=order_list";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:null,
    sid:app.store_id,
    list:[],
    nextPage:true,
    onepage:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync("userUid");
    this.setData({uid})
    this.loadList();
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
  loadList(opt){
    let that = this;
    let params =  { "uid": that.data.uid, "store_id": that.data.sid, "page": 1, "limit": 20} ;
    params = Object.assign(params,opt);
    app.api.postApi(listUrl,{params},(err,rep)=>{
      if (err || rep.err_code != 0) {that._showError(err||rep.err_msg);return;}
      let { data=[],next_page}=rep.err_msg;
      if(data.length>0){that.setData({list:data})}
      that.setData({ nextPage: next_page})
    })
  },
  loadpage(){
    let { onepage, nextPage} = this.data;
    if(nextPage){
      onepage++;
      let opt = {
        page:onepage
      }
      this.loadList(opt);
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

  },
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    this.setData({ error: errorMsg });
    setTimeout(() => {
      this.setData({ error: null });
    }, 2000);
    return false;
  },
})