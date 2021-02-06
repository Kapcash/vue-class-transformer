export class ErrorManager {
  errorMap = new Map<string, Error[]>();

  addError(fileName: string, message: Error) {
    if (this.errorMap.has(fileName)) {
      const errorEntry = this.errorMap.get(fileName);
      errorEntry.push(message);
    } else {
      this.errorMap.set(fileName, [message]);
    }
  }

  toString() {
    const errorLogs: string[] = [];
    for(const [name, errors] of this.errorMap.entries()) {
      errorLogs.push(`- ${name}: ${errors.map(err => err.stack || err.message)}`);
    }
    return errorLogs.join('\n\n');
  }
}