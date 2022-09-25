import { expect } from "chai"
import { BigNumber } from "ethers"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { Raffle } from "../../typechain-types/Raffle"

describe("Raffle", async function () {
  let raffle: Raffle
  let deployer: string
  let raffleEntranceFee: BigNumber

  this.beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(["all"])
    raffle = await ethers.getContract("Raffle", deployer)
    raffleEntranceFee = await raffle.getEntranceFee()
  })

  describe("constructor", async function () {
    it("initializes contract with entrance fee", async function () {
      const result = await raffle.getEntranceFee()

      expect(result).to.equal(1)
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
      await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(raffle, "RaffleEnter")
    })
  })
})
