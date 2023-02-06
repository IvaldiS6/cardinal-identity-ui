import { getNameEntry } from '@cardinal/namespaces'
import type { Wallet } from '@project-serum/anchor/dist/cjs/provider'
import type { Connection } from '@solana/web3.js'
import { BiGlobe } from 'react-icons/bi'

import { Alert } from '../common/Alert'
import { ButtonLight } from '../common/Button'
import type { Identity } from '../common/Identities'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { Tooltip } from '../common/Tooltip'
import { useHandleSetGlobalDefault } from '../handlers/useHandleSetGlobalDefault'
import { useGlobalReverseEntry } from '../hooks/useGlobalReverseEntry'
import { useNamespaceReverseEntries } from '../hooks/useNamespaceReverseEntries'
import { useWalletIdentity } from '../providers/WalletIdentityProvider'

export interface Props {
  connection: Connection
  wallet: Wallet
  identity: Identity
}
export const SetDefaultButton = ({ connection, wallet, identity }: Props) => {
  const { setMessage } = useWalletIdentity()
  const namespaceReverseEntries = useNamespaceReverseEntries(
    connection,
    wallet.publicKey
  )
  const globalReverseEntry = useGlobalReverseEntry(connection, wallet.publicKey)
  const handleSetGlobalDefault = useHandleSetGlobalDefault(connection, wallet)

  if (globalReverseEntry.data?.parsed.namespaceName === identity.name)
    return <></>
  return (
    <Tooltip title={`Set ${identity.displayName} as your default identity`}>
      <ButtonLight
        onClick={async () => {
          const foundReverseEntry = namespaceReverseEntries.data?.find(
            (tk) => tk.parsed.namespaceName === identity.name
          )
          if (!foundReverseEntry) {
            setMessage(
              <Alert
                type="error"
                message={
                  'You must set a default handle for the identity before setting it global'
                }
              />
            )
            return
          } else {
            setMessage(undefined)
            const nameEntry = await getNameEntry(
              connection,
              identity.name,
              foundReverseEntry.parsed.entryName
            )
            handleSetGlobalDefault.mutate({
              entryName: foundReverseEntry.parsed.entryName,
              namespaceName: identity.name,
              mint: nameEntry.parsed.mint,
            })
          }
        }}
        className="flex flex-row items-center gap-1"
      >
        {handleSetGlobalDefault.isLoading ? (
          <LoadingSpinner height="12px" fill="#000" />
        ) : (
          <>
            <BiGlobe className="text-[12px]" /> Set Default
          </>
        )}
      </ButtonLight>
    </Tooltip>
  )
}
