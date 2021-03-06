// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract GoldFlareToken{
    uint256 public totalSupply;
    string public name = "GoldFlare";
    string public symbol = "Lit";
    string public standard = "GoldFlare V-1.0";

    mapping(address => uint256) public balanceOf;
    mapping(address=> mapping(address=> uint256)) public allowance;

    // Event
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
    // Transfer 
    function transfer(address _to, uint256 _value) public returns (bool success){
        // Exception if the account doesn't have enough 
        require(balanceOf[msg.sender] >= _value);
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // Transfer Event
        emit Transfer(msg.sender, _to, _value);
        // Return a boolean
        return true;
    }

    // Approve
    function approve(address _spender, uint256 _value) public returns (bool success){
        // allowance
        allowance[msg.sender][_spender] = _value;
        // approve event
        emit Approval(msg.sender, _spender, _value);
        // return a boolean
        return true;
    }
    // TransferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // Require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // Require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
        // Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // Update tht allowance
        allowance[_from][msg.sender] -= _value;
        // Transfer event
        emit Transfer(_from, _to, _value);
        // return a boolean
        return true;
    }
}