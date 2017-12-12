// pages/qrcode/qr-entry.js
import { getUrlQueryParam } from '../../utils/util';

var app = getApp();
var qrData = '';
var checkTimer = null;
Page({
    data: {},
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        let {q} = options;
        let that = this;
        if (q) {
            q = decodeURIComponent(q);
            try {
                let params = getUrlQueryParam(q, 'data');
                qrData = JSON.parse(params);
                let waitTime = 0;
                let intervalTime = 200;
                //在登录成功后调用。
                if (checkTimer) {
                    clearInterval(checkTimer);
                }
                checkTimer = setInterval(() => {
                        if(waitTime > 30000){//超过5秒等待直接跳转到首页。
                    clearInterval(checkTimer);
                    wx.showModal({
                        title: '',
                        content: '',
                    });

                    wx.switchTab({
                        url: '../index/index',
                    });
                }
                waitTime += intervalTime;
                if (getApp().hasSignin) {
                    clearInterval(checkTimer);
                    that.redirctPageNew();   // 加载数据，关闭定时器
                }
            }, intervalTime);
            } catch (e) {
                wx.switchTab({
                    url: '../index/index',
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

    redirctPageNew: function () {
        this.buildRedirctUrlNew();
        this.checkUserFirstVisitNew();
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

    checkUserFirstVisitNew: function () {
        app.api.postApi('user/checkUserFirstVisit', { locationId: locId }, (err, response) => {
            if (err) return;
        let {rtnCode, data} = response;
        if (rtnCode != 0) {
        } else {
        }
        return true;
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
            let {rtnCode, data} = response;
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
          url = '../index-new/goods-detail?prodId=' + resId + '&productPrice=' + price + '&skPrice=' + skPrice + '&activityStatus=' + status + '&expireTime=' + expire_time + '&hadnum=' + hadnum + '&pskid=' + pskId  + '&qrEntry=1';
        }
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



        let url = '';
        if (resType == 'card') {//跳转到卡券领取页面
            url = '../card/card_summary?cardId=' + resId + '&activityId=' + activityId + '&qrEntry=1';
        } else if (resType == 'goods') {//商品详情页面
            //url = '../shopping/buy?prodId=' + resId + '&qrEntry=1';
            url = '../shopping/goods-detail?prodId=' + resId + '&qrEntry=1';
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
        }
        if(url){
            wx.redirectTo({
                url: url
            });
        }else{
            wx.switchTab({
                url: '../index/index'
            });
        }
    },

})