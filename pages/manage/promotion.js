// pages/promotion/index.js
import {
	request,
	base_url
} from '../../utils/request.js'

const app = getApp();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		products: [],
		addrs_sel: [],
		//fromDate: "",
		//fromTime: "",
		//toDate: "",
		//toTime: "" 

		binding: false,
		payment_method: 1,
		publish: 0,
		valuecard_allowed: false,
		delivery_way: 3, // 取货方式 1-自提 2-快递
		delivery_fee: 1000,
		prepay_flag: 1,
		orders: [],
		base_url: base_url
		//is_infinite: false,
		//is_overflow: false,

	},

	getSelectedProducts: function () {
		// get products from storage
		var products = wx.getStorageSync('products_checked') || {
			timstamp: 0
		};

		if (Date.now() - products.timestamp < 24 * 60 * 60 * 1000) {
			this.setData({
				"products": products.products
			});
		}
	},

	// get pickup addresses
	getAddresses: function () {
		var that = this;
		return new Promise((resolve, reject) => {
			request.get('addresses')
				.then(res => {
					console.log('pickup addresses', res)
					resolve(res.data)
				})
				.catch(err => {
					reject(err)
				})
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this;

		wx.hideShareMenu();
		// get selected products
		//that.getSelectedProducts();
		// get pickup addresses
		var addresses = this.getAddresses();

		wx.showLoading({
			title: '加载中，请稍候',
			mask: true
		});

		// get promotion info from server
		request.get('promotion', {
				id: options.id
			})
			.then(res => {
				console.log('promotion', res.data)
				var products = []
				res.data.products.forEach(ele => {
					var p = ele.product
					p.is_deleted = ele.is_deleted
					p.promote_stock = ele.stock
					// determine the size of product
					for (var ps of p.sizes) {
						if (ps.size.id === ele.size.id) {
							p.want_size = ps
							break
						}
					}
					//p.promote_stock = 36
					//p.promote_price = ele.price
					//p.promote_price += p.want_size.promote_price_plus
					if (p.summary.length > 80)
						p.summary = p.summary.slice(0, 70) + '...'
					products.push(p)
				})

				// set addresses
				var addr_ids = []
				addresses.then(addrs => {
					addrs.forEach(addr => {
						addr.checked = false
						for (var ele of res.data.addresses) {
							if (addr.id === ele.address.id) {
								addr.checked = true
								addr_ids.push(addr.id)
								break
							}
						}
					})

					that.setData({
						addresses: addrs,
						addrs_sel: addr_ids
					})
				})

				that.setData({
					id: res.data.id,
					name: res.data.name,
					products: products,
					//addresses: that.data.addresses,
					binding: res.data.binding,
					from_date: res.data.from_time.substr(0, 10),
					from_time: res.data.from_time.substr(11),
					last_order_date: res.data.last_order_time.substr(0, 10),
					last_order_time: res.data.last_order_time.substr(11),
					to_date: res.data.to_time.substr(0, 10),
					to_time: res.data.to_time.substr(11),
					publish: 1,
					publish_date: res.data.publish_time.substr(0, 10),
					publish_time: res.data.publish_time.substr(11),
					valuecard_allowed: res.data.valuecard_allowed,
					delivery_way: res.data.delivery_way,
					delivery_fee: res.data.delivery_fee,
					note: res.data.note
				});
				wx.setStorageSync('products_checked', {
					products: products,
					'timestamp': Date.now()
				});

				//that.getProducts();
				wx.hideLoading();
			})
			.catch(err => {
				console.log('get promotion error', err)
				var now = new Date();
				now.setDate(now.getDate() + 2)

				addresses.then(addrs => {
					var addrs_tmp = [];
					// set default selected addresses
					addrs.forEach(element => {
						if (element.checked)
							addrs_tmp.push(element.id);
					})

					console.log('addresses selected', addrs_tmp)
					that.setData({
						addresses: addrs,
						addrs_sel: addrs_tmp
					})
				})
				//var fromDateTime = new Date();
				//var toDateTime = new Date();
				//var lastOrderTime = new Date();
				//fromDateTime.setHours(14, 0, 0);
				//toDateTime.setHours(19, 0, 0);
				//lastOrderTime.setHours(8, 0, 0);
				that.setData({
					from_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
					from_time: '14:00',
					to_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
					to_time: '19:00',
					last_order_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
					last_order_time: '08:00',
					publish_date: [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
					publish_time: '08:00'
				});
				wx.hideLoading();
			})
		//last_order_time: lastOrderTime.toLocaleTimeString('cn-ZH', {hour12: false, hour: '2-digit', minute: '2-digit'}),
	},

	addProduct: function (e) {
		wx.navigateTo({
			url: 'products'
		});
	},

	amountSet: function (e) {
		var v = parseInt(e.detail.value);
		//var a = parseInt(this.data.order.amount);
		var index = parseInt(e.currentTarget.dataset.index);
		var product = this.data.products[index];

		if (v <= 0) {
			wx.showToast({
				title: '团购库存不能小于等于0',
				icon: 'none',
				duration: 2000
			});

			return 0;
		}

		product.promote_stock = v
	},

	amountChange: function (e) {
		var v = parseInt(e.currentTarget.dataset.value);
		//var a = parseInt(this.data.order.amount);
		var index = parseInt(e.currentTarget.dataset.index);
		var product = this.data.products[index];

		if (product.promote_stock < 0)
			product.promote_stock = 0;

		if (v < 0) {
			if (product.promote_stock >= -v) {
				product.promote_stock += v;
				this.setData({
					products: this.data.products,
					//total_cost: this.calculateCost()
				});
			}
		} else if (v > 0) {
			product.promote_stock += v;
			this.setData({
				//promotion: this.data.promotion,
				products: this.data.products,
				//total_cost: this.calculateCost()
			});
		}
	},

	productsBindSwitch: function (e) {
		this.setData({
			binding: e.detail.value === 'true' ? true : false,
		});
	},

	timeChange: function (e) {
		console.log('date time change', e.detail.value, this.data.from_time);
		this.setData({
			[e.currentTarget.dataset.name]: e.detail.value
		});
		//if (prefix == 'from')
		//    this.setData({'fromTime': e.detail.value});
		//else if (prefix == 'to')
		//    this.setData({'toTime': e.detail.value});
	},

	allowMember: function (e) {
		this.setData({
			valuecard_allowed: e.detail.value
		});
	},

	deliveryChange: function (e) {
		var value = 0
		e.detail.value.forEach(ele => {
			value |= parseInt(ele)
		})
		this.setData({
			delivery_way: value
		});
		//if (e.detail.value === "0") {
		//    this.setData({deliveryInputFlag: "none"});
		//} else {
		//    this.setData({deliveryInputFlag: "block"});
		//}
	},

	addressChange: function (e) {
		console.log(e);
		this.setData({
			addrs_sel: e.detail.value
		});
	},

	newAddressPage: function (e) {
		wx.navigateTo({
			url: '/pages/manage/address'
		});
	},

	prepayChange: function (e) {
		this.setData({
			prepay_flag: e.detail.value
		});
	},

	publishChange: function (e) {
		this.setData({
			publish: parseInt(e.detail.value)
		});
	},

	startDragon: function (e) {
		console.log(e);
		if (this.data.products.length === 0) {
			wx.showToast({
				title: '您没有团购商品',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		if (this.data.addrs_sel.length === 0) {
			wx.showToast({
				title: '自提地址没选择',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		var stock_empty = false
		this.data.products.forEach((ele, index) => {
			if (ele.promote_price <= 0) {
				stock_empty = true
			}
		})

		if (stock_empty) {
			wx.showToast({
				title: '有的团购库存没有输入或小于0',
				icon: 'none',
				duration: 2000
			});
			return
		}

		var delivery_fee = parseFloat(e.detail.value.delivery_fee);
		if (this.data.delivery_way === 2 && (isNaN(delivery_fee) || delivery_fee < 0)) {
			wx.showToast({
				title: '运费没输入或小于0',
				icon: 'none',
				duration: 2000
			});

			return;
		}

		wx.showLoading({
			title: '团购正在生成中，请稍候',
			mask: true
		})

		var data = {
			products: [],
			addresses: this.data.addrs_sel
		};
		for (var key in this.data) {
			console.log('key', key);
			if (key === 'products') {
				this.data.products.forEach(p => {
					data[key].push({
						id: p.id,
						code: p.code,
						price: p.promote_price + (p.want_size ? p.want_size.promote_price_plus : 0),
						stock: p.promote_stock,
						size: p.want_size ? p.want_size.size.id : 0
					})
				})

				console.log('888888888888888888888888888888', data[key])
			} else if (key === 'orders' || key === 'base_url' ||
				key === 'addrs_sel' || key === '__webviewId__' ||
				key === 'addresses')
				continue;
			else {
				console.log(this.data[key]);
				data[key] = this.data[key];
			}
		}

		data.delivery_way = this.data.delivery_way;
		data.delivery_fee = delivery_fee * 100; // 转换成单位分
		data.name = e.detail.value.name;
		data.note = e.detail.value.note;

		request.post('promotion', data)
			.then(res => {
				if (res.status === 201) {
					wx.hideLoading()
					console.log(res.data);
					var pages = getCurrentPages();
					var prePage = pages[pages.length - 2];
					//prePage.setData({dragon:res.data});
					prePage.onLoad();
					wx.navigateBack();
				}
			})
			.catch(err => {
				wx.hideLoading()
				wx.showToast({
					title: '团购生成失败，请检查数据',
					icon: 'none',
					duration: 2000
				})
				console.log('post promotion error', err)
			})
	}
})
