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

it("should check whether given organization exist!", function() {
  //forget Password
  //create new accounts
  //org login
  //org details
  //initiate kyc
  //view pending kyc
  //Employee create
  //forget password Employee
  //login Employee
  //allow kyc
  //view Employee detail

});
});
