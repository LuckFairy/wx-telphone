
import { getUrlQueryParam } from '../../../utils/util.js';
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mode: 'aspectFit',
    lazyLoad: true,
    scroll_top: 0,
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
    dataImg: [],//首页轮播图数据
    showhide: true,
    cat_list: [],
    //2017年12月21日18:50:42 by leo
    card_num: 0,
    uid: '',//用户id
    store_id:'',//店铺id
    indexImage: null,//4个大图图片列表
    showModel: false,//是否显示弹窗模板
    couponList: [],//专用券列表
    coupon_id_arr: [],//优惠券id
    logLat: [],//位置经纬度
    location: null,//门店信息
    indexIcon:[],//5栏列表
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let uid = wx.getStorageSync('userUid');
    let store_id = app.store_id;
   
   this.setData({uid,store_id});
    //indexImage获取
    var params = {
      "store_id": store_id
    }
    app.api.postApi('wxapp.php?c=index&a=get_image', { params }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        this.setData({
          indexImage: rep.err_msg.icon_list
        })
      }
    })
    app.api.postApi('wxapp.php?c=index&a=get_icon', { params }, (err, rep) => {

      if (!err && rep.err_code == 0) {
        this.setData({
          indexIcon: rep.err_msg.icon_list
        })
      }
    })


    this.loadBaoKuanData();
    this.loadHotSaleData();
    this.loadGoodsData();
    this.loadFestivalData();
    // this._prepare();    // 等待登录才开始加载数据
    this.loadMyCardNumData(); //我的卡包数量

  },
  clickGoCategory(e) {
    console.log("宝宝", e)
    var index = e.currentTarget.dataset.index;
    var catId = e.currentTarget.dataset.catId;
    wx.navigateTo({
      url: '../../common/pages/index-boabao?listId=' + index + '&catId=' + catId
    })
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
        case '100': console.log(`爆款区（9.9元）数据 `, data); this.setData({ baoKuanData: data }); break;
        case '101': console.log(`热销（母婴热销榜）区数据 `, data); this.setData({ hotSaleData: data }); break;
        case '102': console.log(`百货数据 `, data); this.setData({ goodsData: data }); break;
        case '105': console.log(`精选好奶粉数据 `, data); this.setData({ festivalData: data }); break;
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
    var params = {
      uid: this.data.uid,
      store_id: this.data.store_id,
    }
    console.log('my_card_num 接口参数', params);
    app.api.postApi('wxapp.php?c=coupon&a=my_card_num', { params }, (err, response) => {
      if (err || response.err_code != 0) return;
      var card_num = response.err_msg.card_num;
      this.setData({ card_num });
    });
  },
  //跳到爆款商品页
  clickGoBaoKuan: function (e) {
    var { categoryid, page = "1"} = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    var store_id = this.data.store_id;
    wx.navigateTo({
      url: '../../common/pages/shop-list?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id +'&title=爆款专区'
    })
  },
  //跳到热销商品页
  clickGoHotSale: function (e) {
    var store_id = this.data.store_id;
    var { categoryid, page = "1" } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: '../../common/pages/shop-list?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id + '&title=热销专区'
    })
  },
  //跳到百货商品页
  clickGoGoods: function (e) {
    var store_id = this.data.store_id;
    var { categoryid, page = "1", } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: '../../common/pages/shop-list?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id + '&title=百货专区'
    })
  },
  //跳到活动（节日）商品页
  clickGoFestival: function (e) {
    var store_id = this.data.store_id;
    var { categoryid, page = "1" } = e.currentTarget.dataset;// 分类id , 分页码 ， 店铺id
    wx.navigateTo({
      url: '../../common/pages/shop-list?categoryid=' + categoryid + '&page=' + page + '&store_id=' + store_id + '&title=活动专区'
    })
  },
  //跳到热门推荐商品页
  clickGoHotProduct: function (e) {
    var prodId = e.currentTarget.dataset.prodid; //商品ID
    var cateId = e.currentTarget.dataset.cateid; //商品分类ID
    wx.navigateTo({
      url: '../../common/pages/goods-detail?prodId=' + prodId
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
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
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