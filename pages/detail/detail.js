const app = getApp();
const { ajax, AuthorIzation, path } = require('../../utils/util.js');
const WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bcid: null, // 存储请求商机数据参数 bcid
    isDots: true,
    detailResult: {}, //
    numFloat: '0',
    parameter: ['图文详情','产品参数'],
    toggerIndex: 0, // 详情and参数 切换index
    curWidth: 0,  // cur样式下划线 width
    lateX:0,  // 过渡动画距离
    detailOptions: [],  // 请求产品参数存储列表 
    detailTop: {},
    picUrls: [],
    businChance: {
      price:0
    },
    phoneNum: '12345678900'
  },
  /**
   * [toggerClass 切换tab选项同时更新数据，以及动画效果]
   */
  onLoad: function (result) {
    let that = this;
    app.userInfoReadyCallback((res,mmtinfo) => {
      that.setData({
        mchid: mmtinfo.mchid
      });
    });
    this.setData({
      bcid: result.bcid
    });
    Promise.all([ajax({  // 初次进入商机页面 请求图文详情参数
      url: path.detail.busindetail,
      data:{
        bcid: result.bcid
      }
    }), ajax({
      url: path.detail.supply,
      data: {
        bcid: result.bcid
      }
    })]).then(data => {
      if (data.length!=0){
        if ((typeof data[0]) === 'string' && data[0] !== '') {
          let dataString = data[0];
          dataString = dataString.replace(/^\(|\)$/g, '');
          let datahtml = JSON.parse(dataString);
          WxParse.wxParse('aHrefHrefData', 'html', datahtml.html, that, 5);
        } else {
          wx.showToast({
            title: '暂无商机',
            icon: 'none'
          });
        };
        that.setData({
          detailTop: data[1],
          picUrls: data[1].picUrls || [],
          businChance: data[1].wechatBusinChance,
          detailOptions: data[1].businAttList || []
        });
      }
    });
  },
  onReady: function (){
    let that = this,
      $ = wx.createSelectorQuery(); // 获取选择dom对象
    // 存储当前cur dom width
    $.select(`.toggerCur`).boundingClientRect(function (res) {
      that.setData({
        curWidth: res.width + 10,
        lateX: res.left - 5
      });
    }).exec();
  },
  /**
  * 切换cur 并请求产品参数数据
  **/
  detailTogger (res){
    let that = this,
      activeIndex = res.currentTarget.dataset.id,
      left = res.target.offsetLeft, // 获取当前点击元素距离左边距离 过渡cur动画
      $ = wx.createSelectorQuery();
    // 设置cur过渡动画
    $.select(`#parameter${activeIndex}`).boundingClientRect(function (res){
      that.setData({
        toggerIndex: activeIndex,
        lateX: left - 14
      });
    }).exec();
  },
  /**
  * 添加购物车
  **/
  addShoping (){
    let that = this,
      bcid = this.data.bcid;
    // 查看用户是否授权获取信息
    AuthorIzation().then(options => {
      if (options.errMsg.includes('ok')){
        that.sendShoping(bcid);
      } else {
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        });
      };
    }).catch(err => {
      wx.showToast({
        title: '添加失败,请授权',
        icon: 'none'
      });
    });
  },
  /**
  * 添加购物车，向后台发起存储数据
  **/
  sendShoping (bcid){
    let openid = app.globalData.openId.openid;
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
  * 吊起拨打电话
  **/
  calling (){
    let that = this;
    wx.showActionSheet({
      itemList: ['呼叫', '复制号码', '添加到手机通讯录'],
      success: function (res) {
        switch (res.tapIndex){
          case 0: wx.makePhoneCall({
            phoneNumber: that.data.phoneNum
          }); break;
          case 1: wx.setClipboardData({
            data: that.data.phoneNum,
            success: function (res) {
              wx.showToast({
                title: '复制成功'
              });
              // wx.getClipboardData({
              //   success: function (res) {
              //     console.log(res.data) // data
              //   }
              // })
            }
          });break;
          case 2: wx.addPhoneContact({
            firstName: 'hello word',//联系人姓名
            mobilePhoneNumber: that.data.phoneNum,//联系人手机号
          });break;
          default : return false;
        }
        // console.log(res.tapIndex)
      }
    })
  },
  /**
  * 立即购买发起订单
  **/
  purchase (){ // 立即购买
    let that = this
    AuthorIzation().then(options => {
      if (options.errMsg.includes('ok')) {
        let detailTop = this.data.detailTop,
          totalAmount = detailTop.wechatBusinChance.price;
        let objOptions = {
          title: detailTop.title,
          bcPic: detailTop.picUrls[0].picUrl || '',
          price: totalAmount,
          bcid: that.data.bcid,
          count: 1
        }
        let userInfo = wx.getStorageSync('userInfo').userInfo,
          
          openid = app.globalData.openId.openid;
        let setTlement = {
          source: 0,
          order: {
            openid: openid,
            headimg: userInfo.avatarUrl,
            nickname: userInfo.nickName,
            totalAmount: totalAmount,
            appid: app.globalData.panyData.appid,
            imid: app.globalData.panyData.imid
          },
          proList: [objOptions]
        };

        // console.log(setTlement)
        setTlement = JSON.stringify(setTlement);
        wx.navigateTo({
          url: `../confirmorder/confirmorder?order=${setTlement}`
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '授权购买',
        icon: 'none'
      });
    });  
    
  },
  /**
   * 用户点击右上角分享
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
})