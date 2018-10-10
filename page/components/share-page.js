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
    posterConfig:{
      type: Object,
      value: {}
   },
   style:Number,
   poster:Object, 
   qrcodeUrl:String
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
      const { detail } = e;
      // console.log(e.detail);
      const downloadTask = wx.downloadFile({
        url: e.detail, //仅为示例，并非真实的资源
        success(res) {
          // wx.previewImage({
          //   current: res.tempFilePath,
          //   urls: [res.tempFilePath]
          // })
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
          })
        }
      })
      downloadTask.onProgressUpdate((res) => {
        console.log('下载进度', res.progress)
        console.log('已经下载的数据长度', res.totalBytesWritten)
        console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
      })
    },
    onPosterFail(err) {
      console.error(err);
    },
    
  
  }
})
