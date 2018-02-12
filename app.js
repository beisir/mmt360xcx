//app.js
const { AuthorIzation, ajax, userInfoFn ,path } = require('./utils/util.js');
App({
  onLaunch: function () {
    let that = this;
    this.getCompanyInfo();
    that.mmtLogin().then(res => {
      wx.setStorageSync('openId', res);
      that.globalData.openId = res;
      wx.showToast({
        title: '登陆成功',
        icon: 'none'
      });
      AuthorIzation().then(function (options){
        wx.showToast({
          title: '授权成功',
          icon: 'none'
        });
      }).catch(res => {
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
      });
    });
  },
  mmtLogin: function (){
    let panyData = this.globalData.panyData;
    return new Promise((resolve, reject)=>{
      let openid = wx.getStorageSync('openId');
      wx.login({
        success(res) {
          ajax({
            url: path.app.login,
            data: {
              jsCode: res.code,
              appid: panyData.appid
            }
          }).then(result => {
            if (result && result.openid){
              if (openid) {
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
          })
        }
      });
    });
  },
  getCompanyInfo: function () {
    let that = this;
    let panyData = this.globalData.panyData;
    ajax({
      url: path.app.getAppConfigInfo,
      data: { imid: panyData.imid }
    }).then(res => {
      this.globalData.mchid = res.appConfig.mchid;
      this.globalData.mmtInfo = res.appConfig;
    });
  },
  userInfoReadyCallback (callback){
    callback(this.globalData.panyData, this.globalData.mmtInfo, this.globalData.openId);
  },
  globalData: {
    userInfo: null,
    panyData: wx.getExtConfigSync(),
    mmtInfo: wx.getStorageSync('mmtInfo'),
    companyInfo: {},
    mchid: {},
    openId: {}
  }
})
