// pages/store/store-list.js
var app = getApp();
let phy_id = null;//选择的门店id
const physicalUrl = 'wxapp.php?c=address&a=physical_list';//门店列表老接口
const physicalNewUrl = 'wxapp.php?c=physical&a=physical_list';//门店列表新接口


Page({
  data: {
    pageData: null,        // 门店列表数据
    page: 1,
    physical_list: [],//门店列表
    error: null,
    uid: '',
    sotre_id: '',
    logLat: '',
    prodId: null,
    provinces: null,
    provinId: 0,
    city: null,
    cityId: 0,
    area: null,
    areaId: 0,
    checkType: 1,//弹窗选项，1省份（默认），2城市，3地区
    showModel: false,//是否弹窗
    provinFlag: false,
    cityFlag: false,
    areaFlag: false,
  },
  onLoad: function (options) {
    let that = this;

    let logLat = wx.getStorageSync('logLat') || ['0', '0'],
      { prodId } = options,
      uid = wx.getStorageSync('userUid'),
      store_id = app.store_id;
    phy_id = wx.getStorageSync('phy_id');
    if (prodId) {
      this.setData({ prodId })
    }
    this.setData({
      store_id, uid, logLat
    })
    this.loadAddress(undefined,1,1);
  },
  /**
   * 加载省份,城市，地区
   * opt 接口参数
   * first 1进入页面第一次加载
   * tab  是否是菜单栏点击 1是，0否
   */

  loadAddress(opt,frist,tab) {

    let params = {}, { uid, prodId, logLat } = this.data;
    if (!opt) {
      //通过经纬度获取省份
      params = {
        "position": 1,
        "uid": uid,
        "product_id": prodId,
        "lat": logLat[0],
        "lng": logLat[1],
      }
    } else {
      params = {
        "position": 0,
        "uid": uid,
        "product_id": prodId,
        "province": opt.provinId,
        "city": opt.cityId,
        "area": opt.areaId
      }
    }

    wx.showLoading({
      title: '加载中',
    })
    console.log(params);
    app.api.postApi("wxapp.php?c=order_v2&a=get_physical_list", { params }, (err, resp) => {
      if (err || resp.err_code != 0) { wx.hideLoading();return; }
      let { err_msg } = resp;
      let { provinces, city, area, physical_list } = err_msg;
      if (tab != 1) { 
        //getitem事件
        if (physical_list.length > 0) { 
        this.setData({ physical_list })
         } else { this.setData({ physical_list: [] }) }
      }else{
        //changeitem事件
          if (params.position == 1) {//加载省份
            if (provinces.length > 0) { this.setData({ itemList: provinces, provinFlag: true, cityFlag: true }) }  else {
                this.setData({ provinFlag: false });
              }
            if (frist != 1) { this.setData({ showModel: true})}else{
              if (physical_list.length > 0) {
                this.setData({ physical_list })
              } else { this.setData({ physical_list: [] }) }
            }
          } else {
            if (city.length > 0) {
              this.setData({ itemList: city, cityFlag: true, areaFlag: true,  showModel: true  });
            } else {
              this.setData({ cityFlag: false, areaFlag: false});
            }
            if (area.length > 0 && opt.cityId && !opt.areaId) { this.setData({ itemList: area, showModel: true }) } 
            if (opt.areaId) { this.setData({ showModel: false})}
          }
      }
      wx.hideLoading();

    })
  },
  /** 
   * 弹窗选项事件
  */
  getItem(e) {
    let that = this, checkType = this.data.checkType, opt = {};

    let { provinId, cityId, areaId}=that.data;
    let { id, name } = e.target.dataset;
    that.setData({ showModel: false });
    if (!id || !name) { return; }
    
    switch (checkType) {
      case '1': if (provinId==id){return;} opt.provinId = id; this.setData({ provinId: id, provinces: name, cityId: null, city: '市', areaId: null, area: '区' }); break;
      case '2': if (cityId == id) { return; } opt.provinId = provinId; opt.cityId = id; this.setData({ cityId: id, city: name, areaId: null, area: '区' }); break;
      case '3': if (areaId == id) { return; } opt.provinId = provinId; opt.cityId = cityId; opt.areaId = id; this.setData({ areaId: id, area: name });  break;
      default: opt.provinId = id; this.setData({ provinId: id, provinces: name, cityId: null, city: '市', areaId: null, area: '区'  }); break;
    }
    that.loadAddress(opt);


  },
  /**
   * 切换选项
   */
  changeitem(e) {
    let that = this, { type } = e.currentTarget.dataset, opt = {};
    if (!type) { return };

    that.setData({ checkType: type });

    switch (type) {
      case '1': opt = undefined; break;
      case '2': opt.provinId = that.data.provinId; break;
      case '3': opt.provinId = that.data.provinId; opt.cityId = that.data.cityId; break;
    }

    that.loadAddress(opt,null,1);
  },
  /**
   * 选择门店
   */
  selectPhysical(e) {
    let { index } = e.currentTarget.dataset;
    let that = this;
    var list = that.data.physical_list; var physical_check = [];
    // if(!index){return;}
    list[index].select_physical = (list[index].select_physical == 0 ? 1 : 1);
    var select = list[index].select_physical;
    for (let i = 0; i < list.length; i++) {
      if (i != index) { list[i].select_physical = 0 }
    }
    that.setData({
      physical_list: list,
    })
    physical_check = list[index]; var id = physical_check.phy_id;
    console.log(physical_check);
    setTimeout(() => {
      let pages = getCurrentPages();//当前页面栈
      let prevPage = pages[pages.length - 2];  //上一个页面
      prevPage.setData({ pickupPhy: physical_check, pickupStoreId: id });
      wx.navigateBack();//返回上一页
    }, 500);
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
  /**
* 显示错误信息
*/
  _showError(errorMsg) {
    this.setData({ error: errorMsg });
    setTimeout(() => {
      this.setData({ error: null });
    }, 1000);
    return false;
  },
  cancelCoupon(){
    this.setData({ showModel:false})
  }
})