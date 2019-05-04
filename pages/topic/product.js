// pages/product/detail.js
import config from '../../config.js'
import request from '../../utils/request.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_image_url: config.base_image_url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    request.get('product', {code: options.code})
      .then(res => {
        that.setData({
          product: res.data,
          details: res.data.images.slice(1)
        })
      })
  }
})
