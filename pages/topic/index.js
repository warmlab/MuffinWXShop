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

	getPromotions: function () {
		var that = this;
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('promotions').then(r => {
			console.log('get promotions', r);
			that.setData({
				promotions: r.data,
				show_banner: r.data.length > 0 ? false : true
			})
			wx.hideLoading()
			wx.stopPullDownRefresh()
			//callback.apply(wx)
		}).catch((err) => {
			//callback.apply(wx)
			console.log('get promotions', err);
			wx.hideLoading()
			wx.stopPullDownRefresh()
			that.setData({
				show_banner: true
			})
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

		app.syncSession().then(res => {
			wx.startPullDownRefresh()
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

	toViewPromotionDetail: function (e) {
		wx.navigateTo({
			url: `detail?id=${e.currentTarget.dataset.id}`
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
