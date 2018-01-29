// pages/mydata/mydata.js
var app = getApp();
const log = 'mydata.js --- ';
let errModalConfig = {   // {image?: string, title: stirng}
  image: '../../image/error.png',
  title: "不支持此手机号码"
};
let successModalConfig = {
  firstText: '提现申请成功，根据不同运营商，流量会在24小时内到帐，请注意短信提醒。',
  confirmText: '知道了'
};

const HistoryURL = 'redbox/getDataRecord';                     // 获取红包记录和总流量
const CashableDataListURL = "redbox/getCashableDataList";      // 查询可提现流量值选项
const CashDataURL = 'redbox/cashData';                         // 流量提现
let _phoneNum = 0;                                             // 记录提现手机号码

let dataArr = [
  {level: 10},
  {level: 20},
  {level: 30},
  {level: 50},
  {level: 100},
  {level: 200},
  {level: 300},
  {level: 500}
];               // 流量选项



Page({
  data:{
    pageData: null,               // 页面数据
    historyData: null,            // 红包记录
    curActIndex: 0,               // 活动tab下标
    nowTotalData: 0,              // 总流量
    availableData: 0,             // 剩余可用流量
    showErrModal: false,         // 是否显示模态框
    showSuccessModal: false,     // 是否显示成功模态框
    errModalConfig,              // 模态框设置
    successModalConfig,          // 模态框设置
    dataArr,                     // 流量选项
    rechargeData: 0,             // 需要充值的流量
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this._loadData();
  },
  
  /**
   * 加载页面数据
   */
  _loadData() {
    let userInfo = wx.getStorageSync('userInfo');
    let {nickName:userName, avatarUrl:userImage} = userInfo;
    let pageData = {userName, userImage};
    this.setData({pageData});
    
    app.api.postApi(HistoryURL, {}, (err, data) => {    // 获取红包记录和总流量
      if(err) {
      } else {
        let historyData = data.data.recList;
        let nowTotalData = data.data.leftTotal || 0;
        this.setData({nowTotalData, historyData});
      }
    });
  },
  
  /**
   * 
   */
  swiperChange(event) {
    this.setData({
      curActIndex:event.detail.current
    });
  },
  swichSwiperItem:function(event){
    this.setData({
      curSwiperIdx:event.target.dataset.idx, 
      curActIndex:event.target.dataset.idx
    });
  },

  /**
   * 手机号判断流量
   */
  checkData(e) {
    let {value} = e.detail;
    // if(value && value.length === 11) {
    if(1) {
      let params = {
        phoneNum: value
      };
      _phoneNum = value;
      app.api.postApi(CashableDataListURL, params, (err, data) => {    // 查询可提现流量值选项
        if(err || data.rtnCode != 0) {
          this.setData({rechargeData: 0, dataArr});
        } else {
          this.setData({
            dataArr: data.data
          });
        }
      });
    }else {
      this.setData({rechargeData: 0});
    }

  },

  /**
   * 提交表单
   */
  formSubmit(e) {
    let {value: submit} = e.detail;
    console.log(submit);
    //let url = 'rp/charge';
    let {phoneNum, phoneNum2} = submit;
    if(!phoneNum) {
      this.showModal('err', {
        image: '../../image/error.png',
        title: "请输入手机号码"
      });
    } else if(phoneNum !== phoneNum2) {
      this.showModal('err', {
        image: '../../image/error.png',
        title: "两次输入的手机号不同"
      });
    } else {
      wx.showLoading({title: '正在处理...'});
      let params = {
        phoneNum,
        cashAmount: this.data.rechargeData
      };
      app.api.postApi(CashDataURL, params, (err, data) => {  // 流量提现
        if(err || data.rtnCode != 0) {
          console.log(log + '流量提现出错');
          console.log(err);
          wx.hideLoading();
          this.showModal('err', {
            image: '../../image/error.png',
            title: data.data.msg
          });
        } else {
          console.log(log + '流量提现');
          console.log(data);
          wx.hideLoading();
          this._loadData();    // 重新刷新数据
          this.checkData({detail: {value: _phoneNum}});
          this.setData({rechargeData: 0});
          this.showModal('success', {
            firstText: data.data.msg,
            confirmText: '知道了'
          });
        }
      });
    }
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
   * 点击隐藏模态框(错误模态框)
   */
  tabModal() {
    this.setData({showErrModal: false});
  },
  
  /**
   * 点击模态框的确定(关闭确定模态框)
   */
  tabConfirm() {
    console.log(log + '点击确定');
    this.setData({showSuccessModal: false});
  },

  /**
   * 点击浏览选项
   */
  selectControl(e) {
    let {size: rechargeData} = e.currentTarget.dataset;
    console.log(log + rechargeData);
    this.setData({rechargeData});
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