// pages/my/order.js
const app = getApp()

import config from '../../../config.js'
import request from '../../../utils/request.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		orders: [],
		page: 0,
		to_get_more: true,
		base_image_url: config.base_image_url
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(options)
		if (options.status == 1)
			wx.setNavigationBarTitle({
				title: "待付款订单"
			});
		if (options.status == 2)
			wx.setNavigationBarTitle({
				title: "已付款订单"
			});
		if (options.status == 4)
			wx.setNavigationBarTitle({
				title: "已交付订单"
			});
		if (options.status === 8)
			wx.setNavigationBarTitle({
				title: "已完成订单"
			});
		this.setData({
			status: options.status,
			page: 0
		})
		this.getOrders()
	},

	onPullDownRefresh: function (e) {
		this.getOrders()
	},

	getOrders: function() {
		var that = this
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('orders', {
			page: that.data.page,
			status: that.data.status
		}).then(res => {
			var array = that.data.orders.concat(res.data.orders)
			console.log(that.data.orders)
			that.setData({
				orders: array,
				to_get_more: res.data.orders.length === res.data.item_each_page,
				item_each_page: res.data.item_each_page
			})
			wx.hideLoading();
			wx.stopPullDownRefresh()
		}).catch(err => {
			console.log(err)
			wx.hideLoading();
			wx.stopPullDownRefresh()
		})
	},

	payOrder: function (e) {
		//let currentOrder = this.orderList[e.target.dataset.orderIndex];
		let code = e.target.dataset.order;
		// 给pay页面传两个参数orderId,actualPrice
		// console.log('订单信息', currentOrder);
		// 直接支付即可
		wx.navigateTo({
			url: `/pages/pay/pay?code=${code}`
		})
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (this.data.to_get_more) {
			this.data.page += 1
			this.getOrders()
		}
	},
})
