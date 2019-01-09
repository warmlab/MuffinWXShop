const WEEKDAYS = [
  '周日', '周一', '周二', '周三', '周四', '周五', '周六'
]

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const strToDate = str => {
  str = str.replace(/-/g, ':').replace(' ', ':');
  var time = str.split(':');
  var date = new Date(time[0], (time[1] - 1), time[2], time[3], time[4]);
  return date;
}

const fromatISODate = str => {
  str = str.replace('T', ' ');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getMonthDay = date => {
  var month = date.getMonth() + 1
  var day = date.getDate()

  return month + '月' + day + '日'
}

const getHourMin = date => {
  var hour = date.getHours();
  var minute = date.getMinutes();

  if (minute < 10)
    return hour + ':0' + minute;
  else
    return hour + ':' + minute;
}

const getWeekDay = date => {
  return WEEKDAYS[date.getDay()];
}

const authAdminUser = (host, shop, openid) => {
  var auth_result = undefined;
  var promise = new Promise((resolve, reject) => {
    wx.request({
      url: `${host}/api/${shop}/dragon/auth`,
      header: getCommonHeader(),
      data: {
        openid: openid,
        need: 'create'
      },
      method: 'POST',
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(res);
      },
      //success: function (res) {
      //  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 3);
      //  console.log('success', res);
      //  if (res.statusCode < 200 || res.statusCode > 204) {
      //    // authentication failed, go back
      //    wx.showToast({
      //      title: res.data.errmsg,
      //      icon: 'none',
      //      duration: 3000
      //    });
      //    //wx.navigateBack();
      //    auth_result = false;
      //  }

      //  auth_result = true;
      //},
      //fail: function (res) {
      //  console.log('failed', res);
      //  wx.showToast({
      //    title: '服务器正在忙，不能进行验证',
      //    icon: 'none',
      //    duration: 3000
      //  });
      //  //wx.navigateBack();
      //  auth_result = false;
      //}
    });
  });

  promise.then(res => {
    console.log('success', res);
    if (res.statusCode < 200 || res.statusCode > 204) {
      // authentication failed, go back
      wx.showToast({
        title: res.data.errmsg,
        icon: 'none',
        duration: 3000
      });
    }

    auth_result = true;
  }).catch(err => {
    console.log('failed', err);
    wx.showToast({
      title: '服务器正在忙，不能进行验证',
      icon: 'none',
      duration: 3000
    });
  });

  //var auth_waiting = setInterval(function () {
  //  if (auth_result !== undefined) {
  //console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 2);
  //    clearInterval(auth_waiting);
  //    return auth_waiting;
  //  }
  //}, 500);

  //wx.connectSocket({
  //  url: `wss://wecakes.com/api/${shop}/dragon/auth`,
  //    data: {
  //        openid: openid,
  //        need: 'create'
  //    },
  //    method: 'POST',
  //    success: function (res) {
  //      console.log(res);
  //    }
  //});
};

const promisify = f => {
  return function () {
    let args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (err, result) {
        if (err) reject(err);
        else resolve(result);
      });
      f.apply(null, args);
    });
  }
};

module.exports = {
  formatTime: formatTime,
  strToDate: strToDate,
  fromatISODate: fromatISODate,
  getMonthDay: getMonthDay,
  getHourMin: getHourMin,
  authAdminUser: authAdminUser,
  getWeekDay: getWeekDay,
  promisify: promisify
}