import { run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const productNFTAddress = process.env.PRODUCT_NFT_ADDRESS;
  const certificateNFTAddress = process.env.CERTIFICATE_NFT_ADDRESS;

  if (!productNFTAddress || !certificateNFTAddress) {
    console.error("❌ Contract addresses not set in .env");
    process.exit(1);
  }

  console.log("Verifying ProductNFT at:", productNFTAddress);
  try {
    await run("verify:verify", {
      address: productNFTAddress,
      constructorArguments: [],
    });
    console.log("✅ ProductNFT verified");
  } catch (e: any) {
    if (e.message.includes("Already Verified")) {
      console.log("ProductNFT already verified");
    } else {
      console.error("ProductNFT verification failed:", e.message);
    }
  }

  console.log("\nVerifying CertificateNFT at:", certificateNFTAddress);
  try {
    await run("verify:verify", {
      address: certificateNFTAddress,
      constructorArguments: [],
    });
    console.log("✅ CertificateNFT verified");
  } catch (e: any) {
    if (e.message.includes("Already Verified")) {
      console.log("CertificateNFT already verified");
    } else {
      console.error("CertificateNFT verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
