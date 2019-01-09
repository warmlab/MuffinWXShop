const app = getApp();

//const util = require('../../utils/util.js');
//import {request, BASE_URL} from '../../utils/request.js'
//const {request, base_url} = require('../../utils/request.js')
import {
	request,
	base_url
} from '../../utils/request.js'
//import base_url from '../../utils/request.js'

Page({
	data: {
		promotions: [],
		page: 1,
		size: 10,
		count: 0,
		scrollTop: 0,
		showPage: false,
		base_url: base_url,
		show_banner: false
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
		console.log('on load')
		this.setData({
			on_show: false
		})

		app.syncSession().then(res => {
			wx.startPullDownRefresh()
		})
	},

	onShow: function (res) {
		console.log('on show')
		if (this.data.on_show) {
			wx.startPullDownRefresh()
		}

		this.setData({
			on_show: true
		})
	},

	// 原生的分享功能
	onShareAppMessage: function (res) {
		return {
			title: '小麦芬烘焙团购',
			path: '/pages/topic/index'
		}
	}
});
