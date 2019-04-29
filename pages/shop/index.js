import config from '../../config.js'
import request from '../../utils/request.js'

const app = getApp();

import {
	addToShoppingCart,
	syncCart
} from '../../utils/cart.js'

import {
	WEB_ALLOWED,
	getCategories
} from '../../utils/resource.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		base_image_url: config.base_image_url,
		category_id: 0,
		extra_info: 0
	},

	getProducts: function (category_id) {
		var that = this;
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('products', {
				category: category_id,
				type: WEB_ALLOWED
			})
			.then(res => {
				console.log('products', res.data)
				that.setData({
					products: res.data
				})
				wx.hideLoading()
				wx.stopPullDownRefresh()
			})
			.catch(err => {
				console.log('get products', err)
				wx.hideLoading()
				wx.stopPullDownRefresh()
			})
	},

	syncCartInfo: function () {
		var cart = syncCart()
		this.setData({
			cart: cart
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this
		app.syncSession().then(res => {
			wx.startPullDownRefresh()
			that.syncCartInfo()
		})
	},

	categorySwitch: function (e) {
		console.log(e)
		this.setData({
			category_id: e.currentTarget.dataset.id,
			extra_info: parseInt(e.currentTarget.dataset.extra)
		})
		this.getProducts(e.currentTarget.dataset.id)
	},

	productDetail: function (e) {
		wx.navigateTo({
			url: `product?code=${e.currentTarget.dataset.code}`
		})
	},

	openAttrDialog: function (e) {
		console.log(e)
		this.setData({
			openAttr: true,
		})
	},

	amountSet: function (e) {
		var v = parseInt(e.detail.value)
		//var a = parseInt(this.data.order.amount)
		var product = this.data.product

		console.log(e)
		if (v < 0) {
			wx.showToast({
				title: '购买数量不能小于0',
				icon: 'none',
				duration: 2000
			});

			return 0
		}

		this.data.products[parseInt(e.currentTarget.dataset.index)].want_amount = v
	},

	addToCart: function (e) {
		var product = this.data.products[parseInt(e.currentTarget.dataset.index)]

		// start animation
		var animation1 = wx.createAnimation({
			duration: 0,
			timingFunction: 'linear'
		})
		animation1.bottom(`${app.globalData.windowHeight - e.touches[0].clientY}px`)
			.right(`${app.globalData.windowWidth - e.touches[0].clientX}px`).scale(1, 1).opacity(1).step()
		this.setData({
			animation_data: animation1.export(),
			image_url: `${base_url}/media/${product.images[0].image.name}`
		})

		var animation = wx.createAnimation({
			duration: 1000,
			timingFunction: 'ease'
		})
		animation.bottom('38rpx').right('48rpx').scale(0.1, 0.1).step()
		animation.opacity(0).step()
		this.setData({
			animation_data: animation.export()
		})

		addToShoppingCart(this, product, 0, 1)
	},

	toShoppingCart: function (e) {
		wx.navigateTo({
			url: "cart"
		})
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		var that = this;
		wx.showNavigationBarLoading()
		getCategories().then(categories => {
			if (categories && categories.length > 0) {
				if (that.data.category_id <= 0) {
					that.getProducts(categories[0].id)

					that.setData({
						category_id: categories[0].id,
						extra_info: categories[0].extra_info ? categories[0].extra_info : 0,
						categories: categories
					})
				} else {
					that.getProducts(that.data.category_id)

					that.setData({
						categories: categories
					})
				}
				wx.hideNavigationBarLoading()
			} else {
				that.setData({
					categories: categories
				})
				wx.hideNavigationBarLoading()
			}
		}).catch(err => {
			wx.hideNavigationBarLoading()
		})
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		return {
			title: '小麦芬烘焙',
			path: '/pages/shop/index'
		}
	}
})
