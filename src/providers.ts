import { MetaMaskProvide } from "./metamask";
import { CoinbaseProvide } from "./coinbase";
import { GameStop } from "./gmeWallet";

import { IpcProvider } from "web3-core";
import Web3 from "web3";
import { CoinbaseWalletProvider } from "@coinbase/wallet-sdk";
import {
  ConnectProviders,
  ExtensionSubscribe,
  ExtensionUnsubscribe,
  onChainChange,
  WalletConnectSubscribe,
  WalletConnectUnsubscribe,
} from "./command";
import { Web3Provider } from "@ethersproject/providers";
import UniversalProvider, { Metadata } from "@walletconnect/universal-provider";
import { WalletConnectV2Provide } from "./walletconnect2.0";
import SignClient from "@walletconnect/sign-client";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { myLog } from "./utils";
import { IsMobile } from "./utilities";
import { WalletConnectProvide } from "./walletConnect/provider";
import { NameSpace } from "./interface";

export class ConnectProvides {
  public static client: SignClient | undefined;
  private static _isMobile = false;
  private static _CLIENT_META: Metadata = {
    description: "Loopring Layer 2",
    url: "https://loopring.io",
    icons: [
      "https://static.loopring.io/assets/images/logo192.png",
      "https://static.loopring.io/assets/svg/loopring.svg",
    ],
    name: "Loopring",
  };
  public usedProvide:
    | undefined
    | Web3Provider
    | IpcProvider
    | UniversalProvider
    | CoinbaseWalletProvider
    | EthereumProvider;
  public usedWeb3: undefined | Web3;
  private darkMode: boolean = false;

  private static _APP_FRAMEWORK: string = "REACT_APP_";

  public static get APP_FRAMEWORK() {
    return ConnectProvides._APP_FRAMEWORK;
  }

  public static set APP_FRAMEWORK(vaule: string) {
    ConnectProvides._APP_FRAMEWORK = vaule;
  }

  public static get walletConnectClientMeta() {
    return ConnectProvides._CLIENT_META;
  }

  public static set walletConnectClientMeta(props: Metadata) {
    ConnectProvides._CLIENT_META = props;
  }

  public static get IsMobile() {
    return ConnectProvides._isMobile;
  }

  public static set IsMobile(isMobile: boolean) {
    ConnectProvides._isMobile = isMobile;
  }

  private _provideName: string | undefined;

  get provideName(): string | undefined {
    return this._provideName;
  }

  // private provderObj:provider|undefined
  public MetaMask = async ({
    chainId = "1",
    ...props
  }: {
    darkMode?: boolean;
    chainId?: number | string;
  }) => {
    if (IsMobile.any() && window?.ethereum?.isLoopring) {
      this._provideName = ConnectProviders.Loopring;
    } else {
      this._provideName = ConnectProviders.MetaMask;
    }
    this.darkMode = props.darkMode ?? false;
    this.clear();
    const obj = await MetaMaskProvide({ chainId, ...props });
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public Coinbase = async ({
    chainId = "1",
    ...props
  }: {
    darkMode?: boolean;
    chainId?: number | string;
  }) => {
    this._provideName = ConnectProviders.Coinbase;
    this.darkMode = props.darkMode ?? false;
    this.clear();
    const obj = await CoinbaseProvide({ chainId, ...props });
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };
  public WalletConnectV1 = async (props?: {
    account?: string;
    darkMode?: boolean;
  }) => {
    this._provideName = ConnectProviders.WalletConnect;
    this.clear();
    try {
      const obj = await WalletConnectProvide(props);
      if (obj) {
        this.usedProvide = obj.provider as any;
        this.usedWeb3 = obj.web3;
      }
      this.subScribe(props);
    } catch (e) {
      throw e;
    }
  };

  public GameStop = async ({
    ...props
  }: {
    darkMode?: boolean;
    chainId?: number | string;
  }) => {
    this._provideName = ConnectProviders.GameStop;
    this.darkMode = props.darkMode ?? false;
    this.clear();
    const obj = await GameStop(props);
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public WalletConnect = async ({
    chainId = "1",
    ...props
  }: { darkMode?: boolean; chainId?: number | string } | any) => {
    this._provideName = ConnectProviders.WalletConnect;
    this.darkMode = props.darkMode ?? false;
    this.clear();
    try {
      const obj = await WalletConnectV2Provide({ chainId, ...props });
      if (obj) {
        this.usedProvide = obj.provider as any;
        this.usedWeb3 = obj.web3;
      }
      this.subScribe(props);
    } catch (e) {
      throw e;
    }
  };

  public clear = async () => {
    return await this.clearProviderSubscribe();
  };

  public sendChainIdChange = async (
    chainId: number | string,
    darkMode = this.darkMode
  ) => {
    if (this.usedProvide && this.usedWeb3) {
      switch (this.provideName) {
        case ConnectProviders.MetaMask:
        case ConnectProviders.GameStop:
        case ConnectProviders.Coinbase:
          await onChainChange(this.usedProvide, chainId);
          break;
        case ConnectProviders.WalletConnect:
          const optionalChains =
            (this.usedProvide as EthereumProvider)?.session?.namespaces[
              (this.usedProvide as any).namespace
              ]?.chains ?? [];
          myLog(
            "ConnectProviders.WalletConnect optionalChains",
            optionalChains
          );

          if (
            optionalChains?.length &&
            optionalChains.includes(
              `${(this.usedProvide as any).namespace}:${chainId}`
            )
          ) {
            await onChainChange(this.usedProvide, chainId);
          } else {
            this.clear();
            await (this.usedProvide as EthereumProvider).disconnect();
            this.WalletConnect({ chainId, darkMode: this.darkMode });
          }
      }
    }
  };

  private clearProviderSubscribe = async () => {
    try {
      if (this.usedProvide) {
        await WalletConnectUnsubscribe(
          this.usedProvide as UniversalProvider | EthereumProvider
        );
        await ExtensionUnsubscribe(this.usedProvide);
      }
      this.usedProvide = undefined;
      this.usedWeb3 = undefined;
    } catch (error) {
      myLog("clearProviderSubscribe", error);
    }

    return;
  };

  private subScribe = (props?: { account?: string }) => {
    try {
      switch (this._provideName) {
        case ConnectProviders.WalletConnect:
          WalletConnectSubscribe(
            this.usedProvide as UniversalProvider | EthereumProvider,
            this.usedWeb3 as Web3,
            props?.account
          );
          break;
        case ConnectProviders.Loopring:
        case ConnectProviders.MetaMask:
        case ConnectProviders.Coinbase:
        case ConnectProviders.GameStop:
          ExtensionSubscribe(this.usedProvide, this.usedWeb3 as Web3);
          break;
      }
    } catch (error) {
      myLog("subScribe", error);
    }
  };
}

export const connectProvides = new ConnectProvides();
