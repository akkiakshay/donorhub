pragma solidity >=0.4.21 <0.6.0;


contract Project {

    struct Properties {
        uint goal;
        uint deadline;
        string title;
        address creator;
    }

    struct Contribution {
        uint amount;
        address contributor;
    }

    address public fundingHub;

    mapping (address => uint) public contributors;
    mapping (uint => Contribution) public contributions;

    uint public totalFunding;
    uint public contributionsCount;
    uint public contributorsCount;

    Properties public properties;

    event LogContributionReceived(address projectAddress, address contributor, uint amount);
    event LogPayoutInitiated(address projectAddress, address owner, uint totalPayout);
    event LogRefundIssued(address projectAddress, address contributor, uint refundAmount);
    event LogFundingGoalReached(address projectAddress, uint totalFunding, uint totalContributions);
    event LogFundingFailed(address projectAddress, uint totalFunding, uint totalContributions);

    event LogFailure(string message);

    modifier onlyFundingHub {
        if (fundingHub != msg.sender) revert();
        _;
    }

    modifier onlyFunded {
        if (totalFunding < properties.goal) {
            revert();
        }
        _;
    }

    constructor(uint _fundingGoal, uint _deadline, string memory _title, address _creator) public {

        // Check to see the funding goal is greater than 0
        if (_fundingGoal <= 0) {
            emit LogFailure("Project funding goal must be greater than 0");
            revert("goal shit");
        }

        // Check to see the deadline is in the future
        if (block.number >= _deadline) {
            emit LogFailure("Project deadline must be greater than the current block");
            revert("block shit");
        }

        // Check to see that a creator (payout) address is valid
        if (_creator == address(0)) {
            emit LogFailure("Project must include a valid creator address");
            revert("creator shit");
        }

        fundingHub = msg.sender;

        // initialize properties struct
        properties = Properties({
            goal: _fundingGoal,
            deadline: _deadline,
            title: _title,
            creator: _creator
        });

        totalFunding = 0;
        contributionsCount = 0;
        contributorsCount = 0;
    }

    /**
    * Project values are indexed in return value:
    * [0] -> Project.properties.title
    * [1] -> Project.properties.goal
    * [2] -> Project.properties.deadline
    * [3] -> Project.properties.creator
    * [4] -> Project.totalFunding
    * [5] -> Project.contributionsCount
    * [6] -> Project.contributorsCount
    * [7] -> Project.fundingHub
    * [8] -> Project (address)
    */
    function getProject() public view returns (string memory, uint, uint, address, uint, uint, uint, address, address) {
        return (properties.title,
                properties.goal,
                properties.deadline,
                properties.creator,
                totalFunding,
                contributionsCount,
                contributorsCount,
                fundingHub,
                address(this));
    }

    /**
    * Retrieve indiviual contribution information
    * [0] -> Contribution.amount
    * [1] -> Contribution.contributor
    */
    function getContribution(uint _id) public view returns (uint, address) {
        Contribution storage c = contributions[_id];
        return (c.amount, c.contributor);
    }

    /**
    * This is the function called when the FundingHub receives a contribution. 
    * If the contribution was sent after the deadline of the project passed, 
    * or the full amount has been reached, the function must return the value 
    * to the originator of the transaction. 
    * If the full funding amount has been reached, the function must call payout.
    * [0] -> contribution was made
    */
    function fund(address _contributor) public payable returns (bool successful) {

        // Check amount is greater than 0
        if (msg.value <= 0) {
            emit LogFailure("Funding contributions must be greater than 0 wei");
            revert();
        }

        // Check funding only comes thru fundingHub
        if (msg.sender != fundingHub) {
            emit LogFailure("Funding contributions can only be made through FundingHub contract");
            revert();
        }

        // 1. Check that the project dealine has not passed
        if (block.number > properties.deadline) {
            emit LogFundingFailed(address(this), totalFunding, contributionsCount);
            if (!_contributor.send(msg.value)) {
                emit LogFailure("Project deadline has passed, problem returning contribution");
                revert();
            }
            return false;
        }

        // 2. Check that funding goal has not already been met
        if (totalFunding >= properties.goal) {
            emit LogFundingGoalReached(address(this), totalFunding, contributionsCount);
            if (!_contributor.send(msg.value)) {
                emit LogFailure("Project deadline has passed, problem returning contribution");
                revert();
            }
            payout();
            return false;
        }

        // determine if this is a new contributor
        uint prevContributionBalance = contributors[_contributor];

        // Add contribution to contributions map
        Contribution storage c = contributions[contributionsCount];
        c.contributor = _contributor;
        c.amount = msg.value;

        // Update contributor's balance
        contributors[_contributor] += msg.value;

        totalFunding += msg.value;
        contributionsCount++;

        // Check if contributor is new and if so increase count
        if (prevContributionBalance == 0) {
            contributorsCount++;
        }

        emit LogContributionReceived(this, _contributor, msg.value);

        // Check again to see whether the last contribution met the fundingGoal
        if (totalFunding >= properties.goal) {
            emit LogFundingGoalReached(address(this), totalFunding, contributionsCount);
            payout();
        }

        return true;
    }

    /**
    * If funding goal has been met, transfer fund to project creator
    * [0] -> payout was successful
    */
    function payout() public payable onlyFunded returns (bool successful) {
        uint amount = totalFunding;

        // prevent re-entrancy
        totalFunding = 0;

        if (properties.creator.send(amount)) {
            return true;
        } else {
            totalFunding = amount;
            return false;
        }

        return true;
    }

    /**
    * If the deadline is passed and the goal was not reached, allow contributors to withdraw their contributions.
    * This is slightly different that the final project requirements, see README for details
    * [0] -> refund was successful
    */
    function refund() public payable returns (bool successful) {

        // Check that the project dealine has passed
        if (block.number < properties.deadline) {
            emit LogFailure("Refund is only possible if project is past deadline");
            revert();
        }

        // Check that funding goal has not already been met
        if (totalFunding >= properties.goal) {
            emit LogFailure("Refund is not possible if project has met goal");
            revert();
        }

        uint amount = contributors[msg.sender];
        
        //prevent re-entrancy attack
        contributors[msg.sender] = 0;

        if (msg.sender.send(amount)) {
            emit LogRefundIssued(address(this), msg.sender, amount);
            return true;
        } else {
            contributors[msg.sender] = amount;
            emit LogFailure("Refund did not send successfully");
            return false;
        }
        return true;
    }

    function kill() public onlyFundingHub {
        selfdestruct(fundingHub);
    }

    /** 
    * Don't allow Ether to be sent blindly to this contract
    */
    function() public {
        revert();
    }
}