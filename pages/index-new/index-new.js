// pages/index-new/index-new.js 
import { getUrlQueryParam } from '../../utils/util';
import { sign } from '../../utils/api_2';
// sign.signin(sign.getLocation);

let app = getApp();



let store_id = app.store_id;
let uid = app.globalData.uid;
let openid = app.globalData.openid;
let hasSignin = app.globalData.hasSignin;
let logLat = app.globalData.logLat;




const couponUrl = 'wxapp.php?c=activity&a=new_user_coupon';//领取优惠券接口
const couponListUrl = 'wxapp.php?c=activity&a=index_hot_coupon';//优惠券列表数据
const myCardUrl = 'wxapp.php?c=coupon&a=my_card_num';//我的卡包接口
const activityUrl = 'wxapp.php?c=index_activity&a=activity_index';//活动页接口
const tabUrl = 'wxapp.php?c=category&a=get_category_by_pid_new';//tab接口地址
const headImg = 'wxapp.php?c=product&a=banner_list';//轮播图接口
const physicalUrl = 'wxapp.php?c=physical&a=physical_list';//las门店列表接口
const physicalMainUrl = 'wxapp.php?c=physical&a=main_physical';//总店信息
let checkTimer = null;     // 若还没登录，启用定时器



Page({
  /**
   * 页面的初始数据
   */
  data: {
    mode: app.globalData.image.mode,
    lazyLoad: app.globalData.image.lazyLoad,
    scroll_top: 0,
    goTop_show: false,

    hotData: [], //热点推荐数据
    groupData: [], //拼多多
    secKillData: [], //秒杀
    showTime: 0, //第几点场
    type: 0, //请求的活动点的时间戳
    index: 0, //跳到秒杀列表页的索引
    countDown: 0, //活动剩余时间
    expireTime: 0,//活动失效时间
    dataImg: [],//首页轮播图数据
    showhide: true,
    cat_list: [],

    //2017年12月21日18:50:42 by leo
    card_num: 0,
    uid,//用户id


    iconOne: [],
    //indexImage: null,//4个大图图片列表
    showModel: false,//是否显示弹窗模板
    couponList: [],//弹窗专用券列表
    coupon_id_arr: [],//弹窗优惠券id
    couponValue: [],//领取优惠券面值列表
    couponValueLast: [],
    productData: [],//活动图列表
    valueList: ['正品保障', '假一赔三', '破损包邮', '7天退换'],
    saoma_url: null,
    set_flag: false,//是否設置為默認
    physicalClost: '',//最近门店信息
    phyDefualt:[],//默认门店信息
    changeFlag:true,//是否切换门店
    indexIcon: null, //首页图标
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('logLat....', logLat);
    //=====
    var that = this;
    this.loadMainLocation();
      wx.showLoading({
        title: '加载中',
      })
      if (logLat == '' || uid== ''){
        sign.signin(()=>{
          sign.getLocation((res)=>{
              logLat = wx.getStorageSync('logLat');
              uid = wx.getStorageSync('userUid');
              openid = wx.getStorageSync('userOpenid');
              hasSignin = wx.getStorageSync('hasSignin');
              app.globalData.logLat = logLat;
              app.globalData.openid = openid;
              app.globalData.uid = uid;
              app.globalData.hasSignin = hasSignin;
              that.loadLocation('logLat坐标信息', logLat);//获取门店信息
              that.getCoupValue();//优惠券数据
              that.loadactivityData();//活动图数据
              that.loadMyCardNumData(); //我的卡包数量
              console.log('index....logLat', logLat);
          })
        });
      } else{
        that.loadLocation('logLat坐标信息', logLat);//获取门店信息
        that.getCoupValue();//优惠券数据
        that.loadactivityData();//活动图数据
        that.loadMyCardNumData(); //我的卡包数量
      }
     
    /******首页弹窗 */
    this.firstOpen();

    // 顶部轮播图
    app.api.postApi(headImg, { "params": { store_id } }, (err, resp) => {
      if (resp && resp.err_code == 0) {
        var dataImg = resp.err_msg.banners;
        that.setData({
          dataImg
        })
      }
    })
    // //indexImage获取
    // app.api.postApi('wxapp.php?c=index&a=get_image', { "params": { store_id } }, (err, rep) => {
    //   if (!err && rep.err_code == 0) {
    //     this.setData({
    //       indexImage: rep.err_msg.icon_list
    //     })
    //   }
    // })

    app.api.postApi('wxapp.php?c=index&a=get_icon_v2', { "params": { store_id } }, (err, rep) => {
      //console.log('图标',rep);
      if (!err && rep.err_code == 0) {
        this.setData({
          indexIcon: rep.err_msg.icon_list
        })
      }
    })

  
  },
  /**
   * 优惠券面值列表
   */
  getCoupValue() {
    app.api.postApi(couponListUrl, {
      "params": {
        uid,
        store_id,
        "page": 1
      }
    }, (err, rep) => {
      if (rep.err_code != 0) {
        return;
      }
      var couponValue = rep.err_msg.list;
      var list = [];
      var len = couponValue.length - 1;
      for (let i = 0; i < len; i++) {
        list.push(couponValue[i]);
      }
      this.setData({
        "couponValue": list,
        "couponValueLast": couponValue[len]
      })
    })
  },
  /**
   * 马上领取优惠券
   */
  getValue(e) {
    console.log('catch:e....', e)
    let { id, source, activityId } = e.currentTarget.dataset;
    var url = `../card/card_summary?page=index&id=${id}&source=${source}&activityId=${activityId}`;
    wx.navigateTo({
      url,
    })
  },
  /**
   * 門店設置默認
   */
  setClick() {
    var set_flag = !this.data.set_flag;
    this.setData({ set_flag });
  },
  /**
   * 扫码购
   */
  saoma() {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var url = res.result;
        if (wx.openBluetoothAdapter) {
          wx.hideTabBar();
          that.setData({
            saoma_url: url
          })
        } else {
          // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }


      },
      fail: () => {
        that._showError('请重新扫码');
      }
    })
  },
  /**
   * 设置当前门店
   */
  setLocation(opt) {
    this.setData({
      physicalClost: opt
    })
  },
  /**
   * 获取总店信息
   */
  loadMainLocation(){
    let that = this;
    let phyDefualt = that.data.phyDefualt;
     var url = physicalMainUrl;
     var  params = {
        store_id
      };
     app.api.postApi(url, { params }, (err, resp) => {
       // 列表数据
       wx.hideLoading();
       if (resp.err_code != 0) {
         return;
       }
       phyDefualt = resp.err_msg.physical_list[0];
       console.log('phyDefualt', phyDefualt);
       wx.setStorageSync('phy_id', phyDefualt.phy_id);
       that.setData({
         physicalClost: phyDefualt
       })
     });
  },
  /**
   * 获取当前门店位置
   */
  loadLocation(phy_id, logLat) {
    var that = this;
    var phyDefualt = that.data.phyDefualt;
    if(logLat == '' || logLat==null){
      app.globalData.logLat = wx.getStorageSync('logLat');
      logLat = wx.getStorageSync('logLat');
    }
    console.log('loglat........', logLat);
    if (!logLat){
      that.setData({ changeFlag:false })
      return;
      }
    wx.showLoading({
      title: '加载中'
    });
    var params = {
      uid,
      store_id,
      page: '1',
      long: logLat[0],
      lat: logLat[1]
    }
    var url = physicalUrl;
 
    app.api.postApi(physicalUrl, { params }, (err, resp) => {
      // 列表数据
      wx.hideLoading();
      if (resp.err_code != 0) {
        return;
      }
      var list = resp.err_msg.physical_list;
      for (var j = 0; j < list.length; j++) {
        if (list[j].select_physical == "1") {
          phyDefualt = list[j];
        }
      }
      if(phyDefualt.length == 0){phyDefualt= list[0];}
      that.setData({
        physicalClost: phyDefualt
      })
    });
  },
  /**
   * 消息推送
   */
  sub(e) {
    app.pushId(e);
  },
  submit() {
    app.submit();
  },
  send() {
    app.send();
  },
  /*
  *首次打开小程序事件
  *
  */
  firstOpen() {
    var that = this;
    var params = {
      uid,
      store_id,
      "page": 1
    };
    app.api.postApi(couponUrl, { params }, (err, rep, statusCode) => {
      console.log('优惠券data', rep);
      if (statusCode != 200) {
        console.log('服务器有错，请联系后台人员'); return;
      }
      var showModel = that.data.showModel;
      var couponList = that.data.couponList;
      var coupon_id_arr = that.data.coupon_id_arr;
      if (!err && rep.err_code == 0) {
        showModel = rep.err_msg.is_show == 1 ? true : false;
        couponList = rep.err_msg.list;
        couponList.forEach((item) => {
          if (item.id) {
            coupon_id_arr.push(item.id);
          }
        });
      } else {
        showModel = false;
        wx.showModal({
          title: '提示',
          content: err || rep.err_msg,
        })
      }
      that.setData({ showModel, couponList, coupon_id_arr });
    })

  },
  /**
   * 新用户领券
   */
  getCoupon() {
    var that = this;

    that.setData({ showModel: false });
    var url = 'wxapp.php?c=activity&a=get_coupon';
    if (that.data.coupon_id_arr.length < 1) {
      wx.showToast({
        title: '没有相关的优惠券领取',
      }); return;
    }
    var params = {
      uid,
      store_id,
      "coupon_id_arr": that.data.coupon_id_arr
    }
    app.api.postApi(url, { params }, (err, rep, statusCode) => {
      if (statusCode !== 200) { console.log('新人领券接口错误，联系后台'); return; }
      if (!err && rep.err_code == 0) {
        wx.showModal({
          title: '恭喜',
          content: '刚领取的所有券已放到“我的——卡包”',
          cancelText: '我知道了',
          confirmText: '去查看',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({ url: '../card/mycard' });
            } else if (res.cancel) {

            }
          }
        })
      } else {
        wx.showToast({
          title: rep.err_msg,
        })
      }
    })

  },
  cancelCoupon() {
    var that = this;
    that.setData({ showModel: false })
    var url = 'wxapp.php?c=activity&a=set_show';
    var params = {
      uid,
      store_id
    };
    app.api.postApi(url, { params }, (err, rep, statusCode) => {
      if (statusCode != 200) {
        console.log('取消领取新人优惠券接口有错误，请联系后台人员'); return;
      }
      if (!err && rep.err_code == 0) {
        console.log("取消成功");
      }
    })
  },

  goCardLists() {
    wx.navigateTo({
      url: '../card/mycard',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCoupValue();//优惠券数据
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopCountDown();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 若还没登录，启用定时器
   */
  _prepare() {
    var that = this;
    clearInterval(checkTimer);
    checkTimer = setInterval(() => {
      if (hasSignin) {
        clearInterval(checkTimer);
        

        //拼团数据
        //热门数据
        //this.loadHotData();
        //this.loadData();    // 加载数据，关闭定时器
        //秒杀数据
        // this.loadSecKillData();
      }
    }, 1000);
  },
  //返回顶部功能
  goTopFun() {
    this.setData({
      scroll_top: 0
    });
  },
  //显示 返回顶部 图标
  scrollTopFun(e) {
    if (e.detail.scrollTop > 300) {
      this.setData({
        'goTop_show': true
      });
    } else {
      this.setData({
        'goTop_show': false
      });
    }
  },
  showError(){
    var msg =`你已经领过该券了，试试领其他的`;
    this._showError(msg);
  },

  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  //点击事件banner菜单
  clickGo: function (e) {
    var {index} = e.currentTarget.dataset;
    index = index - 1;
    //跳链数组:门店活动，领券，新品试用，附近门店
    var url = [`./index-activity`, `./index-mom`, `../present/present`, `../store/store-list`];
    console.log(url[index]);
    if (url[index]) {
      wx.navigateTo({ url: url[index] + '?categoryid=100&page=1&store_id=' + store_id });
    }
  },
  getProductData(categoryid) {
    var params = {
      store_id, //店铺id
      page: '1',
    };
    app.api.postApi(activityUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      console.log('活动图列表数据',err,resp);
      let { err_code, err_msg } = resp;
      if (err_code != 0) {
          return this._showError('数据有错！');
      }
      let { err_msg: { acrivity_element = [] } } = resp, list = [];
      let j = acrivity_element.length > 4 ? 4 : acrivity_element.length;
      for (var i = 0; i < j; i++) {
        list.push(acrivity_element[i]);
      }
      this.setData({ productData: list });

    });
  },

  loadMyCardNumData: function () {
    var params = {
      uid,
      store_id
    }
    app.api.postApi(myCardUrl, { params }, (err, response) => {
      if (err || response.err_code != 0) return;
      var card_num = response.err_msg.card_num;
      this.setData({ card_num });
    });
  },

  /**
 * 首页精选活动数据
 */
  loadactivityData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    this.getProductData();
  },
  /**
   * 精选活动跳链
   */
  areaClickGo(e) {
    let { type ,id } = e.currentTarget.dataset;
    console.log(type);
    switch (type) {
      case "1": var url = `../activity/hotsale?categoryid=100&page=1&store_id=${store_id}`; break;
      case "2": var url = `./shop-list?categoryid=100&page=1&store_id=${store_id}&title=爆款专区`; break;
      case "3": var url = `./poster-detail?type=${type}&id=${id}`; break;
    }
    if (url) {
      wx.navigateTo({
        url,
      })
    }
  },
  //跳到爆款商品页
  clickGoBaoKuan: function (e) {
    var { categoryid, page = "1", store_id = store_id } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-baokuan?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id
    })
  },
  //跳到热销商品页
  clickGoHotSale: function (e) {
    var { categoryid, page = "1", store_id = store_id } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-hotsale?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id
    })
  },
  //跳到百货商品页
  clickGoGoods: function (e) {
    var { categoryid, page = "1", store_id = store_id } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-goods?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id
    })
  },
  //跳到活动（节日）商品页
  clickGoFestival: function (e) {
    var { categoryid, page = "1", store_id = store_id } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-festival?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id
    })
  },
  //跳到热门推荐商品页
  clickGoHotProduct: function (e) {
    var prodId = e.currentTarget.dataset.prodid; //商品ID
    var cateId = e.currentTarget.dataset.cateid; //商品分类ID
    wx.navigateTo({
      url: '../shopping/goods-detail?prodId=' + prodId
    })
  },


  /**
   * 倒计时处理
   */
  startCountDown(expireTime) {
    this.timer = setInterval(() => {
      let now = new Date().getTime();
      let leftTime = (expireTime - now) / 1000;
      if (leftTime < 0) {
        //replaceData.splice(i, 1);   // 到了失效时间，从活动里删除
        //continue;
      }
      var countDown = this.countDown(leftTime);
      this.setData({ countDown });
    }, 1000);
  },
  /**
   * 停止倒计时
   */
  stopCountDown() {
    this.timer && clearInterval(this.timer);
  },

  /**
   * 格式化倒计时显示
   */
  countDown(leftTime) {
    let day = parseInt(leftTime / 24 / 60 / 60);
    let hour = parseInt((leftTime - day * 24 * 60 * 60) / 60 / 60);
    let minute = parseInt((leftTime - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
    let second = parseInt(leftTime - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;

    return { day, hour, minute, second };
  },

})