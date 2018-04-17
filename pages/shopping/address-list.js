// pages/shopping/address-list.js

const app = getApp();
import { Api } from '../../utils/api_2';
Page({
  data: {
    addrList: [],
    uid: '',
    addressId: '',
    store_id: ''
  },
  onLoad: function (options) {
    var store_id = app.store_id;
    this.setData({ addressId: options.addressId,store_id });
    this.addrLists();
  },
  addrLists(e) {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    that.setData({
      uid
    })
    var params = {
      uid, store_id: that.data.store_id
    }
    wx.showLoading({
      title: '加载中'
    })
    console.log(params,'params')
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
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
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
    let { addressId } = e.currentTarget.dataset;
    var _addressId = this.data.addressId;
    var uid = this.data.uid;

    if (_addressId == addressId) return wx.navigateBack();

    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.changeAddress(uid);
    wx.navigateBack();
  },

  /**
  * 删除地址
  */
  bindDelAddr(e) {
    var that = this;
    wx.showModal({
      title: '确认操作',
      content: '是否确认删除地址？',
      success: res => {

        if (res.confirm) {
          let addrId = e.currentTarget.dataset.addressId;
          var params = { "uid": that.data.uid, "address_id": addrId }
          var index = e.currentTarget.dataset.index;
          var addrList = that.data.addrList;
          wx.showLoading({ title: '正在删除地址' });
          app.api.postApi('wxapp.php?c=address&a=DelAddress', { params }, (err, reps) => {
            wx.hideLoading();
            if (err) {
              return that._showError('操作失败，请重试');
            }
            if (reps.err_code != 0) {
              return that._showError(result);;
            }
            if (reps.err_code == 0) {
              addrList.splice(index, 1);
              that.setData({ addrList });
            }
          });
        }
      }
    });
  },

  /**
   * 更新地址
   */
  updateAddress(e) {
    console.log('点击编辑的时候', e)
    var that = this;
    var uid = that.data.uid;
    var address_id = e.currentTarget.dataset.addressId;
    wx.redirectTo({
      url: './address?revamp=1&uid=' + uid + '&address_id=' + address_id
    })
  },

  /**
   * 修改默认地址
   */
  changeDefaultAdress(e) {
    var that = this;
    var uid = that.data.uid;
    var addrList = that.data.addrList;
    var address_id = e.currentTarget.dataset.addressId;
    var index = parseInt(e.currentTarget.dataset.index);
    var def = addrList[index].default;


    var params = {
      uid, address_id
    }
    app.api.postApi('wxapp.php?c=address&a=SetDefault', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, 'moren');
        //取反操作
        if (def == 0) { 
          def = 1; 
          for (var i in addrList) {
            if (i != index) {
              addrList[i].default = 0;
            }
          }
        } 
        addrList[index].default = def;
        that.setData({
          addrList
        });
      }
    });
  },
  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
})