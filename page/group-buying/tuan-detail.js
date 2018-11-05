let share = require('../common/template/share.js');
let config = require('../../config.js');
const shareLaterUrl = 'wxapp.php?c=activity&a=tuan_share_coupon';//拼团活动分享之后的优惠券列表
const app = getApp();
const goOtherTuanUrl = 'wxapp.php?c=tuan_v2&a=order';//去参团
const tuanDataUrl = 'wxapp.php?c=tuan_v2&a=tuan_info';//加载团详情
// const otherGroupUrl = "wxapp.php?c=tuan_v2&a=team_list";//他人团数据
const changeGroupUrl = "wxapp.php?c=tuan_v2&a=change_team_list";//换一批
const cartInfoUrl = 'wxapp.php?c=cart&a=info';//获取属性弹窗
const tuanOrderUrl = 'wxapp.php?c=tuan_v2&a=order';//一键开团生成订单
const tuanlistsUrl = 'wxapp.php?c=tuan_v2&a=hot_tuan_lists';//拼团活动列表
const tuanSuccUrl = 'wxapp.php?c=tuan_v2&a=tuan_info_success';//拼团成功数据

Page({
  data: {
    showShareModal: false,//分享成功后模式层
    shareData: [],//分享數據
    tuanType: 0,//拼团状态，1已成团，0未成团
    myType: 1,//1已成团，6未成团
    quantity: 0,//库存
    sku_list: [],//多属性列表
    property_list: [],//多属性规格列表
    product: [],//产品数据
    quantity: 0,//库存
    prodId: null,//产品id
    num: 1,//购买数量
    sku_id: null, //多属性id
    replaceData: [],    // 换一批数据
    hotData: [],    // 热门推荐数据
    groupbuyOrderId: 0,
    store_id: app.store_id,
    uid: '',
    phy_id: '',
    tuan: [],//团信息
    param: {},//团详情参数
    tuanId: null,//团id
    head_tuan: null,//团长信息
    people_tuan: [],//团成员信息
    addressList: [],//团成功收货地址
    moreChoose: false,//规格弹窗
    num: 1,//购买数量
    sellout: 1,//是否已经售罄，0售罄，1没有售罄
    imgNull: [],//剩余名额的图片数组
    countdownText: '',//倒计时的时间显示
  },
  onShareAppMessage: function (res) {
    let that = this, store_id = this.data.store_id, uid = this.data.uid, opt = this.data.param,dataset=res.target.dataset;
    that.setData({ showShareModal: false });
    var tip = `快来参团！${dataset.price}元包邮${dataset.title}这里比其他平台购买还便宜！！！猛戳.......`;
    return {
      title:tip,
      path: `/page/group-buying/group-join?tuanId=${opt.tuan_id}&prodId=${that.data.prodId}&itemId=${opt.item_id}&teamId=${opt.team_id}`,
      imageUrl: dataset.imgurl,
      success: function (res) {
        //开启分享成功弹窗
        share.shareOpen({
          store_id,
          uid,
          url: shareLaterUrl
        }).then(opt => {
          let { showModel, couponList, coupon_id_arr = [] } = opt;
          that.setData({
            showShareModal: showModel,
            shareData: { couponList },
            coupon_id_arr
          })
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '分享失败！',
        })
      }
    }
  },
  getCoupon() {
    let that = this;
    let { store_id, uid, coupon_id_arr } = that.data;
    share.getCoupon({
      store_id,
      uid,
      coupon_id_arr
    }).then(opt => {
      let { showModel } = opt;
      that.setData({
        showShareModal: showModel
      })
    });
  },
  cancelCoupon() {
    let that = this;
    let { store_id, uid } = that.data;
    share.cancelCoupon({
      store_id,
      uid
    }).then(opt => {
      let { showModel } = opt;
      that.setData({
        showShareModal: showModel
      })
    });
  },
  onLoad: function (options) {
    var uid = wx.getStorageSync('userUid'), phy_id = wx.getStorageSync('phy_id');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
    }
    var tuanType = '0';

    let { tuanId, type, itemId, teamId, params } = options;
    if (params) {
      var opts = JSON.parse(unescape(params));
      //status	拼团状态，0：进行中，1：成功，2：失败
      // tuanType: 0,//拼团状态，1已成团，0未成团
      if(opts.status==1){
        var tuanType = 1
      }else{
        var tuanType =0;
      }
      this.setData({
        tuanId: opts.tuan_id,
        param: opts,
        groupbuyOrderId: opts.order_no,
        uid, phy_id, tuanType
      });
    } else {
      var opts = { tuan_id: tuanId, type, item_id: itemId, team_id: teamId }
      this.setData({
        tuanId: tuanId,
        param: opts,
        uid, phy_id
      });
    }
    this.loadHotData(); //热门推荐数据

  },
  onReady: function () {
    // 页面渲染完成
  },
  //多规格 onShow
  onShow: function () {
    wx.hideShareMenu();
    this.loadData(this.data.param);
    this.loadSucc(this.data.param);
  },
  onHide: function () {
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload: function () {
    // 页面关闭
    that.stopCountDown();
  },
  /**去商品详情 */
  detailClick() {
    var { prodId, tuanId, sellout } = this.data;
    wx.navigateTo({
      url: `./group-buying?prodId=${prodId}&tuanId=${tuanId}&sellout=${sellout}`,
    })
  },
  /**去拼团栏 */
  goGrouplist: function () {
    wx.navigateTo({
      url: './grouplist',
    })
  },
  /**拼团成功数据 */
  loadSucc(params) {
    app.api.postApi(tuanSuccUrl, { "params": {"uid":this.data.uid, "tuan_id": params.tuan_id, "type": params.type, "item_id": params.item_id, "team_id": params.team_id } }, (err, rep) => {
      if (err || rep.err_code != 0) return;
      var addressList = rep.err_msg.address;
      this.setData({ addressList });
    })
  },
  loadData(params) {
    app.api.postApi(tuanDataUrl, { "params": { "uid":this.data.uid, "tuan_id": params.tuan_id, "type": params.type, "item_id": params.item_id, "team_id": params.team_id } }, (err, rep) => {

      if (err || rep.err_code != 0) { return };
      var { product, param, tuan, head_tuan, people_tuan } = rep.err_msg;
      var len = tuan.diff_people, imgNull = [];
      var prodId = product.product_id;
      var tuanSatue = len > 0 ? 0 : 1;
      var sellout = product.quantity > 0 ? 1 : 0;
      if (len > 0) {
        var j = len > 2 ? 2 : len;
        for (let i = 0; i < j; i++) {
          imgNull.push({ img: '../image/noNull.png' });
        }
        this.setData({ imgNull })
      }
      if (len>0) { this.startCountDown(tuan);}
     
      this.setData({
        product, head_tuan, tuanSatue, sellout, people_tuan, param, quantity: product.quantity, prodId, tuan
      })
    });
  },
  doBuy: function () {
    //弹窗属性窗口
    var moreChoose = !this.data.moreChoose;
    this.setData({ moreChoose });
  },
  goImageClose() {
    var that = this;
    that.setData({
      moreChoose: false,
    });
  },
  goPayment(e) {
    var that = this;
    var { sku_list, sku_id } = that.data;
    if (sku_list.length > 0) {
      if (!sku_id) {
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        that.getOrderId();
      }
    } else {
      that.getOrderId();
    }
  },
  //去参加团
  listClick: function (e) {
    var { type, tuanId, teamId, itemId } = e.currentTarget.dataset;
    var prodId = this.data.prodId;
    let url = `./group-join?prodId=${prodId}&tuanId=${tuanId}&type=${type}&teamId=${teamId}&itemId=${itemId}`;
    wx.navigateTo({ url: url })
  },
  /*
  *生成订单
  *
  */
  getOrderId() {
    var that = this;
    var { param, num, uid } = that.data, url = '', params = {};
    url = tuanOrderUrl;
    params = {
      "tuan_id": param.tuan_id,
      "quantity": num,
      "type": param.type,
      "item_id": param.item_id,
      "team_id ": param.team_id,
      uid
    };

    app.api.postApi(url, { params }, (err, rep) => {
      var { err_msg, err_code } = rep;
      if (err || err_code != 0) {
        wx.showModal({
          content: err || err_msg || err_msg.msg_txt,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#FF0000',
          confirmText: '好的',
        });
        return
      }
      var url = '../common/pages/buy?orderId=' + err_msg.order_no + '&uid=' + uid;
      wx.navigateTo({ url });
    })
  },
  // 团已满之后再次一键开团
  doAddBuy(e) {
    var type = e.target.dataset.ordertype;
    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value.push(this.data.attrValueList[i].selectedValue);
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else {
      wx.setStorage({
        key: "key",
        data: value.join('-')
      })
    }
    //多规格 end
    let { prodId, action, sku_id, num } = this.data;
    if (sku_id) {
    } else {
      sku_id = 0;
    }
    if (type == 2) {
      //团购
      var url = './buy?prodId=' + prodId + '&tuanId=' + tuanId + '&groupbuyOrderId=0' + '&sku_id=' + sku_id + '&num=' + num;
    }
    wx.navigateTo({ url });
  },

  //多规格 js  start
  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
    /**
      将后台返回的数据组合成类似
      {
        attrKey:'型号',
        attrValueList:['1','2','3']
      }
    */
    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value);
      }

    }
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
    var includeGroup = [];
    var sku_id;
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
          this.setData({
            quantity: commodityAttr[i]['num'], sku_id: commodityAttr[i]['sku_id']
          });
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup,
      attrPrice: includeGroup[0]['price'],
    });
    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },
  /**
   * 减号
   */
  bindMinus: function () {
    var num = this.data.num;
    if (num > 1) {
      num--;
      this.setData({
        num
      });
    }

  },
  /* 点击加号 */
  bindPlus: function () {
    var { num, quantity } = this.data;
    if (num <= quantity) {
      num++;
      console.info(num);
      this.setData({
        num
      });
    }
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value, quantity = this.data.quantity;
    if (1 < num <= quantity) {
      this.setData({
        num
      });
    }
  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  /**
  * 倒计时处理
  */
  startCountDown(data) {
    var that = this;
    that.stopCountDown();
    wx.showLoading({ title: '加载中', mask: true });
    this.timer = setInterval(() => {
      let now = new Date().getTime();
      var expireTime = data.end_time * 1000;
      var leftTime = (expireTime - now) / 1000;
      var countdownText = this.countDown(leftTime);
      that.setData({countdownText});
      wx.hideLoading();
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
    var day = 0, hour = 0, minute = 0, second = 0;
    if (leftTime > 0) {//转换时间  
      day = Math.floor(leftTime / (60 * 60 * 24));
      hour = Math.floor(leftTime / (60 * 60)) - (day * 24);
      minute = Math.floor(leftTime / 60) - (day * 24 * 60) - (hour * 60);
      second = Math.floor(leftTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      hour = day * 24 + hour;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      var str = hour + ':' + minute + ':' + second
    } else {
      clearInterval(this.timer);
    }
    return { day, hour, minute, second };
  },
  //点击换一批
  clickReplace: function () {
    this.stopCountDown();
    var url = changeGroupUrl;
    this._loadOrderData(url);
  },
  //去参加团
  joinGroup: function () {
    wx.redirectTo({
      url: 'group-join'
    });
  },
  /**
 * 热门推荐数据处理
 *
 */
  loadHotData() {
    var that = this;
    var store_id = that.data.store_id, page = 1;

    app.api.postApi(tuanlistsUrl, { "params": { store_id, page } }, (err, rep) => {

      if (err || rep.err_code != 0) return;
      var hotData = rep.err_msg;
      that.setData({
        hotData
      })
    });
  },
  //跳到拼团商品页
  goGroupDetail: function (e) {
    var { prodid, tuanid, quantity } = e.currentTarget.dataset;//商品id,团购id，数量
    if (quantity > 0) {
      var sellout = 1;
    } else {
      var sellout = 0;
    }
    var url = './group-buying?prodId=' + prodid + '&tuanId=' + tuanid + '&sellout=' + sellout;
    wx.navigateTo({ url });
  },

})