const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying VeralixCertificate to BSC...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "BNB");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    throw new Error("Insufficient BNB balance. Need at least 0.01 BNB for deployment.");
  }

  // Deploy the contract
  const VeralixCertificate = await hre.ethers.getContractFactory("VeralixCertificate");
  const contract = await VeralixCertificate.deploy();
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("\n✅ VeralixCertificate deployed successfully!");
  console.log("📜 Contract Address:", contractAddress);
  console.log("🔗 BSCScan:", `https://bscscan.com/address/${contractAddress}`);
  
  // Verify the contract on BSCScan (optional)
  console.log("\n⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  
  console.log("\n📝 Verifying contract on BSCScan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on BSCScan!");
  } catch (error) {
    console.log("⚠️ Verification failed (can be done manually):", error.message);
  }
  
  console.log("\n========================================");
  console.log("DEPLOYMENT SUMMARY");
  console.log("========================================");
  console.log("Network: BSC Mainnet");
  console.log("Contract: VeralixCertificate (VRX-CERT)");
  console.log("Address:", contractAddress);
  console.log("Owner:", deployer.address);
  console.log("========================================");
  console.log("\n🔧 Next steps:");
  console.log("1. Add this contract address to Supabase secrets as BSC_CONTRACT_ADDRESS");
  console.log("2. Add your wallet private key as BSC_PRIVATE_KEY");
  console.log("3. Authorize additional minters if needed using setAuthorizedMinter()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
