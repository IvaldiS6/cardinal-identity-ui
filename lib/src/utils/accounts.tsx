import type { CertificateData } from '@cardinal/certificates'
import { CERTIFICATE_IDL, CERTIFICATE_PROGRAM_ID } from '@cardinal/certificates'
import type { AccountData } from '@cardinal/common'
import {
  getBatchedMultipleAccounts,
  METADATA_PROGRAM_ID,
} from '@cardinal/common'
import type { PaidClaimApproverData } from '@cardinal/token-manager/dist/cjs/programs/claimApprover'
import {
  CLAIM_APPROVER_ADDRESS,
  CLAIM_APPROVER_IDL,
} from '@cardinal/token-manager/dist/cjs/programs/claimApprover'
import type { TimeInvalidatorData } from '@cardinal/token-manager/dist/cjs/programs/timeInvalidator'
import {
  TIME_INVALIDATOR_ADDRESS,
  TIME_INVALIDATOR_IDL,
} from '@cardinal/token-manager/dist/cjs/programs/timeInvalidator'
import type { TokenManagerData } from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import {
  TOKEN_MANAGER_ADDRESS,
  TOKEN_MANAGER_IDL,
} from '@cardinal/token-manager/dist/cjs/programs/tokenManager'
import type { UseInvalidatorData } from '@cardinal/token-manager/dist/cjs/programs/useInvalidator'
import {
  USE_INVALIDATOR_ADDRESS,
  USE_INVALIDATOR_IDL,
} from '@cardinal/token-manager/dist/cjs/programs/useInvalidator'
import * as metaplex from '@metaplex-foundation/mpl-token-metadata'
import { Edition } from '@metaplex-foundation/mpl-token-metadata'
import { BorshAccountsCoder } from '@project-serum/anchor'
import * as splToken from '@solana/spl-token'
import { unpackAccount, unpackMint } from '@solana/spl-token'
import type { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

export type AccountType =
  | 'metaplexMetadata'
  | 'editionData'
  | 'certificate'
  | 'tokenManager'
  | 'mint'
  | 'tokenAccount'
  | 'timeInvalidator'
  | 'paidClaimApprover'
  | 'useInvalidator'
  | 'stakePool'

export type AccountTypeData = {
  type: AccountType
  displayName?: string
}

export type AccountDataById = {
  [accountId: string]:
    | (AccountData<CertificateData> & AccountInfo<Buffer> & AccountTypeData)
    | (AccountData<TokenManagerData> & AccountInfo<Buffer> & AccountTypeData)
    | (AccountData<PaidClaimApproverData> &
        AccountInfo<Buffer> &
        AccountTypeData)
    | (AccountData<TimeInvalidatorData> & AccountInfo<Buffer> & AccountTypeData)
    | (AccountData<UseInvalidatorData> & AccountInfo<Buffer> & AccountTypeData)
    | (splToken.Account & AccountTypeData)
    | (splToken.Mint & AccountInfo<Buffer> & AccountTypeData)
    | (AccountData<metaplex.Metadata> & AccountInfo<Buffer> & AccountTypeData)
    | (AccountData<metaplex.Edition> & AccountInfo<Buffer> & AccountTypeData)
    | (AccountData<metaplex.MasterEditionV2> &
        AccountInfo<Buffer> &
        AccountTypeData)
    | (AccountData<undefined> & AccountInfo<Buffer> & AccountTypeData)
}

export const deserializeAccountInfos = (
  accountIds: (PublicKey | null)[],
  accountInfos: (AccountInfo<Buffer> | null)[]
): AccountDataById => {
  return accountInfos.reduce((acc, accountInfo, i) => {
    const ownerString = accountInfo?.owner.toString()
    switch (ownerString) {
      case CERTIFICATE_PROGRAM_ID.toString():
        try {
          const type = 'certificate'
          const coder = new BorshAccountsCoder(CERTIFICATE_IDL)
          const parsed = coder.decode(
            type,
            accountInfo?.data as Buffer
          ) as CertificateData
          acc[accountIds[i]!.toString()] = {
            type,
            pubkey: accountIds[i]!,
            ...(accountInfo as AccountInfo<Buffer>),
            parsed,
          }
        } catch (e) {}
        return acc
      case TOKEN_MANAGER_ADDRESS.toString():
        try {
          const type = 'tokenManager'
          const coder = new BorshAccountsCoder(TOKEN_MANAGER_IDL)
          const parsed = coder.decode(
            type,
            accountInfo?.data as Buffer
          ) as TokenManagerData
          acc[accountIds[i]!.toString()] = {
            type,
            pubkey: accountIds[i]!,
            ...(accountInfo as AccountInfo<Buffer>),
            parsed,
          }
        } catch (e) {}
        return acc
      case TIME_INVALIDATOR_ADDRESS.toString():
        try {
          const type = 'timeInvalidator'
          const coder = new BorshAccountsCoder(TIME_INVALIDATOR_IDL)
          const parsed = coder.decode(
            type,
            accountInfo?.data as Buffer
          ) as TimeInvalidatorData
          acc[accountIds[i]!.toString()] = {
            type,
            pubkey: accountIds[i]!,
            ...(accountInfo as AccountInfo<Buffer>),
            parsed,
          }
        } catch (e) {}
        return acc
      case USE_INVALIDATOR_ADDRESS.toString():
        try {
          const type = 'useInvalidator'
          const coder = new BorshAccountsCoder(USE_INVALIDATOR_IDL)
          const parsed = coder.decode(
            type,
            accountInfo?.data as Buffer
          ) as UseInvalidatorData
          acc[accountIds[i]!.toString()] = {
            type,
            pubkey: accountIds[i]!,
            ...(accountInfo as AccountInfo<Buffer>),
            parsed,
          }
        } catch (e) {}
        return acc
      case CLAIM_APPROVER_ADDRESS.toString():
        try {
          const type = 'paidClaimApprover'
          const coder = new BorshAccountsCoder(CLAIM_APPROVER_IDL)
          const parsed = coder.decode(
            type,
            accountInfo?.data as Buffer
          ) as PaidClaimApproverData
          acc[accountIds[i]!.toString()] = {
            type,
            pubkey: accountIds[i]!,
            ...(accountInfo as AccountInfo<Buffer>),
            parsed,
          }
        } catch (e) {}
        return acc
      case splToken.TOKEN_PROGRAM_ID.toString():
        acc[accountIds[i]!.toString()] =
          accountInfo?.data.length === splToken.MintLayout.span
            ? {
                type: 'mint',
                ...(accountInfo as AccountInfo<Buffer>),
                ...unpackMint(accountIds[i]!, accountInfo),
              }
            : {
                type: 'tokenAccount',
                ...(accountInfo as AccountInfo<Buffer>),
                ...unpackAccount(accountIds[i]!, accountInfo),
              }
        return acc
      case METADATA_PROGRAM_ID.toString():
        try {
          if (accountInfo) {
            acc[accountIds[i]!.toString()] = {
              type: 'metaplexMetadata',
              pubkey: accountIds[i]!,
              parsed: metaplex.Metadata.deserialize(accountInfo.data)[0],
              ...(accountInfo as AccountInfo<Buffer>),
            }
          }
        } catch (e) {}
        try {
          let parsed
          try {
            parsed = Edition.deserialize(accountInfo?.data as Buffer)[0]
          } catch (e) {
            parsed = metaplex.MasterEditionV2.deserialize(
              accountInfo?.data as Buffer
            )[0]
          }
          if (parsed) {
            acc[accountIds[i]!.toString()] = {
              type: 'editionData',
              pubkey: accountIds[i]!,
              parsed,
              ...(accountInfo as AccountInfo<Buffer>),
            }
          }
        } catch (e) {}
        return acc
      default:
        return acc
    }
  }, {} as AccountDataById)
}

export const accountDataById = async (
  connection: Connection,
  ids: (PublicKey | null)[]
): Promise<AccountDataById> => {
  const filteredIds = ids.filter((id): id is PublicKey => id !== null)
  const accountInfos = await getBatchedMultipleAccounts(connection, filteredIds)
  return deserializeAccountInfos(filteredIds, accountInfos)
}
