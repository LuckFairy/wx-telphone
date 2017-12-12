// pages/mine/my-baby.js
var app = getApp();
const log = 'my-baby.js --- ';

const BabyList = 'baby/ls';        // 宝宝列表
const BabyAdd = 'baby/add';        // 添加宝宝
const BabyUpdate = 'baby/update';  // 修改宝宝
const BabyRemove = 'baby/remove';  // 删除宝宝

Page({
  data:{
    loading: true,       // 正在加载
    pageData: null,      // 宝宝列表数据
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this._loadData();
  },
  
  /**
   * 加载页面数据
   */
  _loadData() {

    let pageData = [
      {
        id: 1,
        name: '小小明',
        sex: 1,
        age: '三岁2月',
        birthday: '2013-11-31'
      },
      {
        id: 2,
        name: '小悦悦',
        sex: 2,
        age: '三岁2月',
        birthday: '2013-11-31'
      },
      {
        id: 3,
        name: '小明明',
        sex: 0,
        age: '孕27周0天',
        expectedDate: '2013-11-31'
      },
    ];
    
    pageData = this._handleData(pageData);
    
    console.log(pageData);
    this.setData({
      loading: false,
      pageData
    });
  },
  
  /**
   * 处理数据
   * 根据不同性别添加不同的称呼和背景
   */
  _handleData(pageData) {
    pageData.forEach( item => {
      switch(item.sex) {
        case 0: {             // 孕育中
          item.backgroundImage = '../../image/mine_baby_mom.png'; 
          item.nickName = '';
        }break;
        case 1: {             // 男孩
          item.backgroundImage = '../../image/mine_baby_boy.png';
          item.nickName = '小王子';
        }break;
        case 2: {             // 女孩
          item.backgroundImage = '../../image/mine_baby_girl.png';
          item.nickName = '小公主';
        }
      }
    });
    
    return pageData;
  }, 
  
  /**
   * 点击 baby 完善资料
   */
  completeInfo() {
    wx.navigateTo({
      url: './babies-info'
    });
  },
  
  /**
   * 添加宝宝档案
   */
  addBaby() {
    wx.navigateTo({
      url: './babies-info'
    });
  },
  
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})