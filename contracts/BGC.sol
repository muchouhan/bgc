pragma solidity ^0.4.18;

import "./StringUtils.sol";

contract BGC {

  struct Organization {
    string name;
    string regNumber;
    address password;
    uint empCount;
  }

  struct Employee {
        address empAddr;
        string password;
        string fName;
        string lName;
        string cAddress;
        uint mobile;
        address currentOrgAddr;
        uint experience;
    }

  mapping(address => Organization) orgs;
  address[] public orgsAddr;

  mapping(address => Employee) emps;
  address[] public empsAddr;

  function BGC() public {
  }

  function isOrgExist(string _name,string _regNumber) public view returns (bool) {
    for(uint i = 0;i < orgsAddr.length; ++ i) {
        if(StringUtils.equal(orgs[orgsAddr[i]].name, _name) && StringUtils.equal(orgs[orgsAddr[i]].regNumber, _regNumber))
            return true;
    }
    return false;
  }

  function addOrg(string _name,string _regNumber,address _password) public {
    orgs[_password] = Organization(_name,_regNumber,_password,0);
    orgsAddr.push(_password);
  }

  function getOrg(address ins) public view returns (string,string,address,uint) {
    return (orgs[ ins].name,orgs[ins].regNumber,orgs[ins].password,orgs[ins].empCount);
  }

  function getOrgSize() public view returns (uint) {
    return orgsAddr.length;
  }

  function authenticateOrg(string org, address _password) public view returns (bool) {
    return StringUtils.equal(orgs[_password].name,org);
  }

  ///////////////////////Employee /////////////////

  function addEmployee(string _password,string _fName,string _lName,string _cAddress,uint _mob,address _org,uint _exp) public {
    emps[msg.sender] = Employee({empAddr:msg.sender,password:_password,fName:_fName,lName:_lName,cAddress:_cAddress,mobile:_mob,currentOrgAddr:_org,experience:_exp});
    empsAddr.push(msg.sender);
  }

  function getEmployee(address ins) public view returns (string,string,string,uint,address,uint) {
    return (emps[ins].fName,emps[ins].lName,emps[ins].cAddress,emps[ins].mobile,emps[ins].currentOrgAddr,emps[ins].experience);
  }

  function getEmployeeSize() public view returns (uint) {
    return empsAddr.length;
  }

  function authenticateEmployee(address empAddr, string _password) public view returns (bool) {
    return StringUtils.equal(emps[empAddr].password,_password);
  }

}
