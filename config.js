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
var AGENT_ID = 2
var sid = 293;
var sid_test = 293;//婴众趣购590
var title = '趣购精选';
var title_test = '婴众趣购';
var phonetest = '4006088520';//测试客服电话
var phone = '4000001312';//正式客服电话
var phoneTxt = '400-000-1312';
var serverTxt = 'yzkf139';
var appid = 'wx57d5cde97d7e1fd3';
var config ={
  pt_txt:'趣购拼团'
}

export default{

  isRelease:isRelease,

  // 下面的地址配合云端 Server 工作
  host: isRelease ? host : testhost,

  // 上线时需要根据实际数据修改
  AGENT_ID,

  //客服电话
  serverPhone: isRelease? phone:phonetest,

  //客服电话txt
  phoneTxt,

  //客服微信
  serverTxt,

  //店铺id
  sid: isRelease ? sid : sid_test,

  //appid
  appid,
  
  //分享标题
  shareTitle: isRelease ? title : title_test,

  pt_txt:config.pt_txt,
  
  //获取小程序客服微信
  getTelWxUrl:`api.php?c=common&a=getTelnWx`,

  // 登录地址，用于建立会话
  loginUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

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
  posterUrl:`wxapp.php?c=promote&a=wxapp_qrcode`
}



