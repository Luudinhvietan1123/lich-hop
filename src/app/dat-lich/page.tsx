"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatISO } from "date-fns";
import { addMinutes, format } from "date-fns";
import { toDate } from "date-fns-tz";
import Link from "next/link";
import Image from "next/image";

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
        try { const err = await res.json(); thongBao = typeof err?.error === "string" ? err.error : JSON.stringify(err?.error || err); }
        catch { thongBao = await res.text(); }
        throw new Error(thongBao);
      }
      const data = await res.json();
      window.location.href = `/success?id=${encodeURIComponent(data.id)}`;
    } catch (e) {
      alert(`Could not create event: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally { setDangGui(false); }
  };

  // Auto tính giờ kết thúc theo duration
  const gioBatDau = watch("gioBatDau");
  const ngay = watch("ngay");
  const [duration, setDuration] = useState(30);
  const [chonTimezone, setChonTimezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh"; }
    catch { return "Asia/Ho_Chi_Minh"; }
  });
  useEffect(() => {
    try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (tz && tz !== chonTimezone) setChonTimezone(tz); } catch {}
  }, []);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(id); }, []);

  // Slots 30'
  const danhSachSlot = (() => { const slots: string[] = []; for (let m = 8*60; m <= 22*60+30; m+=30){const h=(m/60|0).toString().padStart(2,"0"); const mm=(m%60).toString().padStart(2,"0"); slots.push(`${h}:${mm}`);} return slots; })();
  const slotsRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ const base = watch("ngay") || new Date().toISOString().slice(0,10); const idx = danhSachSlot.findIndex(s => toDate(new Date(`${base}T${s}`), { timeZone: chonTimezone }) > now); if(idx>=0 && slotsRef.current){ const row=44; const top=Math.max(0,(idx-1)*row); slotsRef.current.scrollTo({top}); } },[watch("ngay"),chonTimezone,now]);

  // Calendar month state
  const [thangDangChon, setThangDangChon] = useState(() => { const d=new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const ngayDangChon = watch("ngay");
  const chonNgay = (d: Date) => { setValue("ngay", d.toISOString().slice(0,10)); };
  const daysOfWeek = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const monthLabel = useMemo(()=> thangDangChon.toLocaleString(undefined,{month:"long",year:"numeric"}),[thangDangChon]);
  const gridDays = useMemo(()=>{ const y=thangDangChon.getFullYear(); const m=thangDangChon.getMonth(); const first=new Date(y,m,1); const last=new Date(y,m+1,0); const dow=(first.getDay()+6)%7; const days:(Date|null)[]=[]; for(let i=0;i<dow;i++) days.push(null); for(let d=1; d<=last.getDate(); d++) days.push(new Date(y,m,d)); return days; },[thangDangChon]);
  const startOfToday = useMemo(()=>{ const t=new Date(now); t.setHours(0,0,0,0); return t; },[now]);
  useEffect(()=>{ if(!ngay||!gioBatDau) return; const start=toDate(new Date(`${ngay}T${gioBatDau}`),{timeZone: chonTimezone}); const end=addMinutes(start,duration); setValue("gioKetThuc", format(end,"HH:mm")); },[gioBatDau,ngay,duration,chonTimezone,setValue]);

  // Helpers for safe local date handling with yyyy-MM-dd
  const parseLocalYmd = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const ymdFromDateLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const da = d.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${da}`;
  };
  const localTodayYmd = () => ymdFromDateLocal(new Date());

  // Get YYYY-MM-DD string of given date in specific timezone
  const ymdInTz = (date: Date, tz: string) => {
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    // en-CA returns YYYY-MM-DD
    return fmt.format(date);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10 lg:py-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold title-neon">Schedule a meeting</h2>
        <div className="flex gap-2">
          <Link href="/" className="btn-neon">Back to home</Link>
          <Link href="/dashboard" className="btn-neon">Dashboard</Link>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4">Enter information and schedule</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 flex flex-col items-center text-center">
            <label className="block text-sm mb-1">Select a date</label>
            <div className="rounded border p-3 w-full" style={{ background: '#111' }}>
              <div className="flex items-center justify-between mb-3">
                <button type="button" className="btn-neon" onClick={() => setThangDangChon(new Date(thangDangChon.getFullYear(), thangDangChon.getMonth() - 1, 1))}>{"<"}</button>
                <div className="font-medium">{monthLabel}</div>
                <button type="button" className="btn-neon" onClick={() => setThangDangChon(new Date(thangDangChon.getFullYear(), thangDangChon.getMonth() + 1, 1))}>{">"}</button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs opacity-80 mb-2">
                {(["MON","TUE","WED","THU","FRI","SAT","SUN"]) .map((d) => (<div key={d}>{d}</div>))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {gridDays.map((d, i) => {
                  const selected = d && ngayDangChon === ymdFromDateLocal(d);
                  const isToday = d && d.toDateString() === new Date().toDateString();
                  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const isPastDay = !!d && d < startOfToday;
                  return (
                    <button key={i} type="button" disabled={!d || isPastDay} className={`h-10 rounded-full border ${selected ? 'bg-[var(--primary)] text-black' : 'bg-[#1a1a1a] text-[var(--foreground)]'} ${!d ? 'opacity-0' : ''} ${isPastDay ? 'opacity-40 cursor-not-allowed' : ''} ${isToday && !selected ? 'ring-2 ring-[var(--primary)]/40' : ''}`} onClick={() => d && setValue('ngay', ymdFromDateLocal(d))}>
                      {d ? d.getDate() : ''}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.ngay && <p className="text-red-600 text-sm">{errors.ngay.message}</p>}
            <div className="w-full">
              <label className="block text-sm mb-1">Time zone</label>
              <select className="select-neon w-full" value={chonTimezone} onChange={(e) => setChonTimezone(e.target.value)}>
                {(() => { const zones = (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') : ['Asia/Ho_Chi_Minh','Asia/Bangkok','Asia/Tokyo','Europe/London','America/New_York']; return zones.map((z: string) => <option key={z} value={z}>{z}</option>); })()}
              </select>
            </div>
            <div className="flex items-center justify-center gap-2 w-full">
              <span className="text-sm">Duration:</span>
              {[30,45,60].map(m => (
                <button key={m} type="button" className={`px-3 py-1 rounded border transition-colors ${duration===m?'bg-[var(--primary)] text-black':'bg-[#1a1a1a] text-[var(--foreground)]'}`} onClick={()=>setDuration(m)}>{m}’</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-2 opacity-80 text-sm text-center">{watch("ngay") ? parseLocalYmd(watch("ngay") as string).toDateString() : "Select a time"}</div>
            <div ref={slotsRef} className="flex flex-col gap-2 max-h-[396px] overflow-y-auto w-full">
              {danhSachSlot.map((slot) => {
                const selectedSlot = watch("gioBatDau");
                const base = (watch("ngay") as string) || ymdInTz(new Date(), chonTimezone);
                const selectedDate = parseLocalYmd(base);
                const todayLocal = parseLocalYmd(ymdInTz(new Date(), chonTimezone));
                const slotStart = toDate(new Date(`${base}T${slot}`), { timeZone: chonTimezone });
                let disabled = false;
                if (selectedDate < todayLocal) {
                  disabled = true;
                } else if (selectedDate > todayLocal) {
                  disabled = false;
                } else {
                  disabled = slotStart <= now;
                }
                return (
                  <button key={slot} type="button" disabled={disabled} className={`w-full px-4 py-2 rounded border text-center ${disabled ? 'bg-[#1a1a1a] opacity-40 cursor-not-allowed' : (selectedSlot===slot ? 'bg-[var(--primary)] text-black' : 'bg-[#1a1a1a] hover:brightness-110')}` } onClick={() => { if(disabled) return; setValue('gioBatDau', slot, { shouldDirty: true }); const start = slotStart; const end = addMinutes(start, duration); setValue('gioKetThuc', format(end,'HH:mm'), { shouldDirty: true }); }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">End time auto-updates</div>

        <button disabled={dangGui} className={`btn-neon ${dangGui ? "btn-loading" : ""}`}>
          {dangGui ? <span className="spinner"></span> : null}
          {dangGui ? "Creating..." : "Create event"}
        </button>
      </form>
      <div className="mt-8 flex justify-center">
        <div className="relative" style={{ width: 72, height: 72 }}>
          <Image src="/logo.png" alt="Logo" fill sizes="72px" style={{ objectFit: 'contain' }} />
        </div>
      </div>
    </div>
  );
}

 
