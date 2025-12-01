const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying VeralixCertificate to Crestchain...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "CREST");

  if (balance === 0n) {
    console.error("❌ Error: Account has no CREST tokens for gas fees");
    console.log("💡 Get CREST tokens from faucet or exchange");
    process.exit(1);
  }

  // Deploy contract
  console.log("\n⏳ Deploying contract...");
  const VeralixCertificate = await hre.ethers.getContractFactory("VeralixCertificate");
  const contract = await VeralixCertificate.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ VeralixCertificate deployed to:", contractAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Wait for confirmations
  console.log("\n⏳ Waiting for 5 confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Contract confirmed!");

  // Verify contract
  console.log("\n🔍 Verifying contract on Crestchain explorer...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("⚠️  Verification failed (this is OK, you can verify manually)");
    console.log("Error:", error.message);
  }

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Contract Information:");
  console.log("   Address:", contractAddress);
  console.log("   Network: Crestchain (Chain ID: 85523)");
  console.log("   Explorer:", `https://scan.crestchain.pro/address/${contractAddress}`);
  console.log("\n📝 Next Steps:");
  console.log("   1. Add to Supabase Edge Functions secrets:");
  console.log(`      VERALIX_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("   2. Redeploy Edge Functions:");
  console.log("      npx supabase functions deploy mint-nft-crestchain");
  console.log("   3. Test certificate creation");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
