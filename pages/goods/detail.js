// pages/shop/product.js
const app = getApp()

import {
	addToShoppingCart,
	syncCart
} from '../../utils/cart.js'

import config from '../../config.js'
import request from '../../utils/request.js'
import MyCanvas from '../../utils/canvas.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		base_image_url: config.base_image_url,
		swiper_current: 0,
		price_plus: 0,
		size: 0,
		current_size: null,
		openShare: false,
		openAttr: false,
		canvas_id: 'shareCanvas'
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
		}).then(res => {
			console.log('product info', res)
			var banners = []
			var details = []
			res.data.images.forEach(ele => {
				if ((ele.type & 2) === 2)
					details.push(ele.image)
				else
					banners.push(ele.image)
			})
			res.data.want_amount = 1
			var now = new Date()
			var begin_time = new Date(res.data.promote_begin_time)
			var end_time = new Date(res.data.promote_end_time)
			if (begin_time <= now && end_time >= now && (res.data.promote_type & 0x04) === 0x04)
				res.data.in_promote = true

			if (res.data.category.extra_info & 1 === 1 && res.data.sizes.length > 0)
				that.setData({
					banners: banners,
					details: details,
					product: res.data,
					current_size: res.data.sizes[0],
					price_plus: res.data.sizes[0].price_plus
				})
			else
				that.setData({
					banners: banners,
					details: details,
					product: res.data
				})

			wx.hideLoading()
		}).catch(err => {
			console.error('get product error', err)
			if (err.status === 3001) {// access token error
				app.doLogin()
				request.header['X-ACCESS-TOKEN'] = undefined
			}
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

	swiperChange: function (e) {
		this.setData({
			swiper_current: e.detail.current
		})
	},

	openShareDialog: function (e) {
		this.setData({
			openShare: true
		})
	},

	closeShareDialog: function (e) {
		this.setData({
			openShare: false
		})
	},

	openAttrDialog: function (e) {
		console.log(e)
		this.setData({
			openAttr: true,
			buy_type: e.currentTarget.dataset.type
		})
	},

	openHomePage: function (e) {
		wx.reLaunch({
			url: '/pages/topic/index'
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
			url: "../pay/order?type=buy"
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
		addToShoppingCart(this.data.product, this.data.current_size, 1)
		this.closeAttr()
		wx.showToast({
			title: '成功加入购物车',
			icon: 'success',
			duration: 2000
		})
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
		this.setData({
			openShare: false
		})
		if (this.data.product)
			return {
				title: this.data.product.name,
				path: `/pages/goods/detail?code=${this.data.product.code}`
			}
		else
			return {
				title: '小麦芬烘焙',
				path: '/pages/goods/index'
			}
	},

	afterGenerateImage: function (path) {
		this.setData({
			qrcode: path,
			openShare: false
		})
	},

	generateShareImage: function (e) {
		var that = this
		var qrcode = that.data.qrcode
		if (qrcode) {
			//如果已经生成过，直接显示
			that.setData({
				openShare: false
			})
			wx.saveImageToPhotosAlbum({
				filePath: qrcode,
				success: r => {
					wx.showModal({
						title: '商品海报图片',
						content: '已成功保存到相册，请到系统相册查看',
						showCancel: false
					})
				}
			})

			return
		}

		var canvas = new MyCanvas(that, '/pages/goods/detail', 'product',
			that.data.canvas_id, that.data.product.id, that.data.product.name, that.data.product.summary,that.data.product.price,that.data.product.price,
			`${config.base_image_url}/${that.data.banners[0].name}`, this.afterGenerateImage)
		canvas.generateImage()
	}
})
