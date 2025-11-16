export interface DiffSegment {
  type: 'add' | 'remove' | 'same';
  text: string;
}

export const computeWordDiff = (oldText: string, newText: string): DiffSegment[] => {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  
  const result: DiffSegment[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldWords.length || newIndex < newWords.length) {
    if (oldIndex >= oldWords.length) {
      // Remaining words in new text are additions
      result.push({ type: 'add', text: newWords[newIndex] });
      newIndex++;
    } else if (newIndex >= newWords.length) {
      // Remaining words in old text are deletions
      result.push({ type: 'remove', text: oldWords[oldIndex] });
      oldIndex++;
    } else if (oldWords[oldIndex] === newWords[newIndex]) {
      // Words match
      result.push({ type: 'same', text: oldWords[oldIndex] });
      oldIndex++;
      newIndex++;
    } else {
      // Words differ - look ahead to find match
      const oldLookAhead = oldWords.slice(oldIndex + 1, oldIndex + 6);
      const newLookAhead = newWords.slice(newIndex + 1, newIndex + 6);
      
      const oldFoundInNew = newLookAhead.indexOf(oldWords[oldIndex]);
      const newFoundInOld = oldLookAhead.indexOf(newWords[newIndex]);

      if (oldFoundInNew !== -1 && (newFoundInOld === -1 || oldFoundInNew < newFoundInOld)) {
        // Old word found in new context - words before it are additions
        result.push({ type: 'add', text: newWords[newIndex] });
        newIndex++;
      } else if (newFoundInOld !== -1) {
        // New word found in old context - words before it are deletions
        result.push({ type: 'remove', text: oldWords[oldIndex] });
        oldIndex++;
      } else {
        // Neither found - treat as replacement
        result.push({ type: 'remove', text: oldWords[oldIndex] });
        result.push({ type: 'add', text: newWords[newIndex] });
        oldIndex++;
        newIndex++;
      }
    }
  }

  return result;
};

export const computeMetricsDelta = (oldValue: number, newValue: number) => {
  const delta = newValue - oldValue;
  const percentChange = oldValue > 0 ? ((delta / oldValue) * 100).toFixed(1) : '0';
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
  
  return {
    delta,
    percentChange: `${delta > 0 ? '+' : ''}${percentChange}%`,
    direction,
  };
};
