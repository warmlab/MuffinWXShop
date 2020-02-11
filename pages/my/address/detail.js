// pages/address/new.js
import config from '../../../config.js'
import request from '../../../utils/request.js'
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.min.js')

const app = getApp()

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		province: '山东省',
		city: '青岛市',
		district: '李沧区',
		is_default: true
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this;
		this.setData({
			address_id: options.id
		})
		if (parseInt(options.id) !== 0) {
			wx.showLoading({
				title: '地址信息加载中...',
				mask: true
			})
			request.get('openid/address', {
				id: options.id,
			}).then(res => {
				that.setData({
					contact: res.data.contact,
					phone: res.data.phone,
					province: res.data.province,
					city: res.data.city,
					district: res.data.district,
					address: res.data.address,
				})
				wx.hideLoading()
			}).catch(err => {
				wx.hideLoading()
			})
		}

		var qq_map = new QQMapWX({
			key: config.map_key
		})

		that.setData({
			qq_map: qq_map
		})
	},

	getLocation: function () {
		var that = this;
		if (config.map_key) {
			wx.showLoading({
				title: "\u5B9A\u4F4D\u4E2D...",
				mask: true
			})

			wx.getLocation({
				type: 'gcj02',
				success: res => {
					console.log('wx.getLocation', res)

					console.log('qq map wx', qqMap)
					that.data.qq_map.reverseGeocoder({
						location: {
							latitude: res.latitude,
							longitude: res.longitude
						},
						success: lo => {
							console.log('qqMap reverse geocoder', lo)

							that.setData({
								province: lo.result.ad_info.province,
								city: lo.result.ad_info.city,
								district: lo.result.ad_info.district,
								adcode: lo.result.ad_info.adcode,
								address: lo.result.address_component.street
							})
						},
						fail: err => {
							console.error('qqMap reverse geocoder error', err)
						}
					})
				},
				fail: err => {
					wx.showToast({
						title: "\u5B9A\u4F4D\u5931\u8D25",
						icon: 'none'
					});
				},
				complete: () => {
					wx.hideLoading()
				}
			})
		}
	},

	bindRegionChange: function (e) {
		this.setData({
			province: e.detail.value[0],
			city: e.detail.value[1],
			district: e.detail.value[2]
		})
	},

	readAddressFromWx: function () {
		var that = this;
		wx.chooseAddress({
			success: function success(res) {
				console.log('read address from wx', res)
				that.setData({
					contact: res.userName,
					phone: res.telNumber,
					province: res.provinceName,
					city: res.cityName,
					district: res.countyName,
					address: res.detailInfo,
					adcode: res.postalCode
				})
			}
		})
	},

	changeDefault: function (e) {
		this.setData({
			is_default: e.detail.value
		})
	},

	saveAddress: function (e) {
		var that = this;
		console.log('save address parameters', e)

		if (e.detail.value.contact.trim() === '') {
			wx.showModal({
				title: '收货人姓名',
				content: '您还没有写收货人姓名',
				showCancel: false
			});

			return;
		}

		if (e.detail.value.phone.trim() === '') {
			wx.showModal({
				title: '收货人电话',
				content: '您还没有写收货人电话',
				showCancel: false
			});

			return;
		}

		if (e.detail.value.address.trim() === '') {
			wx.showModal({
				title: '详细地址',
				content: '您还没有写收货详细地址',
				showCancel: false
			});

			return;
		}

		wx.showLoading({
			title: '信息更新中...',
			mask: true
		})

		var userInfo = wx.getStorageSync('appUserInfo')

		request.post('openid/address', {
			id: that.data.address_id,
			openid: userInfo.openid,
			contact: e.detail.value.contact,
			phone: e.detail.value.phone,
			province: that.data.province,
			city: that.data.city,
			district: that.data.district,
			address: e.detail.value.address,
			is_default: that.data.is_default
		}).then(res => {
			console.log('succeed in updating address', res)
			wx.hideLoading()
			wx.showToast({
				title: '地址添加成功',
				icon: 'success',
				duration: 2000
			});
			var addresses = wx.getStorageSync('addresses');
			if (addresses === undefined || addresses === "" || addresses === null)
				wx.setStorageSync('addresses', [res.data]);
			else {
				addresses.push(res.data);
				wx.setStorageSync('addresses', addresses);
			}
			wx.navigateBack();
		}).catch(err => {
			console.log('failed in updating address', err)
			wx.hideLoading()
			wx.showToast({
				title: '地址添加失败',
				icon: 'fail',
				duration: 2000
			});
			wx.navigateBack();
		})
	}
})
