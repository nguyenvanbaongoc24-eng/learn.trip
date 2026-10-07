#!/usr/bin/env node

/**
 * Learn.Trip - Admin Account Seeding Script
 * Usage:
 *   node scripts/seed-admin.mjs [email] [password] [displayName]
 * Example:
 *   node scripts/seed-admin.mjs nguyenvan.baongoc24@gmail.com MyPass@123 "Nguyễn Văn Bảo Ngọc"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

const args = process.argv.slice(2);
const adminEmail = args[0] || "admin@learntrip.vn";
const adminPassword = args[1] || "Admin@123";
const adminName = args[2] || "Quản Trị Viên";

console.log("==========================================");
console.log("   LEARN.TRIP - TẠO TÀI KHOẢN ADMIN");
console.log("==========================================");
console.log(`Email Admin : ${adminEmail}`);
console.log(`Tên hiển thị: ${adminName}`);
console.log(`Mật khẩu    : ${adminPassword}`);
console.log("------------------------------------------");

// Check or update .env.local
let envContent = "";
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf-8");
}

let updatedEnv = envContent;
if (/^ADMIN_EMAILS=/m.test(updatedEnv)) {
  const currentLine = updatedEnv.match(/^ADMIN_EMAILS=(.*)$/m)[1];
  const list = currentLine.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!list.includes(adminEmail.toLowerCase())) {
    list.push(adminEmail.toLowerCase());
    updatedEnv = updatedEnv.replace(/^ADMIN_EMAILS=.*$/m, `ADMIN_EMAILS=${list.join(",")}`);
  }
} else {
  updatedEnv += `\nADMIN_EMAILS=${adminEmail}\n`;
}

if (!/^AUTH_SECRET=/m.test(updatedEnv)) {
  updatedEnv += `AUTH_SECRET=learntrip_secure_jwt_secret_key_minimum_32_characters_long!\n`;
}

fs.writeFileSync(envPath, updatedEnv.trim() + "\n", "utf-8");

console.log(`✅ Đã cập nhật biến môi trường ADMIN_EMAILS vào file .env.local!`);
console.log(`Khi bạn đăng ký tài khoản với email "${adminEmail}", hệ thống sẽ TỰ ĐỘNG gán role: "admin"`);
console.log(`\nBạn có thể đăng nhập vào CMS tại:`);
console.log(`Local     : http://localhost:3000/cms/login`);
console.log(`Production: https://[domain-cua-ban].vercel.app/cms/login`);
console.log("==========================================");
