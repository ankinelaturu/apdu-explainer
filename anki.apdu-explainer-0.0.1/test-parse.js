"use strict";

const path = require("path");
const { parseHex, detectHexRuns } = require("./src/parseHex");
const { loadCatalog } = require("./src/catalog");
const { explain, lensTitle } = require("./src/explain");

const catalog = loadCatalog(path.join(__dirname, "catalog"));
let failed = 0;

function eq(actual, expected, label) {
  if (actual !== expected) {
    console.error("FAIL", label, "got", JSON.stringify(actual), "expected", JSON.stringify(expected));
    failed++;
  } else {
    console.log("ok", label);
  }
}

function hex(s) {
  const b = parseHex(s);
  if (!b) throw new Error("parse failed: " + s);
  return b;
}

eq(parseHex("00 A4 04 0C").join(","), "0,164,4,12", "plain hex");
eq(parseHex("0x00 0xA4 0x04 0x0C").join(","), "0,164,4,12", "0x spaces");
eq(parseHex("0x00, 0xA4, 0x04, 0x0C").join(","), "0,164,4,12", "0x commas");
eq(parseHex("0x00,0xA4,0x04,0x0C").join(","), "0,164,4,12", "0x commas no space");
eq(parseHex("00A4040C"), null, "reject packed");

const runs = detectHexRuns("00 A4 04 0C 07 A0 00 00 02 47 10 01    00 A4 02 0C 02 01 1E");
eq(runs.length, 2, "two runs on one line");

const selectApp = explain(hex("00 A4 04 0C 07 A0 00 00 02 47 10 01"), catalog);
eq(selectApp.title, "SELECT FILE", "select app title");
const aidPills = (selectApp.fields.find((f) => f.id === "data") || {}).pills || [];
eq(aidPills.some((p) => p.name === "eMRTD"), true, "eMRTD AID pill");
eq(selectApp.summary.includes("eMRTD"), true, "select app summary names AID");
eq(/LDS elementary file/.test(selectApp.summary), false, "select app summary is not the combined catalog blurb");

const selectEf = explain(hex("00 A4 02 0C 02 01 1E"), catalog);
const fidPills = (selectEf.fields.find((f) => f.id === "data") || {}).pills || [];
eq(fidPills.some((p) => p.name === "EF.COM"), true, "EF.COM pill");
eq(selectEf.summary.includes("EF.COM"), true, "select EF summary names the file");
eq(selectEf.summary.includes("A0000002471001"), false, "select EF summary is not applet SELECT");

const readSfi = explain(hex("00 B0 9E 00 00"), catalog);
eq(readSfi.title, "READ BINARY", "read binary title");
const p1Pills = (readSfi.fields.find((f) => f.id === "p1") || {}).pills || [];
eq(p1Pills.some((p) => p.name === "EF.COM"), true, "SFI EF.COM");
eq(readSfi.summary.includes("EF.COM"), true, "read binary summary names the file");

const sw = explain(hex("90 00"), catalog);
eq(lensTitle(sw).replace(/\s/g, ""), "SW9000", "sw lens");

const demo = explain(hex("80 EE 01 00 05 12 34 41 42 43"), catalog);
eq(demo.title, "DEMO VENDOR PING", "custom overlay");

const customUnknown = explain(hex("00 FF 00 00"), catalog);
eq(customUnknown.title, "CUSTOM APDU", "unknown ins");

const gpo = explain(hex("80 A8 00 00 02 83 00 00"), catalog);
eq(gpo.title, "GET PROCESSING OPTIONS", "emv gpo");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("all passed");
