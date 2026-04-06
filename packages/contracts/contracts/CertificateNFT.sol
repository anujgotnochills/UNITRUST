// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertificateNFT
 * @dev Soulbound ERC-721 for non-transferable certificate NFTs
 * Certificates cannot be transferred, approved, or sold — they are bound to the recipient
 */
contract CertificateNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    uint256 private _tokenIdCounter;

    // Mapping from tokenId to issuer address
    mapping(uint256 => address) public issuerOf;

    // Mapping from tokenId to the original request ID (MongoDB reference)
    mapping(uint256 => string) public requestIdOf;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed student,
        string requestId,
        string tokenURI
    );

    constructor() ERC721("UniTrust Certificate", "UTCERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @dev Mints a new soulbound certificate NFT
     * @param student The address to receive the certificate
     * @param uri The IPFS metadata URI
     * @param requestId The MongoDB request ID linking this cert to the request
     * @return The new token ID
     */
    function mintCertificate(
        address student,
        string memory uri,
        string memory requestId
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, uri);
        issuerOf[newTokenId] = msg.sender;
        requestIdOf[newTokenId] = requestId;

        emit CertificateMinted(newTokenId, msg.sender, student, requestId, uri);
        return newTokenId;
    }

    /**
     * @dev Grants ISSUER_ROLE to an institute address
     */
    function grantIssuerRole(
        address institute
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, institute);
    }

    /**
     * @dev Revokes ISSUER_ROLE from an institute address
     */
    function revokeIssuerRole(
        address institute
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, institute);
    }

    /**
     * @dev Returns the issuer of a certificate
     */
    function getIssuer(uint256 tokenId) external view returns (address) {
        return issuerOf[tokenId];
    }

    /**
     * @dev Returns the current token count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // ==================== SOULBOUND OVERRIDES ====================
    // All transfer and approval functions are disabled

    /**
     * @dev Soulbound: transfers are disabled
     */
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override(ERC721, IERC721) {
        revert("Soulbound: non-transferable");
    }

    /**
     * @dev Soulbound: safe transfers are disabled
     */
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override(ERC721, IERC721) {
        revert("Soulbound: non-transferable");
    }

    /**
     * @dev Soulbound: approvals are disabled
     */
    function approve(
        address,
        uint256
    ) public pure override(ERC721, IERC721) {
        revert("Soulbound: approvals disabled");
    }

    /**
     * @dev Soulbound: operator approvals are disabled
     */
    function setApprovalForAll(
        address,
        bool
    ) public pure override(ERC721, IERC721) {
        revert("Soulbound: approvals disabled");
    }

    // Required overrides for AccessControl + ERC721
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
