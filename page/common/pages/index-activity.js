var app = getApp();
// const activityUrl = 'wxapp.php?c=index_activity&a=activity_index';//活动页接口
const activityUrl = 'wxapp.php?c=index_activity&a=activity_index_v3';//DM海报接口
// const activityNewUrl = 'wxapp.php?c=index_activity&=index';//DM海报接口
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productData: [],//活动图列表
    uid: '',
    openid: '',
    store_id: '',
  },
  onShareAppMessage(res) {
    return { title: '', path: '' }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync('userUid');
    let openid = wx.getStorageSync('openid');
    let store_id = app.store_id;

    this.setData({
      uid, openid, store_id
    })
    this.loadactivityData();
  },
  /**
* 首页精选活动数据
*/
  loadactivityData() {
    wx.showLoading({ title: '加载中...', mask: true, });
    this.getProductData();
  },
  getProductData(categoryid) {
    var params = {
      store_id: this.data.store_id, //店铺id
      flag: "poster",
      page: '1',
    };
    app.api.postApi(activityUrl, { params }, (err, resp) => {
      console.info('DM海报数据', resp)
      wx.hideLoading();
      if (err) {
        return this._showError('网络出错，请稍候重试');
      }
      let { err_code, err_msg: { err_log } } = resp;
      if (err_code != 0) {
        return this._showError(err_log);
      }
      let { err_msg: { acrivity_element = [] } } = resp;
      this.setData({ productData: acrivity_element });

    });
  },
  /**
     * 精选活动跳链
     */
  areaClickGo(e) {

    let { id, src } = e.currentTarget.dataset;

    // let { type,id,src } = e.currentTarget.dataset;
    // let store_id = this.data.store_id;
    // console.log(type,id);
    // switch (type) {
    //   case "1": var url = `./hotsale?categoryid=100&page=1&store_id=${store_id}`; break;
    //   case "2": var url = `./shop-list?categoryid=100&page=1&store_id=${store_id}&title=爆款专区`; break;
    //   case "3": var url = `../../home/pages/poster-detail?title=DM海报&type=${type}&id=${id}`; break;
    // }
    // if (url) {
    //   wx.navigateTo({
    //     url
    //   })
    // }
    if (src) {
      var url = `../../home/pages/poster-detail?title=DM海报&src=${src}`;
      wx.navigateTo({
        url
      })
    }
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
* 显示错误信息
*/
  _showError(errorMsg) {
    wx.showToast({ title: errorMsg, image: '../../../image/use-ruler.png', mask: true });
    this.setData({ error: errorMsg });
    return false;
  },
})