// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ProductNFT
 * @dev ERC-721 transferable NFT for physical asset registration
 * Tracks ownership history with transfer records
 */
contract ProductNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _tokenIdCounter;

    struct TransferRecord {
        address from;
        address to;
        uint256 timestamp;
    }

    // Mapping from tokenId to the original minter address
    mapping(uint256 => address) public originalMinter;

    // Mapping from tokenId to transfer history
    mapping(uint256 => TransferRecord[]) private _transferHistory;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI
    );

    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    constructor() ERC721("UniTrust Product", "UTPROD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mints a new asset NFT
     * @param owner The address to receive the NFT
     * @param uri The IPFS metadata URI
     * @return The new token ID
     */
    function mintAsset(
        address owner,
        string memory uri
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(owner, newTokenId);
        _setTokenURI(newTokenId, uri);
        originalMinter[newTokenId] = owner;

        // Record initial "transfer" (mint)
        _transferHistory[newTokenId].push(
            TransferRecord({
                from: address(0),
                to: owner,
                timestamp: block.timestamp
            })
        );

        emit AssetMinted(newTokenId, owner, uri);
        return newTokenId;
    }

    /**
     * @dev Override transferFrom to log transfer history
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        super.transferFrom(from, to, tokenId);
        _logTransfer(tokenId, from, to);
    }

    /**
     * @dev Override safeTransferFrom to log transfer history
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) {
        super.safeTransferFrom(from, to, tokenId, data);
        _logTransfer(tokenId, from, to);
    }

    /**
     * @dev Internal function to log a transfer
     */
    function _logTransfer(
        uint256 tokenId,
        address from,
        address to
    ) internal {
        _transferHistory[tokenId].push(
            TransferRecord({
                from: from,
                to: to,
                timestamp: block.timestamp
            })
        );

        emit AssetTransferred(tokenId, from, to, block.timestamp);
    }

    /**
     * @dev Returns the full transfer history for a token
     */
    function getTransferHistory(
        uint256 tokenId
    ) external view returns (TransferRecord[] memory) {
        return _transferHistory[tokenId];
    }

    /**
     * @dev Returns the current token count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // Required overrides for AccessControl + ERC721
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
