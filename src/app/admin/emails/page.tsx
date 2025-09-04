"use client";
import { useEffect, useState } from "react";

type Bang = { congTy: string; danhSachEmail: string[] }[];

export default function QuanTriEmails() {
  const [bang, setBang] = useState<Bang>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/emails");
      const data = await res.json();
      setBang(data);
      setDangTai(false);
    })();
  }, []);

  const themDong = () => setBang((b) => [...b, { congTy: "", danhSachEmail: [] }]);
  const capNhatCongTy = (i: number, v: string) => setBang((b) => b.map((r, idx) => idx === i ? { ...r, congTy: v } : r));
  const capNhatEmails = (i: number, v: string) => setBang((b) => b.map((r, idx) => idx === i ? { ...r, danhSachEmail: v.split(/[,\s]+/).filter(Boolean) } : r));
  const xoaDong = (i: number) => setBang((b) => b.filter((_, idx) => idx !== i));

  const luu = async () => {
    setDangLuu(true);
    try {
      const res = await fetch("/api/admin/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bang) });
      if (!res.ok) throw new Error(await res.text());
      alert("Đã lưu");
    } catch {
      alert("Lưu thất bại");
    } finally {
      setDangLuu(false);
    }
  };

  if (dangTai) return <div className="p-6">Đang tải...</div>;
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-lg font-semibold mb-4">Quản trị danh sách email theo công ty</h2>
      <div className="space-y-3">
        {bang.map((row, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <input className="border rounded p-2" placeholder="Tên công ty" value={row.congTy} onChange={(e) => capNhatCongTy(i, e.target.value)} />
            <input className="border rounded p-2 sm:col-span-2" placeholder="Email1, Email2,..." defaultValue={row.danhSachEmail.join(", ")} onChange={(e) => capNhatEmails(i, e.target.value)} />
            <button className="text-sm text-red-600" onClick={() => xoaDong(i)}>Xoá</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 rounded bg-gray-200" onClick={themDong}>Thêm dòng</button>
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={luu} disabled={dangLuu}>{dangLuu ? "Đang lưu..." : "Lưu"}</button>
      </div>
    </div>
  );
}



