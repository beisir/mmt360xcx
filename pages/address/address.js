let app = getApp();
const { ajax, path} = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bcid: null,
    addressList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this,
      openId = app.globalData.openId
    this.setData({
      openId: openId
    });
    ajax({
      url: path.address.address + openId.openid
    }).then(options => {
      if (options.length != 0) {
        options.forEach(item =>{
          if (item.status){
            wx.setStorageSync('address',item);  
          }
        });
        that.setData({
          addressList: options
        });
      };
    });
  },
  addAddress: function (){
    let that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success(options) {
              if (options.errMsg.includes('ok')){
                that.addressInfo();
              };
            }
          })
        } else {
          that.addressInfo();
        }
      }
    });
  },
  addressInfo (){
    let that = this,
      openId = this.data.openId;
    let addressList = this.data.addressList;
    wx.chooseAddress({
      success(options) {
        let addressList = that.data.addressList;
        let addressOptions = {
          openid: openId.openid,
          address: encodeURIComponent(`${options.provinceName}${options.cityName}${options.countyName}${options.detailInfo}`),
          userName: encodeURIComponent(options.userName),
          telNumber: options.telNumber,
          status: addressList.length ? 0 : 1
        };
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
          that.setAddress(addressOptions);
        }
      }
    });
  },  
  setAddress(addressOptions){
    let that = this;
    let addressList = this.data.addressList;
    ajax({
      url: path.address.saveorupdate,
      data: addressOptions
    }).then(params => {
      if (!params.errcode){
        let result = {
          openid: addressOptions.openid,
          address: decodeURIComponent(addressOptions.address),
          userName: decodeURIComponent(addressOptions.userName),
          telNumber: addressOptions.telNumber,
          status: 1
        };
        that.onLoad();
        if (!addressList.length){
          wx.setStorageSync('address', result);
        };
      };
    });
  },
  dleAddress (e){
    let that = this;
    let index = e.currentTarget.dataset.index,
      dataList = this.data.addressList;
    let options = dataList[index];  
    ajax({
      url: path.address.addressdel + options.id
    }).then(res => {
      if (!res.errcode){
        that.onLoad();
      }
    });
  },
  selectChoice (e){
    let that = this,
      index = e.currentTarget.dataset.index,
      dataList = this.data.addressList,
      openId = this.data.openId,
      optParmas = dataList[index];
    ajax({
      url: path.address.saveorupdate,
      data: {
        openid: openId.openid,
        id: optParmas.id,
        status: 1
      }
    }).then(function (params){
      if (!params.errcode){
        that.onLoad();
        wx.setStorageSync('address', optParmas);
      }
      
    });
  },
  editAddress (e){
    // console.log(e);
  },
  goback (){
    wx.navigateBack();
  }
})