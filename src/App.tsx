import { RootState } from "types/ui";
import { useDispatch, useSelector } from "react-redux";
import { getNetworkId, getSwitchToNetworkId } from "redux/modules/wallet";
import { useAccount } from "wagmi";
import { Suspense, useEffect } from "react";
import { Router, Route, Routes } from "react-router-dom";
import ROUTES from "constants/routes";
import Loader from "components/Loader";

const App = () => {
  const dispatch = useDispatch();
  const networkId = useSelector((state: RootState) => getNetworkId(state));
  const switchedToNetworkId = useSelector((state: RootState) => getSwitchToNetworkId(state));

  const { address } = useAccount();

  return (
    <Routes>
      <Route path={ROUTES.Options.SpeedMarkets}>
        <Suspense fallback={<Loader />}>
          <DappLayout>
            <SpeedMarkets />
          </DappLayout>
        </Suspense>
      </Route>
    </Routes>
  );
};

export default App;
