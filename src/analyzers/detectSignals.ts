export const detectSignals = (line: string, signals: string[]) => {
  if (/function\s+\w+/.test(line)) signals.push('function added');

  if (/class\s+\w+/.test(line)) signals.push('class added');

  if (/import\s+/.test(line)) signals.push('imports updated');

  if (/export\s+/.test(line)) signals.push('exports updated');

  if (/FROM\s+/.test(line)) signals.push('docker base image change');

  if (/version/.test(line)) signals.push('version updated');
};
