type DiffSummary = {
  file: string;
  additions: number;
  deletions: number;
  signals: string[];
  snippet: string[];
};

type Intent = {
  type: string;
  description: string;
};

// ✅ Extract file name (without extension)
const getFileBase = (file: string) => {
  return (
    file
      .split('/')
      .pop()
      ?.replace(/\.[^/.]+$/, '') || file
  );
};

// ✅ Convert camelCase / PascalCase → readable words
const formatName = (name: string) => {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → words
    .toLowerCase();
};

export function buildIntent(summary: DiffSummary[]): Intent {
  let hasFunction = false;
  let hasExport = false;
  let hasDebug = false;
  let hasOnlyAdditions = true;
  let hasMultipleFiles = summary.length > 1;

  const fileNames = summary.map((s) => formatName(getFileBase(s.file)));

  for (const file of summary) {
    if (file.signals.includes('function added')) hasFunction = true;
    if (file.signals.includes('exports updated')) hasExport = true;

    if (file.snippet.some((l) => l.includes('console.log'))) {
      hasDebug = true;
    }

    if (file.deletions > 0) hasOnlyAdditions = false;
  }

  const mainFile = fileNames[0];

  // 🔥 PRIORITY RULES

  // 1️⃣ Debug logs (highest priority)
  if (hasDebug) {
    return {
      type: 'chore',
      description: 'add debug logs',
    };
  }

  // 2️⃣ Function additions → best signal
  if (hasFunction) {
    return {
      type: 'feat',
      description: `add ${mainFile} function`,
    };
  }

  // 3️⃣ Exports → module-level change
  if (hasExport) {
    return {
      type: 'feat',
      description: `add ${mainFile} module`,
    };
  }

  // 4️⃣ Multiple files → broader change
  if (hasMultipleFiles) {
    return {
      type: 'feat',
      description: `update multiple files`,
    };
  }

  // 5️⃣ Only additions → new file
  if (hasOnlyAdditions) {
    return {
      type: 'feat',
      description: `add ${mainFile}`,
    };
  }

  // 6️⃣ Default fallback
  return {
    type: 'chore',
    description: `update ${mainFile}`,
  };
}
