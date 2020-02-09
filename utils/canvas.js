import config from '../config.js'
import request from '../utils/request.js'
import {
	downloadImage
} from '../utils/resource.js';

class MyCanvas {
	constructor(target, path, type, canvas_id, obj_id, name, summary, price, promote_price, image_url, callback) {
		this.target = target
		this.path = path
		this.type = type
		this.canvas_id = canvas_id
		this.id = obj_id
		this.name = name
		this.summary = summary.trim()
		this.price = price
		this.promote_price = promote_price
		this.image_url = image_url
		this.callback = callback
	}

	drawCanvas(logo, pic, qrimage) {
		wx.showLoading({
			title: '绘制海报图片',
		})
		var ctxs = wx.createCanvasContext(this.canvas_id)
		ctxs.setFillStyle('#ffffff')
		ctxs.fillRect(0, 0, 600, 1000)
		// 产品图片
		ctxs.drawImage(pic, 0, 0, 600, 600)

		// 名称
		ctxs.setFillStyle('#353535')
		ctxs.setFontSize(28)
		ctxs.setTextAlign('left')
		ctxs.fillText(this.name, 20, 640, 560)

		// 摘要
		ctxs.setFillStyle('#7b8196')
		ctxs.setFontSize(22)
		var pos = this.summary.indexOf("\n", 0)
		if (pos > 26 || pos < 0)
			pos = 26
		else
			pos += 1
		ctxs.fillText(this.summary.slice(0, pos), 20, 680, 560)
		
		var pos2 = this.summary.indexOf("\n", pos)
		if (pos2 > 52 || pos2 < 0)
			pos2 = 52
		ctxs.fillText(this.summary.slice(pos, pos2), 20, 710, 560)

		// 产品促销价格
		ctxs.setFillStyle('#6c2727')
		ctxs.setFontSize(56)
		var price = '¥' + (this.promote_price / 100)
		var start = ctxs.measureText(price).width
		ctxs.fillText(price, 20, 780)

		if (this.promote_price < this.price) {
			// 产品价格
			ctxs.setFillStyle('#7b8196')
			ctxs.setFontSize(28)
			price = '¥' + (this.price / 100)
			ctxs.fillText(price, 40 + start, 780)
			var end = ctxs.measureText(price).width
			ctxs.beginPath()
			ctxs.setStrokeStyle('#7b8196')
			ctxs.setLineWidth(2)
			ctxs.moveTo(40+start-5, 770)
			ctxs.lineTo(40+start+end+5, 770)
			ctxs.stroke()
		}

		// 小程序码
		ctxs.drawImage(qrimage, 340, 740, 240, 240)

		ctxs.setFillStyle('#353535')
		ctxs.setFontSize(24)
		ctxs.fillText('长按图片，识别小程序码 >>', 20, 880)
		ctxs.setFillStyle('#7b8196')
		if (this.type === 'promotion')
			ctxs.fillText('查看团购详情信息', 20, 920)
		else
			ctxs.fillText('查看商品详情信息', 20, 920)

		// logo
		/* TODO
		ctxs.setFillStyle('#722a28')
		ctxs.fillRect(20, 0, 120, 150)	
		ctxs.setTextAlign('center')
		ctxs.setFillStyle('#ffffff')
		ctxs.fillText('小麦芬', 80, 130)
		ctxs.beginPath()
		ctxs.arc(80, 50, 40, 0, 2 * Math.PI)
		ctxs.fill()
		ctxs.clip()
		ctxs.drawImage(logo, 40, 10, 80, 80)
		ctxs.restore()
		*/

		ctxs.save()

		var that = this
		ctxs.draw(false, function () {
			that.finishDraw()
		})
	}

	drawCanvas2(nickname, pic, qrimage, avatar) {
		console.log(nickname, pic, qrimage, avatar)
		wx.showLoading({
			title: '绘制海报图片'
		})
		var ctxs = wx.createCanvasContext(this.canvas_id)
		ctxs.setFillStyle('#ffffff')
		ctxs.fillRect(0, 0, 600, 1100)
		// 分享会员名称
		ctxs.setFillStyle('#353535')
		ctxs.setFontSize(26)
		ctxs.setTextAlign('left')
		ctxs.fillText(nickname ? nickname : '小麦芬烘焙', 140, 60)
		// 图片边框
		ctxs.setFillStyle('#f5f5f5')
		ctxs.fillRect(10, 120, 580, 720)
		ctxs.setFillStyle('#ffffff')
		ctxs.fillRect(12, 122, 576, 716)

		// 产品图片
		ctxs.drawImage(pic, 10, 120, 580, 580)

		// 产品名称
		ctxs.setFillStyle('#353535')
		ctxs.setFontSize(28)
		ctxs.setTextAlign('left')
		ctxs.fillText(this.name, 22, 745)
		// 产品概要
		ctxs.setFillStyle('#7b8196')
		ctxs.setFontSize(22)
		ctxs.setTextAlign('left')
		ctxs.fillText(this.summary.slice(0, 18), 20, 780, 450)
		ctxs.fillText(this.summary.slice(18, 36), 20, 810, 450)
		// 产品价格
		ctxs.setFillStyle('#a18d65')
		ctxs.setFontSize(56)
		ctxs.setTextAlign('right')
		ctxs.fillText('¥' + (this.price / 100), 578, 780)
		// 小程序码
		ctxs.drawImage(qrimage, 40, 850, 200, 200)
		// 提示
		ctxs.setFillStyle('#353535')
		ctxs.setFontSize(26)
		ctxs.setTextAlign('left')
		ctxs.fillText('小麦芬烘焙工作室', 260, 910)

		ctxs.setFillStyle('#7b8196')
		ctxs.setFontSize(22)
		ctxs.fillText('长按图片，识别小程序码', 260, 980)
		if (this.type === 'promotion')
			ctxs.fillText('查看团购详情信息～', 260, 1020)
		else
			ctxs.fillText('查看商品详情信息～', 260, 1020)
		ctxs.fill()
		ctxs.beginPath()
		ctxs.arc(60, 60, 40, 0, 2 * Math.PI)
		ctxs.clip()
		ctxs.drawImage(avatar, 20, 20, 80, 80)
		ctxs.restore()
		ctxs.save()

		var that = this
		ctxs.draw(false, function () {
			that.finishDraw()
		})
	}
	
	finishDraw() {
		var that = this
		wx.showLoading({
			title: '正在完成海报图片',
			mask: true
		})
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: 600,
			height: 1100,
			canvasId: that.canvas_id,
			success: res => {
				that.callback.apply(that.target, [res.tempFilePath])
				wx.showLoading({
					title: '准备保存本地',
					mask: true
				})
				wx.hideLoading()
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: r => {
						wx.showModal({
							title: that.type==='promotion'?'团购海报图片':'商品海报图片',
							content: '已成功保存到相册，请到系统相册查看',
							showCancel: false
						})
					}
				})
			}
		})
	}

	generateImage() {
		var that = this
		//var data = that.data.product
		wx.showLoading({
			title: '准备中...',
			mask: true,
		})
		var user = wx.getStorageSync('appUserInfo')
		//下载商品海报
		downloadImage(that.image_url,
			function (path) {
				wx.showLoading({
					title: '生成小程序码',
					mask: true,
				})
				request.post('qrcode', {
					//type: 'qr',
					//scene: 'product=' + data.id + ',user=' + user.openid + ',s=1',
					type: that.type,
					id: that.id,
					path: that.path,
				}).then(res => {
					console.log('qrcode', res)
					wx.showLoading({
						title: '下载小程序码',
						mask: true
					})
					downloadImage(`${config.base_image_url}/${res.data.qr_image_path}`,
						function (qr_path) {
							that.drawCanvas('/images/logo.png', path, qr_path)
							/*
							if (user.avatarUrl) {
								downloadImage(user.avatarUrl,
									function (avatar) {
										that.drawCanvas(user.nickname, path, qr_path, avatar)
									},
									function (err) {
										console.error('download user avatar error', err)
										wx.hideLoading()
										wx.showModal({
											title: "下载头像",
											content: "下载用户头像出错",
											showCancel: false
										})
									})
							} else {
								that.drawCanvas(user.nickname, path, qr_path, '/images/logo.png')
							}
							*/
						},
						function (err) {
							console.error('download generated mini program code error', err)
							wx.hideLoading()
							wx.showModal({
								title: "下载小程序码",
								content: "下载生成的小程序码出错",
								showCancel: false
							})
						})
				}).catch(err => {
					console.error('generate mini program code error', err)
					wx.hideLoading()
					wx.showModal({
						title: "生成小程序码",
						content: "生成小程序码出错",
						showCancel: false
					})
				})
			},
			function (err) {
				console.error('download goods image error')
				wx.hideLoading()
				wx.showModal({
					title: "错误",
					content: "下载商品海报图片出错",
					showCancel: false
				})
			})
	}
}

export default MyCanvas
