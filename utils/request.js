//var fetch = require("@system.fetch")
//var Fly = require('flyio/dist/npm/hap')
//import Fly from 'flyio/dist/npm/wx'
var Fly=require("flyio-wx") 

//const request = new Fly(fetch)
const request = new Fly()

const BASE_URL = 'https://wecakes.com'
//const BASE_URL = 'http://10.1.1.56:5000'
const SHOPPOINT = 'muffins'
const PARTMENT = 'minishop'
const VERSION = '2.0.2'

// 设置请求基地址
request.config.baseURL = `${BASE_URL}/api/${SHOPPOINT}`

request.interceptors.request.use((request) => {
  // 给所有请求添加自定义header，带上token信息让服务器验证用户登陆
  const access_token = wx.getStorageSync('access-token');
  if (access_token !== undefined && access_token !== '')
    request.headers['X-ACCESS-TOKEN'] = wx.getStorageSync('access-token');
  request.headers['X-SHOPPOINT'] = SHOPPOINT
  request.headers['X-PARTMENT'] = PARTMENT
  request.headers['X-VERSION'] = VERSION
  request.headers['Content-Type'] = 'application/json'
  console.log('muffin request is: ', request);
  //wx.showNavigationBarLoading()
  return request
})

function requestHeaders() {
  var headers = {}
  const access_token = wx.getStorageSync('access-token');
  if (access_token !== undefined && access_token !== '')
    headers['X-ACCESS-TOKEN'] = wx.getStorageSync('access-token');
  headers['X-SHOPPOINT'] = SHOPPOINT
  headers['X-PARTMENT'] = PARTMENT
  headers['X-VERSION'] = VERSION
  headers['Content-Type'] = 'application/json'

  return headers
}

//request.interceptors.response.use(
//  (response, promise) => {
//    wx.hideNavigationBarLoading()
//    return promise.resolve(response.data)
//  },
//  (err, promise) => {
//    wx.hideNavigationBarLoading()
//    wx.showToast({
//      title: err.message,
//      icon: 'none'
//    })
//    return promise.resolve()
//  }
//)

//export default request
export {request, BASE_URL as base_url, SHOPPOINT as shoppoint, requestHeaders}
