import { Injectable } from '@angular/core';
import { UtilProvider } from '../util/util';

/*
  Generated class for the CircleProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class CircleProvider {
  radius: number;
  x: number;
  y: number;

  constructor(public util: UtilProvider) {
  }

  set(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
  
  setDefault(canvasWidth, canvasHeight, percent) {
    let radius = canvasHeight * percent / 2;
    this.set(canvasWidth / 2, canvasHeight / 2, radius);    
  }
  
  draw(ctx, color) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  getCopy() {
    return { radius: this.radius, x: this.x, y: this.y };
  }
  
  /**
   * Redimensionnement du circle.
   */
  resize(step, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnCircle(dancer, this)) {
        this.util.stretch(dancer, this, step);
      }      
    }
    this.radius += step;
  }
  
  /**
   * Déplacement du cercle avec les danseurs qui sont dessus.
   */
  move(offsetX, offsetY, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnCircle(dancer, this)) {
        dancer.move(offsetX, offsetY);
      }
    }
    
    // Template
    this.x += offsetX;
    this.y += offsetY;   
  } 
  
  /**
   * Placement initiale des danseurs sur le template.
   */
  initForm(dancers) {
    let arc = (2 * Math.PI) / dancers.length;
    for (let i = 0; i < dancers.length; i++) {
      dancers[i].setPos(this.x + this.radius * Math.cos(arc * i), this.y - this.radius * Math.sin(arc * i));
    }
  }
  
  initCleverForm(dancers) {
    let arc = (2 * Math.PI) / dancers.length;
    
    // Première boucle pour repérer les positions à occuper sur le cercle
    let points = [];
    for (let i = 0; i < dancers.length; i++) {
      points.push({ x: this.x + this.radius * Math.cos(arc * i), y: this.y - this.radius * Math.sin(arc * i) });
    }
    
    // Deuxième boucle pour placer les danseurs
    for (let dancer of dancers) {
      let nearest = this.util.getNearestPoint(dancer.x, dancer.y, points);
      dancer.setPos(points[nearest].x, points[nearest].y);
      points.splice(nearest, 1);      
    }
  }
  
  /**
   * Fait tourner les danseurs autour du cercle.
   */
  rotateForm(angle, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnCircle(dancer, this)) {
        this.util.rotateAroundCircle(dancer, this, angle);
      }      
    }
  }
}
