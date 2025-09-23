import { useContext, useEffect, useState } from "react";
import { AppSetting } from "./App-setting";

export default function Conversations() {
  const { apiUrl, user } = useContext(AppSetting);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user._id) return; // only for authenticated users
    fetchList();
  }, [user]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/conversations`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json?.success) setList(json.conversations || []);
      else setError("Failed to fetch");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/conversations/${id}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json?.success) {
        // store in local storage for chat to pick up
        localStorage.setItem(
          "guest_conversation",
          JSON.stringify({ id, messages: json.conversation.messages }),
        );
        window.location.href = "/chat";
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete conversation?")) return;
    try {
      await fetch(`${apiUrl}/conversations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchList();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="container my-4">
      <h2>Conversations</h2>
      {loading && <p>Loading...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && list.length === 0 && <p>No conversations yet.</p>}
      <ul className="list-group">
        {list.map((c) => (
          <li
            key={c._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{c.title}</strong>
              <div className="text-muted small">
                {new Date(c.updatedAt).toLocaleString()}
              </div>
            </div>
            <div>
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={() => handleLoad(c._id)}
              >
                Load
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(c._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
