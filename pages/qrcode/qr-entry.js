// pages/qrcode/qr-entry.js
import { getUrlQueryParam } from '../../utils/util';
import { Api } from '../../utils/api_2';

var app = getApp(); 
var qrData = '';
var checkTimer = null;


Page({
    data: {
      store_id: '',
      uid: '',
      locationId:0
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        let {q} = options;
        let that = this;
        var store_id = app.store_id;//store_id    

        Api.signin();//获取以及存储uid
        //获取uid
        let uid = wx.getStorageSync('userUid');
        console.log('用户的uid：');
        console.log(uid);
        wx.showLoading({ title: '加载中...', mask: true, });
        if (q) {
            q = decodeURIComponent(q);
            try {
                let params = getUrlQueryParam(q, 'data');
                qrData = JSON.parse(params);
                let locationId = qrData.location_id;
                if (!locationId){
                  locationId =0;
                }
                wx.setStorageSync('locationId', locationId);//存储locationId
                let waitTime = 0;
                let intervalTime = 2000;
                //在登录成功后调用。
                if (checkTimer) {
                    clearInterval(checkTimer);
                }
                checkTimer = setInterval(() => {
                  if(waitTime > 30000){//超过5秒等待直接跳转到首页。
                    clearInterval(checkTimer);
                    wx.showModal({
                        title: '请求结果',
                        content: '等待超时，跳转到首页',
                    });

                    wx.switchTab({
                      url: '../index-new/index-new',
                    });
                }
                waitTime += intervalTime;
                if (uid) {
                  that.setData({ uid: uid, store_id, locationId });
                  clearInterval(checkTimer);
                  wx.hideLoading();
                  that.redirctPageNew();   // 加载数据，关闭定时器
                } else {
                  console.log('没有取的用户id，继续请求');
                  Api.signin();//获取以及存储uid
                  var uid = wx.getStorageSync('userUid');
                  if (uid) {
                    that.setData({ uid: uid, store_id, locationId });
                    clearInterval(checkTimer);
                    wx.hideLoading();
                    that.redirctPageNew();   // 加载数据，关闭定时器
                  }

                }
                
            }, intervalTime);
            } catch (e) {
                wx.switchTab({
                  url: '../index-new/index-new',
                });
            }


        }
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
        // this.redirctPage();
        //this.redirctPageNew();
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },

    redirctPage: function () {
        Promise.all([this.buildRedirctUrl(), this.checkUserFirstVisit()]).then(rtnData => {
            let url = rtnData[0];
        wx.redirectTo({
            url: url
        });
    }).catch(err => {
            wx.switchTab({
            url: '../index/index'
        });
    });
    },


    checkUserFirstVisit: function () {
        let locId = qrData.locationId;
        return new Promise((resolve, reject) => {
                app.api.postApi('user/checkUserFirstVisit', { locationId: locId }, (err, response) => {
                if (err) return;
        let {rtnCode, data} = response;
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

        let url = '../index/index';

        if (resType == 'card') {//跳转到卡券领取页面
          url = '../card/card_summary?cardId=' + resId + '&activityId=' + activityId + '&qrEntry=1';
          resolve(url);
        } else if (resType == 'goods') {//商品详情页面
          //url = '../shopping/buy?prodId=' + resId + '&qrEntry=1';
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




    redirctPageNew: function () {
      this.buildRedirctUrlNew();
      this.checkUserFirstVisitNew();
    },
    //绑定用户归属门店
    checkUserFirstVisitNew: function () {
        
        var params = {
          store_id: this.data.store_id,
          item_store_id: this.data.locationId,
          uid: this.data.uid

        }
        app.api.postApi('screen.php?c=index&a=binding_user', { params }, (err, resp) => {

          if (err) return;
          
          return true;
        });

    },


    buildRedirctUrlNew: function () {
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
        //2017年12月29日17:07:24 by leo 新品试用
        let action = qrData.action; //



        let url = '';
        if (resType == 'card') {//跳转到卡券领取页面
            //url = '../card/card_summary?cardId=' + resId + '&activityId=' + activityId + '&qrEntry=1';
          url = '../card/card_summary?id=' + resId + '&source=2'+ '&qrEntry=1';
        } else if (resType == 'goods') {//商品详情页面
          //url = '../shopping/buy?prodId=' + resId + '&qrEntry=1';

          // if (action =='present'){
          //   url = '../shopping/goods-detail?prodId=' + resId + '&action=present' + '&qrEntry=1';
          // }else{
          //   url = '../shopping/goods-detail?prodId=' + resId + '&qrEntry=1';
          // }

          //url = '../shopping/buy?prodId=' + resId + '&action=' + action + '&qrEntry=1';
          url = '../shopping/goods-detail?prodId=' + resId + '&action=' + action + '&qrEntry=1';  
          
        } else if (resType == 'trial') {//赠品领取页面
            url = '../present/present-apply?qrEntry=1&options=';
            app.api.fetchApi('trial/item/' + resId, (err, response) => {
                if (err) reject(err);
            let {rtnCode, data} = response;
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
        } else if (resType == 'hotsale') { //热销专区
          url = '../index-new/index-hotsale?categoryid=101&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
        } else if (resType == 'festival') { //活动专区
          url = '../index-new/index-festival?categoryid=105&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
        } else if (resType == 'goods') { //百货专区
          url = '../index-new/index-goods?categoryid=102&page=1&store_id=' + this.data.store_id + '&qrEntry=1';
        } else if (resType == 'mycard') { //我的卡包
          url = '../card/mycard' + '&qrEntry=1';
        }

        if(url){
            wx.redirectTo({
                url: url
            });
        }else{
            wx.switchTab({
              url: '../index-new/index-new'
            });
        }
    },

})