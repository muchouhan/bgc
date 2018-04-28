App = {
  web3Provider: null,
  contracts: {},
  account: '0xa4392264a2d8c998901d10c154c91725b1bf0158',
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
          var l = confirm('Access denied! Take permission from the Employee to proceed');
          if (l == true) {
              return bgcInstance.addBGCRequest.sendTransaction(user_name_v, sessionStorage.orgAddress,
                { from: App.account, gas: 4700000 });
          }
        }else{
          sessionStorage.user_name = user_name_v;
          sessionStorage.employeeName = user_name_v;
          window.location = './viewEmployee.html';
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
        return new Promise(function(resolve, reject) {
                  reject(new Error('Valid username required!'));
        });
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
          return new Promise(function(resolve, reject) {
                    reject(new Error('Given Employee already Exist in network!'));
          });
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

 //function to create a new KYC profile
 editEmployee: function() {
    var data = App.getEmployeeInfo();
    var usnm = $('#username').val();
    var email = $('#email').val();
    var org_name = sessionStorage.orgName;

    if (usnm == "") {
        alert("Valid username required!");
        return new Promise(function(resolve, reject) {
                  reject(new Error('Valid username required!'));
        });
    }

    var bgcInstance;
    App.contracts.BGC.deployed().then(function(instance) {
         bgcInstance = instance;
         console.log("Check if Employee already exist in network"+localStorage.org_address);
          return bgcInstance.editEmployee.sendTransaction(org_name,usnm, data,email, {
            from: sessionStorage.orgAddress,
            gas: 500000
        });
    }).then(function(result) {
        console.log("editEmployee:"+result);
        alert("Customer profile updated successfully! Thank you!");
        window.location = './OrgHome.html';
    }).catch(function(err) {
        console.error(err);
    });

 },

 //function to create a new KYC profile
 deleteEmployee: function() {
       var usnm = $('#username').val();
       var email = $('#email').val();
       var org_name = sessionStorage.orgName;
        if (confirm("Are you sure you want to delete the BGC profile " + usnm + " ?") == false) {
               window.location = '../OrgHome.html';
               return false;
        }

        App.contracts.BGC.deployed().then(function(instance) {
              return bgcInstance.deleteEmployee.sendTransaction(org_name,usnm, email, {
                from: sessionStorage.orgAddress,
                gas: 500000
            });
        }).then(function(result) {
            console.log("deleteEmployee:"+result);
            alert("Customer profile deleted successfully! Thank you!");
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
         return new Promise(function(resolve, reject) {
                   reject(new Error('Password and Confirm Password must match!'));
         });
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
           return new Promise(function(resolve, reject) {
                     reject(new Error('Given username not Exist in network!'));
           });
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
       return new Promise(function(resolve, reject) {
                 reject(new Error('Given username not Exist in network!'));
       });
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
        $('#username').val(fields[0]);
        $('#first_name').text(result[1]);
        $('#first_name').val(result[1]);
        $('#middle_name').text(result[2]);
        $('#middle_name').val(result[2]);
        $('#last_name').text(result[3]);
        $('#last_name').val(result[3]);
        $('#occupation').text(result[4]);
        $('#occupation').val(result[4]);
        $('#income_range').text(result[5]);
        $('#income_range').val(result[5]);
        $('#DOB').text(result[6]);
        $('#DOB').val(result[6]);
        $('#gender_m').text(result[7]);
        $('#gender_m').val(result[7]);
        $('#address').text(result[8]);
        $('#address').val(result[8]);
        $('#phone_1').text(result[9]);
        $('#phone_1').val(result[9]);
        $('#phone_2').text(result[10]);
        $('#phone_2').val(result[10]);
        $('#country_res').text(result[11]);
        $('#country_res').val(result[11]);
        $('#email').text(fields[2]);
        $('#email').val(fields[2]);
        $('#org_name').text(fields[3]);
        $('#org_name').val(fields[3]);

      }).catch(function(err) {
        console.error(err);
      });
 },

showEmployeeBGCRequest: function () {
       var user = sessionStorage.employeeName;
       console.log("user:"+user);
       if(user==undefined) return;
       var bgcInstance;
       App.contracts.BGC.deployed().then(function(instance) {
           bgcInstance = instance;
           return bgcInstance.pendingBGCRequests(user, {
           from: App.account,
           gas: 500000
         });
       }).then(function(results) {
         console.log("pendingBGCRequests :"+results);
         if(results=="0x0000000000000000000000000000000000000000"){
           return new Promise(function(resolve, reject) {
                     reject(new Error('No pending bgc for employee!'));
           });
         }
         return bgcInstance.getOrgByAddress(results, {
            from: App.account,
            gas: 500000
          });
       }).then(function(org) {
         var address = org[2];
         sessionStorage.bgcOrg= org[2];
         console.log("getOrgByAddress:"+address);
           $( "#viewRequests" ).append("<div class=\"form-group\"><label class=\"col-md-4 control-label\" id = \"org_name\">" + org[0] + "</label><div class=\"col-md-4 inputGroupContainer\"><div class=\"input-group\"><button type=\"submit\" class=\"btn btn-success\" id = \"addKYCSend\" onclick = \"return App.allow(" + address + ")\">Allow </button> <button type=\"submit\" class=\"btn btn-danger\" id = \"addKYCSend1\" onclick = \"return App.deny(" + address + ")\">Deny </button> </div></div></div><br>");
       }).catch(function(err) {
         console.error(err);
       });
},

allow: function(address){
   console.log("address:"+address);
   var user = sessionStorage.employeeName;
   if(user==undefined) return;
   App.contracts.BGC.deployed().then(function(instance) {
       return instance.setBGCRequestAllow(user,sessionStorage.bgcOrg,true, {
             from: App.account,
             gas: 500000
       });
   }).then(function(result) {
      $( "#viewRequests").empty();
      alert("setBGCRequestAllow:"+result);
     console.log("setBGCRequestAllow:"+result);
   }).catch(function(err) {
     console.error(err);
   });
},

deny:function(address){
  var user = sessionStorage.employeeName;
  if(user==undefined) return;
  App.contracts.BGC.deployed().then(function(instance) {
      return instance.setBGCRequestAllow(user,sessionStorage.bgcOrg,false, {
            from: App.account,
            gas: 500000
      });
  }).then(function(result) {
    $( "#viewRequests").empty();
    console.log("setBGCRequestAllow:"+result);
  }).catch(function(err) {
    console.error(err);
  });
},

clickModifyBGC:function() {

  var user_name_m = $('#user_name_m').val();
  console.log("user_name_m"+user_name_m);
  var bgcInstance;
  App.contracts.BGC.deployed().then(function(instance) {
       bgcInstance = instance;
       return instance.viewEmployeeDetails(user_name_m, {
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
      return bgcInstance.isBGCAllowed(user_name_m, sessionStorage.orgAddress, {
          from: App.account,
          gas: 500000
      });
  }).then(function(result) {
      console.log("isBGCAllowed:"+result);
      if(!result){
        var l = confirm('Access denied! Take permission from the Employee to proceed');
        if (l == true) {
            return bgcInstance.addBGCRequest.sendTransaction(user_name_m, sessionStorage.orgAddress,
              { from: App.account, gas: 4700000 });
        }
      }else{
        sessionStorage.user_name_m = user_name_m;
        sessionStorage.employeeName = user_name_m;
       window.location = './modifyBGCForm.html';
      }
  }).then(function(result) {
      console.log("addBGCRequest:"+result);

  }).catch(function(err) {
      console.error(err);
  });

}



};
