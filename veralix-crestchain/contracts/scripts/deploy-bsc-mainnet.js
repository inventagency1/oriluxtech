const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🚀 Deploying VeralixMasterRegistry to BSC Mainnet...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "BNB");

  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 BNB");
    process.exit(1);
  }

  // Deploy the upgradeable contract
  console.log("\n⏳ Deploying VeralixMasterRegistryUpgradeable (UUPS Proxy)...");
  
  const VeralixMasterRegistry = await ethers.getContractFactory("VeralixMasterRegistryUpgradeable");
  
  const baseURI = "https://api.veralix.io/metadata/";
  
  const proxy = await upgrades.deployProxy(
    VeralixMasterRegistry,
    [baseURI],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  
  console.log("✅ Proxy deployed to:", proxyAddress);

  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("✅ Implementation deployed to:", implementationAddress);

  // Register the deployer as a Jewelry Store so it can mint
  console.log("\n⏳ Registering deployer as Jewelry Store...");
  
  const tx = await proxy.registerJewelryStore(
    deployer.address,
    "Veralix System",
    "VERALIX-001",
    "system@veralix.io",
    ["Certificates", "NFT"]
  );
  await tx.wait();
  
  console.log("✅ Deployer registered as Jewelry Store");

  // Verify the store is active
  const storeInfo = await proxy.getJewelryStore(deployer.address);
  console.log("✅ Store is active:", storeInfo.isActive);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Contract Information:");
  console.log("   Proxy Address:", proxyAddress);
  console.log("   Implementation:", implementationAddress);
  console.log("   Network: BSC Mainnet (Chain ID: 56)");
  console.log("   Explorer: https://bscscan.com/address/" + proxyAddress);
  console.log("\n📝 Next Steps:");
  console.log("   1. Update VERALIX_CONTRACT_ADDRESS in Supabase Secrets");
  console.log("   2. Update SYSTEM_PRIVATE_KEY in Supabase Secrets");
  console.log("   3. Test minting a certificate");
  console.log("\n⚠️  SAVE THESE ADDRESSES!");
  console.log("   VERALIX_CONTRACT_ADDRESS=" + proxyAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
