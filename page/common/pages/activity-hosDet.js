let app = getApp();
import { formatTime} from '../../../utils/util.js';
const _urlDetail = "wxapp.php?c=voucher&a=voucher_info";//获取活动详情
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid:app.store_id,
    uid: null,
    dataList:null,
    id:null,//活动id
    imgList:[],//图片列表
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this,txt='';
    let {data} = options;
    data = JSON.parse(unescape(data));
    console.log(data);
    switch(data.status){
      case "-1": txt = "已拒绝";break;
      case "0": txt = "待审核"; break;
      case "1": txt = "已通过";break;
    }
    that.setData({ dataList:data,status:txt,imgList:data.imgs});
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
  
  },
  preview(e){
    var { imgList}= this.data;
    var index = e.target.dataset.index;
    wx.previewImage({
      current: imgList[index], // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },

})