import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber, ethers } from 'ethers';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, bigNumberFormatter, coinFormatter } from 'thales-utils';
import { AmmSpeedMarketsLimits } from 'types/market';
import snxJSConnector from 'utils/snxJSConnector';

const MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER = 10;

const useAmmSpeedMarketsLimitsQuery = (
    networkId: NetworkId,
    walletAddress?: string,
    options?: UseQueryOptions<AmmSpeedMarketsLimits>
) => {
    return useQuery<AmmSpeedMarketsLimits>(
        QUERY_KEYS.Markets.SpeedMarketsLimits(networkId, walletAddress),
        async () => {
            const ammSpeedMarketsLimits: AmmSpeedMarketsLimits = {
                minBuyinAmount: 0,
                maxBuyinAmount: 0,
                minimalTimeToMaturity: 0,
                maximalTimeToMaturity: 0,
                maxPriceDelaySec: 0,
                maxPriceDelayForResolvingSec: 0,
                risksPerAsset: [],
                risksPerAssetAndDirection: [],
                timeThresholdsForFees: [],
                lpFees: [],
                defaultLPFee: 0,
                maxSkewImpact: 0,
                safeBoxImpact: 0,
                whitelistedAddress: false,
            };
            const { speedMarketsDataContract } = snxJSConnector;
            if (speedMarketsDataContract) {
                const [
                    ammParams,
                    riskForETH,
                    riskForBTC,
                    directionalRiskForETH,
                    directionalRiskForBTC,
                ] = await Promise.all([
                    speedMarketsDataContract.getSpeedMarketsAMMParameters(walletAddress || ZERO_ADDRESS),
                    speedMarketsDataContract.getRiskPerAsset(ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.ETH)),
                    speedMarketsDataContract.getRiskPerAsset(ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.BTC)),
                    speedMarketsDataContract.getDirectionalRiskPerAsset(
                        ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.ETH)
                    ),
                    speedMarketsDataContract.getDirectionalRiskPerAsset(
                        ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.BTC)
                    ),
                ]);

                ammSpeedMarketsLimits.minBuyinAmount = Math.ceil(coinFormatter(ammParams.minBuyinAmount, networkId));
                ammSpeedMarketsLimits.maxBuyinAmount =
                    coinFormatter(ammParams.maxBuyinAmount, networkId) - MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER;
                ammSpeedMarketsLimits.minimalTimeToMaturity = Number(ammParams.minimalTimeToMaturity);
                ammSpeedMarketsLimits.maximalTimeToMaturity = Number(ammParams.maximalTimeToMaturity);
                ammSpeedMarketsLimits.maxPriceDelaySec = Number(ammParams.maximumPriceDelay);
                ammSpeedMarketsLimits.maxPriceDelayForResolvingSec = Number(ammParams.maximumPriceDelayForResolving);
                ammSpeedMarketsLimits.risksPerAsset = [
                    {
                        currency: CRYPTO_CURRENCY_MAP.ETH,
                        current: coinFormatter(riskForETH.current, networkId),
                        max: coinFormatter(riskForETH.max, networkId),
                    },
                    {
                        currency: CRYPTO_CURRENCY_MAP.BTC,
                        current: coinFormatter(riskForBTC.current, networkId),
                        max: coinFormatter(riskForBTC.max, networkId),
                    },
                ];
                directionalRiskForETH.map((risk: any) => {
                    ammSpeedMarketsLimits.risksPerAssetAndDirection.push({
                        currency: CRYPTO_CURRENCY_MAP.ETH,
                        position: SIDE_TO_POSITION_MAP[risk.direction],
                        current: coinFormatter(risk.current, networkId),
                        max: coinFormatter(risk.max, networkId),
                    });
                });
                directionalRiskForBTC.map((risk: any) => {
                    ammSpeedMarketsLimits.risksPerAssetAndDirection.push({
                        currency: CRYPTO_CURRENCY_MAP.BTC,
                        position: SIDE_TO_POSITION_MAP[risk.direction],
                        current: coinFormatter(risk.current, networkId),
                        max: coinFormatter(risk.max, networkId),
                    });
                });
                ammSpeedMarketsLimits.timeThresholdsForFees = ammParams.timeThresholdsForFees.map((time: BigNumber) =>
                    Number(time)
                );
                ammSpeedMarketsLimits.lpFees = ammParams.lpFees.map((lpFee: BigNumber) => bigNumberFormatter(lpFee));
                ammSpeedMarketsLimits.defaultLPFee = bigNumberFormatter(ammParams.lpFee);
                ammSpeedMarketsLimits.maxSkewImpact = bigNumberFormatter(ammParams.maxSkewImpact);
                ammSpeedMarketsLimits.safeBoxImpact = bigNumberFormatter(ammParams.safeBoxImpact);
                ammSpeedMarketsLimits.whitelistedAddress = ammParams.isAddressWhitelisted;
            }

            return ammSpeedMarketsLimits;
        },
        {
            ...options,
        }
    );
};

export default useAmmSpeedMarketsLimitsQuery;
