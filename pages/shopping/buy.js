// pages/shopping/buy.js 

const app = getApp();

import { util, formatTime}  from '../../utils/util';
import { Api } from '../../utils/api_2';
const log = 'buy.js --- ';

const AddressSettingURL = 'buy/address';   // 设置售货地址
const ListURL = 'wxapp.php?c=order_v2&a=add';          // 门店列表
const DetailURL = 'store/detail';    // 门店详情
const addressList = ''; //地址详情
const orderList = '';//订单详情

var checkTimer = null;
let _prodId;                          // 记录商品 id
let skuid;                          // 记录商品多属性标识 id
let quantity;                          // 购买商品的数量
let groupbuyId = 0;                   //团购ID 兼容团购和爆款
Page({
  data: {
    store_id: '',//商店id
    uid: '',//用户id
    error: false,
    products: [],
    totals: [],//商品总价
    isLoading: true,
    showwechat: false,
    shippingMethod: 'flat.flat',  // 邮寄方式，默认平邮   flat.flat-平邮  pickup.pickup 到店自提
    shippingMethods: [],    // 有效的配送方式
    hasFlatShip: false,
    hasPickupShip: false,
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
    districtId: 0,
    fullname: '',
    shippingTelephone: '',
    location: '',

    curActIndex: 0,        // swiper 下标指示
    shopListData: null,    // 商店列表数据
    ShopDetailData: null,  // 商店详情数据
    //2017年8月17日16:21:58
    productColor: '',   // 商品颜色
    productSize: '',   // 商品尺码
    matteShow:false,  //购买成功弹窗

    // 2017-12-16amy 增加订单id
   orderData:'',//订单数据
   orderId :'',//订单号
   
   address: null,    // 存放当前收货地址数据
   addressList:[],  //地址列表
   addressId: 0,     // 选择的收货地址id
   pickupStoreId: 0, // 自提门店id
   productList:null,//产品列表
   fee:0,//运费
   lastPay:0,//实付
   shipping_method: 'express',
   postage_list: "",
   user_coupon_id: 0,
   is_app: false,
   payType: 'weixin',
    //2017年12月25日11:54:53
    couponInfo: [], //选择的优惠券信息
    //2017年12月25日12:18:49
    normal_coupon_count:'', //可用的优惠券数量
    discounts:0,
    product_id:'',
    pro_price:'',
    baokuan_action:'',//判断是否为闪购严选
  },
  /*
  *订单详情列表
  */
  showOrderList (opt) {
    let that = this;
    let orderId = opt.orderId ;

    app.api.postApi('wxapp.php?c=order&a=mydetail',{"params": {
      "order_no":opt.orderId 
    }}, (err,rep) => {
      if(err){ console.log('err ',err); return;}
      var { err_code, err_msg: { orderdata}} = rep;
      if(err_code != 0){ return;}
      console.log('订单详情列表', orderdata);
      var product_id = orderdata.product[0].product_id;
      console.log('产品id', product_id);
      var pro_price = orderdata.product[0].pro_price;
      console.log('产品价格', pro_price);
      that.setData({ "shopListData": orderdata, "productList": orderdata.product, totals: orderdata.sub_total, fee: orderdata.postage_int, lastPay: (orderdata.sub_total - orderdata.postage_int), orderId, postage_list: orderdata.postage, product_id: product_id, pro_price: pro_price});
      that.loadCouponData(pro_price, product_id);
    })
    
    //2017年12月25日12:27:38 获取优惠券的数量
    
  },
  /*
  *地址详情列表
  */
  getAddress(uid){
    var url = 'wxapp.php?c=address&a=MyAddress';
    var that = this;
    var { address, store_id}= that.data;
    var params = {
      uid, store_id
    }
    app.api.postApi(url,{params} , (err, rep) => {
      if(!err && rep.err_code == 0){
        var addressList = rep.err_msg.addresslist;
        if (addressList.length){
          if (addressList.length>1){
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                console.log('默认地址 ', addressList[i]);
                address = addressList[i];
              }
            }
          } else if (addressList.length == 1){
            address = addressList[0];
          }
          this.setData({
            "address": address,
            "addressList": addressList,
            "addressId": addressList[0].address_id
          });
        }else{
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
    var store_id = app.store_id;
    this.setData({store_id});
    wx.removeStorageSync('couponInfo');
    wx.removeStorageSync('recid')
    wx.removeStorageSync('cname')
    wx.removeStorageSync('face_money')
    let { uid, pid, skuId, storeId, qrEntry, orderId,baokuan_action } = options;
    quantity = options.quantity;
    //2017年12月16日amy 判断是否是多属性sku_id,单属性sku_id为空或0
    this.setData({ orderId, uid});
    //显示订单列表
    this.showOrderList({ orderId });

    
    _prodId = pid;      
    var couponInfo = wx.getStorageSync('couponInfo') ? wx.getStorageSync('couponInfo'): [] ;
    //console.log('onLoad优惠券信息', couponInfo);
    if (couponInfo.length>0){
      var user_coupon_id = [] ;  //23  ['23']
      user_coupon_id.push(couponInfo[0]);
      //console.log(user_coupon_id,'user_coupon_idooooooooooooo')
      this.setData({
        user_coupon_id: user_coupon_id,
        discounts: couponInfo[2]
      })
    }
    this.setData({
      couponInfo: couponInfo,
      baokuan_action: baokuan_action
    })
    

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var uid = this.data.uid;
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
  onHide: function () {
    console.log('页面隐藏');
    // 页面隐藏
  },
  onUnload: function () {
    console.log('页面关闭');
    // 页面关闭
  },

  _prepare(prodId, skuid, quantity, groupbuyId) {
    checkTimer = setInterval(() => {
      if (getApp().hasSignin) {
        clearInterval(checkTimer);
        this._prepareOrder(prodId, skuid, quantity, groupbuyId);
      }
    }, 100);
  },

  addAddr: function (event) {
    wx.redirectTo({
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
    var {address,store_id} = that.data;
    var params = {
      uid, store_id
    }
    app.api.postApi(url, { params }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var addressList = rep.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length > 0) {
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                address = addressList[i];
              } 
            }
            this.setData({
              "address": address,
              "addressList": addressList,
              "addressId": addressList[0].address_id
            });
          }
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
  _prepareOrder(prodId, skuid, quantity, groupbuyId) {
    wx.showLoading({ title: '加载中...', mask: true, });
    let url = 'buy/prepare';
    app.api.postApi(url, { prodId, skuid, quantity, groupbuyId }, (err, resp) => {
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
      this.loadZone();
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
  // 关闭微信公众号复制选项
  closewechat (){
    var that =this;
    that.setData({
      showwechat:false
    })
  },
  /**
   * 提交订单
   */
  submitOrder: function (event) {
    let that = this;
    // 显示公众号复制提示
    that.setData({
      showwechat: true
    })
    if (!that.checkAddress()) return false;
    // 收货地址
    let address_params = that.buildAddressParams();
    let address_id = address_params.addressId;

    let { payType, is_app, postage_list, uid, store_id, user_coupon_id, shipping_method, orderId } = that.data;

    var params = {
      payType: payType,
      orderNo: orderId,
      is_app: is_app,
      postage_list: postage_list,
      shipping_method: shipping_method,
      address_id: address_id,
      uid: uid,
      store_id,
      user_coupon_id: user_coupon_id,
    }
    app.api.postApi('wap/wxapp_saveorder.php?action=pay_xcx', { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        wx.showModal({
          title: '支付失败',
          content: err || resp.err_msg,
          confirmText: '好的',
        });
      } else {
        // 调起微信支付
        if (resp.err_dom) {
          wx.navigateTo({
            url: './my-order?goodsindex=' + 2
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
      wx.redirectTo({
        url: '../shopping/my-order'
      });
    }, 1000);
  },
//关闭弹窗
  closeBtn (){
    var that =this;
    that.setData({
      matteShow: false
    });
    //500毫秒后跳转
    setTimeout(function () {
      wx.redirectTo({
        url: '../shopping/my-order?orderstatus=2'
      });
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
      matteShow:true
    });
    //2018年1月2日18:44:25
    this.giveCard(this.data.orderId);
  },

  /**
   * 支付失败
   */
  _onPayFail(err) {
    wx.showModal({
      title: '支付失败',
      content: '订单支付失败，请到[订单-待付款]列表里重新支付',
      cancelColor: '#FF0000',
      confirmText: '好的',
      success: function (res) {
        wx.navigateTo({
          url: '../shopping/my-order'
        });
        

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
    let { shippingMethod, addressId } = this.data;
    /*let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, shippingMethod, pickupStoreId } = this.data;*/
    if (shippingMethod == 'flat.flat') {
      if (addressId) return true;   // 有选了地址
      else {
        return this._showError('请先新增收货地址');
      }
      /* // 新增地址，校验输入，ps：这个需求已被更改，不需要了，故以下代码注销
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
      }*/
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
    console.log('paramsssss',params)
    app.api.postApi('buy/address', params, (err, resp) => {
      if (err) {
        return this._showError('加载数据出错，请重试');
      }
      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
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
    // app.api.fetchApi(ListURL, (err, res) => {   // 获取门店列表数据
    //   if (!err && res.rtnCode == 0) {
    //     let { data: shopListData } = res;
    //     this._loadShopDetailData(shopListData[0]);   // 默认加载第一个门店的详情数据
    //     this.setData({ shopListData });
    //   } else {
    //   }
    // });
    
    
  },

  /**
   * 获取门店详情数据
   * options: object: 门店列表数据中的一项
   * loading: boolean: 是否等待加载完成后滑动到详情页
   */
  _loadShopDetailData(options, loading = false) {
    if (loading) wx.showLoading({ title: '请稍等...' });

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
  //2017年12月22日15:58:39 选择优惠券
  changeCoupon: function (event) {
    console.log('点击进入优惠券选择界面',event);
    //navigateTo  redirectTo
    var pro_price = event.currentTarget.dataset.pro_price;
    var product_id = event.currentTarget.dataset.product_id;
    wx.navigateTo({
      url: './buycard?product_id=' + product_id + '&pro_price=' + pro_price
    });
  },
  //优惠券的数量
  loadCouponData: function (pro_price, product_id) {
    var that =this;
    var product_id = [];
    product_id.push(that.data.product_id);
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id ,
      "product_id": product_id ,
      "total_price": pro_price
    };

    console.log('线上优惠券列表(可用和不可用)请求参数params=', params);

    var url = 'wxapp.php?c=coupon&a=store_coupon_use';
    app.api.postApi(url, { params }, (err, resp) => {
      if (resp) {

        if (resp.err_code == 0) {
          
          if (resp.err_msg.coupon_list) {
            //更新数据
            that.setData({
              normal_coupon_count: resp.err_msg.normal_coupon_count,
            });
          }
        } else {
          return;
        }
      }
    });
  },
  /**
 * 购买给卡包
 */
  giveCard: function (order_no) {
    
    var params = {
      order_no: order_no
    };
    app.api.postApi('wxapp.php?c=order&a=save_card_set', { params }, (err, resp) => {
      // if (err) return;
      // if (resp.err_code != 0) {
      //   wx.showLoading({
      //     title: resp.err_msg,
      //   })
      // } else {
      //   wx.hideLoading();
      //   console.log(resp, 1111111)
      //   var data = resp.err_msg;
      //   console.log('获取第一行的图标', data);
      //   this.setData({ iconOne: data });
      // }
    });
  },

})