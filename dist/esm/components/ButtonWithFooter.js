import { __rest } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import styled from "@emotion/styled";
import { lighten } from "polished";
import { LoadingSpinner } from "../common/LoadingSpinner";
export const ButtonWithFooter = (_a) => {
    var { footer, children, disabled, loading, complete } = _a, props = __rest(_a, ["footer", "children", "disabled", "loading", "complete"]);
    return (_jsxs(BottomArea, { children: [_jsx(BigButton, Object.assign({ disabled: disabled }, props, { children: loading ? (_jsx(LoadingSpinner, {}, void 0)) : complete ? (_jsx("i", { className: "fas fa-check-circle" }, void 0)) : (children) }), void 0), _jsx(FooterText, { children: footer }, void 0)] }, void 0));
};
export const BottomArea = styled.div `
  margin-top: 40px;
  left: 28px;
  right: 28px;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
`;
export const FooterText = styled.div `
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.02em;
  color: #696969;
  & > a {
    color: #696969;
    font-weight: bold;
  }
`;
export const BigButton = styled.button `
  border: none;
  outline: none;
  border-radius: 16px;
  height: 55px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  line-height: 20px;
  text-align: center;
  background: #000000;
  color: #fff;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

  opacity: ${({ disabled }) => (disabled ? 0.3 : 1)};
  &:hover {
    background: ${({ disabled }) => (disabled ? "" : lighten(0.133, "#000"))};
  }
  &:active {
    background: ${({ disabled }) => (disabled ? "" : lighten(0.212, "#000"))};
  }
`;
//# sourceMappingURL=ButtonWithFooter.js.map