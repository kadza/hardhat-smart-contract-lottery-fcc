// Enter the lottery (paying some amount)
// Pick a random winner (verifiable random)
// Winnder selected every X minutes -> completely automated
// Chainlink Oracle -> Randomness, Autoamted Execution

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

error Raffle__NotEnoughEthEntered();

contract Raffle {
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    event RaffleEnter(address indexed player);

    constructor(uint256 entranceFee) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughEthEntered();
        }

        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
      return s_players[index];
    }
}
