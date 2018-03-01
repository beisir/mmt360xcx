const { ajax, AuthorIzation, path, errImgEvent } = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * [shopcart  购物车初始值 ]
   * [-------------------------------------------------]
   */
  data: {
    // numble: true, 
    shopCarList: [],  // 存储购物车列表
    statusList: [],
    startX: 0,  // 删除滑动距离
    delBtnWidth: 80,  // 删除按钮默认width 
    priceSum: 0,  // 价格总价
    all: false, // 全/不选状态
    complete: false,  // 编辑/完成 按钮状态 
    numArr: false,  // 记录在编辑下 是否进行修改的状态
    zation: false,  // 应为每次都需要刷新购物车所以，第一次进入页面不需要刷新  作为onShow第一次的开关
    openid: null  
  },
  /**
   * [onLoad() 检测当前是否登陆授权 ]
   * [-------------------------------------------------]
   */
  onLoad () {
    let that = this;
    app.AppLogin().then(res => {
      // 授权成功
      that.setData({
        zation: true, // 将onShow状态置为true
        openid: res.openid    
      });
      // 获取购物车列表
      that.getShopCarList(res.openid);
    }).catch(err => {
      // 如果取消授权 提示不可操作 ，点击确定重新授权
      wx.showModal({
        title: '提示',
        content: '授权失败,点击确定重新授权',
        success (options){
          if (options.confirm){
            that.onLoad();
          };
        }
      });
    });
  },
  /**
   * [onShow() 每次进入页面刷新购物车数据列表 ]
   * [-------------------------------------------------]
   */
  onShow (){
    // 查看是否是第一次进入购物车
    let zation = this.data.zation;  
    if (zation){
      let openid = this.data.openid,
        userInfo = wx.getStorageSync('userInfo'); 
      // 判断是否有用户信息  
      if (userInfo !== '') {
        this.getShopCarList(openid);
      }
    }
  },
  /**
   * [getShopCarList() 请求购物车数据列表 ]
   * [openid: { 用户id}]
   * [-------------------------------------------------]
   */
  getShopCarList(openid){
    // 每次请求购物车数据之前将所有状态置为默认
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
      // 如果购物车数据不为空 将数据进行存储
      if (options.appShopList && options.appShopList.length !== 0) {
        that.setData({
          shopCarList: options.appShopList, // 存储购物车数据 [ps: '存储的数据会变化']
          statusList: options.appShopList   // 存储购物车初始数据 [ps: '存储的数据不会变化，用来和变化数据作对比操作']
        });
        // 当数据加载完成之后获取删除按钮的width
        that.shopOnReady();
      };
    });
  },
  /**
   * [shopOnReady() 获取当前删除按钮width ]
   * [-------------------------------------------------]
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
  /**
   * [startCar() 删除事件 当手指按下屏幕记录坐标 ]
   * [-------------------------------------------------]
   */
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
  /**
   * [deleteCar() 滑动删除参数]
   * [-------------------------------------------------]
   */
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
  /**
   * [endCar() 滑动停止 手指离开屏幕，记录位置]
   * [-------------------------------------------------]
   */
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
  /**
   * [removeItem() 点击删除按钮]
   * [-------------------------------------------------]
   */
  removeItem (e){
    let that = this,
      index = e.currentTarget.dataset.index,
      dataList = this.data.shopCarList;
      // 提示是否要删除
    wx.showModal({
      title: '提示',
      content: '确定要删除',
      success (options){
        // 将删除的数据 状态置为false || 0
        dataList[index].status = '0';
        if (!options.cancel){
          // 将改动之后的数据列表传入 removeSendParam  判断删除
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
  /**
   * [removeSendParam() 向后台发送删除数据]
   * [removeList： {有修改之后的商品数据}]
   * [-------------------------------------------------]
   */
  removeSendParam (removeList){
    let that = this;
    // 过滤有变动的数据 ，将有变动的数据过滤为一个新数组
    let sendremoveList = removeList.filter(res => {
      if(res.status === '0'){
        return res;
      };
    });
    if (sendremoveList.length){
      // 发送删除数据
      ajax({
        url: path.shopcart.updateAppShop,
        method: 'POST',
        data: {
          // 将删除的数据数组 转为JSONstring 发送
          shopInfo: JSON.stringify(sendremoveList)
        }
      }).then(res => {
        if (res.errcode === 0) {
          // 删除成功之后将商品数据 之前有变化的在data中过滤删除
          let newList = removeList.filter(res => {
            if (res.status !== '0') {
              return res;
            }
          });
          // 将过滤之后的新数据赋值给商品列表参数 刷新列表
          that.setData({
            shopCarList: newList
          }, () => {
            wx.showToast({
              title: '删除成功'
            });
          });
          // 重新调用列表计算新的总价sum
          that.calculPrice();
        }
      })
    } else {
      wx.showToast({
        title: '请选择删除商品',
        icon: 'none'
      });
    };
  },
  /**
   * [toggerItem() 切换选中否 radio 操作 事件]
   * [-------------------------------------------------]
   */
  toggerItem (e){
    let statusArr = [],
      status = false,
      that = this,
      index = e.currentTarget.dataset.index,
      dataList = this.data.shopCarList;
    // 将当前点击radio 的状态置为 非！
    dataList[index].flag = !dataList[index].flag;
    // 将商品列表所有商品 的状态添加到新的数组
    dataList.forEach(result => {
      statusArr.push(result.flag);
    });
    // 因为初始是false  如果有true，修改全选状态的变量
    if (statusArr.indexOf(true) === -1){
      status = false;
    } else if (statusArr.indexOf(false) === -1){
      status = true;  
    };
    // 修改之后刷新新的数据列表
    this.setData({
      shopCarList: dataList,
      all: status // 如果单个商品状态有改动 将全选状态 修改
    },res => {
      // 并且重新计算价格
      that.calculPrice();
    });
  },
  /**
   * [calculPrice() 计算在当前选中radio 的商品的总价格]
   * [-------------------------------------------------]
   */
  calculPrice (){
    let dataList = this.data.shopCarList,
      sum = 0;
    // 循环遍历所有选中的 商品 计算价格
    dataList.forEach(item => {
      if (item.flag){
        let num = item.count,
          price = item.price;
          sum += num * price;
      }
    });
    this.setData({
      priceSum: sum
    })
  },
  /**
   * [selectAll() 点击全选的状态 操作事件]
   * [-------------------------------------------------]
   */
  selectAll (){
    let allBle = this.data.all; // 获取当前是否选中状态
    let dataList = this.data.shopCarList;
      // 将所有的商品的状态 置为非 ！
        dataList.map(item => {
          return item.flag = !allBle;
        });
      this.setData({
        shopCarList: dataList,
        all: !allBle
      });
      // 重新计算价格
      this.calculPrice();
  },
  /**
   * [goDetail() 点击商品跳转在商机详情页面]
   * [-------------------------------------------------]
   */
  goDetail (e){
    // complete: 判断当前是否为编辑状态，只有在非编辑状态才可跳转页面
    let complete = this.data.complete,
      bcid = e.currentTarget.dataset.bcid;
    if (!complete){
      wx.navigateTo({
        url: `../detail/detail?bcid=${bcid}`
      });
    }
  },
  /**
   * [setComplete() 点击编辑事件]
   * [-------------------------------------------------]
   */
  setComplete (){
    let complete = this.data.complete;
    this.setData({
      complete: !complete
    });
  },
  /**
   * [editComplete() 点击完成事件]
   * [-------------------------------------------------]
   */
  editComplete (){
    let that = this,
      complete = this.data.complete,
      dataList = this.data.shopCarList,
      numArr = this.data.numArr,
      statusList = this.data.statusList;
    // 将所有删除位置归 0 
    dataList.map((res) => { res.txtStyle = 0 + 'px' });
    this.setData({
      shopCarList: dataList
    });
    // 获取默认numArr 检测点击完成时 是否进行过修改
    // 如果未进行过修改，直接return 程序 否则将修改之后的数据向后台发送
    if (!numArr) {
      this.setData({
        complete: !complete
      });
      return false;
    }
    // 过滤每个有变化数据 的个数 和 状态，返回新数组
    let setNumList = dataList.filter((res,ind) => {
      if (res.count !== statusList[ind].count || res.status !== statusList[ind].status){
        return {
          count: res.count,
          id: res.id,
          status: '1'
        }
      }
    });
    // 将需要修改的数组转为JSONstring，发送
    let shopInfoString = JSON.stringify(setNumList);
    ajax({
      url: path.shopcart.updateAppShop,
      method: 'POST',
      data: {
        shopInfo: shopInfoString
      }
    }).then(res => {
      // 修改成功之后刷新计算价格
      if (res.errcode === 0){
        that.setData({
          complete: !complete,
          numArr: false
        });
        that.calculPrice();
      }
    });
  },
  /**
   * [removeAll() 删除全部选中的商品]
   * [-------------------------------------------------]
   */
  removeAll (){
    let dataList = this.data.shopCarList;
    // filter过滤被选中商品
    dataList.filter(item => {
      if (item.flag !== false){
        item.status = '0';
        return item;
      };
    });
    // 发送选中的删除数据
    this.removeSendParam(dataList);
  },
  /**
   * [calculation() 在编辑的状态下 加减 商品个数]
   * [-------------------------------------------------]
   */
  calculation (e){
    let dataList = this.data.shopCarList,
      dataset = e.currentTarget.dataset,
      index = dataset.index,
      status = dataset.status;
    let item = dataList[index];   
    status === 'add' ? dataList[index].count --  : dataList[index].count ++;
    dataList[index].count = dataList[index].count < 1 ? 1 : dataList[index].count;
    this.setData({
      shopCarList: dataList,
      numArr: true
    });
  },
  /**
   * [submitOrder() 点击结算时间， 将选中的所有商品进行 参数拼接]
   * [-------------------------------------------------]
   */
  submitOrder (){
    let userInfo = wx.getStorageSync('userInfo').userInfo,    // 获取用户信息
      totalAmount = this.data.priceSum, // 获取总价
      openid = this.data.openid,  // 获取买家openid
      shopCarList = this.data.shopCarList;  
      // 过滤所有选中的商品
    shopCarList = shopCarList.filter(item => item.flag === true);
    // 将参数进行格式拼接
    let setTlement = {
      source: 1,  // 来源 购物车结算
      order: {
        openid: openid,
        headimg: userInfo.avatarUrl,    // 买家头像
        nickname: userInfo.nickName,  // 买家用户名
        totalAmount: totalAmount,   // 选中商品总价
        appid: app.globalData.panyData.appid,  
        imid: app.globalData.panyData.imid  // 商铺id
      },
      proList: shopCarList  // 选中的商品数组
    };
    // 将拼接参数 发送到确认订单页面
    wx.navigateTo({
      url: `../confirmorder/confirmorder?order=${JSON.stringify(setTlement)}`
    });
  },
  /**
   * [onPullDownRefresh() 下拉刷新页面]
   * [-------------------------------------------------]
   */
  onPullDownRefresh (){
    this.onShow();
    this.calculPrice();
  }
})
