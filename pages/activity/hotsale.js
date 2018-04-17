var app = getApp();
Page({
  data:{
    page:1,
    store_id:'',
    windowHeight:'',
    windowWidth:'',
    msgList:[],
    dataList:''
  },
  onLoad:function(options){
    var that = this;
    // 获取店铺id shopId
    var store_id = app.store_id;
    that.setData({
      store_id
    });
    // 自动获取手机宽高
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
    that.loadData(that);
  },
  // 上拉加载
  pullUpLoadone(e) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    // 上拉加载开始
    setTimeout(function () {
      var page = that.data.page;
      page++;
      that.setData({
        page: page
      })
      that.loadData(that);
      wx.hideLoading();
    }, 1000)
    // 上拉加载结束 
  },
  // 数据
  loadData(that){
    var page = that.data.page;
    var store_id = that.data.store_id;
    var msgList = that.data.msgList;//空数组
    console.log(page, store_id)
    wx.showLoading({
      title: '加载中'
    })
    var params = {
      page, store_id
    }
    app.api.postApi('wxapp.php?c=product&a=get_product_by_catid', { params}, (err, response) => {
      wx.hideLoading();
      if (err) return;
      var products = response.err_msg.products
      if (products){
        console.log(products, 'products')
        for (var j = 0; j < products.length; j++) {
          msgList.push(products[j]);
        }
        console.log(msgList,'msgList');
        //更新数据
        that.setData({
          dataList: msgList
        });
      }else{
        wx.showToast({
          title: '亲，没有了'
        })
      }
      
    });
  },
  onReady:function(){
    
  },
  onShow:function(){
   
  },
  onHide:function(){
   
  },
  onUnload:function(){
   
  }
})