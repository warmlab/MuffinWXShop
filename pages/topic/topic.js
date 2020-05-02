import config from '../../config.js'
import request from '../../utils/request.js'

import {
	syncCart,
	addToShoppingCart
} from '../../utils/cart.js'

const app = getApp();

Page({
	data: {
		title: '小麦芬烘焙',
		amount: 0,
		loaded: false,
		base_image_url: config.base_image_url,
		is_iphonex: wx.IPHONEX >= 0 ? true : false
	},

	getProducts: function (type) {
		var that = this
		request.get('products', {
			show_type: 1,
			promote_type: type
		}).then(res => {
			console.log(res.data)
			that.setData({
				goods: res.data,
				loaded: true
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
		}).catch(err => {
			console.log('get products error', err.errcode)
			wx.hideLoading()
			wx.stopPullDownRefresh()
		})
	},

	onPullDownRefresh: function (e) {
		wx.showLoading({
			title: '加载中...',
			mask: true
		})
		this.getProducts(this.data.promote_type)
	},

	onLoad: function (options) {
		var title
		var type = parseInt(options.type)
		if (type === 0x01) // 0x01 - 热卖
			title = '今日热卖'
		else if (type === 0x02) // 0x02 - 上新
			title = '今日上新'
		else if (type === 0x04) // 0x04 - 特惠
			title = '今日特惠'
		else if (type === 0x08) // 0x08 - 预售
			title = '预售'

		wx.setNavigationBarTitle({
			title: title
		})

		this.setData({
			title: title,
			promote_type: type,
			on_show: false,
		})

		wx.showLoading({
			title: '加载中...',
			mask: true
		})
		app.getUserInfo().then(res => {
			//wx.startPullDownRefresh()
			this.getProducts(type)
			this.setData({
				userInfo: res
			})
		})

		wx.showNavigationBarLoading({
			title: '加载中...'
		})
		var cart = syncCart('cart')
		this.setData({
			amount: cart.amount
		})
		wx.hideNavigationBarLoading()
	},

	onShow: function (res) {
	},

	toViewDetail: function (e) {
		var url
		//if (e.currentTarget.dataset.type === 'promotion') {
		//	wx.setStorageSync('promotion', e.currentTarget.dataset.id)
		//	url = `detail?id=${e.currentTarget.dataset.id}`
		//} else
		url = `../goods/detail?code=${e.currentTarget.dataset.code}`
		wx.navigateTo({
			url: url
		})
	},

	addToCart: function (e) {
		var index = parseInt(e.currentTarget.dataset.index)
		var product = this.data.goods[index]

		addToShoppingCart(product, 0, 1)
		this.setData({amount: this.data.amount+1})
		wx.showToast({
			title: '成功加入购物车',
			icon: 'success',
			duration: 500
		})
	},

	goToCart: function(e) {
		wx.navigateTo({
			url: '/pages/cart/cart'
		})
	},

	swiperChange: function (e) {
		this.setData({
			swiper_current: e.detail.current,
		})
	},

	bannerImageLoad: function (e) {

	},

	// 原生的分享功能
	onShareAppMessage: function (res) {
		return {
			title: this.data.title,
			path: `/pages/topic/topic?type=${this.data.promote_type}`
		}
	}
});
