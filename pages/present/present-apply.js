// present-apply.js
let app = getApp();
const util = require('../../utils/util.js');
const log = 'present-apply.js --- ';

const SubmitURL = 'trial/submit';       // 赠品领用提交接口
let modalConfig = {
  firstText: '申请成功',
  // secondText: '赠品申请已提交，请到[订单-待审核]列表里查询，如果审核通过，将会出现在[订单-待收货]里',
  secondText: '赠品申请已提交，请到[订单-待收货]列表里查询',
  confirmText: '知道了'
};
let errModalConfig = {   // {image?: string, title: string}
  image: '../../image/error.png',
  title: "您已经申请过啦，试试申请别的吧"
};
//2017年8月17日16:46:48 by leo
let skuid;                          // 记录商品多属性标识 id

Page({
  data:{
    showModal: false,            // 是否显示模态噢框
    showErrModal: false,         // 是否显示模态框
    modalConfig,                 // 模态框配置 
    presentData: null,           // 页面数据
    qrEntry: false,
  },
  onLoad:function(options){
    //2017年8月17日13:46:50 处理选择后的多属性
    var attrData = wx.getStorageSync('key') || [];
    if (attrData.length > 0) {
      var attrArr = attrData.split('-');
      this.setData({ productColor: attrArr['0'], productSize: attrArr['1'] });
      skuid = options.skuid;
    } else {
      skuid=0;
    }    
    // 页面初始化 options为页面跳转所带来的参数
    let {qrEntry} = options;
    try {
      options = JSON.parse(decodeURIComponent(options.options));
      console.log('optionssssss',options);
      this.setData({
        presentData: options,
        qrEntry
      });
    } catch(e) {
    }
  },

  /**
   * 提交表单
   */
  formSubmit(e) {
    let {value: submit} = e.detail;
    //return;
    let post = {};
    let option = '';
    
    let {fullname, telephone} = submit;
    let [name, phone] = [fullname.trim(), telephone.trim()];
    if(!name) {
      return this.submitError({image: '../../image/error.png', title: '请输入姓名'});
    } 
    if (!util.checkMobile(phone)) {
      return this.submitError({image: '../../image/error.png', title: '请输入正确的手机号码'});
    }
    
    for(let i in submit) {
      if(+i >= 0) {
        post[`option[${i}]`] = submit[i] + '';
      } else {
        post[i] = submit[i];
      }
    }
    post['fullname'] = name;
    post['telephone'] = phone;
    post['skuid'] = skuid;
    //return;
    /**
     * 开始请求
     */
    wx.showLoading({
      title: '正在提交',
      mask: true
    });
    app.api.postApi(SubmitURL, post, (err, data) => {   // 赠品领用提交
      wx.hideLoading();
      if(!err && data.rtnCode == 0) {
        if (this.data.qrEntry) {
          wx.showModal({
            title: '申请成功',
            content: '赠品申请已提交，请到[订单-待审核]列表里查询，如果审核通过，将会出现在[订单-待收货]里',
            showCancel: false,
            confirmText: '好的',
            success: function (res) {
              wx.switchTab({
                url: '../index/index',
              })
            },
          });
        } else {
          this.showModal('success');
        }
      } else {
        this.submitError({image: '../../image/error.png', title: data.rtnMessage});
      }
    });
    
  },
  
  /**
   * 显示模态框
   */
  showModal(type, modalConfig) {  // type:'success'||'err', modalConfig?: {}
    wx.hideLoading();
   
    if(type === 'err' && modalConfig) {
      /* 错误 */
      this.setData({
        errModalConfig: modalConfig,
        showErrModal: true
      });
    } else {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];  //上一个页面
      prevPage.showModal(type, modalConfig);
      wx.navigateBack();
    }
    
    // this.setData({
    //   showModal: true
    // });
  },
  
  /**
   * 表单提交，后台返回错误信息
   */
  submitError(modalConfig) { // modalConfig?: {image?: string, title: string}
    // let pages = getCurrentPages();
    // let prevPage = pages[pages.length - 2];  //上一个页面
    // prevPage.showModal(modalConfig);
    // wx.navigateBack();
    this.showModal('err', modalConfig);
  },
  
  /**
   * 点击模态框的确定(关闭模态框)
   */
  tabConfirm() {
    this.setData({showModal: false});
  },
  
  /**
   * 点击隐藏模态框(错误模态框)
   */
  tabModal() {
    this.setData({showErrModal: false});
  },

  /**
   * 选项改变
   */
  optionChange(e) {
    let {value} = e.detail;
    let {productoptionid} = e.currentTarget.dataset;
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