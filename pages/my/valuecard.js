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
    request.get('openid')
      .then(res => {
        that.setData({
          member: res.data
        })
      })
  },

  bindValuecard: function (e) {
    request.post('openid', {
      name: e.detail.value.name,
      phone: e.detail.value.phone
    }).then(res => {
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      //prePage.setData({dragon:res.data});
      console.log('aaaaaaaaaaaaaaaaaaaa', 'getOrder' in prePage)
      if ('getOrder' in prePage)
        prePage.getOrder();
      wx.navigateBack()
    })
  },
})
