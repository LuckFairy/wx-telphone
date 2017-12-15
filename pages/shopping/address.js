var app = getApp();
// const util = require('../../utils/util.js');
import { Api } from '../../utils/api_2';
import { store_Id } from '../../utils/store_id';
Page({
  data:{
    isDefault: false,   // 是否为默认地址
    index:'',
    fullname:'',
    phonename:'',
    address:'',
    store_id:'',
    uid:'',
    provicens_list:'',
    provicens_id:'',
    city_id:'',
    city_list:'',
    cityIndex:'',
    area_list:'',
    area_id:'',
    areaIndex:'',
    pro_id:'',
    cit_id:'',
    ar_id:'',
    addressiinfo:'',
    revamp:'',
    address_id:''
  },
  saveRevamp(e){
    console.log(e,'保存修改地址时')
    var that =this;
    var uid = e.currentTarget.dataset.uid;
    var address_id = e.currentTarget.dataset.addressId;
    // 如果未更改
    var addr = e.currentTarget.dataset.address;
    var area = e.currentTarget.dataset.area;
    var city = e.currentTarget.dataset.city;
    var name = e.currentTarget.dataset.name;
    var phone = e.currentTarget.dataset.phone;
    var province = e.currentTarget.dataset.province;
    // 修改了
    var fullname = that.data.fullname;
    console.log('fullname保存地址时', fullname);
    var phonename = that.data.phonename;
    var address = that.data.address;
    var pro_id = that.data.pro_id;
    var cit_id = that.data.cit_id;
    var ar_id = that.data.ar_id;
    console.log('ar_id保存地址时', ar_id);
    
    // 地址修改判断
    var peo_name;
    var peo_phone;
    var peo_address;
    var peo_pro_id;
    var peo_cit_id;
    var peo_ar_id;
    if (!fullname){
      peo_name = name;
    }else{
      peo_name = fullname;
    }
    if (!phonename){
      peo_phone = phone;
    }else{
      peo_phone = phonename
    }
    if (!address){
      peo_address = addr;
    }else{
      peo_address = address;
    }
    if (!pro_id) {
      peo_pro_id = province;
    } else {
      peo_pro_id = pro_id;
    // 清除其他数据
    }
    if (!cit_id) {
      peo_cit_id = city;
    } else {
      peo_cit_id = cit_id;
    }
    if (!ar_id) {
      peo_ar_id = area;
    } else {
      peo_ar_id = ar_id;
    }

    var params = {
      uid:uid,
      address_id: address_id,
      user_name: peo_name,
      tel: peo_phone,
      province: peo_pro_id,
      city: peo_cit_id,
      area: peo_ar_id,
      address: peo_address 
    }
    // 修改保存
    app.api.postApi('wxapp.php?c=address&a=EditAddress', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, '修改地址情况')
        wx.redirectTo({
          url: './address-list'
        })
      }
    });
  },
  saveAddress(e){
    console.log(e,'eeeeeeeeee')
    var that = this;
    var fullname = that.data.fullname;
    var phonename = that.data.phonename;
    var address = that.data.address;
    var uid = that.data.uid;
    var pro_id = that.data.pro_id;
    var cit_id = that.data.cit_id;
    var ar_id = that.data.ar_id;
    console.log(fullname, phonename, address, uid, pro_id, cit_id, ar_id);
    if (fullname && phonename && address && uid && pro_id && cit_id && ar_id){
      var params = {
        user_name: fullname,
        tel: phonename,
        province: pro_id,
        city: cit_id,
        area: ar_id,
        address: address,
        uid: uid
      }
      app.api.postApi('wxapp.php?c=address&a=AddAddress', { params }, (err, resp) => {
        if (err) {
          return;
        }
        if (resp.err_code == 0) {
          if (resp.err_msg.result == '添加成功') {
            console.log('resp.err_msg', resp.err_msg)
            console.log('添加地址成功')
            wx.showLoading({
              title: '添加地址成功'
            })
            setTimeout(function () {
              wx.hideLoading()
              
            }, 1000)
            wx.redirectTo({
              url: './address-list'
            })
          }
        }
      });
    }else{
      wx.showLoading({
        title: '请完善信息'
      })
      setTimeout(function(){
        wx.hideLoading()
      },1000)
    }
    
  },
  bindShippingTelephoneChange(e){
    this.setData({
      phonename: e.detail.value
    })
  },
  bindFullnameChange(e){
    console.log('姓名修改',e)
    this.setData({
      fullname: e.detail.value
    })
  },
  bindAddressChange(e){
    this.setData({
      address: e.detail.value
    })
  },
  bindPickerChange(e){
    console.log('省份选择时', e)
    var that =this;
    this.setData({
      index: e.detail.value
    })
    var index = that.data.index;
    var provicens_id = that.data.provicens_id;
    console.log('选择的index', index);
    console.log('省份列表的id', provicens_id);
    // 选择某省份时候对应的id
    var pro_id = provicens_id[index];
    console.log(pro_id,'pro_id');
    // 获取对应城市
    var params = {
      id: pro_id
    }
    that.setData({
      pro_id
    })
    var city_list = [];
    var city_id = [];
    app.api.postApi('wxapp.php?c=address&a=getarea', { params}, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg,'对应城市信息')
        var citys = resp.err_msg.area;
        for (var j = 0; j < citys.length; j++) {
          city_list.push(citys[j].name);
          city_id.push(citys[j].id);
        }
        that.setData({
          city_list,
          city_id
        })
      }
    });
  },
  bindCityChange(e){
    var that = this;
    this.setData({
      cityIndex: e.detail.value
    })
    var cityIndex = that.data.cityIndex;
    var city_id = that.data.city_id;
    console.log('选择的城市index', cityIndex);
    console.log('城市列表的id', city_id);
    // 选择某城市时候对应的id
    var cit_id = city_id[cityIndex];
    that.setData({
      cit_id
    })
    console.log(cit_id, 'cit_id');
    // 获取对应城市
    var params = {
      id: cit_id
    }
    var area_list = [];
    var area_id = [];
    app.api.postApi('wxapp.php?c=address&a=getarea', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, '对应区域信息')
        var area = resp.err_msg.area;
        for (var j = 0; j < area.length; j++) {
          area_list.push(area[j].name);
          area_id.push(area[j].id);
        }
        console.log(area_list,'area_list')
        that.setData({
          area_id,
          area_list
        })
      }
    });
  },
  bindDistrictChange(e){
    // 区域信息
    console.log('区域信息数据啊啊啊',e);
    var that = this;
    this.setData({
      areaIndex: e.detail.value
    })
    var areaIndex = that.data.areaIndex;
    var area_id = that.data.area_id;
    console.log('选择的区域index', areaIndex);
    console.log('区域列表的id', area_id);
    // 选择某区域时候对应的id
    var ar_id = area_id[areaIndex];
    that.setData({
      ar_id
    })
    console.log(ar_id, 'ar_id');
  },
  onLoad:function(options){
    console.log(options,'修改地址')
    var that = this;
    var store_id = store_Id.store_Id();//store_id
    // 进入修改地址
    var revamp = options.revamp;
    // 修改地址
    if (revamp==1){
      var uid = options.uid;
      var address_id = options.address_id;
      that.setData({
        revamp: 1, uid, address_id
      })
      console.log('uid.address_id', address_id, uid)
      var params = {
        uid, address_id
      }
      app.api.postApi('wxapp.php?c=address&a=FindAddress', { params }, (err, resp) => {
        if (err) {
          return;
        }
        if (resp.err_code == 0) {
          console.log(resp.err_msg,'修改地址时的数据')
          var addressiinfo = resp.err_msg.addressiinfo;
          that.setData({
            addressiinfo
          })
        }
      });
    }
    // 修改地址结束
    var provicens_list = [];
    var provicens_id = [];
    Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    console.log(uid, store_id);
    that.setData({ uid: uid, store_id: store_id });
  //  加载省份信息
    app.api.postApi('wxapp.php?c=address&a=getProvinces', {}, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('省份信息', resp.err_msg);
        var provicens = resp.err_msg.provinces;
        for (var j = 0; j < provicens.length;j++){
          provicens_list.push(provicens[j].name);
          provicens_id.push(provicens[j].id);
        }
        that.setData({
          provicens_list,
          provicens_id
        })
      }
    });
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
  bindIsDefaultChange() {
    this.setData({
      isDefault: !this.data.isDefault
    });    
  }
})