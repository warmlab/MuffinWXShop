// pages/address/new.js
const app = getApp()

import {
  request,
  base_url
} from '../../utils/request.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    is_default: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      address_id: options.id
    })
    if (parseInt(options.id) !== 0) {
      request.get('openid/address', {
          id: options.id,
          openid: app.globalData.openid
        })
        .then(res => {
          that.setData({
            address: res.data,
            is_default: res.data.is_default
          })
        })
    }
  },

  changeDefault: function (e) {
    this.setData({
      is_default: e.detail.value
    })
  },

  saveAddress: function (e) {
    var that = this;
    console.log('save address parameters', e)

    if (e.detail.value.name.trim() === '') {
      wx.showToast({
        title: '您还没有写收货人姓名',
        icon: 'warn',
        duration: 2000
      });

      return;
    }

    if (e.detail.value.phone.trim() === '') {
      wx.showToast({
        title: '您还没有写收货人电话',
        icon: 'warn',
        duration: 2000
      });

      return;
    }

    if (e.detail.value.address.trim() === '') {
      wx.showToast({
        title: '您还没有写收货地址',
        icon: 'warn',
        duration: 2000
      });

      return;
    }

    request.post('openid/address', {
      id: that.data.address_id,
      openid: app.globalData.openid,
      contact: e.detail.value.name,
      phone: e.detail.value.phone,
      address: e.detail.value.address,
      is_default: that.data.is_default
    }).then(res => {
      console.log('succeed in updating address', res)
      wx.showToast({
        title: '地址添加成功',
        icon: 'success',
        duration: 2000
      });
      var addresses= wx.getStorageSync('addresses');
      console.log('aaaaaaaaaaaaaa', addresses)
      if (addresses === undefined || addresses === "" || addresses === null)
        wx.setStorageSync('addresses', [res.data]);
      else {
        addresses.push(res.data);
        wx.setStorageSync('addresses', addresses);
      }
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      //prePage.setData({dragon:res.data});
      prePage.syncAddresses();
      wx.navigateBack();
    }).catch(err => {
      console.log('failed in updating address', err)
      wx.showToast({
        title: '地址添加失败',
        icon: 'fail',
        duration: 2000
      });
      wx.navigateBack();
    })
  }
})
