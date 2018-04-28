App = {
  web3Provider: null,
  contracts: {},
  account: '0x345ca3e014aaf5dca488057592ee47305d9b3e10',
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
  	    App.fillDetails();
        App.fillEmployeeForm();
        App.showEmployeeBGCRequest();
    });
  },

  //  function to execute on Sign up
  onSignUp: function() {
	  var username = $('#username').val();
	   if (username == "") {
			alert("Enter a valid username!");
			return;
		}

		 var pass = $('#password').val();
		if (pass == "") {
			alert("Enter a valid password!");
			return;
		}

		var reg = $('#reg_no').val();
		if (reg == "") {
			alert("Enter a valid registration number!");
			return;
		}
		if (confirm("I accept that the details provided are correct.") == false) {
			window.location = './index.html';
		}
		var bgcInstance;
		App.contracts.BGC.deployed().then(function(instance) {
		   bgcInstance = instance;
		   return instance.isOrgExist(username, reg, {
				from: App.account,
				gas: 500000
		  });
		}).then(function(result) {
			console.log("isOrgExist result:"+result);
			if(result){
				alert("Given Org already Exist in network!");
        return new Promise(function(resolve, reject) {
                  reject(new Error('Given Org already Exist in network!'));
            });
			}
			return bgcInstance.addOrg.sendTransaction(username, reg,pass, {
					from: pass,
					gas: 500000
			});
		}).then(function(result) {

      return bgcInstance.getOrgSize( {
       from: pass,
       gas: 500000
      });

    }).then(function(result) {
        console.log(result.toNumber());
        if(result.toNumber()>0){
          alert(username + " has been successfully added to the network!\n"+"Login from the \"Login\" Tab on the top-right side of the webpage. \n Thank you for choosing BGC chain!");
        }
    }).catch(function(err) {
		  console.error(err);
		});
 },

// this function is called on clicking log in button in the pop up that appears while logging in

 onLogin:function() {

	 var username_l = $('#username_l').val();
	 var pass_l = $('#password_l').val();

    //  validate input
    if (username_l == "") {
        alert("Enter a valid bank name!");
        return;
    }
    if (pass_l == "") {
        alert("Enter a valid password!");
        return;
    }

    App.contracts.BGC.deployed().then(function(instance) {
      console.log(username_l);
       return instance.getOrgSize( {
        from: pass_l,
        gas: 500000
      });
    }).then(function(result) {
      console.log("getOrg:"+result);
    }).catch(function(err) {
      console.error(err);
    });

		App.contracts.BGC.deployed().then(function(instance) {
			console.log(username_l,pass_l);
		   return instance.authenticateOrg(username_l,pass_l, {
				from: pass_l,
				gas: 500000
		  });
		}).then(function(result) {
			console.log("authenticateOrg:"+result);
			if (!result) {
				alert("Bank not in network. Sign up before proceeding further. Thank You!");
        return new Promise(function(resolve, reject) {
                  reject(new Error('Bank not in network. Sign up before proceeding further. Thank You!'));
        });
			}else{
				sessionStorage.orgName = username_l;
        sessionStorage.orgAddress = pass_l;
				window.location = './OrgHome.html';
			}
		}).catch(function(err) {
		  console.error(err);
		});
},

//  function to fill Bank details
 fillDetails: function() {
	    var org_name = $('#org_name');
	  	var reg_no = $('#reg_no');
		  var emp_count = $('#emp_count');
      var org = sessionStorage.orgName;
  		console.log("Org name:"+org);
      if(org == undefined) return ;
  		App.contracts.BGC.deployed().then(function(instance) {
  		return instance.getOrg(org, {
  				from: App.account,
  				gas: 500000
  		  });
  		}).then(function(result) {
  			console.log(result);
  			org_name.text(result[0]);
  			reg_no.text(result[1]);
  			emp_count.text(result[3])
  		}).catch(function(err) {
  		  console.error("Erro is :"+err);
  		});

 },

 //  function to view a KYC profile

viewBGCDetails: function () {
    var user_name_v = $('#user_name_v').val();

    var bgcInstance;
    App.contracts.BGC.deployed().then(function(instance) {
         bgcInstance = instance;
         return instance.viewEmployeeDetails(user_name_v, {
            from: sessionStorage.orgAddress,
            gas: 500000
         });
    }).then(function(result) {
        console.log("viewEmployeeDetails result:"+result);
        if(result[0]==""){
          alert("Customer not found in database!");
          return new Promise(function(resolve, reject) {
                    reject(new Error('Customer not found in database!'));
          });
        }
        return bgcInstance.isBGCAllowed(user_name_v, sessionStorage.orgAddress, {
            from: App.account,
            gas: 500000
        });
    }).then(function(result) {
        console.log("isBGCAllowed:"+result);
        if(!result){
          var l = confirm('Access denied! Take permission from the customer to proceed');
          if (l == true) {
              return bgcInstance.addBGCRequest.sendTransaction(user_name_v, sessionStorage.orgAddress,
                { from: App.account, gas: 4700000 });
          }
        }else{
          sessionStorage.user_name = user_name_v;
          window.location = './viewForm.html';
        }
    }).then(function(result) {
        console.log("addBGCRequest:"+result);

    }).catch(function(err) {
        console.error(err);
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
         return instance.viewEmployeeDetails(user, {
          from: App.account,
          gas: 500000
        });
      }).then(function(fields) {
        console.log("viewEmployeeDetails fields:"+fields);
        var result = fields[1].split('!@#');

        $('#username').text(fields[0]);
        $('#first_name').text(result[1]);
        $('#middle_name').text(result[2]);
        $('#last_name').text(result[3]);
        $('#occupation').text(result[4]);
        $('#income_range').text(result[5]);
        $('#DOB').text(result[6]);
        $('#gender_m').text(result[7]);
        $('#address').text(result[8]);
        $('#phone_1').text(result[9]);
        $('#phone_2').text(result[10]);
        $('#country_res').text(result[11]);
        $('#email').text(fields[2]);
        $('#org_name').text(fields[3]);

      }).catch(function(err) {
        console.error(err);
      });
 },

showEmployeeBGCRequest: function () {

},






};
