// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import {PluginUUPSUpgradeable, IDAO} from "@aragon/osx/core/plugin/PluginUUPSUpgradeable.sol";
import {SeaportInterface} from "./interfaces/SeaportInterface.sol";
import {BasicOrderParameters, Order} from "./lib/ConsiderationStructs.sol";

/// @title SwapToken
/// @notice The Swap token implementation to allow groups swap tokens
contract NFTCollector is PluginUUPSUpgradeable {
    /// @notice The ID of the permission required to call the `addAddresses` and `removeAddresses` functions.
    bytes32 public constant NFT_COLLECTOR_PERMISSION_ID =
        keccak256("NFT_COLLECTOR_PERMISSION");

    SeaportInterface public seaport;

    /// @notice Initializes the component.
    /// @dev This method is required to support [ERC-1822](https://eips.ethereum.org/EIPS/eip-1822).
    /// @param _dao The IDAO interface of the associated DAO.
    /// @param _seaport Seaport address
    function initialize(IDAO _dao, address _seaport) external initializer {
        __PluginUUPSUpgradeable_init(_dao);
        seaport = SeaportInterface(_seaport);
    }

    function fulfillOrder(
        Order calldata order,
        bytes32 fulfillerConduitKey,
        uint256 _value
    ) external payable auth(NFT_COLLECTOR_PERMISSION_ID) returns (bool fulfilled) {
        return seaport.fulfillOrder{value: _value}(order, fulfillerConduitKey);
    }

    function fulfillBasicOrder(
        BasicOrderParameters calldata parameters,
        uint256 _value
    ) external payable auth(NFT_COLLECTOR_PERMISSION_ID) returns (bool fulfilled) {
        return seaport.fulfillBasicOrder{value: _value}(parameters);
    }

    /// @dev This empty reserved space is put in place to allow future versions to add new
    /// variables without shifting down storage in the inheritance chain.
    /// https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
    uint256[50] private __gap;
}
