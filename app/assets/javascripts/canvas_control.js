/**$(function() {
  canvasControl = new CanvasControl($("#plot"));
  canvasControl.resizeCanvas();
  $(window).resize(resizeCanvas);
});**/

class CanvasControl {
  constructor($canvas, coef) {
    this.$canvas = $canvas;
    this.canvas = $canvas[0];
    this.ctx = this.canvas.getContext("2d");
    this.xBegin = 0; // x value corresponding to canvas left
    this.xEnd = 10000; // x value corresponding to canvas right
    this.yBegin = 0; // y value corresponding to canvas bottom
    this.yEnd = 0.75; // y value corresponding to canvas top
    this.coef = coef;
  }
  
  resizeCanvas() {
    if(this.canvas.width != Math.floor(this.$canvas.parent().width()) || this.canvas.height != Math.floor(this.$canvas.parent().height())) {
      this.canvas.width = Math.floor(this.$canvas.parent().width());
      this.canvas.height = Math.floor(this.$canvas.parent().height());
    }
    else
      return;
    this.redraw();
  }
  
  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPowerFunction();
  }
  
  setCoef(coef) {
    this.coef = coef;
  }
  drawPowerFunction() {
    this.ctx.strokeStyle = "#FF0000";
    this.ctx.beginPath();
    let y = this.coef.a * Math.pow(this.xBegin, this.coef.b);
    this.ctx.moveTo(0, this.yCanvasFromY(y));
    for(let xCanvas = 1; xCanvas <= this.canvas.width; ++xCanvas) {
      let x = this.xFromXCanvas(xCanvas);
      let y = this.coef.a * Math.pow(x, this.coef.b);
      let yCanvas = this.yCanvasFromY(y);
      if(yCanvas >= this.canvas.height)
        this.ctx.moveTo(xCanvas, this.canvas.height);
      else if(yCanvas < 0)
        this.ctx.moveTo(xCanvas, 0);
      else
        this.ctx.lineTo(xCanvas, yCanvas);
    }
    this.ctx.stroke();
  }
  
  xCanvasFromX(x) { // probably not needed
    return (x-this.xBegin)/(this.xEnd-this.xBegin)*this.canvas.width;
  }
  xFromXCanvas(xCanvas) {
    return xCanvas/this.canvas.width*(this.xEnd-this.xBegin)+this.xBegin;
  }
  yCanvasFromY(y) {
    return this.canvas.height-(y-this.yBegin)/(this.yEnd-this.yBegin)*this.canvas.height;
  }
  yFromYCanvas(yCanvas) { // probably not needed
    return yCanvas/this.canvas.height*(this.yEnd-this.yBegin)+this.yBegin;
  }
}