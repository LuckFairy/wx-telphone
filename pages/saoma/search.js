Page({
  data: {
    inputShowed: true,
    results: [{ title: '美赞臣店', text: '广州市海珠区赤岗北路6号B区301铺'},
      { title: '雀巢婴儿店', text: '广州市海珠区赤岗北路6号B区301铺' }],
    inputVal: ""
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  }
});