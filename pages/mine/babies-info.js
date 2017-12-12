// pages/mine/babies-info.js
var app = getApp();
const log = 'babies-info.js --- ';

/**
 * 初始页面数据
 */
let pageData = {
  sex: 1,           // 1：男孩   2：女孩   0:孕育中
  name: '',         // 宝宝小名
  birthday: '',     // 生日/预产期
};

Page({
  data:{
    pageData: null,         // 页面数据
    date: ''
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    
    this._getData();
    
  },
  
  /**
   * 页面数据
   */
  _getData(){
    this.setData({pageData});
  },
  
  /**
   * 设置 baby 的性别
   */
  setBabySex(e) {
    let {sex} = e.currentTarget.dataset;
    pageData.sex = sex;
    this.setData({pageData});
    console.log(pageData);
  },
  
  /**
   * 设置 baby 小名
   */
  setBabyName(e) {
    let {value} = e.detail;
    pageData.name = value;
    this.setData({pageData});
    console.log(pageData);
  },
  
  /**
   * 设置 baby 生日/预产期
   */
  setBabyBirthday(e) {
    let {value} = e.detail;
    pageData.birthday = value;
    this.setData({pageData});
    console.log(pageData);
  },
  
  /**
   * 点击下一步按钮
   */
  nextStep() {

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