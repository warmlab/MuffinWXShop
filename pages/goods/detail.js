// pages/shop/product.js
const app = getApp()

import {
	addToShoppingCart,
	syncCart
} from '../../utils/cart.js'

import config from '../../config.js'
import request from '../../utils/request.js'
import drawCanvas from '../../utils/canvas.js'

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
		}).then(res => {
			console.log(res)
			var banners = []
			var details = []
			res.data.images.forEach(ele => {
				console.log('aaa', ele)
				if ((ele.type & 2) === 2)
					details.push(ele.image)
				else
					banners.push(ele.image)
			})
			console.log('aaa', banners, details)
			res.data.want_amount = 1
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

	openCartPage: function (e) {
		wx.reLaunch({
			url: '/pages/cart/index'
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
			url: "../cart/pre_order?type=buy"
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

	generateShareImage: function (e) {
		var that = this
		var qrcode = that.data.qrcode
		var user = wx.getStorageSync('appUserInfo').openid
		if (qrcode) {
			//如果已经生成过，直接显示
			that.setData({
				codeMask: true
			})
			wx.saveImageToPhotosAlbum({
				filePath: qrcode,
				success: r => {
					wx.showToast({
						title: '保存成功',
						icon: 'success',
						duration: 2000
					})
				}
			})

			return
		}

		var data = that.data.product
		var user = wx.getStorageSync('appUserInfo')
		wx.showLoading({
			title: '正在准备生成'
		})
		//下载商品海报
		wx.downloadFile({
			url: `${config.base_image_url}/${that.data.banners[0].name}`,
			success: pic => {
				if (pic.statusCode === 200) {
					//商品海报图片
					var pictmp = pic.tempFilePath;
					wx.showLoading({
						title: '生成小程序码'
					})
					request.post('qrcode', {
						//type: 'qr',
						//scene: 'product=' + data.id + ',user=' + user.openid + ',s=1',
						product: data.code,
						path: '/pages/shop/product'
					}).then(res => {
						console.log('qrcode', res)
						if (res.statusCode === 200) {
							wx.showLoading({
								title: '下载小程序码'
							});
							wx.downloadFile({
								url: `${config.base_image_url}/${res.data.qr_image_path}`,
								success: qr => {
									if (qr.statusCode === 200) {
										drawCanvas(that, 'shareCanvas', user.nickname, pictmp, data.name, data.summary, data.price, qr.tempFilePath, user.avatarUrl, false)
									}
								},
								fail: err => {
									console.error('download generated mini program code error')
									wx.hideLoading()
									wx.showModal({
										title: "错误",
										content: "下载生成的小程序码出错",
										showCancel: false
									})
								}
							})
						} else {
							that.generateShareImage()
						}
					}).catch(err => {
						console.error('generate mini program code error', err)
						wx.hideLoading()
						wx.showModal({
							title: "错误",
							content: "生成小程序码出错",
							showCancel: false
						})
					})
				}
			},
			fail: err => {
				console.error('download goods image error')
				wx.hideLoading()
				wx.showModal({
					title: "错误",
					content: "下载商品海报图片出错",
					showCancel: false
				})
			}
		})
	},
})
