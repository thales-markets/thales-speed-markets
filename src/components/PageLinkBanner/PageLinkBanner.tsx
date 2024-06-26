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
                    <Text $noWrap>
                        <Trans
                            i18nKey="common.banner.page-link.try"
                            components={{
                                bold: <BoldText />,
                            }}
                            values={{ value: t('common.thales-markets') }}
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
    background: ${(props) => props.theme.background.secondary};
    border-radius: 8px;
    padding: 5px;
    margin-bottom: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        height: 40px;
    }
`;

const Text = styled.span<{ $noWrap?: boolean }>`
    color: ${(props) => props.theme.button.textColor.secondary};
    text-align: center;
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    ${(props) => (props.$noWrap ? 'white-space: nowrap;' : '')}
`;

const BoldText = styled(Text)`
    font-weight: 900;
`;

const arrowRightStyle: CSSProperties = {
    width: 30,
    height: 30,
    marginTop: -1,
};

export default PageLinkBanner;
