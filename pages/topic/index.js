import config from '../../config.js'
import request from '../../utils/request.js'

import { addToShoppingCart } from '../../utils/cart.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_image_url: config.base_image_url,
    swiper_current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAds(4)
    this.getProducts()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getAds(4)
    this.getProducts()
    wx.stopPullDownRefresh()
  },

  getAds: function(type) {
    var that = this;
		wx.showLoading({
			title: '加载中...',
			mask: true
		})

		request.get('images', {
			type: type
		}).then(res => {
      console.log('ads: ', res.data, !res.data)
      if (!res.data || res.data.length === 0)
        that.loadDefaultAds()
      else
        that.setData({
          ads: res.data
        })
			wx.hideLoading()
		}).catch(err => {
			console.log('get images', err)
      wx.hideLoading()
      // load default ads
      that.loadDefaultAds()
		})
  },

  loadDefaultAds: function() {
    console.log('load default ads')
    this.setData({
      ads: [{name: 'ads/1.jpg'}, {name: 'ads/2.jpg'}, {name: 'ads/3.jpg'}]
    })
  },

  getProducts: function() {
		var that = this
		wx.showNavigationBarLoading()
		request.get('products', {
      show_type: 1,
      promote_type: 16, // 16-本周推荐
			sort: 'popular',
			limit: 4,
		}).then(res => {
			console.log(res.data)
			wx.hideNavigationBarLoading()
			that.setData({
				products: res.data
			})
		}).catch(err => {
			console.log('get products error', err)
			wx.hideNavigationBarLoading()
		})
  },

  swiperChange: function(e) {
    this.setData({
      swiper_current: e.detail.current
    })
  },

	toViewDetail: function (e) {
		wx.navigateTo({
			url: `/pages/goods/detail?code=${e.currentTarget.dataset.code}`
		})
	},

	addToCart: function (e) {
		var product = this.data.products[parseInt(e.currentTarget.dataset.index)]

		addToShoppingCart(product, 0, 1)
		wx.showToast({
			title: '成功加入购物车',
			icon: 'success',
			duration: 2000
		})
	},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
		return {
			title: '小麦芬烘焙',
			path: '/pages/topic/index'
		}
  }
})