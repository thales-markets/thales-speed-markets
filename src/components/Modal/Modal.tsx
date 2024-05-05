import React from 'react';
import ReactModal from 'react-modal';
import styled from 'styled-components';
import { FlexDiv, FlexDivRow } from 'styles/common';

type ModalProps = {
    title: string;
    shouldCloseOnOverlayClick?: boolean;
    onClose: () => void;
    children?: React.ReactNode;
};

ReactModal.setAppElement('#root');

const defaultCustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        overflow: 'none',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 20000,
        backdropFilter: 'blur(10px)',
    },
};

const Modal: React.FC<ModalProps> = ({ title, onClose, children, shouldCloseOnOverlayClick }) => {
    return (
        <ReactModal
            isOpen
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            style={defaultCustomStyles}
        >
            <Container>
                <Header>
                    <Title>{title}</Title>
                    <FlexDivRow>{<CloseIcon className="icon icon--x-sign" onClick={onClose} />}</FlexDivRow>
                </Header>
                {children}
            </Container>
        </ReactModal>
    );
};

const Container = styled.div`
    border: 2px solid ${(props) => props.theme.borderColor.secondary};
    background: ${(props) => props.theme.background.primary};
    padding: 20px;
    border-radius: 8px;
    max-height: 100vh;
    height: fit-content;
`;

const Header = styled(FlexDivRow)`
    margin-bottom: 20px;
`;

const Title = styled(FlexDiv)`
    font-weight: bold;
    font-size: 18px;
    line-height: 110%;
    color: ${(props) => props.theme.textColor.secondary};
    text-align: center;
`;

const CloseIcon = styled.i`
    font-family: Icons !important;
    font-size: 16px;
    line-height: 16px;
    cursor: pointer;
    color: ${(props) => props.theme.textColor.secondary};
`;

export default Modal;
