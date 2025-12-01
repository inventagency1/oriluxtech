// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VeralixCertificate
 * @dev NFT Certificate contract for Veralix jewelry authentication on BSC Mainnet
 * @notice Each NFT represents a unique jewelry certificate with blockchain verification
 */
contract VeralixCertificate is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from certificate ID to token ID
    mapping(string => uint256) public certificateToToken;
    
    // Mapping from token ID to certificate ID
    mapping(uint256 => string) public tokenToCertificate;
    
    // Authorized minters (can be the backend wallet)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event CertificateCreated(
        uint256 indexed tokenId,
        string certificateId,
        address indexed owner,
        string metadataURI,
        uint256 timestamp
    );
    
    event MinterAuthorized(address indexed minter, bool authorized);

    constructor() ERC721("Veralix Certificate", "VRX-CERT") Ownable(msg.sender) {
        // Owner is automatically an authorized minter
        authorizedMinters[msg.sender] = true;
    }

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    /**
     * @dev Authorize or revoke a minter address
     * @param minter Address to authorize/revoke
     * @param authorized True to authorize, false to revoke
     */
    function setAuthorizedMinter(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    /**
     * @dev Create a new certificate NFT
     * @param to Address to mint the certificate to
     * @param certificateId Unique certificate ID (e.g., "VRX-20251130-ABC123")
     * @param metadataURI IPFS URI for the certificate metadata
     * @return tokenId The ID of the newly minted token
     */
    function createCertificate(
        address to,
        string memory certificateId,
        string memory metadataURI
    ) external onlyAuthorizedMinter returns (uint256) {
        require(bytes(certificateId).length > 0, "Certificate ID required");
        require(certificateToToken[certificateId] == 0, "Certificate already exists");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        certificateToToken[certificateId] = tokenId;
        tokenToCertificate[tokenId] = certificateId;
        
        emit CertificateCreated(tokenId, certificateId, to, metadataURI, block.timestamp);
        
        return tokenId;
    }

    /**
     * @dev Get token ID by certificate ID
     * @param certificateId The certificate ID to look up
     * @return tokenId The token ID (0 if not found)
     */
    function getTokenByCertificateId(string memory certificateId) external view returns (uint256) {
        return certificateToToken[certificateId];
    }

    /**
     * @dev Get certificate ID by token ID
     * @param tokenId The token ID to look up
     * @return certificateId The certificate ID
     */
    function getCertificateByTokenId(uint256 tokenId) external view returns (string memory) {
        return tokenToCertificate[tokenId];
    }

    /**
     * @dev Check if a certificate exists
     * @param certificateId The certificate ID to check
     * @return exists True if the certificate exists
     */
    function certificateExists(string memory certificateId) external view returns (bool) {
        return certificateToToken[certificateId] != 0;
    }

    /**
     * @dev Get total number of certificates minted
     * @return count Total certificates
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
