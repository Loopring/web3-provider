import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { ConnectProviders, ErrorType } from "../command";
import { IsMobile } from "../utilities";
import { IpcProvider } from "web3-core";

export const MetaMaskProvide = async (
  _props?: any
): Promise<{ provider: IpcProvider; web3: Web3 } | undefined> => {
  try {
    if (!window.ethereum?.isMetaMask && !IsMobile.any()) {
      throw new Error(
        `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
      );
    }
    let provider: any = await detectEthereumProvider({
      mustBeMetaMask: !IsMobile.any(),
    });
    const ethereum: any = window.ethereum;

    if (!IsMobile.any() && provider?.providerMap) {
      provider = provider?.providerMap?.get('MetaMask') ?? provider;
    }

    if (provider && ethereum) {
      const web3 = new Web3(provider as any);
      provider.send
      await (provider ?? ethereum).request({method: "eth_requestAccounts"});
      walletServices.sendConnect(web3, provider);
      // @ts-ignore
      return {provider, web3};
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
            : 700003,
        message: (error as any)?.message,
      },
    });
  }
};
