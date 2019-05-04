const app = getApp();

//const util = require('../../utils/util.js');
//import {request, BASE_URL} from '../../utils/request.js'
//const {request, base_url} = require('../../utils/request.js')
import config from '../../config.js'
import request from '../../utils/request.js'
//import base_url from '../../utils/request.js'

Page({
	data: {
		promotions: [],
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
			console.log('get products error', err)
			wx.hideLoading()
			wx.stopPullDownRefresh()
		})
	},

	getPromotions: function () {
		var that = this;
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('promotions').then(r => {
			console.log('get promotions', r);
			if (r.data.length === 0)
				throw 'no promotion available'
			var goods = []
			r.data.forEach(promotion => {
				goods = goods.concat(promotion.products.map(item => {
					item.product.promotion_id = promotion.id
					return item.product
				}))
			})

			that.setData({
				promotions: r.data,
				goods: goods,
				show_banner: r.data.length > 0 ? false : true
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
			//callback.apply(wx)
		}).catch((err) => {
			//callback.apply(wx)
			console.log('get promotions', err);
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
			wx.startPullDownRefresh()
		}

		this.setData({
			on_show: true
		})
	},

	toViewDetail: function (e) {
		var url
		if (e.currentTarget.dataset.type === 'promotion')
			url = `detail?id=${e.currentTarget.dataset.id}`
		else
			url = `../goods/detail?code=${e.currentTarget.dataset.code}`
		wx.navigateTo({
			url: url
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
