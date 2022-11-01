import { ethers, network } from "hardhat"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat.config"

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId ?? 31337
  const usedNetworkConfig = networkConfig[chainId]

  let vrfCoordinatorV2Address, subscriptionId

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait(1)
    subscriptionId = transactionReceipt.events[0].args.subId
  } else {
    vrfCoordinatorV2Address = usedNetworkConfig.vrfCoordinatorV2
  }

  log("Deploying ...")

  await deploy("Raffle", {
    from: deployer,
    args: [vrfCoordinatorV2Address, usedNetworkConfig.raffleEntranceFee, usedNetworkConfig.gasLane],
    log: true,
    waitConfirmations: 6,
  })
}
export default deployRaffle
deployRaffle.tags = ["all", "raffle"]
