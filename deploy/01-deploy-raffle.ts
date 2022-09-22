import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("Deploying ...")

  await deploy("Raffle", {
    from: deployer,
    args: [1],
    log: true,
  })
}
export default deployRaffle
deployRaffle.tags = ["all", "raffle"]
