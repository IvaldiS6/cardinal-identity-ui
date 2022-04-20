import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { AiFillCheckCircle, AiFillExclamationCircle, AiFillInfoCircle, AiFillWarning, } from 'react-icons/ai';
export const Alert = ({ type, showIcon, message, style, }) => {
    return (_jsxs(StyledAlert, Object.assign({ type: type, style: style }, { children: [showIcon && (_jsx(AlertIcon, Object.assign({ type: type }, { children: {
                    info: _jsx(AiFillInfoCircle, {}, void 0),
                    warning: _jsx(AiFillWarning, {}, void 0),
                    success: _jsx(AiFillCheckCircle, {}, void 0),
                    error: _jsx(AiFillExclamationCircle, {}, void 0),
                }[type] }), void 0)), message] }), void 0));
};
const AlertIcon = styled.div `
  margin-right: 8px;
  ${({ type = 'info' }) => {
    return {
        info: css `
        color: #1890ff;
      `,
        warning: css `
        color: #faad14;
      `,
        success: css `
        color: #52c41a;
      `,
        error: css `
        color: #ff4d4f;
      `,
    }[type];
}}
`;
const StyledAlert = styled.div `
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5715;
  list-style: none;
  font-feature-settings: 'tnum';
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 15px;
  word-wrap: break-word;
  border-radius: 2px;
  ${({ type = 'info' }) => {
    return {
        info: css `
        background-color: #e6f7ff;
        border: 1px solid #91d5ff;
      `,
        warning: css `
        background-color: #fffbe6;
        border: 1px solid #ffe58f;
      `,
        success: css `
        background-color: #f6ffed;
        border: 1px solid #b7eb8f;
      `,
        error: css `
        background-color: #fff2f0;
        border: 1px solid #ffccc7;
      `,
    }[type];
}}
`;
//# sourceMappingURL=Alert.js.map