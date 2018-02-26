const app = getApp();
Page({
  /**
   * [data 页面初始默认值]
   * [-------------------------------------------------]
   */
  data: {
    nickName: '',
    avatarUrl: ''
  },
  /**
   * [onLoad() 获取登陆授权]
   * [-------------------------------------------------]
   */
  onLoad: function (options) {
    let that = this;
    app.AppLogin().then(res => {
      // 设置头像 and 微信名称 
      that.setData({
        nickName: res.info.nickName,
        avatarUrl: res.info.avatarUrl
      });
    }).catch(err => {
      wx.showToast({
        title: err.errMsg,
        icon: 'none'
      });
    });
  },
  /**
   * [calling() 客服电话]
   * [-------------------------------------------------]
   */
  calling (){
    wx.makePhoneCall({
      phoneNumber: '400-6360-888',
    });
  },
  /**
   * [authorization() 点击头像区域重新授权]
   * [-------------------------------------------------]
   */
  authorization (){
    this.onLoad();  
  }
})