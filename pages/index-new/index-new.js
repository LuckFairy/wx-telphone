// pages/index-new/index-new.js 
const log = "index.js --- ";
import { getUrlQueryParam, checkBingPhone} from '../../utils/util';
import { getPhoneNumber } from '../template/get-tel.js';
let app = getApp();
const couponUrl = 'wxapp.php?c=activity&a=new_user_coupon';//领取优惠券接口
const physicalMainUrl = 'wxapp.php?c=physical&a=main_physical';//总店信息
let locationid = null;//门店屏id
var checkTimer = null;     // 若还没登录，启用定时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    infoFlag: app.globalData.info_flag,
    uid: null,//用户id
    store_id:'',
    phoneFlag: false,//是否弹手机模板
    templateData:{url:'./bingPhone'},//绑定手机跳转路径
    mode: app.globalData.image.mode,
    lazyLoad: app.globalData.image.lazyLoad,
    scroll_top: 0,
    random: parseInt(40* Math.random()),//随机数
    goTop_show: false,
    //2017年10月11日14:06:09 by leo
    testData: [], //测试数据
    baoKuanData: [],//爆款专区数据
    hotSaleData: [],//节日专区数据
    goodsData: [],//节日专区数据
    festivalData: [],//节日专区数据

    hotData: [], //热点推荐数据
    groupData: [], //拼多多
    secKillData: [], //秒杀
    showTime: 0, //第几点场
    type: 0, //请求的活动点的时间戳
    index: 0, //跳到秒杀列表页的索引
    countDown: 0, //活动剩余时间
    expireTime: 0,//活动失效时间
    dataImg: [],
    showhide: true,
    cat_list: [],
    card_num: 0,
    iconOne: [],
    indexImage: null,//4个大图图片列表
    showModel: false,//是否显示弹窗模板
    couponList: [],//专用券列表
    coupon_id_arr: [],//优惠券id
    indexIcon:null,
    saoma_url: null,//条码链接
    index_image: "http://file.qutego.com/upload/wxapp/banner/yiya/index_2.jpg?" + parseInt(40 * Math.random()),
  },
  /**获取用户信息 */
  getuserinfo(e) {
    app.globalData.userInfo = e.detail.userInfo;
    wx.setStorageSync("userInfo", e.detail.userInfo);
    this.setData({ infoFlag: false });
    var that = this;
    locationid = wx.getStorageSync('locationid');
    console.log('getuserinfo....location', locationid);
    app.login(e.detail, function () {
      that.setData({ infoFlag: true });
      app.globalData.info_flag = true;
    }, locationid);
  },
  getPhoneNumber: getPhoneNumber,
  /**验证是否获取手机号 */
  checkPhone() {
    let that = this;
    checkBingPhone(this.data.uid, this.data.store_id).then(flag => {
      that.setData({ phoneFlag: false });
    },err=> {
      that.setData({ phoneFlag: true });
      })
  },
  /**
   * 扫码购
   */
  saoma() {
    var that = this;
    wx.scanCode({
      success: (res) => {
        console.log('扫码。。。',res)
        var url = res.result;
        wx.hideTabBar();
        that.setData({
          saoma_url: url
        })
      },
      fail: () => {
        that._showError('请重新扫码');
      }
    })
  },
 
  /*
  *首次打开小程序事件
  *
  */
  firstOpen() {
    var that = this;
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id,
      "page": 1
    };
    app.api.postApi(couponUrl, { params }, (err, rep, statusCode) => {
      //console.log('优惠券data', rep);
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
      that.setData({ showModel, couponList, coupon_id_arr});
    })

  },
  /**
 * 获取总店信息
 */
  loadMainLocation() {
    let that = this;
    let phyDefualt = that.data.phyDefualt;
    var url = physicalMainUrl;
    var params = {
      store_id: that.data.store_id
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
   * 新用户领券
   */
  getCoupon() {
    var that = this;
    that.setData({ showModel: false });
    var url = 'wxapp.php?c=activity&a=get_coupon';
    if (that.data.coupon_id_arr.length < 1){wx.showToast({
      title: '没有相关的优惠券领取',
    });return;}
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id,
      "coupon_id_arr": that.data.coupon_id_arr
    }
    app.api.postApi(url, { params }, (err, rep, statusCode) => {
        if(statusCode !== 200){console.log('新人领券接口错误，联系后台');return;}
        if(!err && rep.err_code==0){
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
        }else{
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
      "uid": that.data.uid,
      "store_id": that.data.store_id,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var store_id = app.store_id;
    this.setData({ store_id });
    var uid = wx.getStorageSync('userUid');
    if(!uid){
      wx.showLoading({
        title: '加载中',
        mask: true,
      });
      var i=0;
      that.timer1 = setInterval(() => {
        i++;
        uid = wx.getStorageSync('userUid');
        this.setData({ uid});
        this._prepare();
        if (uid||i>3) { clearInterval(that.timer1);}
      }, 3000);
    }else{
      this.setData({ uid, infoFlag: false});
      this._prepare();
    }
   
  },
  /**
  * 加载数据
  */
  _prepare() {
    var that = this;
    var {store_id,uid} = that.data;
    wx.hideLoading();
    // this.firstOpen();

    // // 顶部轮播图
    // app.api.postApi("wxapp.php?c=product&a=banner_list", { "params": { "store_id": store_id } },(err, resp) => {
    //    if(resp.err_code==0){
    //      var dataImg = resp.err_msg.banners;
    //     that.setData({
    //       dataImg,
    //       showhide: false
    //     })
    //    }
    // })

    var params = {
      "store_id": store_id
    }
    app.api.postApi('wxapp.php?c=index&a=get_image', { params }, (err, rep) => {
      //console.log('四个活动图片',rep);
      if (!err && rep.err_code == 0) {
        this.setData({
          indexImage: rep.err_msg.icon_list
        })
      }
    })



    app.api.postApi('wxapp.php?c=index&a=get_icon', { params }, (err, rep) => {
      //console.log('图标',rep);
      if (!err && rep.err_code == 0) {
        this.setData({
          indexIcon: rep.err_msg.icon_list
        })
      }
    })



    //this.loadGroupData();
    //this.loadHotData();
    // this.loadMainLocation();
    this.checkPhone();//是否有手机号
    this.loadBaoKuanData();
    this.loadHotSaleData();
    this.loadGoodsData();
    this.loadFestivalData();
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
    let that = this;
    let flag = wx.getStorageSync('hasPhone');
    if (flag == 'true') { flag = false } else { flag = true };
    console.log(flag);
    that.setData({ phoneFlag:flag });

    this.loadMyCardNumData(); //我的卡包数量

  },
  /**
  * 消息推送
  */
  submitOrder(e) {
    //保存formid
    console.info('submitOrder....');
    app.pushId(e).then(ids => {
      app.saveId(ids)
    }, error => {
      console.error(error);
    });
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
    return { title: app.title, path: '/pages/index-new/index-new' }
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

  /**
 * 测试数据
 */
  loadTestData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    let hotData = [];
    app.api.fetchApi("testleo/GroupbuyHot", (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      let hotData = data;
      this.setData({ hotData });
    });
  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  clickGoCategory(e) {
    //console.log("宝宝", e)
    var index = e.currentTarget.dataset.index;
    var catId = e.currentTarget.dataset.catId;
    wx.navigateTo({
      url: 'index-boabao?listld=' + index + '&catId=' + catId
    })
  },

  //点击事件cdd
  clickGo: function (e) {

    var destination = e.target.dataset.destination;
    if (destination == 0) {
      //优惠券 /门店促销
      var url = '../activity/category-1';
    } else if (destination == 1) {
      //新品试用 /赠品领用
      var url = '../present/present';
    } else if (destination == 2) {
      //展会购券/爆款闪购/咿呀严选
      var url = '../activity/hotsale';
    } else if (destination == 3) {
      //抽奖专区
      //var url = '../redbox/redbox';
      var url = './shop-promotion';
    } else if (destination == 4) {
      //母婴服务
      var url = './index-mom';
    } else if (destination == 5) {
      //门店促销 /优惠券
      var url = './shop-promotion';
    } else {
      //单独购买
      var url = '../activity/hotsale';
    }
    //console.log('url', url)
    if (url) {
      wx.navigateTo({ url: url + '?categoryid=100&page=1&store_id=' + this.data.store_id });
    }

  },
  //跳到拼多多列表页
  clickGoGroup: function () {
    wx.navigateTo({
      url: '../cluster/grouplist',
    })
  },
  //咿呀拼多多三条数据
  loadGroupData: function () {
    wx.showLoading({ title: '加载中' });
    app.api.fetchApi('wxapp.php?c=tuan&a=store_list_3&store_id=6', (err, response) => {
      wx.hideLoading();
      if (err) return;
      var data = response.err_msg;
      //console.log("333", data);
      this.setData({ groupData: data });
    });
  },
  //跳到咿呀拼多多商品页
  clickGoGroupProduct: function (e) {
    var prodId = e.currentTarget.dataset.prodid; //商品ID
    var groupbuyId = e.currentTarget.dataset.groupbuyid; //商品团活动ID
    var quantity = e.currentTarget.dataset.quantity; //商品数量
    if (quantity > 0) {
      var sellout = 1;
    } else {
      var sellout = 0;
    }
    wx.navigateTo({
      url: '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + sellout
    })
  },
  //跳到秒杀列表页
  clickGoSecKill: function (e) {
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: './index-seckill?type=' + type + '&index=' + index
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
      url: './goods-detail?prodId=' + prodId + '&productPrice=' + productPrice + '&skPrice=' + skPrice + '&activityStatus=' + activityStatus + '&expireTime=' + expireTime + '&quantity=' + quantity + '&pskid=' + pskid
    })
  },
  /**
 * 秒杀数据
 */
  loadSecKillData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    let secKillData = [];
    app.api.fetchApi("seckill/SecHead", (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      let secKillData = data.data;
      let showTime = data.showTime;
      let type = data.type;
      let index = data.index;
      let expireTime = data.expireTime;
      if (expireTime) {
        this.startCountDown(expireTime);
      }
      //typeof onLoaded === 'function' && onLoaded();
      //this.startCountDown(replaceData); ////先注释掉计时器
      this.setData({ secKillData, showTime, type, index, expireTime });
    });
  },
  getProductData(categoryid) {
    var params = { "store_id": this.data.store_id, "page": "1", "categoryid": categoryid };
    let url = 'wxapp.php?c=product&a=get_product_list_3';
    app.api.postApi(url, { "params": params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }

      let { err_code, err_msg: { products: data = [] } } = resp;
      if (err_code != 0) {
        return this._showError(err_msg);
      }
      data = null ? [] : data;
      switch (categoryid) {
        case '100': 
        //console.log(`爆款区（9.9元）数据 `, data); 
        this.setData({ baoKuanData: data }); break;
        case '101': 
        //console.log(`热销（母婴热销榜）区数据 `, data); 
        this.setData({ hotSaleData: data }); break;
        case '102': 
        //console.log(`百货数据 `, data); 
        this.setData({ goodsData: data }); break;
        case '105': 
        //console.log(`精选好奶粉数据 `, data); 
        this.setData({ festivalData: data }); break;
      }

    });
  },
  /**
* 首页爆款专区数据
*/
  loadBaoKuanData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getProductData('100');
  },
  /**
 * 首页爆款专区数据
 */
  loadHotSaleData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getProductData('101');
  },
  /**
* 首页爆款专区数据
*/
  loadGoodsData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getProductData('102');
  },
  /**
 * 首页爆款专区数据
 */
  loadFestivalData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getProductData('105');
  },

  loadMyCardNumData: function () {
    var uid = this.data.uid,params={},that=this;
    if(uid){
     params = {
        uid,
        store_id: this.data.store_id,
      }
     app.api.postApi('wxapp.php?c=coupon&a=my_card_num', { params }, (err, response) => {
       if (err || response.err_code != 0) return;
       var card_num = response.err_msg.card_num;
       this.setData({ card_num });
     });
    }else{
      clearInterval(that.timer2);
      var i=0;
      that.timer2 = setInterval(() => {
        uid = wx.getStorageSync('userUid');
        i++;
        this.loadMyCardNumData(); //我的卡包数量
        if (uid||i>3) { 
          clearInterval(that.timer2); 
          params = {
            uid: uid,
            store_id: this.data.store_id,
          }
          app.api.postApi('wxapp.php?c=coupon&a=my_card_num', { params }, (err, response) => {
            if (err || response.err_code != 0) return;
            var card_num = response.err_msg.card_num;
            this.setData({ card_num });
          });
        }
      }, 2000);
    }
   
  },

  /**
 * 首页热门推荐数据
 */
  loadHotData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    this.getProductData('102');
  },
  //跳到爆款商品页
  clickGoBaoKuan: function (e) {
    var { categoryid, page = "1"} = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-baokuan?categoryid=' + categoryid + '&page=' + page 
    })
  },
  //跳到热销商品页
  clickGoHotSale: function (e) {
    var { categoryid, page = "1" } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-hotsale?categoryid=' + categoryid + '&page=' + page 
    })
  },
  //跳到百货商品页
  clickGoGoods: function (e) {
    var { categoryid, page = "1" } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-goods?categoryid=' + categoryid + '&page=' + page 
    })
  },
  //跳到活动（节日）商品页
  clickGoFestival: function (e) {
    var { categoryid, page = "1" } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: './index-festival?categoryid=' + categoryid + '&page=' + page 
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
  /**
   * 获取第一行的图标
   */
  getIconLineOne: function () {
    wx.showLoading({ title: '加载中...', mask: true, });
    var params = {
      store_id: this.data.store_id
    };
    app.api.postApi('wxapp.php?c=index&a=get_icon', { params }, (err, resp) => {
      if (err) return;
      if (resp.err_code != 0) {
        wx.showLoading({
          title: resp.err_msg,
        })
      } else {
        wx.hideLoading();
        //console.log(resp, 1111111)
        var data = resp.err_msg;
        //console.log('获取第一行的图标', data);
        this.setData({ iconOne: data });
      }
    });
  },
})