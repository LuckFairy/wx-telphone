
// present-apply.js
import { Api } from '../../utils/api_2';
let app = getApp();
const util = require('../../utils/util.js');
const log = 'present-apply.js --- ';

Api.signin();//获取以及存储openid、uid
import { store_Id } from '../../utils/store_id';

const SubmitURL = 'wxapp.php?c=order_v2&a=trial_product_pay';       // 赠品领用提交接口
const addOrderUrl = 'wxapp.php?c=order_v2&a=add';//生成订单接口
const QuestionURL = 'wxapp.php?c=product_v2&a=trial_product_question_list';     //问题列表接口
const trialProductListUrl = 'wxapp.php?c=product_v2&a=trial_product_list';//新品试用商品列表url
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
let physical_id = app.globalData.phy_id;//门店id

Page({
  data:{
    showModal: false,            // 是否显示模态噢框
    showErrModal: false,         // 是否显示模态框
    modalConfig,                 // 模态框配置 
    presentData: null,           // 页面数据
    questionList:[],//问题列表
    upList:[],//上面必填问题列表
    qrEntry: false,
    product_id:null,//商品id
    uid: null,//用户id
    store_id: app.store_id,//店铺id
  },
  onLoad:function(options){
    console.log('123');
    //2017年8月17日13:46:50 处理选择后的多属性
    var attrData = wx.getStorageSync('key') || [];
    var uid = wx.getStorageSync('userUid');
    if (attrData.length > 0) {
      var attrArr = attrData.split('-');
      this.setData({ productColor: attrArr['0'], productSize: attrArr['1']});
      skuid = options.skuid;
    } else {
      skuid=0;
    }    
    // 页面初始化 options为页面跳转所带来的参数
    let {qrEntry} = options;
    // try {
    //   options = JSON.parse(decodeURIComponent(options.options));
      
    //   console.log('options ',options);
    //   this.setData({
    //     presentData: options,
    //     product_id: options.product_id,
    //     qrEntry
    //   });
    //   this.loadQuestion();
    // } catch(e) {
      
    // }
 
    try{
        this.setData({
           product_id:options.prodId,
           uid,
        });
        wx.showLoading({
          title: '正在加载...',
        })
        this.loadQuestion();
        this.loadListDataNew();
    } catch(e){
      console.log('e ',e)
    }
  },
  /*
* 问题列表
  */
  loadQuestion(){
    var that = this;
    var params = {
      "pid": that.data.product_id,
      "sid": that.data.store_id,
      "uid": that.data.uid
    };
    app.api.postApi(QuestionURL, { params }, (err, rep) => {   // 赠品领用提交
      wx.hideLoading();
      var questionList = that.data.questionList;
      var upList = that.data.upList;
      if (!err && rep.err_code == 0) {
          //遍历rep.err_msg，找出required == 1的
        for (var value of rep.err_msg) {
          if(value.required == 1){
           upList.push(value);
          }else{
            questionList.push(value);
          }
        }
        console.log(questionList, upList);
          that.setData({
            questionList,
            upList
          })
      } else{
        that.submitError({ image: '../../image/error.png', title: rep.err_msg });
      }
     
    });
  },
  loadListDataNew() {
    var that = this;
    var params = {
      "cid": "106",//分类id
      "sid": that.data.store_id,
      "uid": that.data.uid,
      //physical_id
      // "page_size": "5",
      // "page_num": "1",
    };
    app.api.postApi(trialProductListUrl, { params }, (err, rep) => {
      wx.hideLoading();
      if (err || rep.err_code != 0) {
        this.setData({ loading: false });
        return;
      }
      for (var i in rep.err_msg.list){
        if (rep.err_msg.list[i].product_id == that.data.product_id){
          this.setData({
            presentData: rep.err_msg.list[i]
          });
        }
      }
      
    });
  },
  /**
   * 提交表单
   */
  formSubmit(e) {
    var that = this;
    let {value: submit} = e.detail;
   console.log(submit);
    let question = [];//问题列表
    for (let [name, value] of Object.entries(submit)) {
      if(value.length == 0){
        return this.submitError({ image: '../../image/error.png', title: '没有填写完，请填写完整' });
      }
      question.push({ "qid":name,"value":value});
    }
    /**
     * 开始请求
     */

    wx.showLoading({
      title: '正在提交',
      mask: true
    });
    // 生成订单号
    app.api.postApi(addOrderUrl, {
      "params": {
        "uid": that.data.uid,
        "quantity": 1,
        "product_id": that.data.product_id,
        "store_id": that.data.store_id,
        physical_id
      }
    } ,(err,rep) => {
        wx.hideLoading();
        if(!err && rep.err_code == 0){
          var order_no = rep.err_msg.order_no;
          var params = {
            "oid": order_no,
            "uid": that.data.uid,
            "question": question,
             //physical_id
          };
         that.submitData(params);
   
        }else{
          this.submitError({ image: '../../image/error.png', title: rep.err_msg });
        }
    })
    
  },
  submitData(params){
    app.api.postApi(SubmitURL, { params }, (err, data) => {   // 赠品领用提交
      wx.hideLoading();
      if (!err && data.err_code == 0) {
        this.showModal('success');
        // if (this.data.qrEntry) {
        //   wx.showModal({
        //     title: '申请成功',
        //     content: '赠品申请已提交，请到[订单-待审核]列表里查询，如果审核通过，将会出现在[订单-待收货]里',
        //     showCancel: false,
        //     confirmText: '知道了',
        //     success: function (res) {
        //       wx.switchTab({
        //         url: '../index/index',
        //       })
        //     },
        //   });
        // } else {
        //   this.showModal('success');
        // }
      } else {
        this.submitError({ image: '../../image/error.png', title: data.err_msg });
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