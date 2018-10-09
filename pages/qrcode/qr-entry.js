// pages/qrcode/qr-entry.js
import { getUrlQueryParam } from '../../utils/util.js';

let app = getApp();
let qrData = '';
let locationId = 155;
let indexUrl = '../../page/tabBar/home/index-new';
Page({
  data: {
    store_id: '',
    uid: null,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    let {q} = options;
    let that = this;
    var store_id = app.store_id; //store_id    
    var uid = wx.getStorageSync('userUid');
    console.log('uid',uid)
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
          setTimeout(function () {
            wx.switchTab({
              url: `${indexUrl}?locationid=${locationId}`,
            })
          }, 1000);
          return;
        }

        if (uid) {
          that.redirctPageNew(); // 加载数据，关闭定时器
        } else {
          setTimeout(() => {
            wx.switchTab({
              url: `${indexUrl}?locationid=${locationId}`,
            });
          }, 3000)
        }

      } catch (e) {
        setTimeout(() => {
          wx.switchTab({
            url: `${indexUrl}?locationid=${locationId}`,
          });
        }, 3000)
      }

    }
    
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    var uid = wx.getStorageSync('userUid');
    if (!uid) {
      setTimeout(function () {
        wx.switchTab({
          url: indexUrl + `?locationid=${locationId}`,
        })
      }, 1000);
      return;
    } 
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  redirctPageNew: function () {
    console.log('进入页面',qrData)
    this.buildRedirctUrlNew();
    this.checkUserFirstVisitNew();
  },
  //绑定用户归属门店
  checkUserFirstVisitNew: function () {
    var params = {
      store_id: this.data.store_id,
      item_store_id: locationId,
      uid: this.data.uid
    }
    app.api.postApi('screen.php?c=index&a=binding_user', { params }, (err, resp) => {
      if (err) return;
      return true;
    });

  },


  buildRedirctUrlNew: function () {
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
    let { resType, resId, activityId, location_id, lotteryId, prize,reditype,rediurl} = qrData;//跳链页面类型,
    //resType跳转类型
    let url = '',store_id = this.data.store_id;
    console.log('qrData', qrData);
    console.log('restype',resType)
    switch (resType) {
        //云屏活动
      case 'cloud_screen': console.log('reditype',reditype,rediurl);
        // reditype栏目1 ，商品2，送券活动4，dm海报5，
        // rediurl对应第二级栏目1爆款专区 2热销专区 3活动专区 4百货专区 5，6,7,8,9宝宝模块 10礼包特卖 11拼团 12增值活动
        if (reditype == "1") {
          switch (rediurl) {
            //四个banner模块
            case "1":  url = `../../page/common/pages/shop-list?categoryid=100&page=1&store_id=${store_id}&title=爆款专区`; break;
            case "2":  url = `../../page/common/pages/shop-list?categoryid=101&page=1&store_id=${store_id}&title=热销专区`; break;
            case "3":  url = `../../page/common/pages/shop-list?categoryid=105&page=1&store_id=${store_id}&title=活动专区`; break;
            case "4":  url = `../../page/common/pages/shop-list?categoryid=102&page=1&store_id=${store_id}&title=百货专区`; break;
            //宝宝模块
            case "5":  url = `../../page/common/pages/index-boabao?listId=0&catId=92`; break;
            case "6":  url = `../../page/common/pages/index-boabao?listId=1&catId=93`; break;
            case "7":  url = `../../page/common/pages/index-boabao?listId=2&catId=94`; break;
            case "8":  url = `../../page/common/pages/index-boabao?listId=3&catId=95`; break;
            case "9":  url = `../../page/common/pages/index-boabao?listId=4&catId=97`; break;
            //礼包特卖模块
            case "10": url = `../../page/common/pages/hotsale?categoryid=104&page=1&store_id=${store_id}`; break;
            //拼团
            case "11": url = `../../page/group-buying/grouplist`; break;
            //增值活动
            case "12": url = `../../page/common/pages/index-mom`; break;
           
          }
        } else if (type == "2") {
          url = `../../page/common/pages/goods-detail?prodId=` + rediurl;
        } else if (type == "4") {
           url = `../../page/common/pages/activity-detail?id=` + rediurl;
        } else if (type = 5) {
          console.log('dm海报');
          url = `../../page/common/pages/index-activity`;
        }
        else {
          console.log('未定义的跳转url');
        }
        break;
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
      default:url = ''; break;
    }
  
    if (url.length > 0) {
      wx.redirectTo({
        url
      });
    } else {
      wx.switchTab({
        url: indexUrl + `?locationid=${locationId}`,
      });
    }
    wx.hideLoading();
  },

})