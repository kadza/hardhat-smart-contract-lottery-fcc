import { expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { Raffle } from "../../typechain-types/contracts/Raffle"
import { developmentChains, networkConfig } from "../../helper-hardhat.config"

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async function () {
      let raffle: Raffle
      let deployer: string
      let raffleEntranceFee: BigNumber
      let vrfCoordinatorV2Mock
      const chainId = network.config.chainId ?? 31337

      this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)

        raffleEntranceFee = await raffle.getEntranceFee()
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
      })

      describe("constructor", async function () {
        it("initializes contract with open state", async function () {
          const result = await raffle.getRaffleState()

          expect(result.toString()).to.equal('0')
        })
        it("initializes contract with interval", async function () {
          const result = await raffle.getInterval()

          expect(result.toString()).to.equal(networkConfig[chainId].keepersUpdateInterval)
        })
        it("initializes contract with entrance fee", async function () {
          const result = await raffle.getEntranceFee()

          expect(result).to.equal(networkConfig[chainId].raffleEntranceFee)
        })
      })

      describe("enterRaffle", async function () {
        it("doesn't allow to enter without min entrance fee", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotEnoughEthEntered"
          )
        })

        it("stores first player that entered raffle", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const result = await raffle.getPlayer(0)

          expect(result).to.be.equal(deployer)
        })

        it("allows to enter with min entrance fee", async function () {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).not.to.be.revertedWithCustomError(raffle, "Raffle__NotEnoughEthEntered")
        })

        it("emits EnterRaffle event", async function () {
          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
            raffle,
            "RaffleEnter"
          )
        })

        // it("doesnt allow to enter raffle is calculating", async function
        // () {

        // })
      })
    })
