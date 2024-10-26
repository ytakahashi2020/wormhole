// components/MazeGame.js
import { useState, useEffect } from "react";

export default function MazeGame({ onGameEnd }) {
  const gridSize = 15; // グリッドのサイズ (15x15)
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const goalPosition = { x: gridSize - 1, y: gridSize - 1 }; // ゴールの位置
  const [gameMessage, setGameMessage] = useState("矢印キーで動かしてゴールを目指してください！");
  const [gameOver, setGameOver] = useState(false);
  const [enemies, setEnemies] = useState(generateEnemies(2)); // 敵を3体生成
  const [timeLeft, setTimeLeft] = useState(30); // 制限時間 (30秒)

  useEffect(() => {
    // キーイベントの設定
    const handleKeyDown = (e) => {
      if (gameOver) return;

      setPlayerPosition((prevPosition) => {
        let newPosition = { ...prevPosition };

        switch (e.key) {
          case "ArrowUp":
            if (prevPosition.y > 0) newPosition.y -= 1;
            break;
          case "ArrowDown":
            if (prevPosition.y < gridSize - 1) newPosition.y += 1;
            break;
          case "ArrowLeft":
            if (prevPosition.x > 0) newPosition.x -= 1;
            break;
          case "ArrowRight":
            if (prevPosition.x < gridSize - 1) newPosition.x += 1;
            break;
          default:
            return prevPosition;
        }

        // ゴールに到達したかどうかチェック
        if (newPosition.x === goalPosition.x && newPosition.y === goalPosition.y) {
          setGameMessage("おめでとうございます！ゴールに到達しました！");
          setGameOver(true);
          onGameEnd(true); // ゴールに到達したら成功とみなす
        }

        // 敵と衝突したかどうかチェック
        if (checkCollisionWithEnemies(newPosition, enemies)) {
          setGameMessage("ゲームオーバー！敵に当たりました。");
          setGameOver(true);
          onGameEnd(false); // 敵に当たったら失敗とみなす
        }

        return newPosition;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    // 敵を動かすためのインターバルを設定
    const enemyMovementInterval = setInterval(moveEnemies, 1000);

    // カウントダウンのインターバルを設定
    const countdownInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setGameMessage("時間切れ！ゲームオーバー！");
          setGameOver(true);
          onGameEnd(false); // 時間切れでゲームオーバー
          clearInterval(countdownInterval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // クリーンアップ
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(enemyMovementInterval);
      clearInterval(countdownInterval);
    };
  }, [gameOver, enemies]);

  // 敵をランダムに移動させる関数
  const moveEnemies = () => {
    if (gameOver) return;

    setEnemies((prevEnemies) =>
      prevEnemies.map((enemy) => {
        const directions = [
          { x: 0, y: -1 }, // 上
          { x: 0, y: 1 }, // 下
          { x: -1, y: 0 }, // 左
          { x: 1, y: 0 }, // 右
        ];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const newEnemyPosition = {
          x: Math.min(Math.max(enemy.x + randomDirection.x, 0), gridSize - 1),
          y: Math.min(Math.max(enemy.y + randomDirection.y, 0), gridSize - 1),
        };

        // プレイヤーと衝突したかどうかチェック
        if (newEnemyPosition.x === playerPosition.x && newEnemyPosition.y === playerPosition.y) {
          setGameMessage("ゲームオーバー！敵に当たりました。");
          setGameOver(true);
          onGameEnd(false);
        }

        return newEnemyPosition;
      }),
    );
  };

  // 敵を生成する関数
  function generateEnemies(num) {
    const enemies = [];
    while (enemies.length < num) {
      const enemyPosition = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      // プレイヤーやゴールと被らない位置に敵を配置
      if (
        (enemyPosition.x !== 0 || enemyPosition.y !== 0) &&
        (enemyPosition.x !== goalPosition.x || enemyPosition.y !== goalPosition.y)
      ) {
        enemies.push(enemyPosition);
      }
    }
    return enemies;
  }

  // 敵と衝突したかどうかをチェックする関数
  function checkCollisionWithEnemies(position, enemies) {
    return enemies.some((enemy) => enemy.x === position.x && enemy.y === position.y);
  }

  // グリッドの生成
  const renderGrid = () => {
    const rows = [];
    for (let y = 0; y < gridSize; y++) {
      const cells = [];
      for (let x = 0; x < gridSize; x++) {
        let cellContent = "";
        if (playerPosition.x === x && playerPosition.y === y) {
          cellContent = "👾"; // プレイヤー
        } else if (goalPosition.x === x && goalPosition.y === y) {
          cellContent = "🏁"; // ゴール
        } else if (enemies.some((enemy) => enemy.x === x && enemy.y === y)) {
          cellContent = "👹"; // 敵
        }
        cells.push(
          <td
            key={`${x}-${y}`}
            style={{
              width: "30px",
              height: "30px",
              border: "1px solid black",
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "20px",
            }}
          >
            {cellContent}
          </td>,
        );
      }
      rows.push(<tr key={y}>{cells}</tr>);
    }
    return rows;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>迷路ゲーム</h2>
      <p>{gameMessage}</p>
      <p>残り時間: {timeLeft} 秒</p> {/* 残り時間の表示 */}
      <table
        style={{
          margin: "0 auto",
          borderCollapse: "collapse",
        }}
      >
        <tbody>{renderGrid()}</tbody>
      </table>
    </div>
  );
}
