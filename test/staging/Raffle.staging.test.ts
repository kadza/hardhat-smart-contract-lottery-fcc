import { expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { Raffle } from "../../typechain-types/contracts/Raffle"
import { developmentChains, networkConfig } from "../../helper-hardhat.config"

 developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let raffle: Raffle
      let deployer: string
      let raffleEntranceFee: BigNumber

      this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
      })

      describe("fulfillRandomWords", function () {
       it("works with live chainlingKeepers and Chainlink VRF, we get a random winner", async function() {
          const startingTimestamp = await raffle.getLatestTimeStamp()
          const accounts = await ethers.getSigners()

          await new Promise<void>(async (resolve,reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired!")
              try {
                const recentWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimestamp = await raffle.getLatestTimeStamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                expect(recentWinner.toString()).to.equal(accounts[0].address)
                expect(raffleState).to.equal(0)
                expect(winnerEndingBalance.toString()).to.equal(winnerStartingBalance.add(raffleEntranceFee).toString())
                expect(endingTimestamp > startingTimestamp).to.be.true
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
            })
          })

          await raffle.enterRaffle({value: raffleEntranceFee})
          const winnerStartingBalance = await accounts[0].getBalance()
      })
    })
    })