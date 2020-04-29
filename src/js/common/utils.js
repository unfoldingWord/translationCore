const electron = require('electron');

export function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
};

// noinspection JSUnusedLocalSymbols
export async function logMemory(title, intial = false) {
  const emphasis = '############\n';
  const localProcess = process;
  let output = `\n\n${emphasis} ${title}\nlogMemory()\n`;
  const remoteProcess = electron && electron.remote && electron.remote.process;

  if (remoteProcess) {
    output += `electron.remote.process.getHeapStatistics() = ${JSON.stringify(remoteProcess.getHeapStatistics(), null, 2)}\n`;
    output += `electron.remote.process.getSystemMemoryInfo() = ${JSON.stringify(remoteProcess.getSystemMemoryInfo(), null, 2)}\n`;
  }

  const processMemoryInfo2 = await localProcess.getProcessMemoryInfo();
  output += `process.getProcessMemoryInfo() = ${JSON.stringify(processMemoryInfo2, null, 2)}\n`;
  output += emphasis + '\n';
  console.log(output);
}
