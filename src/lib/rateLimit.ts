const banDoDem: Record<string, { dem: number; resetAt: number }> = {};

export function kiemSoatTanSuat(key: string, gioiHan: number, cuaSoMs: number) {
  const hienTai = Date.now();
  const rec = banDoDem[key];
  if (!rec || hienTai > rec.resetAt) {
    banDoDem[key] = { dem: 1, resetAt: hienTai + cuaSoMs };
    return { allowed: true, remaining: gioiHan - 1 };
  }
  if (rec.dem >= gioiHan) return { allowed: false, remaining: 0 };
  rec.dem += 1;
  return { allowed: true, remaining: gioiHan - rec.dem };
}


