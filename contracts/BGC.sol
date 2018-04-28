pragma solidity ^0.4.18;

import "./StringUtils.sol";

contract BGC {

  struct Organization {
    string name;
    string regNumber;
    address password;
    uint256 empCount;
  }

  struct Employee {
        string password;
        string username;
        string data;
        string email;
        address currentOrgAddr;
    }

  struct Request {
       string uname;
       address orgAddress;
       bool isAllowed;
   }

  Organization[] orgs;
  Employee[] emps;
  Request[] bgcRequests;

  function BGC() public {
  }

  function isOrgExist(string _name,string _regNumber) public view returns (bool) {
    for (uint256 i = 0; i < orgs.length; ++i) {
         if(StringUtils.equal(orgs[i].name, _name) && StringUtils.equal(orgs[i].regNumber, _regNumber))
          return true;
    }
    return false;
  }

  function addOrg(string _name,string _regNumber,address _password) public returns(uint256) {
     orgs.push(Organization(_name,_regNumber,_password,0));
     return orgs.length;
  }

  function getOrg(string _name) public view returns (string,string,address,uint256) {
    for(uint256 i=0; i < orgs.length; ++i) {
         if(StringUtils.equal(orgs[i].name, _name))
            return (orgs[i].name,orgs[i].regNumber,orgs[i].password,orgs[i].empCount);
    }
  }

  function getOrgSize() public view returns (uint) {
    return orgs.length;
  }

  function authenticateOrg(string org_name, address _password) public view returns (bool) {
    for (uint256 i = 0; i < orgs.length; ++i) {
         if(StringUtils.equal(orgs[i].name, org_name) && orgs[i].password == _password)
          return true;
    }
    return false;
  }

  ///////////////////////Employee ////////////////
   function addEmployee(string _org,string _username,string _data,string _email) public returns (uint256) {
      emps.push(Employee( "", _username, _data, _email,msg.sender));
      for(uint256 i=0; i < orgs.length; ++i) {
           if(StringUtils.equal(orgs[i].name, _org) && orgs[i].password == msg.sender){
               orgs[i].empCount++;
              return orgs[i].empCount;
           }
      }
      return 0;
    }

    function isEmployeeExist(string _username,string _email) public view returns (bool) {
      for (uint256 i = 0; i < emps.length; ++i) {
           if(StringUtils.equal(emps[i].username, _username) && StringUtils.equal(emps[i].email, _email))
            return true;
      }
      return false;
    }

    function getEmployeeSize() public view returns (uint) {
      return emps.length;
    }

    function isUserExist(string _username) public view returns (bool) {
       for (uint256 i = 0; i < emps.length; ++i) {
            if(StringUtils.equal(emps[i].username, _username))
              return true;
       }
       return false;
     }

     function setPassword(string _username,string _password) public {
           for (uint256 i = 0; i < emps.length; ++i) {
                if(StringUtils.equal(emps[i].username, _username))
                 emps[i].password=_password;
           }
     }

    function authenticateEmployee(string _username, string _password) public view returns (bool) {
           for (uint256 i = 0; i < emps.length; ++i) {
                if (StringUtils.equal(emps[i].username, _username) && StringUtils.equal(emps[i].password, _password))
                  return true;
           }
           return false;
    }

    function viewEmployeeDetails(string _name) public view returns (string,string,string,address) {
      for(uint256 i=0; i < emps.length; ++i) {
           if(StringUtils.equal(emps[i].username, _name))
              return (emps[i].username, emps[i].data, emps[i].email, emps[i].currentOrgAddr);
      }
    }

///////////////////////////////BGC//////////////////////////
    function addBGCRequest(string _uname, address _orgAddress) public {
             for(uint256 i = 0; i < bgcRequests.length; ++ i) {
                 if(StringUtils.equal(bgcRequests[i].uname, _uname) && bgcRequests[i].orgAddress == _orgAddress) {
                     return;
                 }
             }
             bgcRequests.push(Request(_uname, _orgAddress, false));
    }

    function isBGCAllowed(string _uname, address _orgAddress) public view returns(bool) {
       for(uint256 i = 0; i < bgcRequests.length; ++i) {
           if(StringUtils.equal(bgcRequests[i].uname, _uname)
              && bgcRequests[i].orgAddress == _orgAddress
              && bgcRequests[i].isAllowed) {
               return true;
           }
       }
       return false;
   }

   function getEmployeeBGCSize() public view returns (uint) {
     return bgcRequests.length;
   }


   function pendingBGCRequests(string uname) public view returns(address)  {
      for(uint256 i=0; i < bgcRequests.length; ++i) {
          if(StringUtils.equal(bgcRequests[i].uname, uname)
              && bgcRequests[i].isAllowed == false)
                return bgcRequests[i].orgAddress;
      }
   }

   function getOrgByAddress(address _address) public view returns (string,string,address,uint256) {
     for(uint256 i=0; i < orgs.length; ++i) {
          if(orgs[i].password == _address)
             return (orgs[i].name,orgs[i].regNumber,orgs[i].password,orgs[i].empCount);
     }
   }

   function setBGCRequestAllow(string _uname, address _orgAddress, bool isAllowed) public {
       for(uint i = 0; i < bgcRequests.length; ++ i) {
           if(StringUtils.equal(bgcRequests[i].uname, _uname) && bgcRequests[i].orgAddress == _orgAddress) {
               if(isAllowed) {
                   bgcRequests[i].isAllowed = true;
               } else {
                   for(uint j=i; j < bgcRequests.length-2; ++j) {
                       bgcRequests[i] = bgcRequests[i+1];
                   }
                   bgcRequests.length --;
               }
               return;
           }
       }
   }


   function editEmployee(string _org,string _username,string _data,string _email) public {
       for(uint i = 0; i < emps.length; ++ i) {
         if(StringUtils.equal(emps[i].username, _username) && StringUtils.equal(emps[i].email, _email)){
               emps[i].data = _data;
               return;
           }
       }
   }


   function deleteEmployee(string _org,string _username,string _email) public {
          for(uint i = 0; i < emps.length; ++ i) {
            if(StringUtils.equal(emps[i].username, _username) && StringUtils.equal(emps[i].email, _email)){
                  for(uint j = i+1;j < emps.length; ++ j) {
                      emps[i-1] = emps[i];
                  }
                  emps.length --;
              }
          }
      }





}
