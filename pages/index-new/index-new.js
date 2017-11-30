// pages/index-new/index-new.js 
const log = "index.js --- ";
import { getUrlQueryParam } from '../../utils/util';
var app = getApp();
var checkTimer = null;     // 若还没登录，启用定时器


Page({

  /**
   * 页面的初始数据
   */
  data: {
      scroll_top: 0,
      goTop_show: false,
      //2017年10月11日14:06:09 by leo
      testData: [], //测试数据
      hotData: [], //热点推荐
      groupData: [], //拼多多
      secKillData: [], //秒杀
      showData:1, //是否显示  1显示 2 加载后显示
      showTime:0, //第几点场
      type:0, //请求的活动点的时间戳
      index:0, //跳到秒杀列表页的索引
      countDown:0, //活动剩余时间
      expireTime:0,//活动失效时间
      dataImg:[],
      showhide:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.api.fetchApi("focuspic/showfouctPic", (err, resp) => {
       if(resp){
         var dataImg = resp.data;
         console.log("图片啦啦啦", dataImg);
        that.setData({
          dataImg: dataImg,
          showhide: false
        })
       }
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
    this._prepare();    // 等待登录才开始加载数据
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
    clearInterval(checkTimer);
    checkTimer = setInterval(() => {
      console.log(log + getApp().hasSignin);
      if (getApp().hasSignin) {
        clearInterval(checkTimer);
        //this.loadData();    // 加载数据，关闭定时器
        this.setData({'showData': 2}); //显示内容框架，准备载入内容
        //拼团数据
        this.loadGroupData();
        //秒杀数据
        this.loadSecKillData();
        //热门数据
        this.loadHotData();
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
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  clickGoCategory(e){
    var index = e.currentTarget.dataset.index;
    console.log(index,"dhdddh")
    wx.navigateTo({
      url: 'index-boabao?listld='+index
    })
  },

  //点击事件
  clickGo: function (e) {
    var destination = e.target.dataset.destination;
    console.log('点击的destination是' + destination);//return;
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
      var url = '../redbox/redbox';
    } else if (destination == 4) {
      //母婴服务
      var url = '../activity/category-2';
    } else if (destination == 5) {
      //门店促销 /优惠券
      var url = '../activity/category-1';
    } else {
      //单独购买
      var url = '';
    }
    if(url){
      wx.navigateTo({ url });
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
    app.api.fetchApi('groupbuy/GroupbuyLists3', (err, response) => {
      wx.hideLoading();
      if (err) return;
      let { rtnCode, rtnMessage, data } = response;
      if (rtnCode != 0) return;
      this.setData({ groupData:data });
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
    console.log('秒杀商品的原来价格' + productPrice);
    console.log('秒杀商品的秒杀价格' + skPrice);
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
        return this._showError('网络出错，请稍候重试');;
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
      if (expireTime){
        this.startCountDown(expireTime);
      }
      //typeof onLoaded === 'function' && onLoaded();
      //this.startCountDown(replaceData); ////先注释掉计时器
      this.setData({ secKillData, showTime, type, index, expireTime});
    });
  },

  /**
 * 首页热门推荐数据
 */
  loadHotData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    let hotData = [];
    var product_type=1;  //单品推荐
    //var product_type = 2;  //拼团商品推荐
    let url = 'shop/hotLists';   
    app.api.postApi(url, { product_type }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      this.setData({ hotData:data });
    });
  },
  //跳到热门推荐商品页
  clickGoHotProduct: function (e) {
    //console.log('跳到热门推荐商品页 e');
    var prodId = e.currentTarget.dataset.prodid; //商品ID
    var cateId = e.currentTarget.dataset.cateid; //商品分类ID

    wx.navigateTo({
      url: '../shopping/goods-detail?prodId='+prodId+'&cateId='+cateId   
    })
  },
  //倒计时处理
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
      //console.log(countDown);
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