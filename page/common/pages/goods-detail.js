
const app = getApp();
let groupbuyId = 0;                   //团购ID 兼容团购和爆款
let physical_id = wx.getStorageSync('phy_id'); //门店id
const addOrderUrl = 'wxapp.php?c=order_v2&a=add';//生成订单接口

Page({
  data: {
    error:null,
    loading: false,
    newCartNum: 0,//读取后台购物车数量多少件
    moreChoose: false,
    goPayment: false,//立即下单，增加立即下单
    goAddCard: false,
    shopCoupon: [], //线上优惠券
    coupon_value: [],//线上优惠券面值数组
    coupon_list: [],//线上优惠券数组
    showList: false,//是否显示优惠券列表
    product: [],//产品信息
    product_id: '',//产品id
    action: null,// 'present' 为赠品 ;'havealook'为从订单来查看详细的
    shopNum: 1,//购买数量
    is_add_cart: 1,
    infoProduct:{
      name:'',
      image:'',
      price:0,
      quantity:0,
    },//多属性产品
    property_list: [],//多属性数组，二维数组
    sku_list: [],//多属性数组，一维数组
    sku_id: null,//多属性id
    sku_arr:[],//选择的多属性数组
    store_id: "",
    uid: '',
    preTimeText: { hour: 0, minute: 0, second: 0 },
    preTime: 234,
    isShowPre: false//显示预售商品提示
  },
  onShareAppMessage(res) {
    let that = this;
    let dataset = res.target.dataset;

    return {
      title: dataset.title,
      path: `/page/common/pages/goods-detail?prodId=${that.data.product_id}&action=${that.data.action}`,
      imageUrl: dataset.imgurl
    }
  },
  goStoreServer() {
    wx.navigateTo({
      url: '../../my/pages/server-wechat'
    });
  },
  goNewIndex() {
    wx.switchTab({
      url: '../../tabBar/home/index-new'
    });
  },
  goCart() {
    wx.switchTab({
      url: '../../tabBar/goods/cart'
    });
  },


  onLoad: function (options) {
    wx.hideShareMenu();
    let that = this;
    let store_id = app.store_id;
    let uid = wx.getStorageSync('userUid');
    physical_id = wx.getStorageSync('phy_id')||0;


    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: '../../tabBar/home/index-new',
      })
      return;
    }
    let { prodId = 2159, action } = options;
    if (action) { that.setData({ action }) }
    that.setData({
      uid, store_id, 'product_id': prodId 
    },()=>{
      that.loadCartNum();
      that.loadCoupon();
    })
  },
  onReady: function () {
    
  },
  //多规格 onShow
  onShow: function () {
    this.loadData();
  },
  onHide: function () {
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload: function () {
    // 页面关闭
    this.stopCountDown();
  },
  loadCartNum(){
    let that = this;
    // //购物车的数量
    app.api.postApi('wxapp.php?c=cart&a=cart_list', { "params": { "uid": this.data.uid, "store_id": this.data.store_id } }, (err, resp) => {
     
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        that.setData({
          newCartNum: resp.err_msg.cart_list_number
        });
      }
    });
  },
  loadCoupon(){
    let that =this;
    //线上优惠券信息
    app.api.postApi('wxapp.php?c=coupon&a=store_coupon', { "params": { "uid": this.data.uid, "store_id": this.data.store_id, "product_id": this.data.product_id } }, (err, resp) => {
   
      if (err || resp.err_code != 0) {
        return;
      }
      if (resp.err_code == 0) {
        var coupon_value = [];
        var len = resp.err_msg.coupon_count > 2 ? 2 : resp.err_msg.coupon_count;
        for (var i = 0; i < len; i++) {
          coupon_value.push(resp.err_msg.coupon_value[i]);
        }
        that.setData({
          shopCoupon: resp.err_msg,
          coupon_list: resp.err_msg.coupon_list,
          coupon_value: coupon_value
        });
      }
    });
  },
  loadData() {
    let that = this;
    let { product_id, action,uid,store_id } = that.data;
    this.timer && clearInterval(this.timer);
    wx.showLoading({ title: '加载中' });
    var params = {
      product_id, uid, store_id
    }
    app.api.postApi('wxapp.php?c=product&a=detail_of_product_v4', { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0){console.error(err||resp.err_msg); return;}
        var product = resp.err_msg.product;
        if (action == 'present') {
          console.log('新品试用');
          action = action;
        } else {
          if (product.card_set_ids > 0) {
            console.log('卡包商品');
            action = product.card_set_ids

          } else {
            action = null;
            console.log('普通商品');
          }
        }
        console.log(action,product)
        that.setData({
          product, action, product_id: product.product_id
        },()=>{
          if (product.sold_time <= 0) {
            that.setData({ preTime: product.sold_time })
          } else {
            that.startCountDown(product.sold_time);
          }
        });

    });
  },
  /**购物车立即购买 */
  doGoBuy(e) {
    let that = this;
    let { sku_list,sku_id}=that.data;
    if (sku_list.length > 0) {
      if (!sku_id) {
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        // 选择属性之后发送请求添加到购物车
        that.goTheCar();
      }
    } else {
      // 直接发送请求添加到购物车
      that.goTheCar();
    }

  },
  goTheCar() {
    let that = this;
    let { shopNum, is_add_cart, product_id, sku_id, uid, store_id, sku_list } = that.data;
    var params = {
      uid,
      product_id,
      is_add_cart,
      quantity: shopNum,
      sku_id,
      store_id
    }
    app.api.postApi('wxapp.php?c=cart&a=add', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        wx.showLoading({
          title: '加入购物车成功'
        })
        console.log('加入购物车成功')
        //更新购物车的数量
        var params = {
          uid,
          store_id
        }
        app.api.postApi('wxapp.php?c=cart&a=cart_list', { params }, (err, resp) => {
          if (err || resp.err_code != 0) {
            return;
          }
          if (resp.err_code == 0) {
            console.log('购物车的数量是', resp.err_msg.cart_list_number);
            that.setData({
              newCartNum: resp.err_msg.cart_list_number
            });
          }
        });
        setTimeout(function () {
          wx.hideLoading();
          var moreChoose = false;
          that.setData({ moreChoose });
        }, 1000)
      } else {
        wx.showModal({
          title: '商品提示',
          content: resp.err_msg,
        })
      }
    });
  },
  showCoupon() {
    var showList = this.data.showList;
    showList = !showList;
    this.setData({
      showList
    })
  },
  // 领取优惠券
  getCoupon(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var params = {
      "uid": that.data.uid,
      "store_id": that.data.store_id,
      "id": e.currentTarget.dataset.couponId
    };
    app.api.postApi('wxapp.php?c=coupon&a=get_coupon', { params }, (err, resp) => {
      if (err || resp.err_code != 0) {
        var error = err || resp.err_msg;
        that._showError(error);
        return;
      }
      if (resp.err_code == 0) {
        var coupon_list = that.data.coupon_list;
        coupon_list[index].is_get = 0;
        that.setData({
          coupon_list
        })
        that._showError(resp.err_msg);
      }
    });
  },


  doBuy: function (e) {
    //保存formid
    app.pushId(e).then(ids => {
      app.saveId(ids)
    });
    let that = this;
    that.setData({
      moreChoose: true,
      goPayment: true,
      goAddCard: false
    });

    let {product_id, uid, store_id}=that.data;
    let params = {

      product_id,
      uid,
      store_id
    }
    that.loadCartInfo(params);
  },
  goImageClose() {
    let that = this;
    that.setData({moreChoose: false,});

  },
  gotoCart: function () {
    let url = "../../tabBar/goods/cart";
    wx.reLaunch({ url });
  },

  /* 点击减号 w*/
  bindMinus: function (e) {
    let that = this;
    let shopNum = that.data.shopNum;
    shopNum--;
    if (shopNum <= 1) {
      wx.showLoading({
        title: '不能再少了',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
      that.setData({
        shopNum: 1
      })
    } else {
      that.setData({
        shopNum
      })
    }

  },
  /* 点击加号 w*/
  bindPlus: function (e) {
    let that = this;
   
    let{action,shopNum}=that.data;
    if (action && (action != 0)) {
      // 虚拟商品限购
      wx.showModal({
        title: '提示',
        content: '此商品限购，每人限购1件',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      shopNum++;
      that.setData({
        shopNum
      })
    }
  },
  /* 输入框事件w */
  bindManual: function (e) {
    let that = this;
    var shopNum = e.detail.value;
    if (shopNum <= 1) {
      wx.showLoading({
        title: '不能小于1',
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
      that.setData({
        shopNum: 1
      })
    } else {
      that.setData({
        shopNum
      })
    }
  },
  /**严选，立即购买，一般购买 */
  goPayment(e) {

    let that = this;
    console.log('严选，立即购买，一般购买', e);
    var { product_id, action, sku_list, sku_id, uid, store_id, shopNum, uid, fx_uid} = that.data;

    var opts = {
      uid,
      product_id,
      store_id,
      sku_id,
      physical_id,
      quantity: shopNum,
      fx_uid,
    
    };
    if (sku_list.length > 0 && !sku_id) {
      wx.showLoading({
        title: '请选择属性'
      });
      setTimeout(function () {
        wx.hideLoading()
      }, 2000)
    } else {
      that.getOrderId(opts);
    }

  },
  /*
  *新品试用，立即购买
  */
  goPreApply(e) {

    let that = this;
    var {  sku_list, sku_id, uid, store_id, product_id, shopNum} = that.data;

    var opts = {
      uid,
      product_id,
      store_id,
      quantity: shopNum,
      sku_id,
    };
    
      if (sku_list.length > 0&&!sku_id) {//有无多属性skuid 
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        let url = '../../home/pages/present-apply?prodId=' + product_id + '&skuid=' + sku_id + '&groupbuyId=' + groupbuyId; //2017年8月17日17:18:09 by leo
        wx.navigateTo({ url });
      }

  },
  /*
  *生成订单
  *
  */
  getOrderId(opts) {
    let params = opts,that=this;
    console.log('生成订单参数', params);
    app.api.postApi(addOrderUrl, { params }, (err, rep) => {
      if (err) { console.log('err ', err); return }
      var { err_code, err_msg } = rep;
  
      if (err_code != 0) {
        wx.showModal({
          content: err_msg,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#FF0000',
          confirmText: '好的',
        });

        console.error(err_msg);
        return
      }
      var url = './buy?orderId=' + err_msg.order_no + '&uid=' + that.data.uid + '&baokuan_action=' + that.data.action;
      wx.navigateTo({ url });
    })
  },
  /*
  *加载多少属性列表
  */
  loadCartInfo(params) {
    let that = this; 
    let { infoProduct}=that.data;
    wx.showLoading({
      title: '加载中'
    })
    //多属性列表接口
    app.api.postApi('wxapp.php?c=cart&a=info', { params }, (err, resp) => {
      wx.hideLoading();
      //product商品数据集合,property_list多属性数据集合,sku_list多属性价格库存数据集合

      let { product, property_list = [], sku_list = [] } = resp.err_msg;
      infoProduct.name = product.name; infoProduct.image = product.image;
      if (product.min_price < product.max_price){
        infoProduct.price = `${product.min_price}~${product.max_price}`
      }else{
        infoProduct.price = product.price;
      }
      infoProduct.quantity = product.quantity;
      console.log(property_list);

      that.setData({
        infoProduct,
        property_list,
        sku_list,
       
      });
    });
  },

  //数量增减end
  //加入购物车start w
  addShopCart: function (e) {

    let that = this;
    let {uid,store_id,product_id}=that.data;

    that.setData({
      moreChoose: true,
      product_id,
      goAddCard: true,
      goPayment: false
    },()=>{
      let params = {
        product_id,
        uid,
        store_id
      }
      that.loadCartInfo(params);
    });
  
    
  },
  chooseProperty(e) {

    let that = this;
    let { pid, vid,x,j } = e.currentTarget.dataset;
    let {  sku_list, property_list, infoProduct, sku_id, sku_arr} = that.data;
    let len = property_list.length||0;

    console.log(x,j);
    if(len<1){console.log('没有多属性');return;}
    let arr = property_list[x]["values"];
    for (let k = 0; k < property_list[x]["values"].length;k++) {
      if (k == j) {
        property_list[x]["values"][k].checked = property_list[x]["values"][k].checked ? false : true;
        if (property_list[x]["values"][k].checked){
          sku_arr[x]=j;
        }else{
          sku_arr[x]=null;

        }
      } else {
        property_list[x]["values"][k].checked = false;
      }
    }
    that.setData({ property_list, sku_arr})
    
    let properties = '',num=0;
    for (let n = 0; n < sku_arr.length;n++){
      if (sku_arr[n]!==null){
        num++;
        properties = properties + property_list[n].pid+':'+property_list[n]['values'][sku_arr[n]].vid+';';
      }else{
        num--;
      }
    }
  
    console.log(num);
    if (num < len) { console.log('属性没有选择完');  return; }
    console.log(properties);
    for (let p of sku_list) {
      var m = p.properties + ';';
      if (m == properties){
        if (p.quantity<1){
          wx.showLoading({
            title:'卖完了'
          });
          setTimeout(function () {
            wx.hideLoading();
          }, 2000);
          return;
        }else{
          infoProduct.price = p.price;
          infoProduct.quantity = p.quantity;
          sku_id=p.sku_id;
          that.setData({ sku_id, infoProduct });

        }
      }
    }
   
    

  },
  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    // wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  /**
   * 倒计时处理
   */
  startCountDown(preTime) {

    let now = (new Date().getTime()) / 1000;
    let leftTime = preTime - now;
    if (leftTime <= 0) {
      this.setData({ preTime: leftTime }); return;
    }
    this.timer = setInterval(() => {
      now = (new Date().getTime()) / 1000;
      leftTime = preTime - now;
      let time = this.countDown(leftTime);
      this.setData({ preTimeText: time, preTime: leftTime });
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
    var day = 0, hour = 0, minute = 0, second = 0;
    if (leftTime > 0) {//转换时间  
      day = Math.floor(leftTime / (60 * 60 * 24));
      hour = Math.floor(leftTime / (60 * 60)) - (day * 24);
      minute = Math.floor(leftTime / 60) - (day * 24 * 60) - (hour * 60);
      second = Math.floor(leftTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      hour = day * 24 + hour;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
    } else {
      clearInterval(this.timer);
      this.loadData();
    }
    return { hour, minute, second };
  },
  showPreBuyTip() {
    var that = this;
    that.setData({
      isShowPre: true
    });
    setTimeout(function () {
      that.setData({
        isShowPre: false
      });
    }, 2000);
  }

})