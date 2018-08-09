var app = getApp();
const couponUrl = 'wxapp.php?c=activity&a=tuan_share_coupon';//拼团活动分享之后的优惠券列表
const getShareUrl = 'wxapp.php?c=activity&a=get_coupon';//领取 拼团活动分享的优惠券

//**加载优惠券列表 */
function shareOpen(param) {
  let { uid, store_id, page, url = couponUrl } = param;
  let showModel = false;
  let couponList = [];
  let coupon_id_arr = [];
  let params = {
    uid,
    store_id,
    "page": 1
  };
  return new Promise((resolve, reject) => {
    app.api.postApi(url, { params }, (err, rep, statusCode) => {
      if (statusCode != 200) {
        reject('服务器有错，请联系后台人员');
      }
      if (!err && rep.err_code == 0) {
        showModel = rep.err_msg.is_show == 1 ? true : false;
        couponList = rep.err_msg.list;
        couponList.forEach((item) => {
          if (item.id) {
            coupon_id_arr.push(item.id);
          }
        });
        resolve({
          showModel, couponList, coupon_id_arr
        })
      } else {
        showModel = false;
        // wx.showModal({
        //   title: '提示',
        //   content: err || rep.err_msg,
        // })
        resolve({
          showModel, couponList, coupon_id_arr
        })
        reject(err || rep.err_msg);
      }
     

    })
  })
}
/**
   * 立即领取
   */
function getCoupon(param) {
  let { uid, store_id, coupon_id_arr = [], url = getcouponUrl } = param;
  return new Promise((resolve, reject) => {
    var showModel = false;
    if (coupon_id_arr.length < 1) {
      wx.showToast({
        title: '没有相关的优惠券领取',
      });
    }
    var params = {
      uid,
      store_id,
      coupon_id_arr
    }
    app.api.postApi(url, { params }, (err, rep, statusCode) => {
      console.info('分享券列表。。。。。',rep);
      if (statusCode !== 200) { reject('分享领券接口错误，联系后台'); }
      if (!err && rep.err_code == 0) {
        wx.showModal({
          title: '恭喜',
          content: '刚领取的所有券已放到“我的——卡包”',
          // cancelText: '我知道了',
          confirmText: '我知道了',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({ url: '../../common/pages/mycard' });
            } else if (res.cancel) {
                return;
            }
          }
        })
      } else {
        wx.showToast({
          title: rep.err_msg,
        })
      }
      resolve({ showModel });
    })


  });
}
/**取消领取 */
function cancelCoupon() {
  let showModel = false;
  return new Promise(resolve => {
    resolve({showModel});
  })
}

module.exports = { shareOpen, getCoupon, cancelCoupon}
