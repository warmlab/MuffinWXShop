// pages/address/index.js
const app = getApp()

import request from '../../../utils/request.js'
import config from '../../../config.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		width: 0,
		transparent: 0,
		is_iphonex: wx.IPHONEX >= 0? true : false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var res = wx.getSystemInfoSync()
		this.setData({
			type: options.type,
			windowWidth: res.windowWidth,
		})
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
		var userInfo = wx.getStorageSync('appUserInfo')
		console.log('aa', userInfo)
		request.get('openid/addresses', {
			openid: userInfo.openid
		}).then(res => {
			console.log('address of the user', res)
			that.setData({
				addresses: res.data,
				address_items: Array.from(res.data, ele => {return {x: 0, width:0, opacity:0}})
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
	// 点击选中
	toSelectItem: function (e) {
		if (this.data.type !== 'select')
			return

		var pages = getCurrentPages();
		var prePage = pages[pages.length - 2];
		//prePage.setData({dragon:res.data});
		if ('getMemberAddresses' in prePage) {
			prePage.getMemberAddresses(parseInt(e.currentTarget.dataset.id));
			wx.navigateBack()
		}
	},
	toStartTouch: function(e) {
		var index = parseInt(e.currentTarget.dataset.index)
		console.log('start touch', e)
		this.data.address_items[index].x = e.touches[0].pageX
		this.data.address_items[index].width = 0
		//this.setData({
		//	x_starts: this.data.x_starts
		//})
	},
	toTouchItem: function (e) { 
		var index = parseInt(e.currentTarget.dataset.index)
		console.log('touch', e)
		var distance = this.data.address_items[index].x - e.touches[0].pageX
		if (distance > 0 && distance <= 120) {
			this.data.address_items[index].width = distance
			this.data.address_items[index].opacity = distance/120
			this.setData({
				address_items: this.data.address_items
			})
		} else if (distance < 0 && distance >= -120) {
			this.data.address_items[index].width = 120 +distance
			this.data.address_items[index].opacity = (120+distance)/120
			this.setData({
				address_items: this.data.address_items
			})	
		}
	},
	toStopTouch: function(e) {
		//var index = parseInt(e.currentTarget.dataset.index)
		//var distance = this.data.address_items[index].x - e.touches[0].pageX
		//if (distance>=100 || distance <= -100) {
		//	distance
		//}
		/*if (this.data.x_start - e.changedTouches[0].pageX > 100) {
			console.log('okay touch')
			this.setData({
				width: 120,
				transparent: 1
			})
		}*/
	},
	// 点击修改，或者点击底部“新建”
	toEditItem: function (event) {
		// console.log('点击修改/新建地址', event)
		wx.navigateTo({
			url: 'detail?id=' + event.currentTarget.dataset.id
		})
	},
	// 点击删除图标
	toDeleteItem: function (e) {
		// console.log('点击删除', event)
		let that = this;
		wx.showModal({
			title: '删除地址',
			content: '确定要删除地址？',
			confirmColor: '#481A0E',
			success: function (res) {
				if (res.confirm) {
					console.log(e)
					request.delete('openid/address', {
						id: e.currentTarget.dataset.id
					}).then(res => {
						that.syncAddresses();
					}).catch(err => {
						console.log(err);
					})
				}
			}
		})
	}
})
