import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import styled from "@emotion/styled";
import { LogoTitled } from "../common/LogoTitled";
export const PoweredByFooter = () => {
    return (_jsx("div", Object.assign({ style: {
            margin: "0px auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
        } }, { children: _jsxs(StyledLogo, { children: [_jsx("div", { children: "POWERED BY" }, void 0), _jsx("div", { children: _jsx(LogoTitled, {}, void 0) }, void 0)] }, void 0) }), void 0));
};
const StyledLogo = styled.div `
  display: flex;
  gap: 5px;
  font-size: 15px;
  svg {
    height: 14px;
  }
`;
//# sourceMappingURL=PoweredByFooter.js.map