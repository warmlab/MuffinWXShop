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
		checked_all: false
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

	syncGoods: function(e){
		wx.showLoading({
			title: '加载购物车'
		})
		var cart = syncCart()
		var index = cart.products.findIndex(item => !(item.checked))
		this.setData({
			cart: cart,
			checked_all: index < 0
		})
		wx.hideLoading()
	},

	checkItem: function (e) {
		console.log(e)
		var checked_all = true
		this.data.cart.cost = 0
		this.data.cart.amount = 0
		this.data.cart.products.forEach(ele => {
			console.log(e.detail.value.includes(`${ele.id}`))
			if (e.detail.value.includes(`${ele.id}`)) {
				this.data.cart.cost += ele.price * ele.want_amount
				this.data.cart.amount += ele.want_amount
				ele.checked = true
			} else {
				ele.checked = false
				checked_all = false
			}
		})

		wx.setStorageSync('cart', this.data.cart)
		this.setData({
			cart: this.data.cart,
			checked_all: checked_all
		})
	},

	checkAll: function (e) {
		var cart = this.data.cart
		cart.cost = 0
		cart.amount = 0
		cart.products.forEach(element => {
			element.checked = e.detail.value
			if (element.checked)
				cart.cost += element.price * element.want_amount
			cart.amount += element.want_amount
		});

		wx.setStorageSync('cart', cart)
		this.setData({
			cart: cart,
			checked_all: e.detail.value
		})
	},

	amountChange: function (e) {
		var v = parseInt(e.currentTarget.dataset.value);
		//var a = parseInt(this.data.order.amount);
		var index = parseInt(e.currentTarget.dataset.index);
		var cart = this.data.cart
		var product = cart.products[index];

		if (v < 0) {
			if (product.want_amount > -v) {
				product.want_amount += v;
				if (product.checked) {
					cart.amount--
					cart.cost -= product.price
				} else {
					product.checked = true
					cart.amount += product.want_amount
					cart.cost += product.want_amount * product.price
				}
				this.setData({
					cart: this.data.cart
					//total_cost: this.calculateCost()
				});
				wx.setStorageSync('cart', this.data.cart)
			}
		} else if (v > 0) {
			product.want_amount += v;
			if (product.checked) {
				cart.amount++
				cart.cost += product.price
			} else {
				product.checked = true
				cart.amount += product.want_amount
				cart.cost += product.want_amount * product.price
			}

			this.setData({
				//promotion: this.data.promotion,
				cart: this.data.cart,
				//total_cost: this.calculateCost()
			});

			wx.setStorageSync('cart', this.data.cart)
		}
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
			checked_all: false
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
