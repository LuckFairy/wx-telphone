// pages/qrcode/qr-entry.js
import { getUrlQueryParam } from '../../utils/util.js';
import { Api } from '../../utils/api_2';
let app = getApp();
let locationId = 155;
let indexUrl = `../../page/tabBar/home/index-new`;
var qrData = '';
Page({
  data: {
    store_id: '',
    uid: '',
  },
  onLoad: function (options) {
    let { q } = options;
    let that = this,
    store_id = app.store_id,  
    
    uid = wx.getStorageSync('userUid');
 
    wx.showLoading({ title: '加载中...', mask: true, });
    if (q) {
      q = decodeURIComponent(q);
      try {
        let params = getUrlQueryParam(q, 'data');
        qrData = JSON.parse(params);
        locationId = qrData.location_id;
        if (!locationId) {
          locationId = 155;
        }
        wx.setStorageSync('locationid', locationId);//存储locationId
        if (!uid) {
          console.log('locationId', locationId);
          setTimeout(function () {
            wx.switchTab({
              url: `../../page/tabBar/home/index-new?locationid=${locationId}`,
            })
          }, 1000);
          return;
        }
        
        that.setData({ uid, store_id, locationId });
        if (uid) {
          //that.redirctPageNew();   // 加载数据，关闭定时器
        } else {
          setTimeout(() => {
            wx.switchTab({
              url: `../../page/tabBar/home/index-new?locationid=${locationId}`,
            });
          }, 3000)
        }
       
      } catch (e) {
        setTimeout(() => {
          wx.switchTab({
            url: `../../page/tabBar/home/index-new?locationid=${locationId}`,
          });
        }, 3000);
      }
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var that = this;
    var uid = wx.getStorageSync('userUid');
    if (!uid) {
      console.log('ui', uid);
      setTimeout(function () {
        wx.switchTab({
          url: `../../page/tabBar/home/index-new?locationid=${locationId}`,
        })
      }, 1000);
      return;
    }
    // else{
      // that.redirctPage();
      // that.redirctPageNew();   // 加载数据
    // }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  redirctPageNew: function () {
    this.buildRedirctUrlNew();
    this.checkUserFirstVisitNew();
  },
  //绑定用户归属门店
  checkUserFirstVisitNew: function () {
    var params = {
      store_id: this.data.store_id,
      item_store_id: qrData.location_id,
      uid: this.data.uid
    }
    app.api.postApi('screen.php?c=index&a=binding_user', { params }, (err, resp) => {
      if (err) return;
      return true;
    });
  },


  buildRedirctUrlNew: function () {
    // let resType = qrData.resType;//跳链页面类型
    // let resId = qrData.resId;
    // let activityId = qrData.activityId;
    // let lotteryId = qrData.lotteryId; //大转盘活动id
    // let uid = qrData.uid;
    let groupbuyId = qrData.groupbuyId;
    let groupbuyOrderId = qrData.groupbuyOrderId;
    let sellout = qrData.sellout; //是否售罄 0售罄 1未售罄
    //秒杀活动
    let price = qrData.price; //商品价格
    let skPrice = qrData.skPrice; //秒杀价格
    let status = qrData.status; //活动状态 1已经开始 2进行中 3即将开始
    let expire_time = qrData.expire_time; //活动结束时间（其实已经用不上了）
    let hadnum = qrData.hadnum; //商品数量
    let pskId = qrData.pskId; //秒杀产品ID
    let action = qrData.action; //新品试用
    let { resType, resId, activityId, location_id, lotteryId, prize } = qrData;//跳链页面类型,

    let url = '';
    switch (resType) {
      //跳转到卡券领取页面
      case 'card':
        url = '../../page/common/pages/card_summary?id=' + resId + '&activityId=' + activityId + '&source=2' + '&qrEntry=1';
        break;
      //大屏大转盘领取优惠券
      case 'lottery':
        url = '../../page/common/pages/card_summary?id=' + resId + '&activityId=' + activityId + '&lotteryId=' + lotteryId + '&source=2' + '&qrEntry=1';
        break;
      //商品详情页面
      case 'goods':
        url = '../../page/common/pages/goods-detail?prodId=' + resId + '&action=' + action + '&qrEntry=1';
        break;
      //赠品领取页面
      case 'trial':
        url = '../../page/home/pages/present-apply?qrEntry=1&options=';
        app.api.fetchApi('trial/item/' + resId, (err, response) => {
          if (err) reject(err);
          let { rtnCode, data } = response;
          if (rtnCode != 0) {
            reject(rtnCode);
          }
          url = url + JSON.stringify(data);
        })
        break;
    //无这个页面
      case 'redbox':
        url = '../../redbox/redbox?qrEntry=1';
        break;
      //一键开团
      case 'groupbuy':
        url = '../../page/group-buying/group-buying?prodId=' + resId + '&groupbuyId=' + groupbuyId + '&sellout=' + sellout + '&qrEntry=1';
        break;
      //去参团
      case 'gobuy':
        url = '../../page/group-buying?prodId=' + resId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId + '&qrEntry=1';
        break;
      //去秒杀
      case 'seckill':
        url = '../../page/common/pages/goods-detail?prodId=' + resId + '&productPrice=' + price + '&skPrice=' + skPrice + '&activityStatus=' + status + '&expireTime=' + expire_time + '&hadnum=' + hadnum + '&pskid=' + pskId + '&qrEntry=1';
        break;
      //首页
      default:
        url = '';
        break;
    }
  
    if (url.length > 0) {
      wx.redirectTo({
        url
      });
    } else {
      wx.switchTab({
        url: `../../page/tabBar/home/index-new?locationid=${locationId}`,
      });
    }
    wx.hideLoading();
  },

})