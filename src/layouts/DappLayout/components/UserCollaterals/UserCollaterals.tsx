import OutsideClickHandler from 'components/OutsideClick';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getSelectedCollateralIndex, getIsBiconomy, setSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivRow } from 'styles/common';
import { Coins, formatCurrencyWithKey } from 'thales-utils';
import { RootState } from 'types/ui';
import {
    getAssetIcon,
    getCoinBalance,
    getCollateral,
    getCollateralIndexForNetwork,
    getCollaterals,
    getMinBalanceThreshold,
    getPositiveCollateralIndexByBalance,
} from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { useAccount, useChainId, useClient } from 'wagmi';
import biconomyConnector from 'utils/biconomyWallet';

const UserCollaterals: React.FC = () => {
    const dispatch = useDispatch();
    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));
    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const userSelectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        { networkId, client },
        {
            enabled: isAppReady && isConnected,
        }
    );

    const multipleCollateralBalancesData =
        multipleCollateralBalances.isSuccess && multipleCollateralBalances.data
            ? multipleCollateralBalances.data
            : null;

    const collateralsWithBalance = useMemo(
        () =>
            getCollaterals(networkId).map((collateral) => ({
                name: collateral,
                balance: getCoinBalance(multipleCollateralBalancesData, collateral),
            })),
        [networkId, multipleCollateralBalancesData]
    );

    const currentCollateral = getCollateral(networkId, userSelectedCollateralIndex);
    const currentCollateralBalance = collateralsWithBalance.find((col) => col.name === currentCollateral)?.balance || 0;
    const currentCollateralWithBalance = { name: currentCollateral, balance: currentCollateralBalance };

    const defaultCollateral =
        isMultiCollateralSupported && currentCollateralBalance <= getMinBalanceThreshold(currentCollateral)
            ? multipleCollateralBalances?.data
                ? collateralsWithBalance.find(
                      (col) =>
                          col.name ===
                          getCollateral(
                              networkId,
                              getPositiveCollateralIndexByBalance(multipleCollateralBalances.data, networkId)
                          )
                  ) || currentCollateralWithBalance
                : currentCollateralWithBalance
            : currentCollateralWithBalance;

    const [collateral, setCollateral] = useState(defaultCollateral);

    useEffect(() => {
        if (
            isMultiCollateralSupported &&
            multipleCollateralBalances?.data &&
            currentCollateralBalance <= getMinBalanceThreshold(currentCollateral)
        ) {
            const collateralIndexWithPositiveBalance = getPositiveCollateralIndexByBalance(
                multipleCollateralBalances.data,
                networkId
            );
            const positiveCollateral = collateralsWithBalance.find(
                (el) => el.name === getCollateral(networkId, collateralIndexWithPositiveBalance)
            );

            if (positiveCollateral) {
                setCollateral(positiveCollateral);
                dispatch(setSelectedCollateralIndex(getCollateralIndexForNetwork(networkId, positiveCollateral.name)));
            }
        }
    }, [
        multipleCollateralBalances.data,
        dispatch,
        isMultiCollateralSupported,
        networkId,
        collateralsWithBalance,
        currentCollateral,
        currentCollateralBalance,
    ]);

    useEffect(() => {
        if (!isMultiCollateralSupported) {
            dispatch(setSelectedCollateralIndex(0));
        }
    }, [dispatch, isMultiCollateralSupported, networkId]);

    useEffect(() => {
        const selectedCollateral =
            collateralsWithBalance.find((el) => el.name === getCollateral(networkId, userSelectedCollateralIndex)) ||
            collateralsWithBalance[0];
        setCollateral(selectedCollateral);
    }, [userSelectedCollateralIndex, networkId, collateralsWithBalance]);

    const onCollateralClickHandler = (coinType: Coins) => {
        dispatch(setSelectedCollateralIndex(getCollateralIndexForNetwork(networkId, coinType)));
        setIsDropdownOpen(false);
    };

    const assetIcon = (type: string) => {
        const AssetIconElement = getAssetIcon(type as Coins);
        return <AssetIconElement style={AssetIconStyle} />;
    };

    return (
        <Container>
            <OutsideClickHandler onOutsideClick={() => isDropdownOpen && setIsDropdownOpen(false)}>
                <Wrapper>
                    <SwapWrapper
                        $clickable={isConnected && isMultiCollateralSupported}
                        onClick={() =>
                            isConnected &&
                            (isMultiCollateralSupported
                                ? setIsDropdownOpen(!isDropdownOpen)
                                : onCollateralClickHandler(collateral.name))
                        }
                    >
                        <BalanceText>{formatCurrencyWithKey(collateral.name, collateral.balance, 2)}</BalanceText>

                        {isConnected && isMultiCollateralSupported && (
                            <Icon className={isDropdownOpen ? `icon icon--caret-up` : `icon icon--caret-down`} />
                        )}
                    </SwapWrapper>
                    {isDropdownOpen && (
                        <Dropdown>
                            {collateralsWithBalance.map((coin, index) => (
                                <BalanceWrapper
                                    key={index}
                                    $clickable={isConnected}
                                    onClick={() => onCollateralClickHandler(coin.name)}
                                >
                                    {assetIcon(coin.name)}

                                    <BalanceText>{formatCurrencyWithKey(coin.name, coin.balance)}</BalanceText>
                                </BalanceWrapper>
                            ))}
                        </Dropdown>
                    )}
                </Wrapper>
            </OutsideClickHandler>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
`;

const Wrapper = styled(FlexDivRow)`
    position: relative;
    display: flex;

    @media (max-width: 500px) {
        min-width: 124px;
        width: 100%;
    }
`;

const SwapWrapper = styled.div<{ $clickable: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    width: 120px;
    height: 12px;
    cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
`;

const Dropdown = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 30px;
    right: 0;
    background-color: ${(props) => props.theme.background.secondary};
    border-radius: 8px;
    width: 150px;
    padding: 5px;
    text-align: center;
    z-index: 101;
    gap: 5px;
    @media (max-width: 500px) {
        min-width: 124px;
        width: 100%;
    }
`;

const BalanceWrapper = styled.div<{ $clickable: boolean }>`
    display: -webkit-flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    padding: 6px;
    cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
    border-radius: 8px;
    &:hover {
        background: ${(props) => props.theme.background.primary};
    }
`;

const BalanceText = styled.span`
    color: ${(props) => props.theme.textColor.quinary};
    font-family: ${(props) => props.theme.fontFamily.secondary};
    font-weight: 700;
    font-size: 12px;
`;

const AssetIconStyle = { width: '16px', height: '16px', marginRight: '5px' };

const Icon = styled.i`
    font-size: 10px;
    color: ${(props) => props.theme.textColor.quinary};
`;

export default UserCollaterals;
