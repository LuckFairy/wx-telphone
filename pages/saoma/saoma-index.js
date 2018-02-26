import { Api } from '../../utils/api_2';
import { sign } from '../../utils/loginUtil';

let app = getApp();

const  shoppUrl = 'wxapp.php?c=order_v2&a=add_by_cart';
const physical_id = app.globalData.phy_id;//门店id

let errModalConfig = {
  title: '有错误！',
};
let that;


let store_id = app.store_id;
let uid = app.globalData.uid;
let openid = app.globalData.openid;
let hasSignin = app.globalData.hasSignin;
let logLat = app.globalData.logLat;

const physicalUrl = 'wxapp.php?c=physical&a=physical_list';//las门店列表接口
const physicalMainUrl = 'wxapp.php?c=physical&a=main_physical';//总店信息

Page({
  data: {
    hasShop: 0,//购物车数量
    cart_list: '',//购物车列表
    selectedAllStatus: true,//默认不全选
    total: "0.00",//结算合计金额
    cartSHow: false,//是否显示底部结算
    baokuanList: [], //爆款列表
    showErrModal: false,
    input:false,//不是输入弹窗
    coupon_value: [],//线上优惠券面值数组
    inputValue:'',
    locationTip:"定位中...",
    physicalClost: '',//最近门店信息
    phyDefualt: [],//默认门店信息
    changeFlag: true,//是否切换门店
  },
 

  /**
     * 获取总店信息
     */
  loadMainLocation() {
    let that = this;
    let phyDefualt = that.data.phyDefualt;
    var url = physicalMainUrl;
    var params = {
      store_id
    };
    app.api.postApi(url, { params }, (err, resp) => {
      // 列表数据
      wx.hideLoading();
      if (resp.err_code != 0) {
        return;
      }
      phyDefualt = resp.err_msg.physical_list[0];
      console.log('phyDefualt', phyDefualt);
      that.setData({
        physicalClost: phyDefualt
      })
    });
  },

  /**
   * 获取当前门店位置
   */
  loadLocation(phy_id, logLat) {
    var that = this;
    var phyDefualt = that.data.phyDefualt;
    if (logLat == '' || logLat == null) {
      app.globalData.logLat = wx.getStorageSync('logLat');
      logLat = wx.getStorageSync('logLat');
    }
    console.log('loglat........', logLat);
    if (!logLat) {
      that.setData({ changeFlag: false })
      return;
    }
    wx.showLoading({
      title: '加载中'
    });
    var params = {
      uid,
      store_id,
      page: '1',
      long: logLat[0],
      lat: logLat[1]
    }
    var url = physicalUrl;

    app.api.postApi(physicalUrl, { params }, (err, resp) => {
      // 列表数据
      wx.hideLoading();
      if (resp.err_code != 0) {
        that.setData({
          locationTip:"所处位置未搜到扫码购门店，手动去选择"
        });
        return;
      }
      var list = resp.err_msg.physical_list;
      for (var j = 0; j < list.length; j++) {
        if (list[j].select_physical == "1") {
          phyDefualt = list[j];
        }
      }
      if (phyDefualt.length == 0) { phyDefualt = list[0]; }
      that.setData({
        physicalClost: phyDefualt
      })
    });
  },
  /**
   * 加载优惠券面值
   */
  loadCoupon:function(){
    let that = this;
    //线上优惠券信息
    app.api.postApi('wxapp.php?c=coupon&a=store_coupon', { "params": { "uid": that.data.uid, "store_id": that.data.store_id, "product_id": that.data.product_id } }, (err, resp) => {
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        var coupon_value = that.data.coupon_value;
        var len = resp.err_msg.coupon_count > 2 ? 2 : resp.err_msg.coupon_count;
        for (var i = 0; i < len; i++) {
          coupon_value.push(resp.err_msg.coupon_value[i]);
        }
        that.setData({
          coupon_value: coupon_value
        });
      }
    });   
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
      if (cart_list[i].selected) {
        flag++;
      }
    };
    if (flag == cart_list.length) {
      selectedAllStatus = true;
    }

    that.setData({ selectedAllStatus, cart_list });
    that.sum();
  },
  scanCode: function () {

    wx.navigateTo({
      url: '../saomagou/pages/saoma/saoma-order'
    })

    // var that = this;
    // // 只允许从相机扫码
    // wx.scanCode({
    //   onlyFromCamera: true,
    //   success: (res) => {
    //     console.log('扫码成功data...',res);
    //     var params = {
    //       store_id,
    //       uid:that.data.uid
    //     };
    //     that.loadList(params);
    //   }
    // })
  },
  //计算金额
  sum() {
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
        var id = parseInt(this.data.cart_list[i].pigcms_id);
        ids.push(id);
      }
    }
    if (ids === undefined || ids.length == 0) {
      return false;
    }
    console.log('购物车选择提交的ids' + ids);
   
    var uid = that.data.uid;
    //多商品下订单
    
    app.api.postApi(shoppUrl, { "params": { uid, store_id, ids, point_shop: '0', physical_id} }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var order_no = rep.err_msg.order_no;
        //下完订单，取的订单id
        var url = './buy?order_no=' + order_no;
        wx.navigateTo({ url });
      } else {
        var msg = err || rep.err_msg;
        that._showError({ title: msg })
        
      }
    });

  },
  /**
   * 手动输入条形码
   */
  inputBarcode() {
    this.setData({ showErrModal:true,input:true});
  },

  bindInput:function(e){
    that.setData({
      inputValue: e.detail.value
    });
  },
/**
 * 确定按钮
 */
  tabConfirm(e){
    this.setData({ showErrModal: false, input: false });
    var value = that.data.inputValue;
    if(value==null||value==''){
      wx.showToast({
        title: '输入为空，请重新输入！',
        icon: 'success',
        duration: 1000
      })
      return;
    }

    var params={
      uid: uid,
      store_id: store_id,
      code: value,
      quantity: 1,
    };
    wx.showLoading({
      title: '加载中'
    });
    app.api.postApi('wxapp.php?c=qrproduct_v2&a=add', { params }, (err, resp) => {
      // 列表数据
      if (resp) {
        wx.hideLoading();
        if (resp.err_code == 0) {
          for (var j = 0; j < resp.err_msg.physical_list.length; j++) {
            that.data.physical_list.push(resp.err_msg.physical_list[j])
          }
          that.setData({
            physical_list: that.data.physical_list
          })
        } else {

          that.setData({
            locationTip: '所处位置未搜到扫码购门店，手动去选择'
          });

          wx.showToast({
            title: resp.err_msg,
            icon: 'success',
            duration: 1000
          })
        }
      } else {
        //  错误
      }
    });

    wx.showModal({
      title: '条形码',
      content: '该条形码识别不出匹配商品',
      showCancel:true,
      cancelText:'扫码',
      confirmText:'输入条码',
      confirmColor:'#1b1b1b',
      success: function (res) {
        if (res.confirm) {
          that.inputBarcode();
        } else if (res.cancel) {
          that.scanCode();
        }
      }
    })
  },
 
 getCoupon:function(){
   var params = {
     store_id,
     uid
   };
   app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
     if (err || resp.err_code != 0) {
       return;
     }
     if (resp.err_code == 0) {
       console.log('购物车列表', resp);
       var cart_list = resp.err_msg.cart_list;
       var cartSHow = that.cartSHow;
       var hasShop = cart_list.length;
       if (cart_list.length < 1) {
         console.log('false')
         cartSHow = false;
       } else {
         console.log('true')
         cartSHow = true;
       };
       that.setData({
         cart_list,
         cartSHow,
         hasShop
       });
       //计算金额
       that.sum();
     }
   });
 },

  onLoad: function (options) {
    that = this;
    this.loadMainLocation();
    wx.showLoading({
      title: '加载中',
    })

    if (uid == '' || logLat == '') {
      sign.signin(() => {
        sign.getLocation((res) => {
          logLat = wx.getStorageSync('logLat');
          uid = wx.getStorageSync('userUid');
          openid = wx.getStorageSync('userOpenid');
          hasSignin = wx.getStorageSync('hasSignin');
          app.globalData.logLat = logLat;
          app.globalData.openid = openid;
          app.globalData.uid = uid;
          app.globalData.hasSignin = hasSignin;
          that.loadLocation('logLat坐标信息', logLat);//获取门店信息
          console.log('index....lbs', logLat);
        })
      });
    } else {
      that.loadLocation('logLat坐标信息', logLat);//获取门店信息
    }
    var params = {
      store_id,
      uid
    };
    that.loadList(params);
 
  },
  onShow: function () {
    var that = this;
    var hasShop = that.data.hasShop;//有无商品
    // var uid = that.data.uid;
    var params = {
      store_id, uid
    }
    that.loadList(params);
  },
  onHide: function () {

  },
  refreshList(params) {
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('购物车列表', resp);
        var cart_list = resp.err_msg.cart_list;
        var cartSHow = that.cartSHow;
        var hasShop = cart_list.length;
        if (cart_list.length < 1) {
          console.log('false')
          cartSHow = false;
        } else {
          console.log('true')
          cartSHow = true;
        };
        that.setData({
          cart_list,
          cartSHow,
          hasShop
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
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('购物车列表', resp);
        var cart_list = resp.err_msg.cart_list;
        var selected = that.data.selectedAllStatus;
        for (var i in cart_list) {
          cart_list[i].selected = selected;
        }
        var selectedAllStatus = that.data.selectedAllStatus;
        var cartSHow = that.cartSHow;
        var hasShop = that.hasShop;
        if (cart_list.length <= 0) {
          hasShop = 0;
          cartSHow = false;
        } else {
          hasShop = 1;
          cartSHow = true;
        };
        that.setData({
          cart_list,
          hasShop,
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
  numList(index, num) {
    console.log(index, num)
    var that = this;
    var cart_list = that.data.cart_list;

    if (num) {//有传数量参数就是加减
      cart_list[index].pro_num = num;
    } else {//无就是删除商品
      cart_list.splice(index, 1);
    }


    that.setData({ cart_list });
    //计算金额
    that.sum();
  },


  addReduce(params, index, num) {
    var that = this;
    app.api.postApi('wxapp.php?c=cart&a=quantity', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {

    
        var uid = that.data.uid;
        var params = {
          store_id, uid
        }
        that.numList(index, num);

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
     
              var uid = that.data.uid;
              var params = {
                store_id, uid
              }
              that.refreshList(params);

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
    wx.showToast({ title: errorMsg, image: '../../image/group-mes.png.png', mask: true });
    this.setData({ error: errorMsg });
  },
  /**
    * 显示模态框
    */
  showModel(config) {  // type: success||err
    errModalConfig = Object.assign(errModalConfig, config);
    this.setData({
      errModalConfig: errModalConfig,
      showErrModal: true
    });
  },

  /**
   * 点击隐藏模态框(错误模态框)
   */
  tabModal() {
    this.setData({ showErrModal: false });
  },
})