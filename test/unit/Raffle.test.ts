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
      let interval: BigNumber
      const chainId = network.config.chainId ?? 31337

      this.beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)

        raffleEntranceFee = await raffle.getEntranceFee()
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        interval = await raffle.getInterval()
      })

      describe("constructor", function () {
        it("initializes contract with open state", async function () {
          const result = await raffle.getRaffleState()

          expect(result.toString()).to.equal("0")
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

      describe("enterRaffle", function () {
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

        it("doesnt allow to enter raffle is calculating", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])

          await raffle.performUpkeep([])

          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen")
        })
      })

      describe("checkUpkeep", function () {
        it("returns false if people havent sent any ETH", async function () {
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])

          expect(upkeepNeeded).to.be.false
        })
        it("returns false if raffle isnt open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep("0x")
          const raffleState = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])

          expect(raffleState.toString()).to.equal("1")
          expect(upkeepNeeded).to.be.false
        })
        it("returns false if not enough time has passed", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep("0x")

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")

          expect(upkeepNeeded).to.be.false
        })
        it("returns false if raffle isnt open", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])

          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])

          expect(upkeepNeeded).to.be.true
        })
      })
      describe("perfrom upkeep", function () {
        it("it can only run when checkUpkeep is true", async function () {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])
          const tx = await raffle.performUpkeep("0x")

          expect(tx).not.to.be.null
        })
        it("reverts when checkUpkeep is false", async function () {
          await expect(raffle.performUpkeep("0x")).to.be.revertedWithCustomError(
            raffle,
            "Raffle__UpkeepNotNeeded"
          )
        })
      })
    })
