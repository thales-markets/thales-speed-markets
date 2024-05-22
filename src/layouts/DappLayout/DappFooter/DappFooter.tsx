import { LINKS } from 'constants/links';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';

const DappFooter: React.FC<{ isLandingPage?: boolean }> = ({ isLandingPage }) => {
    const { t } = useTranslation();

    return (
        <Container $isLandingPage={isLandingPage}>
            <Items>
                <Item>
                    <a target="_blank" rel="noreferrer" href={LINKS.GitHub}>
                        <FooterIcon className="icon-home icon-home--github" />
                    </a>
                    <TextLink target="_blank" rel="noreferrer" href={LINKS.GitHub}>
                        {t('common.footer.github')}
                    </TextLink>
                </Item>
                <Item>
                    <a target="_blank" rel="noreferrer" href={LINKS.Discord.SpeedMarkets}>
                        <FooterIcon className="icon-home icon-home--discord" />
                    </a>
                    <TextLink target="_blank" rel="noreferrer" href={LINKS.Discord.SpeedMarkets}>
                        {t('common.footer.discord')}
                    </TextLink>
                </Item>
                <Item>
                    <a target="_blank" rel="noreferrer" href={LINKS.Medium}>
                        <FooterIcon className="icon-home icon-home--medium" />
                    </a>
                    <TextLink target="_blank" rel="noreferrer" href={LINKS.Medium}>
                        {t('common.footer.medium')}
                    </TextLink>
                </Item>
                <Item>
                    <a target="_blank" rel="noreferrer" href={LINKS.Twitter.Thales}>
                        <FooterIcon className="icon-home icon-home--twitter-x" />
                    </a>
                    <TextLink target="_blank" rel="noreferrer" href={LINKS.Twitter.Thales}>
                        {t('common.footer.twitter')}
                    </TextLink>
                </Item>
                <Item>
                    <a target="_blank" rel="noreferrer" href={LINKS.ThalesIo.Docs}>
                        <FooterIcon className="icon-home icon-home--documentation" />
                    </a>
                    <TextLink target="_blank" rel="noreferrer" href={LINKS.ThalesIo.Docs}>
                        {t('common.footer.docs')}
                    </TextLink>
                </Item>
            </Items>
            <DescriptionWrapper>
                <Description>{t('common.footer.description')}</Description>
            </DescriptionWrapper>
        </Container>
    );
};

const Container = styled.div<{ $isLandingPage?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    ${(props) => (props.$isLandingPage ? 'max-width: 950px;' : '')}
    gap: 20px;
    padding-top: 75px;
    margin: auto auto 25px auto;
    z-index: 1;

    @media screen and (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        padding-top: 50px;
    }
`;

const Items = styled(FlexDivRow)`
    max-width: 585px;
    min-width: 350px;
`;

const Item = styled(FlexDivColumn)`
    flex: unset;
    align-items: center;
`;

const TextLink = styled.a`
    font-size: 12px;
    line-height: 27px;
    font-weight: 400;
    color: ${(props) => props.theme.link.textColor.secondary};
    text-align: center;
    &:hover {
        text-decoration: underline;
    }
`;

const FooterIcon = styled.i`
    transition: 0.2s;
    &:hover {
        transform: scale(1.2);
    }
    &:before {
        pointer-events: none;
    }
    font-size: 27px;
    color: ${(props) => props.theme.textColor.primary};
`;

const DescriptionWrapper = styled(FlexDivRow)``;

const Description = styled.p`
    font-size: 13px;
    line-height: 100%;
    font-weight: 400;
    color: ${(props) => props.theme.textColor.primary};
    text-align: justify;
`;

export default DappFooter;
