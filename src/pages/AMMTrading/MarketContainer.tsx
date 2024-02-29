import Loader from 'components/Loader';
import ROUTES from 'constants/routes';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import binaryOptionMarketContract from 'utils/contracts/binaryOptionsMarketContract';
import { navigateTo } from 'utils/routes';
import snxJSConnector from 'utils/snxJSConnector';
import Market from './Market';
import { BOMContractProvider } from './contexts/BOMContractContext';

type MarketContainerProps = RouteComponentProps<{
    marketAddress: string;
}>;

const MarketContainer: React.FC<MarketContainerProps> = (props) => {
    const [BOMContract, setBOMContract] = useState<ethers.Contract>();
    const [isRangedMarket, setIsRangedMarket] = useState<boolean>(false);

    useEffect(() => {
        const { params } = props.match;

        if (!params.marketAddress) {
            navigateTo(ROUTES.Options.Home);
        }

        let contract: ethers.Contract | undefined = undefined;

        setIsRangedMarket(false);
        contract = new ethers.Contract(
            params?.marketAddress,
            binaryOptionMarketContract.abi,
            (snxJSConnector as any).provider
        );

        contract.resolvedAddress
            .then(() => {
                setBOMContract(contract);
            })
            .catch(() => {
                navigateTo(ROUTES.Options.Home);
            });
    }, [props.match, props.location.pathname]);

    return BOMContract ? (
        <BOMContractProvider contract={BOMContract}>
            <Market marketAddress={props.match.params.marketAddress} isRangedMarket={isRangedMarket} />
        </BOMContractProvider>
    ) : (
        <Loader />
    );
};

export default MarketContainer;
