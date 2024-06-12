import { ScreenSizeBreakpoint } from 'enums/ui';
import { Banner, useBannersQuery } from 'queries/banners/useBannersQuery';
import React, { useMemo } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styled from 'styled-components';
import { useChainId } from 'wagmi';

const BannerCarousel: React.FC = () => {
    const networkId = useChainId();

    const bannersQuery = useBannersQuery(networkId);

    const banners: Banner[] = useMemo(() => {
        return bannersQuery.isSuccess && bannersQuery.data ? bannersQuery.data : [];
    }, [bannersQuery.isSuccess, bannersQuery.data]);

    return (
        <Container>
            {banners.length > 0 && (
                <Carousel
                    transitionTime={1000}
                    interval={10000}
                    showStatus={false}
                    showArrows={false}
                    showThumbs={false}
                    infiniteLoop={true}
                    dynamicHeight={true}
                    autoPlay={true}
                    onClickItem={(index) => {
                        if (banners[index].url !== '') {
                            window.open(banners[index].url);
                        }
                    }}
                >
                    {banners.map((banner: Banner) => (
                        <StyledDiv key={banner.image} hasHref={banner.url !== ''} image={banner.image} />
                    ))}
                </Carousel>
            )}
        </Container>
    );
};

const Container = styled.div`
    position: relative;
    max-width: 100%;
    height: 130px;
    overflow: hidden;
    border: 1px solid ${(props) => props.theme.borderColor.quaternary};
    border-radius: 11px;
    margin: 0 0 20px 0;
    z-index: 0;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        display: none;
    }
`;

const StyledDiv = styled.div<{ image: string; hasHref: boolean }>`
    max-width: 100%;
    height: 130px;
    background-image: ${(props) => `url(${props.image})`};
    cursor: ${(props) => (props.hasHref ? 'pointer' : 'default')};
    background-position: center;
`;

export default BannerCarousel;
