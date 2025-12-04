// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title VeralixMasterRegistryUpgradeable
 * @dev Contrato principal para el registro de certificados de joyería con patrón UUPS upgradeable
 * @notice Este contrato utiliza el patrón UUPS para permitir actualizaciones futuras sin perder datos
 */
contract VeralixMasterRegistryUpgradeable is 
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ============ ROLES ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ASSIGNER_ROLE = keccak256("ASSIGNER_ROLE");
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant JEWELRY_STORE_ROLE = keccak256("JEWELRY_STORE_ROLE");
    bytes32 public constant APPRAISER_ROLE = keccak256("APPRAISER_ROLE");

    // ============ ESTRUCTURAS ============
    struct Certificate {
        uint256 tokenId;
        string certificateNumber;
        string jewelryType;
        string description;
        string imageHash;
        string metadataURI;
        address currentOwner;
        address jewelryStore;
        uint256 creationDate;
        uint256 lastUpdate;
        bool isActive;
        bool isTransferable;
        uint256 appraisalValue;
        string appraisalCurrency;
    }

    struct JewelryStore {
        address storeAddress;
        string storeName;
        string licenseNumber;
        string contactInfo;
        bool isActive;
        bool isVerified;
        uint256 registrationDate;
        uint256 certificatesIssued;
        string[] specializations;
    }

    struct Appraisal {
        uint256 tokenId;
        address appraiser;
        uint256 appraisalValue;
        string currency;
        uint256 appraisalDate;
        string appraisalDocument;
        bool isValid;
        string notes;
    }

    // ============ STORAGE ============
    mapping(uint256 => Certificate) public certificates;
    mapping(string => uint256) public certificateNumberToTokenId;
    mapping(address => JewelryStore) public jewelryStores;
    mapping(uint256 => Appraisal[]) public tokenAppraisals;
    mapping(address => bool) public blacklistedAddresses;
    mapping(uint256 => bool) public burnedTokens;

    uint256 private _currentTokenId;
    address[] public registeredStores;
    
    // ============ EVENTOS ============
    event CertificateCreated(
        uint256 indexed tokenId,
        string certificateNumber,
        address indexed jewelryStore,
        address indexed owner
    );
    
    event CertificatesBatchCreated(
        uint256[] tokenIds,
        address indexed jewelryStore,
        address indexed owner
    );
    
    event CertificateAssigned(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );
    
    event CertificateUpdated(
        uint256 indexed tokenId,
        string newMetadataURI
    );
    
    event CertificateBurned(
        uint256 indexed tokenId,
        address indexed burner
    );
    
    event JewelryStoreRegistered(
        address indexed storeAddress,
        string storeName
    );
    
    event JewelryStoreSuspended(
        address indexed storeAddress,
        string reason
    );
    
    event AppraisalAdded(
        uint256 indexed tokenId,
        address indexed appraiser,
        uint256 value,
        string currency
    );
    
    event AddressBlacklisted(
        address indexed account,
        bool status
    );

    // ============ MODIFICADORES ============
    modifier onlyRoleOrOwner(bytes32 role) {
        require(
            hasRole(role, msg.sender) || owner() == msg.sender,
            "VeralixMasterRegistry: caller does not have required role or is not owner"
        );
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(tokenId > 0 && tokenId <= _currentTokenId, "VeralixMasterRegistry: invalid token ID");
        require(!burnedTokens[tokenId], "VeralixMasterRegistry: token has been burned");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklistedAddresses[account], "VeralixMasterRegistry: address is blacklisted");
        _;
    }

    // ============ INICIALIZACIÓN ============
    /**
     * @dev Inicializa el contrato upgradeable
     * @param baseURI URI base para los metadatos de los tokens
     */
    function initialize(string memory baseURI) public initializer {
        __ERC1155_init(baseURI);
        __AccessControl_init();
        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // Configurar roles iniciales
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(ASSIGNER_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);

        _currentTokenId = 0;
    }

    // ============ FUNCIONES DE UPGRADE ============
    /**
     * @dev Autoriza las actualizaciones del contrato
     * @param newImplementation Dirección de la nueva implementación
     */
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {}

    // ============ FUNCIONES DE CERTIFICADOS ============
    /**
     * @dev Crea un nuevo certificado de joyería
     */
    function createCertificate(
        string memory certificateNumber,
        string memory jewelryType,
        string memory description,
        string memory imageHash,
        string memory metadataURI,
        address owner,
        uint256 appraisalValue,
        string memory appraisalCurrency
    ) external onlyRoleOrOwner(MINTER_ROLE) whenNotPaused nonReentrant notBlacklisted(owner) returns (uint256) {
        require(bytes(certificateNumber).length > 0, "VeralixMasterRegistry: certificate number cannot be empty");
        require(certificateNumberToTokenId[certificateNumber] == 0, "VeralixMasterRegistry: certificate number already exists");
        require(owner != address(0), "VeralixMasterRegistry: owner cannot be zero address");
        require(jewelryStores[msg.sender].isActive, "VeralixMasterRegistry: jewelry store not active");

        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

        certificates[newTokenId] = Certificate({
            tokenId: newTokenId,
            certificateNumber: certificateNumber,
            jewelryType: jewelryType,
            description: description,
            imageHash: imageHash,
            metadataURI: metadataURI,
            currentOwner: owner,
            jewelryStore: msg.sender,
            creationDate: block.timestamp,
            lastUpdate: block.timestamp,
            isActive: true,
            isTransferable: true,
            appraisalValue: appraisalValue,
            appraisalCurrency: appraisalCurrency
        });

        certificateNumberToTokenId[certificateNumber] = newTokenId;
        jewelryStores[msg.sender].certificatesIssued++;

        _mint(owner, newTokenId, 1, "");

        emit CertificateCreated(newTokenId, certificateNumber, msg.sender, owner);
        return newTokenId;
    }

    /**
     * @dev Crea múltiples certificados para un único propietario usando mint batch
     * @notice Optimiza gas al agrupar en una sola transacción
     */
    function createCertificatesBatchSingleOwner(
        // Datos variables por certificado
        string[] memory certificateNumbers,
        string[] memory metadataURIs,
        // Propietario único para todos los certificados del lote
        address owner
    ) external onlyRoleOrOwner(MINTER_ROLE) whenNotPaused nonReentrant notBlacklisted(owner) returns (uint256[] memory) {
        require(jewelryStores[msg.sender].isActive, "VeralixMasterRegistry: jewelry store not active");
        uint256 count = certificateNumbers.length;
        require(count > 0, "VeralixMasterRegistry: empty batch");
        require(metadataURIs.length == count, "VeralixMasterRegistry: array length mismatch");

        uint256[] memory ids = new uint256[](count);
        uint256[] memory amounts = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            require(bytes(certificateNumbers[i]).length > 0, "VeralixMasterRegistry: certificate number cannot be empty");
            require(certificateNumberToTokenId[certificateNumbers[i]] == 0, "VeralixMasterRegistry: certificate number already exists");
            require(owner != address(0), "VeralixMasterRegistry: owner cannot be zero address");

            _currentTokenId++;
            uint256 newTokenId = _currentTokenId;

            certificates[newTokenId] = Certificate({
                tokenId: newTokenId,
                certificateNumber: certificateNumbers[i],
                jewelryType: "Jewelry Certificate",
                description: "",
                imageHash: "",
                metadataURI: metadataURIs[i],
                currentOwner: owner,
                jewelryStore: msg.sender,
                creationDate: block.timestamp,
                lastUpdate: block.timestamp,
                isActive: true,
                isTransferable: true,
                appraisalValue: 0,
                appraisalCurrency: ""
            });

            certificateNumberToTokenId[certificateNumbers[i]] = newTokenId;
            ids[i] = newTokenId;
            amounts[i] = 1;
        }

        jewelryStores[msg.sender].certificatesIssued += count;

        // Mint batch al propietario
        _mintBatch(owner, ids, amounts, "");

        emit CertificatesBatchCreated(ids, msg.sender, owner);
        return ids;
    }

    /**
     * @dev Asigna un certificado a un nuevo propietario
     */
    function assignCertificate(
        uint256 tokenId,
        address newOwner
    ) external onlyRoleOrOwner(ASSIGNER_ROLE) whenNotPaused validTokenId(tokenId) notBlacklisted(newOwner) {
        require(newOwner != address(0), "VeralixMasterRegistry: new owner cannot be zero address");
        require(certificates[tokenId].isTransferable, "VeralixMasterRegistry: certificate is not transferable");
        
        address currentOwner = certificates[tokenId].currentOwner;
        require(currentOwner != newOwner, "VeralixMasterRegistry: new owner is the same as current owner");

        certificates[tokenId].currentOwner = newOwner;
        certificates[tokenId].lastUpdate = block.timestamp;

        _safeTransferFrom(currentOwner, newOwner, tokenId, 1, "");

        emit CertificateAssigned(tokenId, currentOwner, newOwner);
    }

    /**
     * @dev Actualiza los metadatos de un certificado
     */
    function updateCertificateMetadata(
        uint256 tokenId,
        string memory newMetadataURI
    ) external onlyRoleOrOwner(UPDATER_ROLE) whenNotPaused validTokenId(tokenId) {
        require(bytes(newMetadataURI).length > 0, "VeralixMasterRegistry: metadata URI cannot be empty");
        
        certificates[tokenId].metadataURI = newMetadataURI;
        certificates[tokenId].lastUpdate = block.timestamp;

        emit CertificateUpdated(tokenId, newMetadataURI);
    }

    /**
     * @dev Actualiza metadatos de múltiples certificados en lote
     */
    function updateCertificateMetadataBatch(
        uint256[] memory tokenIds,
        string[] memory newMetadataURIs
    ) external onlyRoleOrOwner(UPDATER_ROLE) whenNotPaused {
        require(tokenIds.length == newMetadataURIs.length, "VeralixMasterRegistry: array length mismatch");
        uint256 count = tokenIds.length;
        require(count > 0, "VeralixMasterRegistry: empty batch");

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenIds[i];
            require(tokenId > 0 && tokenId <= _currentTokenId, "VeralixMasterRegistry: invalid token ID");
            require(!burnedTokens[tokenId], "VeralixMasterRegistry: token has been burned");
            require(bytes(newMetadataURIs[i]).length > 0, "VeralixMasterRegistry: metadata URI cannot be empty");

            certificates[tokenId].metadataURI = newMetadataURIs[i];
            certificates[tokenId].lastUpdate = block.timestamp;

            emit CertificateUpdated(tokenId, newMetadataURIs[i]);
        }
    }

    /**
     * @dev Quema un certificado
     */
    function burnCertificate(uint256 tokenId) 
        external 
        onlyRoleOrOwner(MINTER_ROLE) 
        whenNotPaused 
        validTokenId(tokenId) 
    {
        address owner = certificates[tokenId].currentOwner;
        
        certificates[tokenId].isActive = false;
        burnedTokens[tokenId] = true;
        
        _burn(owner, tokenId, 1);
        
        emit CertificateBurned(tokenId, msg.sender);
    }

    // ============ FUNCIONES DE TIENDAS ============
    /**
     * @dev Registra una nueva tienda de joyería
     */
    function registerJewelryStore(
        address storeAddress,
        string memory storeName,
        string memory licenseNumber,
        string memory contactInfo,
        string[] memory specializations
    ) external onlyRoleOrOwner(DEFAULT_ADMIN_ROLE) {
        require(storeAddress != address(0), "VeralixMasterRegistry: store address cannot be zero");
        require(bytes(storeName).length > 0, "VeralixMasterRegistry: store name cannot be empty");
        require(!jewelryStores[storeAddress].isActive, "VeralixMasterRegistry: store already registered");

        jewelryStores[storeAddress] = JewelryStore({
            storeAddress: storeAddress,
            storeName: storeName,
            licenseNumber: licenseNumber,
            contactInfo: contactInfo,
            isActive: true,
            isVerified: false,
            registrationDate: block.timestamp,
            certificatesIssued: 0,
            specializations: specializations
        });

        registeredStores.push(storeAddress);
        _grantRole(JEWELRY_STORE_ROLE, storeAddress);

        emit JewelryStoreRegistered(storeAddress, storeName);
    }

    /**
     * @dev Suspende una tienda de joyería
     */
    function suspendJewelryStore(
        address storeAddress,
        string memory reason
    ) external onlyRoleOrOwner(DEFAULT_ADMIN_ROLE) {
        require(jewelryStores[storeAddress].isActive, "VeralixMasterRegistry: store not active");
        
        jewelryStores[storeAddress].isActive = false;
        _revokeRole(JEWELRY_STORE_ROLE, storeAddress);

        emit JewelryStoreSuspended(storeAddress, reason);
    }

    // ============ FUNCIONES DE TASACIÓN ============
    /**
     * @dev Añade una tasación a un certificado
     */
    function addAppraisal(
        uint256 tokenId,
        uint256 appraisalValue,
        string memory currency,
        string memory appraisalDocument,
        string memory notes
    ) external onlyRoleOrOwner(APPRAISER_ROLE) whenNotPaused validTokenId(tokenId) {
        require(appraisalValue > 0, "VeralixMasterRegistry: appraisal value must be greater than zero");
        require(bytes(currency).length > 0, "VeralixMasterRegistry: currency cannot be empty");

        Appraisal memory newAppraisal = Appraisal({
            tokenId: tokenId,
            appraiser: msg.sender,
            appraisalValue: appraisalValue,
            currency: currency,
            appraisalDate: block.timestamp,
            appraisalDocument: appraisalDocument,
            isValid: true,
            notes: notes
        });

        tokenAppraisals[tokenId].push(newAppraisal);

        // Actualizar el valor de tasación en el certificado
        certificates[tokenId].appraisalValue = appraisalValue;
        certificates[tokenId].appraisalCurrency = currency;
        certificates[tokenId].lastUpdate = block.timestamp;

        emit AppraisalAdded(tokenId, msg.sender, appraisalValue, currency);
    }

    // ============ FUNCIONES DE SEGURIDAD ============
    /**
     * @dev Pausa el contrato
     */
    function pause() external onlyRoleOrOwner(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Despausa el contrato
     */
    function unpause() external onlyRoleOrOwner(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Añade o remueve una dirección de la lista negra
     */
    function blacklistAddress(address account, bool status) 
        external 
        onlyRoleOrOwner(DEFAULT_ADMIN_ROLE) 
    {
        require(account != address(0), "VeralixMasterRegistry: cannot blacklist zero address");
        require(account != owner(), "VeralixMasterRegistry: cannot blacklist owner");
        
        blacklistedAddresses[account] = status;
        emit AddressBlacklisted(account, status);
    }

    // ============ FUNCIONES DE CONSULTA ============
    /**
     * @dev Obtiene información de un certificado
     */
    function getCertificate(uint256 tokenId) 
        external 
        view 
        validTokenId(tokenId) 
        returns (Certificate memory) 
    {
        return certificates[tokenId];
    }

    /**
     * @dev Obtiene el ID de token por número de certificado
     */
    function getTokenIdByCertificateNumber(string memory certificateNumber) 
        external 
        view 
        returns (uint256) 
    {
        return certificateNumberToTokenId[certificateNumber];
    }

    /**
     * @dev Obtiene información de una tienda
     */
    function getJewelryStore(address storeAddress) 
        external 
        view 
        returns (JewelryStore memory) 
    {
        return jewelryStores[storeAddress];
    }

    /**
     * @dev Obtiene todas las tasaciones de un token
     */
    function getTokenAppraisals(uint256 tokenId) 
        external 
        view 
        validTokenId(tokenId) 
        returns (Appraisal[] memory) 
    {
        return tokenAppraisals[tokenId];
    }

    /**
     * @dev Obtiene el número total de tokens creados
     */
    function totalSupply() external view returns (uint256) {
        return _currentTokenId;
    }

    /**
     * @dev Obtiene todas las tiendas registradas
     */
    function getRegisteredStores() external view returns (address[] memory) {
        return registeredStores;
    }

    // ============ OVERRIDES REQUERIDOS ============
    /**
     * @dev Override requerido por Solidity para múltiples herencias
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override para prevenir transferencias cuando está pausado o desde direcciones en lista negra
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override whenNotPaused {
        if (from != address(0)) {
            require(!blacklistedAddresses[from], "VeralixMasterRegistry: from address is blacklisted");
        }
        if (to != address(0)) {
            require(!blacklistedAddresses[to], "VeralixMasterRegistry: to address is blacklisted");
        }
        
        super._update(from, to, ids, values);
    }
}
