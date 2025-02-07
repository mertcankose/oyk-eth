// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract ERC721 is IERC721, IERC721Metadata {
    event Transfer(address indexed from, address indexed to, uint256 indexed id);
    event Approval(address indexed owner, address indexed spender, uint256 indexed id);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    string private _name;
    string private _symbol;
    address public contractOwner;

    // Token URI için mapping
    mapping(uint256 => string) private _tokenURIs;
    // Base URI için değişken
    string private _baseURI;

    // Mapping from token ID to owner address
    mapping(uint256 => address) internal _ownerOf;
    // Mapping owner address to token count
    mapping(address => uint256) internal _balanceOf;
    // Mapping from token ID to approved address
    mapping(uint256 => address) internal _approvals;
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only owner can call this function");
        _;
    }

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        contractOwner = msg.sender;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf[tokenId] != address(0), "ERC721: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI;

        // Eğer base URI yoksa, direkt token URI'yi döndür
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // Eğer token URI yoksa, base URI + token ID'yi döndür
        if (bytes(_tokenURI).length == 0) {
            return string(abi.encodePacked(base, toString(tokenId)));
        }
        // Eğer ikisi de varsa, birleştir
        return string(abi.encodePacked(base, _tokenURI));
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURI = baseURI_;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        require(_ownerOf[tokenId] != address(0), "ERC721: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function ownerOf(uint256 id) external view returns (address owner) {
        owner = _ownerOf[id];
        require(owner != address(0), "token doesn't exist");
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "owner = zero address");
        return _balanceOf[owner];
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function approve(address spender, uint256 id) external {
        address owner = _ownerOf[id];
        require(msg.sender == owner || isApprovedForAll[owner][msg.sender], "not authorized");

        _approvals[id] = spender;

        emit Approval(owner, spender, id);
    }

    function getApproved(uint256 id) external view returns (address) {
        require(_ownerOf[id] != address(0), "token doesn't exist");
        return _approvals[id];
    }

    function _isApprovedOrOwner(address owner, address spender, uint256 id) internal view returns (bool) {
        return (spender == owner || isApprovedForAll[owner][spender] || spender == _approvals[id]);
    }

    function transferFrom(address from, address to, uint256 id) public {
        require(from == _ownerOf[id], "from != owner");
        require(to != address(0), "transfer to zero address");
        require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

        _balanceOf[from]--;
        _balanceOf[to]++;
        _ownerOf[id] = to;

        delete _approvals[id];

        emit Transfer(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint256 id) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 || 
            IERC721Receiver(to).onERC721Received(msg.sender, from, id, "") == 
            IERC721Receiver.onERC721Received.selector, 
            "unsafe recipient"
        );
    }

    function safeTransferFrom(address from, address to, uint256 id, bytes calldata data) external {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 || 
            IERC721Receiver(to).onERC721Received(msg.sender, from, id, data) ==
            IERC721Receiver.onERC721Received.selector, 
            "unsafe recipient"
        );
    }

    function mint(address to, uint256 id) external onlyOwner {
        require(to != address(0), "mint to zero address");
        require(_ownerOf[id] == address(0), "already minted");

        _balanceOf[to]++;
        _ownerOf[id] = to;

        emit Transfer(address(0), to, id);
    }

    function burn(uint256 id) external onlyOwner {
        address owner = _ownerOf[id];
        require(owner != address(0), "not minted");

        _balanceOf[owner] -= 1;

        delete _ownerOf[id];
        delete _approvals[id];
        delete _tokenURIs[id];

        emit Transfer(owner, address(0), id);
    }

    // Yardımcı fonksiyon: uint256'yı string'e çevirme
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}