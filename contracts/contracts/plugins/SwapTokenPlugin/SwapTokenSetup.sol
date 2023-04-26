// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import {IDAO} from "@aragon/osx/core/dao/IDAO.sol";
import {DAO} from "@aragon/osx/core/dao/DAO.sol";
import {PermissionLib} from "@aragon/osx/core/permission/PermissionLib.sol";
import {PluginSetup, IPluginSetup} from "@aragon/osx/framework/plugin/setup/PluginSetup.sol";
import {SwapToken} from "./SwapToken.sol";

/// @title SwapTokenSetup
/// @notice The setup contract of the `SwapToken` plugin.
contract SwapTokenSetup is PluginSetup {
    SwapToken private immutable swapToken;

    /// @notice The contract constructor, that deployes the `SwapToken` plugin logic contract.
    constructor() {
        swapToken = new SwapToken();
    }

    /// @inheritdoc IPluginSetup
    function prepareInstallation(
        address _dao,
        bytes calldata _data
    )
        external
        returns (address plugin, PreparedSetupData memory preparedSetupData)
    {
        (address uniswapRouter) = abi.decode(_data, (address));

        // Prepare and Deploy the plugin proxy.
        plugin = createERC1967Proxy(
            address(swapToken),
            abi.encodeWithSelector(
                SwapToken.initialize.selector,
                _dao,
                uniswapRouter
            )
        );

        // Prepare permissions
        PermissionLib.MultiTargetPermission[]
            memory permissions = new PermissionLib.MultiTargetPermission[](4);

        // Set permissions to be granted.
        // Grant the list of prmissions of the plugin to the DAO.
        permissions[0] = PermissionLib.MultiTargetPermission(
            PermissionLib.Operation.Grant,
            plugin,
            _dao,
            PermissionLib.NO_CONDITION,
            swapToken.SWAP_TOKENS_PERMISSION_ID()
        );

        preparedSetupData.permissions = permissions;
    }

    /// @inheritdoc IPluginSetup
    function prepareUninstallation(
        address _dao,
        SetupPayload calldata _payload
    )
        external
        view
        returns (PermissionLib.MultiTargetPermission[] memory permissions)
    {
        // Prepare permissions
        permissions = new PermissionLib.MultiTargetPermission[](4);

        // Set permissions to be Revoked.
        permissions[0] = PermissionLib.MultiTargetPermission(
            PermissionLib.Operation.Revoke,
            _payload.plugin,
            _dao,
            PermissionLib.NO_CONDITION,
            swapToken.SWAP_TOKENS_PERMISSION_ID()
        );
    }

    /// @inheritdoc IPluginSetup
    function implementation() external view returns (address) {
        return address(swapToken);
    }
}
