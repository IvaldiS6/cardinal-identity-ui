import type { AccountData, EntryData } from "@cardinal/namespaces";
import * as namespaces from "@cardinal/namespaces";
import type { Wallet } from "@saberhq/solana-contrib";
import * as web3 from "@solana/web3.js";
export declare function apiBase(dev?: boolean): string;
export declare function tryGetNameEntry(connection: web3.Connection, namespaceName: string, entryName: string): Promise<AccountData<EntryData> | null>;
export declare function revokeAndClaim(cluster: string, connection: web3.Connection, wallet: Wallet, namespaceName: string, entryName: string, duration: number | null, reverseEntryId: web3.PublicKey, claimRequestId: web3.PublicKey, certificateMintId: web3.PublicKey, certificateOwnerId: web3.PublicKey): Promise<string>;
export declare function setReverseEntry(connection: web3.Connection, wallet: Wallet, namespaceName: string, entryName: string, certificateMintId: web3.PublicKey): Promise<string>;
export declare function initAndClaimEntry(cluster: string, connection: web3.Connection, wallet: Wallet, namespaceName: string, entryName: string, duration: number | null): Promise<string>;
export declare function claimEntry(connection: web3.Connection, wallet: Wallet, namespaceName: string, entryName: string, certificateMintId: web3.PublicKey, duration: number | null): Promise<string>;
export declare function setEntryData(connection: web3.Connection, wallet: Wallet, namespaceName: string, entryName: string, entryData: string): Promise<string>;
export declare function approveClaimRequest(connection: web3.Connection, wallet: Wallet, namespaceName: string, claimRequestId: web3.PublicKey): Promise<string>;
export declare function getPendingClaimRequests(connection: web3.Connection): Promise<AccountData<namespaces.ClaimRequestData>[]>;
export declare function createClaimRequest(connection: web3.Connection, wallet: Wallet, namespaceName: string, entryName: string): Promise<string>;
export declare function wrapSol(connection: web3.Connection, wallet: Wallet, lamports: number): Promise<string>;
export declare function createSyncNativeInstruction(nativeAccount: web3.PublicKey): web3.TransactionInstruction;
//# sourceMappingURL=api.d.ts.map