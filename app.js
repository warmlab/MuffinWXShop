import config from './config.js'
import request from './utils/request.js'
import {
	getShopInfo
} from './utils/resource.js'

App({
	onLaunch: function () {
		// 展示本地存储能力
		//var logs = wx.getStorageSync('logs') || []
		//logs.unshift(Date.now())
		//wx.setStorageSync('logs', logs)

		config.initSystemInfo()

		// 登录
		this.doLogin()
	},

	wxLogin: function (resolve, reject) {
		// do weixin's login
		wx.login({
			success: res => {
				// 发送 res.code 到后台换取 openId, sessionKey, unionId
				request.post('login', {
					code: res.code
				}).then(res => {
					//wx.setStorageSync('appUserInfo', res.data)
					console.log('wx.login', res.data)
					resolve(res.data)
				}).catch(err => {
					console.error('weixin login error:', err)
					wx.showModal({
						content: "系统正在升级中，请稍后...",
						showCancel: false,
						confirmText: "我知道了",
						confirmColor: '#481A0E'
					})
					reject(err)
				})
			}
		})
	},

	login: function () {
		var that = this
		return new Promise((resolve, reject) => {
			var userInfo = wx.getStorageSync('appUserInfo')
			if (!!userInfo && !!userInfo.access_token) {
				request.post('tokencheck').then(res => {
					console.log('tokencheck OK', res)
					resolve(userInfo)
				}).catch(err => {
					console.log('tokencheck ERR and to do weixin login', err)
					that.wxLogin(resolve, reject)
				})
			} else {
				console.log('to do wxlogin', userInfo)
				that.wxLogin(resolve, reject)
			}
		})
	},

	doLogin: function() {
		var that = this
		this.login().then(userInfo => {
			//that.globalData.userInfo = userInfo
			// TODO getShopInfo() // should be get info after login
			wx.setStorageSync('appUserInfo', userInfo)

			// 获取用户信息
			wx.getSetting({
				withSubscriptions: true,
				success: res => {
					if (res.authSetting['scope.userInfo']) {
						// 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
						wx.getUserInfo({
							success: res => {
								console.log('get user info:', res)
								// 可以将 res 发送给后台解码出 unionId
								that.globalData.userInfo = userInfo
								that.globalData.userInfo.avatarUrl = res.userInfo.avatarUrl
								that.globalData.userInfo.nickname = res.userInfo.nickName
								//that.globalData.userInfo.subscriptions = res.subscriptionsSetting
								wx.setStorageSync('appUserInfo', that.globalData.userInfo)

								// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
								// 所以此处加入 callback 以防止这种情况
								if (that.userInfoReadyCallback) {
									that.userInfoReadyCallback(res)
								}
							}
						})
					}
					console.log('subscriptions', res.subscriptionsSetting)
					if (!!res.subscriptionsSetting) {
						if (res.subscriptionsSetting.mainSwitch) {
							if (!res.subscriptionsSetting.itemSettings) {
								that.globalData.way_pickup.status = 1
								that.globalData.way_delivery.status = 1
							} else {
								if (res.subscriptionsSetting.itemSettings[that.globalData.way_pickup.tmplId] === 'accept')
									that.globalData.way_pickup.status = 1
								if (res.subscriptionsSetting.itemSettings[that.globalData.way_delivery.tmplId] === 'accept')
									that.globalData.way_delivery.status = 1
							}
						}

						console.log('app subscriptions', that.globalData.way_pickup, that.globalData.way_delivery)
					}
				}
			})
		})
	},

	getUserInfo: function () {
		var times = 0
		return new Promise((resolve, reject) => {
			var interval = setInterval(function () {
				var userInfo = wx.getStorageSync('appUserInfo')
				if (userInfo) {
					clearInterval(interval)
					resolve(userInfo)
				}
				if (times++ > 10) {
					clearInterval(interval)
					reject('cannot get user Info')
				}
			}, 1000)
		})
	},

	globalData: {
		userInfo: null,
		way_pickup: {tmplId: 'BmAwxIPTXz1p5ymj3g04NwrfuwnEl-ySpeaHrv7kxss', status: 0},    // 取货提醒模板
		way_delivery: {tmplId: 'BmAwxIPTXz1p5ymj3g04NxChpWWI4sbgdy1RPyXphnU', status: 0},  // 快递提醒模板
		//subscriptions: [{tmplId: way_pickup, status: 0},
		//				{tmplId: way_delivery, status: 0}]
	}
})
