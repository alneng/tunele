function mergeArrays(serverArray, clientArray) {
  if (!clientArray) return serverArray;

  // Create a set to hold unique IDs from the server
  let uniqueIds = new Set(serverArray.map((g) => g.id));

  // Filter out client data that has IDs already in server data
  let newData = clientArray.filter((g) => !uniqueIds.has(g.id));

  // Combine server data with the new data from the client and sort by id
  const concatArray = serverArray.concat(newData);
  const sortedArray = concatArray.sort((a, b) => a.id - b.id);
  return sortedArray;
}

/**
 * Merges user data stored in the server with incoming data from the client.
 * Gives priority to data already saved in the server
 *
 * @param serverData the data on the server
 * @param clientData the data to be saved to the server
 * @returns the new merged server and client data
 */
function mergeGameData(serverData, clientData) {
  serverData.main = mergeArrays(serverData.main, clientData.main);

  if (!serverData.custom) {
    serverData.custom = clientData.custom;
  } else {
    for (let key in clientData.custom) {
      if (!serverData.custom[key]) {
        serverData.custom[key] = clientData.custom[key];
      } else {
        serverData.custom[key] = mergeArrays(
          serverData.custom[key],
          clientData.custom[key]
        );
      }
    }
  }
  return serverData;
}

module.exports = { mergeGameData };
