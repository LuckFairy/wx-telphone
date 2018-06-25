// pages/qrcode/qr-entry.js
import {
  getUrlQueryParam
} from '../../utils/util';
import {
  Api
} from '../../utils/api_2';

var app = getApp();
var qrData = '';
var checkTimer = null;
let locationId = 155;
let indexUrl = '../index-new/index-new';

Page({
  data: {
    store_id: '',
    uid: '',
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    let {
      q
    } = options;
    let that = this;
    var store_id = app.store_id; //store_id    
    var uid = wx.getStorageSync('userUid');


    this.setData({
      store_id,
      uid
    });

    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    if (q) {
      q = decodeURIComponent(q);
      try {
        let params = getUrlQueryParam(q, 'data');
        qrData = JSON.parse(params);
        console.log('qrData......', qrData);
        locationId = qrData.location_id;
        if (!locationId) {
          locationId = 155;
        }
        wx.setStorageSync('locationid', locationId); //存储locationId
        if (!uid) {
          console.log('ui', uid);
          setTimeout(function() {
            wx.switchTab({
              url: indexUrl + `?locationid=${locationId}`,
            })
          }, 1000);
          return;
        }
       
        if (uid) {
          that.redirctPageNew(); // 加载数据，关闭定时器
        } else {
          setTimeout(() => {
            wx.switchTab({
              url: indexUrl + `?locationid=${locationId}`,
            });
          }, 3000)
        }

      } catch (e) {
        setTimeout(() => {
          wx.switchTab({
            url: indexUrl + `?locationid=${locationId}`,
          });
        }, 3000)
      }

    }
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    var uid = wx.getStorageSync('userUid');
    if (!uid) {
      setTimeout(function() {
        wx.switchTab({
          url: indexUrl + `?locationid=${locationId}`,
        })
      }, 1000);
      return;
    } else {
      // 页面显示
      // this.redirctPage();
      this.redirctPageNew();
    }

  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  redirctPageNew: function() {
    this.buildRedirctUrlNew();
    this.checkUserFirstVisitNew();
  },
  //绑定用户归属门店
  checkUserFirstVisitNew: function() {
    var params = {
      store_id: this.data.store_id,
      item_store_id: qrData.location_id,
      uid: this.data.uid

    }
    app.api.postApi('screen.php?c=index&a=binding_user', {
      params
    }, (err, resp) => {

      if (err) return;

      return true;
    });

  },

  buildRedirctUrlNew: function() {
    let resType = qrData.resType;
    let resId = qrData.resId;
    let activityId = qrData.activityId;
    let groupbuyId = qrData.groupbuyId;
    let groupbuyOrderId = qrData.groupbuyOrderId;
    let uid = qrData.uid;
    let sellout = qrData.sellout; //是否售罄 0售罄 1未售罄
    //秒杀活动
    let price = qrData.price; //商品价格
    let skPrice = qrData.skPrice; //秒杀价格
    let status = qrData.status; //活动状态 1已经开始 2进行中 3即将开始
    let expire_time = qrData.expire_time; //活动结束时间（其实已经用不上了）
    let hadnum = qrData.hadnum; //商品数量
    let pskId = qrData.pskId; //秒杀产品ID
    let action = qrData.action; //新品试用

    let url = '';
    if (resType == 'card') { //跳转到卡券领取页面
      //url = '../card/card_summary?cardId=' + resId + '&activityId=' + activityId + '&qrEntry=1';
      url = '../card/card_summary?id=' + resId + '&source=2' + '&qrEntry=1';
    } else if (resType == 'goods') { //商品详情页面
      url = '../shopping/goods-detail?prodId=' + resId + '&action=' + action + '&qrEntry=1';

    } else if (resType == 'trial') { //赠品领取页面
      url = '../present/present-apply?qrEntry=1&options=';
      app.api.fetchApi('trial/item/' + resId, (err, response) => {
        if (err) reject(err);
        let {
          rtnCode,
          data
        } = response;
        if (rtnCode != 0) {
          reject(rtnCode);
        }
        url = url + JSON.stringify(data);
        wx.redirectTo({
          url: url
        });
      });
    } else if (resType == 'redbox') {
      url = '../redbox/redbox?qrEntry=1';
    } else if (resType == 'groupbuy') { //一键开团
      url = '../group-buying/group-buying?prodId=' + resId + '&groupbuyId=' + groupbuyId + '&sellout=' + sellout + '&qrEntry=1';
    } else if (resType == 'gobuy') { //去参团
      url = '../group-buying/group-buying?prodId=' + resId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId + '&qrEntry=1';
    } else if (resType == 'seckill') { //去秒杀
      url = '../index-new/goods-detail?prodId=' + resId + '&productPrice=' + price + '&skPrice=' + skPrice + '&activityStatus=' + status + '&expireTime=' + expire_time + '&hadnum=' + hadnum + '&pskid=' + pskId + '&qrEntry=1';
    } else if (resType == 'dazhuanpan') { //大转盘
      url = '../lottery/dazhuanpan?qrEntry=1';
    } else if (resType == 'baokuan') { //爆款专区
      url = '../index-new/index-baokuan?categoryid=100&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
      console.log('baokuan url=', url);
    } else if (resType == 'hotsale') { //热销专区
      url = '../index-new/index-hotsale?categoryid=101&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
    } else if (resType == 'festival') { //活动专区
      url = '../index-new/index-festival?categoryid=105&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
    } else if (resType == 'goodss') { //百货专区
      url = '../index-new/index-goods?categoryid=102&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
    } else if (resType == 'mycard') { //我的卡包
      url = '../card/mycard?qrEntry=1';
    }

    if (url) {
      wx.redirectTo({
        url: url
      });
    } else {
      wx.switchTab({
        url: indexUrl + `?locationid=${locationId}`,
      });
    }
  },
  redirctPage: function () {
    Promise.all([this.buildRedirctUrl(), this.checkUserFirstVisit()]).then(rtnData => {
      let url = rtnData[0];
      wx.redirectTo({
        url: url
      });
    }).catch(err => {
      wx.switchTab({
        url: indexUrl + `?locationid=${locationId}`,
      });
    });
  },
  checkUserFirstVisit: function () {
    let locId = qrData.location_id;
    return new Promise((resolve, reject) => {
      app.api.postApi('user/checkUserFirstVisit', { locationId: locId }, (err, response) => {
        if (err) return;
        let { rtnCode, data } = response;
        if (rtnCode != 0) {
        } else {
        }
        resolve("ok");
      });
    });

  },

  buildRedirctUrl: function () {
    return new Promise((resolve, reject) => {
      let resType = qrData.resType;
      let resId = qrData.resId;
      let activityId = qrData.activityId;
      let groupbuyId = qrData.groupbuyId;
      let groupbuyOrderId = qrData.groupbuyOrderId;
      let uid = qrData.uid;
      let sellout = qrData.sellout; //是否售罄 0售罄 1未售罄

      //秒杀活动
      let price = qrData.price; //商品价格
      let skPrice = qrData.skPrice; //秒杀价格
      let status = qrData.status; //活动状态 1已经开始 2进行中 3即将开始
      let expire_time = qrData.expire_time; //活动结束时间（其实已经用不上了）
      let hadnum = qrData.hadnum; //商品数量
      let pskId = qrData.pskId; //秒杀产品ID

      let url = '../index-new/index-new';

      if (resType == 'card') {//跳转到卡券领取页面
        url = '../card/card_summary?cardId=' + resId + '&activityId=' + activityId + '&qrEntry=1';
        resolve(url);
      } else if (resType == 'goods') {//商品详情页面
        url = '../shopping/goods-detail?prodId=' + resId + '&qrEntry=1';
        resolve(url);
      } else if (resType == 'trial') {//赠品领取页面
        url = '../present/present-apply?qrEntry=1&options=';
        app.api.fetchApi('trial/item/' + resId, (err, response) => {
          if (err) reject(err);
          let { rtnCode, data } = response;
          if (rtnCode != 0) {
            reject(rtnCode);
          }
          url = url + JSON.stringify(data);
          resolve(url);
        });
      } else if (resType == 'redbox') {
        url = '../redbox/redbox?qrEntry=1';
        resolve(url);
      } else if (resType == 'groupbuy') { //一键开团
        url = '../group-buying/group-buying?prodId=' + resId + '&groupbuyId=' + groupbuyId + '&sellout=' + sellout + '&qrEntry=1';
      } else if (resType == 'gobuy') { //去参团
        url = '../group-buying/group-buying?prodId=' + resId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId + '&qrEntry=1';
      } else if (resType == 'seckill') { //去秒杀
        url = '../index-new/goods-detail?prodId=' + resId + '&productPrice=' + price + '&skPrice=' + skPrice + '&activityStatus=' + status + '&expireTime=' + expire_time + '&hadnum=' + hadnum + '&pskid=' + pskId + '&qrEntry=1';
      }
    });

  },

})