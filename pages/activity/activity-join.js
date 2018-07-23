let app = getApp();
import config from '../../config';
import { checkMobile } from '../../utils/util.js';
const _urlDetail = 'wxapp.php?c=voucher&a=voucher_info';//获取活动问题数据
const _urlsubmit = "wxapp.php?c=voucher&a=voucher_join";//马上参与提交接口
const _urlimg = config.host+'wxapp.php?c=voucher&a=image_upload';


Page({
  data: {
    sid: app.store_id,
    uid: null,
    fullname:null,
    tel:null,
    id:null,//活动id
    queList:'',//活动信息列表
    answerList:[],//回答问题列表
    pullimage:[],
    error:null,
    imgFlag:true,
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
        url: '../index-new/index-new',
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
      console.log(res);
      if(err||res.err_code!=0){return false;}
      var queList = res.err_msg.questions;
      var len  = res.err_msg.pig_num;
      var pullimage = [];
      for(var i=0;i<len;i++){
        pullimage.push({ url:"../../image/icon-upload.png",flag:true});
      }
      if (len == 0) { pullimage=[];}
      this.setData({ queList, pullimage})
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
    var opt = { url: "../../../image/icon-upload.png", flag: true };
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
    console.log(e)
    let val = e.detail.value, id = e.target.dataset.id, answerList = this.data.answerList;
    if(!val||val.length<1){return;}
    var opt={
      question_id:id,
      answer:val,
    }
    answerList.push(opt);
    this.setData({answerList})
  },
  goCofirm(){
    let that =this,arr=[],arr2;
    let { fullname, tel, answerList, pullimage,id,uid,sid,imgFlag}=that.data;
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
    var params = {
      "activity_id": id,
      "user_id": uid,
      "store_id": sid,
      // "physical_id": 1,
      "user_name": fullname,
      "user_phone": tel,
      "imgs": arr,
      "answers": answerList
    }
    app.api.postApi(_urlsubmit,{params},(err,res)=>{
      if(err||res.err_code!=0){return that._showError(res.err_msg)}
      wx.redirectTo({
        url: `./activity-hository?index=2&id=${id}&page=1`,
      })
    })
  },
  /**
   * 显示错误信息
   */
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    this.setData({ error: errorMsg });
    setTimeout(() => {
      this.setData({ error: null });
    }, 3000);
    return false;
  },
})