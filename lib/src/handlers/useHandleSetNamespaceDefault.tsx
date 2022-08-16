import { tryPublicKey } from '@cardinal/common'
import {
  withSetGlobalReverseEntry,
  withSetNamespaceReverseEntry,
} from '@cardinal/namespaces'
import type { Wallet } from '@saberhq/solana-contrib'
import type { Connection, PublicKey } from '@solana/web3.js'
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { useMutation, useQueryClient } from 'react-query'

import { Alert } from '../common/Alert'
import { TransactionLink } from '../common/TransactionLink'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import type { UserTokenData } from '../hooks/useUserNamesForNamespace'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'
import { handleError } from '../utils/errors'
import { nameFromToken } from '../utils/nameUtils'
import { tracer, withTrace } from '../utils/trace'
import { handleMigrate } from './handleMigrate'

export const useHandleSetNamespaceDefault = (
  connection: Connection,
  wallet: Wallet
) => {
  const { cluster, setMessage } = useWalletIdentity()
  const queryClient = useQueryClient()
  const globalReverseEntry = useGlobalReverseEntry(
    connection,
    wallet?.publicKey
  )

  return useMutation(
    async ({
      tokenData,
    }: {
      tokenData?: Pick<
        UserTokenData,
        'certificate' | 'tokenManager' | 'metaplexData' | 'identity'
      >
    }): Promise<{ txid: string; namespaceName: string } | undefined> => {
      if (!tokenData) return undefined
      let newMintId: PublicKey | undefined
      let transactions: Transaction[] = []
      const entryMint = tryPublicKey(tokenData.metaplexData?.parsed.mint)
      if (!entryMint) return undefined
      const [entryName, namespaceName] = nameFromToken(tokenData)
      const trace = tracer({ name: 'useGlobalReverseEntry' })
      if (tokenData.certificate) {
        console.log('Type certificate, migrating ...')
        const response = await withTrace(
          () => handleMigrate(wallet, entryName, namespaceName, cluster),
          trace,
          { op: 'handleMigrate' }
        )
        newMintId = response?.mintId
        transactions = response?.transactions || []
        console.log('Added migration instruction')
      }

      const transaction = new Transaction()
      await withTrace(
        () =>
          withSetNamespaceReverseEntry(
            transaction,
            connection,
            wallet,
            namespaceName,
            entryName,
            newMintId || entryMint
          ),
        trace,
        { op: 'withSetNamespaceReverseEntry' }
      )

      if (
        globalReverseEntry.data &&
        globalReverseEntry.data.parsed.namespaceName === namespaceName
      ) {
        await withTrace(
          () =>
            withSetGlobalReverseEntry(transaction, connection, wallet, {
              namespaceName: namespaceName,
              entryName: entryName,
              mintId: newMintId || entryMint,
            }),
          trace,
          { op: 'withSetGlobalReverseEntry' }
        )
      }
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash('max')
      ).blockhash
      transactions.push(transaction)

      const txid = ''
      await wallet.signAllTransactions(transactions)
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i]!
        let txid = ''
        try {
          const id = await withTrace(
            () =>
              sendAndConfirmRawTransaction(connection, tx.serialize(), {
                skipPreflight: true,
              }),
            trace,
            { op: `sendTransaction ${i}/${transactions.length}` }
          )
          if (i === transactions.length - 1) {
            txid = id
          }
        } catch (e) {
          const errorMessage = handleError(e, `${e}`)
          throw new Error(errorMessage)
        }
      }
      trace?.finish()
      return { txid, namespaceName }
    },
    {
      onSuccess: (result) => {
        result &&
          setMessage(
            <Alert
              type="success"
              message={
                <div className="flex w-full flex-col text-center">
                  <div>
                    Succesfully set handle as default {result.namespaceName}{' '}
                    identity.
                  </div>
                  <div>
                    Changes will be reflected{' '}
                    <TransactionLink txid={result.txid} />
                  </div>
                </div>
              }
            />
          )
        queryClient.invalidateQueries()
      },
      onError: () => {
        setMessage(
          <Alert
            type="error"
            message={
              <div className="flex w-full flex-col text-center">
                Failed to set namespace default
              </div>
            }
          />
        )
      },
    }
  )
}
