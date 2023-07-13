import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { ConnectProviders, ErrorType, onChainChange } from "../command";
import { IsMobile } from "../utilities";
import { Web3Provider } from "@ethersproject/providers";

export const MetaMaskProvide = async (_props: {
  darkMode?: boolean;
  chainId?: number | string;
}): Promise<{ provider: Web3Provider; web3: Web3 } | undefined> => {
  try {
    // @ts-ignore
    if (!window.ethereum?.isMetaMask && !IsMobile.any()) {
      throw {
        code: 700204,
        message: `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
      };
    }
    let provider: any = await detectEthereumProvider({
      mustBeMetaMask: !IsMobile.any()
    });
    const ethereum: any = window.ethereum;
    if (!IsMobile.any() && provider?.providerMap) {
      provider = provider?.providerMap?.get("MetaMask") ?? provider;
    }

    if (provider && ethereum) {
      const web3 = new Web3(provider as any);
      await (provider ?? ethereum).request({
        method: "eth_requestAccounts"
      });
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
          connectName: ConnectProviders.MetaMask,
          error: {
            code: 700202,
            message: (error as any).message
          }
        });
      }
      walletServices.sendConnect(web3, provider);
      // @ts-ignore
      return { provider, web3 };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(
      "Error happen at connect wallet with MetaMask:",
      (error as any)?.message
    );
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.MetaMask,
      error: {
        code:
          (error as any)?.message ===
          `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
            ? 700002
            : (error as any)?.code ?? 700003,
        message: (error as any)?.message
      }
    });
  }
};
