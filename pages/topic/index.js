import config from '../../config.js'
import request from '../../utils/request.js'

import {
	addToShoppingCart
} from '../../utils/cart.js'

const app = getApp();

Page({
	data: {
		promotions: [],
		goods_01: [],
		goods_02: [],
		goods_04: [],
		goods_08: [],
		page: 1,
		size: 10,
		count: 0,
		scrollTop: 0,
		showPage: false,
		base_image_url: config.base_image_url,
		show_banner: false,
		banner_height: wx.WIN_HEIGHT / 2,
		swiper_current: 0
	},

	getProducts: function () {
		var that = this
		request.get('products', {
			type: 1,
			sort: 'popular',
			limit: 11,
		}).then(res => {
			console.log(res.data)
			that.setData({
				banner_goods: res.data.slice(0, 3),
				goods: res.data.slice(3)
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
				if ((promotion.type & 0x04) > 0) // 特价
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
		this.getPromotions()
	},

	onLoad: function (res) {
		this.setData({
			on_show: false
		})

		app.getUserInfo().then(res => {
			//wx.startPullDownRefresh()
			this.getPromotions()
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
		var product;
		var type = e.currentTarget.dataset.type
		if (type == 1)
			product = this.data.goods_01[parseInt(e.currentTarget.dataset.index)]
		else if (type == 2)
			product = this.data.goods_02[parseInt(e.currentTarget.dataset.index)]
		else if (type == 4) {
			product = this.data.goods_04[parseInt(e.currentTarget.dataset.index)]
			product.in_promote = true
		} else if (type == 8)
			product = this.data.goods_08[parseInt(e.currentTarget.dataset.index)]
		console.log('aa', product)

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
			title: '小麦芬烘焙团购',
			path: '/pages/topic/index'
		}
	}
});
