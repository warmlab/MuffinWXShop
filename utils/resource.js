import request from "./request.js"

const WEB_ALLOWED = 0x01
const POS_ALLOWED = 0x02
const PROMOTE_ALLOWED = 0x04

const getShopInfo = () => {
	return new Promise((resolve, reject) => {
		var shop = wx.getStorageSync('appShopInfo')
		if (!!shop) {
			resolve(shop)
		} else {
			request.get('info').then(res => {
				wx.setStorageSync('appShopInfo', res.data)
				resolve(res.data)
			}).catch(err => {
				reject(err)
			})
		}
	})
}

const getCategories = () => {
	return new Promise((resolve, reject) => {
		request.get('categories')
			.then(res => {
				resolve(res.data)
			}).catch(err => {
				console.error('get product categories error', err)
				reject(err)
			})
	})
}

const getSizes = () => {
	return new Promise((resolve, reject) => {
		request.get('product/sizes')
			.then(res => {
				resolve(res.data)
			}).catch(err => {
				console.error('get product sizes error', err)
				reject(err)
			})
	})
}

const downloadImage = (url, resolve, reject) => {
	wx.downloadFile({
		url: url,
		success: res => {
			if (res.statusCode === 200) {
				var path = res.tempFilePath
				resolve(path)
			} else
				reject(res)
		},
		fail: err => {
			reject(err)
		}
	})
}

export {
	WEB_ALLOWED,
	POS_ALLOWED,
	PROMOTE_ALLOWED,
	getShopInfo,
	getCategories,
	getSizes,
	downloadImage
}
