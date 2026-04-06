import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProductNFT", function () {
  let productNFT: ProductNFT;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [admin, minter, user1, user2] = await ethers.getSigners();

    const ProductNFT = await ethers.getContractFactory("ProductNFT");
    productNFT = await ProductNFT.deploy();
    await productNFT.waitForDeployment();

    // Grant MINTER_ROLE to minter
    const MINTER_ROLE = await productNFT.MINTER_ROLE();
    await productNFT.grantRole(MINTER_ROLE, minter.address);
  });

  describe("Minting", function () {
    it("should mint an asset NFT", async function () {
      const uri = "ipfs://QmTest123";
      const tx = await productNFT.connect(minter).mintAsset(user1.address, uri);
      await tx.wait();

      expect(await productNFT.ownerOf(1)).to.equal(user1.address);
      expect(await productNFT.tokenURI(1)).to.equal(uri);
      expect(await productNFT.originalMinter(1)).to.equal(user1.address);
    });

    it("should emit AssetMinted event", async function () {
      const uri = "ipfs://QmTest123";
      await expect(productNFT.connect(minter).mintAsset(user1.address, uri))
        .to.emit(productNFT, "AssetMinted")
        .withArgs(1, user1.address, uri);
    });

    it("should auto-increment token IDs", async function () {
      await productNFT.connect(minter).mintAsset(user1.address, "ipfs://1");
      await productNFT.connect(minter).mintAsset(user2.address, "ipfs://2");

      expect(await productNFT.ownerOf(1)).to.equal(user1.address);
      expect(await productNFT.ownerOf(2)).to.equal(user2.address);
      expect(await productNFT.totalSupply()).to.equal(2);
    });

    it("should reject minting from non-minter", async function () {
      await expect(
        productNFT.connect(user1).mintAsset(user1.address, "ipfs://test")
      ).to.be.reverted;
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await productNFT.connect(minter).mintAsset(user1.address, "ipfs://test");
    });

    it("should transfer ownership", async function () {
      await productNFT.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await productNFT.ownerOf(1)).to.equal(user2.address);
    });

    it("should log transfer history", async function () {
      await productNFT.connect(user1).transferFrom(user1.address, user2.address, 1);

      const history = await productNFT.getTransferHistory(1);
      expect(history.length).to.equal(2); // mint + transfer
      expect(history[0].from).to.equal(ethers.ZeroAddress);
      expect(history[0].to).to.equal(user1.address);
      expect(history[1].from).to.equal(user1.address);
      expect(history[1].to).to.equal(user2.address);
    });

    it("should emit AssetTransferred event", async function () {
      await expect(productNFT.connect(user1).transferFrom(user1.address, user2.address, 1))
        .to.emit(productNFT, "AssetTransferred");
    });
  });

  describe("Access Control", function () {
    it("should allow admin to grant minter role", async function () {
      const MINTER_ROLE = await productNFT.MINTER_ROLE();
      await productNFT.grantRole(MINTER_ROLE, user2.address);
      expect(await productNFT.hasRole(MINTER_ROLE, user2.address)).to.be.true;
    });

    it("should not allow non-admin to grant roles", async function () {
      const MINTER_ROLE = await productNFT.MINTER_ROLE();
      await expect(
        productNFT.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.reverted;
    });
  });
});
