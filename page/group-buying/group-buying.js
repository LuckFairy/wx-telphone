let share = require('../common/template/share.js');
const shareLaterUrl = 'wxapp.php?c=activity&a=tuan_share_coupon';//拼团活动分享之后的优惠券列表
let config = require('../../config.js');
const app = getApp();
const tuanDataUrl = 'wxapp.php?c=tuan_v2&a=tuan_detail';//加载团购商品数据
const otherGroupUrl = "wxapp.php?c=tuan_v2&a=team_list";//他人团数据
const changeGroupUrl = "wxapp.php?c=tuan_v2&a=change_team_list";//换一批
const cartInfoUrl = 'wxapp.php?c=cart&a=info';//获取属性弹窗
const addOrderUrl = 'wxapp.php?c=order_v2&a=add';//生成订单接口老接口
const tuanOrderUrl = 'wxapp.php?c=tuan_v2&a=order';//一键开团生成订单,一键参团生成订单

Page({
  data: {
    loading: false,
    action: null,    // 'present' 为赠品   'havealook'为从订单来查看详细的
    moreChoose: false,//属性弹窗
    num: 1,//购买数量
    showShareModal: false,//分享成功后模式层
    showpopteamModle: false,//true有拼团信息，弹窗
    popteamData: null,//弹窗拼团信息
    popteamUrl: './group-join',
    popteamNicke: null,//弹窗名字
    popteamText:'正在拼这个商品',
    shareData: [],//分享數據
    store_id: app.store_id,
    uid: '',
    phy_id: '',//门店id

    firstIndex: -1,
    commodityAttr: [],
    attrValueList: [],
    firstIndex: -1,
    minusStatus: 'disabled',
    showHide: true,
    listStatus: 0,

    replaceData: [],    // 参团数列表订单
    sellout: 1,//是否已经售罄，0售罄，1没有售罄
    image_lists: [],//轮播图列表
    product: [],//商品信息
    actProduct: [],//弹窗商品信息
    tuan: {},//团信息
    selfBuy: {},//单独买
    pintuanBuy: {},//拼团买
    price: 0,//价格
    quantity: 0,//库存

    sku_list: [],//多属性价格库存数据集合
    sku_id: null,//多属性id
    curTabs: null,//选择的pid+vid和
    property_list: [],//多属性数据集合
    prodId: null, //产品id
    tuanId: null,//拼团id
    ordertype: 0,//购买类型，1单独购买，2一键开团
    des_html: ["1、团购价购买此商品", "2、邀请好友来参团", "3、达到开团人数，商品发货。", "4、没达到开团人数，直接退款。"],//拼团规则
  },
  onShareAppMessage: function (res) {
    let that = this, dataset = res.target.dataset;
    let { uid, store_id, prodId, tuanId, sellout } = that.data;
    that.setData({ showShareModal: false });
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    var tip = `快来参团！${dataset.price}元包邮${dataset.title}这里比其他平台购买还便宜！！！猛戳.......`;
    return {
      // title: config.shareTitle,
      title: tip,
      path: `/page/group-buying/group-buying?prodId=${prodId}&tuanId=${tuanId}&sellout=${sellout}`,
      imageUrl: dataset.imgurl,
      success: function (res) {
        //开启分享成功弹窗
        share.shareOpen({
          store_id,
          uid,
          url: shareLaterUrl
        }).then(opt => {
          let { showModel, couponList, coupon_id_arr = [] } = opt;
          console.log('couponList', couponList.length);

          that.setData({
            showShareModal: showModel,
            shareData: couponList,
            coupon_id_arr
          })
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '分享失败！',
        })
      }
    }
  },
  getCoupon() {
    let that = this;
    let { store_id, uid, coupon_id_arr } = that.data;
    share.getCoupon({
      store_id,
      uid,
      coupon_id_arr
    }).then(opt => {
      let { showModel } = opt;
      that.setData({
        showShareModal: showModel
      })
    });
  },
  cancelCoupon() {
    let that = this;
    let { store_id, uid } = that.data;
    share.cancelCoupon({
      store_id,
      uid
    }).then(opt => {
      let { showModel } = opt;
      that.setData({
        showShareModal: showModel
      })
    });
  },
  onLoad: function (options) {
    var that = this;
    var uid = wx.getStorageSync('userUid'), phy_id = wx.getStorageSync('phy_id');
    if (uid == undefined || uid == '') {
      wx.switchTab({
        url: '../tabBar/home/index-new',
      })
    }

    var { tuanId, prodId, sellout = null } = options;
    that.setData({ tuanId, prodId, sellout, uid, phy_id });
    that.loadData(prodId, tuanId);
    that.loadCartInfo();

    that._loadOrderData();
    /**弹窗拼团信息**/
    app.loadJumpPin().then(data => {
      let len = data.length, i = 0;
      if (len < 1) { return; }
      var popteamNicke = (data[i].user.nickname.length > 4) ? (data[i].user.nickname.substr(0, 4) + '...')  : data[i].user.nickname;
      that.setData({ popteamData: data[i], popteamNicke });
      clearInterval(timer);
      let timer = setInterval(() => {
        i++;
        if (i == len) i = 0;
        var popteamNicke = (data[i].user.nickname.length > 4) ? (data[i].user.nickname.substr(0, 4) + '...') : data[i].user.nickname;
        that.setData({ popteamData: data[i], popteamNicke });
      }, 30000);
      that.setData({ showpopteamModle: true });
    })
  },
  goIndex() {
    wx.switchTab({
      url: '../tabBar/home/index-new'
    })
  },
  goServer() {
    wx.navigateTo({
      url: '../my/pages/server-wechat'
    })
  },
  showDetail(e) {
    var that = this;
    var listStatus = e.currentTarget.dataset.liststatus;
    if (listStatus == 0) {
      that.setData({
        showHide: true,
        listStatus: 1
      });
    } else {
      that.setData({
        showHide: false,
        listStatus: 0
      });
    }
  },
  showHide() {
    this.setData({
      showhide: true
    })
  },
  hideMsg() {
    this.setData({
      showhide: false
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  //多规格 onShow
  onShow: function () {
  

  },
  onHide: function () {
    // 页面隐藏
    this.stopCountDown();
  },
  onUnload: function () {
    // 页面关闭
  },
  goImageClose() {
    var that = this;
    that.setData({
      moreChoose: false,
    });
  },
  loadData(prodId, tuanId) {
    wx.showLoading({ title: '加载中' });
    app.api.postApi(tuanDataUrl, { "params": { "tuan_id": tuanId } }, (err, rep) => {
      wx.hideLoading();
      if (err || rep.err_code != 0) {
        wx.showToast({
          title: rep.err_msg,
          icon: 'loading',
          duration: 2000,
          mask:true,
          success:()=>{
            setTimeout(()=>{
              wx.navigateBack();
            },2000);
          }
        });
        
        return };
      var { product, product_image_lists, store, tuan, tuan_config_list } = rep.err_msg;
      tuan_config_list.forEach(item => {
        if (item.grade_type == 0) {
          this.setData({ selfBuy: item })
        }
        if (item.grade_type == 1) {
          this.setData({ pintuanBuy: item })
        }
      })
      var des_html = this.data.des_html;
      if (tuan.description_html && tuan.description_html.length>0){
        des_html= tuan.description_html;
      }
      this.setData({
        image_lists: product_image_lists, product, tuan, des_html
      })
    });
  },
  /*
  *加载购物车弹窗数据
  */
  loadCartInfo() {
    var that = this;
    var { price, quantity, property_list, prodId, sku_list, actProduct } = that.data;
    var params = {
      product_id: prodId,
      uid: that.data.uid,
      store_id: that.data.store_id
    }

    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi(cartInfoUrl, { params }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) { console.info(err || resp.err_msg); return; }
      actProduct = resp.err_msg.product;//商品数据集合
      price = actProduct.price; quantity = actProduct.quantity;
      //判断是否有多属性
      sku_list = resp.err_msg.sku_list || [];//多属性价格库存数据集合
      property_list = resp.err_msg.property_list || [];//多属性数据集合
      if (sku_list && sku_list.length > 0) {
        //默认选择第一个属性商品
        setProperty(sku_list[0]);
        that.setData({ sku_list, property_list, });
      }
      that.setData({
        actProduct, quantity, price
      });
    });
  },
  /**
   * 设置属性选择
   */
  setProperty(item) {
    var proList = [], sum = '', curTabs = this.data.curTabs;
    var list = item.properties.split(";");
    for (let i = 0; i < list.length; i++) {
      proList = list[i].split(":");
      for (let j = 0; j < 2; j++) {
        sum = sum + proList[j];
        curTabs.push(sum);
      }
    }
    this.setData({ sku_id: item.sku_id, curTabs });
  },
  /**
   * 多属性选择
   */
  chooseProperty(e) {
    var that = this;
    var curTab = that.data.curTab, arr_gropv = [];
    var { pid, vid } = e.currentTarget.dataset;
    var gropv = pid + ':' + vid;
    arr_gropv.push(gropv);//点击选择属性的id选项组合

    var sku_list = that.data.sku_list;

    var property_list = that.property_list;

    var oriPid = that.data.oriPid;//初始pid
    console.log('quantitys', quantitys)
    var theLength = that.data.property_list.length;//多属性种类
    if (theLength == 1) {
      if ((oriPid != pid) && oneMatching.length == 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {
              console.log(multiattribute[k], 'g')//获取点击匹配的可选项
              oneMatching.push(multiattribute[k]);//首次点击之后把所有可能匹配的入数
              console.log(oneMatching, '首次push的匹配值')
            }
          }
          that.setData({
            sku_id: skuid_list[k]
          })
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })
        console.log('fffffffff')
      } else if ((oriPid == pid) && oneMatching.length != 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {
              console.log(multiattribute[k], 'g')//获取点击匹配的可选项
              oneMatching.push(multiattribute[k]);//重新加入匹配项
              console.log('oneMatching重新匹配', oneMatching)
            }
          }
          that.setData({
            sku_id: skuid_list[k]
          })
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })
        console.log('ttttttttttt')
      }
    } else if (theLength == 2) {
      if ((oriPid != pid) && oneMatching.length == 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {
              console.log(multiattribute[k], 'g')//获取点击匹配的可选项
              oneMatching.push(multiattribute[k]);//首次点击之后把所有可能匹配的入数
              console.log(oneMatching, '首次push的匹配值')
            }
          }
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })
        console.log('执行1')
      } else if ((oriPid == pid) && oneMatching.length != 0) {
        oneMatching.splice(0, oneMatching.length);//清空数组
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            if (multiattribute[k][g] == arr_gropv) {
              console.log(multiattribute[k], 'g')//获取点击匹配的可选项
              oneMatching.push(multiattribute[k]);//重新加入匹配项
              console.log('oneMatching重新匹配', oneMatching)
            }
          }
        }
        that.setData({
          arrone: '',
          arrotwo: '',
          curTabs: pid + vid,
          oriPid: pid
        })
        console.log('执行2')
      } else if ((oriPid != pid) && oneMatching.length != 0) {//换行选中后
        for (var k = 0; k < multiattribute.length; k++) {
          for (var g = 0; g < multiattribute[k].length; g++) {
            console.log(multiattribute[k].length, 'multiattribute[k].length3')
            if (multiattribute[k][g] == arr_gropv) {
              console.log(multiattribute[k], 'g3')//获取点击匹配的可选项
              console.log(multiattribute[k][g], 'ggg3')//获取点击匹配的可选项
              console.log('是否执行到这里')
              for (var o = 0; o < oneMatching.length; o++) {
                if (oneMatching[o] == multiattribute[k]) {
                  console.log(multiattribute[k], quantitys[k], 'multiattribute[k]点击匹配项');//设置匹配项颜色
                  console.log(quantitys[k], 'quantitys[k]')
                  if (quantitys[k] <= 0) {
                    wx.showLoading({
                      title: '卖完了'
                    });
                    setTimeout(function () {
                      wx.hideLoading()
                    }, 2000)
                  } else {
                    console.log(skuid_list[k], '匹配项的sku_id')
                    that.setData({
                      sku_id: skuid_list[k],
                      choPrice: price[k],
                      choQuantity: quantitys[k]
                    });
                    var arrObj = [];
                    for (var d = 0; d < multiattribute[k].length; d++) {
                      console.log(multiattribute[k][d], 'multiattribute[k][d]');
                      arrObj.push(multiattribute[k][d].split(':'));
                      console.log(arrObj, 'arrObj')
                      var array = multiattribute[k][d].split(':');
                      console.log(array, 'array')
                      console.log(array[0], 'array[0]');
                    }
                    console.log(arrObj, 'arrObj')
                    var objArr = [];
                    for (var u = 0; u < arrObj.length; u++) {
                      console.log(arrObj[u], 'arrObj[u]');
                      for (var q = 0; q < arrObj[u].length; q++) {
                        objArr.push(arrObj[u][q]);
                      }
                      console.log(objArr, 'objArr啊啊啊啊啊啊')
                    }
                    var arrone = objArr[0] + objArr[1];
                    var arrotwo = objArr[2] + objArr[3];
                    console.log(arrone, 'arrone');
                    console.log(arrotwo, 'arrotwo');
                    that.setData({
                      arrone, arrotwo, curTabs: ''
                    })
                    console.log('执行3')

                  }
                }
              }
              // that.setData({
              //   oriPid: pid
              // })
            }
          }
        }
      }
    }

  },
  doBuy: function (e) {
    var { ordertype } = e.currentTarget.dataset;
    var { pintuanBuy, selfBuy } = this.data;
    //弹窗属性窗口
    var moreChoose = !this.data.moreChoose;
    if (ordertype == 1) {//单独买
      this.setData({ price: selfBuy.price })
    } else {//开团
      this.setData({ price: pintuanBuy.price })
    }
    this.setData({ moreChoose, ordertype });

  },

  goPayment(e) {
    var that = this;
    //保存formid
    app.pushId(e).then(ids => {
      app.saveId(ids)
    });
    var { sku_list, sku_id } = that.data;
    if (sku_list.length > 0) {
      if (!sku_id) {
        wx.showLoading({
          title: '请选择属性'
        });
        setTimeout(function () {
          wx.hideLoading()
        }, 2000)
      } else {
        that.getOrderId();
      }
    } else {
      that.getOrderId();
    }
  },
  /*
  *生成订单
  *
  */
  getOrderId() {
    var that = this;
    var { ordertype, tuanId, pintuanBuy, selfBuy, num, sku_list, num, uid, store_id, sku_id, prodId, phy_id } = that.data, url = '', params = {};
    if (ordertype == 1) {//单独购买
      url = addOrderUrl;
      params = {
        uid,
        product_id: prodId,
        store_id,
        quantity: num,
        sku_id,
        physical_id: phy_id
      }
    } else {//一键开团
      url = tuanOrderUrl;
      params = {
        "tuan_id": tuanId,
        "quantity": num,
        "type": pintuanBuy.grade_type,
        "item_id": pintuanBuy.item_id,
        uid
      };
    }

    app.api.postApi(url, { params }, (err, rep) => {
      var { err_msg, err_code } = rep;
      if(err_code==1001){
        wx.showModal({
          title: '提示',
          content: '您已经拼团此商品，请去待付款支付。',
          showCancel:false,
          success: function (res) {
            wx.navigateTo({
              url: '../common/pages/my-order?page=' + 1
            });
          }
        })
       
        return;
      }
      if (err || err_code != 0) {
        wx.showModal({
          content: err || err_msg || err_msg.msg_txt,
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#FF0000',
          confirmText: '好的',
        });
        return
      }
      //推送消息
      app.send(err_msg.order_no); 
      var url = '../common/pages/buy?orderId=' + err_msg.order_no + '&uid=' + uid + '&ordertype=' + ordertype;
      wx.navigateTo({ url });
    })
  },

  //多规格 js  start
  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
    /**
      将后台返回的数据组合成类似
      {
        attrKey:'型号',
        attrValueList:['1','2','3']
      }
    */
    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value);
      }

    }
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
    var includeGroup = [];
    var skuId;
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
          this.setData({
            numShow: commodityAttr[i]['num'], skuId: commodityAttr[i]['skuId']
          });
        }
      }
    }
    attrValueList[index].selectedValue = value;

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = false;
      }
    }
    for (var k = 0; k < attrValueList.length; k++) {
      for (var i = 0; i < includeGroup.length; i++) {
        for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
          if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
            for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
              if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                attrValueList[k].attrValueStatus[m] = true;
              }
            }
          }
        }
      }
    }
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup,
      attrPrice: includeGroup[0]['price'],
    });
    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },
  /**
   * 减号
   */
  bindMinus: function () {
    var num = this.data.num;
    if (num > 1) {
      num--;
      this.setData({
        num: num,
      });
    }

  },
  /* 点击加号 */
  bindPlus: function () {
    var that = this;
    var { num, quantity}=that.data;

    if (num <= quantity) {
      num++;
      that.setData({
        num: num,
      });
    }
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var that = this;
    var { quantity } = that.data;
    var num = e.detail.value;
   
    if (1 < num <= quantity) {
      that.setData({
        num: num
      });
    }
  },

  /**
 * 显示错误信息
 */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
  /**
   * 换一批数据处理
   * 
   */
  _loadOrderData(url) {
    var that = this; var tuanId = that.data.tuanId;
    wx.showLoading({ title: '加载中...', mask: true, });
    var oUrl = url ? url : otherGroupUrl;
    app.api.postApi(oUrl, { "params": { "tuan_id": tuanId } }, (err, resp) => {
      wx.hideLoading();
      if (err || resp.err_code != 0) {
        return;
      }
      let { err_msg } = resp;
      let replaceData = err_msg;
      that.setData({ replaceData });
      that.startCountDown(replaceData);
    });
  },
  /**
   * 倒计时处理
   */
  startCountDown(replaceData) {
    this.timer = setInterval(() => {
      let now = new Date().getTime();
      let len = replaceData.length;
      for (let i = len - 1; i >= 0; i--) {
        let item = replaceData[i];
        let expireTime = item.end_time * 1000;
        let leftTime = (expireTime - now) / 1000;
        if (leftTime < 0) {
          replaceData.splice(i, 1);   // 到了失效时间，从活动里删除
          continue;
        } else {
          item.countDown = this.countDown(leftTime);
        }
      }
      this.setData({ replaceData });
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
      var str = hour + ':' + minute + ':' + second
      this.setData({
        countdownText: str
      });
    } else {
      var str = "已结束！";
      clearInterval(timer);
    }
    return { day, hour, minute, second };

  },
  //点击换一批
  clickReplace: function () {
    this.stopCountDown();
    var url = changeGroupUrl;
    this._loadOrderData(url);
  },
  //去参加团
  joinGroup: function () {
    wx.redirectTo({
    });
  },
  //去参加团 方法2 
  listClick: function (e) {
    //保存formid
    app.pushId(e).then(ids => {
      app.saveId(ids)
    });
    var { type, tuanId, teamId, itemId } = e.currentTarget.dataset;
    var prodId = this.data.prodId;
    let url = `./group-join?prodId=${prodId}&tuanId=${tuanId}&type=${type}&teamId=${teamId}&itemId=${itemId}`;
    wx.navigateTo({ url: url })
  },

})