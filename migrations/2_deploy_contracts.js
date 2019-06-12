var User = artifacts.require("./User.sol");
var FundingHub = artifacts.require("./FundingHub.sol");
var Organisation = artifacts.require("./Organisation.sol");

module.exports = function(deployer) {
  deployer.deploy(User);
  deployer.deploy(Organisation);
  deployer.deploy(FundingHub,10);
};
