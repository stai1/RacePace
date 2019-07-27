function sum(arr) {
  return arr.reduce((acc,v)=>acc+v);
}
/**
 * Calculates coefficients and r-value of regression y=ax+b
 * @param {Array} X - x values
 * @param {Array} Y - y values
 * @return {Object} With a, b, r attributes
 */
 
function linReg(X, Y) {
  let n = X.length; // !!! Assume x.length == y.length !!!
  let mean_x = sum(X)/n;
  let mean_y = sum(Y)/n;
  let mean_xy = sum([...Array(n).keys()].map((i)=>X[i]*Y[i]))/n;
  let var_x = sum(X.map((x)=>Math.pow(x-mean_x,2)))/n;
  let var_y = sum(Y.map((y)=>Math.pow(y-mean_y,2)))/n;
  let cov_xy = mean_xy-mean_x*mean_y;
  let b = cov_xy/var_x;
  let a = mean_y - b*mean_x;
  let r = cov_xy/(Math.sqrt(var_x)*Math.sqrt(var_y));
  return {a:a,b:b,r:r};
}

/**
 * Calculates coefficients and r-value of regression y=ax^b
 * @param {Array} X - x values
 * @param {Array} Y - y values
 * @return {Object} With a, b, r attributes
 */
function pwrReg(X, Y) {
  let lnX = X.map((x)=>Math.log(x));
  let lnY = Y.map((y)=>Math.log(y));
  let coef = linReg(lnX, lnY);
  coef.a = Math.pow(Math.E,coef.a);
  return coef;
}

function pwr(x,a,b) {
  return a*Math.pow(x,b);
}
