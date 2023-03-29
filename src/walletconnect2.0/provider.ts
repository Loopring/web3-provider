import Web3 from "web3";
import { walletServices } from "../walletServices";
import WalletConnectProvider from '@walletconnect/ethereum-provider';

import { Web3Modal } from '@web3modal/standalone';
import { ConnectProviders, ErrorType, RPC_URLS } from '../command';
import { IsMobile } from '../utilities';
import { ConnectProvides } from '../providers';

const POLLING_INTERVAL = 12000;
const DEFAULT_BRIDGE = "https://bridge.walletconnect.org"
const WALLET_CONNECT_20_ID = "e9f9b27388f7d9bdb5f9a9ee81a5ab8d";
export const WalletConnectV2Provide = async (props?: {
  account?: string;
  darkMode?: boolean;
}): Promise<{ provider?: WalletConnectProvider; web3?: Web3 } | undefined> => {
  // let provider:any|undefined;
  try {
    console.log('WALLET_CONNECT_PING:', process.env[ `${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING` ])
    const BRIDGE_URL = (await fetch(process.env[ `${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING` ] ?? '')
      .then(({status}) => {
        return status === 200
          ? process.env[ `${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_BRIDGE` ]
          : DEFAULT_BRIDGE;
      })
      .catch(() => {
        return DEFAULT_BRIDGE;
      })) ?? DEFAULT_BRIDGE
    console.log('WALLET_CONNECT_BRIDGE:', process.env[ `${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_BRIDGE` ])

    // const { uri, approval } = await  signClient.connect({ requiredNamespaces: namespaces })

    const web3Modal = new Web3Modal({
      projectId: WALLET_CONNECT_20_ID,
      standaloneChains: ["eip155:1", "eip155:5"],
      themeMode: !(props?.darkMode) ? 'light' : 'dark',
      themeColor: 'blue',
      themeBackground: 'gradient',
      enableNetworkView: true,
    });
    const provider = new WalletConnectProvider({
      rpc: RPC_URLS,
      bridge: BRIDGE_URL,
      chainId: 1,
      // @ts-ignore
      // qrcodeModal: web3Modal,
      qrcode: !!IsMobile.any(),
      clientMeta: {
        description: 'Loopring Layer 2',
        url: "htts://loopring.io",
        icons: ["https://static.loopring.io/assets/svg/loopring.svg"],
        name: "LRC",
      }

    })
    const {connector} = provider;
    // qrcodeModal:web3Modal,
    // provider.s
    let web3: Web3 | undefined;

    if (!provider.connected && props?.account === undefined) {
      await connector.createSession();
      const uri = connector.uri;

      // EthereumClient
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
      } else {
        walletServices.sendProcess("nextStep", {qrCodeUrl: uri});
      }
      await web3Modal.openModal({uri})
      await provider.enable();
      web3 = new Web3(provider as any);
      walletServices.sendConnect(web3, provider);
    } else if (!connector.connected && props?.account !== undefined) {
      console.log(
        "WalletConnectV2 reconnect connected is failed",
        props.account,
        provider
      );
      throw new Error("WalletConnectV2 not connect");
    } else if (props?.account && provider.isWalletConnect) {
      console.log(
        "WalletConnectV2 reconnect connected is true",
        props.account,
        provider,
        connector.session
      );
      await provider.enable();
      web3 = new Web3(provider as any);
      walletServices.sendConnect(web3, provider);
    }
    return {provider, web3};

  } catch (error) {
    console.log("error happen at connect wallet with WalletConnectV2:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: 'WalletConnectV2',//ConnectProviders.WalletConnectV2,
      error: (error as any)?.message,
    });
  }
};

// export const WalletConnectVwSubscribe = (
//   provider: any,
//   web3: Web3,
//   _account?: string
// ) => {
//   const { connector } = provider;
//   if (provider && connector && connector.connected) {
//     connector.on("connect", (error: Error | null, payload: any | null) => {
//       if (error) {
//         walletServices.sendError(ErrorType.FailedConnect, {
//           connectName: ConnectProviders.WalletConnectV2,
//           error,
//         });
//       }
//       const { accounts, chainId } = payload.params[0];
//       connector.approveSession({ accounts, chainId });
//       //
//       // // const _accounts = await web3.eth.getAccounts();
//       // console.log('accounts:', accounts)
//       walletServices.sendConnect(web3, provider);
//     });
//     connector.on(
//       "session_update",
//       (error: Error | null, payload: any | null) => {
//         const { accounts, chainId } = payload.params[0];
//         if (error) {
//           walletServices.sendError(ErrorType.FailedConnect, {
//             connectName: ConnectProviders.WalletConnectV2,
//             error,
//           });
//         }
//         connector.updateSession({ accounts, chainId });
//         walletServices.sendConnect(web3, provider);
//       }
//     );
//     connector.on("disconnect", (error: Error | null, payload: any | null) => {
//       const { message } = payload.params[0];
//       if (error) {
//         walletServices.sendError(ErrorType.FailedConnect, {
//           connectName: ConnectProviders.WalletConnectV2,
//           error,
//         });
//       }
//       walletServices.sendDisconnect("", message);
//       console.log("WalletConnectV2 on disconnect");
//     });
//   }
// };
//
// export const WalletConnectUnsubscribe = async (provider: any) => {
//   if (provider && provider.connector) {
//     const { connector } = provider;
//     console.log("WalletConnectV2 on Unsubscribe");
//     connector.off("disconnect");
//     connector.off("connect");
//     connector.off("session_update");
//     return;
//   }
// };

