let currentMC = {};

function setCurrentMC(newMC, teamId) {
  currentMC[teamId] = newMC;
}

function getCurrentMC(teamId) {
  return currentMC[teamId];
}


module.exports = {
  getCurrentMC,
  setCurrentMC,
};
