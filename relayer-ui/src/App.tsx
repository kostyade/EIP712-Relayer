import "./App.css";
import { createClient, WagmiConfig } from "wagmi";
import {
  ConnectKitButton,
  ConnectKitProvider,
  getDefaultClient,
} from "connectkit";
import { localhost } from "wagmi/chains";
import { SignDataButton } from "./components/signDataButton/signDataButton";

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
          <div className="app-container">
            <SignDataButton/>
          </div>
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default App;
