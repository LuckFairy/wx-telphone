// pages/cluster/cluser-wait.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    faileddata:{},
    taglist:[],
    userlist:{},
    status:'',
    timelist:{},
    //2017年9月22日
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
    groupbuyId: null,
    groupbuyOrderId: 0,

  },
  goWaitDetail(e){
    var groupstatus = e.currentTarget.dataset.groupstatus;
    var prodId = this.data.prodId;
    var groupbuyId = this.data.groupbuyId;
    var groupbuyOrderId = this.data.groupbuyOrderId;
    if (groupstatus==1){
      //待成团
      var url = 'cluster-wait-detail?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId;
    }else{
      //拼团失败
      var url = '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId;
    }
    wx.redirectTo({ url:url }) 
  },

  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    var status = options.statusNum;
    var datalist = 'groupbuy/GroupbuyDetail'; //团购商品详情
    var prodId = options.productId;
    var groupbuyId = options.groupbuyId;
    var groupbuyOrderId = options.Groupbuy_order_id;
    var dataorderlist = 'Order/GroupDetail/' + options.Groupbuy_order_id + '/' + options.orderid;
    var dataorderlist2 = 'Order/GroupDetail/';
    
    var timedatalist = 'Groupbuy/GroupbuyOther/' + options.Groupbuy_order_id;
    var that = this;
    app.api.postApi(datalist, { prodId, groupbuyId }, (err, resp) => {    
      if (err) {
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 2000
        })
      } else if (resp) {
          var faildlist = [];
          faildlist.push(resp.data);
          var taglist = faildlist[0].tag.split(',',3);
          that.setData({
            faileddata: faildlist[0],
            taglist: taglist,
            status: status
          });
          //打印日志
          var prodId = options.productId;
          var groupbuyId = options.groupbuyId;
          var skuId =this.data.skuId;
          this.setData({
            skuId:skuId,
            prodId: prodId,
            groupbuyId: groupbuyId,
            groupbuyOrderId: groupbuyOrderId
          });
          this.setData({
            'commodityAttr': faildlist[0].productSku
          });
          this.setData({
            includeGroup: this.data.commodityAttr
          });
          this.distachAttrValue(this.data.commodityAttr);
          // 只有一个属性组合的时候默认选中
          if (this.data.commodityAttr.length == 1) {
            for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
              this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
            }
            this.setData({
              attrValueList: this.data.attrValueList
            });
          }
          //多规格 end
      }
    });


    app.api.postApi(dataorderlist2, { groupbyOrderId: options.Groupbuy_order_id, orderId: options.orderid }, (err, resp) => {
      if (err) {
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 2000
        })
      } else if (resp) {
        var userDataList = [];
        userDataList.push(resp.data);
        that.setData({
          userlist: userDataList[0]
        })
      }
    });

    var product_type = 2;  //拼团商品推荐
    let url = 'shop/hotLists';
    app.api.postApi(url, { product_type }, (err, response) => {
      //app.api.fetchApi('shop/hotsale/2', (err, response) => {
      wx.hideLoading();
      if (err) return;
      let { rtnCode, rtnMessage, data } = response;
      if (rtnCode != 0) return;
      //let hotsaleGoing = [], hotsaleIncoming = [];
      let hotsaleGoing = data;
      this.setData({ hotsaleGoing });
    });

    app.api.fetchApi(timedatalist, (err, resp) => {
      if (err) {
        wx.showToast({
          title: '网络错误',
          icon: 'loading',
          duration: 2000
        })
      } else if (resp) {
        var timeDataList = [];
        timeDataList.push(resp.data);
        that.setData({
          timelist: timeDataList[0]
        })
      }
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    if (res.from === 'button') {
      var prodId = this.data.prodId;
      var groupbuyId = this.data.groupbuyId;
      var groupbuyOrderId = this.data.groupbuyOrderId;
      var path = '/pages/group-buying/group-join?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=' + groupbuyOrderId;
    }
    return {
      //title: title,
      path: path,
      //imageUrl: imageUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }

  },

  doBuy: function () {
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
    let  { prodId, action, num, groupbuyId} = this.data;

    var skuId = this.data.skuId;
    let url = '../group-buying/buy?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&groupbuyOrderId=0' + '&skuid=' + skuId + '&num=' + num;
    //return;
    wx.navigateTo({ url });
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
    /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      attrValueList:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    */
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
  //跳到拼团商品详情页
  goGroupDetail(e) {
    var prodId = e.currentTarget.dataset.productid;
    var groupbuyId = e.currentTarget.dataset.groupbyid;
    var selldetail = e.currentTarget.dataset.selldetail;
    wx.navigateTo({
      //url: '../group-buying/group-buying?prodId={{item.productId}}&groupbuyId={{item.groupbuyId}}&sellout={{datasellin}}'
      url: '../group-buying/group-buying?prodId=' + prodId + '&groupbuyId=' + groupbuyId + '&sellout=' + selldetail
    })
  }, 
})