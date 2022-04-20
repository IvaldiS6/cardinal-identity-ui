import { __awaiter } from "tslib";
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useClaimRequest } from '../hooks/useClaimRequest';
import { useNameEntryData } from '../hooks/useNameEntryData';
import { useReverseEntry } from '../hooks/useReverseEntry';
import { apiBase, claimEntry, initAndClaimEntry, revokeAndClaim, setReverseEntry, tryGetNameEntry, } from '../utils/api';
import { formatShortAddress, formatTwitterLink } from '../utils/format';
import { ButtonWithFooter } from './ButtonWithFooter';
import { Link, Megaphone, Verified } from './icons';
import { LabeledInput } from './LabeledInput';
import { PostTweet } from './PostTweet';
import { PoweredByFooter } from './PoweredByFooter';
import { StepDetail } from './StepDetail';
import { TwitterHandleNFT } from './TwitterHandleNFT';
const handleFromTweetUrl = (raw) => {
    if (!raw)
        return undefined;
    return raw.split('/')[3];
};
const tweetIdFromTweetUrl = (raw) => {
    var _a;
    if (!raw)
        return undefined;
    return (_a = raw.split('/')[5]) === null || _a === void 0 ? void 0 : _a.split('?')[0];
};
export const NameEntryClaim = ({ dev = false, cluster = 'mainnet', connection, wallet, namespaceName = 'twitter', appName, appTwitter, notify, onComplete, }) => {
    var _a, _b, _c;
    const [verifyError, setVerifyError] = useState(undefined);
    const [ownedError, setOwnedError] = useState(undefined);
    const [claimError, setClaimError] = useState(undefined);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [loadingRevoke, setLoadingRevoke] = useState(false);
    const [loadingClaim, setLoadingClaim] = useState(false);
    const [tweetSent, setTweetSent] = useState(false);
    const [tweetUrl, setTweetUrl] = useState(undefined);
    const handle = handleFromTweetUrl(tweetUrl);
    const tweetId = tweetIdFromTweetUrl(tweetUrl);
    const [claimed, setClaimed] = useState(false);
    const { reverseEntryData, getReverseEntryData } = useReverseEntry(connection, wallet === null || wallet === void 0 ? void 0 : wallet.publicKey);
    const { nameEntryData, loadingNameEntry, refreshNameEntryData } = useNameEntryData(connection, namespaceName, handle);
    const { claimRequest, loadingClaimRequest, getClaimRequestData } = useClaimRequest(connection, namespaceName, handle, wallet === null || wallet === void 0 ? void 0 : wallet.publicKey);
    const verifyTwitter = () => __awaiter(void 0, void 0, void 0, function* () {
        setLoadingVerify(true);
        setVerifyError(undefined);
        setOwnedError(undefined);
        try {
            const response = yield fetch(`${apiBase(dev)}/twitter/approve?tweetId=${tweetId}&publicKey=${wallet === null || wallet === void 0 ? void 0 : wallet.publicKey.toString()}&handle=${handle}${cluster && `&cluster=${cluster}`}`);
            const json = yield response.json();
            if (response.status !== 200)
                throw new Error(json.error);
        }
        catch (e) {
            setVerifyError(`Failed to approve tweet url: ${e}`);
        }
        finally {
            yield getClaimRequestData();
            setLoadingVerify(false);
        }
    });
    const revokeHandle = () => __awaiter(void 0, void 0, void 0, function* () {
        setLoadingRevoke(true);
        setOwnedError(undefined);
        try {
            const response = yield fetch(`${apiBase(dev)}/twitter/revoke?tweetId=${tweetId}&publicKey=${wallet === null || wallet === void 0 ? void 0 : wallet.publicKey.toString()}&handle=${handle}${cluster && `&cluster=${cluster}`}`);
            yield refreshNameEntryData();
            const json = yield response.json();
            if (response.status !== 200)
                throw new Error(json.error);
        }
        catch (e) {
            setOwnedError(`Failed to revoke tweet url: ${e}`);
        }
        finally {
            setLoadingRevoke(false);
        }
    });
    const setDefault = () => __awaiter(void 0, void 0, void 0, function* () {
        setLoadingRevoke(true);
        setOwnedError(undefined);
        try {
            if (!handle)
                throw new Error('Handle not found');
            if (!connection)
                throw new Error('Connection not found');
            if (!wallet)
                throw new Error('Wallet not connected');
            console.log('Setting reverse entry entry:', handle);
            const txid = yield setReverseEntry(connection, wallet, namespaceName, handle, nameEntryData === null || nameEntryData === void 0 ? void 0 : nameEntryData.nameEntry.parsed.mint);
            notify && notify({ message: 'Set default successful', txid });
            setClaimed(true);
            onComplete && onComplete(handle);
        }
        catch (e) {
            console.log(e);
            setOwnedError(`Failed to set default handle: ${e}`);
        }
        finally {
            setLoadingRevoke(false);
        }
    });
    useEffect(() => {
        var _a;
        if (tweetUrl &&
            tweetSent &&
            (!claimRequest || !((_a = claimRequest === null || claimRequest === void 0 ? void 0 : claimRequest.parsed) === null || _a === void 0 ? void 0 : _a.isApproved))) {
            verifyTwitter();
        }
    }, [wallet, tweetUrl, handle, tweetSent, tweetId, claimRequest]);
    const handleClaim = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!handle)
                throw new Error('Handle not found');
            if (!connection)
                throw new Error('Connection not found');
            if (!wallet)
                throw new Error('Wallet not connected');
            setLoadingClaim(true);
            setClaimError(undefined);
            const checkNameEntry = yield tryGetNameEntry(connection, namespaceName, handle);
            if (!checkNameEntry) {
                console.log('Initializing and claiming entry:', handle);
                const txid = yield initAndClaimEntry(cluster, connection, wallet, namespaceName, handle, null);
                notify && notify({ message: 'Claim successful', txid });
                setClaimed(true);
                onComplete && onComplete(handle);
            }
            else if (checkNameEntry && !checkNameEntry.parsed.isClaimed) {
                console.log('Claiming entry:', handle);
                const txid = yield claimEntry(connection, wallet, namespaceName, handle, checkNameEntry.parsed.mint, null);
                notify && notify({ message: 'Claim successful', txid });
                setClaimed(true);
                onComplete && onComplete(handle);
            }
            else {
                console.log('Revoking and claiming entry:', handle);
                const txid = yield revokeAndClaim(cluster, connection, wallet, namespaceName, handle, null, reverseEntryData === null || reverseEntryData === void 0 ? void 0 : reverseEntryData.pubkey, claimRequest.pubkey, checkNameEntry.parsed.mint, nameEntryData.owner);
                notify && notify({ message: 'Init and claim successful', txid });
                setClaimed(true);
                onComplete && onComplete(handle);
            }
        }
        catch (e) {
            if (e === null || e === void 0 ? void 0 : e.message.includes('0x1')) {
                setClaimError(_jsx(_Fragment, { children: "Not enough sol!" }, void 0));
            }
            else {
                setClaimError(_jsxs(_Fragment, { children: ["Failed to claim: ", e === null || e === void 0 ? void 0 : e.message] }, void 0));
            }
        }
        finally {
            refreshNameEntryData();
            getReverseEntryData();
            setLoadingClaim(false);
        }
    });
    const alreadyOwned = nameEntryData &&
        ((_a = nameEntryData.owner) === null || _a === void 0 ? void 0 : _a.toString()) &&
        !nameEntryData.isOwnerPDA
        ? true
        : false;
    return (_jsx(Wrapper, { children: _jsxs(_Fragment, { children: [_jsxs(Instruction, { children: [appName ? `${appName} uses` : 'Use', " Cardinal to link your Twitter identity to your ", _jsx("strong", { children: "Solana" }, void 0), " address."] }, void 0), (!(wallet === null || wallet === void 0 ? void 0 : wallet.publicKey) || !connection) && (_jsx(Alert, { style: { marginBottom: '20px' }, message: _jsx(_Fragment, { children: _jsx("div", { children: "Connect wallet to continue" }, void 0) }, void 0), type: "warning", showIcon: true }, void 0)), (reverseEntryData === null || reverseEntryData === void 0 ? void 0 : reverseEntryData.parsed.entryName) && (_jsx(Alert, { style: { marginBottom: '20px', width: '100%' }, message: _jsx(_Fragment, { children: _jsxs("div", { children: ["Your address is linked to", ' ', formatTwitterLink(reverseEntryData === null || reverseEntryData === void 0 ? void 0 : reverseEntryData.parsed.entryName), ". You can change your Twitter handle by linking a new profile."] }, void 0) }, void 0), type: "info", showIcon: true }, void 0)), _jsxs(DetailsWrapper, { children: [_jsx(StepDetail, { disabled: !(wallet === null || wallet === void 0 ? void 0 : wallet.publicKey) || !connection, icon: _jsx(Megaphone, {}, void 0), title: "Tweet!", description: _jsxs(_Fragment, { children: [_jsx("div", { children: "Tweet your public key" }, void 0), _jsx(PostTweet, { wallet: wallet, appName: appName, appTwitter: appTwitter, disabled: false, callback: () => setTweetSent(true), cluster: cluster }, void 0)] }, void 0) }, void 0), _jsx(StepDetail, { disabled: !tweetSent, icon: _jsx(Link, {}, void 0), title: "Paste the URL of the tweet", description: _jsx("div", { children: _jsx(LabeledInput, { disabled: !tweetSent, label: "Tweet", name: "tweet", onChange: (e) => setTweetUrl(e.target.value) }, void 0) }, void 0) }, void 0), _jsx(StepDetail, { disabled: !handle, icon: _jsx(Verified, {}, void 0), title: "Claim your handle", description: _jsxs(_Fragment, { children: [_jsx("div", { children: "You will receive a non-tradeable NFT to prove you own your Twitter handle." }, void 0), handle && (_jsxs("div", Object.assign({ style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            paddingTop: '20px',
                                        } }, { children: [_jsx(TwitterHandleNFT, { handle: handle, cluster: cluster, dev: dev }, void 0), _jsxs("div", Object.assign({ style: {
                                                    padding: '10px',
                                                    maxWidth: 'calc(100% - 120px - 20px)',
                                                } }, { children: [claimRequest && claimRequest.parsed.isApproved ? (_jsx(StyledAlert, { children: _jsx(Alert, { style: {
                                                                margin: '10px 0px',
                                                                height: 'auto',
                                                                wordBreak: 'break-word',
                                                            }, message: _jsx(_Fragment, { children: _jsxs("div", { children: ["Verified ownership of", ' ', formatTwitterLink(handle)] }, void 0) }, void 0), type: "success", showIcon: true }, void 0) }, void 0)) : loadingVerify || loadingClaimRequest ? (_jsx("div", Object.assign({ style: { padding: '10px' } }, { children: _jsx(LoadingSpinner, { fill: "#000" }, void 0) }), void 0)) : (_jsxs(StyledAlert, { children: [_jsx(Alert, { style: {
                                                                    marginTop: '10px',
                                                                    height: 'auto',
                                                                    wordBreak: 'break-word',
                                                                }, message: _jsx(_Fragment, { children: _jsx("div", { children: verifyError }, void 0) }, void 0), type: "error", showIcon: true }, void 0), _jsx(ButtonWrapper, { children: _jsx(ButtonLight, Object.assign({ onClick: () => verifyTwitter() }, { children: "Retry" }), void 0) }, void 0)] }, void 0)), claimRequest &&
                                                        claimRequest.parsed.isApproved &&
                                                        !claimed &&
                                                        (loadingNameEntry || loadingRevoke ? (_jsx("div", Object.assign({ style: { padding: '10px' } }, { children: _jsx(LoadingSpinner, { fill: "#000" }, void 0) }), void 0)) : (alreadyOwned && (_jsxs(_Fragment, { children: [_jsx(Alert, { style: {
                                                                        marginBottom: '10px',
                                                                        height: 'auto',
                                                                        wordBreak: 'break-word',
                                                                    }, message: _jsx(_Fragment, { children: _jsxs("div", { children: ["Owned by", ' ', formatShortAddress(nameEntryData === null || nameEntryData === void 0 ? void 0 : nameEntryData.owner)] }, void 0) }, void 0), type: "warning", showIcon: true }, void 0), ((_b = nameEntryData === null || nameEntryData === void 0 ? void 0 : nameEntryData.owner) === null || _b === void 0 ? void 0 : _b.toString()) ===
                                                                    ((_c = wallet === null || wallet === void 0 ? void 0 : wallet.publicKey) === null || _c === void 0 ? void 0 : _c.toString()) ? (_jsxs(_Fragment, { children: [_jsx("div", { children: "You already own this handle! If you want to set it as your default, click below." }, void 0), _jsx(ButtonWrapper, { children: _jsx(ButtonLight, Object.assign({ onClick: () => setDefault() }, { children: "Set Default" }), void 0) }, void 0)] }, void 0)) : (_jsxs(_Fragment, { children: [_jsx("div", { children: "If you wish to continue, you will revoke this handle from them." }, void 0), _jsx(ButtonWrapper, { children: _jsx(ButtonLight, Object.assign({ onClick: () => revokeHandle() }, { children: "Revoke" }), void 0) }, void 0)] }, void 0)), ownedError && (_jsx(StyledAlert, { children: _jsx(Alert, { style: {
                                                                            marginTop: '10px',
                                                                            height: 'auto',
                                                                            wordBreak: 'break-word',
                                                                        }, message: _jsx(_Fragment, { children: _jsx("div", { children: ownedError }, void 0) }, void 0), type: "error", showIcon: true }, void 0) }, void 0))] }, void 0)))), claimError && (_jsx(StyledAlert, { children: _jsx(Alert, { style: { marginTop: '10px', height: 'auto' }, message: _jsx(_Fragment, { children: _jsx("div", { children: claimError }, void 0) }, void 0), type: "error", showIcon: true }, void 0) }, void 0))] }), void 0)] }), void 0))] }, void 0) }, void 0)] }, void 0), _jsxs(ButtonWithFooter, Object.assign({ loading: loadingClaim, complete: claimed, disabled: !claimRequest ||
                        !claimRequest.parsed.isApproved ||
                        loadingNameEntry ||
                        alreadyOwned, onClick: handleClaim, footer: _jsx(PoweredByFooter, {}, void 0) }, { children: ["Claim ", handle && `@${handle}`] }), void 0)] }, void 0) }, void 0));
};
const ButtonWrapper = styled.div `
  display: flex;
  margin-top: 5px;
  justify-content: center;
`;
const ButtonLight = styled.div `
  border-radius: 5px;
  padding: 5px 8px;
  border: none;
  background: #eee;
  color: #777;
  cursor: pointer;
  transition: 0.1s all;
  &:hover {
    background: #ddd;
  }
`;
const StyledAlert = styled.div ``;
const Wrapper = styled.div `
  padding: 10px 28px 28px 28px;
`;
const Instruction = styled.h2 `
  margin-top: 0px;
  margin-bottom: 20px;
  font-weight: normal;
  font-size: 24px;
  line-height: 30px;
  text-align: center;
  letter-spacing: -0.02em;
  color: #000000;
`;
const DetailsWrapper = styled.div `
  display: grid;
  grid-row-gap: 28px;
`;
//# sourceMappingURL=NameEntryClaim.js.map