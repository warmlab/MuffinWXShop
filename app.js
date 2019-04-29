//app.js
//const request = require('../utils/request.js')
import config from 'config.js'
import request from 'utils/request'

App({
	onLaunch: function () {
		var that = this;
		// 展示本地存储能力
		//var logs = wx.getStorageSync('logs') || []
		//logs.unshift(Date.now())
		//wx.setStorageSync('logs', logs)
		// 设置 request 的 header 信息
		//wx.setStorageSync('access-token', '')
		//wx.setStorageSync('partment', this.globalData.partment)
		//wx.setStorageSync('shoppoint', this.globalData.shoppoint)

		config.initSystemInfo()
		// get access token from local storage
		this.syncSession()

		//  获取商城名称
		request.get('info').then((res) => {
			wx.setStorageSync('mallName', res.data.name);
		}).catch(err => {
			console.log('get partment name error: ', err)
		})
		//wx.request({
		//  url: `${that.globalData.host}/api/${that.globalData.shop}/info`,
		//  //data: {
		//  //  key: 'shopName'
		//  //},
		//  header: that.getCommonHeader(),
		//  success: function (res) {
		//    console.log(res);
		//    if (res.statusCode == 200) {
		//      //wx.setStorageSync('mallName', res.data.data.value);
		//      wx.setStorageSync('mallName', res.data.name);
		//    }
		//  }
		//});

		// 获取用户信息
		wx.getSetting({
			success: res => {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
					wx.getUserInfo({
						success: res => {
							// 可以将 res 发送给后台解码出 unionId
							that.globalData.userInfo = res.userInfo;
							that.globalData.scope_userInfo = true;

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res)
							}
						}
					})
				} else {
					that.globalData.scope_userInfo = false;
				}
			},
			fail: res => {
				console.log('failed');
				that.globalData.scope_userInfo = false;
			}
		});

		// get sysetm info
		wx.getSystemInfo({
			success: function (res) {
				that.globalData.windowWidth = res.windowWidth
				that.globalData.windowHeight = res.windowHeight
			}
		})
	},

	//syncSession: function () {
	//  var that = this;
	//  var openid = wx.getStorageSync('openid');
	//  var access_token = wx.getStorageSync('access-token');
	//  if (openid && access_token) {
	//    wx.checkSession({
	//      success: res => {
	//        request.post('tokencheck')
	//          .then(res => {
	//            that.globalData.openid = openid;
	//            that.globalData.access_token = access_token;
	//          }).catch(err => {
	//            that.doLogin();
	//          })
	//      },
	//      fail: err => {
	//        that.doLogin();
	//      }
	//    })
	//  } else {
	//    that.doLogin();
	//  }
	//},

	//getSession: function () {
	//  //var that = this
	//  return new Promise((resolve, reject) => {
	//    //var openid = wx.getStorageSync('openid');
	//    var access_token = wx.getStorageSync('access-token');
	//    if (access_token !== undefined && access_token !== '') {
	//      //that.syncSession()
	//      reject()
	//    } else {
	//      resolve()
	//    }
	//  })
	//},

	login: function () {
		var that = this;
		return new Promise((resolve, reject) => {
			console.log('before login')
			// do login
			wx.login({
				success: res => {
					// 发送 res.code 到后台换取 openId, sessionKey, unionId
					var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
					if (res.code) {
						request.post('login', {
							code: code
						}).then(r => {
							console.log('member post login succeed:', r.data)
							that.globalData.openid = r.data.openid
							that.globalData.access_token = r.data.access_token
							//that.globalData.privilege = r.data.privilege
							//wx.setStorageSync('openid', r.data.openid);
							//wx.setStorageSync('access-token', r.data.access_token);
							//wx.setStorageSync('privilege', r.data.privilege);
							//wx.setStorageSync('addresses', r.data.addresses);
							wx.setStorageSync('appUserInfo', r.data)

							resolve(r)
						}).catch(err => {
							console.log('member login failed:', err)
							wx.showToast({
								title: '登录失败，请确认权限',
								icon: 'none',
								duration: 5000
							});
							reject()
						})
					} else {
						console.log('login failure');
						reject()
					}
				}
			});
		})
	},

	syncSession: function () {
		var that = this;
		return new Promise((resolve, reject) => {
			console.log('sync session')
			var openid = wx.getStorageSync('openid');
			var access_token = wx.getStorageSync('access-token');
			if (openid && access_token) {
				wx.checkSession({
					success: res => {
						request.post('tokencheck')
							.then(res => {
								that.globalData.openid = openid;
								that.globalData.access_token = access_token;

								resolve()
							}).catch(err => {
								console.error('wx.checkSession error', err)
								that.login().then(res => {
									resolve()
								}).catch(err2 => {
									console.error('login error', err2)
									reject()
								})
							})
					},
					fail: err => {
						console.error('wx.checkSession failed', err)
						that.login().then(res => {
							console.log('login in successful in wx.checkSession fail', res)
							resolve()
						}).catch(err2 => {
							console.log('login in failed in wx.checkSession fail', err2)
							reject()
						})
					}
				})
			} else {
				that.login().then(res => {
					resolve()
				}).catch(err => {
					reject()
				})
			}
		})
	},

	globalData: {
		scope_userInfo: false,
		access_token: null,
		userInfo: null,
		//version: "1.1.0",
		shareProfile: '纯手工，无添加', // 首页转发的时候话术
		formIds: []
	}
})
