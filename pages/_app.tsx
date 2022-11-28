import './styles.css'
import 'tailwindcss/tailwind.css'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  BackpackWalletAdapter,
  BraveWalletAdapter,
  CoinbaseWalletAdapter,
  FractalWalletAdapter,
  GlowWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { ToastContainer } from 'common/Notification'
import { WalletIdentityProvider } from 'lib/src'
import type { IdentityName } from 'lib/src/common/Identities'
import { IDENTITIES } from 'lib/src/common/Identities'
import type { AppProps } from 'next/app'
import {
  EnvironmentProvider,
  getInitialProps,
} from 'providers/EnvironmentProvider'
import { useMemo } from 'react'

require('@solana/wallet-adapter-react-ui/styles.css')

const App = ({
  Component,
  pageProps,
  identityName,
  cluster,
}: AppProps & { cluster: string; identityName: IdentityName }) => {
  const network = useMemo(() => {
    switch (cluster) {
      case 'mainnet':
        return WalletAdapterNetwork.Mainnet
      case 'devnet':
        return WalletAdapterNetwork.Devnet
      case 'testnet':
        return WalletAdapterNetwork.Testnet
      default:
        return WalletAdapterNetwork.Mainnet
    }
  }, [cluster])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new CoinbaseWalletAdapter(),
      new BraveWalletAdapter(),
      new SlopeWalletAdapter(),
      new FractalWalletAdapter(),
      new GlowWalletAdapter({ network }),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter({ params: { network, showTorusButton: false } }),
    ],
    [network]
  )

  const identities = useMemo(
    () => (identityName ? [IDENTITIES[identityName]] : undefined),
    [identityName]
  )
  return (
    <EnvironmentProvider defaultCluster={cluster}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletIdentityProvider identities={identities}>
          <WalletModalProvider>
            <>
              <ToastContainer />
              <Component {...pageProps} />
            </>
          </WalletModalProvider>
        </WalletIdentityProvider>
      </WalletProvider>
    </EnvironmentProvider>
  )
}

App.getInitialProps = getInitialProps

export default App
