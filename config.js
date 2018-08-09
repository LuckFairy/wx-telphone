/**
 * 小程序配置文件
 */
/**
 * host  服务器名称
 * AGENT  api请求中的hear参数
 * sid   店铺id
 */
var isRelease = true;
var host = "https://saas.qutego.com/"
var testhost = "https://api.ljxhlaw.com/"
var AGENT_ID = 2
var sid = 293;//趣购精选293
var sid_test = 293;//婴众趣购590
var title = '趣购精选';
var title_test = '咿呀';
var phonetest = '4006088520';//测试客服电话
var phone = '4000001312';//正式客服电话趣购精选
var appid = 'wx57d5cde97d7e1fd3';//趣购精选appid:wxaeb0f3eeb93b3574婴众趣购appid: wx57d5cde97d7e1fd3';

var config = {

  isRelease:isRelease,

  // 下面的地址配合云端 Server 工作
  host: isRelease ? host : testhost,

  // 上线时需要根据实际数据修改
  AGENT_ID,

  //客服电话
  serverPhone: phone,

  //店铺id
  sid: isRelease ? sid : sid_test,

  //appid
  appid,
  
  //分享标题
  shareTitle: isRelease ? title : title_test,

  // 登录地址，用于建立会话
  loginUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

  //判断用户是否绑定了手机
  checkBingUrl: `wxapp.php?c=wechatapp_v2&a=check_phone`,
  // checkBingUrl: `wxapp.php?c=wechatapp_v2&a=check_phone_v2`,

  //获取sessionkey
  sessionUrl: `wxapp.php?c=wechatapp_v2&a=get_session_key`,

  //用code换取openId 第一版本接口
  openIdOldUrl: `wxapp.php?c=wechatapp&a=login_new`,

  // 用code换取openId 第二版
  openIdUrl: `wxapp.php?c=wechatapp_v2&a=login_new`,

  //用code换取openid新接口,需要session_key，第三版
  openIdNewUrl:`wxapp.php?c=wechatapp_v2&a=login_new_v2`,


  //弹窗提示参团信息
  jumpintuanUrl: `wxapp.php?c=tuan_v2&a=pop_team_list`,

  // 测试的请求地址，用于测试会话
  requestUrl: `https://${host}/testRequest`,

  // 测试的信道服务接口
  tunnelUrl: `https://${host}/tunnel`,

  // 生成支付订单的接口
  paymentUrl: `https://${host}/payment`,

  // 发送模板消息接口
  templateMessageUrl: `https://${host}/templateMessage`,

  // 上传文件接口
  uploadFileUrl: `https://${host}/upload`,

  // 下载示例图片接口
  downloadExampleUrl: `https://${host}/static/weapp.jpg`,

};

module.exports = config
