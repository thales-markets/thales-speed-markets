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
    padding: 25px;

    @media (max-width: 600px) {
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
    @media (max-width: 600px) {
        width: 100%;
    }
`;

export const BalanceSection = styled(FlexDiv)`
    flex-direction: column;
    width: 100%;
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
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
`;

export const InputLabel = styled.p<{ marginTop?: string }>`
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 14px;
    font-style: normal;
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
    background-color: ${(props) => props.theme.background.quinary};
    color: ${(props) => props.theme.background.primary};
    font-family: ${(props) => props.theme.fontFamily.primary};
    padding: 12px 8px;
    align-items: center;
    font-weight: 400;
    font-size: 18px;
    border-radius: 5px;
    margin-top: 4px;
    @media (max-width: 600px) {
        font-size: 12px;
    }
`;

export const WarningIcon = styled.i`
    padding-right: 12px;
    padding-left: 5px;
    color: ${(props) => props.theme.background.primary};
    text-transform: uppercase;
`;

export const SectionLabel = styled.p`
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 24px;
    color: ${(props) => props.theme.textColor.secondary};
`;

export const TutorialLinksContainer = styled(FlexDiv)`
    flex-direction: column;
    border-radius: 5px;
    margin-bottom: 13px;

    padding: 19px;
    border: 1px ${(props) => props.theme.borderColor.primary} solid;
`;

export const Link = styled.a`
    width: fit-content;
    font-size: 12px;
    font-weight: 700;
    text-decoration: underline;
    text-transform: capitalize;
    padding-bottom: 15px;
    color: ${(props) => props.theme.textColor.primary};
`;
