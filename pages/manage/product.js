// pages/product/publish.js
const app = getApp();

import {
	request,
	base_url,
	shoppoint,
	requestHeaders
} from '../../utils/request.js'

import {
	getCategories,
	getSizes
} from '../../utils/resource.js'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		base_url: base_url,
		web_allowed: true,
		promote_allowed: true,
		extra_info: 0,
		my_sizes: [],
		choosed_images: {
			paths: [],
			choosed: false
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this;
		if (options.code === "0") {
			// to get category from server
			getCategories().then(res => {
				that.setData({
					categories: res
				})
			});

			// get sizes of the product
			getSizes().then(sizes => {
				that.setData({
					sizes: sizes
				})
			}).catch(err => {
				console.log("get product sizes error", err)
			})
			return;
		}

		this.setData({
			code: options.code
		});

		request.get('product', {
			code: options.code
		}).then(res => {
			wx.setNavigationBarTitle({
				title: res.data.name
			});

			var details = [];
			var banner_image;
			res.data.images.forEach(image => {
				if (image.index > 0) {
					details.push({
						path: `${base_url}/media/${image.image.name}`,
						index: image.index,
						id: image.image.id,
					});
					//details.push(`${base_url}/media/${image.image.name}`)
				} else {
					banner_image = {
						path: `${base_url}/media/${image.image.name}`,
						index: image.index,
						id: image.image.id,
						choosed: false
					}
				}
			})

			var my_sizes = []
			console.log('product sizes:', res.data.sizes)
			res.data.sizes.forEach(ps => {
				my_sizes.push(ps.size.id)
			})

			console.log('my sizes', my_sizes)
			// get sizes of the product
			getSizes().then(sizes => {
				console.log('sizes', sizes)
				sizes.forEach(ele => {
					for (var ms of res.data.sizes) {
						if (ms.size.id === ele.id) {
							ele.checked = true
							ele.price = (res.data.price + ms.price_plus)/100
							ele.member_price = (res.data.member_price + ms.member_price_plus)/100
							ele.promote_price = (res.data.promote_price + ms.promote_price_plus)/100
							break
						}
					}
					that.setData({
						sizes: sizes
					})
				})
			}).catch(err => {
				console.log("get product sizes error", err)
			})

			// to get category from server
			getCategories().then(res => {
				that.setData({
					categories: res
				})
			});

			that.setData({
				product: res.data,
				category: res.data.category.id,
				my_sizes: my_sizes,
				extra_info: res.data.category.extra_info,
				web_allowed: res.data.web_allowed,
				promote_allowed: res.data.promote_allowed,
				banner_image: banner_image,
				choosed_images: {
					paths: details,
					choosed: false
				}
			});
		}).catch(err => {
			console.err('getting product error', err)
			// to get category from server
			getCategories().then(res => {
				that.setData({
					categories: res
				})
			});

			// get sizes of the product
			getSizes().then(sizes => {
				that.setData({
					sizes: sizes
				})
			}).catch(err => {
				console.log("get product sizes error", err)
			})
		});

		wx.hideShareMenu();
	},

	categoryChange: function (e) {
		var index = parseInt(e.detail.value)
		var category = this.data.categories[index];
		console.log('category', category)
		this.setData({
			category: category.id,
			extra_info: category.extra_info
		})
	},

	sizesChecked: function (e) {
		console.log(e)
		this.setData({
			my_sizes: e.detail.value
		})
	},

	chooseBanner: function (e) {
		var that = this;
		wx.chooseImage({
			count: 1,
			success: function (res) {
				console.log(res);
				that.setData({
					banner_image: {
						path: res.tempFilePaths[0],
						choosed: true
					}
				});
			}
		});
	},

	chooseImages: function (e) {
		var that = this;
		wx.chooseImage({
			success: function (res) {
				var details = [];
				res.tempFilePaths.forEach(function (ele, index) {
					details.push({
						path: ele,
						index: index + 1
					})
				})
				that.setData({
					choosed_images: {
						paths: details,
						choosed: true
					}
				});
			}
		});
	},

	webAllowChange: function (e) {
		this.setData({
			web_allowed: e.detail.value
		})
	},

	promoteAllowChange: function (e) {
		this.setData({
			promote_allowed: e.detail.value
		})
	},

	uploadImages: function () {
		//var banner_ids = [];
		var photo_ids = [];
		var that = this;

		var to_upload_number = 1 + that.data.choosed_images.paths.length;

		return new Promise(function (resolve, reject) {
			wx.showLoading({
				title: '商品图片上传中...',
				mask: true
			})

			if (that.data.banner_image.choosed) {
				wx.uploadFile({
					url: `${base_url}/api/${shoppoint}/image`,
					filePath: that.data.banner_image.path,
					name: 'upload-files',
					header: requestHeaders(),
					formData: {
						type: 'banner'
					},
					success: function (res) {
						console.log('upload banner successfully', res)
						var data = JSON.parse(res.data);
						photo_ids.push({
							id: data[0].id,
							index: 0
						});

						if (photo_ids.length === to_upload_number) {
							wx.hideLoading()
							resolve(photo_ids)
						}
					},
					fail: function (err) {
						console.log('upload banner image error', err)
						reject(err)
						wx.hideLoading()
					}
				});
			} else {
				photo_ids.push({
					id: that.data.banner_image.id,
					index: that.data.banner_image.index
				})
			}

			if (that.data.choosed_images.choosed) {
				that.data.choosed_images.paths.forEach(function (image, index) {
					wx.uploadFile({
						url: `${base_url}/api/${shoppoint}/image`,
						filePath: image.path,
						name: 'upload-files',
						header: requestHeaders(),
						formData: {
							type: 'detail'
						},
						success: function (res) {
							console.log('upload detail successfully', res);
							var data = JSON.parse(res.data);
							photo_ids.push({
								id: data[0].id,
								index: index + 1
							});

							if (photo_ids.length === to_upload_number) {
								wx.hideLoading()
								resolve(photo_ids)
							}
						},
						fail: function (err) {
							console.log('upload detail image error', err)
							reject(err)
							wx.hideLoading()
						}
					});
				});
			} else {
				that.data.choosed_images.paths.forEach(ele => {
					photo_ids.push({
						id: ele.id,
						index: ele.index
					})
				})
			}

			// 如果产品图片没有做修改
			if (!that.data.choosed_images.choosed && !that.data.banner_image.choosed) {
				wx.hideLoading()
				resolve(photo_ids)
			}
		})
	},

	saveProduct: function (e) {
		var that = this;

		if (this.data.banner_image === undefined || !this.data.banner_image) {
			wx.showToast({
				title: '需要选择产品封面',
				icon: 'none',
				duration: 3000
			})

			return
		}

		console.log('update product', e)

		if (e.detail.value.name.trim() === '') {
			wx.showToast({
				title: '需要给产品起个名字',
				icon: 'none',
				duration: 3000
			})

			return
		}

		if (e.detail.value.summary.trim() === '') {
			wx.showToast({
				title: '需要给产品写点摘要',
				icon: 'none',
				duration: 3000
			})

			return
		}

		// 将货币单位换算成分
		var price = parseFloat(e.detail.value.price)
		if (Number.isNaN(price) || price <= 0) {
			wx.showToast({
				title: '需要给产品定个原始价格',
				icon: 'none',
				duration: 3000
			})

			return
		}
		e.detail.value.price = price * 100

		price = parseFloat(e.detail.value.member_price)
		if (Number.isNaN(price) || price <= 0) {
			e.detail.value.member_price = e.detail.value.price
		} else {
			e.detail.value.member_price = price * 100
		}

		price = parseFloat(e.detail.value.promote_price)
		if (Number.isNaN(price) || price <= 0) {
			wx.showToast({
				title: '需要给产品定个团购价格',
				icon: 'none',
				duration: 3000
			})

			return
		}
		e.detail.value.promote_price = price * 100

		if (e.detail.value.promote_price > e.detail.value.price) {
			wx.showToast({
				title: '团购价格居然高于原始价格',
				icon: 'none',
				duration: 3000
			})

			return
		}

		var promise = this.uploadImages()
		promise.then(res => {
			wx.showLoading({
				title: '开始上传商品信息',
				mask: true
			})
			var data = e.detail.value;
			data.category = that.data.category
			data.images = res
			var ss = []
			that.data.my_sizes.forEach(ele => {
				var o = {}
				o.price = e.detail.value['size-price-'+ele].trim()
				o.price = o.price === '' ? -1 : Math.floor(parseFloat(o.price) * 100)
				o.member_price = e.detail.value['size-member-price-'+ele],
				o.member_price = o.member_price === '' ? -1 : Math.floor(parseFloat(o.member_price) * 100)
				o.promote_price = e.detail.value['size-promote-price-'+ele].trim()
				o.promote_price = o.promote_price === '' ? -1 : Math.floor(parseFloat(o.promote_price) * 100)
				o.id = ele
				ss.push(o)
			})
			data.sizes = ss
			if (that.data.product)
				data.code = that.data.product.code
			//data.price = data.price * 100
			//data.member_price = data.member_price * 100
			//data.promote_price = data.promote_price * 100
			request.post('product', data)
				.then(res => {
					wx.hideLoading()
					var pages = getCurrentPages();
					var prePage = pages[pages.length - 2];
					//prePage.setData({dragon:res.data});
					prePage.syncProducts();
					wx.navigateBack();
				}).catch(err => {
					wx.hideLoading()
					wx.showToast({
						title: '新增/修改商品失败',
						icon: 'none',
						duration: 2000
					});
				})
		}).catch(err => {
			console.log('dddddddd', err)
			wx.hideLoading()
			wx.showToast({
				title: '上传图片失败',
				icon: 'none',
				duration: 2000
			});
		})
	}
})
