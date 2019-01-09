import {
	request
} from "./request.js"

const WEB_ALLOWED = 0x01
const POS_ALLOWED = 0x02
const PROMOTE_ALLOWED = 0x04

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

export {
	WEB_ALLOWED,
	POS_ALLOWED,
	PROMOTE_ALLOWED,
	getCategories,
	getSizes
}
