// pages/shopping/buy.js 

const util = require('../../utils/util.js');

var app = getApp();
const log = 'buy.js --- ';

const AddressSettingURL = 'wxapp.php?c=address&a=MyAddress';   // 设置售货地址
const ListURL = 'store/ls';          // 门店列表
const DetailURL = 'store/detail';    // 门店详情

var checkTimer = null;
let _prodId;                          // 记录商品id
let skuid;                          // 记录商品多属性标识 id
let quantity;                          // 购买商品的数量
let cartId;
Page({
  data: {
    // cardList: [],
    //addrList: [],
    // fee: null,
    error: false,
    submitOk: true,//是否可以发起支付
    products: [],
    totals: [],
    isLoading: true,

    shippingMethod: 'flat.flat',  // 邮寄方式，默认平邮   flat.flat-平邮  pickup.pickup 到店自提
    shippingMethods: [],    // 有效的配送方式
    hasFlatShip: false,
    hasPickupShip: false,

    address: null,    // 存放当前收货地址数据
    addressId: 0,     // 选择的收货地址id
    pickupStoreId: 0, // 自提门店id

    showAreaPicer: false,
    areaText: '',   // 区域
    zoneList: [],
    cityList: [],
    districtList: [],
    selectedZoneIndex: 0,
    zoneId: 0,
    selectedCityIndex: 0,
    cityId: 0,
    selectedDistrictIndex: 0,
    districtId: 0,//区域id
    fullname: '',//收货人
    shippingTelephone: '',//电话
    location: '',//当地地址

    curActIndex: 0,        // swiper 下标指示
    shopListData: null,    // 商店列表数据
    ShopDetailData: null,  // 商店详情数据
    //2017年8月17日16:21:58
    productColor: '',   // 商品颜色
    productSize: '',   // 商品尺码
    matteShow: false,  //购买成功弹窗


    //2017年12月18日17:22:02
    order_no: '',
    postage_int: 0,
    sub_total: 0,


    //2017-12-19
    uid: '',//用户id
    addressId: '',//地址id
    addressList: [],//地址列表
    address: '',//默认地址
    lastPay: '￥0',//实付款


    store_id: '',//商店id
    shipping_method: 'express',
    //addressId: 0,
    postage_list: "",
    user_coupon_id: 0,
    is_app: false,
    payType: 'weixin',
    //2017年12月26日13:44:11
    couponInfo: [], //选择的优惠券信息
    normal_coupon_count: '', //可用的优惠券数量
    totalId:[]//商品id数组
  },
  /*
 *地址详情列表
 */
  getAddress(uid) {
    var url = 'wxapp.php?c=address&a=MyAddress';
    var that = this;
    var store_id = that.data.store_id
    var address = that.data.address;
    var params = {
      store_id,uid
    }
    app.api.postApi(url, { params }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var addressList = rep.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length > 1) {
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                address = addressList[i];
              }
            }
          } else if (addressList.length == 1) {
            address = addressList[0];
          }
          this.setData({
            "address": address,
            "addressList": addressList,
            "addressId": addressList[0].address_id
          });
        }else {
        wx.showModal({
          title: '请先设置收货地址',
          content: '你还没有设置收货地址，请点击这里设置！',
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: './address-list',
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }

    }
    });

  },

  

  onLoad: function (options) {
    
    wx.removeStorageSync('couponInfo');
      var order_no = options.order_no;
      this.setData({ order_no: order_no  });
      var uid = wx.getStorageSync('userUid');
      var store_id= app.store_id;
      this.setData({ uid,store_id });
      this.getAddress(uid);
  
    var couponInfo = wx.getStorageSync('couponInfo') ? wx.getStorageSync('couponInfo') : [];
    if (couponInfo.length > 0) {
      var user_coupon_id = [];  //23  ['23']
      user_coupon_id.push(couponInfo[0]);
      this.setData({
        user_coupon_id: user_coupon_id
      })
    }


  this.setData({
    couponInfo: couponInfo
  })

},

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var uid = this.data.uid;
    var order_no = this.data.order_no;
    this.getAddress(uid);
    this._prepare(order_no);
    var couponInfo = wx.getStorageSync('couponInfo') ? wx.getStorageSync('couponInfo') : [];
    if (couponInfo.length > 0) {
      var user_coupon_id = [];  //23  ['23']
      user_coupon_id.push(couponInfo[0]);
      this.setData({
        user_coupon_id: user_coupon_id
      })
    }
  this.setData({
    couponInfo: couponInfo
  })
 

},
onHide: function () {
  // 页面隐藏
},
onUnload: function () {
  // 页面关闭
},

_prepare(order_no) {
  var that = this;
  var params = {
    order_no: order_no

  }
    app.api.postApi('wxapp.php?c=order&a=mydetail', { params }, (err, resp) => {
      if (err||resp.err_code!=0) {
        that._showError(err||resp.err_msg);
        return;
      }
      let { orderdata: { product=[], sub_total=0, postage_int=0, lastPay=0 } } = resp.err_msg;
        var totalId = [];
        for (var i = 0; i < product.length;i++){
          totalId.push(product[i].product_id);//总商品id
        }
        lastPay = sub_total - postage_int;
        that.setData({ products: product, postage_int, sub_total, lastPay, totalId});
        that.loadCouponData();
    });
  },

addAddr: function (event) {
  wx.navigateTo({
    url: './address?goodsId='
  });
},

/**
* 设置收货地址
* 设置完成后需重新刷新订单
*/
changeAddress(uid) {
  var url = 'wxapp.php?c=address&a=MyAddress';
  var that = this;
  var address = that.data.address;

  app.api.postApi(url, { "params": { uid } }, (err, rep) => {
    if (!err && rep.err_code == 0) {
      var addressList = rep.err_msg.addresslist;
      if (addressList.length) {
        if (addressList.length = 1) {
          address = addressList[0];
        } else if (addressList.length > 0) {
          //设置默认地址
          for (var i in addressList) {
            if (addressList[i].default == 1) {
              address = addressList[i];
            }
          }

        }
        this.setData({
          "address": address,
          "addressList": addressList,
          "addressId": addressList[0].address_id
        });
      } else {
        wx.showModal({
          title: '请先设置收货地址',
          content: '你还没有设置收货地址，请点击这里设置！',
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: './address-list',
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }

    }
  });
},
/**
 * 准备订单信息
 */
_prepareOrder(prodId, skuid, quantity, cartId) {
  wx.showLoading({ title: '加载中...', mask: true, });
  //post['test'] = 'abc123';
  //app.api.postApi("buy/prepare", {prodId}, (err, resp) => {
  let url = 'buy/prepare_cart';
  //let url = 'buy/prepare/skuid=' + skuid; //新接口
  //app.api.postApi("buy/prepare_new", { prodId }, (err, resp) => {  
  app.api.postApi(url, { prodId, skuid, quantity, cartId }, (err, resp) => {
    wx.hideLoading();
    if (err) {
      return this._showError('加载数据出错，请重试');
    }

    this._handlePrepareData(resp);
  });
},

/**
 * 加载数据
 */
_handlePrepareData(resp) {
  let { rtnCode, rtnMessage, data } = resp;
  if (rtnCode != 0) {
    return this._showError(rtnMessage);
  }

  let { products, addrList, totals, preOrderId, shippingMethods, shippingMethod } = data;
  let { zoneList } = this.data;

  let addressId = false;
  let address = null;
  if (addrList && addrList.length) {
    for (let i = 0; i < addrList.length; i++) {
      if (addrList[i].isSelected) {
        addressId = addrList[i].addressId;
        address = addrList[i];
        break;
      }
    }
  } else if (!zoneList | !zoneList.length) {
    // this.loadZone();
  }

  let hasFlatShip = false, hasPickupShip = false;
  for (let i = 0; shippingMethods && shippingMethods.length && i < shippingMethods.length; i++) {
    if (shippingMethods[i].code == 'flat.flat') hasFlatShip = true;
    if (shippingMethods[i].code == 'pickup.pickup') hasPickupShip = true;
  }

  let curActIndex = this.data.curActIndex;
  if (this.data.isLoading) {  // 第一次加载
    if (shippingMethod == 'flat.flat') {
      curActIndex = 0;
    } else if (shippingMethod == 'pickup.pickup') {
      curActIndex = 1;
    }
  }

  this.setData({ products, totals, addrList, address, addressId, isLoading: false, shippingMethods, shippingMethod, hasFlatShip, hasPickupShip, curActIndex });
},

/**
 * 刷新数据
 */
_handleData(resp) {
  let { rtnCode, rtnMessage, data } = resp;
  if (rtnCode != 0) {
    return this._showError(rtnMessage);
  }

  let { products, totals } = data;

  if (!products) products = this.data.products;

  this.setData({ products, totals, isLoading: false });
},

/**
 * 提交订单
 */
submitOrder: function (event) {
  var that = this;
  // 显示公众号复制提示
  that.setData({
    submitOk: false
  })
  let address_params = this.buildAddressParams();
  let address_id = address_params.addressId;
  let { payType, is_app, postage_list = "a:1:{i:6;d:0;}", uid, store_id, user_coupon_id, shipping_method, order_no}=that.data;
  var params = {
    payType: payType,
    orderNo: order_no,
    is_app: is_app,
    postage_list: postage_list,
    shipping_method: shipping_method,
    address_id: address_id,
    uid: uid,
    store_id: store_id,
    user_coupon_id: 0,
  }
  wx.showLoading({ title: '请稍候...', mask: true, });
   app.api.postApi('wap/wxapp_saveorder.php?action=pay_xcx', { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        
        wx.showModal({
          title: '支付失败',
          content: err || resp.err_msg,
          confirmText: '好的',
          success:function(){
            that.setData({
              submitOk: true
            })
          }
        });
      } else {
        // 调起微信支付
        if (resp.err_dom) {
          // wx.redirectTo({
          //   url: './my-order?goodsindex=' + 2
          // })
          var failUrl = '../index-new/index-new';
          wx.switchTab({
            url: failUrl
          })
        } else {
          // 调起微信支付
          this._startPay(resp.err_msg);
        }
      }
    });
},

/**
 * 调起微信支付
 */
_startPay(payParams) {
  var obj = Object.assign({
    success: res => this._onPaySuccess(res),
    fail: err => this._onPayFail(err)
  }, payParams);
  wx.requestPayment(obj);
},

/**
 * 订单提交成功，不需要支付
 */
_onSubmitNoPay() {
  
  wx.showToast({ title: "提交成功", icon: "success", duration: 1000 });
  setTimeout(function () {
    // wx.redirectTo({
    //   url: '../shopping/my-order?page=2'
    // });
    var failUrl = '../index-new/index-new';
    wx.switchTab({
      url: failUrl
    })
  }, 1000);
},
//关闭弹窗
closeBtn() {
  var that = this;
  that.setData({
    matteShow: false
  });
  //500毫秒后跳转
  setTimeout(function () {
    // wx.redirectTo({
    //   url: '../shopping/my-order'
    // });
    var failUrl = '../index-new/index-new';
    wx.switchTab({
      url: failUrl
    })
  }, 1000);
},

/**
 * 支付成功
 */
_onPaySuccess(res) {
  wx.removeStorageSync('couponInfo');
  var that = this;
  // 支付成功弹窗
  that.setData({
    matteShow: true,submitOk:true
  });
},
/**
 * 支付失败
 */
_onPayFail(err) {
  var that =this;
  wx.showModal({
    title: '支付失败',
    content: '订单支付失败，请到[订单-待付款]列表里重新支付',
    cancelColor: '#FF0000',
    confirmText: '好的',
    success: function (res) {
      that.setData({
       submitOk: true
      });
      // wx.redirectTo({
      //   url: '../shopping/my-order?page=1'
      // });
      var failUrl = '../index-new/index-new';
      wx.switchTab({
        url: failUrl
      })
    },
  });
},

addrViewClick() {
  wx.navigateTo({
    url: './address-list?addressId=' + this.data.addressId
  });
},

/**  新增地址相关 */
/**
 * 校验地址输入
 */
checkAddress() {
  let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, shippingMethod, pickupStoreId } = this.data;

  if (shippingMethod == 'flat.flat') {
    if (addressId) return true;   // 有选了地址

    // 新增地址，校验输入
    if (!fullname) {
      return this._showError('请填写收货人姓名');
    }
    if (!shippingTelephone) {
      return this._showError('请填写手机号码');
    }
    if (!util.checkMobile(shippingTelephone)) {
      return this._showError('不是有效的手机号码');
    }
    if (!location) {
      return this._showError('请填写详细地址');
    }
    if (!zoneId) {
      return this._showError('请选择省份');
    }
    if (!cityId) {
      return this._showError('请选择城市');
    }
    if (!districtId) {
      return this._showError('请选择县区');
    }
    return true;
  } else if (shippingMethod == 'pickup.pickup') {
    if (!pickupStoreId) {
      return this._showError('请选择自提门店');
    }
    return true;
  }
},

/**
 * 组装地址参数
 */
buildAddressParams() {  
  let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, shippingMethod, pickupStoreId } = this.data;
  let params;
  if (shippingMethod == 'flat.flat') {
    if (addressId) {
      params = {
        'addressId': addressId,
        'shippingMethod': shippingMethod,
      }
    } else {
      params = {
        'address[zone_id]': zoneId,
        'address[city_id]': cityId,
        'address[district_id]': districtId,
        'address[fullname]': fullname,
        'address[shipping_telephone]': shippingTelephone,
        'address[address]': location,
        'shippingMethod': shippingMethod,
      }
    }
  } else if (shippingMethod == 'pickup.pickup') {
    params = {
      'pickupStoreId': pickupStoreId,
      'shippingMethod': shippingMethod,
    };
  }
  return params;
},

/**
 * 选择自提门店事件
 */
onStoreSelected(e) {
  let storeId = e.detail.value;
  this.setData({ pickupStoreId: storeId });
  let params = { storeId };
  wx.showLoading({ title: '加载中...', mask: true, });
  app.api.postApi('buy/pickup_store', params, (err, resp) => {
    wx.hideLoading();
    if (err) {
      return this._showError('加载数据出错，请重试');
    }
    let { rtnCode, rtnMessage, data } = resp;
    if (rtnCode != 0) {
      return this._showError(rtnMessage);;
    }
    this._handleData(resp);
  });
},

/**
 * 显示地区选择器
 */
showAreaPickerView() {
  this.setData({ showAreaPicer: true });
},
/**
 * 隐藏地区选择器
 */
hideAreaPickerView() {
  let { zoneList, cityList, districtList, selectedZoneIndex, selectedCityIndex, selectedDistrictIndex } = this.data;
  let areaText = zoneList[selectedZoneIndex].name + cityList[selectedCityIndex].name + districtList[selectedDistrictIndex].name;
  this.setData({ showAreaPicer: false, areaText });
  let params = {
    "address[zone_id]": zoneList[selectedZoneIndex].zoneId,
    "address[city_id]": cityList[selectedCityIndex].cityId,
    "address[district_id]": districtList[selectedDistrictIndex].districtId,
  }
  console.log('隐藏地区选择器');
  app.api.postApi('buy/address', params, (err, resp) => {
    if (err) {
      // return this._showError('加载数据出错，请重试');
    }
    let { rtnCode, rtnMessage, data } = resp;
    if (rtnCode != 0) {
      return this._showError(rtnMessage);;
    }
    this._handleData(resp);
  });
},
loadZone() {
  this.setData({ zoneList: [], cityList: [], districtList: [] });
  app.api.fetchApi('address/zone', (err, response) => {
    let { data } = response;
    if (data) {
      this.setData({ zoneList: data, selectedZoneIndex: 0, zoneId: data[0].zoneId });
      this.loadCity(data[0].zoneId);
    }
  });
},

loadCity(zoneId) {
  this.setData({ cityList: [], districtList: [] });
  app.api.fetchApi('address/city/' + zoneId, (err, response) => {
    let { data } = response;
    if (data) {
      this.setData({ cityList: data, selectedCityIndex: 0, cityId: data[0].cityId });
      this.loadDistrict(data[0].cityId);
    }
  });
},

loadDistrict(cityId) {
  this.setData({ districtList: [] });
  app.api.fetchApi('address/district/' + cityId, (err, response) => {
    let { data } = response;
    if (data) {
      this.setData({ districtList: data, selectedDistrictIndex: 0, districtId: data[0].districtId });
    }
  });
},

bindAddrPickerChange(e) {
  const val = e.detail.value;
  let { zoneList, cityList, districtList, selectedZoneIndex, selectedCityIndex, selectedDistrictIndex } = this.data;
  if (val[0] != selectedZoneIndex) {
    if (!zoneList.length) return;
    let { zoneId } = zoneList[val[0]];
    this.setData({
      selectedZoneIndex: val[0],
      zoneId: zoneId,
    });
    this.loadCity(zoneId);
  } else if (val[1] != selectedCityIndex) {
    if (!cityList.length) return;
    let { cityId } = cityList[val[1]];
    this.setData({
      selectedCityIndex: val[1],
      cityId: cityId,
    });
    this.loadDistrict(cityId);
  } else if (val[2] != selectedDistrictIndex) {
    if (!districtList.length) return;
    let { districtId } = districtList[val[2]];
    this.setData({
      selectedDistrictIndex: val[2],
      districtId: districtId,
    });
  }
},

bindFullnameChange(e) {
  this.setData({ fullname: e.detail.value.trim() });
},
bindLocationChange(e) {
  this.setData({ location: e.detail.value.trim() });
},
bindShippingTelephoneChange(e) {
  this.setData({ shippingTelephone: e.detail.value.trim() });
},

/**
 * 设置邮寄方式
 */
setShippingMethod(method) {
  this.setData({ shippingMethod: method });
  let params = { shipping_method: method };
  wx.showLoading({ title: '加载中...', mask: true, });
  app.api.postApi('buy/shipping_method', params, (err, resp) => {
    wx.hideLoading();
    if (err) {
      return this._showError('加载数据出错，请重试');
    }
    let { rtnCode, rtnMessage, data } = resp;
    if (rtnCode != 0) {
      return this._showError(rtnMessage);;
    }
    this._handleData(resp);
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

/**
 * 获取门店列表数据
 */
_loadShopData() {
  app.api.fetchApi(ListURL, (err, res) => {   // 获取门店列表数据
    if (!err && res.rtnCode == 0) {
      let { data: shopListData } = res;
      this._loadShopDetailData(shopListData[0]);   // 默认加载第一个门店的详情数据
      this.setData({ shopListData });
    } else {
    }
  });
},

/**
 * 获取门店详情数据
 * options: object: 门店列表数据中的一项
 * loading: boolean: 是否等待加载完成后滑动到详情页
 */
_loadShopDetailData(options, loading = false) {
  if (loading) wx.showLoading({ title: '请稍等...' });
  //const DetailURL = 'store/detail';    // 门店详情
  app.api.fetchApi(DetailURL + '/' + options.storeId, (err, res) => {    // 获取门店详情数据
    if (!err && res.rtnCode == 0) {
      let { data: ShopDetailData } = res;
      if (loading) {
        wx.hideLoading();
        this.setData({
          ShopDetailData,
          curActIndex: 2
        });
      } else {
        this.setData({ ShopDetailData });
      }
    } else {
      if (loading) wx.hideLoading();
    }
  });
},

/**
 * 用户点击门店列表中的一项，加载门店详情数据
 */
loadShopDetailData(e) {
  let { index } = e.currentTarget.dataset;
  let options = this.data.shopListData[index];
  this._loadShopDetailData(options, true);
},

/**
 * 点击查看街景
 */
seeStreet() {
},


/**
 * 点击查看图集
 */
previewAlbum(e) {
  let { albums } = e.currentTarget.dataset;

  wx.previewImage({
    current: albums, // 当前显示图片的http链接
    urls: [albums] // 需要预览的图片http链接列表
  });
},

/**
 * swiper 滑动
 */
swiperChange(event) {
  this.setData({
    curActIndex: event.detail.current
  });
},

/**
* 选项改变
*/
changeCurActIndex(e) {
  let { idx: curActIndex, method } = e.currentTarget.dataset;
  this.setData({ curActIndex });
  this.setShippingMethod(method);
},
changeCoupon: function () {
  var pro_price = this.data.sub_total;
  var product_id = this.data.totalId;
  wx.navigateTo({
    url: '../shopping/buycard?product_id=' + product_id + '&pro_price=' + pro_price
  });
},
//优惠券的数量
loadCouponData: function () {
  var that = this;
  var params = {
    "uid": that.data.uid,
    "store_id": that.data.store_id,
    "product_id": that.data.totalId,
    "total_price": that.data.sub_total
  };

  var url = 'wxapp.php?c=coupon&a=store_coupon_use';
  app.api.postApi(url, { params }, (err, resp) => {
    if (resp) {

      if (resp.err_code == 0) {

        if (resp.err_msg.coupon_list) {
          console.log('resp.err_msg.coupon_list存在');

          //var normal = resp.err_msg.coupon_list['normal_coupon_list'];
          //var expired = resp.err_msg.coupon_list['unnormal_coupon_list'];


          //更新数据
          that.setData({
            normal_coupon_count: resp.err_msg.normal_coupon_count,

          });

        }
      } else {
        return;
      }

    }
    console.log('normal_coupon_count', this.data.normal_coupon_count);

  });
},

})