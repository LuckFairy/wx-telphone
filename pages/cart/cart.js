var app = getApp();
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';

Page({
  data: {
    hasShop: 0,
    cart_list: '',
    selected:false,
    ids:[]
  },
  goindex: function () {
    // var url = "../index-new/index-new";
    // if (url) {
    //   wx.switchTab({ url });
    // }
  },
  bindMinus: function (e) {
    // 减少数量
    var that = this;
    console.log("ee", e)
    var cardId = e.currentTarget.dataset.cardId;
    var shopNumber = e.currentTarget.dataset.number;
    var productId = e.currentTarget.dataset.productId;
    var skuId = e.currentTarget.dataset.skuId;
    var uid = e.currentTarget.dataset.uid;
    if (shopNumber <= 1) {
      wx.showLoading({
        title: '不能再少了'
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
    } else {
      shopNumber--;
      console.log('数量', shopNumber);
      var params = {
        uid: uid,
        cart_id: cardId,
        product_id: productId,
        number: shopNumber,
        sku_id: skuId
      }
      that.addReduce(params);
    }
  },
  bindPlus: function (e) {
    // 增加数量
    var that = this;
    console.log("ee", e)
    var cardId = e.currentTarget.dataset.cardId;
    var shopNumber = e.currentTarget.dataset.number;
    var productId = e.currentTarget.dataset.productId;
    var skuId = e.currentTarget.dataset.skuId;
    var uid = e.currentTarget.dataset.uid;
    shopNumber++;
    console.log('数量', shopNumber);
    var params = {
      uid: uid,
      cart_id: cardId,
      product_id: productId,
      number: shopNumber,
      sku_id: skuId
    }
    that.addReduce(params);
  },

  bindCheckbox: function (e) {

  },

  bindSelectAll: function () {
      console.log('点击全选按钮');
      this.setData({ ids: [81, 82] });
  },
  //去结算
  bindCheckout: function () {



    var ids = this.data.ids;
    console.log('购物车选择提交的id=' + ids);//return;
    if (ids === undefined ||ids.length == 0){
      wx.showToast({
        title: '请选择要结算的商品！',
        duration: 2000
      });
      return false;
    }

    //console.log('购物车选择提交的id=' + ids); return;
    //下订单
    let order_no ="PIG20171218171451388818";
    //下完订单，取的订单id
    let url = './buy?&order_no=' + order_no;
    wx.navigateTo({ url });
  },

  bindToastChange: function () {
    //  this.setData({
    //    toastHidden: true
    //  });
  },
  
  onLoad: function (options) {
    var that = this;
    // 获取店铺id shopId
    var store_id = store_Id.store_Id();
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    console.log(uid, 'uid');
    console.log(store_id, 'store_id');
    that.setData({
      uid, store_id
    })
    var params = {
      uid, store_id
    }
    app.api.postApi('wxapp.php?c=cart&a=number', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp) {
        if (resp.err_msg == 1) {
          // 有商品
          that.setData({
            hasShop: 1
          })
        } else {
          // 无商品
          that.setData({
            hasShop: 0
          })
        }
      }

    });
    that.refreshList(params);
  },
  refreshList(params) {
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('购物车数据', resp);
        var cart_list = resp.err_msg.cart_list;
        that.setData({
          cart_list
        })
      }
    });
  },
  addReduce(params) {
    wx.showLoading({
      title: '加载中'
    })
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=quantity', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        // 减少成功
        wx.hideLoading();
        var store_id = that.data.store_id;
        var uid = that.data.uid;
        var params = {
          store_id, uid
        }
        that.refreshList(params);
      } else {
        wx.showLoading({
          title: '修改失败'
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 1000)
      }
    });
  },
  onShow: function () {
    var that = this;
    // 获取店铺id shopId
    var store_id = store_Id.store_Id();
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    console.log(uid, 'uid');
    console.log(store_id, 'store_id');
    that.setData({
      uid, store_id
    })
    var store_id = that.data.store_id;
    var uid = that.data.uid;
    var params = {
      store_id, uid
    }
    that.refreshList(params);
  },
  onHide: function () {

  },
  removeShopCard: function (e) {
    console.log(e, 'eeee');
    var that = this;
    var cardId = e.currentTarget.dataset.cardId;
    var storeId = e.currentTarget.dataset.storeId;
    var uid = e.currentTarget.dataset.uid;
    var params = {
      uid, cart_id: cardId, store_id: storeId
    }
    wx.showModal({
      title: '删除商品',
      content: '确定删除吗',
      success: function (res) {
        if (res.confirm) {
          app.api.postApi('wxapp.php?c=cart&a=delete', { params }, (err, resp) => {
            if (err) {
              return;
            }
            if (resp.err_code == 0) {
              // 删除成功
              var store_id = that.data.store_id;
              var uid = that.data.uid;
              var params = {
                store_id, uid
              }
              that.refreshList(params);
            } else {
              // 删除失败
              wx.showLoading({
                title: '删除失败',
              })

              setTimeout(function () {
                wx.hideLoading()
              }, 1000)
            }
          });
        } else if (res.cancel) {
          return;
        }
      }
    })
  },
  onShareAppMessage(res) {
    // return { title: '', path: '' }
  }
})