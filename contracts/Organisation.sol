pragma solidity >=0.4.19 <0.6.0;


contract Organisation {

 
 mapping(bytes16 => uint) private usernameToIndex;
 bytes16[] private usernames;
 bytes[] private ipfsHashes;

 constructor() public {
    // mappings are virtually initialized to zero values so we need to "waste" the first element of the arrays
    // instead of wasting it we use it to create a user for the contract itself

    usernames.push('test-org');
    ipfsHashes.push('not-available');
}

 function usernameTaken(bytes16 username) public view returns(bool takenIndeed)
  {
    return (usernameToIndex[username] > 0 || username == 'test-org');
  }

  function createOrganisation(bytes16 username, bytes memory ipfsHash) public returns(bool success)
  {
    
    require(!usernameTaken(username));
    usernames.push(username);
    ipfsHashes.push(ipfsHash);
    return true;
  }

  function getUserCount() public view returns(uint count)
  {
    return usernames.length;
  }
  function getUsernameByIndex(uint index) public view returns(bytes16 username)
  {
    require(index < usernames.length);
    return usernames[index];
  }

  function getIpfsHashByIndex(uint index) public view returns(bytes memory ipfsHash)
  {
    require(index < usernames.length);
    return ipfsHashes[index];
  }

}