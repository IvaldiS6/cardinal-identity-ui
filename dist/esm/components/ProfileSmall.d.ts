import type { Connection, PublicKey } from '@solana/web3.js';
export declare const ProfileSmall: ({ connection, address, dark, onClick, placeholder, }: {
    /** Solana RPC Connection to load this profile  */
    connection: Connection;
    /** Address for which this profile is for */
    address: PublicKey | undefined;
    /** Boolean for whether this should load dark or light loading bars */
    dark?: boolean | undefined;
    /** onClick handler for clicking this profile */
    onClick?: (() => void) | undefined;
    /** Placeholder for showing while the avatar is loading */
    placeholder?: React.ReactNode;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ProfileSmall.d.ts.map