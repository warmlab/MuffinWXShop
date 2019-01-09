// pages/shop/product.js
const app = getApp()

import {
	addToShoppingCart,
	syncCart
} from '../../utils/cart.js'
import {
	request,
	base_url
} from '../../utils/request.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		base_url: base_url,
		price_plus: 0,
		size: 0,
		current_size: null,
		openAttr: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('product', {
				code: options.code
			})
			.then(res => {
				console.log(res)
				res.data.want_amount = 1
				if (res.data.category.extra_info & 1 === 1 && res.data.sizes.length > 0)
					that.setData({
						product: res.data,
						details: res.data.images.slice(1),
						current_size: res.data.sizes[0],
						price_plus: res.data.sizes[0].price_plus
					})
				else
					that.setData({
						product: res.data,
						details: res.data.images.slice(1)
					})

				wx.hideLoading()
			}).catch(err => {
				console.error('get product error', err)
				wx.hideLoading()
			})

		this.syncCartInfo()
	},

	onUnload: function () {
		var pages = getCurrentPages()
		var prePage = pages[pages.length - 2]
		//prePage.setData({dragon:res.data});
		try {
			prePage.syncCartInfo()
		} catch (err) {}
	},

	syncCartInfo: function () {
		var cart = syncCart()
		this.setData({
			cart: cart
		})
	},

	openAttrDialog: function (e) {
		console.log(e)
		this.setData({
			openAttr: true,
			buy_type: e.currentTarget.dataset.type
		})
	},

	amountSet: function (e) {
		var v = parseInt(e.detail.value);
		//var a = parseInt(this.data.order.amount);
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

		product.want_amount = v
	},

	sizeChoose: function (e) {
		console.log(e)
		var ps = this.data.product.sizes[parseInt(e.detail.value)]
		this.setData({
			size: ps.size.id,
			price_plus: ps.price_plus,
			current_size: ps
		})

		console.log('curent size', this.data.current_size)
	},

	amountChange: function (e) {
		var v = parseInt(e.currentTarget.dataset.value);
		//var a = parseInt(this.data.order.amount);
		var product = this.data.product;

		if (v < 0) {
			if (product.want_amount > -v) {
				product.want_amount += v;

				this.setData({
					product: product
				})
			}
		} else if (v > 0) {
			product.want_amount += v;

			this.setData({
				product: product
			})
		}
	},

	buy: function (e) {
		if (this.data.product.category.extra_info & 1 === 1 &&
			this.data.product.sizes.length > 0) {
			// need product size in purchase
			if (!this.data.size) {
				wx.showToast({
					title: '蛋糕尺寸需要选择',
					icon: 'none',
					duration: 2000
				})

				return
			}
		}
		this.data.product.checked = true
		this.setData({
			product: this.data.product,
			openAttr: false,
		})
		wx.setStorageSync('buy', {
			products: [this.data.product],
			amount: this.data.product.want_amount,
			cost: this.data.product.want_amount * this.data.product.price
		})
		wx.navigateTo({
			url: "pre_order?type=buy"
		})
	},

	closeAttr: function (e) {
		this.setData({
			openAttr: false
		})
	},

	addToCart: function (e) {
		if (this.data.product.category.extra_info & 1 === 1 &&
			this.data.product.sizes.length > 0) {
			// need product size in purchase
			if (!this.data.current_size) {
				wx.showToast({
					title: '蛋糕尺寸需要选择',
					icon: 'none',
					duration: 2000
				})

				return
			}
		}
		addToShoppingCart(this, this.data.product, this.data.current_size, 1)
		this.closeAttr()
	},

	toBuy: function (e) {
		console.log(e)
		if (this.data.buy_type === 'choose') {
			// set current_size
			// do nothing
		} else if (this.data.buy_type === 'immediate') // click the 'buy' button
			this.buy(e)
		else
			this.addToCart(e)
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		return {
			title: ' 小麦芬烘焙小店',
			path: '/pages/shop/index'
		}
	}
})
