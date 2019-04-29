// pages/pay/result.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			status: options.status,
			code: options.code
		})
	},

	payOrder: function (e) {
		var that = this
		//let currentOrder = this.orderList[e.target.dataset.orderIndex];
		// 给pay页面传两个参数orderId,actualPrice
		// console.log('订单信息', currentOrder);
		// 直接支付即可
		wx.redirectTo({
			url: `../pay/index?code=${that.data.code}`
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
