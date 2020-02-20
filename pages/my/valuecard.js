// pages/my/valuecard.js
const app = getApp()

import request from '../../utils/request.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
		wx.showLoading({
			title: '信息加载中...',
			mask: true
		})
    request.get('openid').then(res => {
        that.setData({
          member: res.data
        })
        wx.hideLoading()
      }).catch(err => {
        wx.hideLoading()
      })
  },

  bindValuecard: function (e) {
		wx.showLoading({
			title: '会员卡绑定中...',
			mask: true
		})
    request.post('openid', {
      name: e.detail.value.name,
      phone: e.detail.value.phone
    }).then(res => {
      var userInfo = wx.getStorageSync('appUserInfo')
      userInfo.name = e.detail.value.name
      userInfo.phone = e.detail.value.phone
      wx.setStorageSync('appUserInfo', userInfo)

      wx.hideLoading()
      wx.showModal({
        title: '会员卡绑定成功',
        content: '点击按钮返回',
        confirmColor: '#481A0E',
        show_cancel: false
      })

      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];

      if ('toGetUserInfo' in prePage)
        prePage.toGetUserInfo()
      //prePage.setData({dragon:res.data});
      wx.navigateBack()
    }).catch(err => {
      wx.hideLoading()
    })
  },
})
