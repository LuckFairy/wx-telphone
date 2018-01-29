// pages/shopping/address.js 
const app = getApp();

const util = require('../../utils/util.js');

const log = 'address.js --- ';

const UpdateAddressURL = 'address/update';       // 更新收货地址
let _hasLoaded = false;                           // 载入添加用户数据
let _type, _address;                             // 保存页面跳转所带来的参数
let fullname, shippingTelephone, address;        // 保存用户名，电话，详细地址

Page({
  data:{
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
    address: '',
    isDefault: false,   // 是否为默认地址
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    // let {type, address} = options;
    // [_type, _address] = [type, address];    // 保存页面跳转所带来的参数
    _type = options['type'] || false;
    _address = options['address'] || false;
    _hasLoaded = false;
    //===========test start =========    
    if (_type === 'update'){
      var _address2 = JSON.parse(_address);
      var address = _address2.address;
      var cityId = _address2.cityId;
      var zoneId = _address2.zoneId;
      var isDefault = _address2.isDefault;

      this.setData({ zoneId: zoneId });
      this.setData({ cityId: cityId });
      this.setData({ isDefault: isDefault });
    }
    //==============test end==============
    this.loadZone();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },

  /**
   * 保存地址
   */
  saveAddress:function(event) {
    let {zoneId, cityId, districtId, isDefault} = this.data;
    
    if (!fullname) {
      return this._showError('请填写收货人');
    }
    if (!shippingTelephone) {
      return this._showError('请填写手机号码');
    }
    if (!util.checkMobile(shippingTelephone)) {
      return this._showError('不是有效的手机号码');
    }
    if (!address) {
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

    isDefault = isDefault? 1:0;
    let params = {fullname, shippingTelephone, address, zoneId, cityId, districtId, isDefault};

    wx.showLoading({title: '加载中'});
    
    if(_type === 'update') {   // 更新数据
        let {addressId} = JSON.parse(_address);
        params = Object.assign(params, {addressId});
        app.api.postApi(UpdateAddressURL, params, (err, response) => {
        if(!err && response.rtnCode == 0) {
          wx.showToast({icon: 'success', title: '操作成功', duration: 1000, mask: true});

          setTimeout(() => {
            wx.redirectTo({
              url: './address-list',
            });
          }, 1000);
        } else {
          this._showError('操作失败，请重试');
        }
      });
    } else {
      app.api.postApi('address/add', params, (err, response) => {
        wx.hideLoading();
        
        if (err) {
          return this._showError('操作失败，请重试');
        } 

        let {rtnCode, rtnMessage, data} = response;
        if (rtnCode != 0) {
          return this._showError(rtnMessage);;
        }

        wx.showToast({icon: 'success', title: '操作成功', duration: 1000, mask: true});

        setTimeout(() => {
          wx.redirectTo({
            url: './address-list',
          });
        }, 1000);
      });
    }
  },

  loadZone() {
    this.setData({zoneList: [], cityList: [], districtList: []});
    app.api.fetchApi('address/zone', (err, response) => {
      let {data} = response;      
      if (data) {
        
        if (_type === 'update') {
          this.setData({ zoneList: data, selectedZoneIndex: 0, zoneId: this.data.zoneId });
          this.loadCity(this.data.zoneId);
        }else{
          this.setData({ zoneList: data, selectedZoneIndex: 0, zoneId: data[0].zoneId });
          this.loadCity(data[0].zoneId);
        }
      }
    });
  },

  loadCity(zoneId) {
    this.setData({cityList: [], districtList: []});
    app.api.fetchApi('address/city/' + zoneId, (err, response) => {
      let {data} = response;
      if (data) {
        

        if (_type === 'update') {
          this.setData({ cityList: data, selectedCityIndex: 0, cityId: this.data.cityId  });
          this.loadDistrict(this.data.cityId);
        } else {
          this.setData({ cityList: data, selectedCityIndex: 0, cityId: data[0].cityId });
          this.loadDistrict(data[0].cityId);
        }
      }
    });
  },

  loadDistrict(cityId) {
    this.setData({districtList: []});
    app.api.fetchApi('address/district/' + cityId, (err, response) => {
      let {data} = response;
      if (data) {
        this.setData({districtList: data, selectedDistrictIndex: 0, districtId: data[0].districtId});
        
        if(_type === 'update' && !_hasLoaded) {             // 如果是更新地址数据，则填入用户之前的值
          this._getUserDefaultData(JSON.parse(_address));
        }
      }
    });
  },
  
  /**
   * 如果是更新地址数据，则填入用户之前的值
   */
  _getUserDefaultData(_address) {
    let {zoneId, cityId, districtId, isDefault} = _address;
    fullname = _address.fullname;
    address = _address.address;
    shippingTelephone = _address.shippingTelephone;
    let {zoneList, cityList, districtList} = this.data;
    let selectedZoneIndex = this._findIndex(zoneId, 'zoneId', zoneList);
    let selectedCityIndex = this._findIndex(cityId, 'cityId', cityList);
    let selectedDistrictIndex = this._findIndex(districtId, 'districtId', districtList);
    
    _hasLoaded = true;
    this.setData({
      fullname, address, shippingTelephone, zoneId, cityId, districtId, selectedZoneIndex, selectedCityIndex, selectedDistrictIndex
    });
  },
  
  /**
   * 找各种selectedId
   */
  _findIndex(id, name, arr) {
    let index = 0;
    for(let i=0, len=arr.length; i<len; i++) {
      if(arr[i][name] === id) {
        index = i;
        break;
      }
    }
    return index;
  },

  bindZoneChange(e) {
    let {zoneList} = this.data;
    let index = parseInt(e.detail.value);
    let {zoneId} = zoneList[index];
    this.setData({
      selectedZoneIndex: index,
      zoneId: zoneId,
    });
    this.loadCity(zoneId);
  },

  bindCityChange(e) {
    let index = parseInt(e.detail.value);
    let {cityList} = this.data;
    let {cityId} = cityList[index];
    this.setData({
      selectedCityIndex: index,
      cityId: cityId,
    });
    this.loadDistrict(cityId);
  },

  bindDistrictChange(e) {
    let index = parseInt(e.detail.value);
    let {districtList} = this.data;
    let {districtId} = districtList[index];
    this.setData({
      selectedDistrictIndex: index,
      districtId: districtId,
    });
  },

  bindFullnameChange(e) {
    // this.setData({fullname: e.detail.value.trim()});
    fullname = e.detail.value.trim();
  },
  bindAddressChange(e) {
    // this.setData({address: e.detail.value.trim()});
    address = e.detail.value.trim();
  },
  bindShippingTelephoneChange(e) {
    // this.setData({shippingTelephone: e.detail.value.trim()});
    shippingTelephone = e.detail.value.trim();
  },
  
  bindIsDefaultChange() {
    this.setData({
      isDefault: !this.data.isDefault
    });    
  },

  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({title: errorMsg, image: '../../image/error.png', mask: true});
    this.setData({error: errorMsg});
  },
})