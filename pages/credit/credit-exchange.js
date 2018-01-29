// pages/credit/credit-exchange.js
var app = getApp();
const log = 'credit-exchange.js --- ';

let errModalConfig = {   // {image?: string, title: stirng}
  id: "err",
  title: '积分不够啦，去买点东西赚取更多积分再来换吧',
  cancleText: '取消',
  confirmText: '去买东西'
};
let successModalConfig = {
  id: "success",
  firstText: '兑换本流量包',
  cancleText: '取消',
  confirmText: '确定'
};

Page({
  data:{
    showErrModal: false,         // 是否显示模态框
    showSuccessModal: false,     // 是否显示成功模态框
    errModalConfig,              // 模态框设置
    successModalConfig,          // 模态框设置
    loading: false,
    pageData: null,      // 页面数据
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    let {data} = options;
    let pageData = JSON.parse(data);
    this.setData({pageData});
  },
  
  /**
   * 点击兑换
   */
  exchange() {
    this.showModal('success');
  },
  
  
  /**
   * 显示模态框
   */
  showModal(type='err', config) {  // type: success||err
    if(type === 'success') {
      this.setData({
        successModalConfig: config || successModalConfig,
        showSuccessModal: true
      });
    } else {
      this.setData({
        errModalConfig: config || errModalConfig,
        showErrModal: true
      });
    }
  },

  
  /**
   * 点击模态框的取消（关闭模态框）
   */
  tabCancel(e) {
    let {id} = e.currentTarget.dataset; 
    if(id === 'err') {
      this.setData({showErrModal: false});
    } else {
      this.setData({showSuccessModal: false});
    }
  },
  /**
   * 点击模态框的确定
   */
  tabConfirm(e) {
    let {id} = e.currentTarget.dataset; 
    if(id === 'err') {
      this.setData({showErrModal: false});   // 重定向至买东西页面
    } else {

      this.setData({showSuccessModal: false});   // 跳转至充值页面
      wx.navigateTo({
        url: './recharge'
      });
    }
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