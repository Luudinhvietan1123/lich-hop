"use client";
import { useState } from "react";

export default function CancelButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    if (!confirm("Are you sure you want to cancel this meeting?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        location.reload();
      } else {
        alert("Cancel failed");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" onClick={onClick} disabled={loading} className={`btn-neon ${loading ? "btn-loading" : ""}`}>
      {loading ? <span className="spinner"></span> : null}
      Cancel
    </button>
  );
}



