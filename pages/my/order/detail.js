// pages/my/order_detail.js
import config from '../../../config.js'
import request from '../../../utils/request.js'

const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		base_image_url: config.base_image_url
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this;
		//options.code, options.promotion_id
		// TODO to do prepay_id
		request.get('order', {
				code: options.code
			}).then(res => {
				// order code get total cost and promotion id is to determine whether or not the promotion was finished
				console.log('order: ', res);
				that.setData({
					order: res.data,
				})
			})
			.catch(err => {
				// 
			})
	},

	payOrder: function (e) {
		var that = this
		//let currentOrder = this.orderList[e.target.dataset.orderIndex];
		// 给pay页面传两个参数orderId,actualPrice
		// console.log('订单信息', currentOrder);
		// 直接支付即可
		wx.redirectTo({
			url: `../pay/pay?code=${that.data.order.code}`
		})
	},

	cancelOrder: function (e) {
		wx.redirectTo({
			url: `note?type=refund`
		})
	}
})
