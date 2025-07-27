const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying WHOT Game Contract to Base Sepolia...");

  // Get the contract factory
  const WHOTGame = await ethers.getContractFactory("WHOTGame");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract constructor parameters
  const defaultAdmin = deployer.address; // Contract admin
  const name = "WHOT Game Cards";
  const symbol = "WHOT";
  const royaltyRecipient = deployer.address; // Receives royalties
  const royaltyBps = 250; // 2.5% royalty
  const primarySaleRecipient = deployer.address; // Receives primary sales
  const feeRecipient = deployer.address; // Receives platform fees

  console.log("Deployment parameters:");
  console.log("- Default Admin:", defaultAdmin);
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Royalty Recipient:", royaltyRecipient);
  console.log("- Royalty BPS:", royaltyBps);
  console.log("- Primary Sale Recipient:", primarySaleRecipient);
  console.log("- Fee Recipient:", feeRecipient);

  // Deploy the contract
  const whotGame = await WHOTGame.deploy(
    defaultAdmin,
    name,
    symbol,
    royaltyRecipient,
    royaltyBps,
    primarySaleRecipient,
    feeRecipient
  );

  await whotGame.deployed();

  console.log("WHOT Game Contract deployed to:", whotGame.address);
  console.log("Transaction hash:", whotGame.deployTransaction.hash);

  // Wait for a few confirmations
  console.log("Waiting for confirmations...");
  await whotGame.deployTransaction.wait(5);

  console.log("Contract verified and ready!");
  console.log("\nContract Details:");
  console.log("- Network: Base Sepolia Testnet");
  console.log("- Contract Address:", whotGame.address);
  console.log("- Explorer URL: https://sepolia.basescan.org/address/" + whotGame.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    contractAddress: whotGame.address,
    transactionHash: whotGame.deployTransaction.hash,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    constructorArgs: {
      defaultAdmin,
      name,
      symbol,
      royaltyRecipient,
      royaltyBps,
      primarySaleRecipient,
      feeRecipient
    }
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });