import Web3 from "web3";
import { walletServices } from "./walletServices";
import { connectProvides, ConnectProvides } from "./providers";
import UniversalProvider from '@walletconnect/universal-provider';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ProviderChainId } from '@walletconnect/ethereum-provider/dist/types/types';

export enum Commands {
  ConnectWallet = "ConnectWallet",
  DisConnect = "DisConnect",
  ChangeNetwork = "ChangeNetwork",
  Processing = "Processing",
  Error = "Error",
}

export enum ErrorType {
  FailedConnect = "FailedConnect",
}

export enum ProcessingType {
  waiting = "waiting",
  nextStep = "nextStep",
}

const onAccountChange = (accounts: Array<string>) => {
  if (accounts.length && connectProvides.usedWeb3) {
    walletServices.sendConnect(connectProvides.usedWeb3, connectProvides.usedProvide);
  } else {
    walletServices.sendDisconnect(-1, "disconnect for no account");
  }
}
const onChainChanged = (_chainId: number) => {
  if (connectProvides.usedWeb3) {
    walletServices.sendConnect(connectProvides.usedWeb3, connectProvides.usedProvide);
  }
}
const onDisconnect = (code: number, reason: string) => {
  walletServices.sendDisconnect(code, reason);
}
export const ExtensionSubscribe = (provider: any, web3: Web3) => {
  if (provider) {
    provider.on("accountsChanged", onAccountChange);
    provider.on("chainChanged", onChainChanged);
    provider.on("disconnect", onDisconnect);
  }
};

export const ExtensionUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    // provider.removeAllListeners('accountsChanged');
    // provider.removeAllListeners('chainChanged');
    // provider.removeAllListeners('disconnect');
    await provider.removeAllListeners();
    try {
      (provider?.close) ? provider?.close() : provider?.disable ? provider?.disable() : undefined;
    } catch (error) {
      throw error;
    }
  }
};

const _onAccountChange = async (_chainId: any) => {
  if (connectProvides.usedProvide && connectProvides.usedWeb3) {
    const accounts = await connectProvides.usedWeb3.eth.getAccounts();
    if (accounts.length && connectProvides.usedWeb3) {
      walletServices.sendConnect(connectProvides.usedWeb3, connectProvides.usedProvide);
    } else {
      walletServices.sendDisconnect(-1, "disconnect for no account");
    }
  } else {
    walletServices.sendDisconnect(-1, "disconnect for no account");
  }
}

export const WalletConnectSubscribe = (
  provider: EthereumProvider | UniversalProvider,
  web3: Web3,
  _account?: string
) => {
  if (provider) {
    provider.on("connect", _onAccountChange);
    provider.on("session_update", _onAccountChange)
    provider.on("chainChanged", _onAccountChange);
    provider.on("disconnect", onDisconnect);
  }
};

export const WalletConnectUnsubscribe = async (provider: EthereumProvider | UniversalProvider) => {
  if (provider) {
    // const {connector} = provider;
    console.log("WalletConnect on Unsubscribe");
    provider.off("connect", _onAccountChange);
    provider.off("session_update", _onAccountChange)
    provider.off("chainChanged", _onAccountChange);
    provider.off("disconnect", onDisconnect);
    return;
  }
};

export enum ConnectProviders {
  Unknown = "Unknown",
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
  // WalletConnectV2 = "WalletConnectV2",
  Coinbase = "Coinbase",
  GameStop = "GameStop",
}

export enum ConnectProvidersSignMap {
  Unknown = "Unknown",
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
  Coinbase = "OtherExtension",
  GameStop = "GameStop",
}

export let _RPC_URLS: { [ chainId: number ]: string } = {
  1: process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_URL_1` ] as string,
  5: process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_URL_5` ] as string,
};
if (process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_URL_OTHERS` ]) {
  const ids = process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_URL_OTHERS` ]?.split(',') ?? []
  ids.forEach((item) => {
    _RPC_URLS[ Number(item) ] = process.env[ `${ConnectProvides.APP_FRAMEWORK}RPC_URL_${item}` ] as string;
  })
}

export const RPC_URLS = _RPC_URLS
export const AvaiableNetwork = Object.keys(RPC_URLS);

