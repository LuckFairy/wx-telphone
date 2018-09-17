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
    provinces:null,
    provinId:0,
    city:null,
    cityId:0,
    area:null,
    areaId:0,
    checkType:1,//弹窗选项，1省份（默认），2城市，3地区
    showModel:false,//是否弹窗
    provinFlag:false,
    cityFlag:false,
    areaFlag:false,
  },
  onLoad: function (options) {
    let that =this;
    
    let logLat = wx.getStorageSync('logLat') || ['0', '0'],
     { prodId } = options, 
     uid = wx.getStorageSync('userUid'), 
     store_id = app.store_id;
    phy_id = wx.getStorageSync('phy_id');
    if(prodId){
      this.setData({ prodId})
   }
    this.setData({
      store_id, uid, logLat
    })
    this.loadAddress();
  },
  /**
   * 加载省份,城市，地区
   */
  loadAddress(opt){
    let params = {}, { uid, prodId, logLat}=this.data;
    if(!opt){
      //通过经纬度获取省份
      params = {
        "position": 1,
        "uid": uid,
        "product_id":prodId,
        "lat": logLat[0],
        "lng": logLat[1],
      }
    }else{
      params = {
        "position": 0,
        "uid": uid,
        "product_id": prodId,
        "province": opt.provinId,
        "city": opt.cityId,
        "area": opt.areaId
      }
    }
    app.api.postApi("wxapp.php?c=order_v2&a=get_physical_list", { params }, (err, resp) => {
      if(err||resp.err_code!=0){return;}
      let { err_msg}=resp;
      let { provinces, city, area, physical_list}=err_msg;
      if (provinces.length > 0) { this.setData({ itemList: provinces,  provinFlag:true})}else{
        this.setData({ provinFlag: false });
      }
      if (city.length > 0) { this.setData({ itemList: city,  cityFlag:true})}else{
        this.setData({ cityFlag:false});
      }
      if (area.length > 0) { this.setData({ itemList: area, areaFlag:true})}else{
        this.setData({ areaFlag: false });
      }
      if(physical_list.length>0){this.setData({physical_list})}
    })
  },
  /** 
   * 弹窗选项事件
  */
  getItem(e){
    let that = this, checkType = this.data.checkType,opt={};
    let {id,name} = e.target.dataset;
    that.setData({ showModel:false});
    if(!id||!name){return;}
    console.log(id,name)
    switch (checkType){
      case '1': opt.provinId = id; this.setData({ provinId: id, provinces:name});break;
      case '2': opt.cityId = id; this.setData({ cityId: id ,city:name});break;
      case '3': opt.areaId = id; this.setData({ areaId: id, area: name });break;
    }
    that.loadAddress(opt);
  },
  /**
   * 切换选项
   */
  changeitem(e){
    let that = this,{type} = e.currentTarget.dataset;
    if(!type){return};
    that.setData({ checkType: type, showModel: true});
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
})