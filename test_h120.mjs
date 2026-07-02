import { buildPathwaySpecificHtml } from "./src/components/results/PathwaySpecificSections.jsx";

const baseForms = {
  identitas: { namaBisnis:"Kopi Senja", sectorCode:"56304", skalaBisnis:"mikro", provinceCode:"35" },
  peluang: { masalah:["a","b","c","d","e"], solusi:["a","b","c","d","e"], jenisPelanggan:["m","s","p"], keunggulan:["u1","u2","u3"] },
  modal: { expenses:{legal:5_500_000, renovasi:60_000_000, promo:8_000_000}, assets:{stok:3_000_000} },
};
const mockFin = { projection: [
  { year:1, revenue:540_000_000, hpp:216_000_000, grossProfit:324_000_000, netIncome:50_000_000 },
  { year:2, revenue:584_000_000, hpp:233_600_000, grossProfit:350_400_000, netIncome:72_000_000 },
  { year:3, revenue:632_000_000, hpp:252_800_000, grossProfit:379_200_000, netIncome:96_000_000 },
]};

console.log("\n========== HOTFIX 12.0 — DIFERENSIASI JALUR ==========\n");

// JALUR A
const formsA = { ...baseForms };
const htmlA = buildPathwaySpecificHtml("A", formsA, mockFin);
console.log("✦ JALUR A (Bisnis Baru):");
console.log(`  HTML length: ${htmlA.length} chars`);
console.log(`  Contains "Validasi Ide": ${htmlA.includes("Validasi Ide") ? "✓" : "✗"}`);
console.log(`  Contains "Start-up Requirements": ${htmlA.includes("Start-up Requirements") ? "✓" : "✗"}`);
console.log(`  Contains "asumsi riset pasar eksternal": ${htmlA.includes("asumsi riset pasar eksternal") ? "✓" : "✗"}`);

// JALUR B
const formsB = { ...baseForms, existingBusiness: {
  tahunMulai:"2022", omsetBulanan:45_000_000, hppBulanan:18_000_000, labaBulanan:9_000_000, opexBerjalan:18_000_000,
  jumlahKaryawan:4, asetSaatIni:200_000_000, kapasitasUtilization:85,
  bottleneck:["kapasitas_produksi","sdm_kurang"],
  targetPertumbuhanRevenue:60, targetPayback:18,
  alasanEkspansi:"Permintaan sudah melampaui kapasitas selama 6 bulan terakhir, sering reject order."
}};
const htmlB = buildPathwaySpecificHtml("B", formsB, mockFin);
console.log("\n⇗ JALUR B (Ekspansi):");
console.log(`  HTML length: ${htmlB.length} chars`);
console.log(`  Contains "Kinerja Historis": ${htmlB.includes("Kinerja Historis") ? "✓" : "✗"}`);
console.log(`  Contains "Baseline": ${htmlB.includes("Baseline") ? "✓" : "✗"}`);
console.log(`  Contains "Konsolidasi": ${htmlB.includes("Konsolidasi") ? "✓" : "✗"}`);
console.log(`  Contains alasanEkspansi: ${htmlB.includes("Permintaan sudah melampaui") ? "✓" : "✗"}`);

// JALUR C
const formsC = { ...baseForms, fundingTarget: {
  nominal:140_000_000, tenor:36,
  useOfFunds:{renovasi:60_000_000, equipment:30_000_000, inventory:20_000_000, marketing:10_000_000, workingCapital:15_000_000, legal:5_000_000},
  risikoMitigasi:{
    pasar:"Risiko: kompetitor agresif. Mitigasi: UVP unik kopi single origin.",
    operasional:"Risiko: supplier telat. Mitigasi: kontrak 2 supplier cadangan.",
    keuangan:"Risiko: cash flow ketat. Mitigasi: cadangan 3 bulan opex.",
  },
  exitStrategy:"Tahun 3 manajemen buyback dengan valuasi 3x modal."
}};
const htmlC = buildPathwaySpecificHtml("C", formsC, mockFin);
console.log("\n★ JALUR C (Pencarian Dana):");
console.log(`  HTML length: ${htmlC.length} chars`);
console.log(`  Contains "Use of Funds": ${htmlC.includes("Use of Funds") ? "✓" : "✗"}`);
console.log(`  Contains "DSCR": ${htmlC.includes("DSCR") ? "✓" : "✗"}`);
console.log(`  Contains "Mitigasi Risiko": ${htmlC.includes("Mitigasi Risiko") ? "✓" : "✗"}`);
console.log(`  Contains "Repayment": ${htmlC.includes("Repayment") ? "✓" : "✗"}`);
console.log(`  Contains "Exit Strategy": ${htmlC.includes("Exit Strategy") ? "✓" : "✗"}`);
console.log(`  Contains BANKABLE/TIGHT verdict: ${(htmlC.includes("BANKABLE") || htmlC.includes("TIGHT")) ? "✓" : "✗"}`);

console.log("\n========== PERBANDINGAN ==========");
console.log(`  Jalur A: ${htmlA.length} chars (modal awal masif)`);
console.log(`  Jalur B: ${htmlB.length} chars (baseline + konsolidasi)`);
console.log(`  Jalur C: ${htmlC.length} chars (use of funds + DSCR + mitigasi)`);
console.log(`  Selisih konten: A=${htmlA !== htmlB && htmlA !== htmlC ? "berbeda" : "SAMA?"} B=${htmlB !== htmlC ? "berbeda" : "SAMA?"}`);
