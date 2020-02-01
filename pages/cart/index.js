// pages/shop/cart.js

import config from '../../config.js'
import request from '../../utils/request.js'
import {syncCart} from '../../utils/cart.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		base_image_url: config.base_image_url,
		checked_num: 0,
		promote_goods: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		//wx.startPullDownRefresh()
	},

	onShow: function (e) {
		this.syncGoods()
	},

	onPullDownRefresh: function (e) {
		this.syncGoods()
		wx.stopPullDownRefresh()
	},

	syncGoods: function (e) {
		var that = this
		wx.showLoading({
			title: '加载购物车'
		})
		// get current activate promotion
		//request.get('promotions').then(r => {
		//	var goods = []
		//	r.data.forEach(promotion => {
		//		goods = goods.concat(promotion.products.map(item => {
		//			item.product.promotion_id = item.promotion_id
		//			return item.product
		//		}))
		//	})

			var cart = syncCart()
			this.setData({
				cart: cart,
			})
		//	cart.products.forEach(ele => {
		//		var o = goods.find(item => {
		//			return item.id === ele.id
		//		})
		//		if (o) {
		//			ele.promote_price = o.promote_price
		//			ele.promotion_id = o.promotion_id
		//		} else {
		//			ele.promote_price = o.price
		//			ele.promotion_id = 0
		//		}
		//	})
		//	wx.hideLoading()
		//}).catch(err => {
			wx.hideLoading()
		//})
	},

	checkItem: function (e) {
		console.log(e)
		var price 
		var cart = this.data.cart
		//cart.cost = 0
		//cart.amount = 0
		//cart.checked_num = 0
		var index = parseInt(e.currentTarget.dataset.index)
		var product = cart.products[index]
		product.checked = !product.checked

		if (product.in_promote)
			price = product.promote_price
		else
			price = product.price

		if (product.checked) {
			cart.cost += price * product.want_amount
			cart.amount += product.want_amount
			cart.checked_num++
		} else {
			cart.cost -= price * product.want_amount
			cart.amount -= product.want_amount
			cart.checked_num--
		}

		wx.setStorageSync('cart', cart)
		this.setData({
			cart: cart
		})
	},

	checkAll: function (e) {
		var cart = this.data.cart
		cart.cost = 0
		cart.amount = 0
		var checked_all = !(cart.checked_num === cart.products.length)
		cart.checked_num = 0
		cart.products.forEach(element => {
			element.checked = checked_all
			if (element.checked) {
				if (element.in_promote)
					cart.cost += element.promote_price * element.want_amount
				else
					cart.cost += element.price * element.want_amount
				cart.checked_num++
				cart.amount += element.want_amount
			}
		});

		wx.setStorageSync('cart', cart)
		this.setData({
			cart: cart
		})
	},

	amountChange: function (e) {
		var price
		var v = parseInt(e.currentTarget.dataset.value);
		//var a = parseInt(this.data.order.amount);
		var index = parseInt(e.currentTarget.dataset.index);
		var cart = this.data.cart
		var product = cart.products[index];

		if (product.in_promote)
			price = product.promote_price
		else
			price = product.price

		console.log('cc', cart)

		if (v < 0) {
			if (product.want_amount > -v) {
				product.want_amount += v;
				if (product.checked) {
					cart.amount += v
					cart.cost -= price
				} else {
					product.checked = true
					cart.amount += product.want_amount
					cart.cost += product.want_amount * price
					cart.checked_num++
				}
				this.setData({
					cart: cart
					//total_cost: this.calculateCost()
				});
				wx.setStorageSync('cart', cart)
			}
		} else if (v > 0) {
			product.want_amount += v;
			if (product.checked) {
				cart.amount += v
				cart.cost += price
			} else {
				product.checked = true
				cart.amount += product.want_amount
				cart.cost += product.want_amount * price
				cart.checked_num++
			}

			this.setData({
				//promotion: this.data.promotion,
				cart: cart
				//total_cost: this.calculateCost()
			});

			wx.setStorageSync('cart', cart)
		}

		console.log('bb', cart)
	},

	toCheckout: function(e) {
		if (this.data.cart.checked_num <= 0) {
			wx.showToast({
				title: '没有选购商品',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		wx.navigateTo({
			url: "../pay/order?type=cart"
		})
	},

	deleteProduct: function (e) {
		var cart = this.data.cart
		//cart.cost = 0
		for (var index = 0; index < cart.products.length; index++) {
			var element = cart.products[index]
			if (element.checked) {
				cart.products.splice(index, 1)
				console.log(cart)
				cart.amount -= element.want_amount
				cart.cost -= element.want_amount * element.price
				index--
			}
		}

		this.setData({
			cart: cart,
		})

		wx.setStorageSync('cart', cart)
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		return {
			title: '小麦芬烘焙',
			path: '/pages/topic/index'
		}
	}
})
