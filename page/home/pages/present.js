
var app = getApp();
const trialProductListUrl = 'wxapp.php?c=product_v2&a=trial_product_list';//新品试用商品列表url

let errModalConfig = {   
  image: '../../../image/use-ruler.png',
  title: "您已经申请过啦，试试申请别的吧"
};
let successModalConfig = {
  firstText: '申请成功',
  // secondText: '赠品申请已提交，请到[订单-待审核]列表里查询，如果审核通过，将会出现在[订单-待收货]里',
  secondText: '赠品申请已提交，请到[订单-待收货]列表里查询',
  confirmText: '去查看',
  cancelText:'知道了'
};

Page({
  data:{
    showErrModal: false,         // 是否显示模态框
    showSuccessModal: false,     // 是否显示成功模态框
    errModalConfig,              // 模态框设置
    successModalConfig,          // 模态框设置
    loading: true,            // 是否正在加载
    presentData: null,        // 页面数据
    uid: null,//用户id
    store_id: app.store_id,//店铺id 
  },
  onLoad:function(options){
    var uid = wx.getStorageSync('userUid');
    this.setData({ uid,  showErrModal: false});
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
  },

  onShow:function(){
   // 生命周期函数--监听页面显示
    this.loadData();//页面加载
   
  },
  onHide:function(){
    // 生命周期函数--监听页面加载
  },
  
  /**
   * 加载所有数据
   */
  loadData() {
      this._loadListDataNew();
  },
  


  _loadListDataNew() {
    var that = this;
    var params = {
      "cid": "106",//分类id
      "sid": that.data.store_id,
      "uid": that.data.uid,
      // "page_size": "5",
      // "page_num": "1",
    };
    app.api.postApi(trialProductListUrl, { params}, (err, rep) => {
            if (err || rep.err_code!=0) {
                this.setData({loading: false});
                return;
            }
          
          
            this.setData({
              loading: false,
                presentData: rep.err_msg.list
            });
          
            
        });
  },
  
  /**
   * 进入赠品申请页面
   */
  applyForPresent(e) {
    let {options} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../common/pages/goods-detail?prodId=${options.product_id}&action=present`
    });
  },
  
  /**
   * 显示模态框
   */
  showModal(type='err', config) {  // type: success||err
    if(type === 'success') {
      this.setData({
        successModalConfig: config || successModalConfig,
        showSuccessModal: true
      });
    } else {
      this.setData({
        errModalConfig: config || errModalConfig,
        showErrModal: true
      });
    }
  },
  
  /**
   * 点击模态框的确定(处理相关事件)
   */
  tabConfirm() {
    wx.navigateTo({
      url: '../../common/pages/my-order?page=3',
    })
  },
/**
 * 点击模态框的取消（关闭模态框）
 */
  tabCancel(){
    this.setData({ showSuccessModal: false });
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
  },
  onShareAppMessage(res) {
      return { title: '', path: '' }
  },
})