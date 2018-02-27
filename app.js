const { AuthorIzation, ajax, userInfoFn ,path } = require('./utils/util.js');
App({
  /**
   * [onLaunch 小程序初次打开页面 钩子函数 ]
   * [-------------------------------------------------]
   */
  onLaunch: function () {
    let that = this;
    /**
     * [getCompanyInfo() 封装 登陆 and 获取授权 ]
     * [-------------------------------------------------]
     */
    this.getCompanyInfo(function (){
      that.AppLogin().then(res => {
        // console.log(res);
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        });
      }).catch(err => {
        // console.log(err);
      });
    });
  },
  /**
   * [AppLogin 封装 检测当前用户是否登陆成功 and 授权成功 ]
   * [-------------------------------------------------]
   */
  AppLogin (){
    let that = this;
    let openid = wx.getStorageSync('openId');     // 获取当前缓存openid
    // console.log(openid);
    let panyData = this.globalData.panyData;      // 获取公司信息
    return new Promise(function (resolve,reject){
      if (openid && openid.openid){       // 如果缓存openid存在 证明已经登陆成功,直接检测是否授权
        // console.log('已经登陆过，检测是否授权')    
        AuthorIzation().then(function (options) {   // 授权回调成功
          // console.log(options);
          that.globalData.openid = openid.openid;
          resolve({
            info: options.userInfo,
            errMsg: '授权成功',
            openid: openid.openid,  // 返回openid 以及授权成功信息
            errcode: true
          });
        }).catch(res => { //授权失败返回失败信息
          // console.log(res);
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          });
          reject({
            errMsg: '授权失败',
            errcode: false
          })
        });
      } else {   // 否则未曾登陆 重新登陆
        // console.log('重新登陆')
        that.mmtLogin().then(res => {
          wx.setStorageSync('openId', res); // 缓存登录信息
          that.globalData.openId = res;
          console.log('登陆成功')
          AuthorIzation().then(function (options) {   // 重新授权
            that.globalData.openid = openid.openid;
            console.log('授权成功')
            resolve({
              info: options.userInfo,
              openid: res.openid,
              errMsg: '授权成功',
              errcode: true
            });
          }).catch(res => {
            console.log(res);
            wx.showToast({
              title: '授权失败',
              icon: 'none'
            });
            reject({
              errMsg: '授权失败',
              errcode: false
            })
          });
        }).catch(err => {
          // console.log(err);
          reject({
            errMsg: '登陆失败',
            errcode: false
          });
        });
      }
    }) 
  },
  /**
   * [mmtLogin 封装 当前用户登陆信息 ]
   * [-------------------------------------------------]
   */
  mmtLogin: function (){
    let panyData = this.globalData.panyData;  // 获取公司信息
    return new Promise((resolve, reject)=>{
      let openid = wx.getStorageSync('openId'); // 获取缓存openid
      wx.login({      // 登陆获取openid
        success(res) {
          ajax({
            url: path.app.login,
            data: {
              jsCode: res.code,
              appid: panyData.appid
            }
          }).then(result => {
            if (result && result.openid){
              if (openid && openid.openid) {
                if (result.session_key === openid.session_key) {
                  resolve(result);
                } else {
                  resolve(result);
                  userInfoFn(function (options) {
                  });
                }
              } else {
                resolve(result);
              }
            } else {
              wx.showToast({
                title: '登陆失败',
                icon: 'none'
              }); 
              reject({
                errMsg: '登录失败'
              })
            } 
          }).catch(err => {
            reject({
              errMsg: '登录失败'
            })
          });
        }
      });
    });
  },
  /**
   * [getCompanyInfo 封装 获取当前商铺 公司信息 ]
   * [{callback : Function （获取成功回调）}]
   * [-------------------------------------------------]
   */
  getCompanyInfo: function (callback) { 
    let that = this,
      mmtInfo = this.globalData.mmtInfo;
    if (mmtInfo){
      callback(mmtInfo)
    } else {
      ajax({
        url: path.app.getAppConfigInfo
      }).then(res => {
        that.globalData.mchid = res.appConfig.mchid;
        that.globalData.mmtInfo = res.appConfig;
        callback(res.appConfig);
      });
    }
  },
  userInfoReadyCallback (callback){
    let that = this;
    this.getCompanyInfo(function (opt){
      callback(that.globalData.panyData, opt, that.globalData.openId);
    });
  },
  globalData: {
    userInfo: null, // 微信登陆用户信息
    panyData: wx.getExtConfigSync(), // extJSON 第三方模板参数
    mmtInfo: wx.getStorageSync('mmtInfo'),  // 微信登陆用户信息
    companyInfo: {}, // 储存公司信息
    mchid: {},  // 公司是否支持mchid 信息
    openid: {}  
  }
})
