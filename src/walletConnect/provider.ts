import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import {  ConnectProviders, ErrorType, RPC_URLS } from "../command";
import { IsMobile } from "../utilities";
import { ConnectProvides } from '../providers';
const POLLING_INTERVAL = 12000;
const DEFAULT_BRIDGE = "https://bridge.walletconnect.org"

export const WalletConnectProvide = async (props?: {
  account?: string;
  darkMode?: boolean;
}): Promise<{ provider?: WalletConnectProvider; web3?: Web3 } | undefined> => {
  try {
     console.log('WALLET_CONNECT_PING:',process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING`])
     const BRIDGE_URL = (await fetch(process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING`]??'')
        .then(({ status }) => {
          return status === 200
            ? process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_BRIDGE`]
            : DEFAULT_BRIDGE;
        })
        .catch(() => {
          return DEFAULT_BRIDGE;
        }))??DEFAULT_BRIDGE
    console.log('WALLET_CONNECT_BRIDGE:',process.env[`${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_BRIDGE`])

    // const BRIDGE_URL = "https://bridge.walletconnect.org";

    const provider: WalletConnectProvider = new WalletConnectProvider({
      rpc: RPC_URLS,
      bridge: BRIDGE_URL,
      pollingInterval: POLLING_INTERVAL,
      chainId:1,
      qrcode: !!IsMobile.any(),
    });
    const { connector } = provider;
    let web3: Web3 | undefined;

    if (!connector.connected && props?.account === undefined) {
      await connector.createSession();
      const uri = connector.uri;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
      } else {
        walletServices.sendProcess("nextStep", { qrCodeUrl: uri });
      }
      await provider.enable();
      web3 = new Web3(provider as any);
      walletServices.sendConnect(web3, provider);
    } else if (!connector.connected && props?.account !== undefined) {
      console.log(
        "WalletConnect reconnect connected is failed",
        props.account,
        provider
      );
      throw new Error("walletConnect not connect");
    } else if (props?.account && provider.isWalletConnect) {
      console.log(
        "WalletConnect reconnect connected is true",
        props.account,
        provider,
        connector.session
      );
      await provider.enable();
      web3 = new Web3(provider as any);
      walletServices.sendConnect(web3, provider);
    }
    return { provider, web3 };
  } catch (error) {
    console.log("error happen at connect wallet with WalletConnect:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.WalletConnect,
      error:( error as any)?.message,
    });
  }
};
