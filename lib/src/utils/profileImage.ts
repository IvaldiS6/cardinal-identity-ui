import { capitalizeFirstLetter } from '@cardinal/common'

import { getIdentity, IDENTITIES, isKnownIdentity } from '../common/Identities'

export async function getImageUrl(
  namespace: string,
  name: string,
  dev?: boolean
): Promise<string | undefined> {
  const identity = getIdentity(namespace)
  return identity?.profileImage
    ? identity.profileImage(name, dev)
    : `data:image/svg+xml;utf8,${profileImage(namespace, name)}`
}

export const profileImage = (identityName: string, name: string) => {
  const identity = isKnownIdentity(identityName)
    ? IDENTITIES[identityName]
    : undefined
  return `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.2" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="50"
        fill="${encodeURIComponent(identity?.colors.primary ?? '#000000')}"
      ></circle>
      <text
        x="50%"
        y="50%"
        alignment-baseline="central"
        text-anchor="middle"
        font-size="80px"
        font-family="Helvetica"
        fill="${encodeURIComponent(
          identity?.colors.primaryFontColor ?? '#FFFFFF'
        )}"
      >
        ${capitalizeFirstLetter(name).slice(0, 1)}
      </text>
    </svg>
  `
}
