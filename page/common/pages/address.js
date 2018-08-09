import { checkMobile } from '../../../utils/util';
let app = getApp();
const editAddressUrl = 'wxapp.php?c=address&a=EditAddress';//修改保存
const addAddressUrl = 'wxapp.php?c=address&a=AddAddress';//添加保存
const getAreaUrl = 'wxapp.php?c=address&a=getarea';//城市数据
const findAddressUrl = 'wxapp.php?c=address&a=FindAddress';//修改地址
const getPrivUrl = 'wxapp.php?c=address&a=getProvincess';//省份数据
Page({
  data: {
    store_id: app.store_id,
    uid: '',
    isDefault: false,   // 是否为默认地址
    index: '',
    fullname: '',//收货人
    phonename: '',//手机号
    address: '',//详细地址
    address_id:'',//地址id
    provicens_id: '',//省份号列表
    city_id: '',//城市号列表
    area_id: '',//县区号列表
    provicens_list: '',
    city_list: '',
    area_list: '',
    cityIndex: '',
    areaIndex: '',
    pro_id: '',//省份号
    cit_id: '',//城市号
    ar_id: '',//县区号
    addressiinfo: '',//收货地址列表对象
    revamp: '',
    error: false,//是否显示错误提示模板
  },
  /**
   * 保存修改地址
   */
  saveRevamp(e) {
    var that = this;
    var uid = that.data.uid;
    // 如果未更改
    var address_id = e.currentTarget.dataset.addressId;
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
      peo_phone = phonename
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
    if (!this.checkAddress()) { return; }
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
    app.api.postApi(editAddressUrl, { params }, (err, resp) => {
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
  saveAddress(e) {
    var that = this;
    var fullname = that.data.fullname;
    var phonename = that.data.phonename;
    var address = that.data.address;
    var uid = that.data.uid;
    var pro_id = that.data.pro_id;
    var cit_id = that.data.cit_id;
    var ar_id = that.data.ar_id;
    if (!this.checkAddress()){return;}
    if (fullname && phonename && address && uid && pro_id && cit_id && ar_id) {
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
      app.api.postApi(addAddressUrl, { params }, (err, resp) => {

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
    } else {
      this._showError('请完善信息！')
    }

  },
  bindShippingTelephoneChange(e) {
    var phonename = e.detail.value;
    if (checkMobile(phonename)){

      this.setData({
        phonename: e.detail.value
      })
    }else{
      this._showError('请填写正确的手机号！')
    }
  },
  bindFullnameChange(e) {
    this.setData({
      fullname: e.detail.value
    })
  },
  bindAddressChange(e) {
    this.setData({
      address: e.detail.value
    })
  },
  bindPickerChange(e) {
    var that = this;
    this.setData({
      index: e.detail.value
    })
    var index = that.data.index;
    var provicens_id = that.data.provicens_id;
   
    // 选择某省份时候对应的id
    var pro_id = provicens_id[index];
 
    // 获取对应城市
    var params = {
      id: pro_id
    }
    var addressiinfo = that.data.addressiinfo;
    if(addressiinfo){
      addressiinfo.city = '';
      addressiinfo.city_txt = '';
      addressiinfo.area = '';
      addressiinfo.area_txt = '';
      that.setData({
        pro_id,
        addressiinfo
      })
    }else{
      that.setData({
        pro_id
      })
    }
    
    var city_list = [];
    var city_id = [];
    app.api.postApi(getAreaUrl, { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
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
  bindCityChange(e) {
    var that = this;
    this.setData({
      cityIndex: e.detail.value
    })
    var cityIndex = that.data.cityIndex;
    var city_id = that.data.city_id;
    // 选择某城市时候对应的id
    var cit_id = city_id[cityIndex];
    var addressiinfo = that.data.addressiinfo;
    if(addressiinfo){
      addressiinfo.area = '';
      addressiinfo.area_txt = '';
      that.setData({
        cit_id,
        area_list: '',
        area_id: '',
        areaIndex: '',
        addressiinfo
      })
    }else{
      that.setData({
        cit_id
      })
    }
    
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
        console.log(area_list, 'area_list')
        that.setData({
          area_id,
          area_list
        })
      }
    });
  },
  bindDistrictChange(e) {
    // 区域信息
    var that = this;
    this.setData({
      areaIndex: e.detail.value
    })
    var areaIndex = that.data.areaIndex;
    var area_id = that.data.area_id;
    // 选择某区域时候对应的id
    var ar_id = area_id[areaIndex];
    that.setData({
      ar_id
    })
  
  },
  onLoad: function (options) {
    console.log(options, '修改地址')
    var that = this;
    let store_id = that.data.store_id;//store_id
    // 进入修改地址
    var revamp = options.revamp;
    // 修改地址
    if (revamp == 1) {
      var uid = options.uid;
      var address_id = options.address_id;
      that.setData({
        revamp: 1, uid, address_id
      })
      console.log('uid.address_id', address_id, uid)
      var params = {
        uid, address_id
      }
      app.api.postApi(findAddressUrl, { params }, (err, resp) => {
        if (err) {
          return;
        }
        if (resp.err_code == 0) {
          console.log(resp.err_msg, '修改地址时的数据')
          var addressiinfo = resp.err_msg.addressiinfo;
          var { name, address, address_id, tel, area, city, province} = addressiinfo;
          that.setData({
            addressiinfo,
            fullname:name,
            phonename:tel,
            address:address,
            pro_id: province,//省份号
            cit_id: city,//城市号
            ar_id: area ,//县区号
          })
        }
      });
    }
    // 修改地址结束
    var provicens_list = [];
    var provicens_id = [];
    // Api.signin();//获取以及存储openid、uid
    // 获取uid
    var uid = wx.getStorageSync('userUid');
    console.log(uid, store_id);
    that.setData({ uid });
    //  加载省份信息
    app.api.postApi('wxapp.php?c=address&a=getProvinces', {}, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log('省份信息', resp.err_msg);
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
  onSetDefault(){
    var that = this;
    this.setData({
      isDefault: !that.data.isDefault
    });

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  bindIsDefaultChange() {
    var that=this;
    this.setData({
      isDefault: !that.data.isDefault
    });
  },
  /**
   * 校验地址输入
   */
  checkAddress() {
    var that = this;
    var fullname = that.data.fullname;
    var phonename = that.data.phonename;
    var address = that.data.address;
    var uid = that.data.uid;
    var pro_id = that.data.pro_id;
    var cit_id = that.data.cit_id;
    var ar_id = that.data.ar_id;
    var address_id = that.data.address_id;

      // if (address_id) return true;   // 有选了地址
      // else {
      //   return this._showError('请先新增收货地址');
      // }
      // 新增地址，校验输入，ps：这个需求已被更改，不需要了，故以下代码注销
      if (!fullname) {
        return this._showError('请填写收货人姓名');
      }
      if (!phonename) {
        return this._showError('请填写手机号码');
      }
      if (!checkMobile(phonename)) {
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
      return true;
  },
  _showError(errorMsg) {
    // wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
})