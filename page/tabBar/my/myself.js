import { getPhoneNumber, checkBingPhone } from '../../../utils/util.js';
let app = getApp();
const _urlFxEn = "wxapp.php?c=fx_user&a=fx_entrance";//计划内容
let uid = wx.getStorageSync('userUid');
let phone = wx.getStorageSync('phone');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasPhone: true,//true有手機號，不彈窗;false弹窗
    nickName: '',
    userImg: '',
    uid,
    sid: app.globalData.sid,
    phone: null,
    showDistri: true
  },
  getPhoneNumber(e) {
    let that = this;
    getPhoneNumber(e).then(data => {
      that.setData({ phoneFlag: false })
    }).catch(err => {
      that.setData({ phoneFlag: true })
    })
  },
  /**手机号脱敏 */
  substring(str) {
    if (typeof str == 'string') { //参数为字符串类型
      let ruten = str.substring(3, 8); //提取字符串下标之间的字符。
      return str.replace(ruten, '*****'); //字符串中用字符替换另外字符，或替换一个与正则表达式匹配的子串。
    }
  },
  showPhone(opt) {
    let phone = opt;
    phone = this.substring(phone);
    this.setData({ phone })
  },
  /** 去设置页面*/
  goSetting() {
    wx.navigateTo({
      url: '../../my/pages/setting'
    });
  },
  isShowDistri() {
    let that = this;
    let params = {
      uid: this.data.uid,
      store_id: this.data.sid,
    }

    app.api.postApi(_urlFxEn, { params }, (err, rep) => {
      if (err || rep.err_code != 0) { console.error(err || rep.err_msg); that.setData({ showDistri: false }); } else {
        that.setData({ showDistri: true });
      }
    })
  },
  goMoney() {
    let that = this;
    let params = {
      uid: this.data.uid,
      store_id: this.data.sid,
    }

    app.api.postApi(_urlFxEn, { params }, (err, rep) => {
      if(err||rep.err_code!=0){console.error(err||rep.err_msg);return;}
      if (rep.err_code == 0) {
        let status = rep.err_msg.status;
        let isCheck = (status == -1 || status == 2 || status == 0) ? 1 : 0;//0审核中，1审核通过，2已经拉黑，-1审核拒绝
        that.setData({ isCheck }, () => {
          if (isCheck != 1) {
            wx.navigateTo({
              url: '../../distribution/moneyIndex',
            })
          } else {
            wx.navigateTo({
              url: '../../distribution/invite'
            });
          }
        })
      }
    })
  },
  goSearch() {
    wx.navigateTo({
      url: '../../common/pages/my-order'
    });
  },
  mycard() {
    wx.navigateTo({
      url: '../../common/pages/mycard'
    });
  },
  gostore() {
    wx.navigateTo({
      url: '../../common/pages/store-list'
    });
  },
  goaddress() {
    wx.navigateTo({
      url: '../../common/pages/address-list?is_from_my=0'
    });
  },
  gogroup(e) {
    var group = e.currentTarget.dataset.group
    wx.navigateTo({
      url: '../../common/pages/my-order?group=' + group
    });
  },
  goToList(e) {
    var list = e.currentTarget.dataset.list
    wx.navigateTo({
      url: '../../common/pages/my-order?list=' + list
    });
  },
  goStoreServer() {
    wx.navigateTo({
      url: '../../my/pages/server-wechat'
    });
  },
  myGroupGo() {
    wx.navigateTo({
      url: '../../group-buying/my-order'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    uid = wx.getStorageSync('userUid');
    let phone = wx.getStorageSync('phone'),that =this;
    if(uid){this.setData({uid},()=>{
      let phone = wx.getStorageSync("phone");
      if (phone) {
        that.setData({ phoneFlag: false })
      } else {
        let params = {
          store_id: this.data.sid,
          uid
        }
        checkBingPhone(params).then(data => {
          console.log(data);
          that.setData({ phoneFlag: false,phone:data })
        }).catch(err => {
          that.setData({ phoneFlag: true })
        })
      }
    })}
    
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
    uid = wx.getStorageSync('userUid');
    if (uid) { this.setData({ uid }) }else{
      wx.switchTab({
        url: '../home/index-new',
      });
      return;
    }
    var hasPhone = wx.getStorageSync('hasPhone');
    var phone = wx.getStorageSync('phone');
    this.setData({ hasPhone, phone },()=>{
      this.isShowDistri();
    });
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