import Web3 from "web3";
import { walletServices } from "../walletServices";
import {
  AvaiableNetwork,
  ConnectProviders,
  ErrorType,
  onChainChange,
  ProcessingStep,
  ProcessingType,
  RPC_URLS,
} from "../command";
import { ConnectProvides } from "../providers";
import UniversalProvider from "@walletconnect/universal-provider";
import EthereumProvider from "@walletconnect/ethereum-provider";

const methods = [
  "eth_sign",
  "personal_sign",
  "eth_signTypedData",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
  // "eth_accounts",
  // "eth_chainId",
  // "eth_call",
  // "eth_getBalance",
  // "eth_ecRecover",
  // "personal_ecRecover",
];
// "eth_signTransaction",
// "eth_sendRawTransaction",

const events = [
  "chainChanged",
  "accountsChanged",
  "message",
  "disconnect",
  "connect",
];
let ethereumProvider: any = undefined;

export const WalletConnectV2Provide = async (props: {
  chainId: number;
  account?: string;
  darkMode?: boolean;
}): Promise<
  { provider?: UniversalProvider | EthereumProvider; web3?: Web3 } | undefined
> => {
  try {
    if (ethereumProvider && ethereumProvider?.modal) {
      ethereumProvider.modal.setTheme({
        themeMode: !props?.darkMode ? "light" : "dark",
        themeVariables: {
          "--w3m-z-index": "9999",
        },
      });
      ethereumProvider.reset();
      ethereumProvider.setChainIds([
        ethereumProvider.formatChainId(Number(props.chainId ?? 1)),
      ]);
      ethereumProvider.rpc.chains = [
        ethereumProvider.formatChainId(Number(props.chainId ?? 1)),
      ];
    } else {
      ethereumProvider = await EthereumProvider.init({
        chains: [Number(props.chainId ?? 1)],
        optionalChains: AvaiableNetwork.map((item) => Number(item)),
        projectId:
          process.env[`${ConnectProvides.APP_FRAMEWORK}WALLET_CONNECT_V2_ID`] ??
          "",
        showQrModal: true, // REQUIRED set to "true" to use @web3modal/standalone,
        rpcMap: RPC_URLS,
        // relayUrl: BRIDGE_URL,
        methods, // OPTIONAL ethereum methods
        events,
        metadata: ConnectProvides.walletConnectClientMeta, // OPTIONAL metadata of your app
        // @ts-ignore
        qrModalOptions: {
          themeVariables: {
            "--wcm-z-index": "9999",
          },
          themeMode: !props?.darkMode ? "light" : "dark",
        },
      });
      ethereumProvider.on("display_uri", (display_uri: string) => {
        walletServices.sendProcess(ProcessingType.nextStep, {
          step: ProcessingStep.showQrcode,
          qrCodeUrl: display_uri,
        });
      });
      ethereumProvider.modal.subscribeModal();
    }

    // const connector = provider;
    let web3: Web3 | undefined;

    if (!ethereumProvider.connected && props?.account !== undefined) {
      throw new Error("walletConnect has Connect!");
    } else if (
      (!ethereumProvider.session && props?.account === undefined) ||
      props?.account
    ) {
      console.log("WalletConnect connect has session");
    } else {
      console.log("WalletConnect connect clear session");
      await ethereumProvider.disconnect();
    }

    await ethereumProvider.enable();
    if (props.chainId !== ethereumProvider.chainId) {
      await onChainChange(ethereumProvider, props.chainId);
    }
    web3 = new Web3(ethereumProvider as any);
    walletServices.sendConnect(web3, ethereumProvider);
    return { provider: ethereumProvider, web3 };
  } catch (error) {
    console.log("error happen at connect wallet with WalletConnect:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.WalletConnect,
      error: {
        code: /Connection request reset. Please try again/.test(
          (error as any)?.message ?? ""
        )
          ? 700201
          : (error as any)?.code ?? 700003,
        message: (error as any).message,
      },
    });
  }
};
