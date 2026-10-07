"use strict";

function readU16(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function parseShortCommand(bytes) {
  const len = bytes.length;
  if (len < 4) return null;
  const header = {
    cla: bytes[0],
    ins: bytes[1],
    p1: bytes[2],
    p2: bytes[3],
  };
  if (len === 4) {
    return { ...header, case: "1", lc: 0, data: [], le: null, extended: false };
  }

  const b4 = bytes[4];

  if (len === 5) {
    return {
      ...header,
      case: "2S",
      lc: 0,
      data: [],
      le: b4 === 0 ? 256 : b4,
      leRaw: [b4],
      extended: false,
    };
  }

  if (b4 !== 0 && len === 5 + b4) {
    return {
      ...header,
      case: "3S",
      lc: b4,
      lcRaw: [b4],
      data: bytes.slice(5, 5 + b4),
      le: null,
      extended: false,
    };
  }

  if (b4 !== 0 && len === 6 + b4) {
    const leByte = bytes[len - 1];
    return {
      ...header,
      case: "4S",
      lc: b4,
      lcRaw: [b4],
      data: bytes.slice(5, 5 + b4),
      le: leByte === 0 ? 256 : leByte,
      leRaw: [leByte],
      extended: false,
    };
  }

  return null;
}

function parseExtendedCommand(bytes) {
  const len = bytes.length;
  if (len < 7 || bytes[4] !== 0) return null;
  const header = {
    cla: bytes[0],
    ins: bytes[1],
    p1: bytes[2],
    p2: bytes[3],
  };

  if (len === 7) {
    const le = readU16(bytes, 5);
    return {
      ...header,
      case: "2E",
      lc: 0,
      data: [],
      le: le === 0 ? 65536 : le,
      leRaw: bytes.slice(4, 7),
      extended: true,
    };
  }

  const lc = readU16(bytes, 5);
  if (lc === 0) return null;
  if (len === 7 + lc) {
    return {
      ...header,
      case: "3E",
      lc,
      lcRaw: bytes.slice(4, 7),
      data: bytes.slice(7, 7 + lc),
      le: null,
      extended: true,
    };
  }
  if (len === 9 + lc) {
    const le = readU16(bytes, 7 + lc);
    return {
      ...header,
      case: "4E",
      lc,
      lcRaw: bytes.slice(4, 7),
      data: bytes.slice(7, 7 + lc),
      le: le === 0 ? 65536 : le,
      leRaw: bytes.slice(7 + lc),
      extended: true,
    };
  }
  return null;
}

function parseCommand(bytes) {
  if (!bytes || bytes.length < 4) return null;
  return parseShortCommand(bytes) || parseExtendedCommand(bytes);
}

function isLikelyStatusWord(sw1, sw2, knownExact, knownPatterns) {
  const hex = toSwHex(sw1, sw2);
  if (knownExact && knownExact.has(hex)) return true;
  if (knownPatterns && knownPatterns.some((p) => p.re.test(hex))) return true;
  if (sw1 === 0x90 && sw2 === 0x00) return true;
  if (sw1 === 0x61 || sw1 === 0x6c) return true;
  if (sw1 >= 0x62 && sw1 <= 0x6f) return true;
  if (sw1 === 0x91 || sw1 === 0x92 || sw1 === 0x9e || sw1 === 0x9f) return true;
  return false;
}

function toSwHex(sw1, sw2) {
  return (
    sw1.toString(16).toUpperCase().padStart(2, "0") +
    sw2.toString(16).toUpperCase().padStart(2, "0")
  );
}

function parseResponse(bytes) {
  if (!bytes || bytes.length < 2) return null;
  const sw1 = bytes[bytes.length - 2];
  const sw2 = bytes[bytes.length - 1];
  return {
    data: bytes.slice(0, bytes.length - 2),
    sw1,
    sw2,
    sw: toSwHex(sw1, sw2),
  };
}

function classify(bytes, swIndex) {
  const command = parseCommand(bytes);
  const response = parseResponse(bytes);
  const len = bytes.length;

  let commandScore = 0;
  let responseScore = 0;

  if (len === 2 && response) {
    if (isLikelyStatusWord(response.sw1, response.sw2, swIndex.exact, swIndex.patterns)) {
      responseScore = 8;
    }
  }

  if (command) {
    commandScore = 4;
    if ((command.ins & 1) === 0) commandScore += 1;
  }

  if (response && len > 2) {
    if (isLikelyStatusWord(response.sw1, response.sw2, swIndex.exact, swIndex.patterns)) {
      responseScore += command ? 2 : 5;
    }
  }

  if (len === 2 && responseScore >= 4) {
    return { kind: "response", command: null, response, commandScore, responseScore };
  }
  if (command && commandScore >= responseScore) {
    const kind = responseScore >= 4 ? "ambiguous" : "command";
    return { kind, command, response, commandScore, responseScore };
  }
  if (response && responseScore > commandScore) {
    return { kind: "response", command: null, response, commandScore, responseScore };
  }
  if (command) {
    return { kind: "command", command, response, commandScore, responseScore };
  }
  return { kind: "unknown", command: null, response, commandScore, responseScore };
}

function shouldAutoDetect(bytes, parsed) {
  if (!bytes || bytes.length < 2) return false;
  if (bytes.length === 2) return parsed.kind === "response";
  if (bytes.length === 3) return false;
  if (parsed.kind === "command" || parsed.kind === "ambiguous") return true;
  if (parsed.kind === "response" && bytes.length >= 4) return true;
  return false;
}

function neededCommandLengths(bytes) {
  if (!bytes || bytes.length < 4) return [];
  if (bytes.length === 4) return [4];
  const b4 = bytes[4];
  if (b4 !== 0) return [5 + b4, 6 + b4];
  if (bytes.length < 7) return [7];
  const lc = (bytes[5] << 8) | bytes[6];
  if (lc === 0) return [7];
  return [7 + lc, 9 + lc];
}

function isIncompleteCommand(bytes) {
  if (!bytes || bytes.length < 4) return false;
  if (parseCommand(bytes)) return false;
  return neededCommandLengths(bytes).some((n) => n > bytes.length);
}

function maxNeededCommandLength(bytes) {
  const needed = neededCommandLengths(bytes);
  return needed.length ? Math.max.apply(null, needed) : 0;
}

module.exports = {
  parseCommand,
  parseResponse,
  classify,
  shouldAutoDetect,
  isLikelyStatusWord,
  toSwHex,
  neededCommandLengths,
  isIncompleteCommand,
  maxNeededCommandLength,
};
