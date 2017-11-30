// pages/shopping/goods-detail.js

const app = getApp();

let _params = null;
let pskid = 0;                   //团购ID 兼容团购和爆款
Page({
  data: {
    loading: false,
    data: null,
    prodId: null,
    action: null,    // 'present' 为赠品   'havealook'为从订单来查看详细的
    //多规格 start
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
    commodityAttr: [],
    attrValueList: [],
    firstIndex: -1,
    numShow: '',//库存
    //skuId:'', //多属性标识
    skuId: 0, //修改 2017年8月31日16:34:42
    attrPrice: '', //多属性的价格
    //多规格 end
    //数量增减
    // input默认是1
    num: 1,
    // 使用data数据对象设置样式名
    minusStatus: 'disabled',
    newCartNum: 0,
    cateId: 0,
    //2017年10月11日21:13:33 秒杀内容
    activityStatus: 0, //活动的状态  1已经开始 2进行中 3即将开始
    productPrice: 0, //商品原来的价格
    skPrice: 0,//商品秒杀的价格
    pskid: 0, //秒杀产品ID
    quantity: 0,  //商品数量
    countDown: 0, //活动剩余时间
    hadnum: ''
  },

  onLoad: function (options) {
    console.log(options, 222222222);
    console.log(options, 222222222);
    var hadnum = options.hadnum;
    // 页面初始化 options为页面跳转所带来的参数
    let { prodId, action, params } = options;
    _params = params;
    this.loadData(prodId, action);
    this.setData({ 'newCartNum': 0, hadnum: hadnum });

    var cateId = options.cateId;
    this.setData({ 'cateId': cateId });

    //2017年10月11日21:13:33 秒杀内容
    var activityStatus = options.activityStatus;
    var productPrice = options.productPrice;
    var skPrice = options.skPrice;
    var pskid = options.pskid;
    var quantity = options.quantity;
    this.setData({ activityStatus, productPrice, skPrice, pskid, quantity });

  },
  onReady: function () {
    // 页面渲染完成
  },
  //多规格 onShow
  onShow: function () {
    this.stopCountDown();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  loadData(prodId, action) {
    wx.showLoading({ title: '加载中' });

    //let url = 'shop/item/' + prodId;
    //let url = 'shop/item_new/' + prodId; //新接口
    let url = 'seckill/item/' + prodId; //新接口
    console.log('接口url:');
    console.log(url);
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
      console.log('商品详情数据：');
      console.log(data);
      console.log('商品详情多属性数据：');
      console.log(data.productSku);
      //距离活动剩余时间 （从现在到凌晨0点）
      this.startCountDown(data.activityTime);
      //console.log('商品详情数据的options：');
      //console.log(data.description);
      /*
      //商品多规格赋值
      this.setData({
        'commodityAttr': data.productSku
      });
      */
      //从Page()data的数据移动到这

      this.setData({
        'commodityAttr': data.productSku
        //'commodityAttr': commodityAttr
      });

      //多规格，从show（）移动来这里
      this.setData({
        includeGroup: this.data.commodityAttr
      });
      this.distachAttrValue(this.data.commodityAttr);
      // 只有一个属性组合的时候默认选中
      // console.log(this.data.attrValueList);
      if (this.data.commodityAttr.length == 1) {
        for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
          this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
        }
        this.setData({
          attrValueList: this.data.attrValueList
        });
      }
      //多规格 end
      if (data.tag) {
        data.tag = data.tag.split(',');
      }
      if (data.images) {
        data.images = data.images.split(',');
      }
      if (data.description) {
        data.description = data.description.split(',');
      }

      //距离活动剩余时间 （从现在到凌晨0点）
      //var activityTime = 0; //这个是从接口获取到的，当天24小时的时间戳
      //let now = new Date().getTime(); //现在时间

      //var a = new Date(); a.setHours(0); a.setMinutes(0); a.setSeconds(0); a.setMilliseconds(0); 
      //var h=a.getTime();
      //console.log('服务器求得当天的24点时间戳');
      //console.log(data.activityTime);

      //console.log('js求得当天的24点时间戳');
      //console.log(h);

      //this.startCountDown(data.activityTime);

      this.setData({ data, prodId, action });
    });
  },

  doBuy: function () {
    //console.log('点击了立即购买按钮');
    //return;
    //多规格 start
    //console.log('多规格 start');
    //console.log('多规格start');
    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value.push(this.data.attrValueList[i].selectedValue);
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else {
      console.log('选择的属性：' + value.join('-'));
      wx.setStorage({
        key: "key",
        data: value.join('-')
      })
      /*
      wx.showToast({
        title: '选择的属性：' + value.join('-'),
        icon: 'sucess',
        duration: 1000
      })
      //return;
      */
    }
    //多规格 end
    var pskid = this.data.pskid;
    console.log('秒杀产品ID:');
    console.log(pskid);

    let { prodId, action, skuId, num } = this.data;
    console.log('支付/赠品之前:');
    console.log(this.data);
    console.log('购买的数量:');
    console.log(num);
    //console.log('为什么自己断点了··:');
    //console.log('商品多规格标识'+skuId);
    if (action === 'present') {
      //let url = "../present/present-apply?options=" + _params;
      if (skuId) {

      } else {
        skuId = 0;

      }
      let url = "../present/present-apply?options=" + _params + '&prodId=' + prodId + '&skuid=' + skuId + '&groupbuyId=' + groupbuyId; //2017年8月17日17:18:09 by leo
      wx.redirectTo({ url });
    } else {
      //let url = './buy?prodId=' + prodId +'&attr='+ value.join('-');      
      if (skuId) {
        //let url = './buy?prodId=' + prodId + '&skuid=' + skuId;
      } else {
        skuId = 0;
        //let url = './buy?prodId=' + prodId + '&skuid=0';
      }
      console.log('支付跳转前,skuid是：');
      console.log(skuId);
      let url = './buy?prodId=' + prodId + '&skuid=' + skuId + '&num=' + num + '&pskid=' + pskid;
      console.log('支付跳转url' + url);
      //return;
      wx.navigateTo({ url });
    }
  },
  gotoCart: function () {
    //let url = '../cart/cart';
    let url = "../cart/cart";
    //let url = './buy?prodId=108';
    console.log(url);
    //wx.navigateTo({ url });
    //wx.redirectTo({ url });
    wx.redirectTo({

      url: '../cart/cart'
    });
    //let url = './buy?prodId=89&skuid=56&num=2&cartId=' + toastStr;
    //wx.navigateTo({ url });

  },
  onShareAppMessage(res) {
    return { title: '', path: '' }
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
        // console.log('属性索引', attrIndex); 
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
    // console.log('result', attrValueList)
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
    /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      attrValueList:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    console.log(e.currentTarget.dataset);
    */
    console.log('选择属性值事件:');
    console.log(e.currentTarget.dataset);
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
    // console.log('firstIndex', this.data.firstIndex);
    var includeGroup = [];
    var skuId;
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    //console.log('选中', commodityAttr, index, key, value);
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
          console.log('选中2', commodityAttr[i]);
          //console.log('选中3', commodityAttr[i]['skuId']);
          this.setData({
            numShow: commodityAttr[i]['num'], skuId: commodityAttr[i]['skuId']
          });
          console.log('属性标识' + skuId);
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
    // console.log('结果', attrValueList);
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup,
      attrPrice: includeGroup[0]['price'],
    });
    console.log('includeGroup:');
    console.log(includeGroup);
    console.log('includeGroup部分数据-价格:', includeGroup[0]['price']);
    //console.log('includeGroup部分数据:', includeGroup[0]['skuId']);
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
  //多规格end
  //数量增减start
  /* 点击减号 */
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
  },
  /* 输入框事件 */
  bindManual: function (e) {
    var num = e.detail.value;
    // 将数值与状态写回
    this.setData({
      num: num
    });
  },
  //数量增减end
  //加入购物车start
  addShopCart: function (e) { //添加到购物车
    //2017年8月31日15:48:52 多属性 start
    var value = [];
    for (var i = 0; i < this.data.attrValueList.length; i++) {
      if (!this.data.attrValueList[i].selectedValue) {
        break;
      }
      value.push(this.data.attrValueList[i].selectedValue);
    }
    if (i < this.data.attrValueList.length) {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'loading',
        duration: 1000
      })
      return;
    } else {
      console.log('选择的属性：' + value.join('-'));
      wx.setStorage({
        key: "key",
        data: value.join('-')
      })
    }
    //end

    var skuId = this.data.skuId;
    //console.log('加入购物车 skuId');
    //console.log(skuId);
    //return;

    var that = this;
    var user_id = app.d.userId;
    var num = this.data.num;
    var prodId = this.data.prodId;

    //console.log(user_id);return;
    let url = 'shop/add_cart';
    app.api.postApi(url, { user_id, num, prodId, skuId }, (err, resp) => {
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
        var ptype = e.currentTarget.dataset.type;
        console.log('ptype' + ptype);
        if (ptype == 'buynow') {
          console.log('buynow'); return; //test
          wx.redirectTo({

            //url: '../order/pay?cartId=' + data.cart_id
          });
          return;
        } else {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          });
          //更新购物车的数量
          let url = 'shop/refresh';
          //wx.showLoading({ title: '请稍候...', mask: true, });
          app.api.fetchApi(url, (err, resp) => {
            //wx.hideLoading();
            if (err) {
              return this._showError('网络出错，请稍候重试');;
            }

            let { rtnCode, rtnMessage, data } = resp;
            if (rtnCode != 0) {
              return this._showError(rtnMessage);
            }
            console.log('更新购物车的数量');
            console.log(data);
            this.setData({ newCartNum: data.cartcount });
          });

        }
      } else {
        //console.log('操作失败的status');return;
        wx.showToast({
          title: data.err,
          duration: 2000
        });
      }

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
  //加入购物车end

  //跳到首页
  clickGoIndex: function () {
    var url = '../index-new/index-new';
    if (url) {
      wx.reLaunch({ url });
    }

  },
  //跳到客服
  goStoreServer: function () {
    wx.navigateTo({
      url: '../index-new/server-wechat'
    });
  },
  /**
 * 倒计时处理
 */
  startCountDown(expireTime) {

    this.timer = setInterval(() => {
      let now = new Date().getTime();
      let leftTime = (expireTime - now) / 1000;
      if (leftTime < 0) {
        //replaceData.splice(i, 1);   // 到了失效时间，从活动里删除
        //continue;
      }
      var countDown = this.countDown(leftTime);
      //console.log(countDown);
      this.setData({ countDown });

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



})