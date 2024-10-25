"use client"; // pages/index.js

import { useState } from "react";

export default function Home() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      // const response = await fetch("/api/run-script", {
      //   method: "GET",
      // });
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
    <div>
      <button onClick={handleButtonClick} disabled={loading}>
        {loading ? "Running..." : "Run Script"}
      </button>
      <pre>{output}</pre>
    </div>
  );
}
