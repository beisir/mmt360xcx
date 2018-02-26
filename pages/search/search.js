const { ajax, path, errImg} = require('../../utils/util.js');
let app = getApp();
Page({
  /**
   * [search 初始值 ]
   * [-------------------------------------------------]
   */
  data: {
    isClear: 0, // 控制是否显示清空按钮
    keyword: '', // 输入框关键词
    searchList: [], // 搜索结果集
    showBox: 'click', // 三种状态分别对应下方三种提示语
    // [ps: { 'none': '没有找到相关的商品', 'key': '请输入关键字搜索', 'click': '点击搜索开始' }]
    errImg: errImg
  },
  /**
   * [sendKeyWord() 搜索数据 输入框回车事件 ]
   * [options: { 当前回车事件 事件参数 }]
   * [-------------------------------------------------]
   */
  sendKeyWord (options){
    let that = this,
      keyword = options.detail.value; //获取当前输入文字
      keyword = keyword.trim();  // 去除文字前后空格
    // 如果当前文字为空
    if (!keyword){
      this.setData({  
        searchList: [], // 清空数据列表
        showBox: 'key'  // 设置提示文字状态 
      });
      return false; // 终止程序
    };
    let word = encodeURIComponent(encodeURIComponent(keyword));
    ajax({  // 否则搜索数据
      url: path.index.list + `?page=1&word=${word}`
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
  /**
   * [inputTxt() 搜索数据 键盘事件 ]
   * [options: { 键盘事件 事件参数 }]
   * [-------------------------------------------------]
   */
  inputTxt (options){
    let cursor = options.detail.cursor; // 获取当前输入框中输入文字个数(length 长度)
    if (!cursor){   // 如果输入框文字个数为0 将所有状态置为默认
      this.setData({
        isClear: false,
        searchList: [],
        showBox: 'key'
      });
    } else {      // 否则显示清除按钮
      this.setData({
        isClear: true
      });
    }
  },
  /**
   * [clearTxt() 清除当前输入框文字，将所有状态置为默认 ]
   * [-------------------------------------------------]
   */
  clearTxt (){
    this.setData({
      keyword: '',
      isClear: 0,
      searchList: [],
      showBox: 'key'
    });
  },
  /**
   * [searchDetail() 点击任意搜索结果列表 跳转商机详情页面]
   * [-------------------------------------------------]
   */
  searchDetail (options){
    let bcid = options.currentTarget.dataset.id
    wx.navigateTo({
      url: `../detail/detail?bcid=${bcid}`
    });
  },
  errImgEvent: function (e) {
    var errorImgIndex = e.currentTarget.dataset.index //获取循环的下标
    let shopList = this.data.shopList;
    var imgObject = "searchList[" + errorImgIndex + "].bcPicPath" //carlistData为数据源，对象数组
    var errorImg = {}
    errorImg[imgObject] = errImg //我们构建一个对象
    this.setData(errorImg) //修改数据源对应的数据
  }
});