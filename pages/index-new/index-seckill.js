// pages/index-new/index-seckill.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    headerData: [], //秒杀头部数据
    type: 0,  //请求秒杀列表数据的参数
    listData: [], //秒杀列表数据
    activityText: '', //秒杀头部下面的文本
    activityStatus: 1, //秒杀头部下面的文本对应的标识  1是已经开始 2是进行中 3是即将开始
    activityTime: 0, //活动时间  距离开始或者距离结束 
    countDown: 0, //活动剩余时间
    expireTime: 0,//活动失效时间
    askData: true, //为ture需要请求数据， false不需要请求数据
    swiperHeight: '0',
    scrollLeft: ''
  },
  /*swiper bindchange事件*/
  bindChange(e) {
    var that = this;
    var currentIndex = e.detail.current;//当前索引
    var offsetLeft = currentIndex*75;//相对于父对象的左边距
    if ((offsetLeft == currentIndex * 75) && (currentIndex >= 3)) {
      that.setData({
        scrollLeft: 75 * (currentIndex - 2)//滚动条到左边的距离
      })
    } else if (currentIndex < 3) {
      that.setData({
        scrollLeft: 0
      })
    }
    var clickParam = e.currentTarget.dataset;
    //根据索引请求接口，返回该索引表示的时间戳,然后调用数据
    this.stopCountDown();
    if (this.data.askData) {
      this.getTimeByIndex(e.detail.current);
    } else {
      that.setData({ askData: true })
    }
    that.setData({ currentTab: e.detail.current });
  },
  /*秒杀头部点击事件*/
  switchNav(e) {
    var that = this;
    // 每个点击元素之间的offsetLeft距离是75
    var offsetLeft = e.currentTarget.offsetLeft;//获取的是相对于父对象的左边距
    var currentIndex = e.currentTarget.dataset.current;//当前点击项索引
    if ((offsetLeft == currentIndex * 75) && (currentIndex >= 3)) {
      that.setData({
        scrollLeft: 75 * (currentIndex-2)//滚动条到左边的距离
      })
    } else if (currentIndex < 3) {
      that.setData({
        scrollLeft: 0
      })
    }

    this.stopCountDown();

    var clickParam = e.currentTarget.dataset;

    if (this.data.currentTab === clickParam.current) {
      return false;
    } else {
      that.setData({
        currentTab: clickParam.current,
      })
    }
    that.setData({ askData: false }) //不要再去请求数据了（点击已经请求了数据，blidchang不要请求数据）


    //调用秒杀列表数据
    var type = clickParam.type;
    this.secKillListData(type);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.secKillHeaderData(); //秒杀头部
    //这里是会传递请求秒杀列表数据的参数

    //var currentTab= 0 ; //假设从首页传递过来了
    var currentTab = options.index;
    this.setData({
      currentTab: currentTab
    });
    var type = options.type;
    this.setData({
      type: type
    });
    this.secKillListData(type); //

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
  * 秒杀头部数据处理
  * 
  */
  secKillHeaderData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    let hotData = [];
    app.api.fetchApi("seckill/head", (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      let headerData = data;
      this.setData({ headerData });
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
  /**
  * 秒杀列表数据处理
  * 
  */
  secKillListData(type) {
    wx.showLoading({ title: '加载中...', mask: true, });
    let listData = [];

    let url = 'seckill/SecbuyList/' + type; //接口
    app.api.fetchApi(url, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      //let headerData = data.data;
      let listData = data.data;
      // 自适应swiper高度
      var swiperHeight = listData.length * 260 + 196;//根据数据自适应高
      let activityText = data.activityText;
      let activityStatus = data.activityStatus;
      let activityTime = data.activityTime;
      //处理时间
      let expireTime = data.activityTime;
      if (expireTime > 0) {
        this.startCountDown(expireTime);
      }
      this.setData({ listData, activityText, activityStatus, activityTime, swiperHeight });
    });
  },
  /**
  * 查看详情跳转
  * 
  */
  secKillDetailData: function (e) {
    var param = e.currentTarget.dataset;
    //商品的id
    var prodId = param.prodid;
    var activityStatus = param.activitystatus;
    var productPrice = param.productprice; //商品原来价格
    var skPrice = param.skprice; //商品秒杀价格
    var activityTime = param.activitytime; //活动剩余或者结束时间
    var quantity = param.quantity; //商品的剩余数量
    var hadnum = param.hadnum; //商品的已抢数量
    var pskid = param.pskid; //秒杀产品ID

    //使用expireTime 是为了跟首页那个统一
    var url = './goods-detail?prodId=' + prodId + '&productPrice=' + productPrice + '&skPrice=' + skPrice + '&activityStatus=' + activityStatus + '&expireTime=' + activityTime + '&hadnum=' + hadnum + '&pskid=' + pskid;

    wx.navigateTo({ url });
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
  * 手动滑屏，通过索引值返回对应的时间戳
  */
  getTimeByIndex(index) {

    let url = "seckill/getTimeByIndex/" + index;
    app.api.fetchApi(url, (err, resp) => {

      if (err) {
        return this._showError('网络出错，请稍候重试');;
      }
      let { rtnCode, rtnMessage, data = [] } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }
      this.secKillListData(data.type);


    });
  },
})