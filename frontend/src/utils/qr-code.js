const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const SIZE = 29;
const DATA_CODEWORDS = 55;
const EC_CODEWORDS = 15;

const GF_EXP = new Array(512);
const GF_LOG = new Array(256);

let value = 1;
for (let index = 0; index < 255; index += 1) {
  GF_EXP[index] = value;
  GF_LOG[value] = index;
  value <<= 1;
  if (value & 0x100) {
    value ^= 0x11d;
  }
}

for (let index = 255; index < 512; index += 1) {
  GF_EXP[index] = GF_EXP[index - 255];
}

function appendBits(buffer, valueToAppend, bitCount) {
  for (let bit = bitCount - 1; bit >= 0; bit -= 1) {
    buffer.push((valueToAppend >>> bit) & 1);
  }
}

function multiplyGf(left, right) {
  if (left === 0 || right === 0) {
    return 0;
  }

  return GF_EXP[GF_LOG[left] + GF_LOG[right]];
}

function buildGeneratorPolynomial(degree) {
  let polynomial = [1];

  for (let index = 0; index < degree; index += 1) {
    const next = new Array(polynomial.length + 1).fill(0);

    for (let termIndex = 0; termIndex < polynomial.length; termIndex += 1) {
      next[termIndex] ^= multiplyGf(polynomial[termIndex], GF_EXP[index]);
      next[termIndex + 1] ^= polynomial[termIndex];
    }

    polynomial = next;
  }

  return polynomial;
}

function buildErrorCorrection(dataCodewords) {
  const generator = buildGeneratorPolynomial(EC_CODEWORDS);
  const remainder = new Array(EC_CODEWORDS).fill(0);

  dataCodewords.forEach((codeword) => {
    const factor = codeword ^ remainder[0];
    remainder.shift();
    remainder.push(0);

    generator.slice(1).forEach((coefficient, index) => {
      remainder[index] ^= multiplyGf(coefficient, factor);
    });
  });

  return remainder;
}

function encodeAlphanumeric(text) {
  const characters = String(text ?? "").toUpperCase();

  if (!characters || characters.length > 77) {
    throw new Error("QR payload must contain 1 to 77 supported characters.");
  }

  for (const character of characters) {
    if (!ALPHANUMERIC_CHARS.includes(character)) {
      throw new Error(`Unsupported QR character: ${character}`);
    }
  }

  const bits = [];
  appendBits(bits, 0b0010, 4);
  appendBits(bits, characters.length, 9);

  for (let index = 0; index < characters.length; index += 2) {
    const first = ALPHANUMERIC_CHARS.indexOf(characters[index]);
    const second = characters[index + 1];

    if (second) {
      appendBits(bits, first * 45 + ALPHANUMERIC_CHARS.indexOf(second), 11);
    } else {
      appendBits(bits, first, 6);
    }
  }

  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const dataCodewords = [];
  for (let index = 0; index < bits.length; index += 8) {
    let codeword = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      codeword = (codeword << 1) | bits[index + bit];
    }
    dataCodewords.push(codeword);
  }

  const padWords = [0xec, 0x11];
  while (dataCodewords.length < DATA_CODEWORDS) {
    dataCodewords.push(padWords[dataCodewords.length % 2]);
  }

  return [...dataCodewords, ...buildErrorCorrection(dataCodewords)];
}

function createEmptyMatrix() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function setModule(matrix, row, column, dark) {
  if (row < 0 || row >= SIZE || column < 0 || column >= SIZE) {
    return;
  }

  matrix[row][column] = Boolean(dark);
}

function addFinderPattern(matrix, top, left) {
  for (let row = -1; row <= 7; row += 1) {
    for (let column = -1; column <= 7; column += 1) {
      const matrixRow = top + row;
      const matrixColumn = left + column;
      const inPattern = row >= 0 && row <= 6 && column >= 0 && column <= 6;
      const isDark =
        inPattern &&
        (row === 0 || row === 6 || column === 0 || column === 6 || (row >= 2 && row <= 4 && column >= 2 && column <= 4));

      setModule(matrix, matrixRow, matrixColumn, isDark);
    }
  }
}

function addAlignmentPattern(matrix, centerRow, centerColumn) {
  for (let row = -2; row <= 2; row += 1) {
    for (let column = -2; column <= 2; column += 1) {
      const distance = Math.max(Math.abs(row), Math.abs(column));
      setModule(matrix, centerRow + row, centerColumn + column, distance !== 1);
    }
  }
}

function reserveFormatAreas(matrix) {
  for (let index = 0; index < 9; index += 1) {
    if (matrix[8][index] === null) {
      setModule(matrix, 8, index, false);
    }
    if (matrix[index][8] === null) {
      setModule(matrix, index, 8, false);
    }
  }

  for (let index = 0; index < 8; index += 1) {
    if (matrix[SIZE - 1 - index][8] === null) {
      setModule(matrix, SIZE - 1 - index, 8, false);
    }
    if (matrix[8][SIZE - 1 - index] === null) {
      setModule(matrix, 8, SIZE - 1 - index, false);
    }
  }
}

function createBaseMatrix() {
  const matrix = createEmptyMatrix();

  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, SIZE - 7);
  addFinderPattern(matrix, SIZE - 7, 0);
  addAlignmentPattern(matrix, 22, 22);

  for (let index = 8; index < SIZE - 8; index += 1) {
    setModule(matrix, 6, index, index % 2 === 0);
    setModule(matrix, index, 6, index % 2 === 0);
  }

  setModule(matrix, SIZE - 8, 8, true);
  reserveFormatAreas(matrix);

  return matrix;
}

function maskApplies(mask, row, column) {
  switch (mask) {
    case 0:
      return (row + column) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return column % 3 === 0;
    case 3:
      return (row + column) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(column / 3)) % 2 === 0;
    case 5:
      return ((row * column) % 2) + ((row * column) % 3) === 0;
    case 6:
      return (((row * column) % 2) + ((row * column) % 3)) % 2 === 0;
    case 7:
      return (((row + column) % 2) + ((row * column) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function placeData(matrix, codewords, mask) {
  const bits = [];
  codewords.forEach((codeword) => appendBits(bits, codeword, 8));

  let bitIndex = 0;
  let upward = true;

  for (let column = SIZE - 1; column > 0; column -= 2) {
    if (column === 6) {
      column -= 1;
    }

    for (let offset = 0; offset < SIZE; offset += 1) {
      const row = upward ? SIZE - 1 - offset : offset;

      for (let delta = 0; delta < 2; delta += 1) {
        const currentColumn = column - delta;
        if (matrix[row][currentColumn] !== null) {
          continue;
        }

        const bit = bitIndex < bits.length ? bits[bitIndex] : 0;
        bitIndex += 1;
        setModule(matrix, row, currentColumn, Boolean(bit) !== maskApplies(mask, row, currentColumn));
      }
    }

    upward = !upward;
  }
}

function buildFormatBits(mask) {
  const formatData = (0b01 << 3) | mask;
  let remainder = formatData << 10;
  const generator = 0x537;

  while (remainder >= (1 << 10)) {
    const shift = remainder.toString(2).length - 11;
    remainder ^= generator << shift;
  }

  return ((formatData << 10) | remainder) ^ 0x5412;
}

function placeFormatBits(matrix, mask) {
  const formatBits = buildFormatBits(mask);
  const firstPositions = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8]
  ];
  const secondPositions = [
    [SIZE - 1, 8],
    [SIZE - 2, 8],
    [SIZE - 3, 8],
    [SIZE - 4, 8],
    [SIZE - 5, 8],
    [SIZE - 6, 8],
    [SIZE - 7, 8],
    [8, SIZE - 8],
    [8, SIZE - 7],
    [8, SIZE - 6],
    [8, SIZE - 5],
    [8, SIZE - 4],
    [8, SIZE - 3],
    [8, SIZE - 2],
    [8, SIZE - 1]
  ];

  firstPositions.forEach(([row, column], index) => {
    const dark = ((formatBits >> index) & 1) === 1;
    setModule(matrix, row, column, dark);
  });

  secondPositions.forEach(([row, column], index) => {
    const dark = ((formatBits >> index) & 1) === 1;
    setModule(matrix, row, column, dark);
  });
}

function scoreRuns(values) {
  let penalty = 0;
  let runLength = 1;

  for (let index = 1; index <= values.length; index += 1) {
    if (index < values.length && values[index] === values[index - 1]) {
      runLength += 1;
      continue;
    }

    if (runLength >= 5) {
      penalty += 3 + (runLength - 5);
    }
    runLength = 1;
  }

  return penalty;
}

function scoreMatrix(matrix) {
  let penalty = 0;

  for (let row = 0; row < SIZE; row += 1) {
    penalty += scoreRuns(matrix[row]);
  }

  for (let column = 0; column < SIZE; column += 1) {
    const values = [];
    for (let row = 0; row < SIZE; row += 1) {
      values.push(matrix[row][column]);
    }
    penalty += scoreRuns(values);
  }

  for (let row = 0; row < SIZE - 1; row += 1) {
    for (let column = 0; column < SIZE - 1; column += 1) {
      const value = matrix[row][column];
      if (
        value === matrix[row][column + 1] &&
        value === matrix[row + 1][column] &&
        value === matrix[row + 1][column + 1]
      ) {
        penalty += 3;
      }
    }
  }

  const patterns = ["10111010000", "00001011101"];
  for (let row = 0; row < SIZE; row += 1) {
    const rowString = matrix[row].map((cell) => (cell ? "1" : "0")).join("");
    patterns.forEach((pattern) => {
      for (let index = 0; index <= rowString.length - pattern.length; index += 1) {
        if (rowString.slice(index, index + pattern.length) === pattern) {
          penalty += 40;
        }
      }
    });
  }

  for (let column = 0; column < SIZE; column += 1) {
    let columnString = "";
    for (let row = 0; row < SIZE; row += 1) {
      columnString += matrix[row][column] ? "1" : "0";
    }
    patterns.forEach((pattern) => {
      for (let index = 0; index <= columnString.length - pattern.length; index += 1) {
        if (columnString.slice(index, index + pattern.length) === pattern) {
          penalty += 40;
        }
      }
    });
  }

  const darkModules = matrix.flat().filter(Boolean).length;
  const darkPercent = (darkModules * 100) / (SIZE * SIZE);
  penalty += Math.floor(Math.abs(darkPercent - 50) / 5) * 10;

  return penalty;
}

function renderSvg(matrix, scale = 4, border = 4) {
  const dimension = (SIZE + border * 2) * scale;
  let modules = "";

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      if (!matrix[row][column]) {
        continue;
      }

      modules += `<rect x="${(column + border) * scale}" y="${(row + border) * scale}" width="${scale}" height="${scale}"/>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}" shape-rendering="crispEdges">
  <rect width="${dimension}" height="${dimension}" fill="#ffffff"/>
  <g fill="#111111">${modules}</g>
</svg>`;
}

export function buildQrSvgDataUrl(text, options = {}) {
  const codewords = encodeAlphanumeric(text);
  const baseMatrix = createBaseMatrix();

  let bestMatrix = null;
  let bestPenalty = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask += 1) {
    const matrix = cloneMatrix(baseMatrix);
    placeData(matrix, codewords, mask);
    placeFormatBits(matrix, mask);

    const penalty = scoreMatrix(matrix);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMatrix = matrix;
    }
  }

  const svg = renderSvg(bestMatrix, options.scale ?? 4, options.border ?? 4);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
