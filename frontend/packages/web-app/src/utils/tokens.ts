/* eslint-disable no-empty */
import {erc20TokenABI} from 'abis/erc20TokenABI';
import {TokenWithMetadata} from './types';
import {constants, ethers, providers as EthersProviders} from 'ethers';

import {formatUnits} from 'utils/library';
import {NativeTokenData, TimeFilter, TOKEN_AMOUNT_REGEX} from './constants';
import {add} from 'date-fns';
import {TokenType, Transfer, TransferType} from '@aragon/sdk-client';

/**
 * This method sorts a list of array information. It is applicable to any field
 * of the information object that can be compared using '<', '>'.
 *
 * @param tokens List of token (basic) token information
 * @param criteria Field of the information object that determines the sort order.
 * @param reverse reverses the order in which the token are sorted. Note that in
 * either cases, any objects with undefined fields will moved to the end of the
 * array.
 *
 * @example sortTokens(baseTokenInfos[], 'name');
 * @example sortTokens(baseTokenInfos[], 'count');
 */
export function sortTokens<T>(tokens: T[], criteria: keyof T, reverse = false) {
  function sorter(a: T, b: T) {
    // ensure that undefined fields are placed last.
    if (!a[criteria]) return 1;
    if (!b[criteria]) return -1;

    if (a[criteria] < b[criteria]) {
      return reverse ? 1 : -1;
    }
    if (a[criteria] > b[criteria]) {
      return reverse ? -1 : 1;
    }
    return 0;
  }

  tokens.sort(sorter);
}

/**
 * This method filters a list of array information. It searches the searchTerm
 * in the tokens name, symbol and address.
 *
 * @param tokens List of (basic) token information
 * @param searchTerm Term to search for in information
 * @returns Filtered list of (basic) token information that contains search
 * term.
 */
export function filterTokens(tokens: TokenWithMetadata[], searchTerm: string) {
  function tokenInfoMatches(token: TokenWithMetadata, term: string) {
    const lowercaseTerm = term.toLocaleLowerCase();
    const lowercaseSymbol = token.metadata.symbol.toLocaleLowerCase();
    const lowercaseAddress = token.metadata.id.toLocaleLowerCase();
    const lowercaseName = token.metadata.name.toLocaleLowerCase();
    return (
      lowercaseSymbol.indexOf(lowercaseTerm) >= 0 ||
      lowercaseName.indexOf(lowercaseTerm) >= 0 ||
      lowercaseAddress.indexOf(lowercaseTerm) >= 0
    );
  }

  if (!searchTerm) return tokens;

  return tokens.filter(t => tokenInfoMatches(t, searchTerm));
}

/**
 * This Validation function prevents sending broken
 * addresses that may cause subgraph crash
 *
 * @param address Wallet Address
 * @param provider Eth provider
 * @returns boolean determines whether it is erc20 compatible or not
 */

export async function isERC20Token(
  address: string,
  provider: EthersProviders.Provider
) {
  const contract = new ethers.Contract(address, erc20TokenABI, provider);
  try {
    await Promise.all([contract.balanceOf(address), contract.totalSupply()]);
    return true;
  } catch (err) {
    return false;
  }
}
/**
 * This Function is necessary because
 * you can't fetch decimals from the api
 *
 * @param address token contract address
 * @param provider Eth provider
 * @param nativeTokenData Information about the current native token
 * @returns number for decimals for each token
 */
export async function getTokenInfo(
  address: string,
  provider: EthersProviders.Provider,
  nativeTokenData: NativeTokenData
) {
  let decimals = null,
    symbol = null,
    name = null,
    totalSupply = null;

  if (isNativeToken(address)) {
    return {
      name: nativeTokenData.name,
      symbol: nativeTokenData.symbol,
      decimals: nativeTokenData.decimals,
      totalSupply,
    };
  }
  const contract = new ethers.Contract(address, erc20TokenABI, provider);

  try {
    const values = await Promise.all([
      contract.decimals(),
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
    ]);

    decimals = values[0];
    name = values[1];
    symbol = values[2];
    totalSupply = values[3];
  } catch (error) {
    console.error('Error, getting token info from contract');
  }

  return {
    decimals,
    name,
    symbol,
    totalSupply,
  };
}

/**
 * @param tokenAddress address of token contract
 * @param ownerAddress owner address / wallet address
 * @param provider interface to node
 * @param shouldFormat whether value is returned in human readable format
 * @returns a promise that will return a balance amount
 */
export const fetchBalance = async (
  tokenAddress: string,
  ownerAddress: string,
  provider: EthersProviders.Provider,
  nativeCurrency: NativeTokenData,
  shouldFormat = true
) => {
  const contract = new ethers.Contract(tokenAddress, erc20TokenABI, provider);
  const balance = await contract.balanceOf(ownerAddress);

  if (shouldFormat) {
    const {decimals} = await getTokenInfo(
      tokenAddress,
      provider,
      nativeCurrency
    );
    return formatUnits(balance, decimals);
  }
  return balance;
};

/**
 * Check if token is the chain native token; the distinction is made
 * especially in terms of whether the contract address
 * is that of an ERC20 token
 * @param tokenAddress address of token contract
 * @returns whether token is Ether
 */
export const isNativeToken = (tokenAddress: string) => {
  return tokenAddress === constants.AddressZero;
};

/**
 * Helper-method formats a string of token amount.
 *
 * The method expects the string representation of an integer or decimal number.
 * The string must contain only digits, except for the decimal dot and an option
 * token symbol separated from the number by a whitespace. E.g.
 *
 * - '111' ok
 * - '111.1' ok
 * - '111.1 SYM' ok
 * - '1'111'111.1 SYM' not ok.
 *
 * The output, in general, is engineering notation (scientific notation wher the
 * exponent is divisible by 3 and the coefficient is between in [1,999]). For
 * numbers up to a trillon, the power is replaced by the letters k (10^3), M
 * (10^6) and G (10^9).
 *
 * Decimals are ignored for any number >= 10 k. Below that, rounding to 2
 * decimals is applied if necessary.
 *
 * @param amount [string] token amount. May include token symbol.
 * @returns [string] abbreviated token amount. Any decimal digits get discarded. For
 * thousands, millions and billions letters are used. E.g. 10'123'456.78 SYM becomes 10M.
 * Everything greater gets expressed as power of tens.
 */
export function abbreviateTokenAmount(amount: string): string {
  if (!amount) return 'N/A';

  const regexp_res = amount.match(TOKEN_AMOUNT_REGEX);
  // discard failed matches
  if (regexp_res?.length !== 4 || regexp_res[0].length !== amount.length)
    return 'N/A';

  // retrieve capturing groups
  const integers = regexp_res[1];
  const decimals = regexp_res[2];
  const symbol = regexp_res[3];

  if (integers?.length > 4) {
    const integerNumber = Number.parseInt(integers);
    const magnitude = Math.floor((integers.length - 1) / 3);
    const lead = Math.floor(integerNumber / Math.pow(10, magnitude * 3));
    const magnitude_letter = ['k', 'M', 'G'];

    return `${lead}${
      magnitude < 4
        ? magnitude_letter[magnitude - 1]
        : '*10^' + Math.floor(magnitude) * 3
    }${symbol && ' ' + symbol}`;
  }

  if (decimals) {
    const fraction = '0.' + decimals;
    const fractionNumber = Number.parseFloat(fraction);
    const intNumber = Number.parseInt(integers);
    const totalNumber = intNumber + fractionNumber;

    if (totalNumber < 0.01) {
      return ` < 0.01${symbol && ' ' + symbol}`;
    }

    return `${totalNumber.toFixed(2)}${symbol && ' ' + symbol}`;
  }

  return `${Number.parseInt(integers)}${symbol && ' ' + symbol}`;
}

export function historicalTokenBalances(
  transfers: Transfer[],
  tokenBalances: TokenWithMetadata[],
  pastIntervalMins: number
) {
  const historicalBalances = {} as Record<string, TokenWithMetadata>;
  tokenBalances.forEach(
    bal => (historicalBalances[bal.metadata.id.toLowerCase()] = {...bal})
  );
  const nowMs = new Date().getTime();

  // transfers assumed in reverse date order. Reverses effect on balances of all transactions which
  // occurred in pastIntervalMins.
  for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    // a transfer without a creationDate is pending and so always included
    const transferTimeMs = transfers[i].creationDate?.getTime();
    if (transferTimeMs && nowMs - transferTimeMs > pastIntervalMins * 60000)
      break;

    const tokenId =
      transfer.tokenType === TokenType.ERC20
        ? transfer.token.address
        : constants.AddressZero;

    // reverse change to balance from transfer
    if (transfer.tokenType !== TokenType.ERC721) {
      // TODO Handle ERC721
      historicalBalances[tokenId.toLowerCase()].balance -=
        transfer.type === TransferType.DEPOSIT
          ? transfer.amount
          : -transfer.amount;
    }
  }

  return historicalBalances;
}

export function timeFilterToMinutes(tf: TimeFilter) {
  const now = new Date();
  switch (tf) {
    case TimeFilter.day:
      return 60 * 24;
    case TimeFilter.month: {
      const oneMonthAgo = add(now, {months: -1});
      return (now.getTime() - oneMonthAgo.getTime()) / 1000 / 60;
    }
    case TimeFilter.week:
      return 60 * 24 * 7;
    case TimeFilter.year: {
      const oneYearAgo = add(now, {years: -1});
      return (now.getTime() - oneYearAgo.getTime()) / 1000 / 60;
    }
  }
}
