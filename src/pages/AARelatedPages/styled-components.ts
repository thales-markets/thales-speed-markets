import styled from 'styled-components';
import { FlexDiv } from 'styles/common';

export const Wrapper = styled(FlexDiv)`
    align-items: flex-start;
    flex-direction: row;
    gap: 20px;
    width: 100%;
    max-width: 1080px;
    @media (max-width: 600px) {
        margin-top: 20px;
        flex-wrap: wrap-reverse;
    }
`;

export const FormContainer = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
    @media (max-width: 600px) {
        width: 100%;
    }
`;

export const BalanceSection = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    margin-top: 20px;
    @media (max-width: 600px) {
        padding: 0;
        width: 100%;
        max-width: 100%;
    }
`;

export const PrimaryHeading = styled.h1`
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 20px;
    margin-bottom: 21px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const InputLabel = styled.span<{ marginTop?: string }>`
    font-size: 12px;
    font-weight: 700;
    text-transform: capitalize;
    margin-top: ${(props) => (props.marginTop ? props.marginTop : '')};
    margin-bottom: 5px;
    color: ${(props) => props.theme.textColor.primary};
`;

export const InputContainer = styled(FlexDiv)`
    position: relative;
    margin-right: 10px;
    width: 100%;
`;

export const CollateralContainer = styled.div`
    position: relative;
    width: 100%;
    margin-left: auto;
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.input.borderColor.secondary};
    padding: 8px 0;
    max-height: 34px;
    display: flex;
    justify-content: end;
    align-items: center;
    background: ${(props) => props.theme.input.background.primary};
    cursor: pointer;
`;

export const WarningContainer = styled(FlexDiv)`
    width: 100%;
    background-color: ${(props) => props.theme.warning.background};
    color: ${(props) => props.theme.warning.textColor};
    padding: 5px;
    align-items: center;
    font-weight: 400;
    text-transform: capitalize;
    font-size: 18px;
    border-radius: 5px;
    margin-top: 18px;
    @media (max-width: 600px) {
        font-size: 12px;
    }
`;

export const WarningIcon = styled.i`
    padding-right: 12px;
    padding-left: 5px;
`;