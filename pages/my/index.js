const app = getApp()

Page({
    data: {},
    onLoad: function (e) {
        console.log(app.globalData.userInfo)
        this.setData({
            userInfo: app.globalData.userInfo,
            privilege: wx.getStorageSync('privilege')
        })
    },

    toGetUserInfo: function(e) {
        wx.setStorageSync('userInfo', JSON.parse(e.detail.rawData));
        wx.setStorageSync('scope_userInfo', true);
        app.globalData.userInfo = JSON.parse(e.detail.rawData);
        app.globalData.scope_userInfo = true;
        this.setData({
            userInfo: app.globalData.userInfo
        });
    },

    manageAddress: function (e) {
        wx.navigateTo({
            url: 'addresses'
        })
    },

    bindValuecard: function (e) {
        wx.navigateTo({
            url: 'valuecard'
        })
    },

    manageProducts: function (e) {
        wx.navigateTo({
            url: '/pages/manage/products'
        })
    },

    publishPromotion: function (e) {
        wx.navigateTo({
            url: '/pages/manage/promotion?id=0'
        })
    },

    managePromotions: function (e) {
        wx.navigateTo({
            url: '/pages/manage/promotions'
        })
    }
});