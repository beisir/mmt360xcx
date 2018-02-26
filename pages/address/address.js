let app = getApp();
const { ajax, path} = require('../../utils/util.js');
Page({
  /**
   * [address： data 初始默认值 ]
   * [-------------------------------------------------]
   */
  data: {
    addressList: [],  // 地址列表默认参数
    openid: null
  },
  /**
   * [onLoad: 获取登录信息 openid ]
   * [-------------------------------------------------]
   */
  onLoad: function () {
    let that = this;
    app.AppLogin().then(res => {
      this.setData({
        openid: res.openid
      });
      that.getAddress();
    }).catch(err => {
      wx.showToast({
        title: err.errMsg,
        icon: 'none'
      })
    });
  },
  getAddress (){
    let that = this,
      openid = this.data.openid;
    ajax({  // 请求地址列表
      url: path.address.address + openid
    }).then(options => {
      if (options.length != 0) {
        options.forEach(item => { // 遍历地址列表选择默认地址存入缓存
          if (item.status) {
            wx.setStorageSync('address', item);
          };
        });
      } else {
        wx.showToast({
          title: '暂无地址',
          icon: 'none'
        });
        wx.removeStorageSync('address');
        options = [];
      };
      // 显示地址视图
      that.setData({
        addressList: options
      });
    });
  }, 
  /**
   * [addAddress: 获取添加地址权限 ]
   * [-------------------------------------------------]
   */
  addAddress: function (){
    let that = this;
    wx.getSetting({     // 检测是否授权地址权限
      success(res) {
        // 如果地址权限不同意授权
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success(options) {
              if (options.errMsg.includes('ok')){
                that.addressInfo(); // 调用微信地址授权框
              };
            }
          })
        } else {
          that.addressInfo();
        }
      }
    });
  },
  /**
   * [addressInfo: 获取添加地址授权信息 ]
   * [-------------------------------------------------]
   */
  addressInfo (){
    let that = this,
      openid = this.data.openid;
    // 获取地址列表
    let addressList = this.data.addressList;
    wx.chooseAddress({
      success(options) {
        let addressList = that.data.addressList;
        // 拼接地址参数
        let addressOptions = {
          openid: openid,
          address: encodeURIComponent(`${options.provinceName}${options.cityName}${options.countyName}${options.detailInfo}`),
          userName: encodeURIComponent(options.userName),
          telNumber: options.telNumber,
          status: addressList.length ? 0 : 1
        };
        // 循环遍历 检测添加地址是否存在
        if (addressList.length!=0){
          let isrepeat = addressList.map((res) => {
            let address = decodeURIComponent(addressOptions.address),
              userName = decodeURIComponent(addressOptions.userName);
              return res.address == address && res.userName == userName && res.telNumber == addressOptions.telNumber 
            });
          if (isrepeat.indexOf(true)===-1){
            that.setAddress(addressOptions);
          } else {
            wx.showToast({
              icon: 'none',
              title: '不能重复添加'
            });
          }
        } else {
          // 否则设置地址
          that.setAddress(addressOptions);
        }
      }
    });
  },
  /**
   * [setAddress: 设置地址参数 ]
   * [params(addressOptions: 不在已有地址列表之内的新地址 ) ]
   * [-------------------------------------------------]
   */
  setAddress(addressOptions){
    let that = this;
    let addressList = this.data.addressList;
    // 发送到后台存储
    ajax({
      url: path.address.saveorupdate,
      data: addressOptions
    }).then(params => {
      if (!params.errcode){
        // 后台存储成功之后 在页面显示新添加大致
        let result = {
          openid: addressOptions.openid,
          address: decodeURIComponent(addressOptions.address),
          userName: decodeURIComponent(addressOptions.userName),
          telNumber: addressOptions.telNumber,
          status: 1
        };
        // 刷新地址列表视图
        that.getAddress();
        // 将新添加地址作为默认地址存储在缓存
        if (!addressList.length){
          wx.setStorageSync('address', result);
        };
      };
    });
  },
  /**
   * [dleAddress: 删除地址事件 ]
   * [-------------------------------------------------]
   */
  dleAddress (e){
    let that = this;
    let index = e.currentTarget.dataset.index,
      dataList = this.data.addressList;
    let openid = this.data.openid;
    let options = dataList[index];
    wx.showModal({
      title: '提示',
      content: '是否删除该地址',
      success(confirm) {
        if (confirm.confirm){
          ajax({
            url: path.address.addressdel + options.id,
            data: {
              openid: openid
            }
          }).then(res => {
            if (!res.errcode){
              wx.showToast({
                title: '删除成功',
                icon: 'none'
              });
              that.getAddress();
            };
          });
        }
      }
    });  
  },
  /**
   * [selectChoice: 选择默认地址事件 ]
   * [-------------------------------------------------]
   */
  selectChoice (e){
    let that = this,
      index = e.currentTarget.dataset.index,
      dataList = this.data.addressList,
      openid = this.data.openid,
      optParmas = dataList[index];
    ajax({
      url: path.address.saveorupdate,
      data: {
        openid: openid,
        id: optParmas.id,
        status: 1
      }
    }).then(function (params){
      if (!params.errcode){
        that.getAddress();
        wx.setStorageSync('address', optParmas);
      }
      
    });
  },
  goback (){
    wx.navigateBack();
  }
})