// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VeralixCertificate
 * @dev NFT Certificate for Veralix jewelry authentication
 */
contract VeralixCertificate is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Certificate structure
    struct Certificate {
        string certificateId;      // VRX-XXXXX
        string jewelryType;        // Ring, Necklace, Bracelet, etc.
        string description;        // Jewelry description
        string imageHash;          // IPFS hash of the image
        string metadataURI;        // IPFS URI of complete metadata
        address owner;             // Current owner
        uint256 appraisalValue;    // Appraisal value
        string appraisalCurrency;  // COP, USD, etc.
        uint256 createdAt;         // Creation timestamp
        bool isActive;             // Certificate status
    }

    // Mapping from tokenId to certificate
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping from certificateId to tokenId
    mapping(string => uint256) public certificateIdToTokenId;
    
    // Events
    event CertificateCreated(
        uint256 indexed tokenId,
        string certificateId,
        address indexed owner,
        string metadataURI
    );
    
    event CertificateTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    constructor() ERC721("Veralix Certificate", "VRX") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Creates a new certificate NFT
     * @param certificateId Unique certificate identifier (VRX-XXXXX)
     * @param jewelryType Type of jewelry
     * @param description Jewelry description
     * @param imageHash IPFS hash of the jewelry image
     * @param metadataURI IPFS URI of complete metadata
     * @param ownerAddress Owner's wallet address
     * @param appraisalValue Appraisal value
     * @param appraisalCurrency Currency code (COP, USD, etc.)
     * @return tokenId The newly created token ID
     */
    function createCertificate(
        string memory certificateId,
        string memory jewelryType,
        string memory description,
        string memory imageHash,
        string memory metadataURI,
        address ownerAddress,
        uint256 appraisalValue,
        string memory appraisalCurrency
    ) public onlyOwner returns (uint256) {
        require(
            certificateIdToTokenId[certificateId] == 0,
            "Certificate ID already exists"
        );
        require(ownerAddress != address(0), "Invalid owner address");
        require(bytes(certificateId).length > 0, "Certificate ID cannot be empty");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(ownerAddress, tokenId);
        _setTokenURI(tokenId, metadataURI);

        certificates[tokenId] = Certificate({
            certificateId: certificateId,
            jewelryType: jewelryType,
            description: description,
            imageHash: imageHash,
            metadataURI: metadataURI,
            owner: ownerAddress,
            appraisalValue: appraisalValue,
            appraisalCurrency: appraisalCurrency,
            createdAt: block.timestamp,
            isActive: true
        });

        certificateIdToTokenId[certificateId] = tokenId;

        emit CertificateCreated(tokenId, certificateId, ownerAddress, metadataURI);

        return tokenId;
    }

    /**
     * @dev Gets certificate information by tokenId
     * @param tokenId The token ID
     * @return Certificate structure
     */
    function getCertificate(uint256 tokenId) 
        public 
        view 
        returns (Certificate memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificates[tokenId];
    }

    /**
     * @dev Gets tokenId by certificateId
     * @param certificateId The certificate ID (VRX-XXXXX)
     * @return tokenId The token ID
     */
    function getTokenIdByCertificateId(string memory certificateId) 
        public 
        view 
        returns (uint256) 
    {
        uint256 tokenId = certificateIdToTokenId[certificateId];
        require(tokenId != 0 || keccak256(bytes(certificates[0].certificateId)) == keccak256(bytes(certificateId)), 
                "Certificate ID not found");
        return tokenId;
    }

    /**
     * @dev Checks if a certificate exists
     * @param certificateId The certificate ID
     * @return bool True if exists
     */
    function certificateExists(string memory certificateId) 
        public 
        view 
        returns (bool) 
    {
        uint256 tokenId = certificateIdToTokenId[certificateId];
        return tokenId != 0 || (tokenId == 0 && keccak256(bytes(certificates[0].certificateId)) == keccak256(bytes(certificateId)));
    }

    /**
     * @dev Gets total number of certificates
     * @return uint256 Total certificates
     */
    function totalCertificates() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override to handle transfers
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);
        
        if (from != address(0) && to != address(0)) {
            certificates[tokenId].owner = to;
            emit CertificateTransferred(tokenId, from, to);
        }
        
        return previousOwner;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
