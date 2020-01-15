// pages/shop/order.js
const app = getApp();

import config from '../../config.js'
import request from '../../utils/request.js'

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
		//cur_addr: -1
	},

	getAddresses: function () {
		var that = this;

		request.get('addresses').then(res => {
			that.setData({
				pickup_address: res.data.length > 0 ? res.data[0].id : -1,
				pickup_addresses: res.data
			})
		}).catch(err => {
			console.log('get pick up addresses error', err)
		})
	},

	getMemberAddresses: function (address_id) {
		var that = this
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
			that.setData({
				delivery_addresses: res.data,
				delivery_address: delivery_address
			})
		}).catch(err => {
			console.log('get customer addresses error', err)
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this
		var cart = wx.getStorageSync(options.type); // buy-点击立即购买, cart-购物车点击下单

		app.getUserInfo().then(res => {
			that.setData({
				userInfo: res,
				type: options.type,
				promotion: options.promotion ? options.promotion : 0
			})
		})

		if (cart === undefined || typeof cart !== "object") {
			cart = {
				products: [],
				amount: 0,
				cost: 0
			}
			wx.setStorageSync(options.type, cart)
		}

		var cost = 0
		var products = []
		var product_ids = []
		cart.products.forEach(ele => {
			console.log('aaa', ele)
			if (ele.checked) {
				products.push(ele)
				product_ids.push(ele.id)
				if (ele.want_size)
					cost += (ele.price + ele.want_size.price_plus) * ele.want_amount
				else
				if (ele.promotion_id > 0)
					cost += ele.promote_price * ele.want_amount
				else
					cost += ele.price * ele.want_amount
			}
		})

		this.setData({
			products: products,
			product_ids: product_ids,
			cost: cost,
			type: options.type,
		})

		this.getAddresses()
	},

	onShow: function (e) {
		this.getMemberAddresses(0)
	},

	deliveryMethodTap: function (e) {
		this.setData({
			delivery_show: !this.data.delivery_show,
		})
	},

	handleDeliveryChange: function (e) {
		this.setData({
			delivery_way: e.detail.value
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
		var index = e.detail.value
		this.setData({
			pickup_index: index
		})
	},

	addressChange: function (e) {
		if (this.data.delivery_way === 1)
			this.setData({
				pickup_address: parseInt(e.detail.value)
			})
		else
			this.setData({
				delivery_address: parseInt(e.detail.value)
			})
	},

	newAddress: function (e) {
		wx.navigateTo({
			url: '/pages/my/address/detail?id=0'
		})
	},

	deliveryWayChange: function (e) {
		//var total_cost = this.data.total_cost;
		//if (e.detail.value === 2) // 快递模式
		//    total_cost += this.data.promotion.delivery_fee;
		//else
		//    total_cost -= this.data.promotion.delivery_fee;
		this.setData({
			delivery_way: parseInt(e.detail.value),
			//total_cost: total_cost
		});
	},

	checkoutOrder: function (e) {
		var that = this;

		if (this.data.products.length <= 0) {
			wx.showToast({
				title: '没有选购商品',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		if (this.data.delivery_address < 0) {
			wx.showToast({
				title: '请选择个人地址信息',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		// 快递/自提模式
		if (this.data.delivery_way == 1 && this.data.pickup_index === -1) {
			wx.showToast({
				title: '请选择自提点',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		var ps = []
		this.data.products.forEach(ele => {
			ps.push({
				id: ele.id,
				want_amount: ele.want_amount,
				//want_size: !ele.want_size ? 0 : ele.want_size.size.id
				want_size: 0
			})
		})

		console.log('addresses', this.data.delivery_address, this.data.delivery_addresses);

		var data = {
			//promotion_id: 0,
			//openid: wx.getStorageSync('openid'),
			promotion_id: this.data.promotion,
			products: ps,
			delivery_way: this.data.delivery_way,
			delivery_address: this.data.delivery_addresses[this.data.delivery_address].id,
			pickup_address: this.data.pickup_index>=0?this.data.pickup_addresses[this.data.pickup_index].id:-1,
			note: e.detail.value.note,
			nickname: this.data.userInfo.nickname,
			avatarUrl: this.data.userInfo.avatarUrl
			//formId: e.detail.formId,
		}

		request.post('order', data)
			.then(res => {
				console.log(res);
				// delete checked items from cart
				var cart = wx.getStorageSync('cart')
				for (var index = 0; index < cart.products.length; index++) {
					var element = cart.products[index]
					if (this.data.product_ids.includes(element.id)) {
						cart.products.splice(index, 1)
						//cart.amount -= element.want_amount
						index--
					}
				}
				if (that.data.type === 'cart') {
					wx.setStorageSync('cart', cart)
					var pages = getCurrentPages();
					var prePage = pages[pages.length - 2];
					//prePage.setData({dragon:res.data});
					prePage.onLoad();
				}
				wx.redirectTo({
					url: `index?code=${res.data.code}`
				});
			}).catch(err => {
				console.log('commit order error', err)
			})
	},

	toGetUserInfo: function (e) {
		var userInfo = wx.getStorageSync('appUserInfo');
		userInfo.nickname = e.detail.userInfo.nickName
		userInfo.avatarUrl = e.detail.userInfo.avatarUrl
		wx.setStorageSync('appUserInfo', userInfo)

		this.setData({
			userInfo: userInfo
		})
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
