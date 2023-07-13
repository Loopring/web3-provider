import Web3 from "web3";
import { walletServices } from "./walletServices";
import { connectProvides, ConnectProvides } from "./providers";
import UniversalProvider from "@walletconnect/universal-provider";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";
import { myLog } from "./utils";

export enum Commands {
  ConnectWallet = "ConnectWallet",
  DisConnect = "DisConnect",
  ChangeNetwork = "ChangeNetwork",
  Processing = "Processing",
  Error = "Error"
}

export enum ErrorType {
  FailedConnect = "FailedConnect"
}

export enum ProcessingType {
  waiting = "waiting",
  nextStep = "nextStep"
}

export enum ProcessingStep {
  showQrcode
}

export const onChainChange = async (provider: any, chainId: any = 1) => {
  const chainIdHex = ethers.utils.hexValue(Number(chainId));
  myLog("chainIdHex", chainIdHex);
  try {
    await provider?.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: chainIdHex
        }
      ]
    });
  } catch (switchError) {
    if ((switchError as any)?.code === 4902) {
      try {
        const [chainName] = process.env[
          `${ConnectProvides.APP_FRAMEWORK}RPC_CHAINNAME_${chainId}`
        ]?.split("|") ?? ["unknown", ""];
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName,
              rpcUrls: [
                process.env[
                  `${ConnectProvides.APP_FRAMEWORK}RPC_URL_${chainId}`
                ]
              ] /* ... */
            }
          ]
        });
      } catch (addError) {
        throw addError;
      }
    } else {
      throw switchError;
    }
  }
};

const onAccountChange = (accounts: Array<string>) => {
  if (accounts.length && connectProvides.usedWeb3) {
    walletServices.sendConnect(
      connectProvides.usedWeb3,
      connectProvides.usedProvide
    );
  } else {
    walletServices.sendDisconnect(-1, "disconnect for no account");
  }
};
const onChainChanged = () => {
  if (connectProvides.usedWeb3) {
    walletServices.sendConnect(
      connectProvides.usedWeb3,
      connectProvides.usedProvide
    );
  }
};
const onDisconnect = ({ code, reason, message }: any) => {
  myLog("onDisconnect", message);
  if ([1013].includes(code) && /Disconnected from chain/gi.test(message)) {
    //do nothing
  } else {
    walletServices.sendDisconnect(code, reason);
  }
};
export const ExtensionSubscribe = (provider: any, web3: Web3) => {
  if (provider) {
    provider.on("accountsChanged", onAccountChange);
    provider.on("chainChanged", onChainChanged);
    provider.on("disconnect", onDisconnect);
  }
};

export const ExtensionUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    await provider.removeAllListeners();
    try {
      provider?.close
        ? provider?.close()
        : provider?.disable
        ? provider?.disable()
        : undefined;
    } catch (error) {
      throw error;
    }
  }
};

const _onAccountChange = async (props: any) => {
  if (connectProvides.usedProvide && connectProvides.usedWeb3) {
    const accounts = await connectProvides.usedWeb3.eth.getAccounts();
    const chainId = await connectProvides.usedWeb3.eth.getChainId();
    if (accounts.length && connectProvides.usedWeb3) {
      walletServices.sendConnect(
        connectProvides.usedWeb3,
        connectProvides.usedProvide,
        accounts,
        chainId
      );
    } else {
      walletServices.sendDisconnect(-1, "disconnect for no account");
    }
  } else {
    walletServices.sendDisconnect(-1, "disconnect for no account");
  }
};
const onMessage = async (props: any) => {
  myLog(props);
};

export const WalletConnectSubscribe = (
  provider: EthereumProvider | UniversalProvider,
  web3: Web3,
  _account?: string
) => {
  if (provider) {
    provider.on("connect", _onAccountChange);
    provider.on("session_update", _onAccountChange);
    provider.on("chainChanged", _onAccountChange);
    provider.on("session_delete", onDisconnect);
    provider.on("disconnect", onDisconnect);
    provider.on("message", onMessage);
  }
};

export const WalletConnectUnsubscribe = async (
  provider: EthereumProvider | UniversalProvider
) => {
  if (provider && typeof provider.off == "function") {
    // const {connector} = provider;
    myLog("WalletConnect on Unsubscribe");
    provider.off("connect", _onAccountChange);
    provider.off("session_update", _onAccountChange);
    provider.off("chainChanged", _onAccountChange);
    provider.off("disconnect", onDisconnect);
    provider.off("session_delete", onDisconnect);
    provider.off("message", onMessage);

    return;
  }
};

export enum ConnectProviders {
  Unknown = "Unknown",
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
  WalletConnectV1 = "WalletConnect",
  // WalletConnectV2 = "WalletConnectV2",
  Coinbase = "Coinbase",
  GameStop = "GameStop",
  Loopring = "Loopring"
}

export enum ConnectProvidersSignMap {
  Unknown = "Unknown",
  MetaMask = "MetaMask",
  WalletConnect = "WalletConnect",
  Coinbase = "OtherExtension",
  GameStop = "GameStop"
}

export let _RPC_URLS: { [chainId: number]: string } = {
  1: process.env[`${ConnectProvides.APP_FRAMEWORK}RPC_URL_1`] as string,
  5: process.env[`${ConnectProvides.APP_FRAMEWORK}RPC_URL_5`] as string
};
if (process.env[`${ConnectProvides.APP_FRAMEWORK}RPC_OTHERS`]) {
  const ids =
    process.env[`${ConnectProvides.APP_FRAMEWORK}RPC_OTHERS`]?.split(",") ?? [];
  ids.forEach(item => {
    _RPC_URLS[Number(item)] = process.env[
      `${ConnectProvides.APP_FRAMEWORK}RPC_URL_${item}`
    ] as string;
  });
}

export const RPC_URLS = _RPC_URLS;
export const AvaiableNetwork = Object.keys(RPC_URLS);
