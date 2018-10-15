// page/components/share-page.js
import Poster from './poster/poster/poster'

let app=getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    opt: {
      type: Object,
      value: {}
    },
    shareShade:{
      type: Boolean,
      value:false
    },
    posterShade: {
      type: Boolean,
      value: false
    },
    product:{
      type:String,
      value: {}
    },
    jdImg:{
      type:String,
      value:null
    },
    qrImg: {
      type: String,
      value: null
    },
    posterConfig:{
      type: Object,
      value: {}
   },
  poster: Object


  },

  /**
   * 组件的初始数据
   */
  data: {
   
  },
  ready(){
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onTap: function () {
      this.setData({ shareShade:false})
    },
    onClose:function(){
      this.setData({ posterShade:false})
    },
    /**弹出海报 */
    onshowposter(e){
      this.setData({ posterShade:true})
    },
    onPosterSuccess(e) {
      let that = this;
      const { detail } = e;
      console.log('下载的图片路径',e.detail);
      wx.saveImageToPhotosAlbum({
        filePath: e.detail,
        success: function (data) {
          console.log('保存的图片路径', data)
          // wx.showToast({
          //   title: `图片保存成功`,
          // })
          that.setData({ posterShade:false})
        },
        fail: function () {
          // wx.showToast({
          //   title: '保存图片失败',
          //   icon: 'fail'
          // })
        }
      })
   
    },
    onPosterFail(err) {
      console.error(err);
    },
    
  
  }
})
