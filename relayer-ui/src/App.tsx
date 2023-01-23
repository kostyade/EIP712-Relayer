import "./App.css";
import { createClient, WagmiConfig } from "wagmi";
import {
  ConnectKitButton,
  ConnectKitProvider,
  getDefaultClient,
} from "connectkit";
import { localhost } from "wagmi/chains";
import { DepositContainer } from "./components/depositContainer/depositContainer";

const client = createClient(
  getDefaultClient({
    appName: "Relayer UI",
    chains: [localhost],
  })
);

function App() {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="retro">
        <div className="App">
          <header className="app-header">
            <h1>Relayer Demo</h1>
            <div>
              <ConnectKitButton />
            </div>
          </header>
          <DepositContainer />
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default App;
