"use client"; // pages/index.js

import { useState } from "react";
import MazeGame from "./components/MazeGame"; // MazeGameコンポーネントをインポート

export default function Home() {
  const [amount, setAmount] = useState(""); // 数量の状態
  const [output, setOutput] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // メッセージの状態
  const [remainder, setRemainder] = useState(null); // 余りの状態
  const [bonus, setBonus] = useState(null); // ボーナスの状態
  const [result, setResult] = useState(null); // 結果の状態
  const [resultMessage, setResultMessage] = useState(""); // 結果メッセージ
  const [showMaze, setShowMaze] = useState(false); // 迷路ゲームを表示するかどうか
  const [gameStarted, setGameStarted] = useState(false); // ゲームが開始されたかどうか

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    // 数値に変換
    const numericAmount = parseFloat(value);

    if (!isNaN(numericAmount)) {
      if (numericAmount < 0.3) {
        setMessage(`当選確率は ${Math.floor(numericAmount * 100)} ％です。`);
      } else {
        setMessage("当選確率は30％です（上限が30％です）");
      }

      // ボーナスの計算（100倍し、上限30）
      const calculatedBonus = Math.min(Math.floor(numericAmount * 100), 30);
      setBonus(calculatedBonus);
    } else {
      setMessage("有効な数値を入力してください。");
      setBonus(null);
    }
  };

  const handleButtonClick = () => {
    console.log("amount", amount);
    setLoading(true);
    setOutput(""); // 前回の出力をクリア
    setReceipt(null); // 前回の receipt をクリア
    setRemainder(null); // 余りの状態をクリア
    setResult(null); // 結果の状態をクリア
    setResultMessage(""); // 結果メッセージをクリア

    // 迷路ゲームを表示
    setShowMaze(true);
    setGameStarted(true); // ゲームを開始状態にする
  };

  // 迷路ゲームが終了した際に呼び出されるコールバック
  const handleGameEnd = (success) => {
    setLoading(false);
    setShowMaze(false);
    setGameStarted(false); // ゲーム終了後にリセット
    if (success) {
      setResultMessage("おめでとうございます、ゲームに勝ちました！");
    } else {
      setResultMessage("残念ながら、ゲームに失敗しました。");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Token Transfer Dashboard</h1>
      <div style={styles.inputContainer}>
        <label htmlFor="amount" style={styles.label}>
          Amount:
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={handleAmountChange}
          style={styles.input}
          placeholder="Enter amount"
        />
      </div>
      <button onClick={handleButtonClick} disabled={loading || gameStarted} style={styles.button}>
        {loading ? "Running..." : "Run Script"}
      </button>
      <pre style={styles.output}>{output}</pre>
      {message && (
        <div style={styles.messageContainer}>
          <p style={styles.message}>{message}</p>
        </div>
      )}
      {showMaze && <MazeGame onGameEnd={handleGameEnd} />} {/* 迷路ゲームが表示される */}
      {resultMessage && (
        <div style={styles.resultMessageContainer}>
          <p style={styles.resultMessage}>{resultMessage}</p>
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
  inputContainer: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ddd",
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
  output: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ddd",
    marginBottom: "20px",
    whiteSpace: "pre-wrap",
  },
  messageContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  message: {
    fontSize: "16px",
    color: "#333",
  },
  resultMessageContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  resultMessage: {
    fontSize: "16px",
    color: "#007BFF",
    fontWeight: "bold",
  },
};
