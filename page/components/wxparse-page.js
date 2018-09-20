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
      value:{},
      observer: function (newVal, oldVal, changedPath) {
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
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
    // detail:[],
    // title:null,
    // time:null
  },
  ready(){
    this._initData();
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _initData(){
      let that =this;
      let detail = that.data.detail;
      WxParse.wxParse('detail', 'html', detail.nodes, that);
     
    }
  }
})
