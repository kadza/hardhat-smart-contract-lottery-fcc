import { expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { Raffle } from "../../typechain-types/Raffle"

describe("Raffle", async function () {
  let raffle: Raffle
  let deployer: string

  this.beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(["all"])
    raffle = await ethers.getContract("Raffle", deployer)
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

    it("allows to enter with min entrance fee", async function () {
      await expect(raffle.enterRaffle({ value: 2 })).not.to.be.revertedWithCustomError(
        raffle,
        "Raffle__NotEnoughEthEntered"
      )
    })
  })
})
