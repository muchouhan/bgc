var BGC = artifacts.require("./BGC.sol");

// test suite
contract('BGC', function(accounts){
  var bgcInstance;
  it("should be initialized with empty values", function() {
    return BGC.deployed().then(function(instance) {
      return instance.getEmployeeSize();
    }).then(function(data) {
      console.log("getEmployeeSize:"+data);
      assert.equal(data.toNumber(), 0, "Employee size must be zero");
    })
  });

  it("should check whether given Employee exist!", function() {
    return BGC.deployed().then(function(instance) {
      bgcInstance = instance;
      return bgcInstance.isEmployeeExist("mukund","mukundchouhan220@gmail.com");
    }).then(function(flag) {
      console.log("isEmployeeExist:"+flag);
      assert.equal(flag, false, "mukund EWmployee already exist in network! ");
      var data = "mukund"+"!@#"+"Mukund"+"!@#"+""+"!@#"+"Chouhan"+"!@#"+"Service"+"!@#"+"10000"+"!@#"+"02-07-1984"+"!@#"+"Male"+"!@#"+"103 Jay ShivDarshan"+"!@#"+"8839202104"+"!@#"+"8976753506"+"!@#"+"India";
      return bgcInstance.addEmployee("","mukund",data,"mukundchouhan220@gmail.com",{from:web3.eth.accounts[1]});
    }).then(function(result) {
      console.log("addEmployee:"+result);
      //assert.equal(data[0], "LTI", "Org name must be LTI");
    });
  });

it("should check whether given organization has BGC permission!", function() {
  return BGC.deployed().then(function(instance) {
    bgcInstance = instance;
    return bgcInstance.viewEmployeeDetails("mukund");
  }).then(function(result) {
    console.log("viewEmployeeDetails:"+result);
    assert.equal(result[0], "mukund", "mukund Employee not found in database!! ");
    return bgcInstance.isBGCAllowed("mukund",web3.eth.accounts[1],{from:web3.eth.accounts[1]});
  }).then(function(result) {
       console.log("isBGCAllowed:"+result);
       assert.equal(result, false, "Access denied! Take permission from the Employee to proceed ");
       bgcInstance.addBGCRequest("mukund",web3.eth.accounts[1],{from:web3.eth.accounts[1]});
       return bgcInstance.addBGCRequest("mukund",web3.eth.accounts[2],{from:web3.eth.accounts[2]});
  }).then(function(result) {
      console.log("addBGCRequest:"+result);
    return bgcInstance.pendingBGCRequests("mukund",{from:web3.eth.accounts[1]});
  }).then(function(result) {
      console.log("Pending Request:"+result);
      //assert.equal(result, 1, "There is problem in BGC request ");
  });


});
});
