import { util, getAddress } from '../../../utils/util';


const app = getApp();
Page({
  data: {
    addrList: [],
    uid: '',
    isFromMy:false,
    addressId: '',
    store_id: app.store_id
  },
  onLoad: function (options) {
    var that=this;
    if (options ){
      var fromType=options.is_from_my ;
      if (fromType=='0'){
        that.setData({
          isFromMy: true
        });
      }
      
    }
    var uid = app.uid;
    if(!uid){
      uid = wx.getStorageSync('userUid');
    }
    this.setData({ addressId: options.addressId ,uid});
    this.addrLists();
  },
  addrLists(e) {
    var that = this;
    var uid = that.data.uid;
    var params = {
      uid, store_id: that.data.store_id
    }
    wx.showLoading({
      title: '加载中'
    })
    app.api.postApi('wxapp.php?c=address&a=MyAddress', { params }, (err, resp) => {
      wx.hideLoading();
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        var addrList = resp.err_msg.addresslist;
        that.setData({
          addrList
        })
      }
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  /**
   * 加载页面数据
   */
  /**
   * 添加地址
   */
  gotoAddAddr() {
    wx.redirectTo({
      url: './address',
    })
  },



  onWxAddClick(){
    var that = this;
    var uid = that.data.uid;
    var wxLocation = getAddress();
      wxLocation.then(function (res) {

        // console.log(res.userName)
        // console.log(res.postalCode)
        // console.log(res.provinceName)
        // console.log(res.cityName)
        // console.log(res.countyName)
        // console.log(res.detailInfo)
        // console.log(res.nationalCode)
        // console.log(res.telNumber)

       
        var params = {
          uid, store_id: that.data.store_id,
          name: res.userName,
          tel: res.telNumber,
          province: res.provinceName,
          city: res.cityName,
          area: res.countyName,
          address: res.detailInfo,
          zipcode: res.postalCode,

        }
        wx.showLoading({
          title: '加载中'
        })
        app.api.postApi('wxapp.php?c=address&a=AddressFromWX', { params }, (err, resp) => {
          wx.hideLoading();
          if (err) {
            return;
          }
          if (resp.err_code == 0) {
            that.addrLists();
          }
        });

    }, null);
  },

  /**
  * 删除地址
  */
  bindDelAddr(e) {
    var that = this;
    wx.showModal({
      title: '确认操作',
      content: '是否确认删除地址？',
      success: res => {

        if (res.confirm) {
          let addrId = e.currentTarget.dataset.addressId;
          var params = { "uid": that.data.uid, "address_id": addrId }
          var index = e.currentTarget.dataset.index;
          var addrList = that.data.addrList;
          wx.showLoading({ title: '正在删除地址' });
          app.api.postApi('wxapp.php?c=address&a=DelAddress', { params }, (err, reps) => {
            wx.hideLoading();
            if (err) {
              return that._showError('操作失败，请重试');
            }
            if (reps.err_code != 0) {
              return that._showError(result);;
            }
            if (reps.err_code == 0) {
              addrList.splice(index, 1);
              that.setData({ addrList });
            }
          });
        }
      }
    });
  },

  /**
   * 更新地址
   */
  updateAddress(e) {
    console.log('点击编辑的时候', e)
    var that = this;
    var uid = that.data.uid;
    var address_id = e.currentTarget.dataset.addressId;
    wx.redirectTo({
      url: './address?revamp=1&uid=' + uid + '&address_id=' + address_id
    })
  },

  /**
   * 修改默认地址
   */
  changeDefaultAdress(e) {
    var that = this;
    var uid = that.data.uid;
    var addrList = that.data.addrList;
    var address_id = e.currentTarget.dataset.addressId;
    var index = parseInt(e.currentTarget.dataset.index);
    var def = addrList[index].default;
    var _addressId = this.data.addressId;
    if (_addressId == address_id) { wx.navigateBack(); return; }
    var params = {
      uid, address_id
    }
    app.api.postApi('wxapp.php?c=address&a=SetDefault', { params }, (err, resp) => {
      if (err) {
        return;
      }
      if (resp.err_code == 0) {
        console.log(resp.err_msg, 'moren');
        //取反操作
        if (def == 0) { 
          def = 1; 
          for (var i in addrList) {
            if (i != index) {
              addrList[i].default = 0;
            }
          }
        } 
        addrList[index].default = def;
        that.setData({
          addrList
        });
        
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.changeAddress(address_id);
      }
    });
  },
  /**
 * 改变收货地址，回退到上一页面 
 */
  changeAdress(e) {
    // console.log(e);
    let isFromMy = this.data.isFromMy;
    if (isFromMy) {
      return;
    }
    let { addressId } = e.currentTarget.dataset;
    var _addressId = this.data.addressId;
    var uid = this.data.uid;
    if (_addressId == addressId) { wx.navigateBack(); return; }
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.changeAddress(addressId);
    wx.navigateBack();
  },
  /**
   * 显示错误信息
   */
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
})