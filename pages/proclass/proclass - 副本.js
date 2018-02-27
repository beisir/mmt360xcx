
const {ajax,path} = require('../../utils/util.js');
const app = getApp();
Page({
  /**
   * [postclass 初始值 ]
   * [-------------------------------------------------]
   */
  data: {
    lstSeriesVO: []
  },
  /**
   * [onLoad() 获取商铺所有分类 列表 ]
   * [-------------------------------------------------]
   */
  onLoad: function () {
    let that = this;
    // imid ： 商铺id
    let imid = app.globalData.panyData.imid;
    ajax({
      url: path.proclass.shopseries,
      data: {
        imid: imid
      }
    }).then(res => {
      // 如果商铺分类不为空
      if (res && res.lstSeriesVO.length !== 0) {
        // 根据用户喜好 sortvalue 进行排序
        let serires = res.lstSeriesVO.sort(function (a, b) {
          // a.active : 添加一个状态 选中tab状态
          a.active = false;
          return a.sortvalue - b.sortvalue;
        });
        serires.unshift({
          seriesName: '全部商品',
          seriesid: '',
          children: []
        });
        // 将排序好的新数据赋值
        that.setData({
          lstSeriesVO: serires
        });
      };
    });
  },
  /**
   * [selectActiveFn() 选择tab添加cur样式 点击一级tab   ]
   * [点击当前tab只适用于一级tab]
   * [-------------------------------------------------]
   */
  selectActiveFn (e){
    // 获取自定义参数
    let dataset = e.currentTarget.dataset,  
      seriesid = dataset.seriesid,  // 分类id
      index = dataset.index,  // 当前点击下标 [ps: 下标全部按照父级查找]
      seriesname = dataset.seriesname;  // 当前点击tab标题
    // 获取分类列表数据 
    let dataList = this.data.lstSeriesVO; 
    // 遍历列表判断 每个一级tab 之下是否有二级tab
    dataList.map((res, ind)=> {
      if (res.children.length>0){
        // 如果有二级tab 将cur样式状态置为false
        res.children.map(item => {
          item.active = false;
        });
      }
      // 返回一个新数组 当前点击的tab cur样式置为true
      return res.active = ind === index ? true: false;
    });
    // 更新数据列表
    this.setData({
      lstSeriesVO: dataList
    });
    // 并且跳转页面到tab分类列表页面
    wx.navigateTo({
      url: `../class/class?seriesid=${seriesid}&seriesname=${seriesname}`
    });
  },
  /**
   * [childActiveFn() 选择tab添加cur样式 点击二级tab   ]
   * [点击当前tab只适用于二级tab]
   * [-------------------------------------------------]
   */
  childActiveFn (e){
    let dataset = e.currentTarget.dataset,
      seriesid = dataset.seriesid,
      index = dataset.index,
      parIndex = dataset.parindex,
      seriesname = dataset.seriesname,
      dataList = this.data.lstSeriesVO;
    // 将所有的一级tab cur 状态置为false


    console.log()
    dataList.map((res, ind) => {
      res.children.map(item => {
        return item.active = false;    
      });
      return res.active = false;
    });
    // 将当前点击的二级 tab 数据进行遍历 设置当前tab cur
    dataList[parIndex]['children'][index].active = true;
    // 更新数据列表
    this.setData({
      lstSeriesVO: dataList
    });
    // 并且跳转页面到tab分类列表页面
    wx.navigateTo({
      url: `../class/class?seriesid=${seriesid}&seriesname=${seriesname}`
    });
  }
});