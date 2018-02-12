const { ajax,errImg, path} = require('../../utils/util.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: false,  // 控制当前地址是否显示
    address: null,  // 存储默认数据
    shopCarList: [],
    order: {
      appid: "",
      headimg: "",
      imid: "",
      nickname: "",
      openid: "",
      totalAmount: 0
    },
    setTlement: '',
    source: 0
  },
  onLoad: function (options){
    if (options && (typeof options.order) === 'string') {
      let shopCarList = JSON.parse(options.order);
      console.log(shopCarList);
      this.setData({
        setTlement: options.order,
        shopCarList: shopCarList.proList,
        order: shopCarList.order,
        source: shopCarList.source
      });
    }
  },
  /**
  * 点击加减号控制当前显示数量
  **/
  calculation: function (e) {
    let item = this.data.shopCarList[0],
      totalAmount = this.data.order.totalAmount;
    let dataset = e.currentTarget.dataset,
    status = dataset.status;
    status === 'add' ? item.count-- : item.count++;
    item.count = item.count > 20 ? 20 : item.count;
    item.count = item.count < 1 ? 1 : item.count;
    totalAmount = item.count * item.price;
    this.setData({
      shopCarList: [item],
      numArr: true,
      'order.totalAmount': totalAmount
    });
  },
  /**
  * 提交订单
  **/
  submitOrder (){
    let { address, shopCarList, order, source} = this.data;
    let setTlement = {
      order: order,
      proList: shopCarList,
      source: source
    };
    console.log(setTlement);
    setTlement = JSON.stringify(setTlement);

    if (address!== null){
      ajax({
        url: path.shopcart.saveAppOrder,
        method: 'POST',
        data: {
          appOrderInfo: setTlement
        }
      }).then(result => {
        console.log(result);
        if (result.errcode === 0){
          wx.requestPayment({
            timeStamp: result.payInfo.timestamp,
            nonceStr: result.payInfo.noncestr,
            package: result.payInfo.wxpackage,
            signType: 'MD5',
            paySign: result.payInfo.paySign,
            success: function (res) {
              if (res.errMsg.includes('ok')){
                wx.showToast({
                  title: '支付成功'
                });
                wx.navigateTo({
                  url: '../myorder/myorder?order=1',
                })

              }
            },
            fail: function (res) {
              wx.showToast({
                title: '取消支付',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '结算失败',
            icon: 'none'
          });
        }
      });
    // console.log(setTlement)
      // 发起微信支付
    } else {
      wx.showToast({
        title: '请添加地址',
        icon: 'none'
      });
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 当页面显示 获取本地存储默认地址
    let address = wx.getStorageSync('address');
    if (address !== '') {
      this.setData({
        address: address,
        status: true
      });
    };
  }
})