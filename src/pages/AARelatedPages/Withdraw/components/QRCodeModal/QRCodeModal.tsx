import Modal from 'components/Modal';
import React from 'react';
import QRCode from 'react-qr-code';
import { useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDiv } from 'styles/common';
import { RootState } from 'types/ui';

type QRCodeModalProps = {
    onClose: () => void;
    walletAddress: string;
    title: string;
};

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose, walletAddress, title }) => {
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    return (
        <Modal width={isMobile ? '100%' : undefined} title={title} onClose={() => onClose()}>
            <Wrapper>
                <QRCode value={walletAddress || ''} style={{ padding: '10px', background: 'white' }} />
            </Wrapper>
        </Modal>
    );
};

const Wrapper = styled(FlexDiv)`
    width: 100%;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
`;

export default QRCodeModal;
