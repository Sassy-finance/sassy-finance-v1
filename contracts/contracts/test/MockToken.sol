pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 _totalSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, _totalSupply);
    }
}
