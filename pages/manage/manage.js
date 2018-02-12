const { AuthorIzation } = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    avatarUrl: '',
    manageConfig: [{
      text: '购物车',
      className: 'shopCartCon'
    }, {
      text: '优惠券',
      className: 'shopCartCon'
    }, {
      text: '联系客服',
      className: 'shopCartCon'
    }, {
      text: '购物车',
      className: 'shopCartCon'
    }, {
      text: '购物车',
      className: 'shopCartCon'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    AuthorIzation().then( res => {
      let name = '',
          path = ''
      if (res.errMsg.includes('getStorage:ok')){
        name = res.data.userInfo.nickName;
        path = res.data.userInfo.avatarUrl;
      } else if (res.errMsg.includes('getUserInfo:ok')){
        name = res.userInfo.nickName;
        path = res.userInfo.avatarUrl;
      };
      that.setData({
        nickName: name,
        avatarUrl: path
      }) 
    })
  },
  calling (){
    wx.makePhoneCall({
      phoneNumber: '4006360888',
    });
  },
  authorization (){
    this.onLoad();  
  }
})