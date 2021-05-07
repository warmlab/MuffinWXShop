const app = getApp()

Page({
	data: {
		hasUserInfo: false,
		canIUseGetUserProfile: false,
	},
	onLoad: function (e) {
		if (wx.getUserProfile) {
			this.setData({
			  canIUseGetUserProfile: true
			})
		} else {
			var userInfo = wx.getStorageSync('appUserInfo')

			this.setData({
				userInfo: userInfo,
				hasUserInfo: true
			})
		}
	},

	toGetUserProfile: function(e) {
		wx.getUserProfile({
			desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
			success: (res) => {
			  res.userInfo.nickname = res.userInfo.nickName
			  this.setData({
				userInfo: res.userInfo,
				hasUserInfo: true
			  })
			}
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
