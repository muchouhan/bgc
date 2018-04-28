App = {
  web3Provider: null,
  contracts: {},
  account: "0xb9b7e0cb2edf5ea031c8b297a5a1fa20379b6a0a",
  loading: false,

  init: function() {
    // initialize web3
    if(typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //create a new provider and plug it directly into our local node
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

	App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
		  console.log("App.account:"+App.account);
        App.account = account;
      }
    });
  },

  initContract: function() {
    $.getJSON('BGC.json', function(contractArtifect) {

      // get the contract artifact file and use it to instantiate a truffle contract abstraction
      App.contracts.BGC = TruffleContract(contractArtifect);

	    // set the provider for our contracts
      App.contracts.BGC.setProvider(App.web3Provider);
      App.fillEmployeeForm();
    });
  },



 //function to create a new KYC profile
addEmployee: function() {
    var data = App.getEmployeeInfo();
    var usnm = $('#username').val();
    var email = $('#email').val();
    var org_name = sessionStorage.orgName;

    if (usnm == "") {
        alert("Valid username required!");
        window.location = './OrgHome.html';
        return;
    }

    var bgcInstance;
    App.contracts.BGC.deployed().then(function(instance) {
         bgcInstance = instance;
         console.log("Check if Employee already exist in network"+localStorage.org_address);
         return instance.isEmployeeExist(usnm.toString(), email.toString(), {
            from: sessionStorage.orgAddress,
            gas: 500000
         });
    }).then(function(result) {
        console.log("isEmployeeExist result:"+result);
        if(result){
          alert("Given Employee already Exist in network!");
          return;
        }
        console.log("before addEmployee:"+org_name,usnm, data,email);
        return bgcInstance.addEmployee.sendTransaction(org_name,usnm, data,email, {
            from: sessionStorage.orgAddress,
            gas: 500000
        });
    }).then(function(result) {
        console.log("addEmployee:"+result);
        alert("Customer profile successfully created! Check the customer details from the view form tab. Thank you!");
        window.location = './OrgHome.html';
    }).catch(function(err) {
        console.error(err);
    });

},

//  function to create a new KYC profile
getEmployeeInfo: function() {
  var data =  $('#username').val() + "!@#" + $('#first_name').val() + "!@#" + $('#middle_name').val() + "!@#" +  $('#last_name').val() + "!@#" + $('#occupation').val() + "!@#" + $('#income_range').val() + "!@#" + $('#DOB').val() + "!@#";
     if ($('#gender_m').val())
         data = data + "Male";
     else
         data = data + "Female";
     data = data + "!@#" + $('#address').val() + "!@#" + $('#phone_1').val() + "!@#" + $('#phone_2').val() + "!@#" + $('#country_res').val() + "!@#";
     return data;
},


employeeSignUp: function() {
      var username =  $('#usernamesignup').val();
      var password =  $('#passwordsignup').val();
      var cpassword =  $('#passwordsignup_confirm').val();
       if (password!=cpassword){
         alert("Password and Confirm Password must match!");
         return;
       }

       var bgcInstance;
       App.contracts.BGC.deployed().then(function(instance) {
          bgcInstance = instance;
          console.log("Check if Organization created Employee username in network");
          return bgcInstance.isUserExist(username, {
           from: App.account,
           gas: 500000
         });
       }).then(function(result) {
         console.log("isUserExist result:"+result);
         if(!result){
           alert("Given username not Exist in network!");
           return;
         }

         return bgcInstance.setPassword.sendTransaction(username, password, {
             from: App.account,
             gas: 500000
         });
       }).then(function(result) {
         console.log("setPassword:"+result);
         window.location = './employeeLogin.html#tologin';
       }).catch(function(err) {
         console.error(err);
       });

},

employeeLogin: function() {

  var username =  $('#username').val();
  var password =  $('#password').val();

   var bgcInstance;
   App.contracts.BGC.deployed().then(function(instance) {
      bgcInstance = instance;
      console.log("Check if Organization created Employee username in network");
      return instance.authenticateEmployee(username,password, {
       from: App.account,
       gas: 500000
     });
   }).then(function(result) {
     console.log("authenticateEmployee result:"+result);
     if(!result){
       alert("Given username not Exist in network!");
       return;
     }
     sessionStorage.employeeName=username;
     window.location = './employeeHome.html';
   }).catch(function(err) {
     console.error(err);
   });

},

fillEmployeeForm: function () {
      var user = sessionStorage.employeeName;
      console.log("user:"+user);
      if(user==undefined) return;
      App.contracts.BGC.deployed().then(function(instance) {
         console.log("fetch employee details from network");
         return instance.viewEmployeeDetails(username, {
          from: App.account,
          gas: 500000
        });
      }).then(function(result) {
        console.log("viewEmployeeDetails result:"+result);

      }).catch(function(err) {
        console.error(err);
      });
}







};
