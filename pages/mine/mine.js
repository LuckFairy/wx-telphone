// pages/mine/mine.js
var app = getApp();
const log = 'mine.js --- ';

let pageData = [
  {
    id:1,
    pic: "../../image/mine_headimage.png",
    assistantText: '修改头像',
    onClick: "changeHeadPic"
  },
  {
    id:2,
    title: '昵称',
    assistantText: 'Aaron Lee',
    onClick: "pushToChangeNickNamePage"
  },
  {
    id:3,
    title: '我的宝宝',
    onClick: "pushToMyBabyPage"
  }
];

Page({
  data:{
    pageData
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this._loadData();
  },
  
  _loadData() {
    // pageData[0].pic = '';           // 头像
    // pageData[1].assistantText = ''; // 昵称
    // this.setData({pageData});
  },
  
  /**
   * 修改头像
   */
  changeHeadPic() {
    console.log(log + '修改头像');
  },
  
  /**
   * 进入修改名字页面
   */
  pushToChangeNickNamePage() {
    wx.navigateTo({
      url: `./change-name?nickname=${this.data.pageData[1].assistantText}`
    });
  },
  
  /**
   * 进入我的宝宝页面
   */
  pushToMyBabyPage() {
    wx.navigateTo({
      url: `./my-baby`
    });
  },
  
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})