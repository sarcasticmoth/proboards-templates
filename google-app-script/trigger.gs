let information = new Information();

/**
 * Trigger Methods
 */
function Trigger() {};

function onOpen() {
  Logger.log("Start onOpen()");

  createMenu();
  // LoadSummary();
  // CreateCharacterThreadTrackerPosts();

  Logger.log("End onOpen()");
}
