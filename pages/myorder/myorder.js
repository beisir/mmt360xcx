// pages/myorder/myorder.js
let { ajax, path} = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderTabBar: [{
      text: '全部',
      event: 'wholeFn'
    }, {
      text: '待发货',
      event: 'deliveryFn'
    }, {
      text: '待收货',
      event: 'receiptFn'
    }, {
      text: '已完成',
      event: 'completeFn'
    }],
    curWidth: 0,
    activeIndex: 0,
    lateX: 0,
    orderlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let openId = app.globalData.openId;
    // console.log(options);
    this.setData({
      activeIndex: options.order,
      openId: openId
    });
    this.oderOnReady(options.order);
    this.getMyOder(options.order);
  },
  toggerFn (e){
    let index = e.currentTarget.dataset.index,
      left = e.target.offsetLeft;
    this.setData({
      activeIndex: index,
      lateX: left - 16
    });
    this.getMyOder(index);
  },
  getMyOder(index, pageNo){
    let openId = this.data.openId,
      that = this,
      result = {
        identity: openId.openid,
        pageNo: 1
      };
    if (index != 0) {
      result['status'] = index;
    };
    ajax({
      url: path.myoder.getAppOrderList,
      data: result
    }).then(res => {
      // console.log(res);
      if (res.errcode===0){
        // console.log(res.data.orderlist)
        that.setData({
          orderlist: res.data.orderlist
        });
      } else {
        that.setData({
          orderlist: []
        });
      };
    });
  },
  goOderDetail(e) {
    let orderCode = e.currentTarget.dataset.ordercode;
    wx.navigateTo({
      url: `../orderdetail/orderdetail?ordercode=${orderCode}`,
    });
  },
  confirmBtn(e) {
    let orderCode = e.currentTarget.dataset.ordercode;
    // console.log(orderCode);
    ajax({
      url: path.myorder.orderSendOrRec,
      data: {
        orderCode: orderCode,
        status: 3
      }
    }).then(result => {
      let that = this;
      let order = {
        order: that.data.activeIndex
      };
      if (result.errcode === 0) {
        wx.showToast({
          title: '收货成功',
          icon: 'none'
        });
        that.onLoad(order);
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  oderOnReady: function () {
    let that = this,
      $ = wx.createSelectorQuery(); // 获取选择dom对象
    let activeIndex = this.data.activeIndex;
    $.select(`#title${activeIndex}`).boundingClientRect(function (res) {
      that.setData({
        curWidth: res.width,
        lateX: res.left - 16
      });
    }).exec();
  }
})