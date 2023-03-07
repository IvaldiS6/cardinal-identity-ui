import { withRevokeCertificateV2 } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import type { ReverseEntryData } from '@cardinal/namespaces'
import {
  withInvalidateExpiredNameEntry,
  withInvalidateExpiredReverseEntry,
} from '@cardinal/namespaces'
import * as namespaces from '@cardinal/namespaces'
import { withInvalidate } from '@cardinal/token-manager'
import type { Wallet } from '@project-serum/anchor/dist/cjs/provider'
import type { Connection } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { Alert } from '../common/Alert'
import { TransactionLink } from '../common/TransactionLink'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { formatIdentityLink } from '../utils/format'
import { nameFromToken } from '../utils/nameUtils'
import { tracer, withTrace } from '../utils/trace'

export const useHandleUnlink = (
  connection: Connection,
  wallet: Wallet,
  namespaceName: string,
  userTokenData: UserTokenData
) => {
  const { setMessage } = useWalletIdentity()
  const queryClient = useQueryClient()
  return useMutation(
    async ({
      globalReverseNameEntryData,
      namespaceReverseEntry,
    }: {
      globalReverseNameEntryData?: AccountData<ReverseEntryData>
      namespaceReverseEntry?: AccountData<ReverseEntryData>
    }): Promise<{
      txid?: string
      userTokenData?: UserTokenData
    }> => {
      const trace = tracer({ name: 'useHandleUnlink' })
      let transaction = await withTrace(
        () =>
          handleUnlink(connection, wallet, {
            namespaceName: namespaceName,
            userTokenData: userTokenData,
            globalReverseNameEntryData: globalReverseNameEntryData,
            namespaceReverseEntry: namespaceReverseEntry,
          }),
        trace,
        { op: 'handleUnlink' }
      )
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      transaction = await wallet.signTransaction(transaction)
      const txid = await withTrace(
        () =>
          sendAndConfirmRawTransaction(connection, transaction.serialize(), {}),
        trace,
        { op: 'sendTransaction' }
      )
      return {
        txid,
        userTokenData,
      }
    },
    {
      onSuccess: ({ txid, userTokenData }) => {
        queryClient.invalidateQueries()
        userTokenData &&
          txid &&
          setMessage(
            <Alert
              type="success"
              message={
                <div className="flex w-full flex-col text-center">
                  <div>
                    Succesfully unlinked{' '}
                    {formatIdentityLink(...nameFromToken(userTokenData))}.
                  </div>
                  <div>
                    Changes will be reflected <TransactionLink txid={txid} />
                  </div>
                </div>
              }
            />
          )
      },
      onError: (e) => {
        setMessage(
          <Alert
            type="error"
            message={
              <div className="flex w-full flex-col text-center">
                {handleError(e, `${e}`)}
              </div>
            }
          />
        )
      },
    }
  )
}

export async function handleUnlink(
  connection: Connection,
  wallet: Wallet,
  params: {
    namespaceName: string
    userTokenData: UserTokenData
    globalReverseNameEntryData?: AccountData<ReverseEntryData>
    namespaceReverseEntry?: AccountData<ReverseEntryData>
  }
): Promise<Transaction> {
  const namespaceId = namespaces.findNamespaceId(params.namespaceName)
  const transaction = new Transaction()
  const entryMint = params.userTokenData.metaplexData?.parsed.mint
  if (!entryMint) throw new Error('Failed to get mint')
  const [entryName] = nameFromToken(params.userTokenData)
  if (params.userTokenData.certificate) {
    console.log('Revoking certificate')
    await withRevokeCertificateV2(connection, wallet, transaction, {
      certificateMint: entryMint,
      revokeRecipient: namespaceId,
    })
  } else if (params.userTokenData.tokenManager) {
    console.log('Invalidating token manager')
    // invalidate token manager
    await withInvalidate(transaction, connection, wallet, entryMint)
  }
  if (params.namespaceReverseEntry) {
    console.log('Invalidating expired namespace reverse entry')
    await withInvalidateExpiredReverseEntry(transaction, connection, wallet, {
      namespaceName: params.namespaceName,
      mintId: entryMint,
      entryName: params.namespaceReverseEntry.parsed.entryName,
      reverseEntryId: params.namespaceReverseEntry.pubkey,
    })
  }
  if (params.globalReverseNameEntryData) {
    console.log('Invalidating expired global reverse entry')
    await withInvalidateExpiredReverseEntry(transaction, connection, wallet, {
      namespaceName: params.namespaceName,
      mintId: entryMint,
      entryName: params.globalReverseNameEntryData.parsed.entryName,
      reverseEntryId: params.globalReverseNameEntryData.pubkey,
    })
  }
  console.log('Invalidating expired name entry')
  await withInvalidateExpiredNameEntry(transaction, connection, wallet, {
    namespaceName: params.namespaceName,
    mintId: entryMint,
    entryName,
  })
  return transaction
}
