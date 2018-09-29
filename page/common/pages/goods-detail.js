
const app = getApp();
let store_id = app.store_id;
let uid = wx.getStorageSync('userUid');
let groupbuyId = 0;                   //团购ID 兼容团购和爆款
let physical_id = wx.getStorageSync('phy_id'); //门店id
const addOrderUrl = 'wxapp.php?c=order_v2&a=add';//生成订单接口
Page({
  data: {
    mode: 'aspectFit',//图片缩放模式
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
    newCartNum: 0,//读取后台购物车数量多少件
    //cartNum :0,//购物车初始化0件

    moreChoose: false,
    product: '',
    store_id: "",
    uid: '',
    activity_err_msg: "",
    property_list: [],
    shopNum: 1,//购买数量
    multiattribute: [],
    quantitys: [],
    oneMatching: [],
    oriPid: '',
    curTabone: '',
    curTabtwo: '',
    choTab: '',
    numPid: '',
    arrone: '',//pid+vid;
    arrotwo: "",//pid+vid
    curTabtwos: '',
    curTabs: '',//是否选取
    sku_list: '',
    skuid_list: [],
    sku_id: '',
    product_id: '',
    is_add_cart: 1,
    goPayment: false,//立即下单，增加立即下单
    goAddCard: false,
    shopCoupon: [], //线上优惠券
    coupon_value: [],//线上优惠券面值数组
    coupon_list: [],//线上优惠券数组
    showList: false,//是否显示优惠券列表
    price: [],      //所有价格列表
    choPrice: '',//单品价格
    choQuantity: '',//单品库存
    tabCheck: false,//多属性是否选中,
    preTimeText: { hour: 0, minute: 0, second: 0 },
    preTime: 234,
    isShowPre: false//显示预售商品提示
  },
  onShareAppMessage(res) {
    let that = this;
    let dataset = res.target.dataset;

    return {
      title: dataset.title,
      path: `/page/common/pages/goods-detail?prodId=${that.data.product_id}&action=${that.data.action}`,
      imageUrl: dataset.imgurl
    }
  },
  goStoreServer() {
    wx.navigateTo({
      url: '../../my/pages/server-wechat'
    });
  },
  goNewIndex() {
    wx.switchTab({
      url: '../../tabBar/home/index-new'
    });
  },
  goCart() {
    wx.switchTab({
      url: '../../tabBar/goods/cart'
    });
  },
  /**购物车立即购买 */
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

  },
  goTheCar(buyQuantity, isaddCart, productId, skuId, uid, storeId) {
    var that = this;
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
        //更新购物车的数量
        var params = {
          uid,
          store_id: storeId
        }
        app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
          if (err || resp.err_code != 0) {
            return;
          }
          if (resp.err_code == 0) {
            console.log('购物车的数量是', resp.err_msg.cart_list_number);
            that.setData({
              newCartNum: resp.err_msg.cart_list_number
            });
          }
        });


        setTimeout(function () {
          wx.hideLoading();
          var moreChoose = false;
          that.setData({ moreChoose });
        }, 1000)
      } else {
        wx.showModal({
          title: '商品提示',
          content: resp.err_msg,
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    });
  },
  showCoupon() {
    var showList = this.data.showList;
    showList = !showList;
    this.setData({
      showList
    })
  },
  // 领取优惠券
  getCoupon(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id,
      "id": e.currentTarget.dataset.couponId
    };
    app.api.postApi('wxapp.php?c=coupon&a=get_coupon', { params }, (err, resp) => {
      if (err || resp.err_code != 0) {
        var error = err || resp.err_msg;
        that._showError(error);
        return;
      }
      if (resp.err_code == 0) {
        var coupon_list = that.data.coupon_list;
        coupon_list[index].is_get = 0;
        that.setData({
          coupon_list
        })
        that._showError(resp.err_msg);
      }
    });
  },
  onLoad: function (options) {
    wx.hideShareMenu();
    var that = this;
    var store_id = app.store_id;
    var uid = wx.getStorageSync('userUid');
    physical_id = wx.getStorageSync('phy_id')||0;

    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: '../../tabBar/home/index-new',
      })
    }
    that.setData({
      uid, store_id
    })
    // 页面初始化 options为页面跳转所带来的参数
    let { prodId, action, params, categoryid = '' } = options;

    //this.setData({ 'newCartNum': 0 });
    if (action) { this.setData({ action }) }
    this.setData({ 'product_id': prodId, prodId });

    //购物车的数量
    app.api.postApi('wxapp.php?c=cart&a=cart_list', { "params": { "uid": this.data.uid, "store_id": this.data.store_id } }, (err, resp) => {
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        that.setData({
          newCartNum: resp.err_msg.cart_list_number
        });
      }
    });

    //线上优惠券信息
    app.api.postApi('wxapp.php?c=coupon&a=store_coupon', { "params": { "uid": this.data.uid, "store_id": this.data.store_id, "product_id": this.data.product_id } }, (err, resp) => {
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        var coupon_value = [];
        var len = resp.err_msg.coupon_count > 2 ? 2 : resp.err_msg.coupon_count;
        for (var i = 0; i < len; i++) {
          coupon_value.push(resp.err_msg.coupon_value[i]);
        }
        that.setData({
          shopCoupon: resp.err_msg,
          coupon_list: resp.err_msg.coupon_list,
          coupon_value: coupon_value
        });
      }
    });

  },
  onReady: function () {
    // 页面渲染完成
  },
  //多规格 onShow
  onShow: function () {
    this.loadData();
  },
  onHide: function () {
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload: function () {
    // 页面关闭
    this.stopCountDown();
  },

  loadData() {
    let that = this;
    let { prodId, action } = that.data;
    this.timer && clearInterval(this.timer);
    wx.showLoading({ title: '加载中' });
    //这里是严选
    let url = 'wxapp.php?c=product&a=detail_of_product_v4';
    var params = {
      "product_id": prodId, uid: that.data.uid, store_id
    }
    app.api.postApi(url, { params }, (err, resp) => {

      wx.hideLoading();
      if (err) return;
      if (resp.err_code != 0) {
        wx.showLoading({
          title: resp.err_msg,
        })
      } else {
        var product = resp.err_msg.product;
        if (action == 'present') {
          console.log('新品试用');
          action = action
        } else {
          if (product.card_set_ids > 0) {
            console.log('卡包商品');
            action = product.card_set_ids

          } else {
            action = null
            console.log('普通商品');
          }
        }
        that.setData({
          product, action
        });
        if (product.sold_time <= 0) {
          that.setData({ preTime: product.sold_time })
        } else {

          that.startCountDown(product.sold_time);
        }
      }

    });
  },
  doBuy: function (e) {
    //保存formid
    app.pushId(e).then(ids => {
      app.saveId(ids)
    });
    var that = this;
    that.setData({
      moreChoose: true,
      goPayment: true,
      goAddCard: false
    });
    var that = this;
    var multiattribute = that.data.multiattribute;
    var quantitys = that.data.quantitys;
    var oneMatching = that.data.oneMatching;
    var skuid_list = that.data.skuid_list;
    var price = that.data.price;
    if (oneMatching.length > 0) {
      oneMatching.splice(0, oneMatching.length);//清空数组
    }
    var product_id = e.detail.target.dataset.productId;
    // that.setData({
    //   moreChoose: true,
    //   oneMatching: oneMatching,
    //   oriPid: "",
    //   curTabs: '',
    //   arrone: '',
    //   arrotwo: "",
    //   product_id: product_id,
    //   goAddCard: true,
    //   goPayment: false
    // });
    var uid = that.data.uid;
    var store_id = that.data.store_id;
    var params = {
      product_id,
      uid,
      store_id
    }
    that.loadCartInfo(params);
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

  },
  gotoCart: function () {
    let url = "../../tabBar/goods/cart";
    wx.reLaunch({ url });
  },

  /* 点击减号 w*/
  bindMinus: function (e) {
    console.log('点击减号', e)
    var that = this;
    var actions = e.currentTarget.dataset.actions;
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
  bindPlus: function (e) {
    var that = this;
    var actions = e.currentTarget.dataset.actions;
    var shopNum = that.data.shopNum;
    if (actions && (actions != 0)) {
      // 虚拟商品限购
      wx.showModal({
        title: '提示',
        content: '此商品限购，每人限购1件',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      shopNum++;
      that.setData({
        shopNum
      })
    }
  },
  /* 输入框事件w */
  bindManual: function (e) {
    var that = this;

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
  /**严选，立即购买，一般购买 */
  goPayment(e) {
    var that = this;
    console.log('e判断是否从严选、闪购过来', e);
    var baokuan_action = e.target.dataset.baokuan_action;
    var { buyQuantity, productId, uid, storeId, skuId } = e.currentTarget.dataset;
    var skuid_list = that.data.skuid_list;
    var { action } = that.data;
    var opts = {
      uid,
      product_id: productId,
      store_id: storeId,
      quantity: buyQuantity,
      baokuan_action: baokuan_action
    };

    if (skuid_list.length > 0) {
      if (!skuId) {//有无多属性skuid 
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        //添加skui_id多属性id
        opts.sku_id = skuId;
        // 选择属性之后发送请求添加到订单上
        that.getOrderId(opts);
      }
    } else {
      // 直接下订单
      that.getOrderId(opts);

    }



  },
  /*
  *新品试用，立即购买
  */
  goPreApply(e) {
    var that = this;
    var { buyQuantity, productId, uid, storeId, skuId } = e.currentTarget.dataset;
    var skuid_list = that.data.skuid_list;
    var { action } = that.data;
    var opts = {
      uid,
      product_id: productId,
      store_id: storeId,
      quantity: buyQuantity,
    };
    if (skuid_list.length > 0) {
      if (!skuId) {//有无多属性skuid 
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        //添加skui_id多属性id
        opts.sku_id = skuId;
        let url = '../../home/pages/present-apply?prodId=' + productId + '&skuid=' + skuId + '&groupbuyId=' + groupbuyId; //2017年8月17日17:18:09 by leo
        wx.navigateTo({ url });
      }

    } else {
      //添加skui_id多属性id
      opts.sku_id = skuId;
      let url = '../../home/pages/present-apply?prodId=' + productId + '&skuid=' + skuId + '&groupbuyId=' + groupbuyId; //2017年8月17日17:18:09 by leo
      wx.navigateTo({ url });
    }


  },
  /*
  *生成订单
  *
  */
  getOrderId(opts) {
    console.log('opts', opts)
    var { quantity, product_id, uid, store_id, sku_id, baokuan_action } = opts;
    var params = {
      uid,
      product_id,
      store_id,
      quantity,
      sku_id,
      physical_id
    };
    console.log('购买参数', params);
    app.api.postApi(addOrderUrl, { params }, (err, rep) => {
      if (err) { console.log('err ', err); return }
      var { err_code, err_msg } = rep;
      //if (err_code != 0) { console.log(err_msg); return }
      if (err_code != 0) {
        wx.showModal({
          //title: '错误提示',
          content: err_msg,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#FF0000',
          confirmText: '好的',
        });

        console.log(err_msg);
        return
      }
      var url = './buy?orderId=' + err_msg.order_no + '&uid=' + uid + '&baokuan_action=' + baokuan_action;
      wx.navigateTo({ url });
    })
  },
  /*
  *加载多少属性列表
  */
  loadCartInfo(params) {
    var that = this;
    var multiattribute = that.data.multiattribute;
    var quantitys = that.data.quantitys;
    var oneMatching = that.data.oneMatching;
    var skuid_list = that.data.skuid_list;
    var price = that.data.price;
    wx.showLoading({
      title: '加载中'
    })
    //多属性列表接口
    app.api.postApi('wxapp.php?c=cart&a=info', { params }, (err, resp) => {
      wx.hideLoading();
      //product商品数据集合,property_list多属性数据集合,sku_list多属性价格库存数据集合
      let { product, property_list = null, sku_list = null } = resp.err_msg;
      if (sku_list && sku_list.length > 0) {
        for (var i = 0; i < sku_list.length; i++) {

          multiattribute.push(sku_list[i].properties.split(';'));//多属性选择数组
          quantitys.push(sku_list[i].quantity);//所有可能库存情况
          skuid_list.push(sku_list[i].sku_id);//所有sku_id情况

          price.push(sku_list[i].price);//s所有价格情况
        }
      }
      // if (property_list) { that.setData({ property_list})}
      // if (sku_list) { that.setData({ sku_list})}

      that.setData({
        activity_err_msg: product,
        property_list,
        sku_list,
        multiattribute,
        quantitys,

      });
    });
  },

  //数量增减end
  //加入购物车start w
  addShopCart: function (e) {
    var that = this;
    var multiattribute = that.data.multiattribute;
    var quantitys = that.data.quantitys;
    var oneMatching = that.data.oneMatching;
    var skuid_list = that.data.skuid_list;
    var price = that.data.price;
    if (oneMatching.length > 0) {
      oneMatching.splice(0, oneMatching.length);//清空数组
    }
    console.log(e)
    var product_id = e.currentTarget.dataset.productId;
    that.setData({
      moreChoose: true,
      oneMatching: oneMatching,
      oriPid: "",
      curTabs: '',
      arrone: '',
      arrotwo: "",
      product_id: product_id,
      goAddCard: true,
      goPayment: false
    });
    var uid = that.data.uid;
    var store_id = that.data.store_id;
    var params = {
      product_id,
      uid,
      store_id
    }
    that.loadCartInfo(params);
  },
  chooseProperty(e) {

    let that = this;
    let { pid, vid } = e.currentTarget.dataset;
    //multiattribute多属性所有可能选项列表,quantitys所有可能库存情况,price所有可能价格情况,oneMatching点击之后匹配情况入数组,skuid_list选择之后的skuid_list的sku_id,初始pid oriPid,
    let { curTab, multiattribute, quantitys, price, oneMatching, skuid_list, oriPid, property_list } = that.data;

    let arr_gropv = [];
    let gropv = pid + ':' + vid;
    arr_gropv.push(gropv);//点击选择属性的id选项组合

    let theLength = property_list.length;//多属性种类
    if (theLength == 1) {
      if ((oriPid != pid) && oneMatching.length == 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {

              oneMatching.push(multiattribute[k]);//首次点击之后把所有可能匹配的入数

            }
          }
          that.setData({
            sku_id: skuid_list[k]
          })
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })

      } else if ((oriPid == pid) && oneMatching.length != 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {

              oneMatching.push(multiattribute[k]);//重新加入匹配项

            }
          }
          that.setData({
            sku_id: skuid_list[k]
          })
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })

      }
    } else if (theLength == 2) {
      if ((oriPid != pid) && oneMatching.length == 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {

              oneMatching.push(multiattribute[k]);//首次点击之后把所有可能匹配的入数

            }
          }
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })

      } else if ((oriPid == pid) && oneMatching.length != 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {

              oneMatching.push(multiattribute[k]);//重新加入匹配项

            }
          }
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })

      } else if ((oriPid != pid) && oneMatching.length != 0) {//换行选中后
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {

            if (multiattribute[k][g] == arr_gropv) {

              for (var o = 0; o < oneMatching.length; o++) {
                if (oneMatching[o] == multiattribute[k]) {

                  if (quantitys[k] <= 0) {
                    wx.showLoading({
                      title: '卖完了'
                    });
                    setTimeout(function () {
                      wx.hideLoading();
                    }, 2000)
                  } else {

                    var oneprice = price[k].toFixed(2);
                    that.setData({
                      sku_id: skuid_list[k],
                      choPrice: oneprice,
                      choQuantity: quantitys[k]
                    });
                    var arrObj = [];
                    for (var d = 0; d < multiattribute[k].length; d++) {

                      arrObj.push(multiattribute[k][d].split(':'));

                      var array = multiattribute[k][d].split(':');

                    }

                    var objArr = [];
                    for (var u = 0; u < arrObj.length; u++) {

                      for (var q = 0; q < arrObj[u].length; q++) {
                        objArr.push(arrObj[u][q]);
                      }

                    }
                    var arrone = objArr[0] + objArr[1];
                    var arrotwo = objArr[2] + objArr[3];

                    that.setData({
                      arrone, arrotwo, curTabs: ''
                    })


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
    }

  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    //this.setData({ error: errorMsg });
    return false;
  },
  //加入购物车end

  /**
   * 倒计时处理
   */
  startCountDown(preTime) {

    let now = (new Date().getTime()) / 1000;
    let leftTime = preTime - now;
    if (leftTime <= 0) {
      this.setData({ preTime: leftTime }); return;
    }
    this.timer = setInterval(() => {
      now = (new Date().getTime()) / 1000;
      leftTime = preTime - now;
      let time = this.countDown(leftTime);
      this.setData({ preTimeText: time, preTime: leftTime });
    }, 1000);
  },
  /**
   * 停止倒计时
   */
  stopCountDown() {
    this.timer && clearInterval(this.timer);
  },
  /**
* 格式化倒计时显示
*/
  countDown(leftTime) {
    var day = 0, hour = 0, minute = 0, second = 0;
    if (leftTime > 0) {//转换时间  
      day = Math.floor(leftTime / (60 * 60 * 24));
      hour = Math.floor(leftTime / (60 * 60)) - (day * 24);
      minute = Math.floor(leftTime / 60) - (day * 24 * 60) - (hour * 60);
      second = Math.floor(leftTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      hour = day * 24 + hour;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
    } else {
      clearInterval(this.timer);
      this.loadData();
    }
    return { hour, minute, second };
  },

  showPreBuyTip() {
    var that = this;
    that.setData({
      isShowPre: true
    });
    setTimeout(function () {
      that.setData({
        isShowPre: false
      });
    }, 2000);
  }


})