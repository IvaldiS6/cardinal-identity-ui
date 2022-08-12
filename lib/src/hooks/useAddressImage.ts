import { breakName } from '@cardinal/namespaces'
import type { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { TWITTER_NAMESPACE_NAME } from '../utils/constants'
import { tryGetImageUrl } from '../utils/format'
import { tracer, withTrace } from '../utils/trace'
import { useAddressName } from './useAddressName'

export const useAddressImage = (
  connection: Connection,
  address: PublicKey | undefined,
  dev?: boolean,
  namespaceName = TWITTER_NAMESPACE_NAME
) => {
  const addressName = useAddressName(connection, address, namespaceName)
  return useQuery<string | undefined>(
    ['useAddressImage', address?.toString(), namespaceName, addressName.data],
    async () => {
      const [_namespace, handle] = addressName.data
        ? breakName(addressName.data)
        : []
      if (handle) {
        const imageUrl = await withTrace(
          () => tryGetImageUrl(namespaceName, handle, dev || false),
          tracer({ name: 'useAddressImage' })
        )
        return imageUrl
      } else {
        return undefined
      }
    },
    { enabled: addressName.isFetched }
  )
}
