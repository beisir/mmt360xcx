const { ajax,errImg, path} = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * [data  进页面获取参数 订单参数 ]
   * [-------------------------------------------------]
   */
  data: {
    status: false,  // 控制当前地址是否显示
    address: '',  // 存储默认数据
    shopCarList: [],  // 存储确认订单数据列表
    order: {    // 订单参数
      appid: "",    // appid
      headimg: "",  // 买家头像
      imid: "",   // 卖家商户imid
      nickname: "", // 买家名字
      openid: "", // 买家唯一表示openid
      totalAmount: 0  // 商品总和
    },
    source: 0    // 区分来源  1是从购物车 ,0是从商机详情页
  },
  /**
   * [onLoad()  进页面获取参数 订单参数 ]
   * [options:{ string } 确认订单参数]
   * [-------------------------------------------------]
   */
  onLoad: function (options){
    // 如果参数存在，并且参数为字符串
    if (options && (typeof options.order) === 'string') { 
      let shopCarList = JSON.parse(options.order);  // 参数为JSON，转为object
      this.setData({    // 数据驱动页面更新
        shopCarList: shopCarList.proList,   // 订单列表
        order: shopCarList.order,   // 订单详情参数
        source: shopCarList.source  // 订单来源
      });
    }
  },
  /**
   * [calculation  点击加减号控制当前显示数量 ]
   * [ps： 只有立即购买的来源会出现加减操作，通常订单列表只有一个]
   * [-------------------------------------------------]
   */
  calculation: function (e) {
    let item = this.data.shopCarList[0],  // 获取订单数据
      totalAmount = this.data.order.totalAmount;  // 获取订单总价
    let dataset = e.currentTarget.dataset,  // 获取标签自定义属性参数
    status = dataset.status;    // 获取当前点击按钮为[ add 加  减]
    status === 'add' ? item.count-- : item.count++;   // 如果为加 则数量加一
    item.count = item.count < 1 ? 1 : item.count;     // 不小于1个
    totalAmount = item.count * item.price;    // 数量乘以价格获取总价
    this.setData({      
      shopCarList: [item],  // 存储数据，页面展示更新
      numArr: true,       // 
      'order.totalAmount': totalAmount  // 设置总价
    });
  },
  /**
   * [submitOrder  提交订单 ]
   * [-------------------------------------------------]
   */
  submitOrder (){
    // 结构：地址,商品列表，订单参数，来源
    let { address, shopCarList, order, source} = this.data,
      appid = this.data.order.appid;
    let setTlement = {    // 拼接参数发送后台
      order: order,
      proList: shopCarList,
      source: source
    };
    // 应为数据量有些大，发送后台参数为JSON字符串
    setTlement = JSON.stringify(setTlement);  
    if (address !== null){ // 如果地址不为空  ,则直接发送请求
      ajax({      
        url: path.shopcart.saveAppOrder,
        method: 'POST',
        data: {
          appOrderInfo: setTlement
        }
      }).then(result => { // 成功回调
        if (result.errcode === 0){
          // 结构返回参数
          let { timestamp, noncestr, wxpackage, paySign } = result.payInfo;
          // 唤起微信支付
          wx.requestPayment({     
            timeStamp: timestamp,
            nonceStr: noncestr,
            package: wxpackage,
            signType: 'MD5',
            paySign: paySign,
            success: function (res) {
              // 如果支付成功 发送推送消息模板
              let prepay_id = wxpackage.split('=')[1];
              if (res.errMsg.includes('ok')){
                // 支付成功之后通知后天发送模板推送消息
                ajax({
                  url: path.confirmorder.sendTemplateMessage,
                  data: {
                    orderCode: result.orderCode,  // 订单编号
                    appid: appid,   // 用户id
                    formid: prepay_id,  // 支付参数wxpackage 截取消息参数
                    sign: 0
                  }
                }).then(result => {
                  wx.showToast({
                    title: '支付成功'
                  });
                  // 推送模板消息之后跳转全部订单页面
                  wx.navigateTo({
                    url: '../myorder/myorder?order=1',
                  });
                });
              };
            },
            fail: function (res) {
              // console.log(res);
              wx.showToast({
                title: '支付失败',
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
      // 发起微信支付
    } else {
      wx.showToast({
        title: '请添加地址',
        icon: 'none'
      });
    }
  },
  /**
   * [onShow 页面显示执行 ]
   * [-------------------------------------------------]
   */
  onShow: function () {
    // 当页面显示 获取本地存储默认地址
    let address = wx.getStorageSync('address');
    let status = true;
    if (address === '') {
      status = false;
    };
    this.setData({
      address: address,
      status: status
    });
  }
})