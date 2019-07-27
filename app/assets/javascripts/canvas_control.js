$(()=>{resizeCanvas()});
$(window).resize(resizeCanvas);

function resizeCanvas() {
  var $canvas = $("#plot");
  var canvas = $canvas[0];
  if(canvas.width != Math.floor($canvas.parent().width()) || canvas.height != Math.floor($canvas.parent().height())) {
    canvas.width = Math.floor($canvas.parent().width());
    canvas.height = Math.floor($canvas.parent().height());
  }
  else
    return;
  // do canvas redrawing
  console.log("resized");
}