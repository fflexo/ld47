import createViewElementInDom from './viewer';

import setupRaceConfigScreen from './setup_screen';
import setupWelcomeScreen from './welcome_screen';
import setupTrackEvent from './track_screen';
import setupScoreboardScreen from './scoreboard_screen';
import ControllerHandler from './controller/handler';

const sound = require('pixi-sound').default;

const ALL_SCREEN_RESOURCES = [
  setupWelcomeScreen.resources,
  setupRaceConfigScreen.resources,
  setupTrackEvent.resources,
  setupScoreboardScreen.resources,
];

function setup(app) {
  const controllerHandler = new ControllerHandler();

  // Cyclical depndency problem
  let transitionToConfigScreen;
  let transitionToActualRace;

  function resetScreenAndSound() {
    app.stage.removeChildren();
    sound.stopAll();
  }

  function transitionToScoreboard(raceConfig, raceResults) {
    resetScreenAndSound();
    controllerHandler.enablePolling();
    // TODO: the functions we pass in to this setup for the scoreborad need to actually
    //       be closures holding references to the previous setup in order to handle
    //       default settings for the new race.
    const scoreboardScreen = setupScoreboardScreen(
      app,
      raceResults,
      () => transitionToConfigScreen(raceConfig),
      () => transitionToActualRace(raceConfig),
    );
    app.stage.addChild(scoreboardScreen);
  }

  transitionToActualRace = (raceConfig) => {
    resetScreenAndSound();
    const trackScreen = setupTrackEvent(app, transitionToScoreboard, raceConfig);
    app.stage.addChild(trackScreen);
  };

  transitionToConfigScreen = (raceConfig = null) => {
    resetScreenAndSound();
    const setupScreen = setupRaceConfigScreen(app, controllerHandler, raceConfig,
      transitionToActualRace);
    app.stage.addChild(setupScreen);
  };

  const welcomeScreen = setupWelcomeScreen(app, transitionToConfigScreen);
  app.stage.addChild(welcomeScreen);
}

document.addEventListener('DOMContentLoaded', () => {
  createViewElementInDom([].concat(...ALL_SCREEN_RESOURCES), setup);
});
