let { ajax, path } = require('../../utils/util.js');
Page({
  /**
   * [orderdetail: data ]
   * [-------------------------------------------------]
   */
  data: {
    // 当前订单信息
    orderDetail: {},
    orderCode: '',
    AmoutSum: 0,
    totalAmout: 0
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
        // console.log(res)
        that.setData({
          orderDetail: res.data.orderDetail,
          orderCode: options.orderCode
        });
        that.getAmoutSum(res.data.orderDetail);
      }
    }).catch(err => {
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      });
    });
  },
  getAmoutSum(orderDetail){
    let prodList = orderDetail.prodList,
      orderFareAmount = orderDetail.order.orderFareAmount,
      orderTotalAmout = orderDetail.order.orderTotalAmout;
    let sum = 0;
    prodList.map(item => {
      sum += item.bcNumber * item.bcUnitPrice;
    });
    this.setData({
      AmoutSum: sum,
      totalAmout: orderFareAmount + orderTotalAmout
    });
  },
  /**
   * [formSubmit() 点击收货按钮，同时收货之后，让后台发送模板消息需要参数 ]
   * [-------------------------------------------------]
   */
  formSubmit(e) {
    // 收货按钮提交form表单 同时获取 订单id ordercode， formId
    let orderCode = this.data.orderCode,
      formId = e.detail.formId;
    // console.log(orderCode,formId);
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认已收到商品吗？',
      success(options) {
        if (options.confirm) {
          ajax({
            url: path.myoder.orderSendOrRec,  //
            data: {
              orderCode: orderCode,
              status: 3
            }
          }).then(result => {
            if (result.errcode === 0) {
              let activeIndex = that.data.activeIndex;
              // 收货成功之后再次发送 formid 发送收货成功的模板消息
              ajax({
                url: path.confirmorder.sendTemplateMessage,
                data: {
                  orderCode: orderCode,
                  formid: formId,
                  sign: 1
                }
              }).then(params => {
                that.onLoad({
                  orderCode: orderCode
                });
              });
            }
          })
        };
      }
    })

  }
});