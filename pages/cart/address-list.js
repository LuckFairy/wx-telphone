// pages/shopping/address-list.js

const app = getApp();
const log = 'buy.js --- ';

const SetDefaultURL = 'address/set_default';
let _addressId;      // 记录 addressId，防止重复加载

Page({
  data:{
    addrList: [],
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    _addressId = options.addressId;
    console.log(log + 'options');
    console.log(options);
    
    this.loadAddr();
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
  },

  /**
   * 加载页面数据
   */
  loadAddr: function() {
    wx.showLoading({ title: '加载中' });
    app.api.fetchApi('address/ls', (err, response) => {
      wx.hideLoading();
      if (err) return;
      let {rtnCode, rtnMessage, data} = response;
      if (rtnCode != 0) return;
      console.log(log + '收货地址列表')
      this.setData({addrList: data});
    });
  },

  /**
   * 添加地址
   */
  gotoAddAddr() {
    wx.redirectTo({
      url: './address',
    })
  },
  
  /**
   * 改变收货地址，回退到上一页面 
   */
  changeAdress(e) {
    let {addressId} = e.currentTarget.dataset;
    console.log(log + '点击地址addressId');
    console.log(addressId);
    console.log(e.target);
    if(_addressId == addressId) return wx.navigateBack();
    
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.changeAddress(addressId);
    wx.navigateBack();
  },

  /**
   * 删除地址
   */
  bindDelAddr(e) {
    wx.showModal({
      title: '确认操作',
      content: '是否确认删除地址？',
      success: res => {
        console.log(arguments);
        if(res.confirm) {
          let addrId = e.currentTarget.dataset.addrId;
          wx.showLoading({ title: '正在删除地址' });
          app.api.fetchApi('address/remove/' + addrId, (err, response) => {
            wx.hideLoading();

            if (err) {
              return this._showError('操作失败，请重试');
            }

            let {rtnCode, rtnMessage, data} = response;
            if (rtnCode != 0) {
              return this._showError(rtnMessage);;
            }

            this.loadAddr();
          });
        }
      }
    });
  },
  
  /**
   * 更新地址
   */
  updateAddress(e) {
    let {address} = e.currentTarget.dataset;
    wx.redirectTo({
      url: `./address?type=update&address=${JSON.stringify(address)}`,
    })
  },
  
  /**
   * 修改默认地址
   */
  changeDefaultAdress(e) {
    console.log(log + '修改默认地址');
    
    let {addressId, isDefault} = e.currentTarget.dataset;
    if(isDefault) return;
    app.api.postApi(SetDefaultURL, {addressId}, (err, res) => {  // 修改默认地址
      if(!err && res.rtnCode == 0) {
        console.log(log + '修改默认地址成功');
        this.loadAddr();
      } else {
        console.log(log + '修改默认地址失败');
        console.log(err);
      }
    });
  }
})