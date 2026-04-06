import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy ProductNFT
  console.log("\n--- Deploying ProductNFT ---");
  const ProductNFT = await ethers.getContractFactory("ProductNFT");
  const productNFT = await ProductNFT.deploy();
  await productNFT.waitForDeployment();
  const productNFTAddress = await productNFT.getAddress();
  console.log("ProductNFT deployed to:", productNFTAddress);

  // Deploy CertificateNFT
  console.log("\n--- Deploying CertificateNFT ---");
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.waitForDeployment();
  const certificateNFTAddress = await certificateNFT.getAddress();
  console.log("CertificateNFT deployed to:", certificateNFTAddress);

  // Update packages/config/src/addresses.ts
  const addressesContent = `/**
 * Deployed contract addresses — auto-updated by deploy script
 * Last deployed: ${new Date().toISOString()}
 * Network: Polygon Amoy (Chain ID: 80002)
 * Deployer: ${deployer.address}
 */
export const CONTRACT_ADDRESSES = {
  ProductNFT: '${productNFTAddress}',
  CertificateNFT: '${certificateNFTAddress}',
} as const;
`;

  const configPath = path.resolve(__dirname, "../../../packages/config/src/addresses.ts");
  fs.writeFileSync(configPath, addressesContent);
  console.log("\n✅ Updated packages/config/src/addresses.ts");

  console.log("\n========================================");
  console.log("Deployment Summary:");
  console.log("========================================");
  console.log(`ProductNFT:     ${productNFTAddress}`);
  console.log(`CertificateNFT: ${certificateNFTAddress}`);
  console.log("========================================");
  console.log("\nNext steps:");
  console.log("1. Run 'pnpm run grant-roles' to assign roles to backend wallet");
  console.log("2. Run 'pnpm run verify' to verify contracts on PolygonScan");
  console.log("3. Update .env files with the deployed addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
