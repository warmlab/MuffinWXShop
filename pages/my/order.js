// pages/my/order_detail.js
const app = getApp()
import {request, base_url} from '../../utils/request.js'

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
    var that = this;
    //options.code, options.promotion_id
    // TODO to do prepay_id
    request.get('order', {code: options.code})
      .then(res => {
        // order code get total cost and promotion id is to determine whether or not the promotion was finished
        console.log('order: ', res);
        that.setData({
          order: res.data,
          base_url: base_url
        })
      })
      .catch(err => {
        // 
      })
  },

  payOrder: function (e) {
    var that = this
    //let currentOrder = this.orderList[e.target.dataset.orderIndex];
    // 给pay页面传两个参数orderId,actualPrice
    // console.log('订单信息', currentOrder);
    // 直接支付即可
    wx.redirectTo({
      url: `../pay/index?code=${that.data.order.code}`
    })
  },

  cancelOrder: function (e) {
    wx.redirectTo({
      url: `note?type=refund`
    })
  }
})