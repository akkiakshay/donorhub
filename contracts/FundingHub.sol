pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;

contract FundingHub {
    uint minimumEntryFee;
    struct Project {
        address addr;
        string name;
        string url;
        uint goal;
        uint funds;
        bool initialized;
        string creator;
    }

    struct Contribution {
        string from;
        string to;
        uint amount;
    }
    mapping (address => Project) public projects;
    Contribution[] public contributors;
    address[] public projectAddresses;
    uint public numberOfProjects;
    event ProjectSubmitted(address addr, string name, string url,uint goal, bool initialized,string creator);
    event ProjectSupported(address addr, uint amount);
    event Contrib(string[] projectcontrib);

    constructor(uint _minimumEntryFee) public {
        minimumEntryFee = _minimumEntryFee;
    }
    function submitProject(string memory name, string memory url,uint goal,string memory username) payable public returns (bool success) {

        if (msg.value < minimumEntryFee) {
            revert("minimumEntryFee greater");
        }
      
        if (!projects[msg.sender].initialized) {
            projects[msg.sender] = Project(msg.sender, name, url,goal, 0, true,username);
            projectAddresses.push(msg.sender);
            numberOfProjects = projectAddresses.length;
            emit ProjectSubmitted(msg.sender, name, url,goal, projects[msg.sender].initialized,username);
            return true;
        }
        return false;
    }

    function toString(address x) public pure returns (string memory)
    {
       bytes32 value = bytes32(uint256(x));
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(42);
    str[0] = '0';
    str[1] = 'x';
    for (uint i = 0; i < 20; i++) {
        str[2+i*2] = alphabet[uint(value[i + 12] >> 4)];
        str[3+i*2] = alphabet[uint(value[i + 12] & 0x0f)];
    }
    return string(str);
    }
    
    function uint2str(uint i) internal pure returns (string){
    if (i == 0) return "0";
    uint j = i;
    uint length;
    while (j != 0){
        length++;
        j /= 10;
    }
    bytes memory bstr = new bytes(length);
    uint k = length - 1;
    while (i != 0){
        bstr[k--] = byte(48 + i % 10);
        i /= 10;
    }
    return string(bstr);
    }

    function supportProject(address addr) payable public returns (bool success) {
        if (msg.value <= 0) {
            revert("value less");
        }
       
        if (!projects[addr].initialized) {
            revert("Not initialized nigga");
        }
        if (projects[addr].goal >= projects[addr].funds + msg.value) {
            projects[addr].funds += msg.value;
            contributors.push(Contribution(toString(msg.sender),toString(addr),msg.value));
            emit ProjectSupported(addr, msg.value);
            return true;
        }
        revert("Errrooooooooooooooooooor");
        
    }


    function getProjectInfo(address addr) public view returns (string memory , string memory ,uint , uint ,string memory,address) {
        Project storage project = projects[addr];
        if (!project.initialized) {
            revert("Shits not initialised");
        }
        return (project.name, project.url, project.goal, project.funds, project.creator,project.addr);
    }
    
    function compareStrings(string memory a,string memory b) public pure returns(bool)
    {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );
    }
    
    function getProjectByUser(string memory username) public view returns (address[] memory)
    {
       address[] memory creatorprojects = new address[](5);
       uint j = 0;
       for(uint i = 0; i < projectAddresses.length ; i++)
       {
           if(compareStrings(projects[projectAddresses[i]].creator,username))
           {
               creatorprojects[j++] = (projectAddresses[i]);
           }
       }
       return creatorprojects;
    }

    function fundsCollectedByUser(string memory username) public view returns(uint)
    {
        uint funds = 0;
        for(uint i = 0 ; i < projectAddresses.length ; i++)
        {
            if(compareStrings(projects[projectAddresses[i]].creator,username))
           {
               funds = funds + projects[projectAddresses[i]].funds;
           }
        }
        return funds;
    }

    function getContributors(string memory projaddr) public view returns (string[] memory)
    {
        string[] memory projectcontrib = new string[](10);
        uint j = 0;
        for(uint i = 0 ; i < contributors.length ; i++)
        {
            if(compareStrings(projaddr, contributors[i].to))
            {
                projectcontrib[j] = string(abi.encodePacked(contributors[i].from,'-', uint2str(contributors[i].amount)));
                j = j+1;
            }

        }
        emit Contrib(projectcontrib);
        return projectcontrib;
    }
}