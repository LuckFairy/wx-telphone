// association-detail.js
var app = getApp();
const log = 'association-detail.js --- ';

Page({
	data:{
		pageData: null
	},
	onLoad:function(options){
		// 页面初始化 options为页面跳转所带来的参数
		let {data} = options;
	

		let pageData = JSON.parse(decodeURIComponent(data));
		this.setData({pageData});
	},

 /**
   * 复制微信号到剪切板
   * @param {[type]} e [description]
   */
  addCodeToClipBoard(e) {
    let {code} = e.currentTarget.dataset;
    wx.setClipboardData({
      data: code,
      success: function(res) {
        wx.showModal({
          title: '复制成功',
          content: '微信号已经复制到剪切板，去微信加好友进群吧',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
            } else if (res.cancel) {            
            }
          }
        })
      }
    })
  },

	onReady:function(){
		// 页面渲染完成
	},
	onShow:function(){
		// 页面显示
	},
	onHide:function(){
		// 页面隐藏
	},
	onUnload:function(){
		// 页面关闭
	}
})