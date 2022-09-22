// Enter the lottery (paying some amount)
// Pick a random winner (verifiable random)
// Winnder selected every X minutes -> completely automated
// Chainlink Oracle -> Randomness, Autoamted Execution

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error Raffle__NotEnoughEthEntered();

contract Raffle {
    uint256 private immutable i_entranceFee;

    constructor(uint256 entranceFee) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }
}
