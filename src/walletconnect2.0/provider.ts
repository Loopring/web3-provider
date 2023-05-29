import Web3 from "web3";
import { walletServices } from "../walletServices";
import { AvaiableNetwork, ConnectProviders, ErrorType, RPC_URLS } from '../command';
import { ConnectProvides } from '../providers';
import UniversalProvider from '@walletconnect/universal-provider';
import EthereumProvider from "@walletconnect/ethereum-provider"
import { ProviderChainId } from '@walletconnect/ethereum-provider/dist/types/types';

const POLLING_INTERVAL = 12000;
const DEFAULT_BRIDGE = "wss://bridge.walletconnect.org"
const methods = [
  "eth_accounts",
  "eth_chainId",
  "eth_call",
  "eth_getBalance",
  "eth_ecRecover",
  "eth_signTypedData_v4",
  "eth_signTransaction",
  "eth_sendTransaction",
  "eth_sendRawTransaction",
  "eth_signTypedData",
  "personal_sign",
  "personal_ecRecover",
  "eth_sign",
];
const events = ["chainChanged", "accountsChanged", "message", "disconnect", "connect"];

export const WalletConnectV2Provide = async (props: {
  chainId: ProviderChainId;
  account?: string;
  darkMode?: boolean;
}): Promise<{ provider?: UniversalProvider | EthereumProvider; web3?: Web3 } | undefined> => {
  // let provider:any|UniversalProvider
  try {
    const web3Modal = ConnectProvides.getWeb3Modal();
    web3Modal.setTheme({themeMode: !(props?.darkMode) ? 'light' : 'dark',})
    console.log('WALLET_CONNECT_PING:', process.env[ `${ConnectProvides.APP_FRAMEWORK}WALLET_CONNECT_PING` ])
    const BRIDGE_URL = (await fetch(process.env[ `${ConnectProvides.APP_FRAMEWORK}WALLET_CONNECT_PING` ] ?? '')
      .then(({status}) => {
        return status === 200
          ? process.env[ `${ConnectProvides.APP_FRAMEWORK}WALLET_CONNECT_WSS_BRIDGE` ]
          : DEFAULT_BRIDGE;
      })
      .catch(() => {
        return DEFAULT_BRIDGE;
      })) ?? DEFAULT_BRIDGE;
    const clientMeta = {
      description: 'Loopring Layer 2',
      url: "htts://loopring.io",
      icons: ["https://static.loopring.io/assets/svg/loopring.svg"],
      name: "Loopring",
    };


    const provider = await EthereumProvider.init({
      chains: [Number(props.chainId ?? 1)],
      optionalChains: AvaiableNetwork.map(item => Number(item)),
      projectId: process.env[ `${ConnectProvides.APP_FRAMEWORK}WALLET_CONNECT_V2_ID` ] ?? "",
      showQrModal: true, // REQUIRED set to "true" to use @web3modal/standalone,
      rpcMap: RPC_URLS,
      // relayUrl: BRIDGE_URL,
      methods, // OPTIONAL ethereum methods
      events,
      metadata: clientMeta, // OPTIONAL metadata of your app
      // @ts-ignore
      qrModalOptions: {
        themeMode: !(props?.darkMode) ? 'light' : 'dark'
      },
    });

    // const connector = provider;
    let web3: Web3 | undefined;

    if (!provider.connected && props?.account !== undefined) {
      throw new Error("walletConnect not connect");
    } else if ((!provider.session && props?.account === undefined) || props?.account) {
    } else {
      console.log(
        "WalletConnect disconnect then connected is failed",
      );
      await provider.disconnect()
    }
    await provider.enable();
    web3 = new Web3(provider as any);
    walletServices.sendConnect(web3, provider);
    return {provider, web3};
  } catch (error) {
    console.log("error happen at connect wallet with WalletConnect:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.WalletConnect,
      error: (error as any)?.message,
    });
  }
};