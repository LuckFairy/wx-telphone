// pages/shopping/address-list.js

const app = getApp();
import { Api } from '../../utils/api_2';
Page({
  data:{
    addrList:'',
    uid:''
  },
  updateAddress(e){
    console.log('点击编辑的时候',e)
    var that = this;
    var uid = that.data.uid;
    console.log(e, 'eeee')
    var address_id = e.currentTarget.dataset.addressId;
    wx.redirectTo({
      url: './address?revamp=1&uid=' + uid + '&address_id=' + address_id
    })
  },
  bindDelAddr(e){
    var that = this;
    var uid = that.data.uid;
    console.log(e, 'eeee')
    var address_id = e.currentTarget.dataset.addressId;
    var params = {
      uid, address_id
    }
    wx.showModal({
      title: '提示',
      content: '确定要删除吗',
      success: function (res) {
        if (res.confirm) {
          app.api.postApi('wxapp.php?c=address&a=DelAddress', { params }, (err, resp) => {
            if (err) {
              return;
            }
            if (resp.err_code == 0) {
              console.log(resp.err_msg, 'moren')
              wx.showLoading({
                title: '删除成功'
              })
              setTimeout(function () {
                wx.hideLoading()
              }, 1000)
              that.addrLists();
            }
          });
        } else if (res.cancel) {
          wx.showLoading({
            title: '删除失败'
          })

          setTimeout(function () {
            wx.hideLoading()
          }, 1000)
        }
      }
    })
  },
  changeDefaultAdress(e){
    var that = this;
    var uid = that.data.uid;
    console.log(e,'eeee')
    var address_id = e.currentTarget.dataset.addressId;
    var params = {
      uid, address_id
    }
    app.api.postApi('wxapp.php?c=address&a=SetDefault', { params}, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg,'moren')
        that.addrLists();
      }
    });
  },
  onLoad:function(options){
    // 加载地址列表
    this.addrLists();
  },
  addrLists(e){
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
        var addrList = resp.err_msg.addresslist;
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
   * 添加地址
   */
  gotoAddAddr() {
    wx.redirectTo({
      url: './address',
    })
  },
})