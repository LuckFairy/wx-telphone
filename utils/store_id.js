var app = getApp();
var store_Id = {
  shopid: app.store_id,
  store_Id:function (){
    return this.shopid
  }
}
module.exports = { store_Id};