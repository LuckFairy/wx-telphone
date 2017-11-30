// pages/shopping/buy.js

const util = require('../../utils/util.js');
var app = getApp();
const log = 'buy.js --- ';

const AddressSettingURL = 'buy/address';   // 设置售货地址
const ListURL = 'store/ls';          // 门店列表
const DetailURL = 'store/detail';    // 门店详情

var checkTimer = null;
let _prodId;                          // 记录商品 id
let skuid;                          // 记录商品多属性标识 id
let quantity;                          // 购买商品的数量
let groupbuyId;                   //团购ID
let groupbuyOrderId;                   //团购ID
Page({
  data: {
    // cardList: [],
    addrList: [],
    // fee: null,
    error: false,
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
    groupbuyId: null,
    groupbuyOrderId: 0,
    matteShow: false,  //购买成功弹窗
    prodId: '',
    groupbuyId: '',
    groupbuyOrderId: '',
    // flag:1, //没用了
    // imgName:"",//没用了
    // imgUrl:"",   //没用了
    showshare:"true"
  },
  onLoad: function (options) {
    //2017年8月17日13:46:50 处理选择后的多属性
    var attrData = wx.getStorageSync('key') || [];
    if (attrData.length > 0) {
      var attrArr = attrData.split('-');
      this.setData({ productColor: attrArr['0'], productSize: attrArr['1'] });
      skuid = options.skuid;
    } else {
      skuid = 0;
      console.log('该商品没有多属性');
    }
    //商品的数量
    quantity = options.num;
    this.setData({ quantity: quantity });
    //var attrArr = attrData.split(",");//以逗号作为分隔字符串
    //console.log('buy.js-选择的属性-数组：' + attrArr);
    // 页面初始化 options为页面跳转所带来的参数
    console.log('buy.js-页面初始化 options为页面跳转所带来的参数：');
    console.log(options);

    let { prodId, qrEntry } = options;
    // this._prepareOrder(prodId);
    _prodId = prodId;       // 记录商品 id
    prodId = options.prodId;
    groupbuyId = options.groupbuyId;       // 活动 id
    groupbuyOrderId = options.groupbuyOrderId; // 团 id
    this.setData({
      prodId: prodId,
      groupbuyId: groupbuyId,
      groupbuyOrderId: groupbuyOrderId
    });
    // this._prepare(prodId);
    if (qrEntry) {
      this.setData({ qrEntry: qrEntry });
    }

    // 加载门店列表数据
    this._loadShopData();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this._prepare(_prodId, skuid, quantity, groupbuyId);
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
    wx.navigateTo({
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
        console.log(log + '设置收货地址成功');
        console.log(res);
        this._handleData(res);
      } else {
        console.log(log + '设置收货地址出错');
        console.log(err);
        this._showError('加载数据出错，请重试');
      }
    });
  },

  /**
   * 准备订单信息
   */
  _prepareOrder(prodId, skuid, quantity, groupbuyId) {
    wx.showLoading({ title: '加载中...', mask: true, });
    //post['test'] = 'abc123';
    //app.api.postApi("buy/prepare", {prodId}, (err, resp) => {
    let url = 'buy/prepare';
    //let url = 'buy/prepare/skuid=' + skuid; //新接口
    //app.api.postApi("buy/prepare_new", { prodId }, (err, resp) => {  
    app.api.postApi(url, { prodId, skuid, quantity, groupbuyId, groupbuyOrderId }, (err, resp) => {
      //app.api.postApi(url, { prodId, skuid, quantity}, (err, resp) => {  
      wx.hideLoading();
      console.log('skuid' + skuid);
      console.log(log + '订单数据');
      console.log({ err, resp });
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
    // this.setData({  //这个是丛购买成功后分享的，没用了
    //   //在此处拿到商品的名称和地址，存起来，以方便购买成功后将之传递给下一步
    //   imgName: products[0].name,
    //   imgUrl: products[0].thumb
    // })

    let { zoneList } = this.data;

    let addressId = false;
    let address = null;
    if (addrList && addrList.length) {
      for (let i = 0; i < addrList.length; i++) {
        if (addrList[i].isSelected) {
          console.log(log + '选择的地址');
          console.log(addrList[i]);
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

  /**
   * 提交订单
   */
  submitOrder: function (event) {
    //if (this.data.error) return false;
    console.log(event);
    console.log(event.detail.formId);
    var formId = event.detail.formId;
    //console.log('提交订单'); return false;
    if (!this.checkAddress()) return false;

    // 收货地址
    let params = this.buildAddressParams();
    console.log('收货地址-skuid:' + skuid);
    console.log('收货地址:'); console.log(params);
    //params.push(skuid);
    params.skuId = skuid;
    params.quantity = quantity;
    params.groupbuyId = groupbuyId;
    params.groupbuyOrderId = groupbuyOrderId; //开团0，参团需要对应的值（团ID）
    console.log('收货地址:'); console.log(params);
    //return;
    wx.showLoading({ title: '加载中...', mask: true, });

    //app.api.postApi("buy/submit", params, (err, resp) => {
    app.api.postApi("buy/submit_new", params, (err, resp) => {
      wx.hideLoading();
      console.log({ err, resp });
      if (err) {
        return this._showError('提交订单失败，请重试');;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);;
      }

      let { orderId, needPay, payParams } = data;
      //console.log('支付前的判断是否要支付参数');
      //console.log(needPay);
      //console.log('断点');return;
      // 不需要支付
      if (!needPay) {
        return this._onSubmitNoPay();
      }

      // 需要支付
      if (payParams) {
        console.log('订单号' + data.orderId);
        //this._startPay(payParams, data.orderId); 
        this._startPay(payParams, data.orderId, formId);
      }
    });
  },

  /**
   * 提交订单
   */
  // submitOrder2: function(event){
  //   //if (this.data.error) return false;
  //   let {preOrderId} = this.data;

  //   wx.showLoading({title: '加载中...', mask: true, });

  //   app.api.postApi("buy_submit", {preOrderId}, (err, resp) => {
  //     wx.hideLoading();
  //     console.log({err, resp});
  //     if (err) {
  //       return this._showError('提交订单失败，请重试');;
  //     } 

  //     let {rtnCode, rtnMessage, data} = resp;
  //     if (rtnCode != 0) {
  //       return this._showError(rtnMessage);;
  //     }

  //     let {orderId, needPay, payParams} = data;

  //     // 不需要支付
  //     if (!needPay) {
  //       return this._onSubmitNoPay();
  //     }

  //     // 需要支付
  //     if (payParams) {
  //       this._startPay(payParams);
  //     }      
  //   });
  // },

  /**
   * 调起微信支付
   */
  _startPay(payParams, orderId, formId) {
    let param = {
      timeStamp: payParams.timeStamp + "",
      nonceStr: payParams.nonceStr,
      "package": "prepay_id=" + payParams.prepayId,
      signType: 'MD5',
      paySign: payParams.paySign,
      success: res => this._onPaySuccess(res),
      fail: err => this._onPayFail(err)
    };
    //console.log('调起微信支付参数payParams:');
    //console.log(payParams);
    console.log('发起支付:', param);
    //console.log('发起支付package:', param.package);
    //console.log('调试断点');
    var arr = param.package.split("=");
    //console.log('发起支付package处理后');
    //console.log(arr);
    console.log('prepare id:' + arr['1']);
    console.log('订单号是:' + orderId);
    //return;
    //this._sendMsg(arr['1'], orderId);
    wx.requestPayment(param);
    //this._sendMsg(arr['1']);
    //this._sendMsg(arr['1'], orderId); //使用的是prepare_id，但是苹果收不到
    //this._sendMsg(formId, orderId); //使用的是button formId

  },

  /**
   * 订单提交成功，不需要支付
   */
  _onSubmitNoPay() {
    wx.showToast({ title: "提交成功", icon: "success", duration: 1000 });
    setTimeout(function () {
      wx.navigateTo({
        url: '../shopping/my-order'
      });
    }, 1000);
  },
  //关闭弹窗
  closeBtn(e) {
    var that = this;
    that.setData({
      matteShow: false
    });

    var prodId = that.data.prodId;
    var groupbuyId = that.data.groupbuyId;
    var groupbuyOrderId = that.data.groupbuyOrderId;

    //购买成功后的分享功能，丢弃……
    // var imgName = that.data.imgName;
    // var imgUrl=that.data.imgUrl;
    // var flag=that.data.flag;
    // var showshare = that.data.showshare;
    
    //500毫秒后跳转
    setTimeout(function () {
      wx.redirectTo({
        url: '../shopping/my-order?groundBuy=1&prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId

        // url: '../shopping/my-order?groundBuy=1&prodIdShare=' + prodId + '&groupbuyIdShare=' + groupbuyId + '&groupbuyOrderIdShare=' + groupbuyOrderId + "&flag=" + flag + "&imgName=" + imgName + "&imgUrl=" + imgUrl + "&showshare=" + showshare
      });
    }, 500);
  },
  /**
   * 支付成功
   */
  _onPaySuccess(res) {
    //_onPaySuccess(res, prepareId, orderId) {  
    //this._sendMsg(prepareId, orderId);
    var that = this;
    console.log('支付成功：', res);
    // 支付成功弹窗
    that.setData({
      matteShow: true
    });
  },

  /**
   * 支付失败
   */
  _onPayFail(err) {
    console.log('支付失败：', err);
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
        console.log(log + '获取门店列表数据');
        console.log(res.data);
        let { data: shopListData } = res;

        this._loadShopDetailData(shopListData[0]);   // 默认加载第一个门店的详情数据
        this.setData({ shopListData });
      } else {
        console.log(log + '获取门店列表数据错误');
        console.log(err);
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

    app.api.fetchApi(DetailURL + '/' + options.storeId, (err, res) => {    // 获取门店详情数据
      if (!err && res.rtnCode == 0) {
        console.log(log + '获取门店详情数据');
        console.log(res.data);
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
        console.log(log + '获取门店详情数据错误');
        console.log(err);
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
    console.log(log + '点击查看街景');
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

  //发送模板消息测试
  _sendMsg(prepayId, orderId) {
    console.log('发送模板消息测试参数prepayId');
    console.log(prepayId);
    var user_id = app.d.userId; //测试参数
    var formId = prepayId;
    var orderId = orderId;
    let url = 'buy/sendmsg';
    app.api.postApi(url, { user_id, formId, orderId }, (err, resp) => {
      //console.log({ err, resp });
      if (err) {
        //return this._showError('加载数据出错，请重试');
        wx.showToast({
          title: '加载数据出错，请重试',
          icon: 'loading',
          duration: 2000
        });
        return;
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        //return this._showError(rtnMessage);
      }
      //console.log('发送模板消息测试');
      //console.log(data);

    });
  },


})