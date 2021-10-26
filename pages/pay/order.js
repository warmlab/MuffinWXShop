// pages/shop/order.js
const app = getApp();

import config from '../../config.js'
import request from '../../utils/request.js'
import {addToShoppingCart, syncCart} from '../../utils/cart.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		delivery_fee: 1000,
		base_image_url: config.base_image_url,
		delivery_way: 1,
		pickup_address: 0,
		delivery_address: -1,
		pickup_index: -1,
		delivery_show: 1,
		pickup_show: 1,
		hasUserInfo: false,
		canIUseGetUserProfile: false,
		is_iphonex: wx.IPHONEX >= 0? true : false
		//cur_addr: -1
	},

	getAddresses: function () {
		var that = this;

		wx.showLoading({
			title: '加载中，请稍后...',
			mask: true
		})
		request.get('pickupaddresses').then(res => {
			wx.hideLoading()
			that.setData({
				pickup_address: res.data.length > 0 ? res.data[0].id : -1,
				pickup_addresses: res.data
			})
		}).catch(err => {
			console.log('get pick up addresses error', err)
			wx.hideLoading()
		})
	},

	getMemberAddresses: function (address_id) {
		var that = this
		wx.showLoading({
			title: '加载中，请稍后...',
			mask: true
		})
		request.get('openid/addresses').then(res => {
			var delivery_address = -1;
			for (var index in res.data) {
				var a = res.data[index]
				if (address_id <= 0 && a.is_default)
					delivery_address = index
				else if  (address_id === a.id)
					delivery_address = index
			}

			if (delivery_address === -1 && res.data.length > 0)
				delivery_address = 0
			console.log('my addresses', res.data)
			wx.hideLoading()
			that.setData({
				delivery_addresses: res.data,
				delivery_address: delivery_address
			})
		}).catch(err => {
			console.log('get customer addresses error', err)
			wx.hideLoading()
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		//var cart = wx.getStorageSync(options.type); // buy-点击立即购买, cart-购物车点击下单

		//app.getUserInfo().then(res => {
		//	that.setData({
		//		userInfo: res,
		//		type: options.type,
		//		promotion: options.promotion ? options.promotion : 0
		//	})
		//})

		//if (cart === undefined || typeof cart !== "object") {
		//	cart = {
		//		products: [],
		//		amount: 0,
		//		cost: 0
		//	}
		//	wx.setStorageSync(options.type, cart)
		//}

		//var cost = 0
		//var products = []
		//var product_ids = []
		
		//cart.products.forEach(ele => {
		//	console.log('aaa', ele)
		//	if (ele.checked) {
		//		products.push(ele)
		//		product_ids.push(ele.id)
		//		if (ele.want_size)
		//			cost += (ele.price + ele.want_size.price_plus) * ele.want_amount
		//		else
		//		if (ele.in_promote)
		//			cost += ele.promote_price * ele.want_amount
		//		else
		//			cost += ele.price * ele.want_amount
		//	}
		//})

		var cart = syncCart(options.type)
		var userInfo = wx.getStorageSync('appUserInfo');
		console.log('ddd', userInfo)

		this.setData({
			cart: cart,
			//products: cart.products,
			//product_ids: product_ids,
			//cost: cart.cost,
			type: options.type,
			userInfo: userInfo,
			canIUseGetUserProfile: wx.getUserProfile ? true : false,
			hasUserInfo: userInfo.nickname != '微信用户'
		})

		this.getAddresses()
		this.getMemberAddresses(0)

		/*
		if (wx.getUserProfile) {
			this.setData({
				canIUseGetUserProfile: true
			})
		}
		*/
	},

	onShow: function (e) {
	},

	deliveryMethodTap: function (e) {
		this.setData({
			delivery_show: !this.data.delivery_show,
		})
	},

	handleDeliveryChange: function (e) {
		this.setData({
			delivery_way: parseInt(e.currentTarget.dataset.value)
		})
	},

	pickupAddressTap: function (e) {
		this.setData({
			pickup_show: !this.data.pickup_show,
		})
	},

	getAddressTap: function () {
		wx.navigateTo({
			url: "/pages/my/address/index?type=select"
		})
	},

	pickupAddressChange: function (e) {
		var index = parseInt(e.currentTarget.dataset.index)
		console.log('aaa', e)
		this.setData({
			pickup_index: index
		})
	},

	newAddress: function (e) {
		wx.navigateTo({
			url: '/pages/my/address/detail?id=0'
		})
	},

	checkoutOrder: function (e) {
		var that = this

		if (this.data.delivery_address < 0) {
			wx.showToast({
				title: '请选择个人地址信息',
				icon: 'none',
				duration: 2000
			})

			return
		}

		// 快递/自提模式
		if (this.data.delivery_way == 1 && this.data.pickup_index === -1) {
			wx.showToast({
				title: '请选择自提点',
				icon: 'none',
				duration: 2000
			})

			return
		}

		var ps = []
		this.data.cart.products.forEach(ele => {
			if (ele.checked)
				ps.push({
					id: ele.id,
					want_amount: ele.want_amount,
					//want_size: !ele.want_size ? 0 : ele.want_size.size.id
					want_size: 0
				})
		})

		if (ps.length === 0) {
			wx.showToast({
				title: '请选购商品',
				icon: 'none',
				duration: 2000
			});

			return
		}

		console.log('addresses', this.data.delivery_address, this.data.delivery_addresses);

		var data = {
			//promotion_id: 0,
			//openid: wx.getStorageSync('openid'),
			//promotion_id: this.data.promotion,
			products: ps,
			delivery_way: this.data.delivery_way,
			delivery_address: this.data.delivery_addresses[this.data.delivery_address].id,
			pickup_address: this.data.pickup_index>=0?this.data.pickup_addresses[this.data.pickup_index].id:1,
			note: e.detail.value.note,
			nickname: this.data.userInfo.nickname,
			avatarUrl: this.data.userInfo.avatarUrl
			//formId: e.detail.formId,
		}

		wx.showLoading({
			title: '订单生成中...',
			mask: true
		})

		that.postOrder(data)

		/*
		if (wx.getUserProfile) {
			wx.getUserProfile({
				desc: '用于完善订单顾客信息',
				success: (res) => {
					res.userInfo.nickname = res.userInfo.nickName
					that.setData({
						userInfo: res.userInfo,
						hasUserInfo: true
					})
					data.nickname = res.userInfo.nickName
					data.avatarUrl = res.userInfo.avatarUrl

					that.postOrder(data)
				},
				fail: (res)  => {
					that.postOrder(data)
				}
			})
		} else {
			that.postOrder(data)
		}
		*/
	},

	postOrder: function(data) {
		var that = this
		request.post('order', data).then(res => {
			console.log(res);
			// delete checked items from cart
			if (that.data.type === 'cart') {
				var cart = wx.getStorageSync('cart')
				//for (var index = 0; index < cart.products.length; index++) {
				//	var element = cart.products[index]
				//	if (this.data.product_ids.includes(element.id)) {
				//		cart.products.splice(index, 1)
				//		//cart.amount -= element.want_amount
				//		index--
				//	}
				//}
				//cart.cost = 0
				cart.products = cart.products.filter(ele => !ele.checked)
				wx.setStorageSync('cart', cart)
				//if (that.data.type === 'cart') {
				//	var pages = getCurrentPages();
				//	var prePage = pages[pages.length - 2];
				//	//prePage.setData({dragon:res.data});
				//	prePage.onLoad();
				//}
			}
			wx.hideLoading()
			wx.redirectTo({
				url: `pay?code=${res.data.code}`
			});
		}).catch(err => {
			console.log('commit order error', err)
			wx.hideLoading()
			if (err.errcode === 2001) { // some products were sold out
				var ps = err.data
				var content = ''
				ps.forEach(p => {
					content += `${p.name}[库存:${p.stock}]\n`
				})
				wx.showModal({
					title: '对不起，库存不足',
					content: content.trim(),
					showCancel: false,
					confirmColor: '#481A0E',
					confirmText: "我知道了"
				})

			} else {
				wx.showToast({
					title: '下单失败，请与店长联系',
					icon: 'none',
					duration: 2000
				})
			}
		})
	},

	toGetUserProfile: function (e) {
		var that = this

		wx.getUserProfile({
			desc: '用于完善订单顾客信息',
			success: (res) => {
				console.log('success')
				res.userInfo.nickname = res.userInfo.nickName
				that.setData({
					userInfo: res.userInfo,
					hasUserInfo: true
				})
				//userInfo.nickname = res.userInfo.nickName
				//userInfo.avatarUrl = res.userInfo.avatarUrl

				wx.setStorageSync('appUserInfo', res.userInfo)
			},
			fail: (res)  => {
				/*
				console.log("fail")
				var userInfo = wx.getStorageSync('appUserInfo');
				userInfo.nickname = that.data.userInfo.nickname
				userInfo.avatarUrl = that.data.userInfo.avatarUrl

				that.setData({
					userInfo: res.userInfo,
					hasUserInfo: true
				})
				*/
			wx.showToast({
				title: '点击允许，登录',
				icon: 'error',
				duration: 3000
			})
			}
		})
	},

	toGetUserInfo: function(e) {
		if ('userInfo' in e.detail) {
			e.detail.userInfo.nickname = e.detail.userInfo.nickName
			this.setData({
				userInfo: e.detail.userInfo,
				hasUserInfo: true
			})
		} else {
			wx.showToast({
				title: '点击允许，登录',
				icon: 'error',
				duration: 3000
			})
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		return {
			title: '美味挡不住',
			path: '/pages/topic/index'
		}
	}
})
