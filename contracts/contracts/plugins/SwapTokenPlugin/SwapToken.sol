// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import {PluginUUPSUpgradeable, IDAO} from "@aragon/osx/core/plugin/PluginUUPSUpgradeable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title SwapToken
/// @notice The Swap token implementation to allow groups swap tokens
contract SwapToken is PluginUUPSUpgradeable {
    /// @notice The ID of the permission required to call the `addAddresses` and `removeAddresses` functions.
    bytes32 public constant SWAP_TOKENS_PERMISSION_ID =
        keccak256("SWAP_TOKENS_PERMISSION");

    /// @notice The ID of the permission required to withdraw coins.
    bytes32 public constant WITHDRAW_PERMISSION_ID =
        keccak256("WITHDRAW_PERMISSION");

    ISwapRouter public swapRouter;
    uint24 public constant poolFee = 3000;

    /// @notice Initializes the component.
    /// @dev This method is required to support [ERC-1822](https://eips.ethereum.org/EIPS/eip-1822).
    /// @param _dao The IDAO interface of the associated DAO.
    /// @param _uniswapRouterAddress Uniswap router address
    function initialize(
        IDAO _dao,
        address _uniswapRouterAddress
    ) external initializer {
        __PluginUUPSUpgradeable_init(_dao);
        swapRouter = ISwapRouter(_uniswapRouterAddress);
    }

    function swapTokens(
        address _tokenIn,
        uint256 _amountIn,
        address _tokenOut,
        address _vaultGroupAddress
    ) external auth(SWAP_TOKENS_PERMISSION_ID) {
        ERC20(_tokenIn).approve(address(swapRouter), _amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: poolFee,
                recipient: _vaultGroupAddress,
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        swapRouter.exactInputSingle(params);
    }

    function withdrawFromTreasury(
        address _token,
        uint256 _amount
    ) external auth(WITHDRAW_PERMISSION_ID) {
        IDAO.Action[] memory actions = new IDAO.Action[](2);

        actions[0] = IDAO.Action({
            to: _token,
            value: 0 ether,
            data: abi.encodeWithSelector(
                bytes4(keccak256("approve(address,uint256)")),
                address(this),
                _amount
            )
        });

        actions[1] = IDAO.Action({
            to: _token,
            value: 0 ether,
            data: abi.encodeWithSelector(
                bytes4(keccak256("transfer(address,uint256)")),
                address(this),
                _amount
            )
        });

        dao().execute({_callId: "", _actions: actions, _allowFailureMap: 0});
    }

    /// @dev This empty reserved space is put in place to allow future versions to add new
    /// variables without shifting down storage in the inheritance chain.
    /// https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
    uint256[50] private __gap;
}
