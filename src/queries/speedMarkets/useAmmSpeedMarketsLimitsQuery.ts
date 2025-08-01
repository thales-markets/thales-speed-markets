import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import {
    MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE,
    MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE,
    SIDE_TO_POSITION_MAP,
} from 'constants/market';
import { TBD_ADDRESS, ZERO_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { bigNumberFormatter, coinFormatter, Coins } from 'thales-utils';
import { AmmSpeedMarketsLimits } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getCollateralAddress, getCollateralIndexForNetwork } from 'utils/currency';
import { getContract, stringToHex } from 'viem';

const useAmmSpeedMarketsLimitsQuery = (
    queryConfig: QueryConfig,
    walletAddress?: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AmmSpeedMarketsLimits>({
        queryKey: QUERY_KEYS.Markets.SpeedMarketsLimits(queryConfig.networkId, walletAddress),
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
                bonusPerCollateral: {
                    DAI: 0,
                    USDCe: 0,
                    USDbC: 0,
                    USDC: 0,
                    USDT: 0,
                    OP: 0,
                    WETH: 0,
                    ETH: 0,
                    ARB: 0,
                    THALES: 0,
                    sTHALES: 0,
                    OVER: 0,
                    cbBTC: 0,
                    wBTC: 0,
                },
            };

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContractAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const definedCollaterals = Object.keys(ammSpeedMarketsLimits.bonusPerCollateral).filter(
                    (collateral) => {
                        const address = getCollateralAddress(
                            queryConfig.networkId,
                            getCollateralIndexForNetwork(queryConfig.networkId, collateral as Coins)
                        );
                        return !!address && address !== TBD_ADDRESS;
                    }
                );
                const collateralAddresses = definedCollaterals.map((collateral) =>
                    getCollateralAddress(
                        queryConfig.networkId,
                        getCollateralIndexForNetwork(queryConfig.networkId, collateral as Coins)
                    )
                );

                const [
                    ammParams,
                    riskForETH,
                    riskForBTC,
                    directionalRiskForETH,
                    directionalRiskForBTC,
                    bonuses,
                ] = await Promise.all([
                    speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([walletAddress || ZERO_ADDRESS]),
                    speedMarketsDataContractLocal.read.getRiskPerAsset([
                        stringToHex(CRYPTO_CURRENCY_MAP.ETH, { size: 32 }),
                    ]),
                    speedMarketsDataContractLocal.read.getRiskPerAsset([
                        stringToHex(CRYPTO_CURRENCY_MAP.BTC, { size: 32 }),
                    ]),
                    speedMarketsDataContractLocal.read.getDirectionalRiskPerAsset([
                        stringToHex(CRYPTO_CURRENCY_MAP.ETH, { size: 32 }),
                    ]),
                    speedMarketsDataContractLocal.read.getDirectionalRiskPerAsset([
                        stringToHex(CRYPTO_CURRENCY_MAP.BTC, { size: 32 }),
                    ]),
                    speedMarketsDataContractLocal.read.getBonusesPerCollateral([collateralAddresses]),
                ]);

                ammSpeedMarketsLimits.minBuyinAmount =
                    coinFormatter(ammParams.minBuyinAmount, queryConfig.networkId) /
                    (1 - MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE);
                ammSpeedMarketsLimits.maxBuyinAmount =
                    coinFormatter(ammParams.maxBuyinAmount, queryConfig.networkId) /
                    (1 + MAX_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE);
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
                ammSpeedMarketsLimits.timeThresholdsForFees = ammParams.timeThresholdsForFees.map((time: bigint) =>
                    Number(time)
                );
                ammSpeedMarketsLimits.lpFees = ammParams.lpFees.map((lpFee: bigint) => bigNumberFormatter(lpFee));
                ammSpeedMarketsLimits.defaultLPFee = bigNumberFormatter(ammParams.lpFee);
                ammSpeedMarketsLimits.maxSkewImpact = bigNumberFormatter(ammParams.maxSkewImpact);
                ammSpeedMarketsLimits.safeBoxImpact = bigNumberFormatter(ammParams.safeBoxImpact);
                ammSpeedMarketsLimits.whitelistedAddress = ammParams.isAddressWhitelisted;

                definedCollaterals.forEach((collateral, i) => {
                    ammSpeedMarketsLimits.bonusPerCollateral[collateral as Coins] = bigNumberFormatter(bonuses[i]);
                });
            } catch (e) {
                console.log(e);
            }

            return ammSpeedMarketsLimits;
        },
        ...options,
    });
};

export default useAmmSpeedMarketsLimitsQuery;
