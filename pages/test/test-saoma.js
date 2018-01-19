// pages/test/test-saoma.js
const qqmap =
  require("../../utils/qqmap-wx-jssdk.min.js")

var qqmapsdk;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    //默认未获取地址
    hasLocation: false
  },
  saoma() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码参数res', res);
      }
    })
  },
  dingwei() {
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log('获取位置参数res', res);
      }
    })
  },
  //获取经纬度
  getLocation: function (e) {
    console.log(e)
    var that = this
    wx.getLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          hasLocation: true,
          location: {
            longitude: res.longitude,
            latitude: res.latitude
          }
        })
      }
    })
  },
  //根据经纬度在地图上显示
  openLocation: function (e) {
    var value = e.detail.value
    wx.openLocation({
      longitude: Number(value.longitude),
      latitude: Number(value.latitude)
    })
  },
  getDistance: function (lat1, lng1, lat2, lng2) {
    lat1 = lat1 || 0;
    lng1 = lng1 || 0;
    lat2 = lat2 || 0;
    lng2 = lng2 || 0;

    var rad1 = lat1 * Math.PI / 180.0;
    var rad2 = lat2 * Math.PI / 180.0;
    var a = rad1 - rad2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;

    var r = 6378137;
    return r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var dics = this.getDistance(23.12463, 113.36199, 23.12463, 113.46199);
    console.log('dics...', dics);

    // 实例化API核心类

    qqmapsdk = new qqmap({

      key: '6P5BZ-5D5WQ-AJA5V-GAMPC-B3HSS-TMFOI' //腾讯位置服务的key

    });
    this.data_list();
  },
  // 加载数据列表
  data_list() {
    const that = this;
    const syncArr = [];
    syncArr.push(that.map());
    console.log("syncArr....",syncArr);
    Promise.all(syncArr).then(results => {
      syncArr.forEach((value , index ) =>{
        console.log('距离 ', value);
      })
    })

    // const url = util.apiUrl + 'Index/index_show?program_id=' + app.program_id;
    // util.request(url, 'post', '', '正在加载数据', function (res) {

    //     for (let i = 0; i < res.data.k4.length; i++) {

    //       syncArr.push(that.map(res.data.k4[i].sh_jd))

    //     }

    //     Promise.all(syncArr).then(results => {

    //       for (let j =0; j < results.length; j++) {

    //         res.data.k4[j].sh_jd = results[j]

    //       }

    //       that.setData({

    //         arr: res.data,

    //         lunbo: res.data.k1,

    //         images: res.data.k2,

    //         nearby_merchant: res.data.k4

    //       })

    //     })

    //   })
  },
  // 公共方法 根据腾讯地图接口获取计算距离http://lbs.qq.com/qqmap_wx_jssdk/method-calculatedistance.html

  map(data) {
    var distance = null;
    // 调用接口
    qqmapsdk.calculateDistance({
      to: [{
        latitude: 23.12463,
        longitude: 113.46199
      }],
      success: function (res) {
        console.log('调用腾讯接口返回', res);
         distance = Math.floor(res.result.elements[0].distance / 1000 * 100) / 100;
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
    return distance ? distance : 'fail';

    // return new Promise((resolve) => {

    //   // const latitude = data.split(',')
    //   const latitude = [39.984060, 116.307520];

    //   qqmapsdk.calculateDistance({

    //     to: [{

    //       latitude: latitude[0],

    //       longitude: latitude[1]

    //     }],

    //     success(res) {
    //        console.log('调用腾讯接口返回',res);
    //       const distance = Math.floor(res.result.elements[0].distance / 1000 * 100) / 100;
    //       resolve(distance)

    //     },

    //     fail() {

    //       resolve('')

    //     }

    //   })

    // })

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
  onShareAppMessage: function () {

  }
})