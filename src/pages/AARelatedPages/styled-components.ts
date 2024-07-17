import { ScreenSizeBreakpoint } from 'enums/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Wrapper = styled(FlexDiv)`
    align-items: flex-start;
    flex-direction: row;
    gap: 20px;

    max-width: 900px;
    width: 100%;
    background-color: ${(props) => props.theme.background.primary};
    border-radius: 15px;
    padding: 25px 40px 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        padding: 25px 0;
        margin-top: 20px;
        flex-wrap: wrap-reverse;
    }
`;

export const FormContainer = styled(FlexDiv)`
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 18px;
    height: 100%;
    width: 100%;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        width: 100%;
    }
`;

export const InputLabel = styled.p<{ marginTop?: string }>`
    font-size: 14px;
    font-weight: 400;
    line-height: normal;
    margin-top: ${(props) => (props.marginTop ? props.marginTop : '')};
    margin-bottom: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const InputContainer = styled(FlexDiv)`
    position: relative;
    margin-right: 10px;
    width: 100%;
`;

export const WarningContainer = styled(FlexDiv)`
    width: 100%;
    background-color: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.background.primary};
    padding: 12px 8px;
    align-items: center;
    font-weight: 400;
    font-size: 18px;
    border-radius: 5px;
    margin-top: 4px;
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        font-size: 12px;
    }
`;

export const WarningIcon = styled.i`
    padding-right: 12px;
    padding-left: 5px;
    color: ${(props) => props.theme.background.primary};
    text-transform: uppercase;
`;

export const GasIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 2px;
`;

export const GasText = styled.span`
    display: flex;
    font-size: 18px;
    color: ${(props) => props.theme.textColor.primary};
    position: absolute;
    right: 16px;
    bottom: 10px;
`;

export const ButtonWrapper = styled.div`
    position: relative;
`;
