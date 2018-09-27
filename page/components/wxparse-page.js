// page/components/wxparse-page.js
var WxParse = require('../../utils/wxParse/wxParse.js');
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    detail:{
      type: Object,
      value:{}
    },
    title:{
      type:String,
      value:''
    },
    time:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    detail:{},
  },
  ready(){
    // this._initData();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _initData(){
      let that =this;
      let detail = that.data.detail;
      console.log(detail);
      WxParse.wxParse('detail', 'html', detail.nodes, that);
     
    },
  }
})
