// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import {Addresslist} from "@aragon/osx/plugins/utils/Addresslist.sol";

/// @title GroupVotingList
/// @notice Creates an addresslist for eacg group
/// @dev This contract inherits from `Addresslist`
contract GroupVotingList is Addresslist {
    //TODO maybe change name to bytes to save gas
    string public name;

    constructor(address[] memory _newAddresses, string memory _name) {
        name = _name;
        _addMembers(_newAddresses);
    }

    function _addMembers(address[] memory _newAddresses) internal {
        bytes memory data = abi.encodeWithSelector(
            this.addAddresses.selector,
            _newAddresses
        );
        (bool success, ) = address(this).call(data);
        require(success, "Failed to call addAddresses from the constructor");
    }

    function addAddresses(address[] calldata _newAddresses) public {
        _addAddresses(_newAddresses);
    }

    function removeAddresses(address[] calldata _exitingAddresses) public {
        _removeAddresses(_exitingAddresses);
    }
}
