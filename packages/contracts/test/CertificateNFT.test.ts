import { expect } from "chai";
import { ethers } from "hardhat";
import { CertificateNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CertificateNFT", function () {
  let certificateNFT: CertificateNFT;
  let admin: SignerWithAddress;
  let issuer: SignerWithAddress;
  let student1: SignerWithAddress;
  let student2: SignerWithAddress;

  beforeEach(async function () {
    [admin, issuer, student1, student2] = await ethers.getSigners();

    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    certificateNFT = await CertificateNFT.deploy();
    await certificateNFT.waitForDeployment();

    // Grant ISSUER_ROLE
    const ISSUER_ROLE = await certificateNFT.ISSUER_ROLE();
    await certificateNFT.grantRole(ISSUER_ROLE, issuer.address);
  });

  describe("Minting", function () {
    it("should mint a certificate NFT", async function () {
      const uri = "ipfs://QmCert123";
      const requestId = "req_001";
      await certificateNFT.connect(issuer).mintCertificate(student1.address, uri, requestId);

      expect(await certificateNFT.ownerOf(1)).to.equal(student1.address);
      expect(await certificateNFT.tokenURI(1)).to.equal(uri);
      expect(await certificateNFT.issuerOf(1)).to.equal(issuer.address);
      expect(await certificateNFT.requestIdOf(1)).to.equal(requestId);
    });

    it("should emit CertificateMinted event", async function () {
      const uri = "ipfs://QmCert123";
      const requestId = "req_001";
      await expect(
        certificateNFT.connect(issuer).mintCertificate(student1.address, uri, requestId)
      )
        .to.emit(certificateNFT, "CertificateMinted")
        .withArgs(1, issuer.address, student1.address, requestId, uri);
    });

    it("should reject minting from non-issuer", async function () {
      await expect(
        certificateNFT.connect(student1).mintCertificate(student1.address, "ipfs://test", "req_001")
      ).to.be.reverted;
    });
  });

  describe("Soulbound", function () {
    beforeEach(async function () {
      await certificateNFT.connect(issuer).mintCertificate(student1.address, "ipfs://test", "req_001");
    });

    it("should revert on transferFrom", async function () {
      await expect(
        certificateNFT.connect(student1).transferFrom(student1.address, student2.address, 1)
      ).to.be.revertedWith("Soulbound: non-transferable");
    });

    it("should revert on safeTransferFrom", async function () {
      await expect(
        certificateNFT.connect(student1)["safeTransferFrom(address,address,uint256)"](
          student1.address,
          student2.address,
          1
        )
      ).to.be.revertedWith("Soulbound: non-transferable");
    });

    it("should revert on approve", async function () {
      await expect(
        certificateNFT.connect(student1).approve(student2.address, 1)
      ).to.be.revertedWith("Soulbound: approvals disabled");
    });

    it("should revert on setApprovalForAll", async function () {
      await expect(
        certificateNFT.connect(student1).setApprovalForAll(student2.address, true)
      ).to.be.revertedWith("Soulbound: approvals disabled");
    });
  });

  describe("Issuer Role Management", function () {
    it("should grant issuer role", async function () {
      await certificateNFT.grantIssuerRole(student1.address);
      const ISSUER_ROLE = await certificateNFT.ISSUER_ROLE();
      expect(await certificateNFT.hasRole(ISSUER_ROLE, student1.address)).to.be.true;
    });

    it("should revoke issuer role", async function () {
      await certificateNFT.grantIssuerRole(student1.address);
      await certificateNFT.revokeIssuerRole(student1.address);
      const ISSUER_ROLE = await certificateNFT.ISSUER_ROLE();
      expect(await certificateNFT.hasRole(ISSUER_ROLE, student1.address)).to.be.false;
    });

    it("should not allow non-admin to grant issuer role", async function () {
      await expect(
        certificateNFT.connect(issuer).grantIssuerRole(student1.address)
      ).to.be.reverted;
    });
  });
});
