export default (file: string, lines: string[]) => {
  const snippet: string[] = [];
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
      if (snippet.length < 20) snippet.push(line);
    }

    if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
      if (snippet.length < 20) snippet.push(line);
    }
  }

  return {
    file,
    additions,
    deletions,
    signals: ['markup updated'],
    snippet,
  };
};
