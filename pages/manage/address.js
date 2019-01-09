const app = getApp();

import {
  request,
  base_url
} from '../../utils/request.js'

Page({
  data: {
    from_time: '09:00',
    to_time: '21:00',
    defaultChecked: false
  },

  onLoad: function (res) {
    wx.hideShareMenu();
  },

  submit: function (e) {
    var that = this;
    console.log(e);
    if (e.detail.value.contact.trim() === '') {
      wx.showToast({
        title: '您还没有写联系人',
        icon: 'none',
        duration: 2000
      });

      return;
    }
    if (e.detail.value.phone.trim() === '') {
      wx.showToast({
        title: '您还没有写联系电话',
        icon: 'none',
        duration: 2000
      });

      return;
    }

    if (e.detail.value.address.trim() === '') {
      wx.showToast({
        title: '您还没有写具体提货地址',
        icon: 'none',
        duration: 2000
      });

      return;
    }

    request.post('address', {
      contact: e.detail.value.contact,
      phone: e.detail.value.phone,
      address: e.detail.value.address,
      from_time: that.data.from_time,
      to_time: that.data.to_time,
      checked: that.data.defaultChecked
    }).then(res => {
      console.log(res.data);
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 2];
      var addrs = prePage.data.addresses;
      addrs.push(res.data);
      prePage.setData({
        addresses: addrs
      });

      wx.showToast({
        title: '地址添加成功',
        icon: 'success',
        duration: 2000
      });
      setTimeout(function () {
        wx.navigateBack();
      }, 1800);
    })
    //if (!a.has_empty) {
    //    a.next_seq++;
    //    a.addrs.push({'addr':'', 'seq': a.next_seq});
    //    a.has_empty = true;
    //    this.setData({'addr_add': a});
    //}
  },

  timeChange: function (e) {
    console.log(e);
    //var t = {}
    //t[e.currentTarget.dataset.name] = e.detail.value;
    //this.setData(t);
    this.setData({
      [e.currentTarget.dataset.name]: e.detail.value
    });
  },

  defaultAddress: function (e) {
    this.setData({
      defaultChecked: e.detail.value
    });
  }
});