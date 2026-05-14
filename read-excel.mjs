import { readFileSync } from "fs";
import { read, utils } from "xlsx";

const buf = readFileSync("Product_data_export1778758905285.xlsx");
const wb = read(buf);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = utils.sheet_to_json(ws, { defval: "" });

// Show all products with category, name, price
rows.forEach((r, i) => {
  const cat = r["Category"].split("/").slice(0, 2).join(" > ");
  console.log(`${i + 1}. [${cat}] ${r["Product name"]} | $${r["Base price"]} | qty:${r["Quantity"]}`);
});

// Unique top-level categories
const cats = [...new Set(rows.map(r => r["Category"].split("/")[0]))];
console.log("\nTop categories:", cats);
