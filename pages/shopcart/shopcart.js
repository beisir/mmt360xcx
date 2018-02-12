const { ajax, AuthorIzation, path, errImgEvent } = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    numble: true,
    shopCarList: [],  // 存储购物车列表
    statusList: [],
    startX: 0,  // 删除滑动距离
    delBtnWidth: 80,  // 删除按钮默认width 
    priceSum: 0,  // 价格总价
    all: false, // 全/不选状态
    complete: false,  // 编辑/完成 按钮状态 
    numArr: false,
    zation: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    let that = this;
    AuthorIzation().then(function () {
      let openid = app.globalData.openId.openid;
      that.setData({
        zation: true
      })
      that.getShopCarList(openid);
    }).catch(err => {
      wx.showModal({
        title: '提示',
        content: '您取消了授权不可做操作,点击确定重新授权',
        success (options){
          if (options.confirm){
            that.onLoad();
          };
        }
      });
    });
  },
  onShow (){
    let zation = this.data.zation;
    if (zation){
      let openid = app.globalData.openId.openid;
      let userInfo = wx.getStorageSync('userInfo'); 
      if (userInfo !== '') {
        this.getShopCarList(openid);
      }
    }
  },
  getShopCarList(openid){
    this.setData({
      all: false,
      complete: false,
      priceSum: 0,
      shopCarList: []
    });
    let that = this;
    ajax({ // 请求当前用户购物车数据
      url: path.shopcart.getAppShopList,
      data: {
        openid: openid
      }
    }).then(options => {
      if (options.appShopList && options.appShopList.length !== 0) {
        that.setData({
          shopCarList: options.appShopList,
          statusList: options.appShopList
        });
        that.shopOnReady();
      };
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  shopOnReady () {
    let that = this,
      $ = wx.createSelectorQuery();
    setTimeout(() => {  // 延时获删除按钮宽度 
      $.select(`.delregion`).boundingClientRect(function (res) {
        that.setData({
          delBtnWidth: res.width
        });
      }).exec();
    }, 1000);
  },
  // 删除开始
  startCar (e){
    //判断是否只有一个触摸点
    let complete = this.data.complete;    
    if (e.touches.length == 1 && complete) {
      this.setData({
        //记录触摸起始位置的X坐标
        startX: e.touches[0].clientX
      });
    }
  },
  deleteCar (e){
    let that = this,
      complete = this.data.complete;
    if (e.touches.length == 1 && complete) {
      //记录触摸点位置的X坐标
      var moveX = e.touches[0].clientX;
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值
      var disX = that.data.startX - moveX;
      //delBtnWidth 为右侧按钮区域的宽度
      var delBtnWidth = that.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        txtStyle = "0px";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        txtStyle = disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = delBtnWidth + "px";
        };
      }
      //获取手指触摸的是哪一个item
      var index = e.currentTarget.dataset.index;
      var list = that.data.shopCarList;
      //将拼接好的样式设置到当前item中
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        shopCarList: list
      });
    }
  },
  endCar (e) {
    var that = this
    let complete = this.data.complete;
    if (e.changedTouches.length == 1 && complete) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      var delBtnWidth = that.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? delBtnWidth + "px" : "0px";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = that.data.shopCarList;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      that.setData({
        shopCarList: list
      });
    }
  },
  // 删除数据按钮
  removeItem (e){
    let that = this,
      index = e.currentTarget.dataset.index,
      dataList = this.data.shopCarList;
    wx.showModal({
      title: '提示',
      content: '确定要删除',
      success (options){
        dataList[index].status = '0';
        if (!options.cancel){
          that.removeSendParam(dataList);
        } else {
          wx.showToast({
            title: '取消删除',
            icon: 'none'
          });
        };
      }
    });
  },
  removeSendParam (removeList){
    let that = this;
    let sendremoveList = removeList.filter(res => {
      if(res.status === '0'){
        return res;
      };
    });
    ajax({
      url: path.shopcart.updateAppShop,
      method: 'POST',
      data: {
        shopInfo: JSON.stringify(sendremoveList)
      }
    }).then(res => {
      // console.log(res);
      if (res.errcode === 0) {
        let newList = removeList.filter(res => {
          if (res.status !== '0'){
            return res;
          }  
        });
        that.setData({
          shopCarList: newList
        },()=>{
          wx.showToast({
            title: '删除成功'
          });
        });
        that.calculPrice();
      }
    })
  }, 
  toggerItem (e){
    let statusArr = [];
    let status = false;
    let that = this;
    let index = e.currentTarget.dataset.index,
        dataList = this.data.shopCarList;
    dataList[index].flag = !dataList[index].flag;
    dataList.forEach(result => {
      statusArr.push(result.flag);
    });
    if (statusArr.indexOf(true) === -1){
      status = false;
    } else if (statusArr.indexOf(false) === -1){
      status = true;  
    };
    this.setData({
      shopCarList: dataList,
      all: status
    },res => {
      that.calculPrice();
    });

  },
  calculPrice (){
    let dataList = this.data.shopCarList,
      sum = 0;
    dataList.forEach(item => {
      if (item.flag){
        let num = item.count,
          price = item.price;
          sum += num * price;
      }
    });
    console.log(sum);
    this.setData({
      priceSum: sum
    })
  },
  selectAll (){
    let allBle = this.data.all;
    let dataList = this.data.shopCarList;
        dataList.map(item => {
          return item.flag = !allBle;
        });
      this.setData({
        shopCarList: dataList,
        all: !allBle
      });
      this.calculPrice();
  },
  goDetail (e){
    let complete = this.data.complete;
    // console.log(e.currentTarget.dataset);
    let bcid = e.currentTarget.dataset.bcid;
    if (!complete){
      wx.navigateTo({
        url: `../detail/detail?bcid=${bcid}`
      });
    }
  },
  setComplete (){
    let complete = this.data.complete;
    this.setData({
      complete: !complete
    });
  },
  editComplete (){
    let that = this,
      complete = this.data.complete,
      dataList = this.data.shopCarList,
      numArr = this.data.numArr,
      statusList = this.data.statusList;
    dataList.map((res) => { res.txtStyle = 0 + 'px' });
    this.setData({
      shopCarList: dataList
    });
    if (!numArr) {
      this.setData({
        complete: !complete
      });
      return false;
    }
    let setNumList = dataList.filter((res,ind) => {
      if (res.count !== statusList[ind].count || res.status !== statusList[ind].status){
        return {
          count: res.count,
          id: res.id,
          status: '1'
        }
      }
    });
    let shopInfoString = JSON.stringify(setNumList);
    ajax({
      url: path.shopcart.updateAppShop,
      method: 'POST',
      data: {
        shopInfo: shopInfoString
      }
    }).then(res => {
      if (res.errcode === 0){
        that.setData({
          complete: !complete,
          numArr: false
        });
        that.calculPrice();
      }
    });
    
  },
  // 删除多个商品
  removeAll (){
    let dataList = this.data.shopCarList;
    // filter过滤被选中商品
    dataList.filter(item => {
      if (item.flag !== false){
        item.status = '0';
        return item;
      }
    });
    this.removeSendParam(dataList);
  },
  // 计算当前选中个数
  calculation (e){
    let dataList = this.data.shopCarList,
      dataset = e.currentTarget.dataset,
      index = dataset.index,
      status = dataset.status;
    let item = dataList[index];   
    status === 'add' ? dataList[index].count --  : dataList[index].count ++;
    dataList[index].count = dataList[index].count > 20 ? 20 : dataList[index].count;
    dataList[index].count = dataList[index].count < 1 ? 1 : dataList[index].count;
    this.setData({
      shopCarList: dataList,
      numArr: true
    });
  },
  // 结算按钮 发起微信支付
  submitOrder (){
    let userInfo = wx.getStorageSync('userInfo').userInfo,
      totalAmount = this.data.priceSum,
      openid = app.globalData.openId.openid,
      shopCarList = this.data.shopCarList;
    let setTlement = {
      source: 1,
      order: {
        openid: openid,
        headimg: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        totalAmount: totalAmount,
        appid: app.globalData.panyData.appid,
        imid: app.globalData.panyData.imid
      },
      proList: shopCarList
    };
    wx.navigateTo({
      url: `../confirmorder/confirmorder?order=${JSON.stringify(setTlement)}`
    });

    // ajax({
    //   url: path.shopcart.saveAppOrder,
    //   method: 'POST',
    //   data: {
    //     appOrderInfo: JSON.stringify(setTlement)
    //   }
    // }).then(result => {
    //   if (result.errcode === 0){
    //     wx.requestPayment({
    //       timeStamp: result.payInfo.timestamp,
    //       nonceStr: result.payInfo.noncestr,
    //       package: result.payInfo.wxpackage,
    //       signType: 'MD5',
    //       paySign: result.payInfo.paySign,
    //       success: function (res) {
    //         if (res.errMsg.includes('ok')){
    //           wx.showToast({
    //             title: '支付成功'
    //           });
    //           that.onShow();
    //         }
    //       },
    //       fail: function (res) {
    //         wx.showToast({
    //           title: '取消支付',
    //           icon: 'none'
    //         });
    //       }
    //     });
    //   } else {
    //     wx.showToast({
    //       title: '结算失败',
    //       icon: 'none'
    //     });
    //   }
    // });
    // console.log(setTlement)
  },
  onPullDownRefresh (){
    this.onShow();
    // shopOnReady
    this.calculPrice();
  }
})
