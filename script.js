

function assert(condition, message) {
  if (!condition) {
    throw message || "Assertion failed";
  }
}

function test() {
  var speedProfile = energyLimitedSpeeds(20, 1.88, 300, 36);
  assert(timeFromDist(speedProfile, 55) - 5.31 < 1e-3);
}

function calculateForm() {
  test();
  var dist1 = document.getElementById("dist1").value;
  var time1 = document.getElementById("time1").value;
  var dist2 = document.getElementById("dist2").value;
  var time2 = document.getElementById("time2").value;
  
  var speedProfile = energyLimitedSpeeds(dist1, time1, dist2, time2);
  addPlayerProfile(speedProfile);

  clearRows();
  var distances = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
  distances.forEach(function(dist) {
    var result = timeFromDist(speedProfile, dist);
    reportAddRow(dist, parseFloat(result).toFixed(2), parseFloat(result*1.05).toFixed(2))
  });
}

function addPlayerProfile(speedProfile) {
  var spd_aer = parseFloat(speedProfile['spd_aer']).toFixed(2);
  var spd_an = parseFloat(speedProfile['spd_an']).toFixed(2);
  var spd_an_res = parseFloat(speedProfile['spd_an_res']).toFixed(2);
  document.querySelector("#playerProfile").innerHTML =
    `<div><b>Speed profile</b></div>
    <div id="playerSpeedProfile">
      <span style="grid-area: lbl1">Aerobic max. speed:</span>
      <span style="grid-area: val1">${spd_aer}m/s</span>
      <span style="grid-area: lbl2">Anaerobic speed reserve:</span>
      <span style="grid-area: val2">${spd_an_res}m/s</span>
      <span style="grid-area: lbl3">Total max.:</span>
      <span style="grid-area: val3">${spd_an}m/s</span>
    </div>`;
}

function clearRows() {
  document.querySelector("#workoutSheet tbody").innerHTML = 
    "<th>Distance</th><th>Time</th><th>Intervention time (5%)</th>";
}

function reportAddRow(col1, col2, col3) {
  document.querySelector("#workoutSheet tbody").innerHTML += 
    `<tr><td>${col1}m</td><td>${col2}s</td><td>${col3}s</td></tr>`;
}

/**
 * Estimate time for a given distance based on individual speed attributes.
 */
function timeFromDist(speedProfile, workoutDist) {     
  /*function timeEstimate(dist) {
    return secantSolver(implicitTimeDistFunc(
      speedProfile['spd_aer'], speedProfile['spd_an'], speedProfile['k'], workoutDist), 0, 100);
  }*/
  
  return secantSolver(implicitTimeDistFunc(
    speedProfile['spd_aer'], speedProfile['spd_an'], speedProfile['k'], workoutDist), 0, 100);
}

/**
 * Estimate an individual's speed attributes (aerobic and anaerobic speeds)
 * based on two sprint times. k is a constant empirically established for humans.
 */
function energyLimitedSpeeds(dist1, time1, dist2, time2, k = 0.013) {
  var spd1 = dist1 / time1;
  var spd2 = dist2 / time2;

  var spd_an_res = (spd1 - spd2) / (Math.exp(-k * time1) - Math.exp(-k * time2));
  var spd_aer = spd1 - spd_an_res * Math.exp(-k * time1);
  var spd_an = spd_an_res + spd_aer;
  return {'spd_aer': spd_aer, 'spd_an': spd_an, 'spd_an_res': spd_an_res, 'k': k}
}

/**
 * Estimate speed after a certain amount of time (spd(t)) based on
 * individual speed attributes.
 */
function speedFromTime(spd_aer, spd_an, k, time) {
  return spd_aer + (spd_an - spd_aer) * Math.exp(-k * time)
}

/**
 * Return an implicit function relating time to distance.
 * I.e. spd(t) * t = dist
 * Thus, t*spd(t) - dist = 0
 */
function implicitTimeDistFunc(spd_aer, spd_an, k, dist) {
  function func(time) {
    return time * speedFromTime(spd_aer, spd_an, k, time) - dist;
  }
  return func;
}

/**
 * Use Secant method to solve x for f(x) = 0.
 * See: https://planetcalc.com/3707/
 */
function secantSolver(func, x0 = -1.0, x1 = 1.0, tol = 1e-4) {
  // Endpoint convergence
  change = Math.abs(x1 - x0);
  // Alternative: Function convergence
  // change = func(x1);
  if (change <= tol) {
    return x1;
  }

  next_x = x1 - (x1-x0)/(func(x1) - func(x0))*func(x1);
  //console.log(next_x + ", " + func(next_x) + ", " + Math.abs(x1 - x0));
  
  if(Number.isNaN(next_x)) {
    console.log("Error: next_x is NaN");
    return next_x;
  }
  return secantSolver(func, x1, next_x, tol);
}