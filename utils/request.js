/*
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
*/
import config from '../config.js'

var request = {
	header: {
		'X-SHOPPOINT': config.shoppoint,
		'X-PARTMENT': config.partment,
		'X-VERSION': config.api_version,
		'X-TERMINAL-TYPE': config.terminal_type,
		//'X-ACCESS-TOKEN': '',
		'Content-Type': 'application/json'
	},

	_request: function (url, data, method) {
		if (!this.header['X-ACCESS-TOKEN']) {
			var userInfo = wx.getStorageSync('appUserInfo')
			if (userInfo && userInfo.access_token) {
				this.header['X-ACCESS-TOKEN'] = userInfo.access_token
			}
		}

		var that = this
		var promise = new Promise((resolve, reject) => {
			wx.request({
				url: config.base_url + '/' + url,
				method: method,
				header: that.header,
				data: data,
				success: res => {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						console.log(url, data, res.data);
						resolve(res)
					} else {
						reject(res.data)
					}
				},
				fail: err => {
					console.error(url, err)
					reject(err)
				}
			})
		})

		return promise;
	},

	get: function (url, data) {
		return this._request(url, data, 'GET')
	},

	post: function (url, data) {
		return this._request(url, data, 'POST')
	},

	del: function (url, data) {
		return this._request(url, data, 'DELETE')
	},

	put: function (url, data) {
		return this._request(url, data, 'PUT')
	}
}

export default request
