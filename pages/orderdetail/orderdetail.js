let { ajax, path } = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderDetail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    let that = this;
    ajax({
      url: path.orderdetail.getAppOrderDetail,
      data: {
        orderCode: options.ordercode
      }
    }).then( res => {
      if (res.errcode === 0){
        that.setData({
          orderDetail: res.data.orderDetail
        });
      }
      
      // console.log(res)
    })
  }
})