import { Fragment as _Fragment, jsx as _jsx } from "@emotion/react/jsx-runtime";
import ContentLoader from 'react-content-loader';
import { useAddressName } from '../hooks/useAddressName';
import { formatShortAddress, formatTwitterLink } from '../utils/format';
export const DisplayAddress = ({ connection, address, height = '20px', width = '100px', dark = false, style, }) => {
    const { displayName, loadingName } = useAddressName(connection, address);
    if (!address)
        return _jsx(_Fragment, {}, void 0);
    return loadingName ? (_jsx("div", Object.assign({ style: Object.assign(Object.assign({}, style), { height,
            width, overflow: 'hidden' }) }, { children: _jsx(ContentLoader, Object.assign({ backgroundColor: dark ? '#333' : undefined, foregroundColor: dark ? '#555' : undefined }, { children: _jsx("rect", { style: Object.assign({}, style), x: 0, y: 0, width: width, height: height }, void 0) }), void 0) }), void 0)) : (_jsx("div", Object.assign({ style: Object.assign({ display: 'flex', gap: '5px' }, style) }, { children: (displayName === null || displayName === void 0 ? void 0 : displayName.includes('@'))
            ? formatTwitterLink(displayName)
            : displayName || formatShortAddress(address) }), void 0));
};
//# sourceMappingURL=DisplayAddress.js.map