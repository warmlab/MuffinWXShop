import config from '../../config.js'
import request from '../../utils/request.js'

import {
	addToShoppingCart
} from '../../utils/cart.js'

const app = getApp();

Page({
	data: {
		title: '小麦芬烘焙',
		base_image_url: config.base_image_url
	},

	getProducts: function (type) {
		var that = this
		wx.showLoading({
			title: '加载中...',
			mask: true
		})
		request.get('products', {
			show_type: 1,
			promote_type: type
		}).then(res => {
			console.log(res.data)
			that.setData({
				goods: res.data
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
		}).catch(err => {
			console.log('get products error', err.status)
			wx.hideLoading()
			wx.stopPullDownRefresh()
		})
	},

	getPromotions: function () {
		var that = this;
		var goods_01 = []
		var goods_02 = []
		var goods_04 = []
		var goods_08 = []
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('promotions').then(r => {
			console.log('get promotions', r);
			if (r.data.length === 0)
				throw 'no promotion available'
			r.data.forEach(promotion => {
				if ((promotion.type & 0x01) > 0) // 热卖
					goods_01 = goods_01.concat(promotion.products.map(item => {
						item.product.promotion_id = promotion.id
						return item.product
					}))
				if ((promotion.type & 0x02) > 0) // 上新
					goods_02 = goods_02.concat(promotion.products.map(item => {
						item.product.promotion_id = promotion.id
						return item.product
					}))
				if ((promotion.type & 0x04) > 0) // 特惠
					goods_04 = goods_04.concat(promotion.products.map(item => {
						item.product.promotion_id = promotion.id
						return item.product
					}))
				if ((promotion.type & 0x08) > 0) // 预售
					goods_08 = goods_08.concat(promotion.products.map(item => {
						item.product.promotion_id = promotion.id
						return item.product
					}))
			})

			that.setData({
				promotions: r.data,
				goods_01: goods_01,
				goods_02: goods_02,
				goods_04: goods_04,
				goods_08: goods_08,
				show_banner: r.data.length > 0 ? false : true
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
			//callback.apply(wx)
		}).catch((err) => {
			//callback.apply(wx)
			console.log('get promotions', err);
			if (err.status === 3001) {// access token error
				app.doLogin()
				request.header['X-ACCESS-TOKEN'] = undefined
			}
			//wx.stopPullDownRefresh()
			that.getProducts()
			//that.setData({
			//	show_banner: true
			//})
			//callback()
		})
	},

	onPullDownRefresh: function (e) {
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
			title = '今日预售'

		wx.setNavigationBarTitle({
			title: title
		})

		this.setData({
			title: title,
			promote_type: options.type,
			on_show: false
		})

		app.getUserInfo().then(res => {
			//wx.startPullDownRefresh()
			this.getProducts(options.type)
		})
	},

	onShow: function (res) {
		if (this.data.on_show) {
			this.getPromotions()
		}

		this.setData({
			on_show: true
		})
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
		var index = paserInt(e.currentTarget.dataset.index)
		var product = this.data.goods[index]

		addToShoppingCart(product, 0, 1)
		wx.showToast({
			title: '成功加入购物车',
			icon: 'success',
			duration: 2000
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
			path: `/pages/topic/topic?type=${this.data.type}`
		}
	}
});
