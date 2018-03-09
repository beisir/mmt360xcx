const { ajax, path} = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * [myorder data 初始数据 ]
   * [-------------------------------------------------]
   */
  data: {
    // orderTabBar tab标签文字
    orderTabBar: [{
      text: '全部'
    }, {
      text: '待发货'
    }, {
      text: '待收货'
    }, {
      text: '已完成'
    }],
    activeIndex: 0, // 当前切换cur 默认下标
    orderlist: [],  // 存储当前订单列表
    openid: null, // 买家id
    pageNo: 1  // 上拉加载数据 分页 默认值
  },
  /**
   * [onLoad() 获取options参数判断当前请求哪个tab数据 ]
   * [options: {order: [0=全部,1=待发货,2=待收货,3=已完成] } ]
   * [-------------------------------------------------]
   */
  onLoad: function (options) {
    wx.removeStorageSync('newAddress');
    let openid = app.globalData.openid, // 买家id
      appid = app.globalData.panyData.appid;  // 商户id
    this.setData({
      activeIndex: options.order, // 设置cur为传入参数 order， 显示在哪个tab之下
      openid: openid,
      appid: appid
    });
    // console.log(options.order)
  },
  onShow(){
    // 请求某个订单{order=..}数据,设置分页默认为1页
    let order = this.data.activeIndex,
      that = this;
    this.setData({
      orderlist:[]
    }, res => {
      that.getMyOder(order, 1);
    });
  },
  /**
   * [toggerFn() 点击tab进行切换cur 事件，并请求对应的数据 ]
   * [{options.order: String(0=全部,1=待发货,2=待收货,3=已完成) } ]
   * [-------------------------------------------------]
   */
  toggerFn (e){
    let index = e.currentTarget.dataset.index,  // 当前点击tab下标
      left = e.target.offsetLeft; // 当前元素距离左边边界距离
    this.setData({  
      activeIndex: index,   // 设置当前cur
      lateX: left - 16,  // 设置滑动距离
      orderlist: [],  // 清空订单数据列表
      pageNo: 1   // 分页设置默认
    });
    this.getMyOder(index,1);  // 请求订单数据
  },
  /**
   * [getMyOder() 请求订单数据列表 ]
   * [{index: String(0=全部,1=待发货,2=待收货,3=已完成'), pageNo: Number(分页页数) } ]
   * [-------------------------------------------------]
   */
  getMyOder(index, pageNo){
    let that = this, 
      openid = this.data.openid; 
    // 请求订单数据参数 
    let result = {
      identity: openid,
      pageNo: pageNo
    };
    // 当订单数据 全部 [ps:status=0]时，不需要传递status参数
    if (index != 0) {
      result['status'] = index;
    };
    ajax({
      url: path.myoder.getAppOrderList,
      data: result
    }).then(res => {
      // console.log(res);
      if (res.errcode===0){
        if (res.data.orderlist.length !== 0){
          // 将每次请求成功获取订单数据Array拼接在原有订单数组之后 页面显示上拉加载
          let orderlist = that.data.orderlist; 
          that.setData({
            orderlist: orderlist.concat(res.data.orderlist),
            pageNo: pageNo  
          });
        } else {
          wx.showToast({
            title: '没有更多了...',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        });
      };
    });
  },
  /**
   * [goOderDetail() 点击订单数据前往订单详情页面 ]
   * [-------------------------------------------------]
   */
  goOderDetail(e) {
    let orderCode = e.currentTarget.dataset.ordercode;
    wx.navigateTo({
      url: `../orderdetail/orderdetail?orderCode=${orderCode}`
    });
  },
  /**
   * [formSubmit() 点击收货按钮，同时收货之后，让后台发送模板消息需要参数 ]
   * [-------------------------------------------------]
   */
  formSubmit (e){
    // 收货按钮提交form表单 同时获取 订单id ordercode， formId
    let orderCode = e.currentTarget.dataset.ordercode,
      formId = e.detail.formId,
      appid = this.data.appid;
    let that = this;  
    wx.showModal({
      title: '提示',
      content: '确认已收到商品吗？',
      success (options){
        if (options.confirm){
          ajax({
            url: path.myoder.orderSendOrRec,  //
            data: {
              orderCode: orderCode,
              status: 3
            }
          }).then(result => {
            if (result.errcode === 0) {
              let activeIndex = that.data.activeIndex;
              that.setData({
                orderlist: []
              });
              that.getMyOder(activeIndex, 1);
              // 收货成功之后再次发送 formid 发送收货成功的模板消息
              ajax({
                url: path.confirmorder.sendTemplateMessage,
                data: {
                  orderCode: orderCode,
                  appid: appid,
                  formid: formId,
                  sign: 1
                }
              }).then(params => {
                console.log(params);
              })
            }
          })
        };
      }
    })
    
  },
  /**
   * [onReachBottom() 上拉加载]
   * [-------------------------------------------------]
   */
  onReachBottom: function () {
    let index = this.data.activeIndex,
      pageNo = this.data.pageNo;
      pageNo += 1;
    this.getMyOder(index, pageNo);
  },
})