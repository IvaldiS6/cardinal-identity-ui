import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import styled from "@emotion/styled";
import { Button } from "../common/Button";
import { TwitterIcon } from "../common/TwitterIcon";
export const PostTweet = ({ wallet, appName, appTwitter, disabled, callback, cluster, }) => {
    var _a;
    const link = useGenerateLink((_a = wallet === null || wallet === void 0 ? void 0 : wallet.publicKey) === null || _a === void 0 ? void 0 : _a.toString(), appName, appTwitter, cluster);
    return (_jsx(TwitterButtonWrapper, Object.assign({ href: link, onClick: () => callback && callback(), target: "_blank", rel: "noreferrer noopener" }, { children: _jsx(TwitterButton, Object.assign({ variant: "primary", disabled: disabled }, { children: _jsxs("div", Object.assign({ style: {
                    display: "flex",
                    alignItems: "center",
                } }, { children: [_jsx(TwitterIcon, {}, void 0), _jsx("span", Object.assign({ style: {
                            position: "relative",
                            bottom: "1px",
                            marginLeft: "6px",
                            marginRight: "12px",
                        } }, { children: "Verify" }), void 0)] }), void 0) }), void 0) }), void 0));
};
const TwitterButtonWrapper = styled.a `
  margin-top: 5px;
  display: inline-block;
`;
const TwitterButton = styled(Button) `
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding: 0 12px;
`;
const useGenerateLink = (pubkey, appName, appTwitter, cluster) => {
    if (!pubkey)
        return "";
    const link = [
        `https://twitter.com/intent/tweet?text=`,
        encodeURIComponent([
            `Claiming my Twitter handle as a @Solana NFT${appTwitter || appName ? ` on ${appTwitter || appName}` : ""} using @cardinal_labs protocol and linking it to my address ${pubkey}\n\n`,
            `Verify and claim yours at https://twitter.cardinal.so${cluster === "devnet" ? "?cluster=devnet" : ""}!`,
        ].join("")),
    ].join("");
    return link;
};
//# sourceMappingURL=PostTweet.js.map