// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./GoldFlareToken.sol";

contract GoldFlareTokenSale{
    address payable admin;
    GoldFlareToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(GoldFlareToken _tokenContract,uint256 _tokenPrice) public{
        // assign an admin
        admin = payable(msg.sender);
        // token contract
        tokenContract = _tokenContract;
        // token price
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
    
    function buyTokens(uint256 _numberOfTokens) public payable{
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens,tokenPrice));
        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >=_numberOfTokens);
        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Keep tracks of tokensSold
        tokensSold += _numberOfTokens;
        // Trigger sell event
        emit Sell(msg.sender,_numberOfTokens);
    }

    function endSale() public{
        // require admin
        require(msg.sender == admin);
        // transfer remaining dapp tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // destory contract
        selfdestruct(admin);
    }

}