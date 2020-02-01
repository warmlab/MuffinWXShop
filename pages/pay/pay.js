// pages/pay/weixin.js
const app = getApp()

import request from '../../utils/request.js'
//import sendTemplateMessage from '../../utils/message.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: {},
		payment: 0,
		payments: []
	},

	getOrder: function () {
		var that = this;
		request.get('order', {
			code: that.data.code,
			extra: true
		}).then(res => {
			// order code get total cost and promotion id is to determine whether or not the promotion was finished
			var payments = []
			if (res.data.payment & 2)
				payments.push({
					value: 2,
					name: '储值卡支付'
				})
			if (res.data.payment & 4)
				payments.push({
					value: 4,
					name: '微信支付'
				})
			// TODO 微信小程序不支持alipay
			//if (res.data.payment & 8)
			//	payments.push({
			//		value: 8,
			//		name: '支付宝支付'
			//	})
			that.setData({
				order: res.data,
				payments: payments
			})
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this;
		//options.code, options.promotion_id
		// TODO to do prepay_id

		// get user info
		//wx.setStorageSync('appUserInfo', e.detail.userInfo);
		this.setData({
			code: options.code,
			//privilege: wx.getStorageSync('privilege')
		});

		this.toGetUserInfo()
		this.getOrder()
	},

	toGetUserInfo: function(e) {
		// get user info
		var userInfo = wx.getStorageSync('appUserInfo')
		//wx.setStorageSync('appUserInfo', e.detail.userInfo);
		this.setData({
			userInfo: userInfo
			//privilege: wx.getStorageSync('privilege')
		});
	},

	paymentChange: function (e) {
		this.setData({
			payment: parseInt(e.currentTarget.dataset.value)
		})
	},

	bindValuecard: function (e) {
		wx.navigateTo({
			url: '/pages/my/valuecard'
		})
	},

	startPay: function (e) {
		var that = this;
		/*
		if (this.data.order.address.delivery_way == 1 && !this.data.order.member_openid.phone) {
			if (e.detail.value.contact.trim() === '' || e.detail.value.mobile.trim() === '') {
				wx.showModal({
					content: '联系信息',
					title: '联系信息需要填写完整',
					showCancel: false
				})

				return
			}
		}
		*/

		if (this.data.payment === 0) {
			wx.showModal({
				content: '支付方式',
				title: '请选择一种支付方式',
				showCancel: false
			})

			return
		}
		// console.log('pay页直接支付,请求结果', res);
		// payment
		request.post('pay', {
			code: that.data.order.code,
			payment: that.data.payment,
			//contact: e.detail.value.contact,
			//mobile: e.detail.value.mobile,
			formId: e.detail.formId
		}).then(res => {
			if (res.statusCode === 201) {
				if (res.data.payment.payment === 2) { // pay by value card
					// TODO that.sendJoinSuccessfullInfo(wx.getStorageSync('openid'), res.data.order, app.globalData.formIds.pop());
					//that.sendPaidMessage(app.globalData.openid, res.data.order, res.data.payment, e.detail.formId);
					//wx.navigateTo({
					wx.redirectTo({
						url: 'result?status=success&code=' + that.data.order.code
					})
				} else {
					wx.requestPayment({
						timeStamp: res.data.payment.timeStamp,
						nonceStr: res.data.payment.nonceStr,
						package: res.data.payment.package,
						signType: res.data.payment.signType,
						paySign: res.data.payment.paySign,
						success: function (pay_res) {
							//that.getOrders(that.data.dragon.code);
							// send info to current user
							//that.sendPaidMessage(app.globalData.openid, res.data.order, res.data.payment, e.detail.formId);
							//wx.navigateTo({
							wx.redirectTo({
								url: `result?status=success&code=${that.data.order.code}`
							});
						},
						fail: function (err) {
							//wx.navigateTo({
							wx.redirectTo({
								url: `result?status=canceled&code=${that.data.order.code}`
							});
						}
					});
				}
			} else if (res.statusCode === 200) { // already paid
				//wx.navigateTo({
				wx.redirectTo({
					url: `result?status=paid&code=${that.data.order.code}`
				});
			}
		}).catch(err => {
			console.log('pay failed', err)
			//wx.navigateTo({
			wx.redirectTo({
				url: `result?status=error&code=${that.data.order.code}`
			});
		})
	}
})
