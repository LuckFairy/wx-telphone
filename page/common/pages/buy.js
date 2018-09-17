
import { util, getAddress, formatTime } from '../../../utils/util';
const app = getApp();
const myAddressUrl = 'wxapp.php?c=address&a=MyAddress';//默认的收货地址
const orderDetailUrl = 'wxapp.php?c=order&a=mydetail_v2';//订单详情
const couponDataUrl = 'wxapp.php?c=coupon&a=store_coupon_use';//优惠券信息
const _buyUrl = 'wap/wxapp_saveorder.php?action=pay_xcx';//立即購買接口
const DetailURL = 'store/detail';    // 门店详情
const methodUrl = 'buy/shipping/method';//邮寄方式
const phyURL = 'store/ls';          // 门店列表
const addressList = ''; //地址详情
const orderList = '';//订单详情
var checkTimer = null;
let _prodId;                          // 记录商品 id
let skuid;                          // 记录商品多属性标识 id
let quantity;                          // 购买商品的数量
let groupbuyId = 0;                   //团购ID 兼容团购和爆款
let physical_id = wx.getStorageSync('phy_id'); //门店id
let hasWxLocation = wx.getStorageSync('hasWxLocation');//是否是初次使用微信地址
// orderId = PIG20180913164958600963 & uid=93853 & baokuan_action=undefined
Page({
  data: {
    error: false,
    products: [],
    submitOk: true,//是否可以发起支付
    totals: [],//商品总价
    // isLoading: true,
    sendMethod: '1',  // 邮寄方式 1邮寄 2自提
    send_type: [],    // 有效的配送方式
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

    productColor: '',   // 商品颜色
    productSize: '',   // 商品尺码
    matteShow: false,  //购买成功弹窗

    orderData: '',//订单数据
    orderId: '',//订单号
    storeId: app.store_id,//商店id
    uid: '',//用户id
    address: null,    // 存放当前收货地址数据
    addressList: [],  //地址列表
    addressId: 0,     // 选择的收货地址id
    pickupPhy:{},//自提门店地址
    pickupStoreId: null, // 自提门店id
    productList: null,//产品列表
    fee: 0,//运费
    lastPay: 0,//实付
    orderType: 0,//其他值普通购买，6是拼团类型
    pinType: 0,//1是拼团单独购买不需要优惠券，2是参团购买
    baokuan_action: null,//判断是否为闪购严选，严选不需要优惠券
    status: 1,//订单状态，1未支付
    diff_people: null,//可是参团人数

    shipping_method: 'express',
    postage_list: "",
    is_app: false,
    payType: 'weixin',
    user_coupon_id: [],//优化券id
    couponInfo: [], //选择的优惠券信息
    normal_coupon_count: '', //可用的优惠券数量
    discounts: 0,
    product_id: '',
    pro_price: '',
    // 自提參數
    showself:true,
    showmail:true,

  },
  onLoad: function (options) {
    wx.removeStorageSync('couponInfo');
    wx.removeStorageSync('recid');
    wx.removeStorageSync('cname');
    wx.removeStorageSync('face_money');
    let { pid, skuId, storeId, qrEntry, orderId, baokuan_action, quantity, ordertype = 0, diff_people } = options;
    if (diff_people) { this.data.setData({ diff_people }) };
    let uid = wx.getStorageSync('userUid');
    physical_id = wx.getStorageSync('phy_id'); //门店id
    if (baokuan_action) { this.setData({ baokuan_action }) }
    if (!orderId) { orderId = this.data.orderId }
    this.setData({ orderId, uid, pinType: ordertype });
    this.getAddress(uid);
    this.showOrderList({ orderId });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    //显示订单列表
    var uid = this.data.uid;
    var orderId = this.data.orderId;
    var orderType = this.data.orderType;
    var pinType = this.data.pinType;
    var baokuan_action = this.data.baokuan_action;
    let couponInfo = wx.getStorageSync('couponInfo') || [];
    if (couponInfo.length >= 2 ) {
      if ( pinType == 0 || orderType != 6 || baokuan_action == 'undefined'){
        var user_coupon_id = [];
        user_coupon_id.push(couponInfo[0]);
        this.setData({
          user_coupon_id,
          discounts: couponInfo[2], couponInfo
        })

      }
    }

  },
  onHide: function () {

  },
  onUnload: function () {
    // 页面关闭
  },
  putchange(e) {
    let { method } = e.target.dataset, { shopListData}=this.data;
    if(!method){return;}
    //自提运费为0
    console.log(method);
    if (method == '2') { var fee = 0 } else { var fee = shopListData.product.postage_int};
    this.setData({ sendMethod:method,fee});
  },
  storeViewClick(){
    wx.navigateTo({
      url: `./store-change?prodId=${this.data.product_id}`,
    })
  },
  /*
  *订单详情列表
  */
  showOrderList(opt) {
    let that = this;
    let orderId = opt.orderId;
    let phy_id = wx.getStorageSync('phy_id');
    app.api.postApi(orderDetailUrl, {
      "params": {
        "order_no": opt.orderId,
        "default_physical": phy_id
      }
    }, (err, rep) => {
      if (err||rep.err_code!=0) { console.log('err ', err); return; }
      var {  err_msg: { orderdata, send_type = [], physical_info } } = rep;
      var user_coupon_id = orderdata.user_coupon_id;//优惠券id
      var product_id = orderdata.product[0].product_id;
      var pro_price = orderdata.product[0].pro_price;
      var sendMethod = '1',showmail=true,showself=true;
      if (send_type.length >= 2) { sendMethod = '1'; } 
      else if (send_type.length = 1) { 
        sendMethod = send_type[0]; 
        if (sendMethod == 1) { showself = false } 
        else { showmail=false;}
       } 
      console.log('physical_info', physical_info);
      if (physical_info) { 
        let default_physical = physical_info.default_physical;
         that.setData({ pickupPhy: default_physical, pickupStoreId: default_physical.phy_id})
      }
      that.setData({
      "shopListData": orderdata,
       "productList": orderdata.product, 
       totals: orderdata.sub_total, 
       fee: orderdata.postage_int, 
       lastPay: (orderdata.sub_total - orderdata.postage_int),
        orderId, postage_list: orderdata.postage, 
        product_id: product_id, 
        pro_price: pro_price, 
        orderType: orderdata.type,
         status: orderdata.status,
          sendMethod, 
          send_type,
          showmail, showself
          });
      //优惠券信息
      that.loadCouponData(product_id);
    })

  },
  /**
   * 可用优惠券信息
   */
  useCoupon(id){
   var len = id.length;
   if (len == 0) {//无可用券

   } else if (len == 1) {//可用一张券

   } else {//可用多张券

   }
  },
  //优惠券的数量
  loadCouponData: function (pro_price, product_id) {
    var that = this;
    var product_id = [];
    product_id.push(that.data.product_id);
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.storeId,
      "product_id": product_id,
      "total_price": that.data.totals
    };
    app.api.postApi(couponDataUrl, { params }, (err, resp) => {
      if (err || resp.err_code != 0) { that._showError(err || resp.err_msg); return; }
      if (resp.err_msg.coupon_list) {
        //更新数据
        that.setData({
          normal_coupon_count: resp.err_msg.normal_coupon_count,
        });
      }
    });
  },
  /*
  *地址详情列表
  */
  getAddress(uid) {
    var that = this;
    var address = that.data.address;
    var params = {
      uid, store_id: that.data.storeId
    }
    app.api.postApi(myAddressUrl, { params }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var addressList = rep.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length > 1) {
            //设置默认地址
            for (var i in addressList) {
              if (addressList[i].default == 1) {
                console.log('默认地址 ', addressList[i]);
                address = addressList[i];
              }
            }
          } else if (addressList.length == 1) {
            address = addressList[0];
          }
          this.setData({
            "address": address,
            "addressList": addressList,
            "addressId": address.address_id
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
                return;
              }
            }
          })
        }

      }
    });

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
    wx.navigateTo({
      url: './address?goodsId='
    });
  },

  /**
   * 设置收货地址
   * 设置完成后需重新刷新订单
   */
  changeAddress(addressId) {
    var uid = this.data.uid;
    var that = this, store_id = this.data.storeId;
    var address = that.data.address;
    app.api.postApi(myAddressUrl, { "params": { uid, store_id } }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var addressList = rep.err_msg.addresslist;
        if (addressList.length) {
          if (addressList.length > 0) {
            addressList.forEach(item => {
              if (item.address_id == addressId) address = item;
            })
            this.setData({
              error:null,
              address,
              addressId
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

    let { products, addrList, totals, preOrderId, send_type, sendMethod } = data;
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
    for (let i = 0; send_type && send_type.length && i < send_type.length; i++) {
      if (send_type[i].code == 1) hasFlatShip = true;
      if (send_type[i].code == 2) hasPickupShip = true;
    }

    let curActIndex = this.data.curActIndex;
    if (this.data.isLoading) {  // 第一次加载
      if (sendMethod == '1') {
        curActIndex = 0;
      } else if (sendMethod == '2') {
        curActIndex = 1;
      }
    }
    this.setData({ products, totals, addrList, address, addressId, isLoading: false, send_type, sendMethod, hasFlatShip, hasPickupShip, curActIndex });
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
  submitOrder: function (e) {
    let that = this;
    //保存formid
    app.pushId(e).then(ids => { app.saveId(ids) });
    let { sendMethod } = that.data;//1邮寄 2自提
    // 是否可以立即购买
    that.setData({ submitOk: false});
    if (!that.checkAddress()) { that.setData({ submitOk: true }); return false; }
    if(sendMethod=='1'){
      console.log('邮寄', sendMethod)
      that.buyPay();
    } else if (sendMethod == '2'){
      console.log('自提', sendMethod);
      let { pickupStoreId, storeId, orderId,uid}=that.data;
      let pickUrl = 'wxapp.php?c=order_v2&a=update_order_send_type';
      app.api.postApi(pickUrl, { 
        "params": {
          "order_no": orderId,
          "send_type": 2,
          "physical_id": pickupStoreId,
          "uid": uid,
          "store_id": storeId
        }
      }, (err, resp) => {
        if (err || resp.err_code != 0) {
          wx.showToast({
            title: '网络错误',
            icon: 'loading',
            duration: 2000
          })
          that.setData({ submitOk: true }); return;}
          that.buyPay();
      })
    }
  
  },
  /**
   * 立即购买
   */
  buyPay(){
    let that =this;
    let { payType, is_app, postage_list, uid, storeId, user_coupon_id, shipping_method, orderId, sendMethod } = that.data;
    let address_params = that.buildAddressParams();
    let address_id = address_params.addressId;
    var params = {
      payType: payType,
      orderNo: orderId,
      is_app: is_app,
      postage_list: postage_list,
      shipping_method: shipping_method,
      address_id: address_id,
      uid: uid,
      store_id: storeId,
      user_coupon_id: user_coupon_id,
      send_type: sendMethod
    }
    wx.showLoading({ title: '请稍候...', mask: true, });
    app.api.postApi(_buyUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        wx.showModal({
          title: '支付失败',
          content: err || resp.err_msg,
          confirmText: '好的',
          success: function () {
            that.setData({ submitOk: true });
            //推送消息
            app.send(that.data.orderId);
            wx.switchTab({
              url: '../../tabBar/home/index-new',
            })
          }
        }); return;
      }


      // 调起微信支付
      if (resp.err_dom) {
        // wx.navigateTo({
        //   url: './my-order?goodsindex=' + 2
        // })
        wx.switchTab({
          url: '../../tabBar/home/index-new',
        })
      } else {
        // 调起微信支付
        this._startPay(resp.err_msg);
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
    //支付成功，拼团商品跳转待成团列表，其余商品跳转待收货列表
    let url = that.data.orderType == 6 ? '../../group-buying/my-order?orderstatus=0':'./my-order';
    setTimeout(function () {
      // wx.redirectTo({
      //   url
      // });
      wx.switchTab({
        url: '../../tabBar/home/index-new',
      })
    }, 1000);
  },
  /**
   * 支付成功
   */
  _onPaySuccess(res) {
    wx.removeStorageSync('couponInfo');
    var that = this;
    
    //推送消息
    app.send(that.data.orderId);
    that.setData({
      matteShow: true, submitOk: true
    });
    //支付成功，拼团商品跳转待成团列表，其余商品跳转待收货列表
    let url = that.data.orderType == 6 ? '../../group-buying/my-order?orderstatus=0' : './my-order' ;
    setTimeout(function () {
      // wx.redirectTo({
      //   url
      // });
      wx.switchTab({
        url: '../../tabBar/home/index-new',
      })
    }, 1000);
    var params = {
      order_no: that.data.orderId
    };
    //给卡券接口
    // app.api.postApi('wxapp.php?c=order&a=save_card_set', { params }, (err, resp) => {
    //   console.log('卡券结果', resp)
    // });
  },

  /**
   * 支付失败
   */
  _onPayFail(err) {
    let that = this;
    //推送消息
    app.send(that.data.orderId);
    that.setData({
      submitOk: true
    });
    //let status = that.data.status;
    wx.showModal({
      title: '支付失败',
      content: '订单支付失败，请到[订单-待付款]列表里重新支付',
      cancelColor: '#FF0000',
      confirmText: '好的',
      success: function (res) {
        // if (res.confirm) {
          //失败跳我的订单-待付款
          // wx.redirectTo({
          //   url: `./my-order?page=1`
          // });
        wx.switchTab({
          url: '../../tabBar/home/index-new',
        })
        // } else if (res.cancel) {
        //   return;
        // }
        
      },
    });
  },
  //关闭弹窗
  closeBtn() {
    var that = this;
    that.setData({
      matteShow: false
    });
    //500毫秒后跳转
    let status = that.data.status;

    if (that.data.orderType == 6) {//拼团订单
      // if (that.data.status == 1) { status = 2 } else { status = 5 }//2已成团，5待成团
      status=2;
    }
    let url = (that.data.orderType == 6) ? `../../group-buying/my-order?orderstatus=${status}` : `./my-order?page=${status}` ;
    setTimeout(function () {
      wx.redirectTo({
        url
      });
    }, 1000);
  },

  
  // 更改收货地址
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
    let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, sendMethod, pickupStoreId } = this.data;

    if (sendMethod == '1') {
      if (addressId) return true;   // 有选了地址
      else {
        return this._showError('请先新增收货地址');
      }
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
    
    } else if (sendMethod == '2') {
      if (!pickupStoreId) {
        return this._showError('请选择自提门店');
      }
    }
    return true;
  },

  /**
   * 组装地址参数
   */
  buildAddressParams() {
    let { addressId, zoneId, cityId, districtId, fullname, shippingTelephone, location, sendMethod, pickupStoreId } = this.data;
    let params;

    if (sendMethod == 1) {
      if (addressId) {
        params = {
          'addressId': addressId,
          'sendMethod': sendMethod,
        }
      } else {
        params = {
          'address[zone_id]': zoneId,
          'address[city_id]': cityId,
          'address[district_id]': districtId,
          'address[fullname]': fullname,
          'address[shipping_telephone]': shippingTelephone,
          'address[address]': location,
          'sendMethod': sendMethod,
        }
      }
    } else if (sendMethod == 2) {
      params = {
        'pickupStoreId': pickupStoreId,
        'sendMethod': sendMethod,
        'addressId':-1
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
    console.log('paramsssss', params)
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
  setsendMethod(method) {
    this.setData({ sendMethod: method });
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
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
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
    this.setsendMethod(method);
  },
  //2017年12月22日15:58:39 选择优惠券
  changeCoupon: function (event) {
    // var pro_price = event.currentTarget.dataset.pro_price;
    var pro_price = this.data.totals;
    var product_id = event.currentTarget.dataset.product_id;
    wx.navigateTo({
      url: '../../shopping/pages/buycard?product_id=' + product_id + '&pro_price=' + pro_price
    });
  },


})