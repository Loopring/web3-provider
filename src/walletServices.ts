import Web3 from "web3";
import {
  AvaiableNetwork,
  Commands,
  ErrorType,
  ProcessingType
} from "./command";

const { Subject } = require("rxjs");

//TODO typeof account State
const subject = new Subject();

export const walletServices = {
  subject,
  sendProcess: async (type: keyof typeof ProcessingType, props?: any) => {
    subject.next({
      status: Commands.Processing,
      data: { type: type, opts: props }
    });
  },
  sendError: async (errorType: keyof typeof ErrorType, errorObj: any) => {
    subject.next({
      status: Commands.Error,
      data: { type: errorType, opts: errorObj }
    });
  },

  sendConnect: async (
    web3: Web3,
    provider: any,
    accounts?: string[],
    chainId?: number
  ) => {
    try {
      // let accounts, chainId: number;
      //@ts-ignore
      if (accounts && chainId) {
      } else {
        accounts = provider.accounts ?? (await web3.eth.getAccounts());
        chainId = await web3.eth.getChainId();
      }
      subject.next({
        status: "ConnectWallet",
        data: {
          provider,
          accounts,
          chainId:
            AvaiableNetwork.findIndex(i => Number(i) == Number(chainId)) !== -1
              ? Number(chainId)
              : "unknown"
        }
      });
    } catch (error) {
      subject.next({ status: "Error", data: { error } });
    }
  },
  sendDisconnect: async (code: any, reason: any) => {
    subject.next({
      status: "DisConnect",
      data: { reason: reason, code: code }
    });
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable()
};
