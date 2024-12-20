import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styled from 'styled-components';

const IS_VISIBLE = false;

const Banner: React.FC = () => {
    const [showBanner, setShowBanner] = useState(IS_VISIBLE);

    return (
        showBanner && (
            <Container>
                <CloseIcon className="icon icon--x-sign" onClick={() => setShowBanner(false)} />
                <BannerText>
                    <Trans
                        i18nKey={'common.banner.header'}
                        components={{
                            a: (
                                <Link
                                    target="_blank"
                                    rel="noreferrer"
                                    href={'https://dune.com/leifu/thales-speed-markets-competition-24'}
                                />
                            ),
                        }}
                    />
                </BannerText>
            </Container>
        )
    );
};

const Container = styled.div`
    width: 100vw;
    height: 25px;
    padding: 0 20px;
    margin-bottom: -15px;
    background: ${(props) => props.theme.background.secondary};
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: 34px;
        padding: 0 20px 0 5px;
    }
`;

const BannerText = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 13px;
    font-weight: 800;
    line-height: normal;
    text-align: center;
`;

const Link = styled.a`
    color: ${(props) => props.theme.background.tertiary};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 13px;
    font-weight: 900;
    line-height: normal;
    &:hover {
        text-decoration: underline;
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        text-decoration: underline;
    }
`;

const CloseIcon = styled.i`
    position: absolute;
    right: 15px;
    font-size: 12px;
    line-height: 12px;
    font-weight: 900;
    cursor: pointer;
    color: ${(props) => props.theme.toastMessages.error.textColor.primary};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        right: 5px;
    }
`;

export default Banner;
