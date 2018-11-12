let app = getApp();
let errModalConfig = {
  title: '有错误！',
};
const shoppUrl = 'wxapp.php?c=order_v2&a=add_by_cart';
const physicalUrl = 'wxapp.php?c=physical&a=qrcode_physical_list';//las门店列表接口
const physicalMainUrl = 'wxapp.php?c=physical&a=main_physical';//总店信息
const _saomaProdUrl = 'wxapp.php?c=qrproduct_v2&a=inventory';//扫码购商品列表
const _couponUrl ='wxapp.php?c=coupon&c=coupon_v2&a=inventory';//优惠券列表
Page({
  data: {
    uid:null ,
    sid: null,
    phy_id: null,//门店id
    hasShop: 0,//购物车数量
    cart_list: [],//购物车列表
    selectedAllStatus: true,//默认不全选
    total: "0.00",//结算合计金额
    cartSHow: false,//是否显示底部结算
    showErrModal: false,
    input:false,//不是输入弹窗
    coupon_value: [],//线上优惠券面值数组
    inputValue:'',
    // locationTip:"定位中...",
//最近门店信息
    phyDefualt: [],//默认门店信息
    changeFlag: true,//是否切换门店
    isShowTip:false,
    hasConfig:false
  },
  onLoad: function (options) {
    let that = this;
    let { uid, sid,  phy_id}=that.data;
    uid = app.globalData.uid, sid = app.globalData.sid, phy_id = app.globalData.phyid || 154;
    console.log(app.globalData.uid);
    if (!uid) {
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
      return;
    }else{
      that.setData({ uid, sid, phy_id});
    } 
  },
  onShow: function () {
    let that = this;
    let { uid, sid, phy_id } = that.data;
    uid = app.globalData.uid, sid = app.globalData.sid, phy_id= app.globalData.phyid || 154;
    if (!uid) {
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
      return;
    } else {
      that.setData({ uid, sid, phy_id },()=>{
        that.refreshList();
      });
    } 
  
  },
  onHide: function () {

  },
  refreshList() {
    let that = this;
    var physical_id = that.data.phy_id;
    if (typeof (physical_id) == "undefined" || physical_id == '') {
      return;
    }
    var params = {
      sid: that.data.sid, uid: that.data.uid,
      physical_id
    }
    app.api.postApi(_saomaProdUrl, { params }, (err, resp) => {
      if (resp && resp.err_code == 0) {
        var cart_list = resp.err_msg.cart_list;
        var cartSHow = that.cartSHow;
        var hasShop = cart_list.length;
        if (cart_list.length < 1) {
          cartSHow = false;
        } else {
          cartSHow = true;
        };
        that.setData({
          cart_list,
          cartSHow,
          hasShop
        });
        //计算金额
        that.sum();
        that.loadCoupon();
      }
    });
  },

  /**
   * 加载优惠券面值
   */
  loadCoupon:function(){
    let that = this;
    var cart_list=that.data.cart_list;

    var carLength = cart_list.length;
    if(carLength==0){
      return;
    }
    var ids =  new Array(carLength);
    for(var i=0;i<carLength;i++){
      ids[i] = cart_list[i].product_id;
    }

    var params = {
      uid:that.data.uid,
      sid:that.data.sid,
      ids:ids,page:1
    }
    //线上优惠券信息
    app.api.postApi(_couponUrl, { params}, (err, resp) => {
      if (resp.err_code == 0) {
        var couponLength = resp.err_msg.item.length;
        var len = couponLength > 2 ? 2 : couponLength;
        var coupon_value = new Array(len);
        for (var i = 0; i < len; i++) {
          coupon_value[i] = resp.err_msg.item[i];
        }
        that.setData({
          coupon_value: coupon_value
        });
      }
    });   
  },
  bindMinus: function (e) {
    // 减少数量
    var that = this;
    var cardId = e.currentTarget.dataset.cardId;
    var index = parseInt(e.currentTarget.dataset.index);
    var shopNumber = e.currentTarget.dataset.number;
    var productId = e.currentTarget.dataset.productId;
    var skuId = e.currentTarget.dataset.skuId;
    // var uid = e.currentTarget.dataset.uid;
    if (shopNumber <= 1) {
      wx.showLoading({
        title: '不能再少了'
      })
      setTimeout(function () {
        wx.hideLoading()
      }, 1000)
    } else {
      shopNumber--;
      var params = {
        uid: that.data.uid,
        sid: that.data.sid,
        cid: cardId,
        pid: productId,
        physical_id: that.data.phy_id,
        number: shopNumber,
        sku_id: skuId
      }
      that.addReduce(params, index, shopNumber);
    }

  },
  bindPlus: function (e) {
    // 增加数量
    var that = this;
    var cardId = e.currentTarget.dataset.cardId;
    var index = parseInt(e.currentTarget.dataset.index);
    var shopNumber = e.currentTarget.dataset.number;
    var productId = e.currentTarget.dataset.productId;
    var skuId = e.currentTarget.dataset.skuId;
    // var uid = e.currentTarget.dataset.uid;
    var cart_list = that.cart_list;


    shopNumber++;
    var params = {
      uid: that.data.uid,
      cid: cardId,
      sid: that.data.sid,
      pid: productId,
      physical_id: that.data.phy_id,
      number: shopNumber,
      sku_id: skuId
    }
    that.addReduce(params, index, shopNumber);

  },
  // 列表选择事件
  bindCheckbox: function (e) {
    var that = this;
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var cart_list = that.data.cart_list;
    var selected = cart_list[index].selected;
    var cartId = e.currentTarget.dataset.cardid;
    var selectedAllStatus = that.data.selectedAllStatus;
    // 对勾选状态取反
    cart_list[index].selected = !selected;

    var flag = 0;
    for (var i in cart_list) {
      if (!cart_list[i].selected) {//有一个不选中都取消全选
        selectedAllStatus = false;
      }
      if (cart_list[i].selected) {
        flag++;
      }
    };
    if (flag == cart_list.length) {
      selectedAllStatus = true;
    }

    that.setData({ selectedAllStatus, cart_list });
    that.sum();
  },
  scanCode: function () {
    let that=this;
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        that.checkProduct(res.result);
      }
    })
  },
  //计算金额
  sum() {
    var that = this;
    var carts = this.data.cart_list;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      total += carts[i].pro_num * carts[i].pro_price;
    }
    // 写回经点击修改后的数组
    that.setData({
      cart_list: carts,
      total: '¥ ' + total
    });
    if (that.data.cart_list.length <= 0) {
      that.setData({
        cartSHow: false
      })
    } else {
      that.setData({
        cartSHow: true
      })
    }
  },
  //去结算
  bindCheckout: function () {
    let that = this;
    let ids = [], len = this.data.cart_list.length;

    if (len == 0) {
      that.showModel({ title: "请先添加门店扫描商品！" })
      return false;
    }
    // 遍历取出已勾选的cid
    for (var i = 0; i < len; i++) {
      var id = parseInt(this.data.cart_list[i].pigcms_id);
      ids.push(id);
    }


    var params = {
      uid:that.data.uid,
      store_id:that.data.sid,
      ids,
      point_shop: '0',
      physical_id: that.data.phy_id
    };

    app.api.postApi(shoppUrl, { params }, (err, rep) => {
      if (!err && rep.err_code == 0) {
        var order_no = rep.err_msg.order_no;
        //下完订单，取的订单id
        var url = '../common/pages/buy?orderId=' + order_no;
        wx.redirectTo({
          url
        });
      } else {
        var msg = err || rep.err_msg;
        that.showModel({ title: msg })
      }
    });

  },
  /**
   * 手动输入条形码
   */
  inputBarcode() {
    this.setData({ showErrModal:true,input:true});
  },

  bindInput:function(e){
    that.setData({
      inputValue: e.detail.value
    });
  },
/**
 * 确定按钮
 */
  tabConfirm(e){
    this.setData({ showErrModal: false, input: false });
    var value = that.data.inputValue;
    that.checkProduct(value);
 },

  checkProduct: function (value){
   if (value == null || value == '') {
     wx.showToast({
       title: '输入为空，请重新输入！',
       icon: 'success',
       duration: 1000
     })
     return;
   }
   wx.showLoading({
     title: '加载中'
   });
   that.addProduct(value);
 },

  addProduct: function (value){
   var params = {
     uid:that.data.uid,
     store_id:that.data.sid,
     code: value,
     quantity: 1,
     physical_id: that.data.phy_id
   };

   app.api.postApi('wxapp.php?c=qrproduct_v2&a=add', { params }, (err, resp) => {

     if (resp ){
       if ( resp.err_code == 0){
         wx.hideLoading();
         that.refreshList();
         try {
           var isShowTip = wx.getStorageSync('isShowTip')
          if(isShowTip == ''){
            that.setData({
              isShowTip: true
            });
          }
         } catch (e) {
           // Do something when catch error
         }
         
       }else{
         console.log("code error：" + resp.err_msg);
         wx.hideLoading();
         setTimeout(function () {
           wx.showToast({
             title: resp.err_msg,
             icon: 'success',
             duration: 1000,
           })
         }, 1500);
       }
     }else{
       wx.hideLoading();
     }
   });
 },

 onTipClick:function(){
   try {
     that.setData({
       isShowTip:false
     });
     wx.setStorageSync('isShowTip', '0');
   } catch (e) {
     // Do something when catch error
   }
 },

 onItemClick:function(e){
   var prodId = e.currentTarget.id;
   wx.navigateTo({
     url: '../common/pages/goods-detail?prodId=' + prodId +'&action=saoma'
   })
 },


  /*
  *数量cart_list.pro_num数量变化
  *index 下标
  * num 数量
  */
  numList(index, num) {
    var that = this;
    var cart_list = that.data.cart_list;

    if (num) {//有传数量参数就是加减
      cart_list[index].pro_num = num;
    } else {//无就是删除商品
      cart_list.splice(index, 1);
    }


    that.setData({ cart_list });
    //计算金额
    that.sum();
  },


  addReduce(params, index, num) {
    var that = this;
    app.api.postApi('wxapp.php?c=cart_v2&a=edit_quantity', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        var params = {
          store_id:that.data.sid, uid:that.data.uid
        }
        that.numList(index, num);

      } else {
        wx.showLoading({
          title: '不能修改数量'
        })
        setTimeout(function () {
          wx.hideLoading()
        }, 1000)
      }
    });
  },

  removeShopCard: function (e) {
    var that = this;
    var cardId = e.currentTarget.dataset.cardId;
    var index = parseInt(e.currentTarget.dataset.index);

    var params = {
      uid:that.data.uid, cid: cardId, sid: that.data.sid, physical_id: that.data.phy_id
    }
    wx.showModal({
      title: '删除商品',
      content: '确定删除吗',
      success: function (res) {
        if (res.confirm) {
          app.api.postApi('wxapp.php?c=cart_v2&a=delete', { params }, (err, resp) => {
            if (err) {
              return;
            }
            if (resp.err_code == 0) {
              // 删除成功
              that.refreshList();
              that.numList(index);

            } else {
              // 删除失败
              wx.showLoading({
                title: '删除失败',
              })
              setTimeout(function () {
                wx.hideLoading()
              }, 1000)
            }
          });
        } else if (res.cancel) {
          return;
        }
      }
    })
  },
  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../image/group-mes.png.png', mask: true });
    this.setData({ error: errorMsg });
  },
  /**
    * 显示模态框
    */
  showModel(config) {  
    errModalConfig = Object.assign(errModalConfig, config);
    this.setData({
      errModalConfig: errModalConfig,
      showErrModal: true
    });
  },

  onCouponClick(){
    wx.navigateTo({
      url: './coupon-list?cart_list=' + JSON.stringify(this.data.cart_list),
    })
  },

  /**
   * 点击隐藏模态框(错误模态框)
   */
  tabModal() {
    this.setData({ showErrModal: false });
  },
})