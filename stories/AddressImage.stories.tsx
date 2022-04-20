import { Connection, PublicKey } from '@solana/web3.js'
import type { ComponentMeta, ComponentStory } from '@storybook/react'
import React from 'react'

import { AddressImage } from '../lib/components/AddressImage'
import { WalletIdentityProvider } from '../lib/providers/WalletIdentityProvider'
import { tryPublicKey } from '../lib/utils/format'

export default {
  title: 'Components/AddressImage',
  component: AddressImage,
  argTypes: {
    connection: {
      options: ['mainnet', 'devnet', 'testnet'],
      description: 'Solana RPC connection to fetch the mapping from',
      mapping: {
        mainnet: new Connection('https://api.mainnet-beta.solana.com'),
        devnet: new Connection('https://api.devnet.solana.com'),
        testnet: new Connection('https://api.testnet.solana.com'),
      },
      address: {
        control: 'text',
      },
    },
  },
} as ComponentMeta<typeof AddressImage>

const Template: ComponentStory<typeof AddressImage> = ({ ...args }) => {
  const publicKey = tryPublicKey(args.address)
  if (publicKey) {
    return (
      <WalletIdentityProvider>
        <AddressImage
          address={publicKey}
          connection={
            args.connection ||
            new Connection('https://api.mainnet-beta.solana.com')
          }
          style={args.style}
          height={args.height}
          width={args.width}
          dark={args.dark}
        />
      </WalletIdentityProvider>
    )
  }
  return <div>Invalid Public Key</div>
}

export const Primary = Template.bind({})
Primary.args = {
  address: new PublicKey('DNVVBNkdyv6tMentHdjVz5cpYmjQYcquLfYkz1fApT7Q'),
  connection: new Connection('https://api.mainnet-beta.solana.com'),
}
