import "./App.css";
import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { chain } from "./constants";

function App() {
  const [txSenderPK, setTxSenderPK] = useState<`0x${string}`>();
  const [to, setTo] = useState<`0x${string}`>();
  const [hash, setHash] = useState<string>();
  const [data, setData] = useState<`0x${string}`>();
  const [authorizationList, setAuthorizationList] = useState<
    {
      eoaPK: `0x${string}` | "";
      delegatedTo: `0x${string}` | "";
      chainId: number | `0x${string}` | 0;
      data: `0x${string}` | "";
    }[]
  >([{ eoaPK: "", delegatedTo: "", chainId: 0, data: "0x" }]);
  const handleTxSenderPK = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxSenderPK(e.target.value as `0x${string}`);
  };
  const handleEoaPK = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setAuthorizationList(
      authorizationList.map((item, i) => {
        if (i === index) {
          return { ...item, eoaPK: e.target.value as `0x${string}` };
        }
        return item;
      })
    );
  };
  const handleDelegatedTo = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setAuthorizationList(
      authorizationList.map((item, i) => {
        if (i === index) {
          return { ...item, delegatedTo: e.target.value as `0x${string}` };
        }
        return item;
      })
    );
  };
  const handleChainId = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setAuthorizationList(
      authorizationList.map((item, i) => {
        if (i === index) {
          return { ...item, chainId: e.target.value as `0x${string}` };
        }
        return item;
      })
    );
  };
  const handleData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(e.target.value as `0x${string}`);
  };
  const handleTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTo(e.target.value as `0x${string}`);
  };
  const delegate = async () => {
    if (!txSenderPK) {
      alert("请输入txSenderPK");
      return;
    }
    const relay = privateKeyToAccount(txSenderPK);
    const walletClient = createWalletClient({
      account: relay,
      chain,
      transport: http(),
    });
    const list = authorizationList
      .filter((item) => !!item.eoaPK && !!item.delegatedTo)
      .map(async (item) => {
        const eoa = privateKeyToAccount(item.eoaPK as `0x${string}`);
        const authorization = await walletClient.signAuthorization({
          contractAddress: item.delegatedTo as `0x${string}`,
          account: eoa,
          chainId: Number(item.chainId) || 0,
        });
        return authorization;
      });
    if (list.length === 0) {
      alert("无可用授权");
      return;
    }

    const hash = await walletClient.sendTransaction({
      authorizationList: await Promise.all(list),
      to: to,
      data: data,
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
            1.
            pk字段需要填写私钥（0x开头），项目不保存，但是为了安全请使用测试账户的私钥
          </p>
          <p>
            2. delegate 后如果希望eoa仍然可以被转账，需要delegated
            to支持receive方法，可以使用0x96ee5ac72ab76d4fbf7207d000c0d95835c24579合约
          </p>
          <p>
            3. 如果tx sender 和
            eoa使用同一个账户，会出现nonce错误，没有进行处理，方便进行异常case测试
          </p>
          <p>4. 如果chain id不为0/71，会出现chain id不匹配的报错，同3</p>
          <p>
            5. delegate后，如果想要调用eoa的方法，可以去scan上通过delegated
            code页面进行调用，这里不额外提供
          </p>
          <p>
            6. 一次授权多个时，如果eoa的pk相同，多次授权交易nonce会重复，导致只有其中一笔授权交易成功
          </p>
        </div>
      </div>
      <div style={{ marginTop: "20px", padding: "10px" }}>
        <h3>Form</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>tx sender pk</label>
          <input style={{ flex: 1 }} type="text" onChange={handleTxSenderPK} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>data(可选)</label>
          <input
            style={{ flex: 1 }}
            type="text"
            onChange={handleData}
            defaultValue="0x"
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>to</label>
          <input
            style={{ flex: 1 }}
            type="text"
            onChange={handleTo}
            defaultValue="0x"
          />
        </div>
        <h3>
          <span>authorizationList</span>
          <button
            style={{ marginLeft: "10px", cursor: "pointer" }}
            onClick={() =>
              setAuthorizationList([
                ...authorizationList,
                { eoaPK: "", delegatedTo: "", chainId: 0, data: "0x" },
              ])
            }
          >
            add
          </button>
        </h3>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexDirection: "column",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          {authorizationList.map((item, index) => (
            <div key={index} style={{ borderBottom: "1px solid #ccc" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <label>eoa pk</label>
                <input
                  style={{ flex: 1 }}
                  type="text"
                  onChange={(e) => handleEoaPK(e, index)}
                  value={item.eoaPK}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label>delegated to</label>
                <input
                  style={{ flex: 1 }}
                  type="text"
                  onChange={(e) => handleDelegatedTo(e, index)}
                  value={item.delegatedTo}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <label>chain id(可选)</label>
                <input
                  style={{ flex: 1 }}
                  type="number"
                  onChange={(e) => handleChainId(e, index)}
                  value={item.chainId}
                />
              </div>
            </div>
          ))}
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
