[快来我的coding](https://coding.net/u/gz_su/p/Pig-weixin/git/tree/telphone)  
### 说明
项目名称：`趣购精选`<br>
项目平台运用在`小程序`<br>
版本号`v1.0.0`<br>
功能：1、该项目采用分包创建2、分享功能onShareAppMessage和 wx.hideShareMenu();
3、商品商城购物类
4、团购秒杀类
### 版本更新说明
* v1.0.0,手机弹窗，获取用户手机号phone，获取uid
* v1.0.5,手机版本，官方商城版本之前版本
* v1.0.6,官方商城版本，首页大修改
### 目录
* image--图片文件夹
  * png
* page--页面文件夹
  * common--公共文件夹
  * goods--购物车文件夹
  * group-buying--团购文件夹
  * home--首页文件夹
  * my--我的文件夹
  * shopping--商城文件夹
  * tabBar--菜单下标文件夹
* pages
  * qrcode--扫码进入小程序js代码
* utils--公共方法js
  * api_1.js
  * api_4.js
  * md5.js
  * util.js
* app.js--入口js
* app.json--入口配置json
* app.wxss--入口css
* config.js--公共配置
* package.json--环境配置文件

### app.json配置
```
{
  "pages": [
    "page/tabBar/home/index-new",
    "page/common/pages/activity-hository",
    "page/common/pages/activity-hosDet",
    "page/common/pages/activity-detail",
    "page/common/pages/activity-join",
    "page/common/pages/hotsale",        
    "page/common/pages/mycard",
    "page/common/pages/mycardHistory",        
    "page/common/pages/index-mom",          
    "page/tabBar/shopping/shoppstore-index",
    "page/tabBar/goods/cart",
    "page/tabBar/my/myself",
    "page/common/pages/address-list",
    "page/common/pages/address",
    "page/common/pages/buy",
    "page/common/pages/card_detail",
    "page/common/pages/card_summary",
    "page/common/pages/goods-detail",
    "page/common/pages/index-activity",
    "page/common/pages/index-boabao",
    "page/common/pages/my-order",
    "page/common/pages/mydata",
    "page/common/pages/open-result",
    "page/common/pages/redbox",
    "page/common/pages/score",
    "page/common/pages/search-card",
    "page/common/pages/shop-list",
    "page/common/pages/shop-promotion",
    "page/common/pages/store-detail",
    "page/common/pages/store-list",
    "page/group-buying/group-buying",
    "page/group-buying/index-seckill",
    "page/group-buying/grouplist",
    "page/group-buying/my-order",
    "page/group-buying/detail",
    "page/group-buying/group-join",
    "page/group-buying/tuan-detail",
    "pages/qrcode/qr-entry"
  ],
  "window": {
    "backgroundTextStyle": "dark",
    "navigationBarBackgroundColor": "#FFE546",
    "navigationBarTitleText": "趣购精选",
    "navigationBarTextStyle": "black"
  },
  "tabBar": {
    "color": "#7f8389",
    "selectedColor": "#2d2727",
    "borderStyle": "e5e5e5",
    "backgroundColor": "#fff",
    "list": [
      {
        "pagePath": "page/tabBar/home/index-new",
        "text": "首页",
        "iconPath": "image/index-list.png",
        "selectedIconPath": "image/index-list-select.png"
      },
      {
        "pagePath": "page/tabBar/shopping/shoppstore-index",
        "text": "商城",
        "iconPath": "image/shoppstore.png",
        "selectedIconPath": "image/shoppstore-select.png" 
      },
      {
        "pagePath": "page/tabBar/goods/cart",
        "text": "购物车",
        "iconPath": "image/shoppingcart.png",
        "selectedIconPath": "image/shoppingcart-select.png"
      },
      {
        "pagePath": "page/tabBar/my/myself",
        "text": "我的",
        "iconPath": "image/mine-msg.png",
        "selectedIconPath": "image/mine-msg-select.png"
      }
    ]
  },
  "subPackages": [
    {
      "root": "page/home/",
      "pages": [
        "pages/poster-detail",
        "pages/present",
        "pages/present-apply"
      ]
    },
    {
      "root": "page/shopping/",
      "pages": [
        "pages/buycard",
        "pages/list",
        "pages/order-detail",
        "pages/order-express",
        "pages/trial-apply"
      ]
    },
    {
      "root": "page/goods/",
      "pages": [

      ]
    },
    {
      "root": "page/my/",
      "pages": [
        "pages/server-wechat",
        "pages/purchase-detail",
        "pages/apply-sales",
        "pages/bingPhone",
        "pages/setting"
      ]
    }
  ],
 
  "debug": true
}
```
### config.js配置
```
/**
 * 小程序配置文件
 */
/**
 * host  服务器名称
 * AGENT  api请求中的hear参数
 * sid   店铺id
 */
var isRelease = false;
var host = ""
var testhost = ""
var AGENT_ID = 2
var sid = ;//趣购精选
var sid_test = ;//
var title = '趣购精选';
var title_test = '';
var phonetest = '';//测试客服电话
var phone = '';//正式客服电话
var phoneTxt = '400-000-1312';
var phonetesttTxt = '400-608-8520';
var appid = '';

export default{

  isRelease:isRelease,

  // 下面的地址配合云端 Server 工作
  host: isRelease ? host : testhost,

  // 上线时需要根据实际数据修改
  AGENT_ID,

  //客服电话
  serverPhone: isRelease? phone:phonetest,

  phoneTxt,

  //店铺id
  sid: isRelease ? sid : sid_test,

  //appid
  appid,
  
  //分享标题
  shareTitle: isRelease ? title : title_test,

  // 登录地址，用于建立会话
  loginUrl: ``,

  //判断用户是否绑定了手机第一版
  checkBingOldUrl: ``,

  //1、获取sessionkey
  sessionUrl: ``,

  //2、判断用户是否绑定了手机第三版
  checkBingUrl: ``,

  //3、如果没有绑定手机，调用小程序的授权获取手机号码
  getPhoneUrl:``,

  //4、用code换取openid新接口,需要session_key，第三版
  loginNewUrl: ``,

  // 5、绑定用户归属门店
  bingScreenUrl:``,

  //用code换取openId 第一版本接口
  openIdOldUrl: ``,

  // 用code换取openId 第二版
  openIdUrl: ``,

  //弹窗提示参团信息
  jumpintuanUrl: ``

}
```
### package.json配置
可以根据的喜好配置
```
{
  "name": "yiya-weixin-1-31",
  "version": "1.0.0",
  "description": "趣购精选",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "amy",
  "license": "ISC",
  "dependencies": {
    "gulp": "^3.9.1"
  }
}
```



