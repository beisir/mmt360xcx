const app = getApp();
const { ajax, path } = require('../../utils/util.js');
const WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * [detail: data 详情页初始数据 ]
   * [-------------------------------------------------]
   */
  data: {
    bcid: null, // 存储请求商机数据参数 bcid
    detailResult: {}, //
    numFloat: '0',
    parameter: ['图文详情','产品参数'],
    toggerIndex: 0, // 详情and参数 切换index
    // curWidth: 0,  // cur样式下划线 width
    // lateX: 0,  // 过渡动画距离
    detailOptions: [],  // 请求产品参数存储列表 
    detailTop: {},
    picUrls: [],  // 详情页面轮播图
    businChance: {  // 
      price:0
    },
    phoneNum: '400-6360-888'
  },
  /**
   * [onLoad() 初始调用数据  有三个接口 ]
   * [{result : Object(result.bcid: 商机详情id)}]
   * [-------------------------------------------------]
   */
  onLoad: function (result) {
    let that = this;
    // 为防止detail页面先加载完毕 获取不到数据，在app中设置回调
    // res: extJSON 中appid and imid ; mmtinfo: 商家信息
    app.userInfoReadyCallback((res,mmtinfo) => {
      that.setData({
        mchid: mmtinfo.mchid
      });
    });
    this.setData({
      bcid: result.bcid
    });
    // 同时请求两个ajax 同步返回数据回调
    // Promise.all([ajax({  
    //   // 初次进入商机页面 请求图文详情参数
    //   url: path.detail.busindetail,
    //   data:{
    //     bcid: result.bcid
    //   }
    // }), ajax({
    //   // 请求参数列表和 价格 图片列表等
    //   url: path.detail.supply,
    //   data: {
    //     bcid: result.bcid
    //   }
    // })]).then(data => {
    //   // console.log(data);
    //   // 返回值为一个数组，分别是两个ajax的返回值
    //   if (data.length!=0){
    //     if ((typeof data[0]) === 'string' && data[0] !== '') {
    //       // data[0] 商机图文详情 值为HTML字符串，小程序不支持，使用WxParse插件进行解析 
    //       let dataString = data[0];
    //       // 返回值带有前后带有 '(....)' ,进行删除左右 （）
    //       dataString = dataString.replace(/^\(|\)$/g, '');
    //       // 去掉括号的返回值为一个JSON字符串转为Object取 .html 值
    //       let datahtml = JSON.parse(dataString);
    //       WxParse.wxParse('aHrefHrefData', 'html', datahtml.html, that, 5);
    //     } else {
    //       wx.showToast({
    //         title: '暂无商机',
    //         icon: 'none'
    //       });
    //     };
    //     that.setData({
    //       detailTop: data[1], // 设置详情列表
    //       picUrls: data[1].picUrls || [], // 设置轮播图片列表
    //       businChance: data[1].wechatBusinChance, // 设置价格 title等参数
    //       detailOptions: data[1].businAttList || [] // 设置参数列表
    //     });
    //   }
    // });
    ajax({
      // 初次进入商机页面 请求图文详情参数
      url: path.detail.busindetail,
      data: {
        bcid: result.bcid
      }
    }).then(data =>{
      // console.log(data);
      // 返回值为一个数组，分别是两个ajax的返回值
      if ((typeof data) === 'string' && data !== '') {
        // data[0] 商机图文详情 值为HTML字符串，小程序不支持，使用WxParse插件进行解析 
        let dataString = data;
        // 返回值带有前后带有 '(....)' ,进行删除左右 （）
        dataString = dataString.replace(/^\(|\)$/g, '');
        // 去掉括号的返回值为一个JSON字符串转为Object取 .html 值
        let datahtml = JSON.parse(dataString);
        WxParse.wxParse('aHrefHrefData', 'html', datahtml.html, that, 5);
      } else {
        wx.showToast({
          title: '暂无商机',
          icon: 'none'
        });
      };
    });
    ajax({
      // 请求参数列表和 价格 图片列表等
      url: path.detail.supply,
      data: {
        bcid: result.bcid
      }
    }).then(data => {
      that.setData({
        detailTop: data, // 设置详情列表
        picUrls: data.picUrls || [], // 设置轮播图片列表
        businChance: data.wechatBusinChance, // 设置价格 title等参数
        detailOptions: data.businAttList || [] // 设置参数列表
      });
    });
  },
  /**
   * [onReady() 初次进入页面选择cur默认 计算宽度,距离左边距离 ]
   * [-------------------------------------------------]
   */
  // onReady: function (){
  //   let that = this,
  //     $ = wx.createSelectorQuery(); // 获取选择dom对象
  //   // 存储当前cur dom width
  //   $.select(`.toggerCur`).boundingClientRect(function (res) {
  //     that.setData({
  //       curWidth: res.width + 10,
  //       lateX: res.left - 5
  //     });   
  //   }).exec();
  // },
  /**
   * [detailTogger() 切换cur 并请求产品参数数据 ]
   * [-------------------------------------------------]
   */
  detailTogger (res){
    let that = this,
      activeIndex = res.currentTarget.dataset.id;
      that.setData({
        toggerIndex: activeIndex
      });
  },
  /**
   * [addShoping() 将商品添加到购物车]
   * [-------------------------------------------------]
   */
  addShoping (){
    let that = this,
      bcid = this.data.bcid;
    // 查看用户是否授权获取信息
    app.AppLogin().then(options => {
      // 当用户确定登陆&&授权之后 向后天发送添加购物车数据
      that.sendShoping(bcid,options.openid);
    }).catch(err => {
      wx.showToast({
        title: '添加失败,请授权',
        icon: 'none'
      });
    });
  },
  /**
   * [sendShoping() 向后台发送数据]
   * [{bcid: 商机id, openid：买家id}]
   * [-------------------------------------------------]
   */
  sendShoping(bcid, openid){
    if (!openid){
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
      return false;
    }
    ajax({
      url: path.detail.saveAppShop,
      data: {
        openid: openid,
        bcid: bcid,
        count: 1
      }
    }).then((res) => {
      if (res.errcde === 0){
        wx.showToast({
          title:'添加成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none'
        });
      }
    });
  },
  /**
   * [calling() 点击电话是调用微信方法显示浮层]
   * [-------------------------------------------------]
   */
  calling (){
    let that = this;
    // 微信内置方法显示浮层
    wx.showActionSheet({
      // 浮层文字列表
      itemList: ['呼叫', '复制号码', '添加到手机通讯录'],
      success: function (res) {
        // 点击浮层某个值 返回点击值下标 根据下标判断操作
        switch (res.tapIndex){
          // 0：打开手机原生电话拨打界面
          case 0: wx.makePhoneCall({
            phoneNumber: that.data.phoneNum
          }); break;
          // 1：复制文本方法
          case 1: wx.setClipboardData({
            data: that.data.phoneNum,
            success: function (res) {
              wx.showToast({
                title: '复制成功'
              });
            }
          });break;
          // 2： 在手机原生界面添加联系人 ，默认联系人姓名，手机号
          case 2: wx.addPhoneContact({
            firstName: '',//联系人姓名
            mobilePhoneNumber: that.data.phoneNum,//联系人手机号
          });break;
          default : return false;
        }
      }
    })
  },
  /**
   * [purchase() 立即购买按钮点击事件]
   * [-------------------------------------------------]
   */
  purchase (){ // 立即购买
    let that = this;
    // 效验是否登录授权
    app.AppLogin().then(options => {
        let detailTop = this.data.detailTop,  // 获取参数列表 ，价格，图片等数据
          totalAmount = detailTop.wechatBusinChance.price;  // 获取总价
        // 拼接确认订单页面的商品信息列表 [ps: 虽是列表，但是在确认订单页面总是显示一个商品，为了和购物车结算跳转同步]
        let objOptions = {  
          title: detailTop.title,
          bcPic: (detailTop.picUrls && detailTop.picUrls.picUrl) || '',
          price: totalAmount,
          bcid: that.data.bcid,
          count: 1
        };
        // 获取买家微信用户名信息等。。
        let userInfo = wx.getStorageSync('userInfo').userInfo;
        if (!options.openid){
          wx.showToast({
            title: '购买失败',
            icon: 'none'
          });
          return false;
        }
        // 确认订单页面参数 
        let setTlement = {
          source: 0,  // 来源
          order: {  // 订单参数
            openid: options.openid, //  买家id
            headimg: userInfo.avatarUrl,  // 买家头像
            nickname: userInfo.nickName,  // 买家微信名
            totalAmount: totalAmount, // 商品总价
            appid: app.globalData.panyData.appid, // 小程序appid
            imid: app.globalData.panyData.imid  // 商户id
          },
          proList: [objOptions] // 订单商品列表
        };
        // 将拼接好的参数转为JSON字符串，get方式页面传参
        setTlement = JSON.stringify(setTlement); 
        wx.navigateTo({
          url: `../confirmorder/confirmorder?order=${setTlement}`
        });
    }).catch(err => {
      wx.showToast({
        title: '授权购买',
        icon: 'none'
      });
    });  
  },
  /**
   * [purchase() 立即购买按钮点击事件]
   * [-------------------------------------------------]
   */
  onShareAppMessage: function (options) {
    var that = this;
  // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      // 默认是小程序的名称(可以写slogan等)
      title: "转发的标题",
      // 默认是当前页面，必须是以‘/’开头的完整路径
      path: '',
      /*自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 
      imageUrl 则使用默认截图。显示图片长宽比是 5:4*/
      imgUrl: 'https://b2b.hc360.com/h5/wj_41.jpg',     
      success: function (res) {
      // 转发成功之后的回调
      // console.log(res);
        if (res.errMsg == 'shareAppMessage:ok') {};
      },
      // 转发失败之后的回调
      fail: function (res) {
      // 用户取消转发
        if (res.errMsg == 'shareAppMessage:fail cancel') {}
      // 转发失败，其中 detail message 为详细失败信息
        else if (res.errMsg == 'shareAppMessage:fail') {}
      }
    };
    // 来自页面内的按钮的转发
    if(options.from == 'button') {
      // console.log(options);
      // var eData = options.target.dataset;
    };
    // console.log(shareObj);
    return shareObj;
  }
});