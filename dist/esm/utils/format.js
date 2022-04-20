import { __awaiter } from "tslib";
import { Fragment as _Fragment, jsx as _jsx } from "@emotion/react/jsx-runtime";
import { shortenAddress } from "@cardinal/namespaces";
import { PublicKey } from "@solana/web3.js";
import { apiBase } from "./api";
export const formatTwitterLink = (handle) => {
    if (!handle)
        return _jsx(_Fragment, {}, void 0);
    return (_jsx("a", Object.assign({ href: `https://twitter.com/${handle}`, style: { color: "#177ddc" }, target: "_blank", rel: "noreferrer" }, { children: handle }), void 0));
};
export function shortPubKey(pubkey) {
    if (!pubkey)
        return "";
    return `${pubkey === null || pubkey === void 0 ? void 0 : pubkey.toString().substring(0, 4)}..${pubkey === null || pubkey === void 0 ? void 0 : pubkey.toString().substring((pubkey === null || pubkey === void 0 ? void 0 : pubkey.toString().length) - 4)}`;
}
export const tryPublicKey = (publicKeyString) => {
    if (publicKeyString instanceof PublicKey)
        return publicKeyString;
    if (!publicKeyString)
        return null;
    try {
        return new PublicKey(publicKeyString);
    }
    catch (e) {
        return null;
    }
};
export const formatShortAddress = (address) => {
    if (!address)
        return _jsx(_Fragment, {}, void 0);
    return (_jsx("a", Object.assign({ href: `https://explorer.solana.com/address/${address.toString()}`, target: "_blank", rel: "noopener noreferrer" }, { children: shortenAddress(address.toString()) }), void 0));
};
export function tryGetImageUrl(handle, dev) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiBase(dev)}/twitter/proxy?url=https://api.twitter.com/2/users/by&usernames=${handle}&user.fields=profile_image_url`);
            const json = (yield response.json());
            return (_a = json === null || json === void 0 ? void 0 : json.data[0]) === null || _a === void 0 ? void 0 : _a.profile_image_url.replace("_normal", "");
        }
        catch (e) {
            console.log(e);
            return undefined;
        }
    });
}
export function tryGetProfile(handle, dev) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${apiBase(dev)}/twitter/proxy?url=https://api.twitter.com/2/users/by&usernames=${handle}&user.fields=profile_image_url`);
            const json = (yield response.json());
            return {
                profile_image_url: (_a = json === null || json === void 0 ? void 0 : json.data[0]) === null || _a === void 0 ? void 0 : _a.profile_image_url.replace("_normal", ""),
                username: (_b = json === null || json === void 0 ? void 0 : json.data[0]) === null || _b === void 0 ? void 0 : _b.username,
                id: (_c = json === null || json === void 0 ? void 0 : json.data[0]) === null || _c === void 0 ? void 0 : _c.id,
                name: (_d = json === null || json === void 0 ? void 0 : json.data[0]) === null || _d === void 0 ? void 0 : _d.name,
            };
        }
        catch (e) {
            return undefined;
        }
    });
}
//# sourceMappingURL=format.js.map