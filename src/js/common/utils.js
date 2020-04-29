const electron = require('electron');

export function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
};

// noinspection JSUnusedLocalSymbols
export async function logMemory(title, intial = false) {
  const localProcess = process;

  if (localProcess.getProcessMemoryInfo) {
    const emphasis = '############\n';
    let output = `\n\n${emphasis} ${title}\nlogMemory()\n`;
    const remoteProcess = electron && electron.remote && electron.remote.process;

    if (remoteProcess) {
      output += `electron.remote.process.getHeapStatistics() = ${JSON.stringify(remoteProcess.getHeapStatistics(), null, 2)}\n`;
      output += `electron.remote.process.getSystemMemoryInfo() = ${JSON.stringify(remoteProcess.getSystemMemoryInfo(), null, 2)}\n`;
      output += `process.getHeapStatistics() = ${JSON.stringify(localProcess.getHeapStatistics(), null, 2)}\n`;
      output += `process.getSystemMemoryInfo() = ${JSON.stringify(localProcess.getSystemMemoryInfo(), null, 2)}\n`;
    }

    const processMemoryInfo = await localProcess.getProcessMemoryInfo();
    output += `process.getProcessMemoryInfo() = ${JSON.stringify(processMemoryInfo, null, 2)}\n`;
    output += emphasis + '\n';
    console.log(output);
  }
}
