// pages/card/card_summary.js
var app = getApp();
import { store_Id } from '../../utils/store_id';
var isDoGetCard = false;
Page({
    data: {
      showPopup:true,
      showErrMsg:false,
      isTrue:false,
      endTime:'',
      faceMoney:'',
      name:'',
      originalPrice:'',
      startTime:'',
      id:'',
      activityId:'',
      detailData:"",
      distinguish:"",
      source:""
    },
    onLoad: function (options) {
      var that = this;
      console.log(options,'新数据');
      var activityId = options.activityId;
      var id = options.id;
      var distinguish = options.distinguish;
      var source = options.source;
      that.setData({
        source
      })
      // 请求详情页数据
      var params = {
        id
      }
      // 判断是否从卡包进来 0是卡包入口
      if (distinguish==0){
        app.api.postApi('wxapp.php?c=coupon&a=coupon_detail', { params }, (err, resp) => {
          wx.hideLoading();
          if (err) {
            return;
          }
          if (resp) {
            console.log("详情页数据1", resp);
            var detailData = resp.err_msg;
            that.setData({
              detailData
            })
          }
        });
      }else{
        app.api.postApi('wxapp.php?c=coupon&a=coupon_list_detail', { params }, (err, resp) => {
          wx.hideLoading();
          if (err) {
            return;
          }
          if (resp) {
            console.log("详情页数据2", resp);
            var detailData = resp.err_msg;
            that.setData({
              detailData
            })
          }
        });
      }
      that.setData({
        id: id,
        activityId: activityId
      })
      console.log('activityId', activityId);
      console.log('id', id);
      var store_id = store_Id.store_Id();
      var uid = wx.getStorageSync('userUid');
      var openId = wx.getStorageSync('userOpenid');
      console.log(uid, 'uid');
      console.log(store_id, 'store_id');
      console.log(openId, 'openId');
        // 页面初始化 options为页面跳转所带来的参数
        // let {cardId, saved, activityId, qrEntry} = options;
        // console.log('current card summary options=' + options);
        // if (saved) {
        //     let checkQrImgUrl = wx.getStorageSync('checkQrImgUrl');
        //     this.setData({ saved: saved, checkQrImgUrl: checkQrImgUrl });
        // }
        // this.setData({ qrEntry: qrEntry });
        // this.loadData(cardId, activityId);
    },
    goCoupon(e){
      console.log(e,'点击到详情参数')
      var start = e.target.dataset.start;
      var end = e.target.dataset.end;
      var detail = e.target.dataset.detail;
      wx.navigateTo({
        url: './card_detail?start=' + start + '&end=' + end + '&detail=' + detail
      })
    },
    saveCardNew(e){
      var that = this;
      var store_id = store_Id.store_Id();
      var uid = wx.getStorageSync('userUid');
      var activityId = e.currentTarget.dataset.activityId;
      var id = e.currentTarget.dataset.id;
      var params = {
        activityId,
        id,
        store_id,
        uid
      }
      // 小猪新数据
      app.api.postApi('wxapp.php?c=coupon&a=get_coupon', { params }, (err, resp) => {
        wx.hideLoading();
        if(err){
          return;
        }
        if (resp.err_code==0){
          // 领取成功
          wx.showModal({
            title: '领券成功',
            content: '该优惠券已经放进卡包待使用',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: './mycard'
                })
              } else if (res.cancel) {
                return false;
              }
            }
          })

        }else{
          // 券已经被领完了
          wx.showLoading({
            title: '券已经领完了',
          })
          setTimeout(function () {
            wx.hideLoading()
          }, 2000)
        }
      });
    },
    //关闭弹出层
    colorPopup(){
      this.setData({
        showPopup:false
      })
    },
    getCards(){
      console.log(111)
      this.setData({
        isTrue: true
      })
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
      setTimeout(function () {
        that.setData({ showOverlay: true, isUsedOrGet: false });
        wx.hideLoading(); 
      }, 500);
    }
})