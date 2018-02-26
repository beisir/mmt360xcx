let { ajax, path } = require('../../utils/util.js');
Page({
  /**
   * [orderdetail: data ]
   * [-------------------------------------------------]
   */
  data: {
    // 当前订单信息
    orderDetail: {}
  },
  /**
   * [onLoad(): options 订单orderCode 查询订单详情 ]
   * [-------------------------------------------------]
   */
  onLoad: function (options) {
    let that = this;
    ajax({
      url: path.orderdetail.getAppOrderDetail,
      data: {
        orderCode: options.orderCode
      }
    }).then( res => {
      if (res.errcode === 0){
        // console.log(res.data.orderDetail)
        that.setData({
          orderDetail: res.data.orderDetail
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
    });
  }
});