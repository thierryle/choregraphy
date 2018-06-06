import { Injectable } from '@angular/core';

/*
  Generated class for the BackgroundHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BackgroundHandlerProvider {
  canvasElement: any;
  ctx: any;
  cellsize: number = 50;
  gridShowing: boolean;

  constructor() {
  }

  init(canvasElement) {
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    this.drawGrid();
    this.gridShowing = true;
  }
  
  showOrHideGrid() {
    if (this.gridShowing) {
      this.clearCanvas();
    } else {
      this.drawGrid();
    }
    this.gridShowing = !this.gridShowing;
  }
  
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);  
  }
  
  drawGrid() {
    let center = { x: this.canvasElement.width / 2, y: this.canvasElement.height / 2 };
    this.ctx.strokeStyle = 'Gainsboro';
    
    // Lignes verticales
    for (let x = center.x; x < this.canvasElement.width; x += this.cellsize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasElement.height);
      this.ctx.stroke();
    }
    
    for (let x = center.x - this.cellsize; x > 0; x -= this.cellsize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasElement.height);
      this.ctx.stroke();
    }
    
    // Lignes horizontales
    for (let y = center.y; y < this.canvasElement.height; y += this.cellsize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasElement.width, y);
      this.ctx.stroke();
    }
    
    for (let y = center.y - this.cellsize; y > 0; y -= this.cellsize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasElement.width, y);
      this.ctx.stroke();
    }
    
    // Centre
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, 2, 0, Math.PI * 2, true);
    this.ctx.fillStyle = 'Red';
    this.ctx.fill();
  }
  
  resizeGrid(length) {
    if (this.gridShowing) {
      if (length < 0 && this.cellsize <= 10) {
        return;
      }
      if (length > 0 && this.cellsize >= this.canvasElement.width / 2) {
        return;
      }
      this.cellsize += length;
      this.clearCanvas();
      this.drawGrid();
    }    
  }
  
  drawEdge() {
    this.ctx.strokeStyle = 'Red';
    this.ctx.strokeRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }
  /*
  saveContext() {
    this.ctx.save();
  }
  
  restoreContext() {
    this.ctx.restore();
    if (this.gridShowing) {
      this.clearCanvas();
      this.drawGrid();
    }
  }
  */
  translate(x, y, drawEdge) {
    this.ctx.translate(x, y);
    this.ctx.clearRect(-this.canvasElement.width, -this.canvasElement.height, 3 * this.canvasElement.width, 3 * this.canvasElement.height);
    if (drawEdge) {
      this.drawEdge();
    }
    if (this.gridShowing) {
      this.drawGrid();
    }    
  }
}
