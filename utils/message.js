const sendTemplateMessage = (openid, data, keyword, template_id, form_id, token) => {
  wx.request({
    url: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${token}`,
    method: 'POST',
    data: {
      touser: openid,
      template_id: template_id,
      form_id: form_id,
      data: data,
      emphasis_keyword: keyword
    }
  });
}

export default sendTemplateMessage
