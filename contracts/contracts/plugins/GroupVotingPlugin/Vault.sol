pragma solidity 0.8.17;

import {PermissionManager} from "@aragon/osx/core/permission/PermissionManager.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title Vault
/// @notice Vault contract to store each group assets
contract Vault is PermissionManager {
    /// @notice The ID of the permission required to call the withdraw NFTs.
    bytes32 public constant WITHDRAW_NFT_PERMISSION_ID =
        keccak256("WITHDRAW_NFT_PERMISSION");

    /// @notice The ID of the permission required to call the withdrawn ERC20.
    bytes32 public constant WITHDRAW_ERC20_PERMISSION_ID =
        keccak256("WITHDRAW_ERC20_PERMISSION");

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /** TODO: fix auth auth(WITHDRAW_NFT_PERMISSION_ID) */

    function withdrawNFT(
        address _tokenAddress,
        uint256 _tokenId,
        address _destination
    ) external {
        IERC721(_tokenAddress).safeTransferFrom(
            address(this),
            _destination,
            _tokenId
        );
    }

    /**TODO: fix auth auth(WITHDRAW_ERC20_PERMISSION_ID) */
    function withdrawERC20(
        address _tokenAddress,
        uint256 _amount,
        address _destination
    ) external {
        IERC20(_tokenAddress).transfer(_destination, _amount);
    }
}
