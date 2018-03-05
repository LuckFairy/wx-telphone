// pages/redbox/redbox.js
var app = getApp();
const log = 'redbox.js --- ';

var isOpen = false;
var _doOpen = 0;     // 到2时打开红包
var _result = null;  // 记录红包数据
var animationTime = 500;
Page({
  data:{
    leftTime: 3
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

    let {qrEntry} = options;

    let url = 'redbox/getRedBoxActivity'; //获取红包活动信息
    app.api.postApi(url, {}, (err, data) => {
      
      if(err) {
        console.log(log + '取 activityId 失败');
        console.log(err);
        return;
      }

      let {activityId} = data.data;

      console.log(log + 'activityId');
      console.log(activityId);

      this.activityId = activityId; // 获取 activityId
      
      if (qrEntry){
          this.doOpen();
      }
    });
  },
  goCanvas:function(){
      wx.navigateTo({
        //url: '../shiyan/shiyan_2',
        url: '../lottery/dazhuanpan',
      })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
      this.getSummaryData();
    
    var animation = wx.createAnimation({
      duration: animationTime,
      timingFunction: 'linear', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    this.animation = animation;
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  getSummaryData: function(){
      app.api.postApi('redbox/getAvailableData', {'a':'b'}, (err, data) => {
          if (err) {
              return;
          }
          if (data && data.data){
            let {lefttotal} = data.data;
            this.setData({ countFlow: lefttotal});
          }
      });
      app.api.postApi('card/getCountOfAvailableCards', { 'a': 'b'}, (err, data) => {
          if (err) {
              return;
          }
          if (data && data.data) {
            let {count} = data.data;
            this.setData({ countCard: count });
          }
      });
  },



  doOpen: function(event){
    _doOpen = 0;
    if (isOpen) return;
    isOpen = true;
    this.animation.rotateY(180).step();
    this.animation.rotateY(0).step();
    this.setData({animationData:this.animation.export()});
    
    this._sendRequest();
    
    setTimeout(() => {
      _doOpen++;
      if(_doOpen === 2) {
        wx.navigateTo({
          url: `./open-result?data=${JSON.stringify(_result)}`
        });  
      }
    }, animationTime*2);
  },
  
  /**
   * 发起开红包请求.
   */
  _sendRequest() {
    let url = 'redbox/requestForNodeJs';  // 抢红包接口
    let params = {
      activityId: this.activityId,
      interfaceName: 'grab'
    };
    app.api.postApi(url, params, (err, data) => {
      if(err || data.rtnCode != 0) {
        console.log(log + '调用抢红包接口失败');
        console.log(err);
        isOpen = false;
          wx.showModal({
          title: '请重试',
          showCancel: false
        });
      } else {
        console.log(log + '调用抢红包接口');
        console.log(JSON.parse(data.data).data);
        let result = JSON.parse(data.data).data;
        _result = result;
        
        if (result.leftTime == 0 && result.hit == false){
            return this.setData({ leftTime: 0, isHit: result.hit });
        }
        
        isOpen = false;
        
        _doOpen++;
        if(_doOpen === 2) {
          wx.navigateTo({
            url: `./open-result?data=${JSON.stringify(result)}`
          });  
        }

        this.setData({ leftTime: result.leftTime, isHit: result.hit });    
      }
    });
  },
  onShareAppMessage(res) {
      return { title: '', path: '' }
  },
})