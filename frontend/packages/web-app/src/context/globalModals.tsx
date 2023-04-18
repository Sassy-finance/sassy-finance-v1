import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';

const GlobalModalsContext = createContext<GlobalModalsContextType | null>(null);

type GlobalModalsContextType = {
  isTransferOpen: boolean;
  isTokenOpen: boolean;
  isUtcOpen: boolean;
  isSelectDaoOpen: boolean;
  isAddActionOpen: boolean;
  isAddressesOpen: boolean;
  isWalletOpen: boolean;
  isNetworkOpen: boolean;
  isMobileMenuOpen: boolean;
  isManageWalletOpen: boolean;
  isGatingOpen: boolean;
  isStrategyOpen: boolean;
  open: (arg?: MenuTypes) => void;
  close: (arg?: MenuTypes) => void;
};

export type MenuTypes =
  | 'token'
  | 'utc'
  | 'addAction'
  | 'selectDao'
  | 'default'
  | 'addresses'
  | 'wallet'
  | 'network'
  | 'mobileMenu'
  | 'network'
  | 'manageWallet'
  | 'gating'
  | 'strategy';

type Props = Record<'children', ReactNode>;

/* TODO This should be reworked to have one state that holds the open menu,
instead of one boolean state for each of the menus. This can be done based on a
type like MenuType. Then this context can be extended simply by adding a new
type to MenuTypes. */
const GlobalModalsProvider: React.FC<Props> = ({ children }) => {
  const [isTransferOpen, setIsTransferOpen] =
    useState<GlobalModalsContextType['isTransferOpen']>(false);
  const [isTokenOpen, setIsTokenOpen] =
    useState<GlobalModalsContextType['isTokenOpen']>(false);
  const [isUtcOpen, setIsUtcOpen] =
    useState<GlobalModalsContextType['isUtcOpen']>(false);
  const [isAddActionOpen, setIsAddActionOpen] =
    useState<GlobalModalsContextType['isAddActionOpen']>(false);
  const [isSelectDaoOpen, setIsSelectDaoOpen] =
    useState<GlobalModalsContextType['isSelectDaoOpen']>(false);
  const [isAddressesOpen, setAddressesOpen] =
    useState<GlobalModalsContextType['isAddressesOpen']>(false);
  const [isWalletOpen, setWalletOpen] =
    useState<GlobalModalsContextType['isWalletOpen']>(false);
  const [isNetworkOpen, setNetworkOpen] =
    useState<GlobalModalsContextType['isNetworkOpen']>(false);
  const [isMobileMenuOpen, setMobileMenuOpen] =
    useState<GlobalModalsContextType['isMobileMenuOpen']>(false);
  const [isManageWalletOpen, setManageWalletOpen] =
    useState<GlobalModalsContextType['isManageWalletOpen']>(false);
  const [isGatingOpen, setIsGatingOpen] =
    useState<GlobalModalsContextType['isGatingOpen']>(false);
  const [isStrategyOpen, setIsStrategyOpen] =
    useState<GlobalModalsContextType['isStrategyOpen']>(false);

  const open = (type?: MenuTypes) => {
    switch (type) {
      case 'token':
        setIsTokenOpen(true);
        break;
      case 'utc':
        setIsUtcOpen(true);
        break;
      case 'addAction':
        setIsAddActionOpen(true);
        break;
      case 'selectDao':
        setIsSelectDaoOpen(true);
        break;
      case 'addresses':
        setAddressesOpen(true);
        break;
      case 'wallet':
        setWalletOpen(true);
        break;
      case 'network':
        setNetworkOpen(true);
        break;
      case 'mobileMenu':
        setMobileMenuOpen(true);
        break;
      case 'manageWallet':
        setManageWalletOpen(true);
        break;
      case 'gating':
        setIsGatingOpen(true);
        break;
      case 'strategy':
        setIsStrategyOpen(true);
        break;
      default:
        setIsTransferOpen(true);
        break;
    }
  };

  const close = (type?: MenuTypes) => {
    switch (type) {
      case 'token':
        setIsTokenOpen(false);
        break;
      case 'utc':
        setIsUtcOpen(false);
        break;
      case 'addAction':
        setIsAddActionOpen(false);
        break;
      case 'selectDao':
        setIsSelectDaoOpen(false);
        break;
      case 'addresses':
        setAddressesOpen(false);
        break;
      case 'wallet':
        setWalletOpen(false);
        break;
      case 'network':
        setNetworkOpen(false);
        break;
      case 'mobileMenu':
        setMobileMenuOpen(false);
        break;
      case 'manageWallet':
        setManageWalletOpen(false);
        break;
      case 'gating':
        setIsGatingOpen(false);
        break;
      case 'strategy':
        setIsStrategyOpen(false);
        break;
      default:
        setIsTransferOpen(false);
        break;
    }
  };
  /**
   * TODO: ==============================================
   * I used this context for managing all modals but we should
   * categories the modal pages and organize it in a better way
   *====================================================
   */
  // Since the modals can not be open at the same time, I actually think this is
  // a good solution. Keeps the logic in one place and makes it simply to
  // extend. [VR 10-01-2022]

  const value = useMemo(
    (): GlobalModalsContextType => ({
      isTransferOpen,
      isTokenOpen,
      isUtcOpen,
      isAddActionOpen,
      isSelectDaoOpen,
      isAddressesOpen,
      isWalletOpen,
      isNetworkOpen,
      isMobileMenuOpen,
      isManageWalletOpen,
      isGatingOpen,
      isStrategyOpen,
      open,
      close,
    }),
    [
      isAddActionOpen,
      isAddressesOpen,
      isGatingOpen,
      isManageWalletOpen,
      isMobileMenuOpen,
      isNetworkOpen,
      isSelectDaoOpen,
      isTokenOpen,
      isTransferOpen,
      isStrategyOpen,
      isUtcOpen,
      isWalletOpen,
    ]
  );

  return (
    <GlobalModalsContext.Provider value={value}>
      {children}
    </GlobalModalsContext.Provider>
  );
};

function useGlobalModalContext(): GlobalModalsContextType {
  return useContext(GlobalModalsContext) as GlobalModalsContextType;
}

export { useGlobalModalContext, GlobalModalsProvider };
