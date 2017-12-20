// pages/shopping/address-list.js

const app = getApp();
import { Api } from '../../utils/api_2';
Page({
  data:{
    addrList: [],
    uid:'',
    addressId:'',
  },
  onLoad:function(options){
    this.setData({ addressId: options.addressId});
    this.addrLists();
  },
  addrLists(e) {
    var that = this;
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    that.setData({
      uid
    })
    var params = {
      uid
    }
    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi('wxapp.php?c=address&a=MyAddress', { params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, 'resp.err_msg列表');
        var addrList = resp.err_msg;
        that.setData({
          addrList
        })
      }
    });
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
    var _addressId = this.data.addressId;

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
    var that = this;
    var uid = that.data.uid;
    console.log(e, 'eeee')
    var address_id = e.currentTarget.dataset.addressId;
    var params = {
      uid, address_id
    }
    app.api.postApi('wxapp.php?c=address&a=SetDefault', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, 'moren')
        that.addrLists();
      }
    });
  },
})