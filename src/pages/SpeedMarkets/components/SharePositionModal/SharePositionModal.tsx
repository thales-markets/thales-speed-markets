import {
    getDeafultToastOptions,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { LINKS } from 'constants/links';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { toPng } from 'html-to-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsMobile } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumnCentered } from 'styles/common';
import { isFirefox, isIos, isMetamask } from 'thales-utils';
import { SharePositionData } from 'types/flexCards';
import { RootState, ThemeInterface } from 'types/ui';
import ChainedSpeedMarketFlexCard from './components/ChainedSpeedMarketFlexCard';
import SpeedMarketFlexCard from './components/SpeedMarketFlexCard';

type SharePositionModalProps = SharePositionData & {
    onClose: () => void;
};

const PARLAY_IMAGE_NAME = 'ParlayImage.png';
const TWITTER_MESSAGE_PASTE = '%0A<PASTE YOUR IMAGE>';
const TWITTER_MESSAGE_UPLOAD = `%0A<UPLOAD YOUR ${PARLAY_IMAGE_NAME}>`;
const TWITTER_MESSAGE_CHECKOUT = `Check out my position on%0A`;

const SharePositionModal: React.FC<SharePositionModalProps> = ({
    type,
    positions,
    currencyKey,
    strikePrices,
    finalPrices,
    buyIn,
    payout,
    marketDuration,
    onClose,
}) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [isLoading, setIsLoading] = useState(false);
    const [toastId, setToastId] = useState<string | number>(0);
    const [isMetamaskBrowser, setIsMetamaskBrowser] = useState(false);

    const isChainedMarkets = ['chained-speed-won', 'chained-speed-loss'].includes(type);

    const ref = useRef<HTMLDivElement>(null);

    const customStyles = {
        content: {
            top: isMobile ? '45%' : '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '0px',
            background: 'transparent',
            border: 'none',
            borderRadius: '20px',
            overflow: 'visibile',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: '1501',
        },
    };

    useEffect(() => {
        const checkMetamaskBrowser = async () => {
            const isMMBrowser = (await isMetamask()) && isMobile;
            setIsMetamaskBrowser(isMMBrowser);
        };
        checkMetamaskBrowser().catch((e) => console.log(e));
    }, [isMobile]);

    // Download image mobile: clipboard.write is not supported by all browsers
    // Download image desktop: clipboard.write not supported/enabled in Firefox
    const useDownloadImage = isMobile || isFirefox();

    const saveImageAndOpenTwitter = useCallback(
        async (toastIdParam: string | number) => {
            if (!isLoading) {
                if (ref.current === null) {
                    return;
                }

                const IOS_DOWNLOAD_DELAY = 10 * 1000; // 10 seconds
                const MOBILE_TWITTER_TOAST_AUTO_CLOSE = 15 * 1000; // 15 seconds
                try {
                    // In order to improve image quality enlarge image by 2.
                    // Twitter is trying to fit into 504 x 510 with the same aspect ratio, so when image is smaller than 504 x 510, there is quality loss.
                    const aspectRatio = 2;
                    const canvasWidth = ref.current.clientWidth * aspectRatio;
                    const canvasHeight = ref.current.clientHeight * aspectRatio;

                    const base64Image = await toPng(ref.current, { canvasWidth, canvasHeight });

                    if (useDownloadImage) {
                        // Download image
                        const link = document.createElement('a');
                        link.href = base64Image;
                        link.download = PARLAY_IMAGE_NAME;
                        document.body.appendChild(link);
                        setTimeout(
                            () => {
                                link.click();
                            },
                            isIos() ? IOS_DOWNLOAD_DELAY : 0 // fix for iOS
                        );
                        setTimeout(
                            () => {
                                // Cleanup the DOM
                                document.body.removeChild(link);
                            },
                            isIos() ? 3 * IOS_DOWNLOAD_DELAY : 0 // fix for iOS
                        );
                    } else {
                        // Save to clipboard
                        const b64Blob = (await fetch(base64Image)).blob();
                        const cbi = new ClipboardItem({
                            'image/png': b64Blob,
                        });
                        await navigator.clipboard.write([cbi]); // not supported by FF
                    }

                    if (ref.current === null) {
                        return;
                    }

                    const twitterLinkWithStatusMessage =
                        LINKS.Twitter.TwitterTweetStatus +
                        TWITTER_MESSAGE_CHECKOUT +
                        (isChainedMarkets ? LINKS.Markets.ChainedSpeed : LINKS.Markets.Speed) +
                        (useDownloadImage ? TWITTER_MESSAGE_UPLOAD : TWITTER_MESSAGE_PASTE);

                    // Mobile requires user action in order to open new window, it can't open in async call, so adding <a>
                    isMobile
                        ? isIos()
                            ? setTimeout(() => {
                                  toast.update(
                                      toastIdParam,
                                      getSuccessToastOptions(
                                          '',
                                          toastIdParam,
                                          {
                                              autoClose: MOBILE_TWITTER_TOAST_AUTO_CLOSE,
                                          },
                                          <a onClick={() => window.open(twitterLinkWithStatusMessage)}>
                                              {t('common.flex-card.click-open-twitter')}
                                          </a>
                                      )
                                  );
                              }, IOS_DOWNLOAD_DELAY)
                            : toast.update(
                                  toastIdParam,
                                  getSuccessToastOptions(
                                      '',
                                      toastIdParam,
                                      { autoClose: MOBILE_TWITTER_TOAST_AUTO_CLOSE },
                                      <a onClick={() => window.open(twitterLinkWithStatusMessage)}>
                                          {t('common.flex-card.click-open-twitter')}
                                      </a>
                                  )
                              )
                        : toast.update(
                              toastIdParam,
                              getSuccessToastOptions(
                                  '',
                                  toastIdParam,
                                  undefined,
                                  <>
                                      {!useDownloadImage &&
                                          `${t('common.flex-card.image-in-clipboard')} ${t(
                                              'common.flex-card.open-twitter'
                                          )}`}
                                  </>
                              )
                          );

                    if (!isMobile) {
                        setTimeout(() => {
                            window.open(twitterLinkWithStatusMessage);
                        }, getDeafultToastOptions().autoClose);
                    }
                    onClose();
                } catch (e) {
                    console.log(e);
                    setIsLoading(false);
                    toast.update(
                        toastIdParam,
                        getErrorToastOptions(t('common.flex-card.save-image-error'), toastIdParam)
                    );
                }
            }
        },
        [isLoading, useDownloadImage, isMobile, t, onClose, isChainedMarkets]
    );

    const onTwitterShareClick = () => {
        if (!isLoading) {
            if (isMetamaskBrowser) {
                // Metamask dosn't support image download neither clipboard.write
                toast.error(t('market.toast-message.metamask-not-supported'), getDeafultToastOptions());
            } else {
                const id = toast.loading(
                    useDownloadImage ? t('common.flex-card.download-image') : t('common.flex-card.save-image'),
                    getLoadingToastOptions()
                );
                setToastId(id);
                setIsLoading(true);

                // If image creation is not postponed with timeout toaster is not displayed immediately, it is rendered in parallel with toPng() execution.
                // Function toPng is causing UI to freez for couple of seconds and there is no notification message during that time, so it confuses user.
                setTimeout(() => {
                    saveImageAndOpenTwitter(id);
                }, 300);
            }
        }
    };

    const onModalClose = () => {
        if (isLoading) {
            toast.update(toastId, getErrorToastOptions(t('common.flex-card.save-image-cancel'), toastId));
        }
        onClose();
    };

    const borderColor =
        type === 'speed-potential'
            ? theme.flexCard.background.potential
            : type === 'speed-won' || type === 'chained-speed-won'
            ? theme.flexCard.background.won
            : theme.flexCard.background.loss;

    const textColor =
        type === 'speed-potential'
            ? theme.flexCard.textColor.potential
            : type === 'speed-won' || type === 'chained-speed-won'
            ? theme.flexCard.textColor.won
            : theme.flexCard.background.loss;

    return (
        <ReactModal
            isOpen
            onRequestClose={onModalClose}
            shouldCloseOnOverlayClick={true}
            style={customStyles}
            contentElement={(props, children) => (
                <>
                    <div {...props}>{children}</div>
                    {isMobile && <CloseIcon $textColor={textColor} className={`icon icon--x-sign`} onClick={onClose} />}
                </>
            )}
        >
            <Container ref={ref}>
                {!isMobile && <CloseIcon $textColor={textColor} className={`icon icon--x-sign`} onClick={onClose} />}
                {isChainedMarkets ? (
                    <ChainedSpeedMarketFlexCard
                        type={type}
                        currencyKey={currencyKey}
                        positions={positions}
                        strikePrices={strikePrices}
                        finalPrices={finalPrices}
                        buyIn={buyIn}
                        payout={payout}
                    />
                ) : (
                    <SpeedMarketFlexCard
                        type={type}
                        currencyKey={currencyKey}
                        positions={positions}
                        strikePrices={strikePrices}
                        buyIn={buyIn}
                        payout={payout}
                        marketDuration={marketDuration}
                    />
                )}
                <TwitterShare disabled={isLoading} onClick={onTwitterShareClick} $borderColor={borderColor}>
                    <TwitterShareContent>
                        <TwitterIcon
                            className="icon-home icon-home--twitter-x"
                            disabled={isLoading}
                            $textColor={textColor}
                        />
                        <TwitterShareLabel $textColor={textColor}>{t('common.flex-card.share')}</TwitterShareLabel>
                    </TwitterShareContent>
                </TwitterShare>
            </Container>
        </ReactModal>
    );
};

// Aspect ratio is important for Twitter: horizontal 2:1 and vertical min 3:4
const Container = styled(FlexDivColumnCentered)`
    width: 383px;
    max-height: 510px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 357px;
        max-height: 476px;
    }
`;

const CloseIcon = styled.i<{ $textColor: string }>`
    position: absolute;
    top: -20px;
    right: -20px;
    font-size: 20px;
    cursor: pointer;
    color: ${(props) => props.$textColor};
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        top: 10px;
        right: 10px;
    }
`;

const TwitterShare = styled(FlexDivColumnCentered)<{ $borderColor: string; disabled?: boolean }>`
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    bottom: -80px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 55px;
    border-radius: 15px;
    padding: 2px;
    background: ${(props) => props.$borderColor};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
`;

const TwitterShareContent = styled(FlexDivCentered)`
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.button.background.primary};
    border-radius: 15px;
`;

const TwitterIcon = styled.i<{ $textColor: string; disabled?: boolean }>`
    font-size: 30px;
    color: ${(props) => props.$textColor};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.4' : '1')};
    margin-right: 10px;
`;

const TwitterShareLabel = styled.span<{ $textColor: string }>`
    font-weight: 800;
    font-size: 18px;
    line-height: 25px;
    text-transform: uppercase;
    color: ${(props) => props.$textColor};
`;

export default React.memo(SharePositionModal);
