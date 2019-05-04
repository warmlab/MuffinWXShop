const drawCanvas = (that, canvas_id, nickname, pic, name, summary, price, qrimage, avatar, is_promotion) => {
	wx.showLoading({
		title: '绘制海报图片'
	})
	var ctxs = wx.createCanvasContext(canvas_id)
	ctxs.setFillStyle('#ffffff')
	ctxs.fillRect(0, 0, 600, 1100)
	// 分享会员名称
	ctxs.setFillStyle('#353535')
	ctxs.setFontSize(26)
	ctxs.setTextAlign('left')
	ctxs.fillText(nickname ? nickname : '小麦芬烘焙', 200, 60)
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
	ctxs.setTextAlign('center')
	ctxs.fillText(name, 200, 745)
	// 产品概要
	ctxs.setFillStyle('#7b8196')
	ctxs.setFontSize(22)
	ctxs.setTextAlign('left')
	ctxs.fillText(summary.slice(0,17), 20, 780, 450)
	ctxs.fillText(summary.slice(17, 34), 20, 810, 450)
	// 产品价格
	ctxs.setFillStyle('#a18d65')
	ctxs.setFontSize(56)
	ctxs.setTextAlign('right')
	ctxs.fillText('¥' + (price / 100), 578, 780)
	// 小程序码
	ctxs.drawImage(qrimage, 40, 850, 200, 200)
	// 提示
	ctxs.setFillStyle('#353535')
	ctxs.setFontSize(26)
	ctxs.setTextAlign('left')
	ctxs.fillText('小麦芬烘焙工作室', 260, 910)

	ctxs.setFillStyle('#999999')
	ctxs.setFontSize(22)
	ctxs.fillText('长按图片，识别小程序码', 260, 980)
	if (is_promotion)
		ctxs.fillText('查看团购详情信息～', 260, 1020)
	else
		ctxs.fillText('查看商品详情信息～', 260, 1020)
	ctxs.fill()
	ctxs.beginPath()
	ctxs.arc(100, 60, 40, 0, 2 * Math.PI)
	ctxs.clip()
	ctxs.drawImage(avatar, 60, 20, 80, 80)
	ctxs.restore()
	ctxs.save()
	ctxs.draw(false, () => {
		wx.showLoading({
			title: '合并海报图片'
		})
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: 600,
			height: 1100,
			canvasId: canvas_id,
			success: res => {
				that.setData({
					codeimg: res.tempFilePath,
					codeMask: true,
					share_show: false
				})
				wx.showLoading({
					title: '准备保存本地'
				})
				wx.hideLoading()
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: r => {
						wx.showToast({
							title: '保存成功',
							icon: 'success',
							duration: 2000
						})
					}
				})
			}
		})
	})
}

export default drawCanvas
