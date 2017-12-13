// pages/shopping/goods-detail.js

const app = getApp();
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
let _params = null;
let groupbuyId = 0;                   //团购ID 兼容团购和爆款
Page({
  data: {
    loading: false,
    data: null,
    prodId: null,
    action: null,    // 'present' 为赠品   'havealook'为从订单来查看详细的
    //多规格 start
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
    commodityAttr: [],
    attrValueList: [],
    firstIndex: -1,
    numShow: '',//库存
    //skuId:'', //多属性标识
    skuId: 0, //修改 2017年8月31日16:34:42
    attrPrice: '', //多属性的价格
    newCartNum: 0,
    cateId: 0,
    moreChoose: false,
    product: '',
    store_id: "",
    uid: '',
    activity_err_msg: "",
    property_list: '',
    shopNum: 1,
    multiattribute: [],
    quantitys: [],
    oneMatching: [],
    oriPid: '',
    curTabone: '',
    curTabtwo: '',
    choTab: '',
    numPid: '',
    arrone: '',
    arrotwo: "",
    curTabtwos: '',
    curTabs: '',
    sku_list: '',
    skuid_list: [],
    sku_id: '',
    product_id: '',
    is_add_cart: 1,
    goPayment:false,
    goAddCard:false
  },
  goStoreServer() {
    wx.navigateTo({
      url: '../index-new/server-wechat'
    });
  },
  goNewIndex() {
    wx.switchTab({
      url: '../index-new/index-new'
    });
  },
  goCart() {
    wx.switchTab({
      url: '../cart/cart'
    });
  },
  doGoBuy(e) {
    var that = this;
    var buyQuantity = e.currentTarget.dataset.buyQuantity;
    var isaddCart = e.currentTarget.dataset.isaddCart;
    var productId = e.currentTarget.dataset.productId;
    var skuId = e.currentTarget.dataset.skuId;
    var uid = e.currentTarget.dataset.uid;
    var storeId = e.currentTarget.dataset.storeId;
    var skuid_list = that.data.skuid_list;

    if (skuid_list.length > 0) {
      if (!skuId) {
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        // 选择属性之后发送请求添加到购物车
        that.goTheCar(buyQuantity, isaddCart, productId, skuId, uid, storeId);
      }
    } else {
      // 直接发送请求添加到购物车
      that.goTheCar(buyQuantity, isaddCart, productId, skuId, uid, storeId);
    }
    console.log(e, 'e');
  },
  goTheCar(buyQuantity, isaddCart, productId, skuId, uid, storeId) {
    var params = {
      uid,
      product_id: productId,
      is_add_cart: isaddCart,
      quantity: buyQuantity,
      sku_id: skuId,
      store_id: storeId
    }
    app.api.postApi('wxapp.php?c=cart&a=add', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        wx.showLoading({
          title: '加入购物车成功'
        })
        console.log('加入购物车成功')
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      }
    });
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
    // 页面初始化 options为页面跳转所带来的参数
    let { prodId, action, params } = options;
    _params = params;
    this.loadData(prodId, action);
    this.setData({ 'newCartNum': 0 });

    var cateId = options.cateId;
    this.setData({ 'cateId': cateId });
  },
  onReady: function () {
    // 页面渲染完成
  },
  //多规格 onShow
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  loadData(prodId, action) {
    var that = this;
    wx.showLoading({ title: '加载中' });

    //let url = 'shop/item/' + prodId;
    let url = 'wxapp.php?c=product&a=detail&product_id=' + prodId; //新接口
    console.log('接口url:');
    console.log(url);
    app.api.fetchApi(url, (err, response) => {
      console.log("错误解决方法");
      console.log(response);
      wx.hideLoading();
      if (err) return;
      var product = response.err_msg.product;
      that.setData({
        product: product
      })
    });
  },
  doBuy: function () {
    var that = this;
    that.setData({
      moreChoose: true,
      goPayment:true,
      goAddCard: false
    });
  },
  goImageClose() {
    var that = this;
    var oneMatching = that.data.oneMatching;
    if (oneMatching.length) {
      oneMatching.splice(0, oneMatching.length);//清空数组
    }
    that.setData({
      moreChoose: false,
      oneMatching: oneMatching,
      curTabs: '',
      arrone: '',
      arrotwo: "",
      oriPid: ''
    });
    console.log('222222222')
  },
  gotoCart: function () {
    let url = "../cart/cart";
    console.log(url);
    wx.reLaunch({ url });
  },
  onShareAppMessage(res) {
    return { title: '', path: '' }
  },
  /* 点击减号 w*/
  bindMinus: function () {
    var that = this;
    var shopNum = that.data.shopNum;
    shopNum--;
    if (shopNum <= 1) {
      wx.showLoading({
        title: '不能再少了',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
      that.setData({
        shopNum: 1
      })
    } else {
      that.setData({
        shopNum
      })
    }

  },
  /* 点击加号 w*/
  bindPlus: function () {
    var that = this;
    var shopNum = that.data.shopNum;
    shopNum++;
    that.setData({
      shopNum
    })
  },
  /* 输入框事件w */
  bindManual: function (e) {
    var that = this;
    console.log(e, '3')
    var shopNum = e.detail.value;
    if (shopNum <= 1) {
      wx.showLoading({
        title: '不能小于1',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
      that.setData({
        shopNum: 1
      })
    } else {
      that.setData({
        shopNum
      })
    }
  },
  goPayment(){
    var that = this;
  },
  //数量增减end
  //加入购物车start w
  addShopCart: function (e) {
    var that = this;
    var multiattribute = that.data.multiattribute;
    var quantitys = that.data.quantitys;
    var oneMatching = that.data.oneMatching;
    var skuid_list = that.data.skuid_list;
    if (oneMatching.length > 0) {
      oneMatching.splice(0, oneMatching.length);//清空数组
    }
    console.log('加入购物车', e)
    var product_id = e.currentTarget.dataset.productId;
    that.setData({
      moreChoose: true,
      oneMatching: oneMatching,
      oriPid: "",
      curTabs: '',
      arrone: '',
      arrotwo: "",
      product_id: product_id,
      goAddCard:true,
      goPayment: false
    });
    var uid = that.data.uid;
    var store_id = that.data.store_id;
    var params = {
      product_id,
      uid,
      store_id
    }
    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi('wxapp.php?c=cart&a=info', { params }, (err, resp) => {
      wx.hideLoading();
      console.log(resp, 666666666)
      var activity_err_msg = resp.err_msg.product;
      var property_list = resp.err_msg.property_list;
      var sku_list = resp.err_msg.sku_list;
      if (sku_list && sku_list.length > 0) {
        for (var i = 0; i < sku_list.length; i++) {
          console.log(sku_list[i].properties);
          console.log(sku_list[i].quantity);
          console.log(sku_list[i].properties.split(';'));//分割多属性字符串
          multiattribute.push(sku_list[i].properties.split(';'));//多属性选择数组
          quantitys.push(sku_list[i].quantity);//所有可能库存情况
          skuid_list.push(sku_list[i].sku_id);//所有sku_id情况
        }
      }
      console.log(multiattribute, 'multiattribute');
      that.setData({
        activity_err_msg,
        property_list,
        multiattribute,
        quantitys,
        sku_list
      });
    });
  },
  chooseProperty(e) {
    console.log('e', e)
    var that = this;
    var curTab = that.data.curTab;
    var arr_gropv = [];
    console.log(e, '多属性点击');
    var pid = e.currentTarget.dataset.pid;
    var vid = e.currentTarget.dataset.vid;
    console.log('pid', pid)
    console.log(' vid', vid)
    var gropv = pid + ':' + vid;
    arr_gropv.push(gropv);//点击选择属性的id选项组合
    console.log('arr_gropv', arr_gropv)
    var multiattribute = that.data.multiattribute;//多属性所有可能选项列表
    var quantitys = that.data.quantitys;//所有可能库存情况
    var oneMatching = that.data.oneMatching;//点击之后匹配情况入数组
    console.log(oneMatching.length, '数组情况')
    var skuid_list = that.data.skuid_list;
    console.log(skuid_list, 'skuid_list')
    console.log(skuid_list, 'skuid_list')
    var oriPid = that.data.oriPid;//初始pid
    console.log('quantitys', quantitys)

    if ((oriPid != pid) && oneMatching.length == 0) {
      oneMatching.splice(0, oneMatching.length);//清空数组
      for (var k = 0; k < multiattribute.length; k++) {
        for (var g = 0; g < multiattribute[k].length; g++) {
          if (multiattribute[k][g] == arr_gropv) {
            console.log(multiattribute[k], 'g')//获取点击匹配的可选项
            oneMatching.push(multiattribute[k]);//首次点击之后把所有可能匹配的入数
            console.log(oneMatching, '首次push的匹配值')
          }
        }
      }
      that.setData({
        arrone: '',
        arrotwo: '',
        curTabs: pid + vid,
        oriPid: pid
      })
      console.log('执行1')
    } else if ((oriPid == pid) && oneMatching.length != 0) {
      oneMatching.splice(0, oneMatching.length);//清空数组
      for (var k = 0; k < multiattribute.length; k++) {
        for (var g = 0; g < multiattribute[k].length; g++) {
          if (multiattribute[k][g] == arr_gropv) {
            console.log(multiattribute[k], 'g')//获取点击匹配的可选项
            oneMatching.push(multiattribute[k]);//重新加入匹配项
            console.log('oneMatching重新匹配', oneMatching)
          }
        }
      }
      that.setData({
        arrone: '',
        arrotwo: '',
        curTabs: pid + vid,
        oriPid: pid
      })
      console.log('执行2')
    } else if ((oriPid != pid) && oneMatching.length != 0) {//换行选中后
      for (var k = 0; k < multiattribute.length; k++) {
        for (var g = 0; g < multiattribute[k].length; g++) {
          console.log(multiattribute[k].length, 'multiattribute[k].length3')
          if (multiattribute[k][g] == arr_gropv) {
            console.log(multiattribute[k], 'g3')//获取点击匹配的可选项
            console.log(multiattribute[k][g], 'ggg3')//获取点击匹配的可选项
            console.log('是否执行到这里')
            for (var o = 0; o < oneMatching.length; o++) {
              if (oneMatching[o] == multiattribute[k]) {
                console.log(multiattribute[k], quantitys[k], 'multiattribute[k]点击匹配项');//设置匹配项颜色
                console.log(quantitys[k], 'quantitys[k]')
                if (quantitys[k] <= 0) {
                  wx.showLoading({
                    title: '买完了'
                  });
                  setTimeout(function () {
                    wx.hideLoading()
                  }, 2000)
                } else {
                  console.log(skuid_list[k], '匹配项的sku_id')
                  that.setData({
                    sku_id: skuid_list[k]
                  });
                  var arrObj = [];
                  for (var d = 0; d < multiattribute[k].length; d++) {
                    console.log(multiattribute[k][d], 'multiattribute[k][d]');
                    arrObj.push(multiattribute[k][d].split(':'));
                    console.log(arrObj, 'arrObj')
                    var array = multiattribute[k][d].split(':');
                    console.log(array, 'array')
                    console.log(array[0], 'array[0]');
                  }
                  console.log(arrObj, 'arrObj')
                  var objArr = [];
                  for (var u = 0; u < arrObj.length; u++) {
                    console.log(arrObj[u], 'arrObj[u]');
                    for (var q = 0; q < arrObj[u].length; q++) {
                      objArr.push(arrObj[u][q]);
                    }
                  }
                  var arrone = objArr[0] + objArr[1];
                  var arrotwo = objArr[2] + objArr[3];
                  console.log(arrone, 'arrone');
                  console.log(arrotwo, 'arrotwo');
                  that.setData({
                    arrone, arrotwo, curTabs: ''
                  })
                  console.log('执行3')

                }
              }
            }
            // that.setData({
            //   oriPid: pid
            // })
          }
        }
      }
    }
  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  }
  //加入购物车end

})
