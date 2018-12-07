/**
 * 小程序配置文件
 */
/**
 * host  服务器名称
 * AGENT  api请求中的hear参数
 * sid   店铺id
 */
var isRelease = false;
var host = "https://saas.qutego.com/"
var testhost = "https://zy.qutego.com/"
var sid = 310;//咿呀
var sid_test = 293;//婴众趣购590
var title = '咿呀';
var title_test = '婴众趣购';
var phonetest = '4006088520';//测试客服电话
var phone = '4006897779';//正式客服电话趣购精选
var phoneTxt = '400-689-7779';
var serverTxt = '702060';

var config = {

  change: (sid == 310) ? true : false,
  
  isRelease: isRelease,

  // 下面的地址配合云端 Server 工作
  host: isRelease ? host : testhost,


  //客服电话
  serverPhone: phone,

  //客服电话txt
  phoneTxt,

  //客服微信
  serverTxt,
  //店铺id
  sid: isRelease ? sid : sid_test,

  //分享标题
  shareTitle: isRelease ? title : title_test,

  //获取小程序客服微信
  getTelWxUrl: `api.php?c=common&a=getTelnWx`,

  // 登录地址，用于建立会话
  loginUrl: `wxapp.php?c=wechatapp&a=login_new`,

  //判断用户是否绑定了手机
  checkBingUrl: `wxapp.php?c=promote&a=check_phone`,

  //获取sessionkey
  sessionUrl: `wxapp.php?c=wechatapp_v2&a=get_session_key`,

  //获取手机号
  getPhoneUrl: `wxapp.php?c=wechatapp_v2&a=get_phone`,

  //绑定手机号
  bingPhoneUrl: `wxapp.php?c=wechatapp_v2&a=bind_phone_v2`,

  //用code换取openId 第一版本接口
  openIdOldUrl: `wxapp.php?c=wechatapp&a=login_new`,

  // 用code换取openId 第二版
  openIdUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

  //用code换取openid新接口,需要session_key，第三版
  openIdNewUrl: `wxapp.php?c=wechatapp_v2&a=login_new_v2`,

  // 5、绑定用户归属门店
  bingScreenUrl: `screen.php?c=index&a=binding_user`,

  //弹窗提示参团信息
  jumpintuanUrl: `wxapp.php?c=tuan_v2&a=pop_team_list_v2`,

  //生成小程序推广二维码
  posterUrl: `wxapp.php?c=promote&a=wxapp_qrcode`,

  //申请成为分销员
  submitFxUrl: `wxapp.php?c=fx_user&a=add_fx_user`,

  //分销用户接口
  isFxuserUrl: `wxapp.php?c=fx_user&a=fx_entrance`,

  //确立分销客户关系
  becustomerUrl: `wxapp.php?c=fx_user&a=become_customer`

};

module.exports = config
