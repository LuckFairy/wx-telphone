// page/distribution/invite.js
let app = getApp();
const _get_user = "wxapp.php?c=fx_user_middle&a=get_self_user";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    curActIndex:0,
    list0:[],
    list1:[],
    list2: [],
    storeId: app.store_id,
    one:1,
    flagone:false,
    changeone:false,
    two:1,
    changetwo:false,
    flagtwo:false,
    three:1,
    changethree:false,
    flagthree:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getCustomers(0);

  },
  pullUpLoadone(){
    let index = this.data.curActIndex,page = this.data.one;
    if(!this.data.flagone){return;}
    page++;
    let that = this;
    // console.log(page);
    this.setData({one:page},()=>{
       that.getCustomers(index,page);
    })
  },
  pullUpLoadtwo(){
    let index = this.data.curActIndex, page = this.data.two;
    if (!this.data.flagtwo) { return; }
    page++;
    let that = this;
    this.setData({ two: page }, () => {
      that.getCustomers(index, page);
    })
  },
  pullUpLoadthree(){
    let index = this.data.curActIndex, page = this.data.three;
    if (!this.data.flagthree) { return; }
    page++;
    let that = this;
    this.setData({ three: page }, () => {
      that.getCustomers(index, page);
    })
  },

  getCustomers(index,page){
    let that=this;
    //分类(‘all’:全部客户,’my’:未跑路客户,’others’:已跑路客户)
    let type ='all';
    if(index==1){
      type ='my';
    }else if(index==2){
      type = 'others';
    }
    let fxid = wx.getStorageSync('fxid');
    if (fxid) {
      var params = {
        "fx_id": fxid,
        type,
        "store_id": this.data.storeId,
        page:page?page:1
      };
      app.api.postApi(_get_user, { params }, (err, resp) => {
        wx.hideLoading();
        if (resp) {
          if (resp.err_code == 0) {
            let list = resp.err_msg.data;

            if (index == 0) {
              if(!list.length||list.length==0){that.setData({flagone:false})}
              else{
               var  arr = [...that.data.list0,...list];
             
                that.setData({
                  list0: arr,
                  flagone:true
                });
              }
            } else if (index == 1){
              if (!list.length || list.length == 0) { that.setData({ flagtwo: false }) }
              else {
                var arr = [...that.data.list1, ...list];
                that.setData({
                  list1: arr,
                  flagtwo: true
                });
              }
            } else if (index == 2) {
              if (!list.length || list.length == 0) { that.setData({ flagthree: false }) }
              else {
                var arr = [...that.data.list2, ...list];
                that.setData({
                  list2: arr,
                  flagthree: true
                });
              }
            }
           
          }

        }

      });

    } else {
      wx.navigateBack();
    }
  },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  // 点击切换
  swichSwiperItem: function (event) {
    var that = this;
    let index = event.target.dataset.idx;
  
    that.getCustomers(index);
  },
  swiperChange: function (e) {
    // console.log("current：" + e.detail.current);
    let index = e.detail.current;//待拼团对应下标
    let that = this;
    let{changeone,changetwo,changethree}=that.data;
    this.setData({ curActIndex: index })
    switch(index){
      case 0: if (!changeone) { that.setData({ changeone: true }); this.getCustomers(index);}break;
      case 1: if (!changetwo) { that.setData({ changetwo: true }); this.getCustomers(index); } break;
      case 2: if (!changethree) { that.setData({ changethree: true }); this.getCustomers(index); } break;
      default: if (!changeone) { that.setData({ changeone: true }); this.getCustomers(index); } break;
    }
    
   

  }



})