const { AuthorIzation,ajax ,path} = require('../../utils/util.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopList:[],
    indexList: [],
    newDetai: [],
    toggerIndex: 0,
    lateX:50,
    curWidth:100 ,
    toggerTitle:['首页','最新产品'],
    companyInfo:{
      headimg: '',
      nickname: ''
    },
    page: 1,
    loading: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    /**
     * [app.userInfoReadyCallbac 为了防止index比app先加载，在app的回调]
     * [extJSON:配置文件imid,companyInfo:公司头像和title]
     */ 
    app.userInfoReadyCallback((extJSON, companyInfo) => {     
      that.setData({
        companyInfo: companyInfo,
        extJSON: extJSON
      });
      that.getShopList(0);
      wx.setNavigationBarTitle({
        title: companyInfo.nickname || '首页'
      });
    });
    
  },
  /**
   * [getShopList 获取商品推荐或者最新产品]
   * [resurl:(0 首页数据,1 最新铲平),pageNum：上拉时刷新数据]
   */
  getShopList: function (resurl = 0,pageNum){
    let page = pageNum || 1;
    let username = this.data.extJSON.imid;
    let that = this;
    let ajaxurl = [
      path.index.recommend + `${username}?rownum=10`,
      path.index.list + `${username}?page=${page}`
    ];
    let url = resurl ? ajaxurl[1] : ajaxurl[0];
    if (resurl === 0 && this.data.indexList.length){
      this.setData({
        shopList: this.data.indexList,
        toggerIndex: 0
      });
    } else if (resurl === 1 && this.data.newDetai.length && page===1){
      this.setData({
        shopList: this.data.newDetai
      });
    } else {
      that.setData({
        loading: true
      });
      ajax({
        url: url,
      }).then(function (options) {
        if (resurl === 0){
          that.setData({
            indexList: options,
            shopList: options
          }); 
        } else {
          let newDetai = that.data.newDetai;
          if (options.lstResult.length <= 0){
            that.setData({
              loading: false
            })
            wx.showToast({
              title: '没有更多数据',
              icon: 'none',
              mask: true
            });
            // that.setData({
            //   toggerIndex: 0
            // });
            return false;
          };
          let newArr = newDetai.concat(options.lstResult)
          that.setData({
            newDetai: newArr,
            shopList: newArr,
            page: options.page
          });
        }
      });
    }
  },
  /**
   * [onReachBottom 微信内置方法 滑动到底部触发]
   */
  onReachBottom: function (){
    let toggerIndex = this.data.toggerIndex,
      page = this.data.page;
    if (toggerIndex === 1){
      page += 1;
      this.getShopList(1, page);
      this.setData({
        page: page
      });
    }
  },
  /**
   * [toggerClass 切换tab选项同时更新数据，以及动画效果]
   */
  toggerClass: function (res){
    let that = this;
    let activeIndex = res.currentTarget.dataset.id,
        left = res.target.offsetLeft,    
        $ = wx.createSelectorQuery();
    this.getShopList(activeIndex);  
    let ele = $.select(`#tab${activeIndex}`).boundingClientRect();
    $.exec(function (res) {
      that.setData({
        toggerIndex: activeIndex,
        curWidth: res[0].width,
        lateX: left - 10
      });
    });
  },
  onReady: function () {
    let that = this,
      $ = wx.createSelectorQuery(),
      ele = $.select(`.titleCur`).boundingClientRect(function (res) {
        that.setData({
          curWidth: res.width,
          lateX: res.left - 10
        });
      }).exec();
  }
});