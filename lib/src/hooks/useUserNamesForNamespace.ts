import type { CertificateData } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import {
  findMintMetadataId,
  getBatchedMultipleAccounts,
} from '@cardinal/common'
import { findNamespaceId } from '@cardinal/namespaces'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import type { Connection } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import type { Identity } from '../common/Identities'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { accountDataById } from '../utils/accounts'
import { tryPublicKey } from '../utils/format'
import { tracer, withTrace } from '../utils/trace'

export type UserTokenData = {
  tokenAccount?: AccountData<ParsedTokenAccountData>
  metaplexData?: AccountData<metaplex.Metadata>
  tokenManager?: AccountData<TokenManagerData>
  certificate?: AccountData<CertificateData> | null
  identity: Identity
}

export const identityFromMetaplexData = (
  metaplexData: AccountData<metaplex.Metadata> | undefined,
  identities: (Identity & { namespaceId: string })[]
): (Identity & { namespaceId: string }) | undefined => {
  return identities.find(
    ({ namespaceId, name }) =>
      metaplexData?.parsed?.data?.creators?.some(
        (creator) =>
          namespaceId === creator.address.toString() && creator.verified
      ) ||
      (metaplexData?.parsed?.data?.symbol.replace(/\0/g, '') === 'NAME' &&
        metaplexData?.parsed?.data?.name.replace(/\0/g, '').includes(name))
  )
}

export type ParsedTokenAccountData = {
  isNative: boolean
  delegate: string
  mint: string
  owner: string
  state: 'initialized' | 'frozen'
  tokenAmount: {
    amount: string
    decimals: number
    uiAmount: number
    uiAmountString: string
  }
}

export const useUserNamesForNamespace = (
  connection: Connection,
  walletId: PublicKey | undefined
) => {
  const { identities } = useWalletIdentity()
  return useQuery<UserTokenData[]>(
    [
      'useUserNamesForNamespace',
      walletId?.toString(),
      identities.map((i) => i.name),
    ],
    async () => {
      if (!walletId) return []
      const trace = tracer({ name: 'useUserNamesForNamespace' })

      const identityWithIds: (Identity & { namespaceId: string })[] =
        await Promise.all(
          identities.map(async (i) => ({
            ...i,
            namespaceId: findNamespaceId(i.name).toString(),
          }))
        )

      const allTokenAccounts = await withTrace(
        () =>
          connection.getParsedTokenAccountsByOwner(new PublicKey(walletId), {
            programId: TOKEN_PROGRAM_ID,
          }),
        trace,
        { op: 'getParsedTokenAccountsByOwner' }
      )
      let tokenAccounts = allTokenAccounts.value
        .filter(
          (tokenAccount) =>
            tokenAccount.account.data.parsed.info.tokenAmount.uiAmount > 0
        )
        .sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()))
        .map((tokenAccount) => ({
          pubkey: tokenAccount.pubkey,
          parsed: tokenAccount.account.data.parsed
            .info as ParsedTokenAccountData,
        }))

      // lookup metaplex data
      const metaplexIds = tokenAccounts.map((tokenAccount) =>
        findMintMetadataId(new PublicKey(tokenAccount.parsed.mint))
      )

      const metaplexAccountInfos = await withTrace(
        () => getBatchedMultipleAccounts(connection, metaplexIds),
        trace,
        { op: 'getMetaplexAccountInfos' }
      )
      const metaplexData = metaplexAccountInfos.reduce(
        (acc, accountInfo, i) => {
          try {
            if (accountInfo) {
              acc[tokenAccounts[i]!.pubkey.toString()] = {
                pubkey: metaplexIds[i]!,
                ...accountInfo,
                parsed: metaplex.Metadata.deserialize(accountInfo.data)[0],
              }
            }
          } catch (e) {}
          return acc
        },
        {} as {
          [tokenAccountId: string]: {
            pubkey: PublicKey
            parsed: metaplex.Metadata
          }
        }
      )

      // filter by creators
      tokenAccounts = tokenAccounts.filter((tokenAccount) =>
        identityFromMetaplexData(
          metaplexData[tokenAccount.pubkey.toString()],
          identityWithIds
        )
      )

      // lookup delegates
      const delegateIds = tokenAccounts.map((tokenAccount) =>
        tryPublicKey(tokenAccount.parsed.delegate)
      )
      const accountsById = await withTrace(
        () => accountDataById(connection, delegateIds),
        trace,
        { op: 'getDelegates' }
      )

      return tokenAccounts.map((tokenAccount) => {
        const delegateData = accountsById[tokenAccount.parsed.delegate]

        let tokenManagerData: AccountData<TokenManagerData> | undefined
        let certificateData: AccountData<CertificateData> | undefined
        if (delegateData?.type === 'tokenManager') {
          tokenManagerData = delegateData as AccountData<TokenManagerData>
        } else if (delegateData?.type === 'certificate') {
          certificateData = delegateData as AccountData<CertificateData>
        }
        return {
          tokenAccount,
          metaplexData: metaplexData[tokenAccount.pubkey.toString()],
          tokenManager: tokenManagerData,
          certificate: certificateData,
          identity: identityFromMetaplexData(
            metaplexData[tokenAccount.pubkey.toString()],
            identityWithIds
          )!,
        }
      })
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  )
}
