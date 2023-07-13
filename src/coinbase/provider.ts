import Web3 from "web3";
import { walletServices } from "../walletServices";
import {
  ConnectProviders,
  ErrorType,
  onChainChange,
  RPC_URLS
} from "../command";
import CoinbaseWalletSDK, {
  CoinbaseWalletProvider
} from "@coinbase/wallet-sdk";

const APP_NAME = "Loopring App";
const APP_LOGO_URL = `${"https://static.loopring.io/assets/"}/logo.png`;

export const CoinbaseProvide = async (_props: {
  darkMode?: boolean;
  chainId: number | string;
}): Promise<{ provider: CoinbaseWalletProvider; web3: Web3 } | undefined> => {
  try {
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
      overrideIsCoinbaseWallet: false,
      overrideIsMetaMask: false,
      darkMode: _props?.darkMode
      // supportedChainIds: [1, 5],
    });
    const provider: CoinbaseWalletProvider = coinbaseWallet.makeWeb3Provider(
      RPC_URLS[1]
    );
    await provider.request({ method: "eth_requestAccounts" });
    try {
      if (
        !(
          Number(_props.chainId) &&
          Number(window.ethereum.chainId) &&
          Number(_props.chainId) === Number(window.ethereum.chainId)
        )
      ) {
        await onChainChange(provider, _props.chainId);
      }
    } catch (error) {
      console.log("wallet switch Ethereum Chain is not allowed");
      walletServices.sendError(ErrorType.FailedConnect, {
        connectName: ConnectProviders.Coinbase,
        error: {
          code: 700202,
          message: (error as any).message
        }
      });
    }
    const web3 = new Web3(provider as any);
    walletServices.sendConnect(web3, provider);
    return { provider, web3 };
  } catch (error) {
    console.error("Error happen at connect wallet with Coinbase:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.Coinbase,
      error: {
        code:
          (error as any)?.message ===
          `Global ethereum is not Coinbase, Please disable other Wallet Plugin`
            ? 700002
            : (error as any)?.code ?? 700003,
        message: (error as any)?.message
      }
    });
  }
};
// export const CoinbaseSubscribe = (provider: any, web3: Web3) => {
//   if (provider) {
//     provider.on("accountsChanged", (accounts: Array<string>) => {
//       if (accounts.length) {
//         walletServices.sendConnect(web3, provider);
//       } else {
//         walletServices.sendDisconnect(-1, "disconnect for no account");
//       }
//     });
//     provider.on("chainChanged", (chainId: number) => {
//       walletServices.sendConnect(web3, provider);
//     });
//     provider.on("disconnect", (code: number, reason: string) => {
//       walletServices.sendDisconnect(code, reason);
//     });
//   }
// };
//
// export const CoinbaseUnsubscribe = async (provider: any) => {
//   if (provider && typeof provider.removeAllListeners === "function") {
//     // provider.removeAllListeners('accountsChanged');
//     // provider.removeAllListeners('chainChanged');
//     // provider.removeAllListeners('disconnect');
//     await provider.removeAllListeners();
//   }
// };
