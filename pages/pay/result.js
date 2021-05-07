const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// get order info
		this.setData({
			status: options.status,
			payment: options.payment,
			code: options.code,
			way_pickup: app.globalData.way_pickup.status,
			way_delivery: app.globalData.way_delivery.status
		})
	},

	openSubscriptions: function(e) {
		var that = this
		wx.requestSubscribeMessage({
			tmplIds: [app.globalData.way_pickup.tmplId, app.globalData.way_delivery.tmplId],
			success (res) {
				if (res[app.globalData.way_pickup.tmplId] === 'accept')
					app.globalData.way_pickup.status = 1

				if (res[app.globalData.way_delivery.tmplId] === 'accept')
					app.globalData.way_delivery.status = 1

				that.setData({
					way_pickup: app.globalData.way_pickup.status,
					way_delivery: app.globalData.way_delivery.status
				})

				/*
				if (app.globalData.way_pickup.status === 1 &&
					app.globalData.way_delivery.status === 1) {
					wx.showModal({
						title: '接收订单消息',
						content: '请注意查看微信里的“服务通知”',
						confirmColor: "#481A0E",
						showCancel: false
					})
				} else if (app.globalData.way_delivery.status === 1) {
					wx.showModal({
						title: '只接收快递订单消息',
						content: '请注意查看微信里的“服务通知”',
						confirmColor: "#481A0E",
						showCancel: false
					})
				} else if (app.globalData.subscriptions[0].status === 1) {
					wx.showModal({
						title: '只接收自提订单消息',
						content: '请注意查看微信里的“服务通知”',
						confirmColor: "#481A0E",
						showCancel: false
					})
				} else {
					wx.showModal({
						title: '不接收任何订单消息',
						confirmColor: "#481A0E",
						showCancel: false
					})
				}*/
			}
		})
	},

	payOrder: function (e) {
		var that = this
		//let currentOrder = this.orderList[e.target.dataset.orderIndex];
		// 给pay页面传两个参数orderId,actualPrice
		// console.log('订单信息', currentOrder);
		// 直接支付即可
		wx.redirectTo({
			url: `../pay/pay?status=${that.data.status}&payment=${that.data.payment}&code=${that.data.code}`
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
