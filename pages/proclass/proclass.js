
const {ajax,path} = require('../../utils/util.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    lstSeriesVO: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this;
    let imid = app.globalData.panyData.imid;
    ajax({
      url: path.proclass.shopseries,
      data: {
        imid: 'jinjiangjiayi'
        // imid: imid
      }
    }).then(res => {
      if (res && res.lstSeriesVO.length !== 0) {
        let serires = res.lstSeriesVO.sort(function (a, b) {
          a.active = false;
          return a.sortvalue - b.sortvalue;
        });
        that.setData({
          lstSeriesVO: serires
        });
      }
    });
  },
  selectActiveFn (e){
    let dataset = e.currentTarget.dataset,
      seriesid = dataset.seriesid,
      index = dataset.index,
      seriesname = dataset.seriesname;
    let dataList = this.data.lstSeriesVO;
    dataList.map((res, ind)=> {
      if (res.children.length>0){
        res.children.map(item => {
          item.active = false;
        });
      }
      return res.active = ind === index ? true: false;
    });
    this.setData({
      lstSeriesVO: dataList
    });
    console.log(seriesid)
    wx.navigateTo({
      url: `../class/class?seriesid=${seriesid}&seriesname=${seriesname}`
    });
  },
  childActiveFn (e){
    let dataset = e.currentTarget.dataset,
      seriesid = dataset.seriesid,
      index = dataset.index,
      parIndex = dataset.parindex,
      seriesname = dataset.seriesname,
      dataList = this.data.lstSeriesVO;
    dataList.map((res, ind) => {
      return res.active = false;
    });  
    dataList[parIndex]['children'].map((val,ind) => {
      return val.active = ind === index ? true : false;
    });
    this.setData({
      lstSeriesVO: dataList
    });
    wx.navigateTo({
      url: `../class/class?seriesid=${seriesid}&seriesname=${seriesname}`
    });
  }
})