var app = getApp()
Page({
  data: {
    awardsList: {},
    animationData: {},
    btnDisabled: '',
    numData:"2",
    textShow:false,
    textMsg:"",
    first:"",
    second:"",
    third:"",
    info:"",
    firstnums:"",
    secondnums:"",
    thirdnums:"",
    awardIndex:"",
    // retoteNum:1,
    tap:true,//节流阀,
    runDegs:"",
    status:"",
    end:"",
    prizeinfo:""
  },
  onLoad:function(){
    var that=this;
    //app.api.fetchApi("lottery/home", (err, resp) => {
    let params = {
      uid: 91,
      id: '21', //活动id
    }  
    let url = "wxapp.php?c=lottery&a=detail";  
    app.api.postApi(url, { params }, (err, resp) => {  
      console.log('大转盘信息',resp);
      let data = resp.err_msg;
      let end = data.end;
      let info = data.info;
      let startdate = data.startdate;
      let enddate = data.enddate;
      let prize = data.prize;
      let winprize = data.winprize;
      if (end == 1) {
          setTimeout(function () {
            that.setData({
              textMsg: winprize,
              textShow: true,
              end
            })
          }, 1)
          // return false;
      }else{
        that.setData({
          first: prize[0].product_name,
          second: prize[1].product_name,
          third: prize[2].product_name,
          info,
          firstnums: prize[0].product_num,
          secondnums: prize[1].product_num,
          thirdnums: prize[2].product_num,
          end,

        })
      }
   });
  },
  //获得我想要的一个随机数
  getNum: function(){
    var Arr = [30, 90, 150, 270,330];  
    var n = Math.floor(Math.random() * Arr.length + 1) - 1;  
    var arrnum = Arr[n];
    return arrnum;
  },
  //单击事件
  enterFreshen:function(){
    console.log('单击事件');
    console.log(this.data.end);
    var that = this;
    //如果end为0，就要去掉这个回转归位的动画。
    if (that.data.end == 1){
      wx.showLoading({ title: '' });
      setTimeout(function () {
        wx.hideLoading();
      },1)
    }
    wx.showLoading({ title: '准备中，请稍候'});
    setTimeout(function(){
      wx.hideLoading();
    },1000)
  
    that.setData({
      // retoteNum: 0,
      tap:true //节流阀
    })
    var status = that.data.status;
    var awardIndex = that.data.awardIndex;
    var runDegs = that.data.runDegs;
     if (awardIndex == 7) {
      console.log(runDegs,"111");
      if (runDegs=750){
        app.runDegs = 720;
      } else if (runDegs == 810){
        app.runDegs= 810
      }
    } else if (awardIndex == 1) {
      app.runDegs =  (30 * 0);

    } else if (awardIndex == 2) {
      app.runDegs = 360 - (30 * (awardIndex))+60;
    
    } else if (awardIndex == 3) {
      app.runDegs = 360 - (30 * (awardIndex + 1))+120;
   
    } else if (awardIndex == 4) {
      app.runDegs = 360 - (30 * (awardIndex + 2))+180;
    
    } else if (awardIndex == 5) {
      app.runDegs = 360 - (30 * (awardIndex + 3))+240;
     
    } else if (awardIndex == 6) {
      app.run = 360 - (30 * (awardIndex + 4))+300;
 
    } 
    var animationRun2 = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease'
    })
    animationRun2.rotate(app.runDegs).step();
    that.setData({
      animationData: animationRun2.export(),
    });
    that.setData({
      textShow: false,
    });
    
  },
  //点击抽奖
  getLottery: function (){
    // var retoteNum = this.data.retoteNum;
    
    var tap=this.data.tap;
    if (tap){
      this.setData({
        tap: false
      })
        //做节流阀
      let params = {
        uid: 91,
        id: '21', //活动id
      }
      let url = "wxapp.php?c=lottery&a=get_prize";
      app.api.postApi(url, { params }, (err, resp) => {  
        console.log(resp,"11111111111111");
        var that = this;
        let data = resp.err_msg;

        if (resp.err_code !=0) {
          
          setTimeout(function () {
            that.setData({
              textMsg: data,
              textShow: true
            })
          }, 1)
          return false;

        } else {
          console.log('可以抽奖');
         
          var awardIndex = data.prizetype;
          var status = 1;
          this.setData({
            awardIndex: awardIndex,
            status: status
          })
          var runNum = 4;//这里最好就是要4，不要轻易改
          // 旋转抽奖
          var num = that.getNum();
          app.runDegs =  0;
          //开始时角度
          console.log('deg', app.runDegs)
          // var rotote = that.data.retoteNum;
          if (status == 1) {
            if (awardIndex == 7) {
              app.runDegs =  (360 * runNum + num);
            } else {
              // if (retoteNum == 1) {
                if (awardIndex == 1) {
                  app.runDegs =  (360 * runNum) + (30 * 0);
                } else if (awardIndex == 2) {
                  app.runDegs =  (360 * runNum) + (30 * (awardIndex + 8))
                } else if (awardIndex == 3) {
                  app.runDegs =  (360 * runNum) + (30 * (awardIndex + 5))
                } else if (awardIndex == 4) {
                  app.runDegs =  (360 * runNum) + (30 * (awardIndex + 2))
                } else if (awardIndex == 5) {
                  app.runDegs =  (360 * runNum) + (30 * (awardIndex - 1))
                } else if (awardIndex == 6) {
                  app.runDegs =  (360 * runNum) + (30 * (awardIndex - 4))
                }
              // }
              //  else {
              //   //从这里接过去
              //   if (awardIndex == 1) {
              //     app.runDegs = app.runDegs + (360 * runNum) + (30 * 0);
              //   } else if (awardIndex == 2) {
              //     app.runDegs = app.runDegs + (360 * runNum) + (30 * awardIndex);
              //   } else if (awardIndex == 3) {
              //     app.runDegs = app.runDegs + (360 * runNum) + (30 * (awardIndex + 1));
              //   } else if (awardIndex == 4) {
              //     app.runDegs = app.runDegs + (360 * runNum) + (30 * (awardIndex + 2));
              //   } else if (awardIndex == 5) {
              //     app.runDegs = app.runDegs + (360 * runNum) + (30 * (awardIndex + 3));
              //   } else if (awardIndex == 6) {
              //     app.runDegs = app.runDegs + (360 * runNum) + (30 * (awardIndex + 4));
              //   }
              // }
            }
          }
          //结束时转了多少度,存起来
          that.setData({
            runDegs: app.runDegs
          })
          console.log('deg', app.runDegs);
          var animationRun = wx.createAnimation({
            duration: 4000,
            timingFunction: 'ease'
          })
        
          // that.animationRun = animationRun
          animationRun.rotate(app.runDegs).step();
          that.setData({
            animationData: animationRun.export(),
          })

          setTimeout(function () {
            that.setData({
              textMsg: data.product_name,
              textShow: true
            })
          }, 4000)
        }
      })
    }
  },
})