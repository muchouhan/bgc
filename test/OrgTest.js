var BGC = artifacts.require("./BGC.sol");

// test suite
contract('BGC', function(accounts){
  var bgcInstance;
  it("should be initialized with empty values", function() {
    return BGC.deployed().then(function(instance) {
      return instance.getOrgSize();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "Org size must be zero");
    })
  });

  it("should check whether given organization exist!", function() {
    return BGC.deployed().then(function(instance) {
      bgcInstance = instance;
      return bgcInstance.isOrgExist("LTI","123456");
    }).then(function(flag) {
      console.log("isOrgExist:"+flag);
      assert.equal(flag, false, "LTI organization already exist in network! ");
      return bgcInstance.addOrg("LTI","123456",web3.eth.accounts[1],{from:web3.eth.accounts[1]});
    }).then(function() {
      return bgcInstance.getOrg("LTI");
    }).then(function(data) {
      console.log("getOrg:"+data);
      assert.equal(data[0], "LTI", "Org name must be LTI");
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
