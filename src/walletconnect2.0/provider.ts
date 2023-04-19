import Web3 from "web3";
import { walletServices } from "../walletServices";
import { Web3Modal } from '@web3modal/standalone';
import { AvaiableNetwork, ErrorType, RPC_URLS } from '../command';
import { ConnectProvides } from '../providers';
import UniversalProvider from '@walletconnect/universal-provider';

const POLLING_INTERVAL = 12000;
const DEFAULT_BRIDGE = "https://bridge.walletconnect.org"
const WALLET_CONNECT_20_ID = "e9f9b27388f7d9bdb5f9a9ee81a5ab8d";

export const WalletConnectV2Provide = async (props?: {
  account?: string;
  darkMode?: boolean;
}): Promise<{ provider?: UniversalProvider; web3?: Web3 } | undefined> => {
  // let provider:any|UniversalProvider
  try {
    console.log('WALLET_CONNECT_PING:', process.env[ `${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING` ])

    const BRIDGE_URL = (await fetch(process.env[ `${ConnectProvides.APP_FRAMeWORK}WALLET_CONNECT_PING` ] ?? '')
      .then(({status}) => {
        return status === 200
          ? process.env[ `${ConnectProvides.APP_FRAMeWORK}CONNECT_WSS_BRIDGE` ]
          : DEFAULT_BRIDGE;
      })
      .catch(() => {
        return DEFAULT_BRIDGE;
      })) ?? DEFAULT_BRIDGE
    console.log('WALLET_CONNECT_BRIDGE:', process.env[ `${ConnectProvides.APP_FRAMeWORK}CONNECT_WSS_BRIDGE` ])

    // const { uri, approval } = await  signClient.connect({ requiredNamespaces: namespaces })

    const web3Modal = new Web3Modal({
      walletConnectVersion: 2,
      projectId: WALLET_CONNECT_20_ID,
      standaloneChains: ["eip155:1", "eip155:5"],
      themeMode: !(props?.darkMode) ? 'light' : 'dark',
      enableNetworkView: true
    });
    const clientMeta =  {
      
      description: 'Loopring Layer 2',
      url: "htts://loopring.io",
      icons: ["https://static.loopring.io/assets/svg/loopring.svg"],
      name: "Loopring",
    }
    // const provider = await EthereumProvider.init({
    //   chains: AvaiableNetwork.map(item => Number(item)),//`eip155:${item}`),
    //   projectId: WALLET_CONNECT_20_ID,
    //   showQrModal:true, // REQUIRED set to "true" to use @web3modal/standalone,
    //   rpcMap:RPC_URLS,
    //   // relayUrl: BRIDGE_URL,
    //   methods:[
    //     JSONRPCMethod.eth_accounts,
    //     JSONRPCMethod.eth_chainId,
    //     'eth_getBalance',
    //     'eth_call',
    //     JSONRPCMethod.eth_ecRecover,
    //     JSONRPCMethod.eth_signTypedData_v4,
    //     JSONRPCMethod.eth_signTransaction,
    //     JSONRPCMethod.eth_sendTransaction,
    //     JSONRPCMethod.eth_sendRawTransaction,
    //     JSONRPCMethod.eth_signTypedData,
    //     JSONRPCMethod.personal_sign,
    //     JSONRPCMethod.eth_sign,
    //   ], // OPTIONAL ethereum methods
    //   events: [...REQUIRED_EVENTS,...OPTIONAL_EVENTS],
    //   metadata:clientMeta // OPTIONAL metadata of your app
    // })

    // const {connector} = provider;

    const provider = await  UniversalProvider.init({
      projectId: WALLET_CONNECT_20_ID,
      relayUrl: BRIDGE_URL,
      metadata:clientMeta, // OPTIONAL metadata of your app
      // chains:[1,5], // REQUIRED chain ids
      // showQrModal:true, // REQUIRED set to "true" to use @web3modal/standalone,
      // methods, // OPTIONAL ethereum methods
      // events, // OPTIONAL ethereum events
      // rpcMap, // OPTIONAL rpc urls for each chain

      // qrModalOptions // OPTIONAL - `undefined` by default, see https://docs.walletconnect.com/2.0/web3modal/options
    });
    await provider.connect({
      namespaces: {
        eip155: {
          defaultChain:'1',
          chains: AvaiableNetwork.map(item => `eip155:${item}`),
          methods:[
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
            "eth_sign",
          ],
          events: ["chainChanged", "accountsChanged","message", "disconnect", "connect"],
          rpcMap:RPC_URLS,
        },
        // pairingTopic: "<123...topic>", // optional topic to connect to
        // skipPairing: false, // optional to skip pairing ( later it can be resumed by invoking .pair())
      },
    });

    // const provider = new ethers.providers.Web3Provider(_provider);
    let web3: Web3 | undefined;
    await provider.enable();
    web3 = new Web3(provider as any);
    walletServices.sendConnect(web3, provider);

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

