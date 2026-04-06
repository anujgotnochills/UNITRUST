import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Granting roles with admin:", admin.address);

  // Get the backend wallet address that needs MINTER and ISSUER roles
  const backendWallet = process.env.BACKEND_WALLET_ADDRESS;
  if (!backendWallet) {
    console.error("❌ BACKEND_WALLET_ADDRESS not set in .env");
    console.log("Add BACKEND_WALLET_ADDRESS=0x... to your .env file");
    process.exit(1);
  }

  // Load deployed contract addresses
  const productNFTAddress = process.env.PRODUCT_NFT_ADDRESS;
  const certificateNFTAddress = process.env.CERTIFICATE_NFT_ADDRESS;

  if (!productNFTAddress || !certificateNFTAddress) {
    console.error("❌ Contract addresses not set in .env");
    console.log("Run deploy script first, then add addresses to .env");
    process.exit(1);
  }

  // Grant MINTER_ROLE on ProductNFT
  console.log("\n--- Granting MINTER_ROLE on ProductNFT ---");
  const ProductNFT = await ethers.getContractAt("ProductNFT", productNFTAddress);
  const MINTER_ROLE = await ProductNFT.MINTER_ROLE();
  const tx1 = await ProductNFT.grantRole(MINTER_ROLE, backendWallet);
  await tx1.wait();
  console.log(`✅ MINTER_ROLE granted to ${backendWallet}`);

  // Grant ISSUER_ROLE on CertificateNFT
  console.log("\n--- Granting ISSUER_ROLE on CertificateNFT ---");
  const CertificateNFT = await ethers.getContractAt("CertificateNFT", certificateNFTAddress);
  const ISSUER_ROLE = await CertificateNFT.ISSUER_ROLE();
  const tx2 = await CertificateNFT.grantRole(ISSUER_ROLE, backendWallet);
  await tx2.wait();
  console.log(`✅ ISSUER_ROLE granted to ${backendWallet}`);

  console.log("\n✅ All roles granted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
