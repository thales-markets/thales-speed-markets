import { ScreenSizeBreakpoint } from 'enums/ui';
import React from 'react';
import ReactModal from 'react-modal';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { RootState, ThemeInterface } from 'types/ui';

ReactModal.setAppElement('#root');

type ModalProps = {
    title: string;
    isOpen?: boolean;
    shouldCloseOnOverlayClick?: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    width?: string;
    zIndex?: number;
};

const getDefaultStyle = (theme: ThemeInterface, width?: string, zIndex?: number, isMobile?: boolean) => ({
    content: {
        top: isMobile ? '0' : '50%',
        left: isMobile ? '0' : '50%',
        right: 'auto',
        bottom: 'auto',
        padding: '2px',
        background: isMobile ? theme.background.primary : theme.borderColor.tertiary,
        width: isMobile ? 'auto' : width ?? '720px',
        maxWidth: '100%',
        borderRadius: isMobile ? '0' : '15px',
        marginRight: '-50%',
        transform: isMobile ? '' : 'translate(-50%, -50%)',
        overflow: 'none',
        height: isMobile ? '100%' : 'auto',
        border: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: zIndex ?? 200,
        backdropFilter: 'blur(10px)',
    },
});

const Modal: React.FC<ModalProps> = ({
    title,
    onClose,
    children,
    shouldCloseOnOverlayClick,
    isOpen,
    width,
    zIndex,
}) => {
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <ReactModal
            isOpen={isOpen ?? true}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            style={getDefaultStyle(theme, width, zIndex, isMobile)}
        >
            <Container>
                <PrimaryHeading>{title}</PrimaryHeading>
                <CloseIconContainer>
                    <CloseIcon onClick={onClose} />
                </CloseIconContainer>
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div`
    border-radius: 15px;
    background: ${(props) => props.theme.background.primary};
    padding: 20px;
    max-height: 100vh;
    height: fit-content;
`;

const PrimaryHeading = styled.h1`
    padding-top: 10px;
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 20px;
    color: ${(props) => props.theme.textColor.primary};
    text-align: center;
`;

const CloseIconContainer = styled(FlexDiv)`
    position: absolute;
    top: 20px;
    right: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        top: 14px;
        right: 14px;
    }
`;

const CloseIcon = styled.i`
    font-size: 16px;
    margin-top: 1px;
    cursor: pointer;

    &:before {
        font-family: Icons !important;
        content: '\\0076';
        color: ${(props) => props.theme.textColor.quinary};
    }
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        font-size: 14px;
    }
`;

export default Modal;
