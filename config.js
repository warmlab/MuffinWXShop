const config = {
	version: '1.0.0',
	api_version: '1.0.0',
	//base_url: 'http://10.1.1.7:5000/api',
	//base_image_url: 'http://10.1.1.7:5000/media',
	base_url: 'https://wecakes.com/api',
	base_image_url: 'https://wecakes.com/media',
	shoppoint: 'muffins',
	partment: 'minishop',
	map_key: 'OFEBZ-OZFWI-PNDGD-52RTP-UVJ2V-5GFEX',
	terminal_type: 4, // 1 - WebSite; 2 - POS; 4 - Miniprogram

	initSystemInfo: () => {
		var res = wx.getSystemInfoSync()

		wx.WIN_WIDTH = res.screenWidth
		wx.WIN_HEIGHT = res.screenHeight
		wx.IS_IOS = /ios/i.test(res.system)
		wx.IS_ANDROID = /android/i.test(res.system)
		wx.STATUS_BAR_HEIGHT = res.statusBarHeight
		wx.DEFAULT_HEADER_HEIGHT = 46; // res.screenHeight - res.windowHeight - res.statusBarHeight
		wx.DEFAULT_CONTENT_HEIGHT = res.screenHeight - res.statusBarHeight - wx.DEFAULT_HEADER_HEIGHT
		wx.IS_APP = true
		wx.IPHONEX = res.model.search("iPhone X")
	}
}

export default config
