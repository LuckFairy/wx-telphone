// pages/card/card_summary.js
var app = getApp();
var isDoGetCard = false;
Page({
    data: {},
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        let {cardId, saved, activityId, qrEntry} = options;
        console.log('current card summary options=' + options);
        if (saved) {
            let checkQrImgUrl = wx.getStorageSync('checkQrImgUrl');
            this.setData({ saved: saved, checkQrImgUrl: checkQrImgUrl });
        }
        this.setData({ qrEntry: qrEntry });
        this.loadData(cardId, activityId);


    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },

    loadData: function (cardId, activityId) {
        if (cardId) {
            app.api.postApi('card/detail', { cardId: cardId, activityId, activityId }, (err, response) => {
                if (err) return;
            let {rtnCode, data} = response;
            if (rtnCode != 0) return;
            //更新数据
            if (data.mchDesc) {
                let len = data.mchDesc.length;
                if (len > 200) data.mchDesc = data.mchDesc.substring(0, 200);
            }
            this.setData({ loading: false, cardInfo: data });
            wx.hideLoading();
            //保存当前卡券数据到本地
            wx.setStorageSync('currentCardInfo', data);
        });
        }
    },

    //-----保存卡券动作
    saveCard: function (event) {
        if (isDoGetCard) {
            return;
        }
        isDoGetCard = true;
        if(wx.showLoading) {
            wx.showLoading({title: '正在保存'});
        }
        let cardId = event.currentTarget.dataset.cardId;
        let cardInfo = wx.getStorageSync('currentCardInfo');
        //--发起领券请求。
        app.api.postApi('card/requestForNodeJs', { cardId: cardId, interfaceName: 'pickup', activityId: cardInfo.activityId }, (err, response) => {
            if (err) {
                wx.hideLoading();
                isDoGetCard = false;
                wx.showToast({
                    title: '领券失败，请重试。',
                });
                return;
            }
            let {rtnCode, data} = response;
        if (rtnCode != 0) {
            wx.hideLoading();
            isDoGetCard = false;
            wx.showToast({
                title: '领券失败。',
            });
            return;
        }
        if (data.hit === false){
            if (wx.hideLoading) { wx.hideLoading()};
            isDoGetCard = false;
            wx.showToast({
                title: '库存不足，领券失败。',
            });
            return;
        }
        this.setData({ isUsedOrGet: true });
        wx.showModal({
            title: '该优惠券已放进"卡包·待使用"',
            content: '',
            showCancel: true,
            confirmText: "去看看",
            confirmColor: "#010101",
            success: function (res) {
                if (res.confirm) {
                    // wx.switchTab({ url: './mycard' });
                    wx.navigateTo({
                      url: './mycard',
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        });
        wx.hideLoading();
        isDoGetCard = false;
    });
    },

    saveCardOld: function (event) {
        if (isDoGetCard) {
            return;
        }

        isDoGetCard = true;
        if(wx.showLoading) {
            wx.showLoading({title: '正在保存'});
        }
        let cardId = event.currentTarget.dataset.cardId;
        let cardInfo = wx.getStorageSync('currentCardInfo');
        Promise.all([this.cardSaveRequest(cardId, cardInfo.activityId)]).then(retData => {
            this.setData({ isUsedOrGet: true });
        wx.showModal({
            title: '该优惠券已放进"卡包·待使用"',
            content: '',
            showCancel: true,
            confirmText: "去看看",
            confirmColor: "#010101",
            success: function (res) {
                if (res.confirm) {
                    // wx.switchTab({ url: './mycard' });
                  wx.navigateTo({
                    url: './mycard',
                  })
                } else if (res.cancel) {
                    console.log('用户点击取消');
                }
            }
        });
        wx.hideLoading();
        isDoGetCard = false;
    }).catch(err => {
            wx.hideLoading();
        isDoGetCard = false;
        wx.showToast({
            title: '领券失败，请重试。',
        });
    });
    },


    cardSaveRequest: function (cardId, activityId) {
        return new Promise((resolve, reject) => {
                app.api.postApi('card/requestForNodeJs', { cardId: cardId, interfaceName: 'pickup', activityId: activityId }, (err, response) => {
                if (err) reject(err);
        let {rtnCode, data} = response;
        if (rtnCode != 0) {
            reject(response);
        }
        resolve(data);
    });
    });
    },

    closeOverlay: function () {
        this.setData({ showOverlay: false });
    },
    showOverlay: function () {
      var that=this;
      wx.showLoading({ title: '加载中...', mask: true, });
      //3秒后执行
      setTimeout(function () {

        that.setData({ showOverlay: true, isUsedOrGet: true });
        wx.hideLoading(); 
      }, 3000);
      //wx.showToast({ title: "提交成功", icon: "success", duration: 3000 });

      //this.setData({ showOverlay: true, isUsedOrGet: true });
    }
})