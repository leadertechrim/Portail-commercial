import React, { useEffect, useState } from "react";

export default function ApiPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>API (dev)</h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
