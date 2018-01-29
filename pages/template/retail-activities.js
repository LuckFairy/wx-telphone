var app = getApp();
var ActivityScript = {

  loadTemplateData: function (thisObj, cateId, curSwiperIdx, needHeader = true) {
    var that = thisObj;

    // 顶部选项卡信息

    app.api.postApi('wxapp.php?c=coupon&a=get_category_activity', {}, (err, response) => {
      
      if(err){
        return false;
      }
      if (response){
        console.log("选项卡返回信息", response);
        var err_msg = response.err_msg;
        console.log(err_msg[1].activityAlias)
        that.setData({
          err_msg: err_msg
        })
      }
    });
    // 顶部选项卡信息结束




    wx.showLoading({
      title: '加载中...',
    });
    //注册模板事件函数
    thisObj.getCard = this.getCard;
    thisObj.swiperChange = this.swiperChange;
    thisObj.swichSwiperItem = this.swichSwiperItem;
    thisObj.hideOverlay = this.hideOverlay;

    try {
      curSwiperIdx = wx.getStorageSync('curSwiperIdx');
    } catch (e) { }
    if (isNaN(curSwiperIdx)) {
      curSwiperIdx = '0';
    }

    app.api.postApi('card/getCategoryActivities', { categoryId: cateId }, (err, response) => {
      if (err) {
        wx.hideLoading();
        return;
      }
      let { rtnCode, data: activityList } = response;
      if (rtnCode != 0) {
        wx.hideLoading();
        return;
      }
      if (activityList) {
        app.api.postApi('card/getCardListByActivityCategory', { cateId: cateId }, (err, response) => {
          if (err) return wx.hideLoading();
          let { rtnCode, data: cardList } = response;
          if (rtnCode != 0) return wx.hideLoading();

          let templateData = {
            needHeader: needHeader,
            curSwiperIdx: curSwiperIdx < curSwiperIdx.length ? curSwiperIdx : 0,
            activityList: activityList,
            cardList: cardList
          };
          //更新数据
          thisObj.setData({ loading: false, templateData: templateData });
          // wx.setStorageSync('activityTemplateData', templateData);
          wx.hideLoading();
        });
      }

    });
  },


  swiperChange: function (event) {
    let templateData = this.data.templateData;
    templateData.curSwiperIdx = event.detail.current;
    this.setData({
      templateData: templateData
    });
    wx.setStorageSync('curSwiperIdx', event.detail.current);
  },
  swichSwiperItem: function (event) {
    let templateData = this.data.templateData;
    templateData.curSwiperIdx = event.currentTarget.dataset.idx;
    this.setData({
      templateData: templateData
    });
  },

  //-------------------优惠券----------------------
  getCard: function (event) {
    var available = event.currentTarget.dataset.available;
    var cardId = event.currentTarget.dataset.cardId;
    var activityId = event.currentTarget.dataset.activityId;

    if (available) {
      wx.navigateTo({
        url: '../card/card_summary?cardId=' + cardId + '&activityId=' + activityId
      });
    } else {
      // let templateData = wx.getStorageSync('activityTemplateData');
      let templateData = this.data.templateData;
      templateData.showOverlay = '1';
      templateData.overlayText = "您已经领过啦，试试领别的吧";
      this.setData({ templateData: templateData });
    }

  },

  hideOverlay: function (event) {
    // let templateData = wx.getStorageSync('activityTemplateData');
    let templateData = this.data.templateData;
    templateData.showOverlay = '0';
    this.setData({ templateData: templateData });
  },

}


module.exports = { ActivityScript };