// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.17;

import {PluginCloneable, IDAO} from "@aragon/osx/core/plugin/PluginCloneable.sol";
import {GroupVotingList} from "./GroupVotingList.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

contract GroupFactoryPlugin is PluginCloneable {
    using Counters for Counters.Counter;
    /// Permission IDs
    bytes32 public constant ADMIN_EXECUTE_PERMISSION_ID =
        keccak256("ADMIN_EXECUTE_PERMISSION");
    bytes32 public constant CREATE_GROUP_PERMISSION_ID =
        keccak256("CREATE_GROUP_PERMISSION");

    /// Other fields
    Counters.Counter public _groupIdCounter;
    mapping(uint256 => string) public groupsNames;
    mapping(uint256 => GroupVotingList) public groups;

    /// Events
    event GroupCreated(address indexed groupAddress, uint256 groupID);

    /// @notice Initializes the contract.
    /// @param _dao The associated DAO.
    function initialize(IDAO _dao) external initializer {
        __PluginCloneable_init(_dao);
    }

    function createGroup(
        string memory _groupName,
        address[] memory _members
    ) external auth(CREATE_GROUP_PERMISSION_ID) {
        uint256 groupId = _groupIdCounter.current();
        _groupIdCounter.increment();

        GroupVotingList group = new GroupVotingList(_members,_groupName); 
        groupsNames[groupId] = _groupName; 
        groups[groupId] = group;

        emit GroupCreated(address(group), groupId);
    }

    /// Executes actions in the associated DAO. --> should be the create group function
    // maybe this function 'execute' should be implemented to execute the creation of group
    // function execute(IDAO.Action[] calldata _actions) external auth(ADMIN_EXECUTE_PERMISSION_ID) {
    //    dao().execute({_callId: 0x0, _actions: _actions, _allowFailureMap: 0});
    // }
}
