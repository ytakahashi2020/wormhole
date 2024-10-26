"use client"; // pages/index.js

import { useState } from "react";

export default function Home() {
  const [output, setOutput] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async () => {
    setLoading(true);
    setOutput(""); // 前回の出力をクリア
    setReceipt(null); // 前回の receipt をクリア
    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Yuki", message: "Hello, World!" }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.message);

        // receipt が存在する場合、状態に設定
        if (data.receipt) {
          setReceipt(data.receipt);
        }
      } else {
        const errorData = await response.json();
        setOutput(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Token Transfer Dashboard</h1>
      <button onClick={handleButtonClick} disabled={loading} style={styles.button}>
        {loading ? "Running..." : "Run Script"}
      </button>
      <pre style={styles.output}>{output}</pre>
      {receipt && (
        <div style={styles.receiptContainer}>
          <h3 style={styles.subTitle}>Receipt Details:</h3>
          <div style={styles.info}>
            <strong>From:</strong> {receipt.from}
          </div>
          <div style={styles.info}>
            <strong>To:</strong> {receipt.to}
          </div>
          <h4 style={styles.subTitle}>Origin Transactions:</h4>
          {receipt.originTxs.map((tx, index) => (
            <div key={index} style={styles.transaction}>
              <strong>Chain:</strong> {tx.chain}, <strong>TxID:</strong> {tx.txid}
            </div>
          ))}
          <h4 style={styles.subTitle}>Destination Transactions:</h4>
          {receipt.destinationTxs.map((tx, index) => (
            <div key={index} style={styles.transaction}>
              <strong>Chain:</strong> {tx.chain}, <strong>TxID:</strong> {tx.txid}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// スタイリングのオブジェクト
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Arial', sans-serif",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "20px",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  output: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ddd",
    marginBottom: "20px",
    whiteSpace: "pre-wrap",
  },
  receiptContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "15px",
    border: "1px solid #ddd",
    marginTop: "20px",
  },
  subTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "5px",
  },
  info: {
    marginBottom: "10px",
  },
  transaction: {
    padding: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    marginBottom: "10px",
    fontSize: "14px",
  },
};
