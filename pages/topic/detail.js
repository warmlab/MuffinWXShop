const util = require('../../utils/util.js');
import config from '../../config.js'
import request from '../../utils/request.js'
import MyCanvas from '../../utils/canvas.js'

const app = getApp();

Page({
	data: {
		base_image_url: config.base_image_url,
		current_banner: 0,
		banner_heights: [],
		is_hidden: true,
		delivery_way: 1,
		pickup_address: 0,
		delivery_address: 0,
		payment: 4,
		note: '',
		current_height: 220,
		canvas_id: 'shareCanvas'
	},

	onShareAppMessage: function (res) {
		this.setData({
			share_show: false,
		})
		return {
			title: this.data.promotion.name,
			path: `/pages/topic/detail?id=${this.data.id}`,
			//imageUrl: `${this.data.share_canvas}`
		}
	},

	getPromotion: function () {
		var that = this;
		//wx.showNavigationBarLoading()
		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		})
		request.get('promotion', {
			id: that.data.id
		}).then(r => {
			var max_amount = 9999;
			var products = []

			console.log(r.data.products)
			r.data.products.forEach(ele => {
				if (!ele.is_deleted) {
					ele.want_amount = 0;
					for (var ps of ele.product.sizes) {
						if (ps.size.id === ele.size.id) {
							ele.want_size = ps
							break
						}
					}
					if (max_amount > ele.stock) {
						max_amount = ele.stock;
					}
					if (ele.product.summary.length > 53)
						ele.product.summary = ele.product.summary.slice(0, 50) + '...'
					products.push(ele)
				}
			});

			var lod = util.strToDate(r.data.last_order_time);
			var fd = util.strToDate(r.data.from_time);
			that.setData({
				promotion: r.data,
				products: products,
				//my_orders: my_orders,
				max_amount: max_amount,
				//pickup_address: r.data.addresses.length > 0 ? r.data.addresses[0].address.id : 0,
				from_date: util.getMonthDay(fd),
				from_time: util.getHourMin(fd),
				last_order_date: util.getMonthDay(lod),
				last_order_time: util.getHourMin(lod),
				from_weekday: util.getWeekDay(fd),
				last_order_weekday: util.getWeekDay(lod)
			});

			if (r.data.name)
				wx.setNavigationBarTitle({
					title: r.data.name
				})
			//wx.hideNavigationBarLoading()
			wx.hideLoading()
			//console.log(callback)
			//callback.apply(wx)
			//wx.stopPullDownRefresh()
			//that.generateCanvas()
		}).catch(err => {
			//console.log(callback)
			console.log('the promotion has not published yet!!', err);
			//wx.hideNavigationBarLoading()
			wx.hideLoading()
			//wx.stopPullDownRefresh()
			//callback.apply(wx)
			wx.navigateBack()
		})
	},

	onPullDownRefresh: function (e) {
		//wx.startPullDownRefresh()
		this.getPromotion()
		this.syncAddresses()
	},

	onLoad: function (res) {
		var that = this;

		//request.get(`promotion?id=${res.id}`, {})
		that.setData({
			id: res.id
		})

		//var inter = setInterval(() => {
		//    var access_token = wx.getStorageSync('access-token')
		//    if (access_token !== undefined && access_token !== '') {
		//        clearInterval(inter);
		//        //this.getPromotion(wx.hideNavigationBarLoading)
		//        wx.startPullDownRefresh()
		//        this.syncAddresses()
		//    }
		//}, 500)

		app.getUserInfo().then(res => {
			that.getPromotion()
			that.syncAddresses()
			that.syncOrders()
			that.setData({
				userInfo: res
			})
		})

		//wx.getSystemInfoSync({
		//    success: function (res) {
		//        console.log(res.windowWidth, ' ', res.windowsHeight);
		//    }
		//});

		wx.showShareMenu({
			withShareTicket: true
		});

		wx.updateShareMenu({
			withShareTicket: true,
		});
	},

	syncAddresses: function () {
		this.setData({
			addresses: wx.getStorageSync('addresses')
		})
		if (this.data.delivery_address === 0)
			for (var ele of this.data.addresses) {
				if (ele.is_default) {
					this.setData({
						delivery_address: ele.id
					})
					break;
				}
			}

		wx.stopPullDownRefresh()
	},

	syncOrders: function (e) {
		var that = this;
		wx.showNavigationBarLoading()
		request.get('promotion/orders', {
			id: this.data.id
		}).then(res => {
			var my_orders = []
			res.data.forEach(ele => {
				if (ele.member_openid.openid === that.data.userInfo.openid)
					my_orders.push(ele)
			})
			console.log('my order', my_orders)
			that.setData({
				orders: res.data,
				my_orders: my_orders
			})
			wx.hideNavigationBarLoading()
		}).catch(err => {
			console.error('get promotion orders error', err)
			wx.hideNavigationBarLoading()
		})
	},

	toGetUserInfo: function (e) {
		var userInfo = wx.getStorageSync('appUserInfo')
		userInfo.nickname = e.detail.userInfo.nickName
		userInfo.avatarUrl = e.detail.userInfo.avatarUrl
		wx.setStorageSync('appUserInfo', userInfo)
		//wx.setStorageSync('appUserInfo', e.detail.userInfo);
		this.setData({
			userInfo: userInfo
		});
	},

	openShareArea: function (e) {
		this.setData({
			share_show: true
		})
	},

	closeShareArea: function (e) {
		this.setData({
			share_show: false
		})
	},

	toHomeTab: function (e) {
		wx.switchTab({
			url: '/pages/topic/index'
		})
	},

	productDetail: function (e) {
		wx.navigateTo({
			url: `../goods/detail?code=${e.currentTarget.dataset.code}`
		})
	},

	//calculateCost: function () {
	//    var total_cost = 0;
	//    if (this.data.delivery_way === 2)
	//        total_cost += this.data.promotion.delivery_fee;

	//    this.data.products.forEach(function (item) {
	//        var price = item.price <= 0 ? item.product.promote_price : item.price;
	//        total_cost += item.price * item.want_amount;
	//    });

	//    return total_cost;
	//},

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

	amountChange: function (e) {
		var v = parseInt(e.currentTarget.dataset.value);
		//var a = parseInt(this.data.order.amount);
		var index = parseInt(e.currentTarget.dataset.index);
		var product = this.data.products[index];

		if (v < 0) {
			if (product.want_amount >= -v) {
				if (!this.data.binding) {
					product.want_amount += v;
				} else {
					for (var p of this.data.products) {
						if (p.want_amount > 0)
							p.want_amount += v;
						else
							return;
					}
				}
				this.setData({
					products: this.data.products,
					//total_cost: this.calculateCost()
				});
			}
		} else if (v > 0) {
			if (!this.data.promotion.binding) {
				console.log(product.stock - product.want_amount - v);
				if (product.stock - product.want_amount - v >= 0)
					product.want_amount += v;
			} else {
				for (var p of this.data.products) {
					if (this.data.max_amount - p.want_amount - v >= 0)
						p.want_amount += v;
					else
						return;
				}
			}

			this.setData({
				//promotion: this.data.promotion,
				products: this.data.products,
				//total_cost: this.calculateCost()
			});
		}
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

	paymentMethodChange: function (e) {
		this.setData({
			// 2 - value card, 4 - wechat
			payment: parseInt(e.detail.value)
		});
	},

	bannerLoad: function (e) {
		var height = wx.getSystemInfoSync().windowWidth * e.detail.height / e.detail.width;
		//this.data.banner_heights.push(height);
		//this.data.promotion.products[parseInt(e.currentTarget.dataset.index)].display_height = height;
		this.data.banner_heights[parseInt(e.currentTarget.dataset.index)] = height;
		console.log('in banner load', e, 'height=', height, 'banner heights', this.data.banner_heights);
		this.setData({
			current_height: height
		});
		//console.log(this.data.banner_heights);
	},

	swiperChange: function (e) {
		this.setData({
			current_height: this.data.banner_heights[e.detail.current]
		});
	},

	afterGenerateImage: function (path) {
		this.setData({
			qrcode: path,
			share_show: false
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
						title: '团购海报图片',
						content: '已成功保存到相册，请到系统相册查看',
						showCancel: false
					})
				}
			})

			return
		}

		var canvas = new MyCanvas(that, '/pages/topic/detail', 'promotion',
			that.data.canvas_id, that.data.promotion.id, that.data.promotion.name, that.data.promotion.note, this.data.products[0].product.price, this.data.products[0].product.promote_price,
			`${config.base_image_url}/${that.data.products[0].product.images[0].image.name}`, this.afterGenerateImage)
		canvas.generateImage()
	},

	toJoinIn: function (e) {
		var that = this;
		var products = [];

		this.data.products.forEach(function (item) {
			console.log(item)
			if (item.want_amount > 0) {
				var p = item.product
				p.promotion_id = that.data.promotion.id
				p.want_amount = item.want_amount
				p.want_size = item.want_size ? item.want_size.size.id : 0
				p.checked = true
				products.push(p);
			}
		});

		console.log('the products being want to buy', products)
		if (products.length <= 0) {
			wx.showModal({
				title: '选购商品',
				content: '请至少选择一样商品',
				showCancel: false
			});

			return;
		}

		wx.setStorageSync('cart', {
			products: products,
		})

		wx.navigateTo({
			url: "../pay/pre_order?type=cart"
		})

		// 快递/自提模式
		/*
		if (this.data.delivery_way === 1 && this.data.pickup_address === 0) {
			wx.showModal({
				title: '提货地址',
				content: '请选择提货地址',
				showCancel: false
			});

			return;
		}

		if (this.data.delivery_way === 2 && this.data.delivery_address === 0) {
			wx.showModal({
				title: '送货地址',
				content: '请选择送货地址',
				showCancel: false
			});

			return;
		}
		*/

		/*
		var userInfo = wx.getStorageSync('appUserInfo')
		var data = {
			promotion_id: this.data.promotion.id,
			//openid: wx.getStorageSync('openid'),
			products: products,
			//delivery_way: this.data.delivery_way,
			//address: this.data.delivery_way === 1 ? this.data.pickup_address : this.data.delivery_address,
			//note: e.detail.value.note,
			nickname: userInfo.nickname,
			avatarUrl: userInfo.avatarUrl
			//nickname: userInfo.nickName,
			//avatarUrl: app.globalData.userInfo.avatarUrl
			//formId: e.detail.formId,
		}

		console.log('post data is', data)

		request.post('order', data)
			.then(res => {
				console.log(res);
				wx.navigateTo({
					url: `/pages/pay/index?code=${res.data.code}`
				});
			}).catch(err => {

			});
		*/
	}
});
