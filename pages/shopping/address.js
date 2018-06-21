var app = getApp();
const util = require('../../utils/util.js');
import { Api } from '../../utils/api_2';
Page({
  data:{
    isDefault: false,   // 是否为默认地址
    index:'',
    fullname:'',
    phonename:'',
    address:'',
    store_id: '',
    uid:'',
    provicens_list:[],
    provicens_id:'',
    city_id:'',
    city_list:[],//城市列表
    cityIndex:'',
    area_list:[],
    area_id:'',
    areaIndex:'',
    pro_id:'',
    cit_id:'',
    ar_id:'',
    addressiinfo:'',
    revamp:'',
    address_id:''
  },
  onLoad: function (options) {
    var that = this;
    var store_id = app.store_id;//store_id
    var uid = wx.getStorageSync('userUid');
    that.setData({ uid: uid, store_id });
    let { pro_id, city_id, ar_id } = that.data;
    // 进入修改地址
    var revamp = options.revamp;
    if (revamp == 1) {// 修改地址
      var uid = options.uid;
      var address_id = options.address_id;
      that.setData({
        revamp: 1, uid, address_id
      })
      var params = {
        uid, address_id
      }
      app.api.postApi('wxapp.php?c=address&a=FindAddress', { params }, (err, resp) => {
        if (err) {
          return;
        }
        if (resp.err_code == 0) {
          console.log(resp.err_msg, '修改地址时的数据')
          var addressiinfo = resp.err_msg.addressiinfo;
          //加载省份信息
          that.loadPro();
          //加载城市信息
          that.loadCity(addressiinfo.province);
          //加载地区信息
          that.loadDirs(addressiinfo.city);
          that.setData({
            addressiinfo,
            pro_id: addressiinfo.province,
            cit_id: addressiinfo.city,
            ar_id: addressiinfo.address_id,
          })
        }
      });
    }else{
      //加载城市信息
      that.loadPro();
    }

  },
  loadPro(){
    var that = this;
    // 修改地址结束
    var provicens_list = [];
    var provicens_id = [];
    //  加载省份信息
    app.api.postApi('wxapp.php?c=address&a=getProvinces', {}, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        var provicens = resp.err_msg.provinces;
        for (var j = 0; j < provicens.length; j++) {
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
  loadCity(pro_id){
    var that = this;
    // 获取对应城市
    var params = {
      id: pro_id
    }
    var city_list = [];
    var city_id = [];
    app.api.postApi('wxapp.php?c=address&a=getarea', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, '对应城市信息')
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
  loadDirs(cit_id){
    var that =this;
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
        console.log(area_list, 'area_list')
        that.setData({
          area_id,
          area_list
        })
      }
    });
  },
  saveRevamp(e) {
    console.log(e, '保存修改地址时')
    var that = this;
    var uid = that.data.uid;
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
    var phonename = that.data.phonename;
    var address = that.data.address;
    var pro_id = that.data.pro_id;
    var cit_id = that.data.cit_id;
    var ar_id = that.data.ar_id;

    // 地址修改判断
    var peo_name;
    var peo_phone;
    var peo_address;
    var peo_pro_id;
    var peo_cit_id;
    var peo_ar_id;

    if (!fullname) {
      peo_name = name;
    } else {
      peo_name = fullname;
    }
    if (!phonename) {
      peo_phone = phone;
    } else {
      if (util.checkMobile(phonename)){
        peo_phone = phonename
      }else{
        return this._showError('不是有效的手机号码');
      }
    }
    if (!address) {
      peo_address = addr;
    } else {
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
      uid: uid,
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
        wx.navigateTo({
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
    if (!fullname) {
      return this._showError('请填写收货人');
    }
    if (!phonename) {
      return this._showError('请填写手机号码');
    }
    if (!util.checkMobile(phonename)) {
      return this._showError('不是有效的手机号码');
    }
    if (!address) {
      return this._showError('请填写详细地址');
    }
    if (!pro_id) {
      return this._showError('请选择省份');
    }
    if (!cit_id) {
      return this._showError('请选择城市');
    }
    if (!ar_id) {
      return this._showError('请选择县区');
    }
    // console.log(fullname, phonename, address, uid, pro_id, city_id, ar_id);
    // if (!fullname || !phonename || !address || !uid || !pro_id || !city_id || !ar_id) { 
    //   wx.showModal({
    //     title: '请填写完整信息！',
    //     showCancel: false,
    //   });
    //   return;
    // } 
      var params = {
        user_name: fullname,
        tel: phonename,
        province: pro_id,
        city: cit_id,
        area: ar_id,
        address: address,
        uid: uid,
        store_id: that.data.store_id
      }
      app.api.postApi('wxapp.php?c=address&a=AddAddress', { params }, (err, resp) => {
        if (err||resp.err_code!=0) {
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: err || resp.err_code,
          })
          return;
        }
        wx.hideLoading();
        wx.showLoading({
          title: '添加地址成功'
        })
        wx.navigateTo({
          url: './address-list'
        })
      })
  
  },
  bindShippingTelephoneChange(e){
    var phone = e.detail.value;
    // if (util.checkMobile(phone)){
      this.setData({
        phonename: phone
      })
    // }else{
      // return;
      // this._showError('请输入正确的手机号');
    // }
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
    var that =this;
    var pro_id = this.data.pro_id;
    let index = parseInt(e.detail.value);
    this.setData({index})
    var provicens_id = that.data.provicens_id;
    if (pro_id == provicens_id[index]){return;}
    pro_id = provicens_id[index];
    that.setData({
      pro_id
    })
    that.loadCity(pro_id);
  },
  bindCityChange(e){
    var that = this;
    var cit_id = that.data.cit_id;
    var cityIndex = parseInt(e.detail.value);
    var city_id = that.data.city_id;
    if (cit_id == city_id[cityIndex]) { return; }
    cit_id = city_id[cityIndex];
    that.setData({cityIndex,cit_id})
    that.loadDirs(cit_id);
  },
  bindDistrictChange(e){
    // 区域信息
    var that = this;
    var ar_id = that.data.ar_id;
    var areaIndex = parseInt(e.detail.value);
    var area_id = that.data.area_id;
    if (ar_id == area_id[areaIndex]) { return; }
    ar_id = area_id[areaIndex];
    this.setData({
      areaIndex, ar_id
    })
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
  },
  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    // wx.showToast({ title: errorMsg, image: '../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
  },
})