import request from '../../utils/request.js'

const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: {},
		payment: 0,
		weixin_pay_cost: 0,
		payments: [{value: 2, name: '储值卡支付'},{value: 4, name: '微信支付'}],
		// TODO 微信小程序不支持alipay
		//if (res.data.payment & 8)
		//	payments.push({
		//		value: 8,
		//		name: '支付宝支付'
		//	})
	},

	getOrder: function () {
		var that = this;
		wx.showLoading({
			title: '订单加载中...',
			mask: true
		})
		request.get('order', {
			code: that.data.code,
			extra: true
		}).then(res => {
			// order code get total cost and promotion id is to determine whether or not the promotion was finished
			/* TODO var weixin_pay_cost = 0
			res.data.products.forEach(item => {
				if (item.product.payment & 2 === 0) { // 只能用微信支付
					weixin_pay_products.push(item)
					weixin_pay_cost = item.amount * item.price
				}
			})*/
			console.log(res.data)
			if ((res.data.delivery_way === 1) ||	// 自提			
				(res.data.delivery_way === 2))	{// 快递 
			}
			that.setData({
				//weixin_pay_products: weixin_pay_products,
				//weixin_pay_cost: weixin_pay_cost,
				order: res.data
			})
			wx.hideLoading()
		}).catch(err => {
			console.log('get order error', err)
			wx.hideLoading()
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
		var that = this;
		if (this.data.payment === 0) {
			wx.showModal({
				content: '支付方式',
				title: '请选择一种支付方式',
				confirmColor: '#481A0E',
				showCancel: false
			})

			return
		}

		wx.showLoading({
			title: '支付中，请稍后...',
			mask: true
		})
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
						url: `result?status=success&&payment=${that.data.payment}&code=${that.data.order.code}`
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
								url: `result?status=success&payment=${that.data.payment}&code=${that.data.order.code}`
							});
						},
						fail: function (err) {
							//wx.navigateTo({
							wx.redirectTo({
								url: `result?status=canceled&payment=${that.data.payment}&code=${that.data.order.code}`
							});
						}
					});
				}
			} else if (res.statusCode === 200) { // already paid
				wx.hideLoading()
				//wx.navigateTo({
				wx.redirectTo({
					url: `result?status=paid&payment=${that.data.payment}&code=${that.data.order.code}`
				});
			}
		}).catch(err => {
			wx.hideLoading()
			console.log('pay failed', err)
			//wx.navigateTo({
			wx.redirectTo({
				url: `result?status=error&payment=${that.data.payment}&code=${that.data.order.code}`
			});
		})
	}
})
