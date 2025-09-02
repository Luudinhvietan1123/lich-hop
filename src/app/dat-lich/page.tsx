"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { formatISO } from "date-fns";
import { addMinutes, format } from "date-fns";
import { toDate } from "date-fns-tz";
import Link from "next/link";

const schema = z.object({
  ten: z.string().min(1, "Required"),
  viTri: z.string().min(1, "Required"),
  congTyHoacDuAn: z.string().min(1, "Required"),
  lienKetX: z.string().url().optional().or(z.literal("")),
  email: z.string().email(),
  loiNhan: z.string().optional().or(z.literal("")),
  ngay: z.string().min(1, "Select a date"),
  gioBatDau: z.string().min(1, "Select start time"),
  gioKetThuc: z.string().min(1, "Select end time"),
  mucTieuCongTy: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function DatLichPage() {
  const [dangGui, setDangGui] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (duLieu: FormData) => {
    setDangGui(true);
    try {
      const batDauISO = formatISO(new Date(`${duLieu.ngay}T${duLieu.gioBatDau}`));
      const ketThucISO = formatISO(new Date(`${duLieu.ngay}T${duLieu.gioKetThuc}`));
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ten: duLieu.ten,
          viTri: duLieu.viTri,
          congTyHoacDuAn: duLieu.congTyHoacDuAn,
          lienKetX: duLieu.lienKetX || undefined,
          email: duLieu.email,
          loiNhan: duLieu.loiNhan || undefined,
          batDauISO,
          ketThucISO,
          mucTieuCongTy: duLieu.mucTieuCongTy,
          timezone: chonTimezone,
        }),
      });
      if (!res.ok) {
        let thongBao = "Khong the tao lich";
        try {
          const err = await res.json();
          thongBao = typeof err?.error === "string" ? err.error : JSON.stringify(err?.error || err);
        } catch {
          thongBao = await res.text();
        }
        throw new Error(thongBao);
      }
      const data = await res.json();
      window.location.href = `/success?id=${encodeURIComponent(data.id)}`;
    } catch (e) {
      alert(`Could not create event: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setDangGui(false);
    }
  };

  // Auto tính giờ kết thúc theo duration
  const gioBatDau = watch("gioBatDau");
  const ngay = watch("ngay");
  const [duration, setDuration] = useState(30);
  const [chonTimezone, setChonTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";
    } catch {
      return "Asia/Ho_Chi_Minh";
    }
  });
  useEffect(() => {
    if (!ngay || !gioBatDau) return;
    const start = toDate(new Date(`${ngay}T${gioBatDau}`), { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    const end = addMinutes(start, duration);
    setValue("gioKetThuc", format(end, "HH:mm"));
  }, [gioBatDau, ngay, duration, setValue]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold title-neon">Schedule a meeting</h2>
        <div className="flex gap-2">
          <Link href="/" className="btn-neon">Back to home</Link>
          <Link href="/dashboard" className="btn-neon">Dashboard</Link>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">Enter information and schedule</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="input-neon" {...register("ten")} />
            {errors.ten && <p className="text-red-600 text-sm">{errors.ten.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Title/Role</label>
            <input className="input-neon" {...register("viTri")} />
            {errors.viTri && <p className="text-red-600 text-sm">{errors.viTri.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Company/Project</label>
            <input className="input-neon" {...register("congTyHoacDuAn")} />
            {errors.congTyHoacDuAn && <p className="text-red-600 text-sm">{errors.congTyHoacDuAn.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">X link (optional)</label>
            <input className="input-neon" placeholder="https://x.com/..." {...register("lienKetX")} />
            {errors.lienKetX && <p className="text-red-600 text-sm">{errors.lienKetX.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input-neon" type="email" {...register("email")} />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Message (optional)</label>
            <input className="input-neon" {...register("loiNhan")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input className="input-neon" type="date" {...register("ngay")} />
            {errors.ngay && <p className="text-red-600 text-sm">{errors.ngay.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Start time</label>
            <input className="input-neon" type="time" {...register("gioBatDau")} />
            {errors.gioBatDau && <p className="text-red-600 text-sm">{errors.gioBatDau.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">End time</label>
            <input className="input-neon" type="time" {...register("gioKetThuc")} />
            {errors.gioKetThuc && <p className="text-red-600 text-sm">{errors.gioKetThuc.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Timezone</label>
          <select className="select-neon" value={chonTimezone} onChange={(e) => setChonTimezone(e.target.value)}>
            {(() => {
              const zones = (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf("timeZone") : ["Asia/Ho_Chi_Minh", "Asia/Bangkok", "Asia/Tokyo", "Europe/London", "America/New_York"];
              return zones.map((z: string) => <option key={z} value={z}>{z}</option>);
            })()}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Duration:</span>
          {[30, 45, 60].map((m) => (
            <button
              key={m}
              type="button"
              className={`px-3 py-1 rounded border transition-colors ${duration === m ? "bg-[var(--primary)] text-black" : "bg-[#1a1a1a] text-[var(--foreground)]"}`}
              onClick={() => setDuration(m)}
            >
              {m}’
            </button>
          ))}
          <span className="text-xs text-gray-500 ml-2">End time auto-updates</span>
        </div>

        {/* Removed target company field as requested */}

        <button disabled={dangGui} className={`btn-neon ${dangGui ? "btn-loading" : ""}`}>
          {dangGui ? <span className="spinner"></span> : null}
          {dangGui ? "Creating..." : "Create event"}
        </button>
      </form>
    </div>
  );
}


