import { Injectable } from '@angular/core';
import { UtilProvider } from '../util/util';

/*
  Generated class for the LineProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LineProvider {
  a: any;
  b: any;

  constructor(public util: UtilProvider) {
  }
  
  set(a, b) {
    this.a = a;
    this.b = b;
  }
  
  setDefaultVertical(canvasWidth, canvasHeight, percent) {
    let center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let height = canvasHeight * percent; 
    let a = { x: center.x, y: center.y - height / 2 };
    let b = { x: center.x, y: center.y + height / 2 };
    this.set(a, b);
  }
  
  setDefaultHorizontal(canvasWidth, canvasHeight, percent) {
    let center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let width = canvasWidth * percent;
    let a = { x: center.x - width / 2, y: center.y };
    let b = { x: center.x + width / 2, y: center.y };
    this.set(a, b);
  }

  draw(ctx, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(this.a.x, this.a.y);
    ctx.lineTo(this.b.x, this.b.y);
    ctx.stroke();
  }
  
  getCopy() {
    return { 
      a: { x: this.a.x, y: this.a.y },
      b: { x: this.b.x, y: this.b.y }
    };
  }
  
  /**
   * Redimensionnement de la ligne.
   */
  resize(step, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnSegment(dancer, this.a, this.b)) {
        this.util.stretchOnLine(dancer, this.a, this.b, step);
      }      
    }
    
    // Template
    let m = this.util.getMiddle(this.a, this.b);    
    this.util.stretch(this.a, m, step);
    this.util.stretch(this.b, m, step);
  }
  
  /**
   * Déplacement de la ligne avec les danseurs qui sont dessus.
   */
  move(offsetX, offsetY, dancers) {
    for (let dancer of dancers) {
      if (this.util.isOnSegment(dancer, this.a, this.b)) {
        dancer.move(offsetX, offsetY);
      }
    }
    
    // Template
    this.a.x += offsetX;
    this.a.y += offsetY;
    this.b.x += offsetX;
    this.b.y += offsetY;
  } 
  
  /**
   * Rotation de la ligne.
   */
  rotate(angle, dancers) {
    let m = this.util.getMiddle(this.a, this.b);
    let circle = { x: m.x, y: m.y, radius: 0 };
    
    for (let dancer of dancers) {
      if (this.util.isOnSegment(dancer, this.a, this.b)) {
        circle.radius = this.util.getLength(circle, dancer);
        this.util.rotateAroundCircle(dancer, circle, angle);
      }      
    }
    
    // Template
    circle.radius = this.util.getLength(m, this.a);
    this.util.rotateAroundCircle(this.a, circle, angle);   
    this.util.rotateAroundCircle(this.b, circle, angle);
  }
  
  /**
   * Placement initiale des danseurs sur le template.
   */
  initForm(dancers) {
    if (dancers.length == 1) {
      // Cas particulier où il n'y a qu'un danseur
      let m = this.util.getMiddle(this.a, this.b);
      dancers[0].setPos(m.x, m.y);
    } else {
      let offsetx = (this.b.x - this.a.x) / (dancers.length - 1);
      let offsety = (this.b.y - this.a.y) / (dancers.length - 1);
      
      for (let i = 0; i < dancers.length; i++) {
        dancers[i].setPos(this.a.x + offsetx * i, this.a.y + offsety * i);
      }
    }    
  }
  
  initCleverForm(dancers) {
    if (dancers.length == 1) {
      // Cas particulier où il n'y a qu'un danseur
      this.initForm(dancers);
    } else {
      let offsetx = (this.b.x - this.a.x) / (dancers.length - 1);
      let offsety = (this.b.y - this.a.y) / (dancers.length - 1);
      
      // Première boucle pour repérer les positions à occuper sur la ligne
      let points = [];
      for (let i = 0; i < dancers.length; i++) {
        points.push({ x: this.a.x + offsetx * i, y: this.a.y + offsety * i });
      }
      
      // Deuxième boucle pour placer les danseurs
      for (let dancer of dancers) {
        let nearest = this.util.getNearestPoint(dancer.x, dancer.y, points);
        dancer.setPos(points[nearest].x, points[nearest].y);
        points.splice(nearest, 1);      
      }
    }
  }
}
