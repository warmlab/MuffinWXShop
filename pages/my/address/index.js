// pages/address/index.js
const app = getApp()

import request from '../../../utils/request.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.hideShareMenu();
	},

	onShow: function (e) {
		this.syncAddresses()
	},

	syncAddresses: function () {
		var that = this;
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('openid/addresses').then(res => {
			console.log('address of the user', res)
			that.setData({
				addresses: res.data
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
		}).catch(err => {
			console.log('get addresses from server error', err)
			that.setData({
				addresses: []
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
		})
	},

	onPullDownRefresh: function (e) {
		this.syncAddresses()
	},

	timeChange: function (e) {
		this.setData({
			[e.currentTarget.dataset.name]: e.detail.value
		});
	},

	defaultAddress: function (e) {
		this.setData({
			is_default: e.detail.value.length > 0
		});
	},
	// 点击修改，或者点击底部“新建”
	toEditItem: function (event) {
		// console.log('点击修改/新建地址', event)
		wx.navigateTo({
			url: 'detail?id=' + event.currentTarget.dataset.id
		})
	},
	// 点击删除图标
	deleteAddress: function (e) {
		// console.log('点击删除', event)
		let that = this;
		wx.showModal({
			title: '',
			content: '确定要删除地址？',
			success: function (res) {
				if (res.confirm) {
					console.log(e)
					request.delete('openid/address', {
							openid: app.globalData.openid,
							id: e.currentTarget.dataset.id
						})
						.then(res => {
							that.syncAddresses();
						})
						.catch(err => {
							console.log(err);
						})
				}
			}
		})
	}
})
