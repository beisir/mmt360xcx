/**
 * [http() 封装 工具函数,ajax 请求 ]
 * [{params: Object(url.. data.. 等参数)}]
 * [-------------------------------------------------]
 */
const http = function (params){
  return new Promise(function (resolve, reject){
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
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
        wx.hideLoading();
      }
    });
  });
}

/**
 * [userInfo() 获取微信授权信息 ]
 * [{callback: Function(获取成功回调)}]
 * [-------------------------------------------------]
 */

function userInfo(callback) {
  let _this = this;
  // 微信内置方法 获取用户授权信息确认框
  wx.getUserInfo({
    success: function (opt) {
      // 当用户同意授权之后缓存用户信息
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

/**
 * [AuthorIzation() 检测当前用户是否已经授权 ]
 * [-------------------------------------------------]
 */

function AuthorIzation(){
  return new Promise(function (resolve, reject){
    let that = this;
    // 微信内置方法,检测是否授权
    wx.getSetting({
      success(res) {
        // 如果授权之后 res.authSetting['scope.userInfo']
        // 返回值为undefined : 证明没有拉起过授权框， true: 证明已经受过权
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
          // 否则需要以另一种方式重新拉起授权
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
            fail: function (err){
              wx.showModal({
                title: '提醒您',
                content: '您取消了授权不可做操作'
              });
              reject(err);
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
const extJSON = wx.getExtConfigSync();
console.info(extJSON)
let hostname = 'https://madata.hc360.com/mobileapp';
// let hostname = 'https://testwx.hc360.com/mobileapp';
const config = {
  detail: `${hostname}/busin/list/${extJSON.imid}`
}
const httpPath = {
  app: {
    login: `${hostname}/index/login?appid=${extJSON.appid}`, // 登陆
    getAppConfigInfo: `${hostname}/wx/getAppConfigInfo?imid=${extJSON.imid}` // 获取公司信息以及是否显示价格
  },
  index: {
    recommend: `${hostname}/busin/recommend/${extJSON.imid}`,  // 获取首页数据
    list: `${hostname}/busin/list/${extJSON.imid}` // 搜索接口以及 首页最新产品
  },
  myoder: {
    getAppOrderList: `${hostname}/order/getAppOrderList?sign=1`,  // 我的订单 订单列表
    getAppOrderDetail: `${hostname}/order/getAppOrderDetail`,  // 订单详情
    orderSendOrRec: `${hostname}/order/orderSendOrRec`
  },
  proclass: {
    shopseries: `${hostname}/transfer/shopseries/?imid=${extJSON.imid}`
  },
  address: {
    address: `${hostname}/address/list/`, // 获取地址列表
    saveorupdate: `${hostname}/address/saveorupdate`, // 更新地址 设置默认
    addressdel: `${hostname}/address/delete/` // 删除地址
  },
  detail: {
    // busindetail: `${hostname}//transfer/busindetail`, // 图文详情接口
    busindetail: `https://wsdetail.b2b.hc360.com/XssFilter`, // 图文详情接口
    // supply: `${hostname}/transfer/supply`,  // 产品参数
    supply: `https://wsdetail.b2b.hc360.com/xcx/supply/`,  // 产品参数
    saveAppShop: `${hostname}/appShop/saveAppShop`
  },
  orderdetail: {
    getAppOrderDetail: `${hostname}/order/getAppOrderDetail` // 
  },
  shopcart: {
    getAppShopList: `${hostname}/appShop/getAppShopList`, // 获取购物车列表
    updateAppShop: `${hostname}/appShop/updateAppShop`, // 修改更新购物车
    saveAppOrder: `${hostname}/order/saveAppOrder`  // 发起订单
  },
  confirmorder: {
    sendTemplateMessage: `${hostname}/appManager/sendTemplateMessage`
  }
}
module.exports = {
  ajax: http,
  AuthorIzation: AuthorIzation,
  userInfoFn: userInfo,
  extJSON: extJSON,
  path: httpPath,
  errImg: 'https://style.org.hc360.com/images/microMall/program/proGimg.png'
}
