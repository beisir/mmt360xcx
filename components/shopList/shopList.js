let { errImg, errImgEvent } = require('../../utils/util.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopList: {
      type: Array,       
      value: []
    },
    shopTitle: {
      type: String,
      value: ''
    },
    toggerIndex: {
      type: Number,
      value: 0
    },
    mchid: {
      type: String,
      value: ''
    },
    errImg: {
      type: String,
      value: errImg
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  
  methods: {
    /**
     * [goDetail 跳转详情页面 ]
     * [-------------------------------------------------]
     */
    goDetail: function (res) {
      let bcid = res.currentTarget.dataset.bcid,
        mchid = this.data.mchid;
      wx.navigateTo({
        url: `../detail/detail?bcid=${bcid}&mchid=${mchid}`
      });
    },
    /**
     * [errImgEvent 当图片报错的时候替换图片为errImg ]
     * [-------------------------------------------------]
     */
    errImgEvent: function (e) {
      var errorImgIndex = e.currentTarget.dataset.index //获取循环的下标
      let shopList = this.data.shopList;
      var imgObject = "shopList[" + errorImgIndex + "].bcPicPath" //carlistData为数据源，对象数组
      var errorImg = {}
      errorImg[imgObject] = errImg //我们构建一个对象
      this.setData(errorImg) //修改数据源对应的数据
    }
  }
})
