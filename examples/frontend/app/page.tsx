"use client"; // pages/index.js

import { useState, useEffect } from "react";
import MazeGame from "./components/MazeGame"; // MazeGameコンポーネントをインポート
import styles from "./styles/Home.module.css";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
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

  // クライアントサイドでのみ実行される部分のセットアップ
  useEffect(() => {
    setIsClient(true); // クライアントサイドであることを設定
  }, []);

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

  const handleButtonClick = async () => {
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

    // トランザクションの処理を非同期で実行
    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amt: amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.message);

        // receipt が存在する場合、状態に設定
        if (data.receipt) {
          setReceipt(data.receipt);

          // TxID の値を10進数に変換し、100で割った余りを計算
          if (data.receipt.destinationTxs && data.receipt.destinationTxs.length > 0) {
            const txIdHex = data.receipt.destinationTxs[0].txid;
            const txIdBigInt = BigInt(txIdHex); // 16進数をBigIntに変換
            const remainderValue = txIdBigInt % BigInt(100); // 100で割った余り
            setRemainder(Number(remainderValue)); // 結果を数値として保存

            console.log("Number(remainderValue)", Number(remainderValue));
            console.log("bonus", bonus);

            // ゲームの結果に応じてボーナスを加えて結果を計算
            if (!gameStarted) {
              calculateResult(Number(remainderValue), bonus, 5);
            }
          }
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

  // 結果を計算する関数
  const calculateResult = (remainderValue, bonusValue, gameWinBonus) => {
    const calculatedResult = remainderValue + (bonusValue || 0) + gameWinBonus;
    setResult(calculatedResult);

    // トランザクション完了時のみ結果メッセージを表示
    if (!gameStarted) {
      if (calculatedResult >= 100) {
        setResultMessage("おめでとうございます、当選です");
      } else {
        setResultMessage("残念です");
      }
    }
  };

  // 迷路ゲームが終了した際に呼び出されるコールバック
  const handleGameEnd = (success) => {
    setTimeout(() => {
      // setLoading(false);
      setShowMaze(false);
      setGameStarted(false); // ゲーム終了後にリセット

      if (success) {
        console.log("ゲームに勝ちました。ゲーム勝利ボーナス：5を加えます");
        calculateResult(remainder, bonus, 5); // 勝利ボーナスを直接渡す
      } else {
        setResultMessage("残念ながら、ゲームに失敗しました。");
        calculateResult(remainder, bonus, 0); // ボーナスなしで再計算
      }
    }, 0); // 次のレンダリングサイクルまで遅延させる
  };

  // クライアントサイドでのみ表示する内容
  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Token Transfer Dashboard</h1>
      <div className={styles.inputContainer}>
        <label htmlFor="amount" className={styles.label}>
          Amount:
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={handleAmountChange}
          className={styles.input}
          placeholder="Enter amount"
        />
      </div>
      <button
        onClick={handleButtonClick}
        disabled={loading || gameStarted}
        className={styles.button}
      >
        {loading ? "Running..." : "Run Script"}
      </button>
      {loading && (
        <div>
          <div className={styles.spinner}></div>
          <p className={styles.loadingMessage}>現在実行をしています...</p>
        </div>
      )}
      <pre className={styles.output}>{output}</pre>
      {message && (
        <div className={styles.messageContainer}>
          <p className={styles.message}>{message}</p>
        </div>
      )}
      {showMaze && <MazeGame onGameEnd={handleGameEnd} />} {/* 迷路ゲームが表示される */}
      {remainder !== null && (
        <div className={styles.resultContainer}>
          <p className={styles.result}>TxIDの余りは: {remainder}</p>
          <p className={styles.result}>ボーナスを加えた結果: {result}</p>
        </div>
      )}
      {resultMessage &&
        !gameStarted && ( // ゲームが終了した後のみ表示
          <div className={styles.resultMessageContainer}>
            <p className={styles.resultMessage}>{resultMessage}</p>
          </div>
        )}
      {receipt && (
        <div className={styles.receiptContainer}>
          <h3 className={styles.subTitle}>Receipt Details:</h3>
          <div className={styles.info}>
            <strong>From:</strong> {receipt.from}
          </div>
          <div className={styles.info}>
            <strong>To:</strong> {receipt.to}
          </div>
          <h4 className={styles.subTitle}>Origin Transactions:</h4>
          {receipt.originTxs.map((tx, index) => (
            <div key={index} className={styles.transaction}>
              <strong>Chain:</strong> {tx.chain}, <strong>TxID:</strong> {tx.txid}
            </div>
          ))}
          <h4 className={styles.subTitle}>Destination Transactions:</h4>
          {receipt.destinationTxs.map((tx, index) => (
            <div key={index} className={styles.transaction}>
              <strong>Chain:</strong> {tx.chain}, <strong>TxID:</strong> {tx.txid}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// // スタイリングのオブジェクト
// const styles = {
//   container: {
//     maxWidth: "800px",
//     margin: "0 auto",
//     padding: "20px",
//     backgroundColor: "#f0f0f0",
//     borderRadius: "8px",
//     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//     fontFamily: "'Arial', sans-serif",
//   },
//   title: {
//     fontSize: "24px",
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: "20px",
//   },
//   inputContainer: {
//     marginBottom: "20px",
//   },
//   label: {
//     display: "block",
//     marginBottom: "8px",
//     fontWeight: "bold",
//   },
//   input: {
//     width: "100%",
//     padding: "8px",
//     fontSize: "16px",
//     borderRadius: "4px",
//     border: "1px solid #ddd",
//   },
//   button: {
//     display: "block",
//     width: "100%",
//     padding: "10px",
//     backgroundColor: "#4CAF50",
//     color: "#fff",
//     border: "none",
//     borderRadius: "4px",
//     fontSize: "16px",
//     cursor: "pointer",
//     marginBottom: "20px",
//     transition: "background-color 0.3s",
//   },
//   output: {
//     backgroundColor: "#ffffff",
//     borderRadius: "4px",
//     padding: "10px",
//     fontSize: "14px",
//     border: "1px solid #ddd",
//     marginBottom: "20px",
//     whiteSpace: "pre-wrap",
//   },
//   messageContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: "4px",
//     padding: "10px",
//     marginBottom: "20px",
//     border: "1px solid #ddd",
//   },
//   message: {
//     fontSize: "16px",
//     color: "#333",
//   },
//   resultContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: "4px",
//     padding: "10px",
//     marginBottom: "20px",
//     border: "1px solid #ddd",
//   },
//   result: {
//     fontSize: "16px",
//     color: "#333",
//   },
//   resultMessageContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: "4px",
//     padding: "10px",
//     marginBottom: "20px",
//     border: "1px solid #ddd",
//   },
//   resultMessage: {
//     fontSize: "16px",
//     color: "#007BFF",
//     fontWeight: "bold",
//   },
//   receiptContainer: {
//     backgroundColor: "#ffffff",
//     borderRadius: "8px",
//     padding: "15px",
//     border: "1px solid #ddd",
//     marginTop: "20px",
//   },
//   subTitle: {
//     fontSize: "18px",
//     fontWeight: "bold",
//     marginBottom: "10px",
//     borderBottom: "1px solid #ddd",
//     paddingBottom: "5px",
//   },
//   info: {
//     marginBottom: "10px",
//   },
//   transaction: {
//     padding: "8px",
//     backgroundColor: "#e9ecef",
//     borderRadius: "4px",
//     marginBottom: "10px",
//     fontSize: "14px",
//   },
// };
