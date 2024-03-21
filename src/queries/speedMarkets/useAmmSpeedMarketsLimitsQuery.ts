import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber, ethers } from 'ethers';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { AmmSpeedMarketsLimits } from 'types/market';
import { getContract } from 'viem';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';

const MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER = 10;

const useAmmSpeedMarketsLimitsQuery = (
    queryConfig: QueryConfig,
    walletAddress?: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AmmSpeedMarketsLimits>({
        queryKey: QUERY_KEYS.Markets.SpeedMarketsLimits(queryConfig, walletAddress),
        queryFn: async () => {
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
            // const { speedMarketsDataContract } = snxJSConnector;
            const speedMarketsDataContractLocal = getContract({
                abi: speedMarketsDataContract.abi,
                address: speedMarketsDataContract.addresses[queryConfig.networkId] as any,
                client: queryConfig.client,
            }) as ViemContract;

            const [
                ammParams,
                riskForETH,
                riskForBTC,
                directionalRiskForETH,
                directionalRiskForBTC,
            ] = await Promise.all([
                speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([walletAddress || ZERO_ADDRESS]),
                speedMarketsDataContractLocal.read.getRiskPerAsset([
                    ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.ETH),
                ]),
                speedMarketsDataContractLocal.read.getRiskPerAsset([
                    ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.BTC),
                ]),
                speedMarketsDataContractLocal.read.getDirectionalRiskPerAsset([
                    ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.ETH),
                ]),
                speedMarketsDataContractLocal.read.getDirectionalRiskPerAsset([
                    ethers.utils.formatBytes32String(CRYPTO_CURRENCY_MAP.BTC),
                ]),
            ]);

            ammSpeedMarketsLimits.minBuyinAmount = Math.ceil(
                coinFormatter(ammParams.minBuyinAmount, queryConfig.networkId)
            );
            ammSpeedMarketsLimits.maxBuyinAmount =
                coinFormatter(ammParams.maxBuyinAmount, queryConfig.networkId) - MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER;
            ammSpeedMarketsLimits.minimalTimeToMaturity = Number(ammParams.minimalTimeToMaturity);
            ammSpeedMarketsLimits.maximalTimeToMaturity = Number(ammParams.maximalTimeToMaturity);
            ammSpeedMarketsLimits.maxPriceDelaySec = Number(ammParams.maximumPriceDelay);
            ammSpeedMarketsLimits.maxPriceDelayForResolvingSec = Number(ammParams.maximumPriceDelayForResolving);
            ammSpeedMarketsLimits.risksPerAsset = [
                {
                    currency: CRYPTO_CURRENCY_MAP.ETH,
                    current: coinFormatter(riskForETH.current, queryConfig.networkId),
                    max: coinFormatter(riskForETH.max, queryConfig.networkId),
                },
                {
                    currency: CRYPTO_CURRENCY_MAP.BTC,
                    current: coinFormatter(riskForBTC.current, queryConfig.networkId),
                    max: coinFormatter(riskForBTC.max, queryConfig.networkId),
                },
            ];
            directionalRiskForETH.map((risk: any) => {
                ammSpeedMarketsLimits.risksPerAssetAndDirection.push({
                    currency: CRYPTO_CURRENCY_MAP.ETH,
                    position: SIDE_TO_POSITION_MAP[risk.direction],
                    current: coinFormatter(risk.current, queryConfig.networkId),
                    max: coinFormatter(risk.max, queryConfig.networkId),
                });
            });
            directionalRiskForBTC.map((risk: any) => {
                ammSpeedMarketsLimits.risksPerAssetAndDirection.push({
                    currency: CRYPTO_CURRENCY_MAP.BTC,
                    position: SIDE_TO_POSITION_MAP[risk.direction],
                    current: coinFormatter(risk.current, queryConfig.networkId),
                    max: coinFormatter(risk.max, queryConfig.networkId),
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

            return ammSpeedMarketsLimits;
        },
        ...options,
    });
};

export default useAmmSpeedMarketsLimitsQuery;
