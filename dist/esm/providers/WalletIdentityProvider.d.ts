import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection } from "@solana/web3.js";
import React from "react";
export interface WalletIdentity {
    show: (wallet: Wallet, connection: Connection, cluster: string, dev?: boolean) => void;
    handle: string | undefined;
    showIdentityModal: boolean;
}
export declare const WalletIdentityContext: React.Context<WalletIdentity | null>;
interface Props {
    appName?: string;
    appTwitter?: string;
    children: React.ReactNode;
}
export declare const WalletIdentityProvider: React.FC<Props>;
export declare const useWalletIdentity: () => WalletIdentity;
export {};
//# sourceMappingURL=WalletIdentityProvider.d.ts.map