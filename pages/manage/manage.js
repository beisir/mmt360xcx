const app = getApp();
Page({
  /**
   * [data 页面初始默认值]
   * [-------------------------------------------------]
   */
  data: {
    nickName: '',
    avatarUrl: '',
    phoneNum: ''
  },
  /**
   * [calling() 客服电话]
   * [-------------------------------------------------]
   */
  calling (){
    let phoneNum = this.data.phoneNum;
    wx.makePhoneCall({
      phoneNumber: phoneNum,
    });
  },
  /**
   * [authorization() 点击头像区域重新授权]
   * [-------------------------------------------------]
   */
  onLoad (){
    let that = this;
    app.AppLogin().then(res => {
      // 设置头像 and 微信名称 
      that.setData({
        nickName: res.info.nickName,
        avatarUrl: res.info.avatarUrl,
        phoneNum: app.globalData.phoneNum
      });
    }).catch(err => {
      wx.showToast({
        title: err.errMsg,
        icon: 'none'
      });
    });
  }
})