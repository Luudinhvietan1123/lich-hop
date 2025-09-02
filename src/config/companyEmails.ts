export type CauHinhCongTy = {
	congTy: string;
	danhSachEmail: string[];
};

// Có thể sửa danh sách này để phù hợp từng công ty.
export const danhSachCongTy: CauHinhCongTy[] = [
  {
    congTy: "CongTyMacDinh",
    danhSachEmail: [
      "ericspo29@gmail.com",
      "bvphap.tk@gmail.com",
      "kyoshu.work@gmail.com",
      "hieusnow.business@gmail.com",
      "luudinhvietan1123@gmail.com",
    ],
  },
];

export function layEmailTheoCongTy(tenCongTy: string): string[] {
	const congTy = danhSachCongTy.find((c) => c.congTy.toLowerCase() === tenCongTy.toLowerCase());
	return congTy ? congTy.danhSachEmail : [];
}


