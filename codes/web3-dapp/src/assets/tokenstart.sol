// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract OYKTOKENTEST is IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;

    string public name;
    string public symbol;
    uint8 public decimals;

    modifier onlyOwner() {}

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {}

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool) {}

    function approve(address spender, uint256 amount) external returns (bool) {}

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {}

    // OPTIONAL
    function mint(address to, uint256 amount) external onlyOwner {}

    // OPTIONAL
    function burn(address from, uint256 amount) external onlyOwner {}

    // OPTIONAL
    function transferOwnership(address newOwner) external onlyOwner {}
}
