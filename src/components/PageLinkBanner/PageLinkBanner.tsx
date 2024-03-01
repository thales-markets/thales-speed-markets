import arrowRightAnimation from 'assets/lotties/rigth-arrows.json';
import SPAAnchor from 'components/SPAAnchor';
import { ScreenSizeBreakpoint } from 'enums/ui';
import Lottie from 'lottie-react';
import React, { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';
import { RootState } from 'types/ui';

type PageLinkBannerProps = { link: string };

const PageLinkBanner: React.FC<PageLinkBannerProps> = ({ link }) => {
    const { t } = useTranslation();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <SPAAnchor href={link}>
            <Content>
                <Text>
                    {t('common.banner.page-link.thales-markets')}{' '}
                    <Text noWrap>
                        <Trans
                            i18nKey="common.banner.page-link.try"
                            components={{
                                bold: <BoldText />,
                                value: t('markets.title'),
                            }}
                        />
                    </Text>
                </Text>
                {!isMobile && <Lottie animationData={arrowRightAnimation} style={arrowRightStyle} />}
            </Content>
        </SPAAnchor>
    );
};

const Content = styled(FlexDivCentered)`
    position: relative;
    height: 30px;
    background: ${(props) => props.theme.borderColor.tertiary};
    border-radius: 8px;
    padding: 5px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: 40px;
    }
`;

const Text = styled.span<{ noWrap?: boolean }>`
    color: ${(props) => props.theme.button.textColor.primary};
    text-align: center;
    font-size: 13px;
    font-weight: 400;
    line-height: 100%;
    ${(props) => (props.noWrap ? 'white-space: nowrap;' : '')}
`;

const BoldText = styled(Text)`
    font-weight: 600;
`;

const arrowRightStyle: CSSProperties = {
    width: 30,
    height: 30,
    marginTop: -1,
};

export default PageLinkBanner;
