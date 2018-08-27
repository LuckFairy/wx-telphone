let app = getApp();
import config from '../../../config';
import { checkMobile } from '../../../utils/util.js';
const _urlDetail = 'wxapp.php?c=voucher&a=voucher_info';//获取活动问题数据
const _urlsubmit = "wxapp.php?c=voucher&a=voucher_join";//马上参与提交接口
const _urlimg = config.host+'wxapp.php?c=voucher&a=image_upload';
const _urlCode = "wxapp.php?c=voucher&a=get_code";//获取验证码

Page({
  data: {
    sid: app.store_id,
    uid: null,
    fullname:null,
    tel:null,
    id:8,//活动id
    queList:'',//活动信息列表
    answerList:[],//回答问题列表
    pullimage:[],
    error:null,
    imgFlag:true,
    index:0,
    otherRequest:[],
    note:null,
    timer:'短信验证码',
    code:null,
    codeFlag:true,
  },

  onLoad: function (options) {
   let uid = wx.getStorageSync('userUid'),that = this;
    wx.showLoading({
      title: '加载中',
    })
    uid: wx.getStorageSync("userUid");
    if (uid) {
      that.setData({ uid });
      if (options.id) { this.setData({ id: options.id }) }
      this.getData();
    } else {
      wx.switchTab({
        url: '../../tabBar/home/index-new',
      })
    }
    
  },

  onShow:function(){

  },
  getData(){
    var params = {
      id:this.data.id,
      store_id:this.data.sid,
      uid:this.data.uid
    }
    app.api.postApi(_urlDetail, { params }, (err, res)=>{
      wx.hideLoading();
      console.log('返回的数据',res);
      if(err||res.err_code!=0){return false;}
      var queList = res.err_msg.questions;
      var request_other = res.err_msg.request_other[0];
      var len  = res.err_msg.pig_num;
      var note = res.err_msg.note;
      if(request_other==1){
        var index = 1, otherRequest=[];
        otherRequest=[
          {
            birthday: '2018-01-01',
            sex:'1'
          }
        ];
      }
      for(var j=0;j<queList.length;j++){
        if(queList[j].type==2){
          queList[j].index=0
        }
      }
      var pullimage = [];
      for(var i=0;i<len;i++){
        pullimage.push({ url:"../imgs/icon-upload.png",flag:true});
      }
      if (len == 0) { pullimage=[];}
      // console.log(pullimage);
      this.setData({ queList, pullimage, otherRequest,note})
    })
  },
  chooseImage(e){
    let pullimage = this.data.pullimage;
    let count = 1,  index = e.target.dataset.index,that=this;
    that.setData({ imgFlag:false})
    wx.chooseImage({
      count: count, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        var temFiles = res.tempFiles;
    
        if (temFiles[0].size > (5*1048576)){
          wx.showModal({
            content: '照片已超过最大容量5m，请调整后再上传。',
            showCancel:false,
            confirmText:"知道了",
            success: function (res) {
              if (res.confirm) {
                
              } 
            }
          });
          return;
        }
        wx.uploadFile({
          url: _urlimg,
          filePath: tempFilePaths[0],
          name: 'file',
          success(res){
            that.setData({ imgFlag: true });
            console.log('.....',res)
            var data = JSON.parse(res.data);
            if(data.err_code!=0){return that._showError(data.err_msg);}
            var url = data.err_msg.url;
            var opt = {
              url,
              flag: false
            }
            pullimage.splice(index, 1, opt);
            that.setData({ pullimage });
          
          }
        })


        
      }
    })
  },
  delImage(e){
    let pullimage = this.data.pullimage;
    let that = this, index = e.target.dataset.index;
    var opt = { url: "../imgs/icon-upload.png", flag: true };
    pullimage.splice(index, 1, opt);
    that.setData({ pullimage });
  },
  previewImage(e){
    let pullimage = this.data.pullimage;
    let that = this, index = e.target.dataset.index,arr=[];
    for(var i in pullimage){
      if(!pullimage[i].flag){
        arr.push(pullimage[i].url);
      }
    }
    if(arr.length<1){return;}
    console.log(arr);
    wx.previewImage({
      current: arr[index], // 当前显示图片的http链接
      urls: arr// 需要预览的图片http链接列表
    })
  },
  fullnameChange(e){
    let val = e.detail.value,fullname = this.data.fullname;
    val = val.replace(/\s/g, '');
    if (!val || val.length < 1||fullname==val) { return; }
    this.setData({fullname:val});
  },
  telChange(e){
    let val = e.detail.value,tel= this.data.tel;
    val = val.replace(/\D\s/g,'');
    if (!val || val.length < 1 || tel == val) { return; }
    this.setData({tel:val});
  },
  queChange(e){
    let val = e.detail.value, id = e.target.dataset.id, index=e.target.dataset.index,queList = this.data.queList;
    if(!val||val.length<1){return;}
    queList[index].answers=val;
    this.setData({ queList})
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let val = e.detail.value, id = e.target.dataset.id, index = e.target.dataset.index, queList = this.data.queList;
    if (!val || val.length < 1) { return; }
    queList[index].index = val;
    this.setData({ queList })
  },
  bindChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value, e.target.dataset.index);
    let {index}=e.target.dataset,val = e.detail.value;
    let { otherRequest}=this.data;
    otherRequest[index].birthday = val;
    this.setData({
      otherRequest
    })
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value, e.target.dataset.index);
    let { index } = e.target.dataset, val = e.detail.value;
    let { otherRequest } = this.data;
    otherRequest[index].sex = val;
    this.setData({ otherRequest})
  },
  codeChange(e) {
    this.setData({
      code: e.detail.value
    })
  },
  addList:function(){
    let that = this;
    let { otherRequest}  = that.data;
    let index = otherRequest.length+1;
    let item = 
      {
        birthday: '2018-01-01',
        sex:'1'
      };
    otherRequest.push(item);
    that.setData({ otherRequest})
  },
  codeClick(){
    let that = this;
    let {tel,sid}=this.data;
    if(!tel||tel==''){
      that._showError('手机号码不能为空');
      return;
    }
    if (!checkMobile(tel)) {
      that._showError('手机号码格式不正确');
      return;
    }
    var params = {
        "phone":tel,
        "store_id":sid
    }
    app.api.postApi(_urlCode, { params }, (err, res) => {
      if (err || res.err_code != 0) { return that._showError('发送失败！') }
      clearInterval(that.codeTimers);
      that.codeInterl();
    })
  },
  codeInterl(opt){
    let that =this;
    this.setData({codeFlag:false});
    clearInterval(this.codeTimers);
   var opts = Object.assign({
     times:60,
     text:'s',
     end:'短信验证码'
   }, opt);
   
    that.setData({ timer:`${opts.times}${opts.text}`});
    this.codeTimers=setInterval(()=>{
      opts.times--;
      that.setData({ timer: `${opts.times}${opts.text}` });
      if(opts.times<1){
        clearInterval(that.codeTimers);
        that.setData({ timer: `${opts.end}`, codeFlag:true});
      }
   },1000)
  },
 
  goCofirm(){
    let that =this,arr=[],arr2;
    let { fullname, tel, queList, pullimage, id, uid, sid, imgFlag, otherRequest,code}=that.data;
    let answerList = [];
    for (var j = 0; j < queList.length; j++) {
      if (queList[j].type == 2) {
        var opt={
          "question_id":queList[j].id,
          "answer":queList[j].index,
          "type":2
        }
      }else{
        var opt ={
          "question_id": queList[j].id,
          "answer": queList[j].answers,
          "type": 1
        }
      }
      answerList.push(opt);
    }
    if(!imgFlag){
      that._showError("等待图片上传完成");
      return;
    }
    if(!fullname||!tel){
      that._showError('请完善信息后提交');
      return;
    }
    if(!checkMobile(tel)){
      that._showError('手机号码格式不正确');
      return;
    }
    for (var i in pullimage) {
      if (!pullimage[i].flag) {
        arr.push(pullimage[i].url);
      }
    }
    // arr = ['https://api.ljxhlaw.com/upload/images/voucher/20180720/5b515d104e15c.jpg'];
    var params = {
      "activity_id": id,
      "user_id": uid,
      "store_id": sid,
      // "physical_id": 1,
      "user_name": fullname,
      "user_phone": tel,
      "imgs": arr,
      "answers": answerList,
      "baby_data": otherRequest,
      "code":code
    }
    console.log(_urlsubmit,params);
    app.api.postApi(_urlsubmit,{params},(err,res)=>{
      if(err||res.err_code!=0){return that._showError(res.err_msg)}
      that._showError('提交成功！感谢您的参与');
      setTimeout(()=>{
        wx.redirectTo({
          url: `./activity-hository?index=2&id=${id}&page=1`,
        })
      },2000);
    })
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