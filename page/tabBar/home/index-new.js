import { getLocation } from '../../../utils/util.js';
import { firstOpen, getCoupon, cancelCoupon  } from '../../common/template/coupon.js';
let app = getApp();
const couponListUrl = 'wxapp.php?c=activity&a=index_hot_coupon';//优惠券列表数据
const myCardUrl = 'wxapp.php?c=coupon&a=my_card_num';//我的卡包接口
const activityUrl = 'wxapp.php?c=index_activity&a=jx_activity';//精选活动（第三版）
const activityNewUrl = 'screen.php?c=index&a=activity_index';//大屏首页取代活动页
const activityUrl_v1 = "wxapp.php?c=index_activity&a=jx_activity_v2";//精选活动（第二版）
const activityUrl_v2 = 'wxapp.php?c=index_activity&a=jx_activity_v3'; //精选活动（第三版）
const tabUrl = 'wxapp.php?c=category&a=get_category_by_pid_new';//tab接口地址

const headImg_v3 = 'wxapp.php?c=product&a=banner_list_v3'; //轮播图接口（第三版）
const headImg_v4 = 'wxapp.php?c=product&a=banner_list_v4'; //轮播图接口（第四版）
const physicalUrl = 'wxapp.php?c=address&a=getaphysical'; //獲取門店
const physicalMainUrl = 'wxapp.php?c=physical&a=main_physical'; //总店信息
const pintuanUrl = 'wxapp.php?c=tuan_v2&a=tuan_index';//拼团活动列表
const iconUrl = "wxapp.php?c=index&a=get_icon_v3";//栏目地址


let store_id = app.store_id;
let uid = wx.getStorageSync('userUid');
let openid = wx.getStorageSync('userOpenid');
let hasSignin = wx.getStorageSync('hasSignin');
let logLat = wx.getStorageSync('logLat');

let locationid = null;//门店屏id
Page({
  data: {
    infoFlag: app.globalData.info_flag,
    random: parseInt(40 * Math.random()),//随机数
    phoneFlag:false,//true手机弹窗，false不弹窗
    showpopteamModle: false,//true有拼团信息，弹窗
    popteamData: null,//弹窗拼团信息
    popteamNicke: null,//弹窗名字
    popteamUrl: '../../group-buying/group-join',


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
    valueList: [{ txt: '正品保障', src: './imgs/card-1.png' }, { txt: '假一赔三', src: './imgs/card-2.png' }, { txt: '破损包邮', src: './imgs/card-3.png' }, { txt: '7天退换', src: 'imgs/card-4.png' }],
    saoma_url: null,
    set_flag: false,//是否設置為默認
    physicalClost: '',//最近门店信息
    phyDefualt: [],//默认门店信息
    changeFlag: true,//是否切换门店
    indexIcon: null, //首页图标
  },
  /**获取用户信息 */
  getuserinfo(e) {
    app.globalData.userInfo = e.detail.userInfo;
    wx.setStorageSync("userInfo", e.detail.userInfo);
    this.setData({ infoFlag: false });
    var that = this;
    locationid = wx.getStorageSync('locationid');
    console.log('getuserinfo....locationid', locationid);
    app.login(e.detail, function () {
      //  wx.setStorageSync('userUid', "94810");//存储uid
      that.setData({ infoFlag: true });
      app.globalData.info_flag = true;
    }, locationid);
  },

  /**
   * 
  * 提交订单
  */
  submitOrder: function (e) {
    console.log('formid')
    let that = this;
    //保存formid
    app.pushId(e).then(ids => {
      app.saveId(ids)
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    uid = wx.getStorageSync('userUid');
    wx.showLoading({
      title: '加载中',
    })
    if (uid) {
      that.setData({ uid, infoFlag: false });
      that._parse();
    } else {
      var i = 0;
      that.timer2 = setInterval(() => {
        i++;
        uid = wx.getStorageSync('userUid');
        if (uid || i > 3) { that.setData({ uid, infoFlag: false });that._parse();clearInterval(that.timer2); }
      }, 4000);
    }
    that.loadGroupData();//拼多多数据

    app.api.postApi(iconUrl, { "params": { store_id } }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        this.setData({
          indexIcon: rep.err_msg.icon_list
        })
      }
    })
    /**弹窗拼团信息**/
    app.loadJumpPin().then(data => {
      let len = data.length, i = 0;
      if (len < 1) { return; }
      var popteamNicke = (data[i].user.nickname.length > 4) ? (data[i].user.nickname.substr(0, 4) + '...') : data[i].user.nickname;
      that.setData({ popteamData: data[i], popteamNicke });
      clearInterval(timer);
      let timer = setInterval(() => {
        i++;
        if (i == len) i = 0;
        var popteamNicke = (data[i].user.nickname.length > 4) ? (data[i].user.nickname.substr(0, 4) + '...') : data[i].user.nickname;
        that.setData({ popteamData: data[i], popteamNicke });
      }, 4000);
      that.setData({ showpopteamModle: true });
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadMyCardNumData(); //我的卡包数量
    // this.getCoupValue();//优惠券数据
    
  },
  _parse() {
    console.log('_parse');
    let that = this;
    wx.hideLoading();
    that.getCoupValue();//优惠券数据
    that.jumpCoupon();/******首页弹窗 */
    
    //是否定位成功
    getLocation().then(data => {
      logLat = data;
      that.loadLocation();
    }).catch(err => {
      that.loadMainLocation();
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
      var len = couponValue.length > 3 ? 3 : couponValue.length;
      for (let i = 0; i < len; i++) {
        list.push(couponValue[i]);
      }
      this.setData({
        couponValue: list,
        // couponValueLast: couponValue[len-1]
      })
    })
  },
  /**
   * 马上领取优惠券
   */
  getValue(e) {
    console.log('catch:e....', e)
    let { id, source, activityId } = e.currentTarget.dataset;
    var url = `../../common/pages/card_summary?page=index&id=${id}&source=${source}&activityId=${activityId}`;
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
  loadMainLocation() {
    let that = this;
    let phyDefualt = [];
    var url = physicalMainUrl;
    var params = {
      store_id
    };
    wx.showLoading({
      title: '加载中'
    });
    new Promise(resolve => {
      app.api.postApi(url, {
        params
      }, (err, resp) => {
        // 列表数据
        wx.hideLoading();
        if (resp.err_code != 0) {
          //that.setData({changeFlag: false});//总店没有返回值
          return;
        }
        phyDefualt = resp.err_msg.physical_list[0];
        that.setData({
          physicalClost: phyDefualt
        })
        resolve(phyDefualt);
      });
    }).then(data => {
        wx.setStorageSync('phy_id', data.phy_id);
        that.loadHeadicon(data.phy_id); //首页轮播图
        that.loadactivityData(data.phy_id); //活动图数据
        that.setData({ physicalClost: data })
      })
  },
  /**
   * 获取当前门店位置
   */
  loadLocation() {
    let that = this;
    let phyDefualt = [];
    wx.showLoading({
      title: '加载中'
    });
    var params = {
      uid,
      store_id,
      long: logLat[0],
      lat: logLat[1]
    }
    app.api.postApi(physicalUrl, {
      params
    }, (err, resp) => {
      // 列表数据
      wx.hideLoading();
      if (resp.err_code != 0) {
        console.log(resp.err_msg);
        //that.setData({ changeFlag: false });//总店没有返回值
        return;
      }
      var list = resp.err_msg.physical_info;
      wx.setStorageSync('phy_id', list.pigcms_id);
      that.loadHeadicon(list.pigcms_id); //首页轮播图
      that.loadactivityData(list.pigcms_id); //活动图数据
      that.setData({ physicalClost: list })
    });
  },
  /**顶部轮播图  **/
  loadHeadicon(phy_id, flag) {
    let that = this;
    var flag = flag || wx.getStorageSync("phy_flag");
    if (flag) {
      var params = {
        store_id, //店铺id
        physical_id: phy_id,
        uid,
      },
        headImg = headImg_v4;
    } else {
      var params = {
        store_id, //店铺id
        uid,
      },
        headImg = headImg_v3;
    }

    app.api.postApi(headImg, {
      params
    }, (err, resp) => {
      if (resp.err_code == 0) {
        var dataImg = resp.err_msg.banners;
        console.log('轮播图。。。', dataImg)
        that.setData({
          dataImg
        })
      }
    })
  },
  /**
   * 首页精选活动数据
   */

  loadactivityData(phy_id, flag) {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    var flag = flag || wx.getStorageSync("phy_flag");
    if (flag) {
      var params = {
        store_id, //店铺id
        physical_id: phy_id,
        uid,
        page: '1',
      },
        activityUrl = activityUrl_v2;
    } else {
      var params = {
        store_id, //店铺id
        uid,
        page: '1',
      },
        activityUrl = activityUrl_v1;
    }

    app.api.postApi(activityUrl, {
      params
    }, (err, resp) => {
      console.log('精选活动=', resp);
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let {
        err_code,
        err_msg
      } = resp;
      if (err_code != 0) {
        console.error(activityUrl, resp.err_msg);
        return;
      }

      this.setData({
        productData: resp.err_msg.acrivity_element
      });

    });
  },
  /*
  *首次打开小程序事件
  *
  */
  jumpCoupon() {
    var that = this;
    var params = {
      uid,
      store_id,
      "page": 1
    };
    firstOpen(params).then(data => {
      that.setData(data);
    });


  },
  /**
   * 新用户领券
   */
  getCoupon() {
    var that = this;
    that.setData({ showModel: false });

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
    getCoupon(params);


  },

  cancelCoupon() {
    var that = this;
    that.setData({ showModel: false })

    var params = {
      uid,
      store_id
    };
    cancelCoupon(params);

  },

  goCardLists() {
    wx.navigateTo({
      url: '../../common/pages/mycard',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  //跳到拼多多列表页
  clickGoGroup: function () {
    wx.navigateTo({
      url: '../../group-buying/grouplist',
    })
  },
  //咿呀拼多多三条数据
  loadGroupData: function () {
    wx.showLoading({ title: '加载中' });
    app.api.postApi(pintuanUrl, { "params": { store_id } }, (err, rep) => {
      wx.hideLoading();
      if (err || rep.err_code != 0) return;
      var data = rep.err_msg;
      this.setData({ groupData: data });
    });
  },
  //跳到拼团商品页
  clickGoGroupProduct: function (e) {
    var { prodid, tuanid, quantity } = e.currentTarget.dataset;//商品id,团购id，数量
    if (quantity > 0) {
      var sellout = 1;
    } else {
      var sellout = 0;
    }
    var url = '../../group-buying/group-buying?prodId=' + prodid + '&tuanId=' + tuanid + '&sellout=' + sellout;
    wx.navigateTo({ url });
  },

  //跳到秒杀列表页
  clickGoSecKill: function (e) {
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../../group-buying/index-seckill?type=' + type + '&index=' + index
    })

  },
  //跳到秒杀商品页
  clickGoSecKillProduct: function (e) {
    var prodId = e.target.dataset.prodid; //商品ID
    var productPrice = e.target.dataset.productprice; //商品原来价格
    var skPrice = e.target.dataset.skprice; //商品秒杀价格
    var expireTime = e.target.dataset.expiretime; //商品秒杀失效时间
    var expireTime = e.target.dataset.expiretime; //商品剩余的数量
    //这里过去的商品，都是进行中的
    var activityStatus = 2;
    var quantity = e.target.dataset.quantity; //商品的剩余数量
    var pskid = e.target.dataset.pskid; //秒杀产品ID  
    wx.navigateTo({
      url: '../../common/pages/goods-detail?prodId=' + prodId + '&productPrice=' + productPrice + '&skPrice=' + skPrice + '&activityStatus=' + activityStatus + '&expireTime=' + expireTime + '&quantity=' + quantity + '&pskid=' + pskid
    })
  },

  /**
   * 若还没登录，启用定时器
   */
  _prepare() {
    var that = this;

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
  showError() {
    var msg = `你已经领过该券了，试试领其他的`;
    this._showError(msg);
  },

  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  //点击事件banner菜单
  clickGo: function (e) {
    var { index } = e.currentTarget.dataset;
    index = index - 1;
    //跳链数组:门店活动，领券，新品试用，附近门店,母婴服务
    var url = [`../../common/pages/index-activity`, `../../common/pages/index-mom`, `../../home/pages/present`, `../../common/pages/store-list`, '../../common/pages/index-boabao', '../../common/pages/activity-detail'];
    console.log(url[index]);
    if (url[index]) {
      wx.navigateTo({ url: url[index] + '?categoryid=100&page=1&store_id=' + store_id });
    }
  },


  loadMyCardNumData: function () {
    var uid = this.data.uid, params = {}, that = this;
    if (uid) {
      params = {
        uid,
        store_id,
      }
      app.api.postApi(myCardUrl, { params }, (err, response) => {
        if (err || response.err_code != 0) return;
        var card_num = response.err_msg.card_num;
        this.setData({ card_num });
      });
    } else {
      clearInterval(that.timer3);
      var i = 0;
      that.timer3 = setInterval(() => {
        uid = wx.getStorageSync('userUid');
        i++;
        this.loadMyCardNumData(); //我的卡包数量
        if (uid || i > 3) {
          clearInterval(that.timer3);
          params = {
            uid: uid,
            store_id,
          }
          app.api.postApi(myCardUrl, { params }, (err, response) => {
            if (err || response.err_code != 0) return;
            var card_num = response.err_msg.card_num;
            this.setData({ card_num });
          });
        }
      }, 4000);
    }
  },

  /**
   * 精选活动跳链
   */
  areaClickGo(e) {
    let that = this;
    //保存formid
    app.pushId(e).then(ids => {
      app.saveId(ids)
    });
    let redi_type = null, rediurl=null;
    console.log(e);
    if (e.detail.formId){
      rediurl = e.detail.target.dataset.rediurl;
      redi_type = e.detail.target.dataset.redi_type;
    }else{
      rediurl = e.currentTarget.dataset.rediurl;
      redi_type = e.currentTarget.dataset.redi_type;
    }
    
    var type=redi_type,id=rediurl;

    console.log('type', type, redi_type);
    console.log('id', id, rediurl);
    //跳转类型，栏目1 ，商品2，送券活动4
    if (type == 1) {
      switch (id) {
        //四个banner模块
        case "1": var url = `../../common/pages/shop-list?categoryid=100&page=1&store_id=${store_id}&title=爆款专区`; break;
        case "2": var url = `../../common/pages/shop-list?categoryid=101&page=1&store_id=${store_id}&title=热销专区`; break;
        case "3": var url = `../../common/pages/shop-list?categoryid=105&page=1&store_id=${store_id}&title=活动专区`; break;
        case "4": var url = `../../common/pages/shop-list?categoryid=102&page=1&store_id=${store_id}&title=百货专区`; break;
        //宝宝模块
        case "5": var url = `../../common/pages/index-boabao?listId=0&catId=92`; break;
        case "6": var url = `../../common/pages/index-boabao?listId=1&catId=93`; break;
        case "7": var url = `../../common/pages/index-boabao?listId=2&catId=94`; break;
        case "8": var url = `../../common/pages/index-boabao?listId=3&catId=95`; break;
        case "9": var url = `../../common/pages/index-boabao?listId=4&catId=97`; break;
        //礼包特卖模块
        case "10": var url = `../../common/pages/hotsale?categoryid=104&page=1&store_id=${store_id}`; break;
        //拼团
        case "11": var url= `../../group-buying/grouplist`; break;
        //增值活动
        case "12": var url = `../../common/pages/index-mom`; break;

      }
    } else if (type == 2) {
      var url = `../../common/pages/goods-detail?prodId=` + id;

    } else if (type == 4) {
      console.log('要跳到送券活动');
      var url = `../../common/pages/activity-detail?id=` + id;
    } else if (type = 5) {
      console.log('dm海报');
      var url = `../../common/pages/index-activity`;
    }
    else {
      console.log('未定义的跳转url');
    }

    if (url) {
      wx.navigateTo({
        url,
      })
    }
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