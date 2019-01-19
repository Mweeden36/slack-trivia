let currentMC;

function setCurrentMC(newMC) {
  currentMC = newMC;
}

function getCurrentMC() {
  return currentMC;
}


module.exports = {
  getCurrentMC,
  setCurrentMC,
};
