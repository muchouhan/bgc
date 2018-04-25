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
    console.log("pass:"+pass);

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
			console.log("result:"+result);
			if(result){
				alert("Given already Exist in network!");
				return;
			}
			return bgcInstance.addOrg.sendTransaction(username, reg,pass, {
					from: App.account,
					gas: 500000
			});
		}).then(function(instance) {
			console.log(instance);
		}).catch(function(err) {
		  console.error(err);
		});

    alert(username + " has been successfully added to the network!");
    alert("Login from the \"Login\" Tab on the top-right side of the webpage. \n Thank you for choosing KYC chain!");

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

		var bgcInstance;
		App.contracts.BGC.deployed().then(function(instance) {
			bgcInstance = instance;
			console.log(pass_l);
		   return instance.getOrg(pass_l, {
				from: App.account,
				gas: 500000
		  });
		}).then(function(result) {
			console.log(result);
			if (! result[0]=="") {
				alert("Bank not in network. Sign up before proceeding further. Thank You!");
				return;
			}else{
				localStorage.org_address = pass_l;
				window.location = './pages/OrgHome.html';
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
		
		App.contracts.BGC.deployed().then(function(instance) {
		return instance.getOrg(localStorage.org_address, {
				from: App.account,
				gas: 500000
		  });
		}).then(function(result) {
			console.log(result);
			org_name.text(result[0]);
			reg_no.text(result[1]);
			emp_count.text(result[3])
		}).catch(function(err) {
		  console.error(err);
		});
	
 }









};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
