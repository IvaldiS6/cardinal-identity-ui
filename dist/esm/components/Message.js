import { jsx as _jsx, jsxs as _jsxs } from "@emotion/react/jsx-runtime";
import styled from "@emotion/styled";
export const Message = ({ title, description }) => {
    return (_jsx(Wrapper, { children: _jsxs(Info, { children: [title && _jsx(Title, { children: title }, void 0), _jsx(Description, { children: description }, void 0)] }, void 0) }, void 0));
};
const Wrapper = styled.div `
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  width: 100%;
`;
const Info = styled.div `
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const Title = styled.span `
  font-weight: bold;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: -0.02em;
  color: #000000;
`;
const Description = styled.p `
  margin: 0;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.02em;
  color: #696969;
`;
//# sourceMappingURL=Message.js.map