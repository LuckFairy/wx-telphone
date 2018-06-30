const md5 = require('./md5.js');
import __config from '../config.js';
const HOST = __config.host;
const IS_RELEASE = __config.isRelease;
const AGENT_ID = __config.AGENT_ID;   
function signUrl(url, tokenId, secretKey, timestamp) {
  if (!url) url = '';
  // TODO: 有bug，参数里带有=号，会被split掉
  let params = url.split('&').filter(x => x[0] != '_').sort().join('').split('=').join('') + '';
  params = params + timestamp + tokenId + secretKey;
  console.debug('排序后请求参数：%s', params);
  let sign = md5(params);
  console.debug('签名: %s', sign);
  return sign;
}

var Api = {
  // GET 方式请求，要自己拼装URL参数
  fetchApi(url, callback) {
    let timestamp = parseInt(new Date().getTime() / 1000) + '';
    let pos = url.indexOf('?') + 1;
    let urlparams = pos === 0 ? '' : url.substring(pos);
    let sign = signUrl(urlparams, timestamp);
    let header = { 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };

    wx.request({
      url: `${HOST}${url}`,
      data: {},
      header: header,
      success(res) {
        typeof callback === 'function' && callback(null, res.data, res.statusCode)
        console.log(res.data)
      },
      fail(e) {
        typeof callback === 'function' && callback(e)
      }
    })
  },
  // POST 方式请求
  postApi(url, params, callback) {
    let formdata = '';
    for (var key in params) {
      formdata += '&' + key + '=' + params[key];
    }
    let timestamp = parseInt(new Date().getTime() / 1000) + "";
    let sign = signUrl(formdata, timestamp);
    let header = { 'Content-Type': 'application/json', 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };

    wx.request({
      url: `${HOST}${url}`,
      data: params,
      method: 'POST',
      header: header,
      success(res) {
        if (!IS_RELEASE) {
          var paramsText = null;
          if (params != null) {
            paramsText = JSON.stringify(params);
          }
          // console.log("请求: " + url + " 传参: " + paramsText + " 返回：" + JSON.stringify(res.data));
        }
        typeof callback === 'function' && callback(null, res.data, res.statusCode)
      },
      fail(e) {
        if (!IS_RELEASE) {
          var paramsText = null;
          if (params != null) {
            paramsText = JSON.stringify(params);
          }
          // console.log("请求！！: " + url + " 传参: " + paramsText + " 异常返回：" + JSON.stringify(e));
        }
        typeof callback === 'function' && callback(e)
      }
    })
  }

}
var ajax = Api;
module.exports = { Api, ajax };