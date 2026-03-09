export default (file: string, lines: string[]) => {
  const snippet: string[] = [];

  for (const line of lines) {
    if (line.startsWith('+') || line.startsWith('-')) {
      if (snippet.length < 30) snippet.push(line);
    }
  }

  return {
    file,
    additions: snippet.filter((l) => l.startsWith('+')).length,
    deletions: snippet.filter((l) => l.startsWith('-')).length,
    signals: ['config updated'],
    snippet,
  };
};
