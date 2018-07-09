const child_process = jest.genMockFromModule('child_process');

function exec() {
  let cb = arguments[arguments.length - 1];
  cb();
}

child_process.exec = jest.fn(exec);

module.exports = child_process;