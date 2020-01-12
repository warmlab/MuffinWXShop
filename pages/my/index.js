const app = getApp()

Page({
	data: {},
	onLoad: function (e) {
		var userInfo = wx.getStorageSync('appUserInfo')
		this.setData({
			userInfo: userInfo
		})
	},

	toGetUserInfo: function (e) {
		var userInfo = wx.getStorageSync('appUserInfo');
		userInfo.nickname = e.detail.userInfo.nickName
		userInfo.avatarUrl = e.detail.userInfo.avatarUrl
		wx.setStorageSync('appUserInfo', userInfo)
		
		this.setData({
			userInfo: userInfo
		})
	},

	toViewAddress: function (e) {
		wx.navigateTo({
			url: 'address/index?type=view'
		})
	},

	bindValuecard: function (e) {
		wx.navigateTo({
			url: 'valuecard'
		})
	},
});
