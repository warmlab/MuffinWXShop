import {
	request,
	base_url
} from '../../utils/request.js'

import {
	WEB_ALLOWED,
	POS_ALLOWED,
	PROMOTE_ALLOWED
} from '../../utils/resource.js'

const app = getApp();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		base_url: base_url,
		product_indexes: [],
		openAttr: false
	},

	getProducts: function () {
		// get products from storage
		var products = wx.getStorageSync('products_checked') || {
			timstamp: 0,
			products: []
		};
		console.log(products, Date.now() - products.timestamp, products);
		if (Date.now() - products.timestamp < 24 * 60 * 60 * 1000) {
			this.setData({
				"products_checked": products.products
			});
		} else {
			this.setData({
				"products_checked": []
			});
		}
	},

	onPullDownRefresh: function (e) {
		this.syncProducts()
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.startPullDownRefresh()
	},

	syncProducts: function () {
		var that = this;
		var product_indexes = []
		wx.showLoading({
			title: '商品信息拼命加载中...',
			mask: true
		})
		this.getProducts()
		request.get('products', {
				type: WEB_ALLOWED | POS_ALLOWED | PROMOTE_ALLOWED
			})
			.then(res => {
				for (var index = 0; index < res.data.length; index++) {
					var element = res.data[index]
					element.checked = false
					that.data.products_checked.forEach(ele => {
						if (element.id === ele.id) {
							element.checked = true
							product_indexes.push(index)
							if (ele.want_size) {
								element.want_size = ele.want_size
							}
						}
					})
				}
				console.log(res.data)
				that.setData({
					product_indexes: product_indexes,
					products: res.data
				})
				wx.hideLoading()
				wx.stopPullDownRefresh()
			})
			.catch(err => {
				console.error('error in sync products', err)
				wx.hideLoading()
				wx.stopPullDownRefresh()
			})
	},

	productCheck: function (e) {
		var that = this
		//var ps = []

		//this.data.products.forEach(ele => {
		//	ele.checked = false
		//})

		var to_unchecked_indexs = Array.from(this.data.product_indexes)
		//var current_checked = []
		e.detail.value.forEach(ele => {
			var index = parseInt(ele)
			//ps[index].checked = true
			var p = that.data.products[index]
			//current_checked.push(index)
			//var pos = that.data.product_indexes.indexOf(index)
			if (!that.data.product_indexes.includes(index)){ // do not find anything
				if (p.category.extra_info & 1 === 1) {
					//show_selector = true
					that.setData({
						openAttr: true, // show size selector dialog
						product_index: index
					})
				}
				//ps.push(index)
				that.data.product_indexes.push(index)
				p.checked = true
			} else {
				// remove item from to unchecked ids
				var pos = to_unchecked_indexs.indexOf(index)
				to_unchecked_indexs.splice(pos, 1) // remove item
				//ps.push(that.data.products[index])
			}
		})

		to_unchecked_indexs.forEach(index => {
			var p = this.data.products[index]
			p.checked = false
			if (p.want_size !== undefined && !p.want_size)
				p.want_size = null
			var pos = that.data.product_indexes.indexOf(index)
			if(pos >= 0)
				that.data.product_indexes.splice(pos, 1)

			//if (that.data.product && p.id === that.data.product.id) {
			//	that.setData({
			//		product: null
			//	})
			//}
		})

		this.setData({
			//products_checked: ps,
			product_indexes: that.data.product_indexes
		})
	},

	openAttrDialog: function (e) {
		console.log(e)
		this.setData({
			openAttr: true,
		})
	},

	sizeChoose: function(e) {
		console.log(e)
		var product = this.data.products[this.data.product_index]
		var ps = product.sizes[parseInt(e.detail.value)]
		product.want_size = ps
		product.want_size.id = ps.size.id
		//this.data.product.size_price_plus = ps.size.price_plus
		//this.data.product.size_promote_price_plus = ps.size.promote_price_plus
		product.checked = true
		//this.setData({
		//	//size: ps.size.id,
		//	//current_size: ps
		//	product: this.data.product
		//})
	},

	toSelect: function(e) {
		var product = this.data.products[this.data.product_index]
		console.log('toSelect', product)
		if (product.category.extra_info & 1 === 1) {
			// need product size in purchase
			//if (this.data.size !== undefined && this.data.size !== null)
			//	product.want_size = this.data.size
			if (product.want_size === undefined || !product.want_size) {
				wx.showToast({
					title: '蛋糕尺寸需要选择',
					icon: 'none',
					duration: 2000
				})

				return
			}
		}

		this.setData({
			openAttr: false // close size selector dialog
		})
	},

	selectionConfirm: function (e) {
		console.log(e);
		var that = this;
		var now = new Date();
		var products = []
		this.data.product_indexes.forEach(ele => {
			var product = that.data.products[ele]
			product.is_deleted = false
			if (product.promote_stock < 0)
				product.promote_stock = 36

			products.push(product)
		})
		//wx.removeStorage({key:'products_checked'});
		wx.setStorageSync('products_checked', {
			products: products,
			timestamp: Date.now()
		});
		wx.navigateBack({
			delta: 1
		});

		var pages = getCurrentPages();
		var prePage = pages[pages.length - 2];

		prePage.setData({
			products: products
		});
	},

	clearSelection: function (e) {
		wx.removeStorage({
			key: 'products_checked'
		})

		this.data.products.forEach(ele => {
			ele.checked = false;
		})
		this.setData({
			product_indexes: [],
			products: this.data.products
		})

		var pages = getCurrentPages();
		var prePage = pages[pages.length - 2];

		prePage.setData({
			products: []
		});
	},

	productDetail: function (e) {
		wx.navigateTo({
			url: `product?code=${e.currentTarget.dataset.code}`
		});
	}
})
