// pages/search/search.js
let { ajax, path} = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isClear: 0, // 控制是否显示清空按钮
    keyword: '', // 输入框关键词
    searchList: [], // 搜索结果集
    showBox: 'click', // 三种状态分别对应下方三种提示语
    imid: app.globalData.panyData.imid
  },
  // 搜索数据 输入框回车事件
  sendKeyWord (options){
    let that = this;
    let keyword = options.detail.value; //获取当前输入文字
    keyword = keyword.trim();
    if (!keyword){  // 当前文字为空
      this.setData({  
        searchList: [], // 清空数据列表
        showBox: 'key'  // 设置提示文字状态
      });
      return false; // 终止程序
    };
    let word = encodeURIComponent(encodeURIComponent(keyword));
    let imid = this.data.imid;
    ajax({  // 否则搜索数据
      url: path.index.list + imid + `?page=1&word=${word}`
    }).then(result => {
      if (result.lstResult.length){  // 如果搜索结果为空
        that.setData({
          searchList: result.lstResult,  // 否则获取列表
          showBox: 'more' // 修改提示语
        });
      } else {
        that.setData({
          showBox: 'none' // 显示提示语为空
        });  
      }
    });
  },
  inputTxt (options){
    let cursor = options.detail.cursor; //
    if (!cursor){
      this.setData({
        isClear: false,
        searchList: [],
        showBox: 'key'
      });
    } else {
      this.setData({
        isClear: true
      });
    }
  },
  clearTxt (){
    this.setData({
      keyword: '',
      isClear: 0,
      searchList: [],
      showBox: 'key'
    });
  },
  searchDetail (options){
    let bcid = options.currentTarget.dataset.id
    wx.navigateTo({
      url: `../detail/detail?bcid=${bcid}`
    });
  }
})