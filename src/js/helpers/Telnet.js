import TelnetClient from 'telnet-client';

/**
 * Opens a telnet connection
 * @param {string} host
 * @param {int} port
 * @return {*}
 */
export const openTelnet = (host, port) => {
  let connection = new TelnetClient();
  let params = {
    host,
    port,
    shellPrompt: '/ # ',
    timeout: 1500
  };
  return connection.connect(params);
};
