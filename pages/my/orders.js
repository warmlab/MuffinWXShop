// pages/my/order.js
const app = getApp()

import {
	request,
	base_url
} from '../../utils/request.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		base_url: base_url
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(options)
		if (options.status === 'wait')
			wx.setNavigationBarTitle({
				title: "待付款订单"
			});
		if (options.status === 'paid')
			wx.setNavigationBarTitle({
				title: "已付款订单"
			});
		if (options.status === 'finished')
			wx.setNavigationBarTitle({
				title: "已完成订单"
			});
		this.setData({
			status: options.status
		})
		wx.startPullDownRefresh()
	},

	onPullDownRefresh: function(e) {
		var that = this;
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('orders', {
				status: that.data.status
			})
			.then(res => {
				console.log(res)
				that.setData({
					orders: res.data
				})
				wx.hideLoading();
				wx.stopPullDownRefresh()
			})
			.catch(err => {
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
			url: `../pay/index?code=${code}`
		})
	}
})
