import React from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { FlexDiv } from 'styles/common';
import { ThemeInterface } from 'types/ui';

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

const getDefaultStyle = (theme: ThemeInterface, width?: string, zIndex?: number) => ({
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        padding: '2px',
        background: theme.borderColor.tertiary,
        width: width ?? '720px',
        borderRadius: '15px',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'none',
        height: 'auto',
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

    return (
        <ReactModal
            isOpen={isOpen ?? true}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            style={getDefaultStyle(theme, width, zIndex)}
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
    @media (max-width: 575px) {
        padding: 15px;
    }
`;

export default Modal;
