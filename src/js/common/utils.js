const electron = require('electron');

export function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
};

// noinspection JSUnusedLocalSymbols
export async function logMemory(title, intial = false) {
  const localProcess = process;
  const process_ = electron.remote.process;
  const emphasis = '############\n';
  let output = `\n\n${emphasis} ${title}\nlogMemory()\n`;
  output += `electron.remote.process.getHeapStatistics() = ${JSON.stringify(process_.getHeapStatistics(), null, 2)}\n`;
  output += `electron.remote.process.getSystemMemoryInfo() = ${JSON.stringify(process_.getSystemMemoryInfo(), null, 2)}\n`;
  const processMemoryInfo2 = await localProcess.getProcessMemoryInfo();
  output += `process.getProcessMemoryInfo() = ${JSON.stringify(processMemoryInfo2, null, 2)}\n`;
  output += emphasis + '\n';
  console.log(output);
}
