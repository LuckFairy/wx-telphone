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

var sid = 3486,
  uid = null;//不填写默认null,填写直接改uid
var sid_test = 293;//婴众趣购590
var title = '桂阳宝贝宝贝孕婴童连锁'; 

var title_test = '婴众趣购';
var phonetest = '4006088520';//测试客服电话
var phone = '4000001312';//正式客服电话
var phoneTxt = '400-000-1312';
var serverTxt = 'yzkf139';
var pt_txt = '超值拼团';

let config = {
  isRelease,

  uid,

  // 下面的地址配合云端 Server 工作
  host: isRelease ? host : testhost,

  //客服电话
  serverPhone: isRelease? phone:phonetest,

  //客服电话txt
  phoneTxt,

  //客服微信
  serverTxt,

  //店铺id
  sid: isRelease ? sid : sid_test,
  
  //分享标题
  shareTitle: isRelease ? title : title_test,

  //拼团名称
  pt_txt,
  
  //获取小程序客服微信
  getTelWxUrl:`api.php?c=common&a=getTelnWx`,

  //判断用户是否绑定了手机第一版
  checkBingOldUrl: `wxapp.php?c=wechatapp_v2&a=check_phone`,

  //1、获取sessionkey
  sessionUrl: `wxapp.php?c=wechatapp_v2&a=get_session_key`,

  //2、判断用户是否绑定了手机第三版
  checkBingUrl: `wxapp.php?c=wechatapp_v2&a=check_phone_v2`,

  //3、如果没有绑定手机，调用小程序的授权获取手机号码
  getPhoneUrl:`wxapp.php?c=wechatapp_v2&a=get_phone`,

  //4、用code换取openid新接口,需要session_key，第三版
  loginNewUrl: `wxapp.php?c=wechatapp_v2&a=login_new_v2`,

  // 5、绑定用户归属门店
  bingScreenUrl:`screen.php?c=index&a=binding_user`,

  //用code换取openId 第一版本接口
  openIdOldUrl: `wxapp.php?c=wechatapp&a=login_new`,

  // 用code换取openId 第二版
  openIdUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

  //弹窗提示参团信息
  jumpintuanUrl: `wxapp.php?c=tuan_v2&a=pop_team_list_v2`,
  
  //生成小程序推广二维码
  posterUrl:`wxapp.php?c=promote&a=wxapp_qrcode`,

  //申请成为分销员
  submitFxUrl:`wxapp.php?c=fx_user&a=add_fx_user`,

  //分销用户接口
  isFxuserUrl:`wxapp.php?c=fx_user&a=fx_entrance`,

  //确立分销客户关系
  becustomerUrl:`wxapp.php?c=fx_user&a=become_customer`
}



module.exports = config