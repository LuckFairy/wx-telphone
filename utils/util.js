const md5 = require('./md5.js');
function formatTime(date) {
  var date = new Date(date * 1000);//如果date为10位不需要乘1000
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function formatDuration(duration) {
  let m = Math.floor(duration / 60);
  let s = duration % 60;
  s = s < 10 ? '0' + s : s;
  return m + ':' + s;
}
function getUrlQueryParam(url, paramName) {
  var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
  if (url) {
    let urlSplitArray = url.split("?");
    if (urlSplitArray && urlSplitArray.length > 1) {
      let paramStr = urlSplitArray[1];
      let result = paramStr.match(reg);
      if (result != null) {
        return decodeURIComponent(result[2]);
      }
    }
  }
  return '';
}
function formatMoney(money) {
  return '￥' + money / 100;
}
function signUrl(url, tokenId, secretKey, timestamp) {
  if (!url) url = '';

  // let pos = url.indexOf('?') + 1;
  // let urlparams = pos === 0 ? '' : url.substring(pos);

  // TODO: 有bug，参数里带有=号，会被split掉
  let params = url.split('&').filter(x => x[0] != '_').sort().join('').split('=').join('') + '';
  params = params + timestamp + tokenId + secretKey;
  console.debug('排序后请求参数：%s', params);
  let sign = md5(params);
  console.debug('签名: %s', sign);
  return sign;
}

/**
  * 验证手机号码
  * 
  * 移动号码段:139、138、137、136、135、134、150、151、152、157、158、159、182、183、187、188、147
  * 联通号码段:130、131、132、136、185、186、145
  * 电信号码段:133、153、180、189
  * 
  * @param cellphone
  * @return
  */
function checkMobile(str) {
  return /^1[3|4|5|7|8][0-9]\d{8}$/.test(str);
}
module.exports = { formatTime, formatDuration, getUrlQueryParam, formatMoney, signUrl, checkMobile }
