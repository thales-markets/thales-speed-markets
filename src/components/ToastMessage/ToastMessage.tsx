import { secondsToMilliseconds } from 'date-fns';
import { ScreenSizeBreakpoint } from 'enums/ui';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastOptions, ToastPosition, TypeOptions, toast } from 'react-toastify';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRowCentered } from 'styles/common';

type ToastMessageProps = { id?: string | number; type: TypeOptions; message: string; custom?: ReactNode };

const ToastMessage: React.FC<ToastMessageProps> = ({ id, type, message, custom }) => {
    const { t } = useTranslation();

    const isDefaultType = type === 'default';
    const title = !isDefaultType ? t('common.status.' + type) : '';

    return (
        <Container hasTitle={!!title}>
            {!isDefaultType && <Icon className={`icon icon--${type}`} />}
            <FlexDivColumn>
                {title && <Title>{title}</Title>}
                {custom ? <>{custom}</> : <Message isLargeFont={!title}>{message}</Message>}
            </FlexDivColumn>
            {id !== undefined && <CloseIcon className="icon icon--x-sign" onClick={() => toast.dismiss(id)} />}
        </Container>
    );
};

const Container = styled(FlexDivRowCentered)<{ hasTitle: boolean }>`
    color: ${(props) => props.theme.toastMessages.error.textColor.primary};
    ${(props) => (props.hasTitle ? 'margin-top: -6px;' : '')}
`;

const Icon = styled.i`
    color: ${(props) => props.theme.toastMessages.error.textColor.primary};
    font-size: 34px;
    font-weight: 800;
    margin-right: 12px;
`;

const Title = styled.span`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 800;
    font-size: 18px;
    line-height: 24px;
    text-transform: uppercase;
`;

const Message = styled.span<{ isLargeFont?: boolean }>`
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 500;
    font-size: ${(props) => (props.isLargeFont ? '18px' : '13px')};
    @media (max-width: ${ScreenSizeBreakpoint.EXTRA_SMALL}px) {
        line-height: ${(props) => (props.isLargeFont ? '18px' : '13px')};
    }
`;

const CloseIcon = styled.i`
    position: absolute;
    top: 12px;
    right: 15px;
    font-size: 12px;
    line-height: 12px;
    cursor: pointer;
    color: ${(props) => props.theme.toastMessages.error.textColor.primary};
`;

const toastBasicProperties = {
    position: 'top-right' as ToastPosition,
    autoClose: secondsToMilliseconds(7),
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    progress: undefined,
    isLoading: false,
    closeButton: false,
};

export const getSuccessToastOptions = (
    message: string,
    id: string | number,
    options?: ToastOptions,
    customElement?: ReactNode
) => {
    return {
        ...{ ...toastBasicProperties, ...options },
        toastId: id,
        className: 'success',
        progressClassName: 'success',
        render: <ToastMessage id={id} type={'success'} message={message} custom={customElement} />, // not relevant on ToastOptions, only on UpdateOptions
    };
};

export const getInfoToastOptions = (message: string, id: string | number) => {
    return {
        ...toastBasicProperties,
        toastId: id,
        className: 'info',
        progressClassName: 'info',
        render: <ToastMessage id={id} type={'info'} message={message} />, // not relevant on ToastOptions, only on UpdateOptions
    };
};

export const getErrorToastOptions = (message: string, id: string | number) => {
    return {
        ...toastBasicProperties,
        toastId: id,
        className: 'error',
        progressClassName: 'error',
        render: <ToastMessage id={id} type={'error'} message={message} />, // not relevant on ToastOptions, only on UpdateOptions
    };
};

export const getLoadingToastOptions = () => {
    return {
        ...toastBasicProperties,
        isLoading: true,
        className: 'info',
    };
};

export const getDeafultToastOptions = () => {
    return {
        ...toastBasicProperties,
    };
};

export const getDefaultToastContent = (message: string) => {
    return <ToastMessage type="default" message={message} />;
};

export default ToastMessage;
