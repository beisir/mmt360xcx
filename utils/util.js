const http = function (params){
  return new Promise(function (resolve, reject){
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 5000,
      mask: true
    })
    // wx.showLoading({
    //   title: '正在加载...',
    //   mask: true,
    //   duration: 2000
    // });
    wx.request({
      method: params.method || 'GET',
      url: params.url,
      data: params.data || {},
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (options){
        let result = options.data;
        resolve(result);
        wx.hideToast();
      },
      fail: function (err){
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
        reject(err);
        wx.showModal({
          title: '警告',
          content: `接口请求失败,错误${JSON.stringify(err)}`,
        })
      },
      complete: function (){
       
        // wx.hideLoading();
        
      }
    });
  });
}

function userInfo(callback) {
  let _this = this;
  wx.getUserInfo({
    success: function (opt) {
      if (opt.errMsg.includes('ok')) {
        wx.setStorageSync('userInfo', opt);
        callback(opt);
      }
    },
    fail: function () {
      callback({
        errMsg: '取消授权'
      });
    },complete: function (){
      wx.hideLoading();      
    }
  });
}
function AuthorIzation(){
  return new Promise(function (resolve, reject){
    let that = this;
    wx.getSetting({
      success(res) {
        let scopeUserInfo = res.authSetting['scope.userInfo'];
        if (scopeUserInfo === undefined || scopeUserInfo === true) {
          userInfo(result =>{
            if (result.errMsg.includes('ok')){
              resolve(result);
            } else {
              reject(result);
            }
          });
        } else {
          wx.openSetting({
            success: function (options) {
              userInfo(result => {
                if (result.errMsg.includes('ok')) {
                  resolve(result);
                } else {
                  reject(result);
                }
              });
            },
            fail: function (){
              wx.showModal({
                title: '提醒您',
                content: '您取消了授权不可做操作'
              });
            }
          });
        }
      },
      fail: function (err){
        wx.showModal({
          title: '提示',
          content: '获取授权失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};
const errImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAAFeCAIAAAE1TtDbAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3ZTM5Nzg5My0zYTI1LTliNGYtYmU5ZC0xZDAwYWMyODQ3ZWMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODhDQUVDREIwQkVEMTFFOEIxNEFCMzgyQjMxRjhEMjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODhDQUVDREEwQkVEMTFFOEIxNEFCMzgyQjMxRjhEMjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjEyOTU3NzIwLTczNmItNjM0Mi05ZmFiLTg2M2U1YThlZTZhMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3ZTM5Nzg5My0zYTI1LTliNGYtYmU5ZC0xZDAwYWMyODQ3ZWMiLz4gPC9y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';

const extJSON = wx.getExtConfigSync();
let hostname = 'https://testwx.hc360.com/mobileapp';
const config = {
  detail: `${hostname}/busin/list/${extJSON.imid}`
}
const httpPath = {
  app: {
    login: `${hostname}/index/login`, // 登陆
    getAppConfigInfo: `${hostname}/wx/getAppConfigInfo` // 获取公司信息以及是否显示价格
  },
  index: {
    recommend: `${hostname}/busin/recommend/`,  // 获取首页数据
    list: `${hostname}/busin/list/` // 搜索接口以及 首页最新产品
  },
  myoder: {
    getAppOrderList: `${hostname}/order/getAppOrderList?sign=1`,  // 我的订单 订单列表
    getAppOrderDetail: `${hostname}/order/getAppOrderDetail`,  // 订单详情
    orderSendOrRec: `${hostname}/order/orderSendOrRec`
  },
  proclass: {
    // shopseries: `http://wsdetail.b2b.hc360.com/xcx/shopseries/` // 分类数据接口
    shopseries: `${hostname}/transfer/shopseries/`
  },
  address: {
    address: `${hostname}/address/list/`, // 获取地址列表
    saveorupdate: `${hostname}/address/saveorupdate`, // 更新地址 设置默认
    addressdel: `${hostname}/address/delete/` // 删除地址
  },
  detail: {
    
    busindetail: `${hostname}//transfer/busindetail`, // 图文详情接口
    // busindetail: `https://wsdetail.b2b.hc360.com/XssFilter`, // 图文详情接口
    supply: `${hostname}/transfer/supply`,  // 产品参数
    saveAppShop: `${hostname}/appShop/saveAppShop`
  },
  orderdetail: {
    getAppOrderDetail: `${hostname}/order/getAppOrderDetail` // 
  },
  shopcart: {
    getAppShopList: `${hostname}/appShop/getAppShopList`, // 获取购物车列表
    updateAppShop: `${hostname}/appShop/updateAppShop`, // 修改更新购物车
    saveAppOrder: `${hostname}/order/saveAppOrder`  // 发起订单
  }
}
module.exports = {
  ajax: http,
  AuthorIzation: AuthorIzation,
  userInfoFn: userInfo,
  extJSON: extJSON,
  path: httpPath,
  // errImg: 'https://style.org.hc360.com/images/microMall/program/proGimg.png'
  errImg: errImg
}
