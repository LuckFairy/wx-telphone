
const config = require('../config.js');
const md5 = require('./md5.js');
const VERSION = '1.0.0';
const APP_ID = 13;
const systemInfo = wx.getSystemInfoSync();
const AGENT_ID = 2;   // 上线时需要根据实际数据修改
var SERVER_URL =config.host;
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
var Network = {
  fetchApi(url, header, callback) {
    url = SERVER_URL + url;
    wx.request({
      url,
      data: {},
      header: header,
      success(res) {
        typeof callback === 'function' && callback(null, res.data)
        console.log(res.data)
      },
      fail(e) {
        typeof callback === 'function' && callback(e)
      }
    })
  },
  postApi(url, params, header, callback) {
 
    url = SERVER_URL + url;
    wx.request({
      url,
      data: params,
      method: 'POST',
      header: header,
      success(res) {
        typeof callback === 'function' && callback(null, res.data, res.statusCode)
        console.log(res.data)
      },
      fail(e) {
        typeof callback === 'function' && callback(e)
      }
    })
  }
};
var Api = {
  // GET 方式请求，要自己拼装URL参数
  fetchApi(url, callback) {
    let timestamp = parseInt(new Date().getTime() / 1000) + '';
    let pos = url.indexOf('?') + 1;
    let urlparams = pos === 0 ? '' : url.substring(pos);
    let sign = signUrl(urlparams, timestamp);
    let header = { 'X-Sign': sign, 'X-Timestamp': timestamp, 'X-Agent-Id': AGENT_ID };
    Network.fetchApi(url, header, callback);
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
    Network.postApi(url, params, header, callback);
  }
  
}

// module.exports.Api = Api;
module.exports = { Api, Network};