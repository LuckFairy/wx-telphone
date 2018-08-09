let app = getApp();
const couponUrl = 'wxapp.php?c=activity&a=new_user_coupon';//优惠券列表数据
const getcouponUrl = 'wxapp.php?c=activity&a=get_coupon';//领取优化券
const cancelcouponUrl = 'wxapp.php?c=activity&a=set_show';//新用户专享优惠券设置不显示

//**加载优惠券列表 */
function firstOpen(param) {
  let { uid, store_id, page ,url=couponUrl} = param;
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
       
      } else {
        showModel = false;
        wx.showModal({
          title: '提示',
          content: err || rep.err_msg,
        })
        reject(err || rep.err_msg);
      }
      resolve({
        showModel, couponList, coupon_id_arr
      })

    })
  })


}
/**
   * 立即领取
   */
function getCoupon(param) {
  let { uid, store_id, coupon_id_arr=[] ,url=getcouponUrl} = param;
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
      if (statusCode !== 200) { reject('新人领券接口错误，联系后台'); }
      if (!err && rep.err_code == 0) {
        wx.showModal({
          title: '恭喜',
          content: '刚领取的所有券已放到“我的——卡包”',
          cancelText: '我知道了',
          confirmText: '去查看',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({ url: '../../common/pages/mycard' });
            } else if (res.cancel) {

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
function cancelCoupon(param) {
  var { uid, store_id, url = cancelcouponUrl } = param;
  let showModel = false;
  return new Promise(resolve => {
    var params = {
      uid,
      store_id
    };
    app.api.postApi(url, { params }, (err, rep, statusCode) => {
      if (statusCode != 200) {
        console.log('取消领取新人优惠券接口有错误，请联系后台人员'); return;
      }
      if (!err && rep.err_code == 0) {
        console.log("取消成功");
      }
      resolve({ showModel })
    })
  })
}


module.exports = { firstOpen, getCoupon, cancelCoupon }
