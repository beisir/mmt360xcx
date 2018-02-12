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
  ready: function (options) {
    // setTimeout(function (){
    //   let $ = wx.createSelectorQuery().in(this);
    //   $.select('.proBox').boundingClientRect(function (rects) {
    //     console.log(rects)
    //   }).exec()
    // },3000);
    
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    goDetail: function (res) {
      let bcid = res.currentTarget.dataset.bcid,
        mchid = this.data.mchid;
      wx.navigateTo({
        url: `../detail/detail?bcid=${bcid}&mchid=${mchid}`
      });
    },
    errImgEvent: function (e) {
      var errorImgIndex = e.currentTarget.dataset.index //获取循环的下标
      let shopList = this.data.shopList;
      var imgObject = "shopList[" + errorImgIndex + "].bcPicPath" //carlistData为数据源，对象数组
      var errorImg = {}
      errorImg[imgObject] = errImg //我们构建一个对象
      this.setData(errorImg) //修改数据源对应的数据


      // console.log(e);
      // let shopList = this.data.shopList;
      // let errIndex = e.currentTarget.dataset.index;
      // shopList[errIndex].bcPicPath = 'https://mp.weixin.qq.com/debug/wxadoc/dev/image/cat/0.jpg?t=201822';
      // this.setData({
      //   shopList: shopList
      // });
    }
  }
})
