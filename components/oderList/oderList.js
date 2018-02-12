let {ajax } = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    confirm: {
      type: Boolean,
      value: false
    },
    orderlist: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goOderDetail(e) {
      console.log(this);
      // let orderCode = e.currentTarget.dataset.ordercode;
      // wx.navigateTo({
      //   url: `../orderdetail/orderdetail?ordercode=${orderCode}`,
      // });
    },
    confirmBtn (e){
      let orderCode = e.currentTarget.dataset.ordercode;
      console.log(orderCode);
      ajax({
        url: 'http://testwx.mdata.hc360.com/mobileapp/order/orderSendOrRec',
        data: {
          orderCode: orderCode,
          status: 3  
        }
      }).then(result => {
        if (result.errcode === 0){
          wx.showToast({
            title: '收货成功',
            icon: 'none'
          });
        }
      })
    }
  }
})
