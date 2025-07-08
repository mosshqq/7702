import { delegate, approve, transfer, metamaskTest, fluentTest } from "./viem";
import "./App.css";

function App() {

  return (
    <div className="App">
      <button onClick={fluentTest}>fluentTest</button>
      <button onClick={metamaskTest}>metamaskTest</button>
      <button onClick={delegate}>delegate</button>
      <button onClick={approve}>approve</button>
      <button onClick={transfer}>transfer</button>
    </div>
  );
}

export default App;
