import "./App.css";
import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { chain } from "./constants";

function App() {
  const [txSenderPK, setTxSenderPK] = useState<`0x${string}`>();
  const [eoaPK, setEoaPK] = useState<`0x${string}`>();
  const [delegatedTo, setDelegatedTo] = useState<`0x${string}`>();
  const [chainId, setChainId] = useState<number>();
  const [hash, setHash] = useState<string>();
  const handleTxSenderPK = (e: any) => {
    setTxSenderPK(e.target.value as `0x${string}`);
  };
  const handleEoaPK = (e: any) => {
    setEoaPK(e.target.value as `0x${string}`);
  };
  const handleDelegatedTo = (e: any) => {
    setDelegatedTo(e.target.value as `0x${string}`);
  };
  const handleChainId = (e: any) => {
    setChainId(e.target.value as number);
  };
  const delegate = async () => {
    if (!txSenderPK || !eoaPK) {
      alert("请输入txSenderPK和eoaPK");
      return;
    }
    const relay = privateKeyToAccount(txSenderPK);
    const eoa = privateKeyToAccount(eoaPK);
    const walletClient = createWalletClient({
      account: relay,
      chain,
      transport: http(),
    });
    const authorization = await walletClient.signAuthorization({
      contractAddress: delegatedTo,
      account: eoa,
      chainId: Number(chainId) || 0,
    });

    const hash = await walletClient.sendTransaction({
      authorizationList: [authorization],
      to: eoa.address,
    });
    setHash(hash);
    return hash;
  };
  return (
    <div className="App">
      <div>
        <h1>TIPS</h1>
        <div>
          <p style={{ color: "red" }}>
            1. pk字段需要填写私钥，项目不保存，但是为了安全请使用测试账户的私钥
          </p>
          <p>
            2. delegate 后如果希望eoa仍然可以被转账，需要delegated
            to支持receive方法，可以使用0x96ee5ac72ab76d4fbf7207d000c0d95835c24579合约
          </p>
          <p>
            3. 如果tx sender 和
            eoa使用同一个账户，会出现nonce错误，没有进行处理，方便进行异常case测试
          </p>
          <p>4. 如果chain id不为0/71，会出现chain id不匹配的报错，同2</p>
          <p>
            5. delegate后，如果想要调用eoa的方法，可以去scan上通过delegated
            code页面进行调用，这里不额外提供
          </p>
        </div>
      </div>
      <div
        style={{ marginTop: "20px", border: "1px solid #000", padding: "10px" }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <label>tx sender pk</label>
          <input style={{ flex: 1 }} type="text" onChange={handleTxSenderPK} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>eoa pk</label>
          <input style={{ flex: 1 }} type="text" onChange={handleEoaPK} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>delegated to</label>
          <input style={{ flex: 1 }} type="text" onChange={handleDelegatedTo} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>chain id(可选)</label>
          <input
            style={{ flex: 1 }}
            type="number"
            onChange={handleChainId}
            defaultValue={0}
          />
        </div>
        <button onClick={delegate}>delegate</button>
      </div>
      {hash && (
        <div>
          <p>
            <a
              href={`https://evmtestnet-stage.confluxscan.net/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {hash}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
