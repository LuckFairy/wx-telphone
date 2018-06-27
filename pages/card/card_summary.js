var app = getApp();
const store_id = app.store_id;
const openid = wx.getStorageSync('openid');
const uid = wx.getStorageSync('userUid');
let saveUrl = 'wxapp.php?c=coupon&a=get_coupon';//保存优化券老接口
let saveNewUrl = 'wxapp.php?c=activity&a=get_hot_coupon';//保存优化券新接口
let getUrl = 'wxapp.php?c=coupon&a=coupon_detail';//优惠券详情接口
let getNewUrl = 'wxapp.php?c=coupon&a=coupon_list_detail';//优惠券详情新接口
let isDoGetCard= false;//是否显示按钮，false显示，true不显示
Page({
  data: {
    showPopup: true,
    showErrMsg: false,
    isTrue: false,
    endTime: '',
    faceMoney: '',
    name: '',
    originalPrice: '',
    startTime: '',
    id: '',
    activityId: '',
    detailData: "",
    distinguish: false,// 判断是否从卡包进来 0是卡包入口
    source: "",
    page: '',//什么页面过来的，‘index’表示index-new过来用新接口
    qrUrl: null,//核销二维码，线上券没有核销二维码
    
  },
  onLoad: function (options) {
    var that = this;
    console.log(options, '新数据');
    let { activityId, id, distinguish, source, page } = options;

    that.setData({
      source,
      page,
      distinguish,
      id,
      activityId
    })
    // 请求详情页数据
    let params = {
      id
    }
    // 判断是否从卡包进来 0是卡包入口,调取老接口
    if (distinguish == 0) { that.getLoad(params) } else { that.getNewLoad(params)}
   

    // console.log('activityId', activityId);
    // console.log('id', id);
    // console.log(uid, 'uid');
    // console.log(openid, 'openid');
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
  /**
   * 我的卡包老接口数据，二维码接入
   */
  getLoad(params) {
    var that = this;
    app.api.postApi(getUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        return;
      }
      var detailData = resp.err_msg;
      if (that.distinguish != 0){
        that.setData({
          detailData,
          qrUrl: detailData.qrUrl
        })
      }else{
        that.setData({
          qrUrl: detailData.qrUrl
        })
      }
      

    });
  },
  /**
   * 首页优惠券领取，接新接口，没有核销二维码
   */
  getNewLoad(params) {
     var that = this;
    app.api.postApi(getNewUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        return;
      }
      var detailData = resp.err_msg;
      that.setData({
        detailData
      })
    });
  },
  goCoupon(e) {
    var start = e.target.dataset.start;
    var end = e.target.dataset.end;
    var detail = e.target.dataset.detail;
    wx.navigateTo({
      url: './card_detail?start=' + start + '&end=' + end + '&detail=' + detail
    })
  },
  /**
   * 保存优惠券
   */
  saveCardNew(e) {
    let that = this;
    let { activityId, id }= e.currentTarget.dataset;
 
    var params = {
      activityId,
      id,
      store_id,
      uid
    }
    var url = saveUrl;
    if (that.data.page == 'index') {
      url = saveNewUrl;
      params = {
        store_id,// 店铺id
        coupon_id: id,// 优惠券id
        uid// 用户id
      }
    }
    //console.log('获取优惠券的请求参数', params);return;
    // 小猪新数据
    app.api.postApi(url, { params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        // that.getNewLoad({
        //   "params":{id}
        // });//获取核销二维码
        isDoGetCard = true;//isUsedOrGet隐藏按钮
        that.setData({  source: false });//将按钮变成立即使用
        // 领取成功
        wx.showModal({
          title: '该优惠券已放进"卡包·待使用"',
          showCancel:false,
          confirmText:'去看看',
          success: function (res) {
            if (res.confirm) {
              wx.redirectTo({
                url: './mycard'
              })
            } else if (res.cancel) {
              return false;
            }
          }
        })

      } else {
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
  colorPopup() {
    this.setData({
      showPopup: false
    })
  },
  getCards() {
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
        let { rtnCode, data } = response;
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
    if (wx.showLoading) {
      wx.showLoading({ title: '正在保存' });
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
      let { rtnCode, data } = response;
      if (rtnCode != 0) {
        wx.hideLoading();
        isDoGetCard = false;
        wx.showToast({
          title: '领券失败。',
        });
        return;
      }
      if (data.hit === false) {
        if (wx.hideLoading) { wx.hideLoading() };
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
    if (wx.showLoading) {
      wx.showLoading({ title: '正在保存' });
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
        let { rtnCode, data } = response;
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
    var that = this;
    wx.showLoading({ title: '加载中...', mask: true, });
    setTimeout(function () {
      that.setData({ showOverlay: true, isUsedOrGet: false });
      wx.hideLoading();
    }, 500);
  }
})