export const pluginRepoFactoryABI = [{ "inputs": [{ "internalType": "contract PluginRepoRegistry", "name": "_pluginRepoRegistry", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "string", "name": "_subdomain", "type": "string" }, { "internalType": "address", "name": "_initialOwner", "type": "address" }], "name": "createPluginRepo", "outputs": [{ "internalType": "contract PluginRepo", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_subdomain", "type": "string" }, { "internalType": "address", "name": "_pluginSetup", "type": "address" }, { "internalType": "address", "name": "_maintainer", "type": "address" }, { "internalType": "bytes", "name": "_releaseMetadata", "type": "bytes" }, { "internalType": "bytes", "name": "_buildMetadata", "type": "bytes" }], "name": "createPluginRepoWithFirstVersion", "outputs": [{ "internalType": "contract PluginRepo", "name": "pluginRepo", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "pluginRepoBase", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pluginRepoRegistry", "outputs": [{ "internalType": "contract PluginRepoRegistry", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
export const pluginSetupProcessorABI = [{ "inputs": [{ "internalType": "contract PluginRepoRegistry", "name": "_repoRegistry", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "address", "name": "plugin", "type": "address" }], "name": "IPluginNotSupported", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "currentAppliedSetupId", "type": "bytes32" }, { "internalType": "bytes32", "name": "appliedSetupId", "type": "bytes32" }], "name": "InvalidAppliedSetupId", "type": "error" }, { "inputs": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "currentVersionTag", "type": "tuple" }, { "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "newVersionTag", "type": "tuple" }], "name": "InvalidUpdateVersion", "type": "error" }, { "inputs": [], "name": "PluginAlreadyInstalled", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "plugin", "type": "address" }], "name": "PluginNonupgradeable", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "proxy", "type": "address" }, { "internalType": "address", "name": "implementation", "type": "address" }, { "internalType": "bytes", "name": "initData", "type": "bytes" }], "name": "PluginProxyUpgradeFailed", "type": "error" }, { "inputs": [], "name": "PluginRepoNonexistent", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }], "name": "SetupAlreadyPrepared", "type": "error" }, { "inputs": [{ "internalType": "address", "name": "dao", "type": "address" }, { "internalType": "address", "name": "caller", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "name": "SetupApplicationUnauthorized", "type": "error" }, { "inputs": [{ "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }], "name": "SetupNotApplicable", "type": "error" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "dao", "type": "address" }, { "indexed": true, "internalType": "address", "name": "plugin", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes32", "name": "appliedSetupId", "type": "bytes32" }], "name": "InstallationApplied", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "dao", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }, { "indexed": true, "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }, { "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "indexed": false, "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" }, { "indexed": false, "internalType": "address", "name": "plugin", "type": "address" }, { "components": [{ "internalType": "address[]", "name": "helpers", "type": "address[]" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "indexed": false, "internalType": "struct IPluginSetup.PreparedSetupData", "name": "preparedSetupData", "type": "tuple" }], "name": "InstallationPrepared", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "dao", "type": "address" }, { "indexed": true, "internalType": "address", "name": "plugin", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }], "name": "UninstallationApplied", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "dao", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }, { "indexed": true, "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }, { "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "indexed": false, "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "components": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "internalType": "address[]", "name": "currentHelpers", "type": "address[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "indexed": false, "internalType": "struct IPluginSetup.SetupPayload", "name": "setupPayload", "type": "tuple" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "indexed": false, "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "name": "UninstallationPrepared", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "dao", "type": "address" }, { "indexed": true, "internalType": "address", "name": "plugin", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }, { "indexed": false, "internalType": "bytes32", "name": "appliedSetupId", "type": "bytes32" }], "name": "UpdateApplied", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "dao", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }, { "indexed": true, "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }, { "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "indexed": false, "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "components": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "internalType": "address[]", "name": "currentHelpers", "type": "address[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "indexed": false, "internalType": "struct IPluginSetup.SetupPayload", "name": "setupPayload", "type": "tuple" }, { "components": [{ "internalType": "address[]", "name": "helpers", "type": "address[]" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "indexed": false, "internalType": "struct IPluginSetup.PreparedSetupData", "name": "preparedSetupData", "type": "tuple" }, { "indexed": false, "internalType": "bytes", "name": "initData", "type": "bytes" }], "name": "UpdatePrepared", "type": "event" }, { "inputs": [], "name": "APPLY_INSTALLATION_PERMISSION_ID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "APPLY_UNINSTALLATION_PERMISSION_ID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "APPLY_UPDATE_PERMISSION_ID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_dao", "type": "address" }, { "components": [{ "components": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }], "internalType": "struct PluginSetupRef", "name": "pluginSetupRef", "type": "tuple" }, { "internalType": "address", "name": "plugin", "type": "address" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }, { "internalType": "bytes32", "name": "helpersHash", "type": "bytes32" }], "internalType": "struct PluginSetupProcessor.ApplyInstallationParams", "name": "_params", "type": "tuple" }], "name": "applyInstallation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_dao", "type": "address" }, { "components": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "components": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }], "internalType": "struct PluginSetupRef", "name": "pluginSetupRef", "type": "tuple" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "internalType": "struct PluginSetupProcessor.ApplyUninstallationParams", "name": "_params", "type": "tuple" }], "name": "applyUninstallation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_dao", "type": "address" }, { "components": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "components": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }], "internalType": "struct PluginSetupRef", "name": "pluginSetupRef", "type": "tuple" }, { "internalType": "bytes", "name": "initData", "type": "bytes" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }, { "internalType": "bytes32", "name": "helpersHash", "type": "bytes32" }], "internalType": "struct PluginSetupProcessor.ApplyUpdateParams", "name": "_params", "type": "tuple" }], "name": "applyUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_dao", "type": "address" }, { "components": [{ "components": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }], "internalType": "struct PluginSetupRef", "name": "pluginSetupRef", "type": "tuple" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct PluginSetupProcessor.PrepareInstallationParams", "name": "_params", "type": "tuple" }], "name": "prepareInstallation", "outputs": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "components": [{ "internalType": "address[]", "name": "helpers", "type": "address[]" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "internalType": "struct IPluginSetup.PreparedSetupData", "name": "preparedSetupData", "type": "tuple" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_dao", "type": "address" }, { "components": [{ "components": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple" }, { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }], "internalType": "struct PluginSetupRef", "name": "pluginSetupRef", "type": "tuple" }, { "components": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "internalType": "address[]", "name": "currentHelpers", "type": "address[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct IPluginSetup.SetupPayload", "name": "setupPayload", "type": "tuple" }], "internalType": "struct PluginSetupProcessor.PrepareUninstallationParams", "name": "_params", "type": "tuple" }], "name": "prepareUninstallation", "outputs": [{ "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_dao", "type": "address" }, { "components": [{ "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "currentVersionTag", "type": "tuple" }, { "components": [{ "internalType": "uint8", "name": "release", "type": "uint8" }, { "internalType": "uint16", "name": "build", "type": "uint16" }], "internalType": "struct PluginRepo.Tag", "name": "newVersionTag", "type": "tuple" }, { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }, { "components": [{ "internalType": "address", "name": "plugin", "type": "address" }, { "internalType": "address[]", "name": "currentHelpers", "type": "address[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct IPluginSetup.SetupPayload", "name": "setupPayload", "type": "tuple" }], "internalType": "struct PluginSetupProcessor.PrepareUpdateParams", "name": "_params", "type": "tuple" }], "name": "prepareUpdate", "outputs": [{ "internalType": "bytes", "name": "initData", "type": "bytes" }, { "components": [{ "internalType": "address[]", "name": "helpers", "type": "address[]" }, { "components": [{ "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" }, { "internalType": "address", "name": "where", "type": "address" }, { "internalType": "address", "name": "who", "type": "address" }, { "internalType": "address", "name": "condition", "type": "address" }, { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }], "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]" }], "internalType": "struct IPluginSetup.PreparedSetupData", "name": "preparedSetupData", "type": "tuple" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "repoRegistry", "outputs": [{ "internalType": "contract PluginRepoRegistry", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "states", "outputs": [{ "internalType": "uint256", "name": "blockNumber", "type": "uint256" }, { "internalType": "bytes32", "name": "currentAppliedSetupId", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "pluginInstallationId", "type": "bytes32" }, { "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" }], "name": "validatePreparedSetupId", "outputs": [], "stateMutability": "view", "type": "function" }]
export const TOKEN_VOTING_PLUGIN_ABI = {
    "_format": "hh-sol-artifact-1",
    "contractName": "TokenVoting",
    "sourceName": "src/plugins/governance/majority-voting/token/TokenVoting.sol",
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "dao",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "where",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "who",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "permissionId",
            "type": "bytes32"
          }
        ],
        "name": "DaoUnauthorized",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint64",
            "name": "limit",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "actual",
            "type": "uint64"
          }
        ],
        "name": "DateOutOfBounds",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint64",
            "name": "limit",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "actual",
            "type": "uint64"
          }
        ],
        "name": "MinDurationOutOfBounds",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NoVotingPower",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ProposalCreationForbidden",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "ProposalExecutionForbidden",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "limit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "actual",
            "type": "uint256"
          }
        ],
        "name": "RatioOutOfBounds",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "voteOption",
            "type": "uint8"
          }
        ],
        "name": "VoteCastForbidden",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "previousAdmin",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "newAdmin",
            "type": "address"
          }
        ],
        "name": "AdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "beacon",
            "type": "address"
          }
        ],
        "name": "BeaconUpgraded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "version",
            "type": "uint8"
          }
        ],
        "name": "Initialized",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          }
        ],
        "name": "MembersAdded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address[]",
            "name": "members",
            "type": "address[]"
          }
        ],
        "name": "MembersRemoved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "definingContract",
            "type": "address"
          }
        ],
        "name": "MembershipContractAnnounced",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint64",
            "name": "startDate",
            "type": "uint64"
          },
          {
            "indexed": false,
            "internalType": "uint64",
            "name": "endDate",
            "type": "uint64"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "metadata",
            "type": "bytes"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
              }
            ],
            "indexed": false,
            "internalType": "struct IDAO.Action[]",
            "name": "actions",
            "type": "tuple[]"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "allowFailureMap",
            "type": "uint256"
          }
        ],
        "name": "ProposalCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "name": "ProposalExecuted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "implementation",
            "type": "address"
          }
        ],
        "name": "Upgraded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "voter",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "voteOption",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "votingPower",
            "type": "uint256"
          }
        ],
        "name": "VoteCast",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "enum MajorityVotingBase.VotingMode",
            "name": "votingMode",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "uint32",
            "name": "supportThreshold",
            "type": "uint32"
          },
          {
            "indexed": false,
            "internalType": "uint32",
            "name": "minParticipation",
            "type": "uint32"
          },
          {
            "indexed": false,
            "internalType": "uint64",
            "name": "minDuration",
            "type": "uint64"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "minProposerVotingPower",
            "type": "uint256"
          }
        ],
        "name": "VotingSettingsUpdated",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "UPDATE_VOTING_SETTINGS_PERMISSION_ID",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "UPGRADE_PLUGIN_PERMISSION_ID",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          }
        ],
        "name": "canExecute",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_voter",
            "type": "address"
          },
          {
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "_voteOption",
            "type": "uint8"
          }
        ],
        "name": "canVote",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "_metadata",
            "type": "bytes"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
              }
            ],
            "internalType": "struct IDAO.Action[]",
            "name": "_actions",
            "type": "tuple[]"
          },
          {
            "internalType": "uint256",
            "name": "_allowFailureMap",
            "type": "uint256"
          },
          {
            "internalType": "uint64",
            "name": "_startDate",
            "type": "uint64"
          },
          {
            "internalType": "uint64",
            "name": "_endDate",
            "type": "uint64"
          },
          {
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "_voteOption",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "_tryEarlyExecution",
            "type": "bool"
          }
        ],
        "name": "createProposal",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "dao",
        "outputs": [
          {
            "internalType": "contract IDAO",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          }
        ],
        "name": "execute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          }
        ],
        "name": "getProposal",
        "outputs": [
          {
            "internalType": "bool",
            "name": "open",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "executed",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "enum MajorityVotingBase.VotingMode",
                "name": "votingMode",
                "type": "uint8"
              },
              {
                "internalType": "uint32",
                "name": "supportThreshold",
                "type": "uint32"
              },
              {
                "internalType": "uint64",
                "name": "startDate",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "endDate",
                "type": "uint64"
              },
              {
                "internalType": "uint64",
                "name": "snapshotBlock",
                "type": "uint64"
              },
              {
                "internalType": "uint256",
                "name": "minVotingPower",
                "type": "uint256"
              }
            ],
            "internalType": "struct MajorityVotingBase.ProposalParameters",
            "name": "parameters",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "abstain",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "yes",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "no",
                "type": "uint256"
              }
            ],
            "internalType": "struct MajorityVotingBase.Tally",
            "name": "tally",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
              }
            ],
            "internalType": "struct IDAO.Action[]",
            "name": "actions",
            "type": "tuple[]"
          },
          {
            "internalType": "uint256",
            "name": "allowFailureMap",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_voter",
            "type": "address"
          }
        ],
        "name": "getVoteOption",
        "outputs": [
          {
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getVotingToken",
        "outputs": [
          {
            "internalType": "contract IVotesUpgradeable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "implementation",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "contract IDAO",
            "name": "_dao",
            "type": "address"
          },
          {
            "components": [
              {
                "internalType": "enum MajorityVotingBase.VotingMode",
                "name": "votingMode",
                "type": "uint8"
              },
              {
                "internalType": "uint32",
                "name": "supportThreshold",
                "type": "uint32"
              },
              {
                "internalType": "uint32",
                "name": "minParticipation",
                "type": "uint32"
              },
              {
                "internalType": "uint64",
                "name": "minDuration",
                "type": "uint64"
              },
              {
                "internalType": "uint256",
                "name": "minProposerVotingPower",
                "type": "uint256"
              }
            ],
            "internalType": "struct MajorityVotingBase.VotingSettings",
            "name": "_votingSettings",
            "type": "tuple"
          },
          {
            "internalType": "contract IVotesUpgradeable",
            "name": "_token",
            "type": "address"
          }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "isMember",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          }
        ],
        "name": "isMinParticipationReached",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          }
        ],
        "name": "isSupportThresholdReached",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          }
        ],
        "name": "isSupportThresholdReachedEarly",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "minDuration",
        "outputs": [
          {
            "internalType": "uint64",
            "name": "",
            "type": "uint64"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "minParticipation",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "minProposerVotingPower",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pluginType",
        "outputs": [
          {
            "internalType": "enum IPlugin.PluginType",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "proposalCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "proxiableUUID",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "supportThreshold",
        "outputs": [
          {
            "internalType": "uint32",
            "name": "",
            "type": "uint32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "_interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_blockNumber",
            "type": "uint256"
          }
        ],
        "name": "totalVotingPower",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "enum MajorityVotingBase.VotingMode",
                "name": "votingMode",
                "type": "uint8"
              },
              {
                "internalType": "uint32",
                "name": "supportThreshold",
                "type": "uint32"
              },
              {
                "internalType": "uint32",
                "name": "minParticipation",
                "type": "uint32"
              },
              {
                "internalType": "uint64",
                "name": "minDuration",
                "type": "uint64"
              },
              {
                "internalType": "uint256",
                "name": "minProposerVotingPower",
                "type": "uint256"
              }
            ],
            "internalType": "struct MajorityVotingBase.VotingSettings",
            "name": "_votingSettings",
            "type": "tuple"
          }
        ],
        "name": "updateVotingSettings",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newImplementation",
            "type": "address"
          }
        ],
        "name": "upgradeTo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newImplementation",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "upgradeToAndCall",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_proposalId",
            "type": "uint256"
          },
          {
            "internalType": "enum IMajorityVoting.VoteOption",
            "name": "_voteOption",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "_tryEarlyExecution",
            "type": "bool"
          }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "votingMode",
        "outputs": [
          {
            "internalType": "enum MajorityVotingBase.VotingMode",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "linkReferences": {},
    "deployedLinkReferences": {}
  }
  
  