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
    // cardList: [],

    // fee: null,
    error: false,
    products: [],
    totals: [],//商品总价
    isLoading: true,
    showwechat: false,

    shippingMethod: 'flat.flat',  // 邮寄方式，默认平邮   flat.flat-平邮  pickup.pickup 到店自提
    shippingMethods: [],    // 有效的配送方式
    hasFlatShip: false,
    hasPickupShip: false,
  

    //address: null,    // 存放当前收货地址数据
    //addressId: 0,     // 选择的收货地址id
   // pickupStoreId: 0, // 自提门店id

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
   storeId :'',//商店id
   uid : '',//用户id
   address: null,    // 存放当前收货地址数据
   addressList:[],  //地址列表
   addressId: 0,     // 选择的收货地址id
   pickupStoreId: 0, // 自提门店id
   productList:null,//产品列表
   fee:0,//运费
   lastPay:0//实付
  },
  /*
  *订单详情列表
  */
  showOrderList (opt) {
    let that = this;
    app.api.postApi('wxapp.php?c=order&a=mydetail',{"params": {
      "order_no":opt.orderId 
    }}, (err,rep) => {
      if(err){ console.log('err ',err); return;}
      var { err_code, err_msg: { orderdata}} = rep;
      if(err_code != 0){ return;}
      that.setData({ "shopListData": orderdata, "productList": orderdata.product, totals: orderdata.sub_total, fee: orderdata.postage_int, lastPay: (orderdata.sub_total - orderdata.postage_int) });
    })
  },
  /*
  *地址详情列表
  */
  getAddress(uid){
    var url = 'wxapp.php?c=address&a=MyAddress';
    var that = this;
    app.api.postApi(url,{"params": { uid }} , (err, rep) => {
      if(!err && rep.err_code == 0){
        this.setData({
          "addressList": rep.err_msg,
          "addressId": rep.err_msg[0].address_id
        });
        //设置默认地址
        for ( var i in rep.err_msg ){
          if (rep.err_msg[i].default == 1){
            this.setData({
              address: rep.err_msg[i]
            })
          }
        }
        
       
      }
    })
  },
  

  onLoad: function (options) {
    let {  uid, pid, skuId, storeId, qrEntry ,orderId } = options;
    quantity = options.quantity;
    //2017年12月16日amy 判断是否是多属性sku_id,单属性sku_id为空或0
    
    this.setData({ orderId});
    //显示订单列表
    this.showOrderList({ orderId });
    this.getAddress(uid);

    //生成订单
    //this._loadShopData({"uid":uid ,"quantity":quantity,"product_id":pid,"store_id":storeId});

    //2017年8月17日13:46:50 处理选择后的多属性
    // var attrData = wx.getStorageSync('key') || [];
    // if (attrData.length > 0) {
    //   var attrArr = attrData.split('-');
    //   this.setData({ productColor: attrArr['0'], productSize: attrArr['1'] });
    //   skuid = options.skuid;
    // } else {
    //   skuid = 0;
    // }

    
    //quantity商品的数量
    //this.setData({ quantity: quantity });
    
    // this._prepareOrder(prodId);
    _prodId = pid;       // 记录商品 id

    // this._prepare(prodId);
    // if (qrEntry) {
    //   this.setData({ qrEntry: qrEntry });
    // }

    // 加载门店列表数据
   // this._loadShopData();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
   // this._prepare(_prodId, skuid, quantity, groupbuyId);
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
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
  changeAddress(addressId) {
    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi(AddressSettingURL, { addressId }, (err, res) => {  // 设置收货地址
      wx.hideLoading();
      if (!err && res.rtnCode == 0) {
        this._handleData(res);
      } else {
        this._showError('加载数据出错，请重试');
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
    var getOpenId = wx.getStorageSync('userOpenid');//获取到存储的openid  
    console.log(getOpenId, "88888888888888888888888888888888888")
    var that = this;
    // 显示公众号复制提示
    that.setData({
      showwechat: true
    })
    //if (this.data.error) return false;

    if (!this.checkAddress()) return false;

    // 收货地址
    let params = this.buildAddressParams();
    params.skuId = skuid;
    params.quantity = quantity;
    //return;
    wx.showLoading({ title: '加载中...', mask: true, });
    app.api.postApi("wxapp_saveorder.php?action=pay_xcx", params, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('提交订单失败，请重试');;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      let { orderId, needPay, payParams } = data;

      // 不需要支付
      if (!needPay) {
        return this._onSubmitNoPay();
      }

      // 需要支付
      if (payParams) {
        this._startPay(payParams);
      }
    });

    
  },



  /**
   * 调起微信支付
   */
  _startPay(payParams) {
    let param = {
      timeStamp: payParams.timeStamp + "",
      nonceStr: payParams.nonceStr,
      "package": "prepay_id=" + payParams.prepayId,
      signType: 'MD5',
      paySign: payParams.paySign,
      success: res => this._onPaySuccess(res),
      fail: err => this._onPayFail(err)
    };
    wx.requestPayment(param);
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
    }, 500);
  },

  /**
   * 支付成功
   */
  _onPaySuccess(res) {
    var that = this;
    // 支付成功弹窗
    that.setData({
      matteShow:true
    });
    
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
  }
})