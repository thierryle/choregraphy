import { Injectable } from '@angular/core';
import { UtilProvider } from '../util/util';

/*
  Generated class for the PolygonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PolygonProvider {
  points: any[];

  constructor(public util: UtilProvider) {
  }

  set(points) {
    this.points = points;
  }
  
  setDefaultRectangle(canvasWidth, canvasHeight, percent) {
    let center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let width = canvasWidth * percent;
    let height = width / 2;
    let points = [];
    points.push({ x: center.x - width / 2, y: center.y - height / 2});
    points.push({ x: center.x + width / 2, y: center.y - height / 2});
    points.push({ x: center.x + width / 2, y: center.y + height / 2});    
    points.push({ x: center.x - width / 2, y: center.y + height / 2});
    this.set(points);
  }
  
  setDefaultSquare(canvasWidth, canvasHeight, percent) {
    let center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let height = canvasHeight * percent; 
    let points = [];
    points.push({ x: center.x - height / 2, y: center.y - height / 2});
    points.push({ x: center.x + height / 2, y: center.y - height / 2});
    points.push({ x: center.x + height / 2, y: center.y + height / 2});    
    points.push({ x: center.x - height / 2, y: center.y + height / 2});
    this.set(points);
  }
  
  setDefaultTriangle(canvasWidth, canvasHeight, percent) {
    let circle = { x: canvasWidth / 2, y: canvasHeight / 2, radius: canvasHeight * percent / 2 }; 
    let points = [];
    let point = { x: circle.x, y: circle.y - circle.radius };
    points.push({ x: point.x, y: point.y });
    this.util.rotateAroundCircle(point, circle, -2 * Math.PI / 3);
    points.push({ x: point.x, y: point.y });
    this.util.rotateAroundCircle(point, circle, -2 * Math.PI / 3);
    points.push({ x: point.x, y: point.y });
    this.set(points);
  }
  
  draw(ctx, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y)
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  getCopy() {
    let copy = [];
    for (let point of this.points) {
      copy.push({ x: point.x, y: point.y });
    }
    return copy;
  }
  
  /**
   * Redimensionnement du polygône avec les danseurs qui sont dessus.
   */
  resize(step, dancers) {
    for (let dancer of dancers) {
      // if (this.util.isOnPolygon(dancer.pos, this.tplPolygon) != null) {
      this.util.stretchOnPolygon(dancer, this.points, step);
    }
    
    this.util.resizePolygon(this.points, step);
  }
  
  /**
   * Rotation du polygône avec les danseurs qui sont dessus.
   */
  rotate(angle, dancers) {
    let g = this.util.getBarycenter(this.points);
    let circle = { x: g.x, y: g.y, radius: 0 };
    
    for (let dancer of dancers) {
      if (this.util.isOnPolygon(dancer, this.points)) {
        circle.radius = this.util.getLength(circle, dancer);
        this.util.rotateAroundCircle(dancer, circle, angle);
      }      
    }
    
    // Template
    for (let point of this.points) {
      circle.radius = this.util.getLength(g, point);
      this.util.rotateAroundCircle(point, circle, angle);   
    }
  }
  
  /**
   * Déplacement du polygône avec les danseurs qui sont dessus.
   */
  move(offsetX, offsetY, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnPolygon(dancer, this.points)) {
        dancer.move(offsetX, offsetY);
      }      
    }
    
    // Template
    for (let point of this.points) {
      point.x += offsetX;
      point.y += offsetY;   
    }    
  } 
  
  /**
   * Position initiale des danseurs sur le polygône.
   */
  initForm(dancers) {
    let point = { x: this.points[0].x, y: this.points[0].y }
    
    let nbDancersPerLine = dancers.length / this.points.length;
    if (this.util.isInt(nbDancersPerLine)) {
      // Même nombre de danseurs par ligne
      for (let i = 0; i < this.points.length; i++) {
        let length = this.util.getPolygonSegmentLength(this.points, i);
        let offset = length / nbDancersPerLine;
        
        for (let j = 0; j < nbDancersPerLine; j++) {
          dancers[i * nbDancersPerLine + j].x = point.x;
          dancers[i * nbDancersPerLine + j].y = point.y;
          this.util.rotateAroundPolygon(point, this.points, offset);
        }
      }
    } else {
      // Sinon on répartit les danseurs à égal distance
      let perimeter = this.util.getPerimeter(this.points);
      let offset = perimeter / dancers.length;
      
      for (let i = 0; i < dancers.length; i++) {
        dancers[i].x = point.x;
        dancers[i].y = point.y;        
        this.util.rotateAroundPolygon(point, this.points, offset);
      }
    }
  }
  
  initCleverForm(dancers) {
    // Première boucle pour repérer les positions à occuper sur le cercle
    let points = [];
    for (let i = 0; i < dancers.length; i++) {
      points.push({ x: 0, y: 0 });
    }
    this.initForm(points);
    
    // On place les danseurs
    for (let dancer of dancers) {
      let nearest = this.util.getNearestPoint(dancer.x, dancer.y, points);
      dancer.setPos(points[nearest].x, points[nearest].y);
      points.splice(nearest, 1);      
    }
  }
  
  /**
   * Fait tourner les danseurs autour du polygône.
   */
  rotateForm(step, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnPolygon(dancer, this.points) != null) {
        this.util.rotateAroundPolygon(dancer, this.points, step);
      }    
    }
  }
}
