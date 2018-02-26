const { ajax, path, errImgEvent, errImg } = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * [class data ]
   * [-------------------------------------------------]
   */
  data: {
    lstResult: [],
    seriesid: '',
    page: 1,
    isLoad: true,
    errImg: errImg
  },
  /**
   * [onLoad() 获取商铺分类列表 ]
   * [options:{seriesid : 分类id 查询列表,seriesname: 分类商品标题} ]
   * [-------------------------------------------------]
   */
  onLoad: function (options) {
    this.setData({
      seriesid: options.seriesid
    })
    // 设置分类标题
    wx.setNavigationBarTitle({
      title: options.seriesname,
    });
    this.getClassList(1)
  },
  getClassList (pageNum){
    // 请求分类商品列表
    let that = this,
      seriesid = this.data.seriesid;
    ajax({
      url: path.index.list,
      data: {
        page: pageNum,
        seriesid: seriesid
      }
    }).then(result => {
      // 如果商品个数不小于0
      if (result && result.lstResult.length) {
        let lstResult = that.data.lstResult;
        this.setData({
          lstResult: lstResult.concat(result.lstResult),
          page: pageNum
        });
      } else {
        wx.showToast({
          title: '没有更多了...',
          icon: 'none'
        });
      };
      this.setData({
        isLoad: false
      });
    });
  },
  /**
   * [goDetail(e) 根据商品bcid 前往商机详情页 ]
   * [-------------------------------------------------]
   */
  goDetail (e){
    let bcid = e.currentTarget.dataset.bcid;
    wx.navigateTo({
      url: `../detail/detail?bcid=${bcid}`
    })
  },

  errImgEvent: function (e) {
    var errorImgIndex = e.currentTarget.dataset.index //获取循环的下标
    let shopList = this.data.shopList;
    var imgObject = "lstResult[" + errorImgIndex + "].bcPicPath" //carlistData为数据源，对象数组
    var errorImg = {}
    errorImg[imgObject] = errImg //我们构建一个对象
    this.setData(errorImg) //修改数据源对应的数据
  },
  /**
   * [onReachBottom 下拉加载获取数据 ]
   * [-------------------------------------------------]
   */
  onReachBottom: function () {
    let pageNum = this.data.page;
      pageNum += 1;
    this.setData({
      isLoad: true
    });
    this.getClassList(pageNum);
  }
})