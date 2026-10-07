"use strict";

const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "catalog", "about");
fs.mkdirSync(dir, { recursive: true });

function write(name, body) {
  const dest = path.join(dir, name);
  if (fs.existsSync(dest)) return;
  fs.writeFileSync(dest, body.trim() + "\n");
}

function page(sections) {
  return sections.join("\n\n") + "\n";
}

function h(t) {
  return `## ${t}`;
}

function p(...paras) {
  return paras.join("\n\n");
}

function table(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}`;
}

const commands = {
  "iso-erase-binary": page([
    h("What it does"),
    p(
      "ERASE BINARY erases a range of bytes in a **transparent EF**. P1-P2 use the same offset encoding as READ BINARY. Command data, when present, can name an end offset; otherwise the card erases from the offset to the end of the file (or to a card-defined length)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Erased"],
        ["`6982`", "Access conditions not satisfied"],
        ["`6981`", "Not a transparent EF"],
        ["`6B 00`", "Offset outside the file"],
      ]
    ),
  ]),
  "iso-search-binary": page([
    h("What it does"),
    p(
      "SEARCH BINARY looks for a byte string inside a transparent EF, starting at the offset in P1-P2. Command data is the search pattern. A successful response often returns the offset where the pattern was found."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Found (offset in response data)"],
        ["`6A 83`", "Not found"],
        ["`6981`", "Wrong file structure"],
      ]
    ),
  ]),
  "iso-write-record": page([
    h("What it does"),
    p(
      "WRITE RECORD writes a record in a linear or cyclic EF. P1 is the record number (`00` = current). P2 encodes SFI and write mode (first, last, next, previous, or record P1), using the same bit packing as READ RECORD.",
      "Like WRITE BINARY, ISO WRITE RECORD may OR bits into an existing record rather than replace it. UPDATE RECORD is the replace form."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Written"],
        ["`6A 83`", "Record not found"],
        ["`6A 84`", "Not enough space"],
        ["`6981`", "Not a record EF"],
      ]
    ),
  ]),
  "iso-update-record": page([
    h("What it does"),
    p(
      "UPDATE RECORD **replaces** a record in a linear or cyclic EF. P1 is the record number. P2 is SFI + mode, same layout as READ RECORD (`100` = record P1 is the usual absolute update)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Updated"],
        ["`6A 83`", "Record not found"],
        ["`6982`", "Access conditions not satisfied"],
      ]
    ),
  ]),
  "iso-append-record": page([
    h("What it does"),
    p(
      "APPEND RECORD adds a new record at the end of a linear EF, or as the newest record of a cyclic EF. P1 is `00`. P2 may name an SFI. Command data is the full record body.",
      "Cyclic files overwrite the oldest record when full rather than returning `6A84`."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Appended"],
        ["`6A 84`", "File full (linear)"],
        ["`6981`", "Not a record EF"],
      ]
    ),
  ]),
  "iso-erase-record": page([
    h("What it does"),
    p(
      "ERASE RECORD erases one or more records of a linear/cyclic EF. P1 is the starting record number. P2 uses the READ RECORD SFI/mode packing. Erased records typically read back as the logical erased value (often `FF` or zeros)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Erased"],
        ["`6A 83`", "Record not found"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso-search-record": page([
    h("What it does"),
    p(
      "SEARCH RECORD looks for a pattern inside records of the current (or SFI) EF. P1/P2 choose the starting record and mode. Command data is the search string, sometimes with a simple mask.",
      "A match usually returns the record number and/or the record body, depending on the card."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Match"],
        ["`6A 83`", "No match / record not found"],
      ]
    ),
  ]),
  "iso-change-reference-data": page([
    h("What it does"),
    p(
      "CHANGE REFERENCE DATA replaces a PIN or other reference. P2 selects the reference (same encoding as VERIFY). Command data is typically old PIN || new PIN, or only the new PIN if the current security status already allows the change."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Changed"],
        ["`63 Cx`", "Old PIN wrong; `x` tries left"],
        ["`6983`", "Blocked"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso-disable-verification": page([
    h("What it does"),
    p(
      "DISABLE VERIFICATION REQUIREMENT turns off the need to VERIFY a given reference before using protected objects. P2 names the reference. Many cards require the PIN (or a higher PIN) in the command data or as a prior VERIFY."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Disabled"],
        ["`6982`", "Not allowed"],
        ["`6A 81`", "Function not supported"],
      ]
    ),
  ]),
  "iso-enable-verification": page([
    h("What it does"),
    p(
      "ENABLE VERIFICATION REQUIREMENT is the inverse of DISABLE: the named reference must be verified again before protected operations. P2 names the reference."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Enabled"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso-reset-retry": page([
    h("What it does"),
    p(
      "RESET RETRY COUNTER unblocks a PIN after too many wrong VERIFY attempts (`6983`). P2 names the reference. Command data is usually resetting code / PUK || new PIN, or only the resetting code if you are not changing the PIN."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Unblocked; retry counter restored"],
        ["`63 Cx`", "Resetting code wrong; `x` tries left"],
        ["`6983`", "Resetting code itself blocked"],
      ]
    ),
  ]),
  "iso-external-auth": page([
    h("What it does"),
    p(
      "EXTERNAL AUTHENTICATE proves the **host** to the card. The card issued a challenge (often via GET CHALLENGE). Command data is the host’s cryptogram / signature over that challenge, using keys selected by MSE.",
      "GlobalPlatform uses the same INS `82` after INITIALIZE UPDATE, but that is the GP secure-channel finish — see that page when CLA is `84`/`80` with GP SM bits."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Host authenticated"],
        ["`6300`", "Authentication failed"],
        ["`6983`", "Method blocked"],
        ["`6982`", "Wrong security environment"],
      ]
    ),
  ]),
  "iso-get-challenge": page([
    h("What it does"),
    p(
      "GET CHALLENGE returns a card-generated random (or counter-based) challenge. Le is the length you want. The next EXTERNAL AUTHENTICATE (or a PSO) is expected to use this value.",
      "P1 and P2 are `00` on most cards. A challenge is typically single-use."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Challenge in response data"],
        ["`6C xx`", "Wrong Le"],
        ["`6A 81`", "Not supported"],
      ]
    ),
  ]),
  "iso-general-authenticate": page([
    h("What it does"),
    p(
      "GENERAL AUTHENTICATE (INS `86` even / `87` odd) is a generic authentication and key-agreement wrapper. eMRTD PACE and Chip Authentication, PIV, and pairing protocols send BER-TLV Dynamic Authentication Data objects in the command data and get the peer’s objects back.",
      "Odd INS `87` is the usual PIV / chaining form. MSE should already have selected the algorithm and key."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Step succeeded; response may hold the card’s nonce / token"],
        ["`6300`", "Authentication failed"],
        ["`6982`", "SE not set / access denied"],
        ["`6A 80`", "Malformed TLV"],
      ]
    ),
  ]),
  "iso-internal-auth": page([
    h("What it does"),
    p(
      "INTERNAL AUTHENTICATE proves the **card** to the host. Command data is the host challenge. The card returns a cryptogram computed with an internal key (selected by MSE). This is the classic challenge–response card authentication, distinct from EXTERNAL AUTHENTICATE."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Cryptogram returned"],
        ["`6982`", "Key not usable / access denied"],
        ["`6A 88`", "Referenced key not found"],
      ]
    ),
  ]),
  "iso-envelope": page([
    h("What it does"),
    p(
      "ENVELOPE wraps another APDU (or a data blob) inside this command. T=0 uses it when the real command would not fit the transport, or when the card expects an envelope for SM. INS `C2` even / `C3` odd.",
      "UICC also uses ENVELOPE for SIM Toolkit / USAT data download from the network."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Accepted"],
        ["`91 xx`", "Proactive command pending (CAT)"],
        ["`9300`", "Toolkit busy"],
        ["`9E xx`", "SIM data download error"],
      ]
    ),
  ]),
  "iso-manage-channel": page([
    h("What it does"),
    p(
      "MANAGE CHANNEL opens or closes a **logical channel**. Basic channel 0 always exists. Extra channels let several applications stay selected at once."
    ),
    table(
      ["P1", "P2", "Meaning"],
      [
        ["`00`", "`00`", "Open; card assigns the channel number in the response"],
        ["`00`", "`01`–`13`", "Open this channel number (if the card allows)"],
        ["`80`", "`01`–`13`", "Close this channel"],
      ]
    ),
    p("CLA of later commands encodes the channel in the low bits (interindustry CLA)."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Opened or closed; open returns the channel number"],
        ["`6881`", "Logical channel not supported"],
        ["`6A 81`", "No more channels"],
      ]
    ),
  ]),
  "iso8-pso": page([
    h("What it does"),
    p(
      "PERFORM SECURITY OPERATION (INS `2A`) is the ISO 7816-8 crypto workhorse: hash, sign, verify, encipher, decipher, checksum, verify certificate. P1-P2 name the operation. Input is command data (often a CRT or a hash). MSE should already point at the key."
    ),
    table(
      ["P1", "P2", "Typical operation"],
      [
        ["`9E`", "`9A`", "Compute digital signature"],
        ["`00`", "`A8`", "Hash"],
        ["`80`", "`86`", "Encipher"],
        ["`00`", "`AE`", "Verify certificate"],
        ["`00`", "`A2`", "Verify cryptographic checksum"],
      ]
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Done; output may be in response data"],
        ["`6982`", "Key / SE not available"],
        ["`6A 80`", "Bad input"],
        ["`6280`", "Verification failed (some cards)"],
      ]
    ),
  ]),
  "iso8-gakp": page([
    h("What it does"),
    p(
      "GENERATE ASYMMETRIC KEY PAIR creates a key in a card slot. INS `46` even / `47` odd. P1-P2 and the data field name the key identifier and whether the public key is returned.",
      "OpenPGP uses odd INS `47` with CRT tags for the slot (signature, decryption, authentication). PIV generates keys through GENERAL AUTHENTICATE rather than this INS on many cards."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Generated; public key may follow"],
        ["`6982`", "Not allowed (need PW3 / admin)"],
        ["`6A 84`", "No space for a new key"],
      ]
    ),
  ]),
  "iso9-create-file": page([
    h("What it does"),
    p(
      "CREATE FILE allocates an MF, DF, or EF. Command data is a BER-TLV FCP (file control parameters): FID, file descriptor, size, life cycle, and access rules. The new file is often selected as a side effect."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Created"],
        ["`6A 89`", "File already exists"],
        ["`6A 84`", "Not enough memory"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso9-delete-file": page([
    h("What it does"),
    p(
      "DELETE FILE removes the current file, or a file named in the data field. Deleting a DF may require it to be empty. This is ISO 7816-9 file management, not GlobalPlatform DELETE of applets (same INS `E4` but proprietary CLA)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Deleted"],
        ["`6982`", "Not allowed"],
        ["`6A 82`", "File not found"],
      ]
    ),
  ]),
  "iso9-activate-file": page([
    h("What it does"),
    p(
      "ACTIVATE FILE moves a file from created / deactivated to the operational state so it can be selected and used. P1-P2 or the data field identify the file when it is not already current."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Activated"],
        ["`6982`", "Not allowed"],
        ["`6A 82`", "File not found"],
      ]
    ),
  ]),
  "iso9-deactivate-file": page([
    h("What it does"),
    p(
      "DEACTIVATE FILE temporarily takes a file out of use. SELECT of a deactivated file often returns `6283`. ACTIVATE FILE brings it back. INS `04` is easy to confuse with a malformed SELECT — look at the full header."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Deactivated"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso9-terminate-df": page([
    h("What it does"),
    p(
      "TERMINATE DF irreversibly ends a dedicated file’s life cycle. The DF cannot be selected for normal use afterward (`6285` / terminated state). This is not DELETE; the structure may remain as a tombstone."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Terminated"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso9-terminate-ef": page([
    h("What it does"),
    p("TERMINATE EF is the elementary-file counterpart of TERMINATE DF: the EF is put in a terminal, non-operational state."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Terminated"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "iso9-terminate-card": page([
    h("What it does"),
    p(
      "TERMINATE CARD USAGE is the last life-cycle command: the card (or MF) is permanently taken out of service. There is no ISO reactivate. Issuer-defined remnants may still answer ATR but reject application commands."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Terminated"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "emrtd-select": page([
    h("What it does"),
    p(
      "On an ePassport / eMRTD this is still ISO SELECT FILE, used in two ways: select the eMRTD application by AID `A0 00 00 02 47 10 01` (P1 `04`), then select LDS EFs by FID (P1 `02`, P2 `0C` so no FCI)."
    ),
    table(
      ["FID", "File"],
      [
        ["`011E`", "EF.COM"],
        ["`0101`–`0110`", "DG1–DG16"],
        ["`011D`", "EF.SOD"],
        ["`011C`", "EF.CVCA"],
      ]
    ),
    p("P2 `0C` is the usual ePassport choice. After SELECT AID, READ BINARY of EF.COM (SFI `1E`) is the normal next step."),
  ]),
  "emv-gpo": page([
    h("What it does"),
    p(
      "GET PROCESSING OPTIONS starts EMV application processing after SELECT of the AID. Command data is a PDOL-related data object, tag `83`, whose value is the terminal data the card listed in the PDOL."
    ),
    p(
      "The response is an Application Interchange Profile (AIP) and Application File Locator (AFL): which records to READ RECORD, and whether SDA/DDA/CDA and CVM lists apply."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "AIP + AFL returned"],
        ["`6985`", "Conditions not satisfied (wrong PDOL / state)"],
        ["`6A 80`", "PDOL data malformed"],
      ]
    ),
  ]),
  "emv-generate-ac": page([
    h("What it does"),
    p(
      "GENERATE AC asks the card for an application cryptogram at the end of an EMV transaction (and sometimes for a second AC after online approval)."
    ),
    table(
      ["P1 bits 8–7", "Type"],
      [
        ["`00`", "AAC — decline"],
        ["`01`", "TC — approve offline"],
        ["`10`", "ARQC — go online"],
      ]
    ),
    p("P1 bit 5 requests CDA (combined DDA/AC generation). Command data is the CDOL-related data object. The response is a cryptogram information data, ATC, and AC (tag `9F26`), plus optional signed dynamic data."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "AC returned (check CID for the type the card actually chose)"],
        ["`6985`", "Not in a state to generate an AC"],
      ]
    ),
  ]),
  "emv-get-data": page([
    h("What it does"),
    p(
      "EMV GET DATA (INS `CA`, proprietary CLA) reads a few well-known tags without going through record files: ATC `9F36`, last online ATC `9F13`, PIN try counter `9F17`, log format `9F4F`. P1-P2 is the tag."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Value returned"],
        ["`6A 88`", "Tag not available"],
      ]
    ),
  ]),
  "emv-app-block": page([
    h("What it does"),
    p(
      "APPLICATION BLOCK disables the currently selected EMV application (issuer script after an online session). Later SELECT of that AID typically returns `6283` (invalidated) or fails cardholder functions. Requires a secure session (issuer script MAC)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Blocked"],
        ["`6985`", "Not allowed in this state"],
        ["`6988`", "Bad SM"],
      ]
    ),
  ]),
  "emv-app-unblock": page([
    h("What it does"),
    p("APPLICATION UNBLOCK reverses APPLICATION BLOCK for the current AID. Also an issuer-script command with SM."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Unblocked"],
        ["`6985`", "Not allowed"],
      ]
    ),
  ]),
  "emv-card-block": page([
    h("What it does"),
    p(
      "CARD BLOCK permanently disables the card (all applications). Issuer-script only. After success, the card may still ATR but application commands fail with `6A81` / blocked indications."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Card blocked"],
        ["`6985`", "Not allowed"],
      ]
    ),
  ]),
  "emv-pin-change-unblock": page([
    h("What it does"),
    p(
      "PIN CHANGE/UNBLOCK (INS `24`, EMV CLA) is the issuer-script form of changing or unblocking the offline PIN. Data is SM-wrapped. Distinct from ISO CHANGE REFERENCE DATA / RESET RETRY COUNTER, which use interindustry CLA."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "PIN changed or unblocked"],
        ["`6988`", "SM failed"],
        ["`63 Cx`", "Tries remaining on some cards"],
      ]
    ),
  ]),
  "gp-delete": page([
    h("What it does"),
    p(
      "GlobalPlatform DELETE removes an executable load file, application, or related objects from the card registry. P2 `00` deletes the object; `80` deletes the object and related objects (for example an AID and its ELF)."
    ),
    p("Command data is TLV: tag `4F` AID, or a load-file AID. Requires a secure channel to the SSD that owns the object."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Deleted"],
        ["`6A 88`", "Referenced data not found"],
        ["`6985`", "Not the owner / conditions of use"],
      ]
    ),
  ]),
  "gp-install": page([
    h("What it does"),
    p("INSTALL is the GP registry multi-tool. P1 chooses the stage; several bits can be combined (install + make selectable = `0C`)."),
    table(
      ["P1", "Stage"],
      [
        ["`02`", "For load"],
        ["`04`", "For install"],
        ["`08`", "For make selectable"],
        ["`0C`", "Install and make selectable"],
        ["`10`", "Extradition"],
        ["`20`", "Registry update"],
        ["`40`", "Personalization"],
      ]
    ),
    p("Data is a concatenation of AID / privileges / install parameters TLVs. LOAD of CAP blocks usually follows INSTALL [for load]."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Done"],
        ["`6A 80`", "Bad parameters"],
        ["`6A 84`", "Not enough memory"],
        ["`6985`", "Privileges / state"],
      ]
    ),
  ]),
  "gp-load": page([
    h("What it does"),
    p(
      "LOAD sends executable load-file blocks after INSTALL [for load]. P1 bit 8 set means **last block**. Each command carries a block number and a chunk of the load file. The card reassembles and links on the last block."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Block accepted"],
        ["`6A 80`", "Bad block"],
        ["`6581`", "Memory failure"],
      ]
    ),
  ]),
  "gp-store-data": page([
    h("What it does"),
    p(
      "STORE DATA personalizes an application or SSD. P1/P2 encode block number, last-block, and whether data is DGI-formatted or TLV. Used after INSTALL [for personalization] or against a selected app."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Stored"],
        ["`6A 80`", "Bad DGI/TLV"],
        ["`6982`", "No SM / not allowed"],
      ]
    ),
  ]),
  "gp-put-key": page([
    h("What it does"),
    p(
      "PUT KEY replaces or adds keys in a security domain (ENC/MAC/DEK or AES session keys). P1 is the key version; P2 is the key identifier / multiple-key flag. Data includes key type, length, encrypted key value, and KCV."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Key stored"],
        ["`9485`", "Invalid key check value"],
        ["`9484`", "Algorithm not supported"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "gp-get-status": page([
    h("What it does"),
    p("GET STATUS lists registry entries: ISD, applications/SSD, or executable load files."),
    table(
      ["P1", "Scope"],
      [
        ["`80`", "Issuer Security Domain"],
        ["`40`", "Applications / SSD"],
        ["`20`", "Executable load files"],
        ["`10`", "Load files and modules"],
      ]
    ),
    p("P2 `00` = first/all, `01` = next. Command data is an AID search TLV (often `4F 00` for all)."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "List returned"],
        ["`6A 88`", "No more entries"],
      ]
    ),
  ]),
  "gp-set-status": page([
    h("What it does"),
    p(
      "SET STATUS changes the life-cycle of the ISD, an SSD, or an application (Installed → Selectable → Locked, and so on). Data names the AID and the new state byte."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Updated"],
        ["`6A 88`", "AID not found"],
        ["`6985`", "Illegal transition"],
      ]
    ),
  ]),
  "gp-get-data": page([
    h("What it does"),
    p(
      "GP GET DATA (INS `CA`, GP CLA) reads security-domain data objects: IIN, CIN, card production life cycle, key information template, confirmation counter. P1-P2 is the tag (`00 66`, `00 E0`, `9F 7F`, …)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Object returned"],
        ["`6A 88`", "Tag not found"],
      ]
    ),
  ]),
  "gp-init-update": page([
    h("What it does"),
    p(
      "INITIALIZE UPDATE starts a GlobalPlatform secure channel (SCP02 or SCP03). P1 is the key version (`00` = default). P2 is the key identifier. Command data is the host challenge (8 bytes for SCP02, 8 for SCP03 typically)."
    ),
    p(
      "The response is key diversification data, key version, SCP identifier, card challenge, and card cryptogram. Next command is EXTERNAL AUTHENTICATE with the host cryptogram."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Channel started"],
        ["`6A 88`", "Key version not found"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "gp-ext-auth": page([
    h("What it does"),
    p(
      "GP EXTERNAL AUTHENTICATE finishes the secure channel started by INITIALIZE UPDATE. Command data is the host cryptogram. P1 is the **requested security level** for the rest of the session."
    ),
    table(
      ["P1", "Level"],
      [
        ["`00`", "No SM"],
        ["`01`", "C-MAC"],
        ["`03`", "C-DECRYPTION and C-MAC"],
        ["`15`", "C-MAC and R-MAC"],
        ["`33`", "C-DECRYPTION, C-MAC, R-MAC"],
      ]
    ),
    p("After `90 00`, later APDUs use the matching CLA SM bits (`84`, …)."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Channel established"],
        ["`6300`", "Cryptogram failed"],
      ]
    ),
  ]),
  "openpgp-verify": page([
    h("What it does"),
    p("OpenPGP VERIFY presents PW1 or PW3. P2 chooses the password. Empty VERIFY checks whether that password is already satisfied for this session."),
    table(
      ["P2", "Password"],
      [
        ["`81`", "PW1 — signing"],
        ["`82`", "PW1 — other commands (decrypt / auth)"],
        ["`83`", "PW3 — admin"],
      ]
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Verified"],
        ["`63 Cx`", "Wrong PIN; tries left"],
        ["`6983`", "Blocked"],
      ]
    ),
  ]),
  "openpgp-get-data": page([
    h("What it does"),
    p(
      "OpenPGP GET DATA (INS `CA`) reads application data objects: historical bytes `5F52`, application identifier, PW status `C4`, public-key data objects `C0`–`C2`, fingerprints, and so on. P1-P2 is the tag."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Object returned"],
        ["`6A 88`", "Tag not found"],
      ]
    ),
  ]),
  "openpgp-put-data": page([
    h("What it does"),
    p(
      "OpenPGP PUT DATA writes those same objects (name, language, fingerprints, PW status, extended capabilities as allowed). PW3 is required for most puts. INS `DA`, tag in P1-P2, value in DATA."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Stored"],
        ["`6982`", "Need PW3"],
        ["`6A 80`", "Value rejected"],
      ]
    ),
  ]),
  "openpgp-gakp": page([
    h("What it does"),
    p(
      "OpenPGP GENERATE ASYMMETRIC KEY PAIR uses odd INS `47`. Data names the CRT (signature `B6`, decryption `B8`, authentication `A4`). The card returns the public key. PW3 required."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Key generated"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "piv-get-data": page([
    h("What it does"),
    p(
      "PIV GET DATA is odd-INS `CB` with P1-P2 `3F FF`. Command data is `{ 5C <len> <BER-TLV tag> }` naming the object (CCC `5FC107`, CHUID `5FC102`, X.509 `5FC10A`, …). Response is `{ 53 <len> <object> }`."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Object returned"],
        ["`6A 82`", "Object not found"],
        ["`6982`", "Access conditions (PIN / OCC)"],
      ]
    ),
  ]),
  "piv-put-data": page([
    h("What it does"),
    p("PIV PUT DATA (INS `DB`) writes a PIV data object. Data is `{ 5C tag } { 53 value }`. Usually needs PIN and a card management key / SM, depending on the object."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Written"],
        ["`6982`", "Not allowed"],
        ["`6A 84`", "Too large"],
      ]
    ),
  ]),
  "piv-general-authenticate": page([
    h("What it does"),
    p(
      "PIV GENERAL AUTHENTICATE (INS `87`) is used for PIV AUTH / DIG SIG / KEY MGMT / CARD AUTH challenge–response, key establishment, and on-card key generation. Data is a Dynamic Authentication template (tag `7C`) with witness, challenge, response, exponentiation nested tags.",
      "P1-P2 name the algorithm and key reference (for example `00 9A` PIV Authentication key)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Step succeeded"],
        ["`6982`", "PIN / touch required"],
        ["`6A 80`", "Bad `7C` template"],
      ]
    ),
  ]),
  "u2f-register": page([
    h("What it does"),
    p(
      "U2F_REGISTER (INS `01`) registers a new credential. Command data is a 32-byte challenge hash plus a 32-byte application hash. The response is a reserved byte, public key, key handle, attestation certificate, and signature.",
      "CLA is `00`. User presence is required; a wait often returns `6985` until the button is pressed."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Registered"],
        ["`6985`", "Waiting for user presence / conditions"],
      ]
    ),
  ]),
  "u2f-authenticate": page([
    h("What it does"),
    p("U2F_AUTHENTICATE (INS `02`) signs a challenge with an existing key handle."),
    table(
      ["P1", "Mode"],
      [
        ["`03`", "Enforce user presence and sign"],
        ["`07`", "Check-only (no sign)"],
        ["`08`", "Sign without enforcing presence"],
      ]
    ),
    p("Data is challenge hash || application hash || key-handle length || key handle. Response is user-presence byte, counter, signature."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Signed"],
        ["`6A 80`", "Unknown key handle"],
        ["`6985`", "User presence required"],
      ]
    ),
  ]),
  "u2f-version": page([
    h("What it does"),
    p("U2F_VERSION (INS `03`) returns the ASCII version string, usually `U2F_V2`. P1-P2 are `00`. Le is typically `00`."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Version string in DATA"],
      ]
    ),
  ]),
  "uicc-status": page([
    h("What it does"),
    p(
      "UICC STATUS (INS `F2`) returns information about the currently selected file — similar to SELECT FCI without changing the current file. P2 chooses the response type (FCP / FMD / no data / DF name)."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Status returned"],
        ["`6C xx`", "Wrong Le"],
        ["`91 xx`", "Proactive command pending"],
      ]
    ),
  ]),
  "uicc-authenticate": page([
    h("What it does"),
    p(
      "UICC AUTHENTICATE (INS `88` / odd `89`) runs the USIM/ISIM/GSM authentication algorithm. Command data is RAND (and AUTN for UMTS/EPS/5G). P2 encodes MF vs DF-specific and the reference number.",
      "Success returns RES / CK / IK or a GSM SRES/Kc, or AUTS on sync failure."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Authentication output in DATA"],
        ["`9862`", "Authentication error (profile-specific)"],
        ["`6982`", "Access conditions"],
      ]
    ),
  ]),
  "uicc-increase": page([
    h("What it does"),
    p(
      "INCREASE adds a value to a cyclic record EF that stores a counter (for example a call-meter file). Command data is the increment. The response is often the new value."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Increased"],
        ["`6A 84`", "Overflow / no space"],
        ["`6981`", "Wrong file type"],
      ]
    ),
  ]),
  "uicc-retrieve-data": page([
    h("What it does"),
    p(
      "RETRIEVE DATA (INS `CB`) is the UICC odd-INS GET DATA: read a data object from the current DF. Tag is in the command data. Used for UICC-specific objects rather than ISO even-INS `CA`."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Object returned"],
        ["`6A 88`", "Not found"],
      ]
    ),
  ]),
  "uicc-set-data": page([
    h("What it does"),
    p("SET DATA (INS `DB`) is the UICC odd-INS PUT DATA: store a data object in the current DF. Tag and value in command data."),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Stored"],
        ["`6982`", "Not allowed"],
      ]
    ),
  ]),
  "cat-terminal-profile": page([
    h("What it does"),
    p(
      "TERMINAL PROFILE (CLA `80`, INS `10`) tells the UICC which SIM Toolkit / USAT facilities the terminal supports. Command data is a bit-mapped capability list. Sent once after ATR / PROFILE DOWNLOAD."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Accepted"],
        ["`91 xx`", "Proactive command pending — FETCH"],
      ]
    ),
  ]),
  "cat-fetch": page([
    h("What it does"),
    p(
      "FETCH (CLA `80`, INS `12`) retrieves a pending **proactive command** after the card returned `91 xx`. Le should be `xx`. The terminal then performs the proactive command and answers with TERMINAL RESPONSE."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Proactive command in DATA"],
        ["`91 xx`", "Another command already pending"],
      ]
    ),
  ]),
  "cat-terminal-response": page([
    h("What it does"),
    p(
      "TERMINAL RESPONSE (CLA `80`, INS `14`) reports the result of a proactive command to the UICC (OK, user cancelled, terminal unable, …). Data is BER-TLV matching the FETCH’d command."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "Accepted; session idle"],
        ["`91 xx`", "Another proactive command pending"],
      ]
    ),
  ]),
  "demo-vendor-ping": page([
    h("What it does"),
    p(
      "DEMO VENDOR PING is the sample **custom** command shipped with this extension (`catalog/custom/demo.json`). Copy that JSON (and this page) to name your own proprietary APDUs.",
      "CLA `80`, INS `EE`. P1 `00` echo / `01` version query. Data is a 2-byte token plus payload."
    ),
    h("Typical status"),
    table(
      ["SW", "Meaning"],
      [
        ["`90 00`", "OK"],
        ["`9F 81`", "Demo vendor busy"],
      ]
    ),
  ]),
};

const sw = {
  "sw-9000": ["Normal processing", "The command succeeded. Response data (if any) is complete. On T=0 this is also what you get after the last GET RESPONSE."],
  "sw-61xx": ["More data available", "`xx` is the number of extra bytes. Send GET RESPONSE with Le = `xx`. Do not send a different command first. Typical on T=0 after SELECT FCI or GET DATA."],
  "sw-6200": ["Warning, NV unchanged", "The command finished with a warning. Non-volatile memory was not changed. Treat as success only if your application accepts the warning."],
  "sw-6281": ["Part of returned data may be corrupted", "The card returned data but believes some of it may be bad (for example a worn EF). Parse cautiously."],
  "sw-6282": ["End of file or record reached before Le", "A read succeeded but fewer than Le bytes / records were available. Common on READ BINARY of a short file. The data you got is still valid."],
  "sw-6283": ["Selected file invalidated / deactivated", "SELECT found the file but it is deactivated or invalidated (EMV application blocked, ISO DEACTIVATE FILE). You may not be able to use it until ACTIVATE / UNBLOCK."],
  "sw-6284": ["FCI not formatted per ISO 7816-4", "SELECT succeeded but the file control information is proprietary or malformed. You still have a current file."],
  "sw-6285": ["Selected file in termination state", "The DF/EF has been terminated (ISO 7816-9). It cannot return to operational use."],
  "sw-6286": ["No input data available from a sensor", "A biometric or sensor VERIFY/read had nothing to sample."],
  "sw-6300": ["Warning, NV changed", "Command ran; EEPROM/flash was modified; still a warning (authentication failed on some GP/EMV cards, or a non-fatal update)."],
  "sw-6381": ["File filled up by the last write", "The write/append succeeded and the file is now full. Further writes will fail with `6A84` until records are erased."],
  "sw-63cx": ["Counter provided by x", "SW2 low nibble `x` is a remaining-try counter, almost always PIN tries after a failed VERIFY. `63 C0` means zero tries left — usually followed by a block (`6983`)."],
  "sw-6400": ["Execution error, NV unchanged", "The card aborted before writing NVM. Retry may be safe; the previous value is intact."],
  "sw-6401": ["Immediate response required", "The card needs a follow-up (often another command in a chain) right now."],
  "sw-6500": ["Execution error, NV changed", "The command failed after it had already written NVM. State may be inconsistent; do not blindly retry a write."],
  "sw-6581": ["Memory failure", "NVM program/erase failed. GlobalPlatform uses this on LOAD/PUT KEY as well."],
  "sw-6600": ["Security-related issues", "A catch-all security error when a more precise `69xx` / `6Axx` is not given."],
  "sw-6700": ["Wrong length", "Lc or the case (presence of DATA/Le) does not match what the card expects. Check whether the APDU is case 1–4, short vs extended."],
  "sw-6800": ["Functions in CLA not supported", "The CLA claims a feature this card does not implement (SM, chaining, channel)."],
  "sw-6881": ["Logical channel not supported", "MANAGE CHANNEL or a non-zero channel in CLA is not available."],
  "sw-6882": ["Secure messaging not supported", "CLA requested SM and this file/card will not do SM."],
  "sw-6883": ["Last command of the chain expected", "You sent a chained command when the card expected the final chain piece (CLA bit 5)."],
  "sw-6884": ["Command chaining not supported", "CLA chaining bit set, card does not chain."],
  "sw-6900": ["Command not allowed", "Generic ‘not allowed’. Prefer the more specific `698x` when present."],
  "sw-6981": ["Command incompatible with file structure", "READ BINARY on a record EF, READ RECORD on a transparent EF, INCREASE on a non-counter file, and similar mismatches."],
  "sw-6982": ["Security status not satisfied", "Missing PIN, missing SM, or missing EXTERNAL AUTH. VERIFY or open a secure channel, then retry."],
  "sw-6983": ["Authentication method blocked", "Retry counter hit zero (PIN, PUK, or auth key). Needs RESET RETRY COUNTER / unblock / issuer script."],
  "sw-6984": ["Referenced data invalidated", "The PIN or key reference is invalidated (usage exhausted, or EMV ‘data invalidated’)."],
  "sw-6985": ["Conditions of use not satisfied", "Wrong life-cycle, missing prior GPO/MSE, U2F user presence, or EMV state machine. Very common; read it as ‘not in the right state’, not ‘bad PIN’."],
  "sw-6986": ["Command not allowed (no current EF)", "You needed a current elementary file and none is selected. SELECT FILE first."],
  "sw-6987": ["Expected SM data objects missing", "CLA said secure messaging but the MAC / cryptogram objects are absent."],
  "sw-6988": ["Incorrect SM data objects", "SM present but MAC or padding failed (wrong session keys, wrong ICV)."],
  "sw-6a00": ["Wrong parameters P1-P2", "Generic P1-P2 error. Prefer `6A86` when the card sends it."],
  "sw-6a80": ["Incorrect parameters in the data field", "Lc/DATA does not match the expected TLV or length. Check PDOL, FCP, or tag encoding."],
  "sw-6a81": ["Function not supported", "INS is known in ISO but this card/applet does not implement it, or the card is blocked."],
  "sw-6a82": ["File or application not found", "SELECT FID/AID missed, or PIV object / path does not exist. EMV catalogs the same SW as ‘File not found’."],
  "sw-6a83": ["Record not found", "READ/UPDATE RECORD P1 is past the last record, or SEARCH found nothing."],
  "sw-6a84": ["Not enough memory space in the file", "CREATE/APPEND/PUT/LOAD ran out of NVM or the EF is full."],
  "sw-6a85": ["Nc inconsistent with TLV structure", "Declared Lc does not match the BER-TLV objects inside DATA."],
  "sw-6a86": ["Incorrect parameters P1-P2", "This P1-P2 combination is invalid for this INS (for example a reserved SELECT P1)."],
  "sw-6a87": ["Nc inconsistent with P1-P2", "Lc does not match what P1-P2 implies (SELECT by FID must be 2 bytes, and so on)."],
  "sw-6a88": ["Referenced data not found", "Tag, key identifier, or AID in GET DATA / MSE / GP is unknown in this context."],
  "sw-6a89": ["File already exists", "CREATE FILE / INSTALL used an FID or name that is already in the DF."],
  "sw-6a8a": ["DF name already exists", "CREATE DF / INSTALL AID collision on the DF name."],
  "sw-6b00": ["Wrong parameters P1-P2", "Often an offset outside the file on READ/UPDATE BINARY. Distinct from `6A86` on many cards."],
  "sw-6cxx": ["Wrong Le; SW2 is the exact length", "Resend the **same** command with Le = `xx`. Do not change P1-P2 or DATA. Classic on READ RECORD when you guessed Le."],
  "sw-6d00": ["Instruction code not supported or invalid", "INS is not implemented on this applet. Check you selected the right AID."],
  "sw-6e00": ["Class not supported", "CLA is wrong (proprietary vs interindustry, or SM bits the applet rejects)."],
  "sw-6f00": ["No precise diagnosis", "Internal error with no better SW. Not a PIN or file-not-found — look at the previous command."],
  "sw-91xx": ["Proactive command pending", "UICC CAT: `xx` is the length of a proactive command. FETCH with Le = `xx`, then TERMINAL RESPONSE."],
  "sw-9300": ["SIM Application Toolkit busy", "The toolkit cannot accept ENVELOPE / a new proactive session right now. Retry later."],
  "sw-9exx": ["SIM data download error", "ENVELOPE data download failed. `xx` is a 3GPP error qualifier."],
  "sw-9fxx": ["Length xx of response data (GSM SELECT)", "Old GSM SELECT: response length is `xx`. Send GET RESPONSE. Not the same as `61 xx`, but you handle it the same way."],
  "sw-9f81": ["Demo vendor busy", "Sample overlay status for DEMO VENDOR PING. Replace this page in `catalog/custom/about/` when you define real vendor SWs."],
  "sw-9484": ["Algorithm not supported", "GlobalPlatform PUT KEY / crypto: the key type or SCP algorithm is not on this card."],
  "sw-9485": ["Invalid key check value", "PUT KEY: the KCV did not match the decrypted key. Check encryption under the current DEK and the KCV algorithm."],
};

for (const [name, body] of Object.entries(commands)) write(`${name}.md`, body);

for (const [name, [title, text]] of Object.entries(sw)) {
  write(
    `${name}.md`,
    `## ${title}\n\n${text}\n\nThe instance table above is **this** status word. Other commands may return the same SW in different contexts — read P1/P2 of the command that produced it.\n`
  );
}

console.log("wrote missing about pages into", dir);
