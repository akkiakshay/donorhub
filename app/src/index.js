import jQuery from "jquery";
import 'jquery.cookie';
window.$ = window.jQuery = jQuery;
import 'bootstrap';

import "./stylesheets/app.scss";

import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

import FundinghubArtifacts from '../../build/contracts/FundingHub.json'

import user_artifacts from '../../build/contracts/User.json'
import organisation_artifacts from '../../build/contracts/Organisation.json'
const User = contract(user_artifacts)
const Organisation = contract(organisation_artifacts)

const FundingHub = contract(FundinghubArtifacts)
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('localhost', '5001');

let accounts
let account
const App = {
    start: function() {

        ipfs.id(function(err, res) {
            if (err) throw err
            console.log("Connected to IPFS node!", res.id, res.agentVersion, res.protocolVersion);
            });

        const self = this

       
        User.setProvider(web3.currentProvider)
        FundingHub.setProvider(web3.currentProvider)
        Organisation.setProvider(web3.currentProvider)

        if (typeof User.currentProvider.sendAsync !== "function") {
            User.currentProvider.sendAsync = function() {
                return User.currentProvider.send.apply(
                    User.currentProvider, arguments
                );
            };
        }

        
        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert('There was an error fetching your accounts.')
                return
            }

            if (accs.length === 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
                return
            }

            accounts = accs
            account = accounts[0]
            $.each(accounts, function(key, value) { 
                let destinationBalance;
                web3.eth.getBalance(value).then(function(destinationBalanceWei) {
                   console.log(destinationBalanceWei)
                   var used = 'Available';
                    destinationBalance = self.fromWei(destinationBalanceWei);
                    destinationBalance = destinationBalance.toString();
                    if(destinationBalance != '100') {
                        used = 'Not Available'
                    }
                    $('#sign-up-eth-address')
                    .append($("<option></option>")
                               .attr("value",value)
                               .text(value +' - ' + used)); 
                });

                
           });
           
            
            
        })

        UserMod.getUsers();
        UserMod.getOrgs();

        
        
        var signUpDonor = $('#sign-up-user').click(function() {
            UserMod.createUser();
            
            return false;
          })
        
          var signUpOrg = $('#sign-up-org').click(function() {
            UserMod.createOrganisation();
            
            return false;
          })

        var loginDonor = $('#log-in-donor').click(function() {
            UserMod.loginUser();
            return false;
        })
        
        var loginOrg = $('#log-in-org').click(function() {
            UserMod.loginOrg();
            return false;
        })

    },


    showProjects: function() {
        var host = window.location.host + '/showprojects.html'
        window.location = 'showprojects.html';

    },

    loadPublicLedger: function() {
        var host = window.location.host + '/publicledger.html'
        window.location = 'publicledger.html';
    },

    publicLedger: function() {
        App.getTransactionByAccount(null,null);
    },

    showProjectLoad: function() {
        var username = $.cookie("username");
        var title = $.cookie("title");
        var type = $.cookie("type");
        var ethaddress = $.cookie("ethaddress");

        $('#username').text(username);
        $('#title').text(title);
        $('#type').text(type);
        $('#ethaddress').text(ethaddress);

        var load = Project.getProjects();

        return true;
    },
    alertmsg: function(msg,content,type) {
        $('#success').find('h5').text(msg)
        $('#success').find('small').text(content)
        if(type === 1) {
            $('#success').addClass('alert-success')
        }
        else {
            $('#success').addClass('alert-danger')
        }
        $('#success').show()
    },

    


    orgload: function() {
        var self = this
        var username = $.cookie("username");
        var title = $.cookie("title");
        var type = $.cookie("type");
        

        $('#username').text(username);
        $('#title').text(title);
        $('#type').text(type);
        var InstanceUsed;
        FundingHub.deployed().then(function(instance){
            InstanceUsed = instance
            return InstanceUsed.fundsCollectedByUser(username).then(result => {
                $('#balance').text(result);
            })
        })
        

        
        var proj = Project.getOrgsProject();

        return true;
    },

    userload: function() {
        var self = this
        var username = $.cookie("username");
        var title = $.cookie("title");
        var type = $.cookie("type");
        var ethaddress = $.cookie("ethaddress");

        $('#username').text(username);
        $('#title').text(title);
        $('#type').text(type);
        $('#ethaddress').text(ethaddress);
        var destinationBalance;
        web3.eth.getBalance(ethaddress).then(function(destinationBalanceWei) {
            console.log(destinationBalanceWei)
             destinationBalance = self.fromWei(destinationBalanceWei);
             $('#balance').text(destinationBalance) 
         });

        var load = Project.getProjects();
        

        return true;
    },

    projload: function() {
        var username = $.cookie("username");
        var title = $.cookie("title");
        var type = $.cookie("type");
        var ethaddress = $.cookie("ethaddress");

        $('#username').text(username);
        $('#title').text(title);
        $('#type').text(type);
        $('#ethaddress').text(ethaddress);

        var load = Project.getProjects();

        return true;
    },

    toWei: function(ethvalue) {
        return web3.utils.toWei(ethvalue,"ether");
    },

    fromWei: function(ethvalue) {
        return web3.utils.fromWei(ethvalue,"ether");
    },

   
    

  

    getTransactionByAccount: function(endBlockNumber,startBlockNumber) {
        
        web3.eth.getBlockNumber(function(error,result) {
            if (endBlockNumber == null) {
                endBlockNumber = result;
                console.log("Using endBlockNumber: ",endBlockNumber);
              }
            if (startBlockNumber == null) {
                startBlockNumber = 0;
                console.log("Using startBlockNumber: " + startBlockNumber);
              }
            
              for (var i = startBlockNumber; i <= endBlockNumber; i++) {
                console.log("Searching block " + i);
                
                web3.eth.getBlock(i,true,function(error,block){
                    
                        var transtemplate = "";
                        block.transactions.forEach( function(e) {
                          if (true) {
                               transtemplate += `<tr><td>tx hash</td><td>` + e.hash + `</td></tr>
                              <tr><td>nonce</td><td>` + e.nonce + `</td></tr>
                              <tr><td>blockHash</td><td>` + e.blockHash + `</td></tr>
                              <tr><td>blockNumber</td><td>` + e.blockNumber + `</td></tr>
                              <tr><td>transactionIndex</td><td>` + e.transactionIndex + `</td></tr>
                              <tr><td>from</td><td>` + e.from + `</td></tr> 
                              <tr><td>to  </td><td>` + e.to + `</td></tr>
                              <tr><td>value</td><td>` + e.value + `</td></tr>
                              <tr><td>time</td><td>` + block.timestamp + ``  + new Date(block.timestamp * 1000).toGMTString() + `</td></tr>
                              <tr><td>gasPrice</td><td>` + e.gasPrice + `</td></tr>
                              <tr><td>gas </td><td>` + e.gas + `</td></tr>` 
                          }
                        }) 
                        var card = `<div class="col-6"><div class="card bg-light mb-3" >
                        <div class="card-header">Block `+block.number+`</div>
                        <div class="card-body">
                          <table class="table">
                            <tr>
                                <td>Hash</td>
                                <td>`+ block.hash +`</td>
                            </tr>
                            <tr>
                                <td>gasLimit</td>
                                <td>`+block.gasLimit+`</td>
                            </tr>
                            <tr>
                                <td>gasUsed</td>
                                <td>`+block.gasUsed+`</td>
                            </tr>
                            <tr>
                                <td>Timestamp</td>
                                <td>`+ new Date(block.timestamp * 1000).toGMTString()  +`</td>
                            </tr>
                            <tr>
                                <td>Transactions</td>
                                <td><table class="table inside">`+ transtemplate +`</table></td>
                            </tr>
                            <tr>
                                <td>Transaction Root</td>
                                <td>`+ block.transactionsRoot +`</td>
                            </tr>
                           

                          </table>
                          
                        </div>
                      </div></div>`;       
                        $('#ledger').append(card);
                        
                });
                
                
              }

            
        })
        
    },

   

    
    
}

const UserMod = {
    logOut: function() {
        $.removeCookie("username");
        $.removeCookie("title");
        $.removeCookie("type");
        $.removeCookie("ethaddress");

        document.location.href = '/';

    },

    loginUser: function() {
        var ipfsHash = $('#login-ipfshash-donor').val();
        var username = $('#login-username-donor').val();
        console.log(ipfsHash);
        console.log(username);
        var url = 'http://localhost:5001/api/v0/cat?arg=' + ipfsHash;
        console.log(url);
        $.getJSON(url, function(userJson) {
            console.log("inside ipfs");
            if(username == userJson.username) {
                $('#success').text("Login Successful! Redirecting")
                setTimeout(function(){
                    $.cookie('username',userJson.username)
                    $.cookie('title',userJson.title)
                    $.cookie('type',userJson.type)
                    $.cookie('ethaddress',userJson.ethaddress)
                    var host = window.location.host;
                    if(userJson.type == "Donor"){
                        window.location = 'user.html'
                    }
                    
                  }, 2000);
               
            }
            else {
                $('#failed').text('Login Failed')
            }
           

        }).catch(function(e){
            console.log(e);
        })


    },

    loginOrg: function() {
        var ipfsHash = $('#login-ipfshash-org').val();
        var username = $('#login-username-org').val();
        console.log(ipfsHash);
        console.log(username);
        var url = 'http://localhost:5001/api/v0/cat?arg=' + ipfsHash;
        console.log(url);
        $.getJSON(url, function(userJson) {
            console.log("inside ipfs");
            if(username == userJson.username) {
                $('#success-org').text("Login Successful! Redirecting")
                setTimeout(function(){
                    $.cookie('username',userJson.username)
                    $.cookie('title',userJson.title)
                    $.cookie('type',userJson.type)
                    var host = window.location.host;
                    if(userJson.type == "Organisation"){
                        window.location = 'org.html'
                    }
                    
                  }, 2000);
               
            }
            else {
                $('#failed').text('Login Failed')
            }
           

        }).catch(function(e){
            console.log(e);
        })

    },

    createUser: function() {
        var username = $('#sign-up-username').val();
        var title = $('#sign-up-title').val();
        var type = $('#type').find(":selected").text();
        var ethaddress = $('#sign-up-eth-address').find(':selected').val();
        console.log(ethaddress)
        var ipfsHash = 'not-available';

        console.log('creating user on eth for', username, title, type, ipfsHash);

        var userJson = {
            username: username,
            title: title,
            type: type,
            ethaddress:ethaddress
            };

        ipfs.add([Buffer.from(JSON.stringify(userJson))], function(err, res) {
                if (err) throw err
                ipfsHash = res[0].hash
               console.log('creating user on eth for', username, title, type, ipfsHash);
               User.deployed().then(function(contractInstance) {
                // contractInstance.createUser(web3.fromAscii(username), web3.fromAscii(title), intro, ipfsHash, {gas: 2000000, from: web3.eth.accounts[0]}).then(function(index) {
                contractInstance.createUser(username, ipfsHash, {gas: 200000, from: ethaddress}).then(function(success) {
                if(success) {
                console.log('created user on ethereum!');
                $('#ipfs-hash').text(ipfsHash);
                $('#show-hash').css('display','block'); 
                window.location.reload();
                } else {
                console.log('error creating user on ethereum');
                }
                }).catch(function(e) {
                // There was an error! Handle it.
                console.log('error creating user:', username,ethaddress, ':', e);
                });
                
                });
                });

           
               

    },

    createOrganisation: function() {
        var username = $('#sign-up-username').val();
        var title = $('#sign-up-title').val();
        var type = $('#type').find(":selected").text();
        var ethaddress = $('#sign-up-eth-address').find(':first').val();
        var ipfsHash = 'not-available';
        console.log(ethaddress)
        console.log('creating user on eth for', username, title, type, ipfsHash);

        var userJson = {
            username: username,
            title: title,
            type: type
            };

            ipfs.add([Buffer.from(JSON.stringify(userJson))], function(err, res) {
                if (err) throw err
                ipfsHash = res[0].hash
               console.log('creating user on eth for', username, title, type, ipfsHash);
               Organisation.deployed().then(function(contractInstance) {
                // contractInstance.createUser(web3.fromAscii(username), web3.fromAscii(title), intro, ipfsHash, {gas: 2000000, from: web3.eth.accounts[0]}).then(function(index) {
                contractInstance.createOrganisation(username, ipfsHash, {gas: 200000, from: ethaddress}).then(function(success) {
                if(success) {
                console.log('created user on ethereum!');
                $('#ipfs-hash').text(ipfsHash);
                $('#show-hash').css('display','block'); 
                window.location.reload();
                } else {
                console.log('error creating user on ethereum');
                }
                }).catch(function(e) {
                // There was an error! Handle it.
                console.log('error creating user:', username, ':', e);
                });
                
                });
                });    
    },

    getAUser: function(instance, i) {
        var instanceUsed = instance;
            var username;
            var ipfsHash;
            var address;
            var userCardId = 'user-card-' + i;
        return instanceUsed.getUsernameByIndex.call(i).then(function(_username) {
        console.log('username:', username = web3.utils.hexToAscii(_username), i);
                
              $('#' + userCardId).find('.card-title').text(username);
            
              return instanceUsed.getIpfsHashByIndex.call(i);
        }).then(function(_ipfsHash) {
        console.log('ipfsHash:', ipfsHash = web3.utils.hexToAscii(_ipfsHash), i);
         $('#' + userCardId).find('.card-subtitle').text('title');
        if(ipfsHash != 'not-available') {
                var url = 'http://localhost:5001/api/v0/cat?arg=' + ipfsHash;
               $.getJSON(url, function(userJson){
                console.log('got user info from ipfs', );
                $('#' + userCardId).find('.card-subtitle').text(userJson.title);
                $('#' + userCardId).find('.card-eth-address').text(ipfsHash);
            })
              }
        return instanceUsed.getAddressByIndex.call(i);
            
            }).then(function(_address) {
        console.log('address:', address = _address, i);
              
              $('#' + userCardId).find('.card-eth').text(address);
        return true;
        }).catch(function(e) {
        // There was an error! Handle it.
              console.log('error getting user #', i, ':', e);
        });
    },

    getUsers: function() {
        var self = this;
        var instanceUsed;
        User.deployed().then(function(contractInstance) {
        instanceUsed = contractInstance;
        return instanceUsed.getUserCount.call();
        }).then(function(userCount) {
        userCount = userCount.toNumber();
        console.log('User count', userCount);
        var rowCount = 0;
            var usersDiv = $('#users-div');
            var currentRow;
        for(var i = 1; i < userCount; i++) {
        var userCardId = 'user-card-' + i;
        if(i % 4 == 1) {
                var currentRowId = 'user-row-' + rowCount;
                var userRowTemplate = '<div class="row" id="' + currentRowId + '"></div>';
                usersDiv.append(userRowTemplate);
                currentRow = $('#' + currentRowId);
                rowCount++;
                }
        var userTemplate = `
                <div class="col-lg-6 mt-1 mb-1" id="` + userCardId + `">
                    <div class="card bg-gradient-primary text-white card-profile p-1">
                    <div class="card-body">
                        <h5 class="card-title"></h5>
                        <h6 class="card-subtitle mb-2"></h6>
                        <p class="card-text"></p>        
                        <p class="eth-address m-0 p-0">IPFS :
                        <span class="card-eth-address"></span>
                        </p>
                        <p class="eth-address m-0 p-0">Eth Address :
                        <span class="card-eth"></span>
                        </p>
                    </div>
                    </div>
                </div>`;
        currentRow.append(userTemplate);
        }
        console.log("getting users...");
        for(var i = 1; i < userCount; i++) {
        self.getAUser(instanceUsed, i);
        }
        })
    },

    getAOrg: function(instance, i) {
        var instanceUsed = instance;
            var username;
            var ipfsHash;
            var address;
            var userCardId = 'org-card-' + i;
        return instanceUsed.getUsernameByIndex.call(i).then(function(_username) {
        console.log('username:', username = web3.utils.hexToAscii(_username), i);
                
              $('#' + userCardId).find('.card-title').text(username);
            
              return instanceUsed.getIpfsHashByIndex.call(i);
        }).then(function(_ipfsHash) {
        console.log('ipfsHash:', ipfsHash = web3.utils.hexToAscii(_ipfsHash), i);
         $('#' + userCardId).find('.card-subtitle').text('title');
        if(ipfsHash != 'not-available') {
                var url = 'http://localhost:5001/api/v0/cat?arg=' + ipfsHash;
               $.getJSON(url, function(userJson){
                console.log('got user info from ipfs', );
                $('#' + userCardId).find('.card-subtitle').text(userJson.title);
                $('#' + userCardId).find('.card-eth-address').text(ipfsHash);
            })
              }
        
        }).catch(function(e) {
        // There was an error! Handle it.
              console.log('error getting user #', i, ':', e);
        });
    },

    getOrgs: function() {
        var self = this;
        var instanceUsed;
        Organisation.deployed().then(function(contractInstance) {
        instanceUsed = contractInstance;
        return instanceUsed.getUserCount.call();
        }).then(function(userCount) {
        userCount = userCount.toNumber();
        console.log('User count', userCount);
        var rowCount = 0;
            var usersDiv = $('#org-div');
            var currentRow;
        for(var i = 1; i < userCount; i++) {
        var userCardId = 'org-card-' + i;
        if(i % 4 == 1) {
                var currentRowId = 'org-row-' + rowCount;
                var userRowTemplate = '<div class="row" id="' + currentRowId + '"></div>';
                usersDiv.append(userRowTemplate);
                currentRow = $('#' + currentRowId);
                rowCount++;
                }
        var userTemplate = `
                <div class="col-lg-6 mt-1 mb-1" id="` + userCardId + `">
                    <div class="card bg-gradient-secondary text-white card-profile p-1">
                    <div class="card-body">
                        <h5 class="card-title"></h5>
                        <h6 class="card-subtitle mb-2"></h6>
                        <p class="card-text"></p>        
                        <p class="eth-address m-0 p-0">IPFS :
                        <span class="card-eth-address"></span>
                        </p>
                        
                    </div>
                    </div>
                </div>`;
        currentRow.append(userTemplate);
        }
        console.log("getting users...");
        for(var i = 1; i < userCount; i++) {
        self.getAOrg(instanceUsed, i);
        }
        })
    },
}

const Project = {
    getAProject: function(instance,i) {
        var InstanceUsed = instance;
        var projectCardId = 'project-card-' + i;
        FundingHub.deployed().then(function(instance){
            InstanceUsed = instance
            return InstanceUsed.projectAddresses.call(i).then(function(result) {
                $('#'+projectCardId).find('.donatebtn').attr('id',result)
                return InstanceUsed.getProjectInfo(result).then(function(result) {
                    console.log(result);
                    $('#'+projectCardId).find('.card-title').text(result[0])
                    $('#'+projectCardId).find('.card-description').text(result[1])
                $('#'+projectCardId).find('.card-text').text(result[2].toNumber())
                $('#'+projectCardId).find('.total').text(result[3].toNumber())
                $('#'+projectCardId).find('.created').text(result[4])
                })
               

            })
        })
    },

    showProjects: function() {
        var host = window.location.host + '/showprojects.html'
        window.location = 'showprojects.html';

    },

    getOneProject: function() {
        var ethaddress= $.cookie("ethaddress")
        var type = $.cookie('type');
        FundingHub.deployed().then(function(instance) {
            return instance.getProjectInfo(ethaddress).then(function(result){
                var projdiv = $('#oneproject');
                var template = `<div class="row">
                <div class="col-xs-12 col-sm-6 col-md-6 col-lg-4">
                            <div class="card rounded-0 p-0 shadow-sm">
                            <div class="card-body ">
                                <h5 class="card-title">`+ result[0] +`</h5>
                                <p class="card-description">`+ result[1] +`</p><span>  
                                <a class="" style="float:left"><b>Goal</b>: <span class="card-text">`+ result[2] +`</span></a> 
                                <a class="" style="float:right"><b>Total Funding</b>: <span class="total">`+ result[3] +`</span></h6></a>     
                            </div>
                            <div class="card-footer"><a href="#" id="`+ethaddress+`" class="btn btn-primary btn-sm donatebtn" onclick="Donation.showDetails(this.id)" >Check Details<a></div>
                            </div>
                        </div>
                </div>`;
                projdiv.append(template)

            })
        })
        return true;
    },

    getOrgsProject: function() {
        var username = $.cookie('username');
        var InstanceUsed;
        FundingHub.deployed().then(function(instance){
            InstanceUsed = instance
            return InstanceUsed.getProjectByUser(username).then(function(result){
                var projects = $('#oneproject');
                var template;
                for(var i=0; i < result.length ; i++){
                    if(result[i] != '0x0000000000000000000000000000000000000000') {
                        var eth = result[i]
                        console.log(eth)
                        InstanceUsed.getProjectInfo(result[i]).then(function(proj){
                            
                            template = `
                            <div class="col-xs-12 col-sm-6 col-md-6 col-lg-4">
                            <div class="card rounded-0 p-0 shadow-sm">
                            <div class="card-body ">
                                <h5 class="card-title">`+ proj[0] +`</h5>
                                <p class="card-description">`+ proj[1] +`</p><span>  
                                <a class="" style="float:left"><b>Goal</b>: <span class="card-text">`+ proj[2] +`</span></a> 
                                <a class="" style="float:right"><b>Total Funding</b>: <span class="total">`+ proj[3] +`</span></h6></a>
                                    
                            </div>
                            <small style="margin:0 auto">Created By: `+ proj[4] +`</small> 
                            <div class="card-footer"><a href="#" id="`+proj[5]+`" class="btn btn-primary btn-sm donatebtn" onclick="Donation.showDetails(this.id)" >Check Details<a></div>
                            </div>
                        </div>
                `;
                projects.append(template)
                        })
                        
                    }
                }
            })
        })
    },

    getProjects: function () {
        var self = this;
        var InstanceUsed;
        FundingHub.deployed().then(function(instance){
            InstanceUsed = instance
            console.log(instance);
            return InstanceUsed.numberOfProjects.call();
        }).then(function(result){
            console.log("getProjects: ", result.toNumber());
            let projectCount = result.toNumber();
            var rowCount = 0;
            var projectsDiv = $('#projects-div');
            var currentRow;
            var type = $.cookie('type');
            var donortemplate = "";
            for(var i = 0; i < projectCount; i++) {
                var projectCardId = 'project-card-' + i;
                if(type == "Donor") {
                    donortemplate = `<div class="card-footer text-right"><a href="#" class="btn btn-primary btn-sm donatebtn"  onclick="Project.openModal('`+ projectCardId +`',this.id)">Donate Now</a></div>`;
                }
                if(type == "Organisation") {
                    donortemplate = `<div class="card-footer"><a href="#" class="btn btn-primary btn-sm donatebtn" onclick="Donation.showDetails(this.id)" >Check Details<a></div>`
                }
                if(i % 4 == 0) {
                        var currentRowId = 'project-row-' + rowCount;
                        var projectRowTemplate = '<div class="row" id="' + currentRowId + '"></div>';
                        projectsDiv.append(projectRowTemplate);
                        currentRow = $('#' + currentRowId);
                        rowCount++;
                        }
                var userTemplate = `
                        <div class="col-xs-12 col-sm-6 col-md-6 col-lg-4" id="` + projectCardId + `">
                            <div class="card rounded-0 p-0 shadow-sm">
                            <div class="card-body ">
                                <h5 class="card-title"></h5>
                                <p class="card-description"></p><span>  
                                <a class="" style="float:left"><b>Goal</b>: <span class="card-text"></span></a> 
                                <a class="" style="float:right"><b>Total Funding</b>: <span class="total"></span></h6></a> 
                                    
                            </div>
                            <small style="margin:0 auto">Created By: <span class="created"></span></small> 
                            `+ donortemplate +`
                            </div>
                        </div>`;
                currentRow.append(userTemplate);
                }
                console.log("getting projects...");
                for(var i = 0; i < projectCount; i++) {
                    self.getAProject(InstanceUsed, i);
                 }


        })
    },

    createProject: function() {
        var projectGoal = $('#project-goal').val();
        var projectName = $('#project-name').val();
        var ethaddress = $('#sign-up-eth-address').find(':selected').val();
        var entryFee = $('#fee').val();
        var projectDescription = $('#project-description').val();
        var username = $.cookie('username');
       console.log(ethaddress,projectGoal,projectName)
        let InstanceUsed

        FundingHub.deployed().then(function(instance) {
            InstanceUsed = instance
            console.log(instance)
            return InstanceUsed.submitProject(projectName,projectDescription,projectGoal,username, {from: ethaddress, value:entryFee, gas: 6000000}).then(function(success) {
                if(success) {
                    $('#success').find('h5').text("Project Added Successfully")
                    $('#success').find('small').text("Reloading....")
                    $('#success').addClass('alert-success')
                    $('#success').show()
                    setTimeout(function(){
                        window.location.reload(); // you can pass true to reload function to ignore the client cache and reload from the server
                    },2000);
                } else {
                    $('#success').find('h5').text("Error !! Could not create project")
                    $('#success').addClass('alert-danger')
                    $('#success').show()
                }
                
            })
        })

    },

    openModal: function(id,ethaddress) {
        var self = this
        
       
        var modalTemplate= `<div class="modal fade" id="modal-`+id+`" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLongTitle">Donate Ether</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div id="success" class="alert " style="display: none">
                 <h5></h5>
                 <small></small>
                 <p></p>
              </div>
              <form>
                
                <div class="form-group">
                 <label for="username">Enter Amount</label>
                 <input type="text" class="form-control" id="amount" required="required">
                 
                 </div>
                 
                
                </form>
            </div>
            <div class="modal-footer">
              
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="Donation.fundNow('`+ethaddress+`')">Save changes</button>
            </div>
          </div>
        </div>
      </div>`;

      $('#modals-generate').html(modalTemplate)



      $('#modal-'+id).modal('show');
    },
}

const Donation = {
    fundNow: function(ethaddress) {
        
        var amount = $('#amount').val()
        var ownerethaddr = $.cookie('ethaddress')
        let InstanceUsed

        
        web3.eth.getBalance(ownerethaddr).then(result => {
            console.log(result)
            if(parseFloat(amount)    > App.fromWei(result)) {
                App.alertmsg("Fund Failure","You don't have enough balance to fund",0)
                console.log("inside")
                return;
            }
            else {

                FundingHub.deployed().then(function(instance) {
                    InstanceUsed = instance
                    return InstanceUsed.supportProject(ethaddress,{ from:ownerethaddr,value:amount,gas: 300000}).then(function(success){
                        console.log(success);
                        if(success){
                            web3.eth.sendTransaction({
                                from: ownerethaddr,
                                to: ethaddress,
                                value: App.toWei(amount)
                            })
                            .then(function(receipt){
                                if(receipt) {
                                    App.alertmsg("Fund Transferred Successfully","Reloading....",1)
                                    window.location.reload();
                                } 
                            }).catch(function(error) {
                                $('#success').find('h5').text("No Fund Error")
                                $('#success').find('small').text(error)
                                
                                $('#success').addClass('alert-danger')
                                $('#success').show()
                            });
                        }
                        
                    }).catch(function(e){
                        console.log(e)
                        App.alertmsg("Fund Transfer Unsuccessful","Fund exceeds Goal",0)
                    })
                })
            }
            
            

        })
    },

    showDetails: function(address) {
        var self= this
        console.log(address)
        
        this.getContributors(address)
    },

    createContribModal: function(data,address) {
        var modal = `<div class="modal fade" id="modal-`+address+`" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLongTitle">Contributors</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
            <table class="table table-borderless">
            <tr><th> Account </th><th> Amount </th></tr>
              `+data+`
              </table>
            </div>
            <div class="modal-footer">
              
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>`;

      $('#modal-contrib').html(modal)



      $('#modal-'+address).modal('show');
      
    },

    getContributors: function(address) {
        var self = this
        let InstanceUsed;
        FundingHub.deployed().then(instance => {
            return instance.contributors.call(0).then(result => {
                console.log(result)
            })
        })
        FundingHub.deployed().then(instance => {
            InstanceUsed = instance
            return InstanceUsed.getContributors(address.toLowerCase()).then(result => {
                
                var data = '';
                for(var i =0 ; i < result.length ; i++){
                    if(result[i] != '') {
                        var array = result[i].split('-'), user = array[0], value = array[1];
                    data += `<tr>
                        <td>0x0****************`+user+`</td>
                        <td>`+value+`</td>
                    </tr>`;
                    }
                    
                }
                self.createContribModal(data,address);
            })
        })
    },
}

window.App = App
window.Project = Project
window.UserMod = UserMod
window.Donation = Donation

window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn(
                'Using web3 detected from external source.' +
                ' If you find that your accounts don\'t appear or you have 0 User,' +
                ' ensure you\'ve configured that source properly.' +
                ' If using MetaMask, see the following link.' +
                ' Feel free to delete this warning. :)' +
                ' http://truffleframework.com/tutorials/truffle-and-metamask'
            )
            // Use Mist/MetaMask's provider
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
    } else {
        console.warn(
                'No web3 detected. Falling back to http://127.0.0.1:9545.' +
                ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
                ' Consider switching to Metamask for development.' +
                ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
            )
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(web3.currentProvider)
    }

    App.start()
})