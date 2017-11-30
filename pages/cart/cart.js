var app = getApp();
// pages/cart/cart.js
Page({
  data:{
    page:1,
    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    total: 0,
    carts: [],
    datalist:[],
    cartSHow:true
  },
  goindex:function(){
    var url = "../index-new/index-new";
    if (url) {
      wx.switchTab({ url });
    }
  },
bindMinus: function(e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;
    console.log(num);
    // 如果只有1件了，就不允许再减了
    if (num > 1) {
      num --;
    }
    console.log(num);
    var cart_id = e.currentTarget.dataset.cartid;
    //调用接口啦
    var user_id = app.d.userId;
    let url = 'shop/up_cart';
    app.api.postApi(url, { user_id, num, cart_id }, (err, resp) => {       
      console.log({ err, resp });
      if (err) {
        return this._showError('加载数据出错，请重试');
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }

      var status = data.status;
      console.log('数据返回状态status');
      console.log(status);
      if (status == 1) {
        // 只有大于一件的时候，才能normal状态，否则disable状态
        var minusStatus = num <= 1 ? 'disabled' : 'normal';
        // 购物车数据
        var carts = that.data.carts;
        carts[index].num = num;
        // 按钮可用状态
        var minusStatuses = that.data.minusStatuses;
        minusStatuses[index] = minusStatus;
        // 将数值与状态写回
        that.setData({
          minusStatuses: minusStatuses
        });
        that.sum();
      } else {
        wx.showToast({
          title: '操作失败！',
          duration: 2000
        });
      }

    });
},

bindPlus: function(e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;
    // 自增
    num ++;
    console.log(num);
    var cart_id = e.currentTarget.dataset.cartid;
    //调用接口啦
    var user_id = app.d.userId;
    let url = 'shop/up_cart';
    app.api.postApi(url, { user_id, num, cart_id }, (err, resp) => {
      console.log({ err, resp });
      if (err) {
        return this._showError('加载数据出错，请重试');
      }

      let { rtnCode, rtnMessage, data } = resp;
      if (rtnCode != 0) {
        return this._showError(rtnMessage);
      }

      var status = data.status;
      console.log('数据返回状态status');
      console.log(status);
      if (status == 1) {
        // 只有大于一件的时候，才能normal状态，否则disable状态
        var minusStatus = num <= 1 ? 'disabled' : 'normal';
        // 购物车数据
        var carts = that.data.carts;
        carts[index].num = num;
        // 按钮可用状态
        var minusStatuses = that.data.minusStatuses;
        minusStatuses[index] = minusStatus;
        // 将数值与状态写回
        that.setData({
          minusStatuses: minusStatuses
        });
        that.sum();
      } else {
        wx.showToast({
          title: '操作失败！',
          duration: 2000
        });
      }

    });
}, 

bindCheckbox: function(e) {
  /*绑定点击事件，将checkbox样式改变为选中与非选中*/
  //拿到下标值，以在carts作遍历指示用
  var index = parseInt(e.currentTarget.dataset.index);
  //原始的icon状态
  var selected = this.data.carts[index].selected;
  var carts = this.data.carts;
  // 对勾选状态取反
  carts[index].selected = !selected;
  // 写回经点击修改后的数组
  this.setData({
    carts: carts
  });
  this.sum()
},

bindSelectAll: function() {
  var that = this;
   // 环境中目前已选状态
   var selectedAllStatus = this.data.selectedAllStatus;
   // 取反操作
   selectedAllStatus = !selectedAllStatus;
   // 购物车数据，关键是处理selected值
   var carts = this.data.carts;
   // 遍历
   for (var i = 0; i < carts.length; i++) {
     carts[i].selected = selectedAllStatus;
   }
   this.setData({
     selectedAllStatus: selectedAllStatus,
     carts: carts
   });
   this.sum();
 },
//去结算
bindCheckout: function() {
   // 初始化toastStr字符串
   var toastStr = '';
   // 遍历取出已勾选的cid
   for (var i = 0; i < this.data.carts.length; i++) {
     if (this.data.carts[i].selected) {
       toastStr += this.data.carts[i].id;
       toastStr += ',';
     }
   }
   if (toastStr==''){
     wx.showToast({
       title: '请选择要结算的商品！',
       duration: 2000
     });
     return false;
   }
  
   //let url = '../shopping/buy?prodId=89&skuid=56&num=2&cartId=' + toastStr;
   let url = './buy?prodId=89&skuid=56&num=2&cartId=' + toastStr;
   wx.navigateTo({ url });
 },

 bindToastChange: function() {
   this.setData({
     toastHidden: true
   });
 },

sum: function() {
  var that = this;
    var carts = this.data.carts;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        total += carts[i].num * carts[i].price;
      }
    }
    // 写回经点击修改后的数组
    that.setData({
      carts: carts,
      total: '¥ ' + total
    });
    if (that.data.carts.length<=0) {
      that.setData({
        cartSHow: false
      })
    }else{
      that.setData({
        cartSHow: true
      })
    }
  },


onLoad:function(options){
  var that = this; 
  that.loadProductData();
  that.sum();
  if (that.data.carts.length <= 0) {
    that.setData({
      cartSHow: false
    })
  } else {
    that.setData({
      cartSHow: true
    })
  }
    /*
     app.api.fetchApi('shop/hotsale/2', (err, response) => {
      var datalist = response.data;
      console.log(datalist,1111);
      that.setData({
        datalist: datalist
      })
      //console.log(typeof datalist,"ddkddd")
    });
    */
      var product_type = 2;  //拼团商品推荐
      let url = 'shop/hotLists';
      app.api.postApi(url, { product_type }, (err, response) => {    
     //app.api.fetchApi('shop/hotsale/2', (err, response) => {
       wx.hideLoading();
       if (err) return;
       let { rtnCode, rtnMessage, data } = response;
       if (rtnCode != 0) return;
       console.log('购物车下面的推荐数据：');
       console.log(data);
       //let hotsaleGoing = [], hotsaleIncoming = [];
       let hotsaleGoing = data;
       this.setData({ hotsaleGoing });
     }); 
},




onShow:function(){
  this.loadProductData();
  // 页面显示
  //this.startCountDown();
},
onHide: function () {
  // 页面隐藏
  //this.stopCountDown();
},
removeShopCard:function(e){
    var that = this;
    var cart_id = e.currentTarget.dataset.cartid;
    wx.showModal({
      title: '提示',
      content: '你确认移除吗',
      success: function(res) {
        let url = 'shop/delete_cart';
        res.confirm && app.api.postApi(url, { cart_id }, (err, resp) => {
          console.log({ err, resp });
          if (err) {
            return this._showError('加载数据出错，请重试');
          }

          let { rtnCode, rtnMessage, data } = resp;
          if (rtnCode != 0) {
            return this._showError(rtnMessage);
          }

          var status = data.status;
          console.log('数据返回状态status');
          console.log(status);
          if (status == 1) {
            that.loadProductData();
          } else {
            wx.showToast({
              title: '操作失败！',
              duration: 2000
            });
          }

        });        
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

// 数据案例
  loadProductData:function(){
    var that = this;
    let carts;
    wx.showLoading({ title: '加载中' });
    let url = 'shop/index';
    app.api.fetchApi(url, (err, response) => {
      wx.hideLoading();
      if (err) return;
      let { rtnCode, rtnMessage, data } = response;
      if (rtnCode != 0 && rtnMessage) {
        rtnMessage = rtnMessage || '加载商品信息出错';
        wx.showToast({
          title: rtnMessage,
          icon: 'loading',
          duration: 2000
        });
        return;
      }
      //console.log('购物车信息data.data');
      //console.log(data.data);
      console.log('购物车信息data');
      console.log(data);
      var cart = data;
      console.log("购物车数据");
      console.log(cart);
      this.setData({
        carts: cart,
      });
      if (cart.length <= 0) {
        that.setData({
          cartSHow: false
        })
      } else {
        that.setData({
          cartSHow: true
        })
      }
      //console.log('购物车');
      //console.log(carts);
    });
  },

  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../image/error.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },



  //计时器
  /**
   * 闪购活动倒计时
   */
  startCountDown() {
    this.timer = setInterval(() => {
      let { hotsaleGoing, hotsaleIncoming } = this.data;
      let now = new Date().getTime();

      // 即将开始
      for (let i = hotsaleIncoming.length - 1; i >= 0; i--) {
        let item = hotsaleIncoming[i];
        let validTime = item.validTime * 1000;
        let leftTime = (validTime - now) / 1000;
        if (leftTime < 0) {
          hotsaleIncoming.splice(i, 1);   // 到了开始时间，从[即将开始]里删除
          hotsaleGoing.unshift(item);    // 并将项目添加到[正在进行]的头部
          continue;
        }
        item.countDown = this.countDown(leftTime);
      }

      // 正在进行
      for (let i = hotsaleGoing.length - 1; i >= 0; i--) {
        let item = hotsaleGoing[i];
        let expireTime = item.expireTime * 1000;
        let leftTime = (expireTime - now) / 1000;
        if (leftTime < 0) {
          hotsaleGoing.splice(i, 1);   // 到了失效时间，从活动里删除
          continue;
        }
        item.countDown = this.countDown(leftTime);
      }

      // hotsaleGoing.forEach(item => {
      //   let expireTime = Date.parse(item.expireTime);
      //   let leftTime = Math.abs(now - expireTime) / 1000;
      //   item.countDown = this.countDown(leftTime);
      // });
      // hotsaleIncoming.forEach(item => {
      //   let validTime = Date.parse(item.validTime);
      //   let leftTime = Math.abs(now - validTime) / 1000;
      //   item.countDown = this.countDown(leftTime);
      // });

      this.setData({ hotsaleGoing, hotsaleIncoming });
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
    let day = parseInt(leftTime / 24 / 60 / 60);
    let hour = parseInt((leftTime - day * 24 * 60 * 60) / 60 / 60);
    let minute = parseInt((leftTime - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
    let second = parseInt(leftTime - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);

    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;

    return { day, hour, minute, second };
  },
  onShareAppMessage(res) {
    return { title: '', path: '' }
  },  
  //跳到拼团商品详情页
  goGroupDetail(e) {
    //console.log(e);
    var prodId = e.currentTarget.dataset.productid;
    var groupbuyId = e.currentTarget.dataset.groupbyid;
    var selldetail = e.currentTarget.dataset.selldetail;
    wx.navigateTo({
      //url: '../group-buying/group-buying?prodId={{item.productId}}&groupbuyId={{item.groupbuyId}}&sellout={{datasellin}}'
      url: '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + selldetail
    })
  },

})