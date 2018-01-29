// pages/recharge/recharge.js
var app = getApp();
const log = 'recharge.js --- ';

Page({
  data:{
    tellphone: '',
    tellphone2: ''
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },

  /**
   * 运营商号码
   */
  tellphone(e) {
    let {value:tellphone} = e.detail;
    this.setData({tellphone});
  },

  /**
   *  确认号码
   */
  tellphone2(e) {
    let {value:tellphone2} = e.detail;
    this.setData({tellphone2});
  },

  /**
   * 点击立即充值按钮
   */
  recharge() {
    let {tellphone, tellphone2} = this.data;
    console.log(log + '表单数据');
    console.log('tellphone: ' + tellphone, 'tellphone2: ' + tellphone2);
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