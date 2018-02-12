const { ajax, config, path, errImgEvent } = require('../../utils/util.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lstResult: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let imid = app.globalData.panyData.imid,
      mmtInfo = wx.getStorageSync('mmtInfo');
    wx.setNavigationBarTitle({
      title: options.seriesname,
    });
    ajax({
      url: path.index.list + imid,
      data: {
        page: 1,
        seriesid: options.seriesid
        // seriesid: '962060'
      }
    }).then(result => {
      if (result){
        if (result.lstResult.length){
          this.setData({
            lstResult: result.lstResult
          })
        }
      };
    });
  },
  goDetail (e){
    let bcid = e.currentTarget.dataset.bcid;
    wx.navigateTo({
      url: `../detail/detail?bcid=${bcid}`
    })
  }
})