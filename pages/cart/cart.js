var app = getApp(); 
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';

Page({
  data: {
    hasShop: 0,
 
    //2017年12月19日14:55:05
    //carts: [],//购物车列表

    cart_list: '',//购物车列表
    selectedAllStatus:true,//默认不全选
    total:0,//结算合计金额
    cartSHow:false,//是否显示底部结算
  },
  bindMinus: function (e) {
    // 减少数量
    var that = this;
    console.log("ee", e)
    var cardId = e.currentTarget.dataset.cardId;
    var index = parseInt(e.currentTarget.dataset.index);
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
      that.addReduce(params, index, shopNumber);
    }

  },
  bindPlus: function (e) {
    // 增加数量
    var that = this;
    
    var cardId = e.currentTarget.dataset.cardId;
    var index = parseInt(e.currentTarget.dataset.index);
    var shopNumber = e.currentTarget.dataset.number;
    var productId = e.currentTarget.dataset.productId;
    var skuId = e.currentTarget.dataset.skuId;
    var uid = e.currentTarget.dataset.uid;
    var cart_list = that.cart_list;
   

    shopNumber++;
   console.log('数量', shopNumber);
    var params = {
      uid: uid,
      cart_id: cardId,
      product_id: productId,
      number: shopNumber,
      sku_id: skuId
    }
    that.addReduce(params, index, shopNumber);
   
  },
  // 列表选择事件
  bindCheckbox: function (e) {
    var that = this;
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    console.log(index);
    //原始的icon状态
    var cart_list = that.data.cart_list;
    var selected = cart_list[index].selected;
    var cartId = e.currentTarget.dataset.cardid;
    var selectedAllStatus = that.data.selectedAllStatus;
    // 对勾选状态取反
    cart_list[index].selected = !selected;

    var flag = 0;
    for (var i in cart_list) {
      if (!cart_list[i].selected) {//有一个不选中都取消全选
        selectedAllStatus = false;
      }
      if (cart_list[i].selected){
         flag ++;
      }
    };
    if(flag == cart_list.length){
      selectedAllStatus = true;
    }
   
    that.setData({ selectedAllStatus, cart_list });
    that.sum();
  },
  bindSelectAll: function () {
      var that = this;
      // 环境中目前已选状态
      var selectedAllStatus = this.data.selectedAllStatus;
      // 取反操作
      selectedAllStatus = !selectedAllStatus;
      // 购物车数据，关键是处理selected值
      var cart_list = this.data.cart_list;
      // 遍历
      for (var i = 0; i < cart_list.length; i++) {
        cart_list[i].selected = selectedAllStatus;
        
      }
      
      that.setData({ selectedAllStatus, cart_list});
      that.sum();
  },
  //计算金额
  sum(){
    var that = this;
    var carts = this.data.cart_list;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        total += carts[i].pro_num * carts[i].pro_price;
      }
    }
    // 写回经点击修改后的数组
    that.setData({
      cart_list: carts,
      total: '¥ ' + total
    });
    if (that.data.cart_list.length <= 0) {
      that.setData({
        cartSHow: false
      })
    } else {
      that.setData({
        cartSHow: true
      })
    }
  },
  //去结算
  bindCheckout: function () {
    var that = this;
    // 初始化字符串
    var ids = [], len = this.data.cart_list.length;
    // 遍历取出已勾选的cid
    for (var i = 0; i < len; i++) {
      if (this.data.cart_list[i].selected) {
        // ids += this.data.cart_list[i].product_id;
        // if(i < len-1){
        //   ids += ',';
        // }
        var id = parseInt(this.data.cart_list[i].pigcms_id);
        ids.push(id);
      }
    }
    if (ids === undefined ||ids.length == 0){
      wx.showToast({
        title: '请选择要结算的商品！',
        duration: 2000
      });
      return false;
    }
   //ids = '['+ids +']';
   //ids = JSON.stringify(ids);
    console.log('购物车选择提交的ids' + ids); 
    Api.signin();//获取以及存储openid、uid
    var uid = wx.getStorageSync('userUid'),store_id = store_Id.store_Id();
    //多商品下订单
    var shoppUrl = 'wxapp.php?c=order_v2&a=add_by_cart';
    app.api.postApi(shoppUrl, { "params": { uid, store_id, ids, point_shop:'0'} }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var  order_no = rep.err_msg.order_no;
        //下完订单，取的订单id
        var url = './buy?order_no=' + order_no;
        wx.navigateTo({ url });
      }else{
        var msg = err || rep.err_msg;
        that._showError(msg);
      }     
    });
   
  },
  goindex(){
    wx.reLaunch({ url:'../index-new/index-new'});
  },

  
  onLoad: function (options) {
    var that = this;
    // 获取店铺id shopId
    var store_id = store_Id.store_Id();
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    that.setData({
      uid, store_id
    });
    var params ={
      store_id,
      uid
    }
    app.api.postApi('wxapp.php?c=cart&a=number', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp) {
        if (resp.err_msg == 1) {
          // 有商品
          that.loadList(params);
          that.setData({
            hasShop: 1,
            cartSHow:true
          })
        } else {
          // 无商品
          that.setData({
            hasShop: 0,
            cartSHow:false
          })
        }
      }

    });
    
  },
  onShow: function () {
   var that = this;
   var hasShop = that.data.hasShop;//有无商品
   if(hasShop == 1){//有商品的时候加载
      var store_id = that.data.store_id;
      var uid = that.data.uid;
      var params = {
        store_id, uid
      }
      //that.refreshList(params);
      
   }
  },
  onHide: function () {

  },
  refreshList(params){
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('购物车列表', resp);
        var cart_list = resp.err_msg.cart_list;
        var cartSHow = that.cartSHow;
        if (cart_list.length <= 0) {
          cartSHow = false;
        } else {
          cartSHow = true;
        };
        that.setData({
          cart_list,
          cartSHow
        });
        //计算金额
        that.sum();
      }
    }); 
  },
  //初始加载数据
  loadList(params) {
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
      if (err || resp.err_code != 0 ) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('购物车列表', resp);
        var cart_list = resp.err_msg.cart_list;
        var selected = that.data.selectedAllStatus;
        for(var i in cart_list){
          cart_list[i].selected = selected;
        }
        var selectedAllStatus = that.data.selectedAllStatus;
        var cartSHow = that.cartSHow;
        if (cart_list.length <=0){
          cartSHow = false;
        }else{
          cartSHow = true;
        };
        that.setData({
          cart_list,
          selectedAllStatus,
          cartSHow
        });
        //计算金额
        that.sum();
      }
    });
  },
  /*
  *数量cart_list.pro_num数量变化
  *index 下标
  * num 数量
  */
  numList(index , num) {
    console.log(index ,num)
    var that = this;
    var cart_list = that.data.cart_list;

    if(num){//有传数量参数就是加减
      cart_list[index].pro_num = num;
    }else{//无就是删除商品
      cart_list.splice(index,1);
    }

    
    that.setData({cart_list});
    //计算金额
    that.sum();
  },
  addReduce(params,index,num) {
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=quantity', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        
        var store_id = that.data.store_id;
        var uid = that.data.uid;
        var params = {
          store_id, uid
        }
        that.numList(index,num);
       
      } else {
        wx.showLoading({
          title: '不能修改数量'
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 1000)
      }
    });
  },

  removeShopCard: function (e) {
    console.log(e, 'eeee');
    var that = this;
    var cardId = e.currentTarget.dataset.cardId;
    var storeId = e.currentTarget.dataset.storeId;
    var uid = e.currentTarget.dataset.uid;
    var index = parseInt(e.currentTarget.dataset.index);

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
              //that.refreshList(params);
              
              that.numList(index);

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
  },
  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
  },

})