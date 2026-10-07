"use strict";

const path = require("path");
const { parseHex, detectHexRuns } = require("./src/parseHex");
const { loadCatalog } = require("./src/catalog");
const { explain, lensTitle } = require("./src/explain");
const { joinedRunsFromLines, displayableGroupsFromLines, wrapRowsWellFormed } = require("./src/joinHex");
const { parseCommand, isTruncatedCommand, splitIntoApdus } = require("./src/parseApdu");

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
eq(lensTitle(sw), "Normal processing", "sw 9000 lens");
eq(lensTitle(explain(hex("6A 82"), catalog)), "File not found", "sw 6A82 lens");

const demo = explain(hex("80 EE 01 00 05 12 34 41 42 43"), catalog);
eq(demo.title, "DEMO VENDOR PING", "custom overlay");

const customUnknown = explain(hex("00 FF 00 00"), catalog);
eq(customUnknown.title, "CUSTOM APDU", "unknown ins");

const gpo = explain(hex("80 A8 00 00 02 83 00 00"), catalog);
eq(gpo.title, "GET PROCESSING OPTIONS", "emv gpo");

const oddGetData = explain(hex("00 CB 3F FF 00"), catalog);
const oddSpecs = [...new Set((oddGetData.specPills || []).map((p) => p.spec))];
eq(oddSpecs.length >= 3, true, "odd INS CB matches 3+ specs");
eq(oddSpecs.includes("ISO 7816-4"), true, "odd INS CB includes ISO 7816-4");
eq(oddSpecs.includes("NIST PIV"), true, "odd INS CB includes NIST PIV");
eq(oddSpecs.includes("ETSI TS 102 221"), true, "odd INS CB includes UICC");

const writePlain = [
  "00 D0 00 00 20 01 02 03 04 05 06 07 08 09 0A 0B",
  "0C 0D 0E 0F 10 11 12 13 14 15 16 17 18 19 1A 1B",
  "1C 1D 1E 1F 20",
];
const joinedPlain = joinedRunsFromLines(writePlain);
eq(joinedPlain.length, 1, "plain wrap is one run");
eq(joinedPlain[0].bytes.length, 37, "plain wrap is 37 bytes");
eq(!!parseCommand(joinedPlain[0].bytes), true, "plain wrap parses as command");
eq(explain(joinedPlain[0].bytes, catalog).title, "WRITE BINARY", "plain wrap is WRITE BINARY");

const write0x = [
  "0x00 0xD0 0x00 0x00 0x20 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0A 0x0B",
  "0x0C 0x0D 0x0E 0x0F 0x10 0x11 0x12 0x13 0x14 0x15 0x16 0x17 0x18 0x19 0x1A 0x1B",
  "0x1C 0x1D 0x1E 0x1F 0x20",
];
eq(joinedRunsFromLines(write0x)[0].bytes.length, 37, "0x-space wrap is 37 bytes");

const writeComma = [
  "0x00, 0xD0, 0x00, 0x00, 0x20, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,",
  "0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B,",
  "0x1C, 0x1D, 0x1E, 0x1F, 0x20",
];
eq(joinedRunsFromLines(writeComma)[0].bytes.length, 37, "0x-comma wrap is 37 bytes");

const twoSelects = ["00 A4 04 0C 07 A0 00 00 02 47 10 01", "00 A4 02 0C 02 01 1E"];
eq(joinedRunsFromLines(twoSelects).length, 2, "two complete APDUs stay separate");

eq(displayableGroupsFromLines(writePlain, catalog.swIndex).length, 1, "valid wrap is shown");
eq(
  displayableGroupsFromLines(
    [
      "    0x00, 0xD0, 0x00, 0x00, 0x20, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,",
      "    0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,",
      "    0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x1C, 0x1D, 0x1E",
    ],
    catalog.swIndex
  ).length,
  0,
  "truncated WRITE BINARY is hidden"
);
eq(
  displayableGroupsFromLines(["00 D0 00 00 20 01 02 03 04 05 06 07 08 09 0A 0B"], catalog.swIndex).length,
  0,
  "incomplete single line is hidden"
);
const truncated = joinedRunsFromLines([
  "    0x00, 0xD0, 0x00, 0x00, 0x20, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B,",
  "    0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,",
  "    0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x1C, 0x1D, 0x1E",
])[0].bytes;
eq(isTruncatedCommand(truncated), true, "truncated WRITE BINARY is flagged");
eq(splitIntoApdus(truncated, catalog.swIndex).length, 0, "truncated WRITE BINARY is not split");
eq(wrapRowsWellFormed(joinedPlain[0].parts), true, "16/16/5 wrap shape is valid");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("all passed");
