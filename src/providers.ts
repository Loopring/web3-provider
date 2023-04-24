import { MetaMaskProvide } from "./metamask";
import { CoinbaseProvide } from "./coinbase";
import { GameStop } from "./gmeWallet";

import { IpcProvider } from "web3-core";
import Web3 from "web3";
import { CoinbaseWalletProvider } from "@coinbase/wallet-sdk";
import {
  AvaiableNetwork,
  ConnectProviders,
  ExtensionSubscribe,
  ExtensionUnsubscribe,
  WalletConnectSubscribe,
  WalletConnectUnsubscribe
} from "./command";
import { Web3Provider } from "@ethersproject/providers";
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectV2Provide } from './walletconnect2.0';
import SignClient from '@walletconnect/sign-client';
import { Web3Modal } from '@web3modal/standalone';

export class ConnectProvides {
  private static _APP_FRAMEWORK: string = "REACT_APP_";
  public static _web3Modal:Web3Modal|undefined

  public static client:SignClient|undefined;
  public static getWeb3Modal() {
    if(!ConnectProvides._web3Modal){
      ConnectProvides._web3Modal = new Web3Modal({
        walletConnectVersion: 2,
        projectId: process.env[`${ConnectProvides.APP_FRAMEWORK}WALLET_CONNECT_V2_ID`]??"",
        standaloneChains: AvaiableNetwork.map(item => `eip155:${item}`),
        // themeMode: !(props?.darkMode) ? 'light' : 'dark',
        enableNetworkView: true,
        themeVariables:{
           "--w3m-z-index":1400,
         }
      });
    }
    return ConnectProvides._web3Modal
 }
  public static get APP_FRAMEWORK() {
    return ConnectProvides._APP_FRAMEWORK;
  }
  public static set APP_FRAMEWORK(vaule: string) {
    ConnectProvides._APP_FRAMEWORK = vaule;
  }

  private static _isMobile = false;
  public usedProvide:
    | undefined
    | Web3Provider
    | IpcProvider
    | UniversalProvider
    | CoinbaseWalletProvider;
  public usedWeb3: undefined | Web3;

  private _provideName: string | undefined;

  public static set IsMobile(isMobile: boolean) {
    ConnectProvides._isMobile = isMobile;
  }

  public static get IsMobile() {
    return ConnectProvides._isMobile;
  }

  get provideName(): string | undefined {
    return this._provideName;
  }

  // private provderObj:provider|undefined
  public MetaMask = async (props: { darkMode?: boolean }) => {
    this._provideName = ConnectProviders.MetaMask;
    this.clear();
    const obj = await MetaMaskProvide(props);
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public Coinbase = async (props: { darkMode?: boolean }) => {
    this._provideName = ConnectProviders.Coinbase;
    this.clear();
    const obj = await CoinbaseProvide(props);
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public GameStop = async (props: { darkMode?: boolean }) => {
    this._provideName = ConnectProviders.GameStop;
    this.clear();
    const obj = await GameStop(props);
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  // public WalletConnect = async (props?: {
  //   account?: string;
  //   darkMode?: boolean;
  // }) => {
  //   this._provideName = ConnectProviders.WalletConnect;
  //   this.clear();
  //   try {
  //     const obj = await WalletConnectProvide(props);
  //     if (obj) {
  //       this.usedProvide = obj.provider;
  //       this.usedWeb3 = obj.web3;
  //     }
  //     this.subScribe(props);
  //   } catch (e) {
  //     throw e;
  //   }
  // };
  public WalletConnect = async (props?: {
    account?: string;
    darkMode?: boolean;
  }) => {
    this._provideName = ConnectProviders.WalletConnect;
    this.clear();
    try {
      const obj = await WalletConnectV2Provide(props);
      if (obj) {
        this.usedProvide = obj.provider;
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

  private clearProviderSubscribe = async () => {
    try {
      // if (
      //   this.usedProvide &&
      //   typeof (this.usedProvide as WalletConnectProvider)?.connector
      //     ?.killSession === "function"
      // ) {
      //   await (
      //     this.usedProvide as WalletConnectProvider
      //   ).connector.killSession();
      // }
      if(this.usedProvide){
        await WalletConnectUnsubscribe(this.usedProvide);
        await ExtensionUnsubscribe(this.usedProvide);
      }
      this.usedProvide = undefined;
      this.usedWeb3 = undefined;
    } catch (error) {
      console.log("clearProviderSubscribe", error);
    }

    return;
  };

  private subScribe = (props?: { account?: string }) => {
    try {
      switch (this._provideName) {
        // case ConnectProviders.WalletConnectV2:
        case ConnectProviders.WalletConnect:
          WalletConnectSubscribe(
            this.usedProvide,
            this.usedWeb3 as Web3,
            props?.account
          );
          break;
        case ConnectProviders.MetaMask:
        case ConnectProviders.Coinbase:
        case ConnectProviders.GameStop:
          ExtensionSubscribe(this.usedProvide, this.usedWeb3 as Web3);
          break;
      }
    } catch (error) {
      console.log("subScribe", error);
    }
  };

}

export const connectProvides = new ConnectProvides();
