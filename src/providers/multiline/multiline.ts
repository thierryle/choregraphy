import { Injectable } from '@angular/core';
import { UtilProvider } from '../util/util';

/*
  Generated class for the MultilineProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MultilineProvider {
  lines: any[]; // Tableau de lignes { a: { x: 10, y: 15 }, b: { x: 50, y: 60 }}
  lastPointedLine: number;

  constructor(public util: UtilProvider) {
  }
  
  set(lines) {
    this.lines = lines;
  }
  
  setDefaultVertical(canvasWidth, canvasHeight, percent, nbLines) {
    let center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let height = canvasHeight * percent;
    let distance = canvasWidth / (nbLines + 1);
    
    this.lines = [];
    for (let i = 0; i < nbLines; i++) {
      let a = { x: distance * (i + 1), y: center.y - height / 2 };
      let b = { x: distance * (i + 1), y: center.y + height / 2 };
      this.lines.push({ a: a, b: b});
    }
  }

  setDefaultHorizontal(canvasWidth, canvasHeight, percent, nbLines) {
    let center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let width = canvasWidth * percent;
    let distance = canvasHeight / (nbLines + 1);
    
    this.lines = [];
    for (let i = 0; i < nbLines; i++) {
      let a = { x: center.x - width / 2, y: distance * (i + 1) };
      let b = { x: center.x + width / 2, y: distance * (i + 1) };
      this.lines.push({ a: a, b: b});
    }
  }
  
  draw(ctx, color) {
    ctx.strokeStyle = color;
    for (let line of this.lines) {
      ctx.beginPath();
      ctx.moveTo(line.a.x, line.a.y);
      ctx.lineTo(line.b.x, line.b.y);
      ctx.stroke();
    }
  }
  
  getCopy() {
    let copy = [];
    for (let line of this.lines) {
      copy.push({ a: { x: line.a.x, y: line.a.y }, b: { x: line.b.x, y: line.b.y }});
    }
    return copy;
  }
  
  resize(step, dancers) {
    for (let dancer of dancers) {
      for (let line of this.lines) {
        if (this.util.isOnSegment(dancer, line.a, line.b)) {
          this.util.stretchOnLine(dancer, line.a, line.b, step);
          break;
        }
      }
    }
    
    // Template
    for (let line of this.lines) {
      let m = this.util.getMiddle(line.a, line.b);    
      this.util.stretch(line.a, m, step);
      this.util.stretch(line.b, m, step);
    }
  }
  
  /**
   * Déplacement des lignes avec les danseurs qui sont dessus.
   */
  move(offsetX, offsetY, dancers) {
    if (this.lastPointedLine != null) {
      for (let dancer of dancers) {
        if (this.util.isOnSegment(dancer, this.lines[this.lastPointedLine].a, this.lines[this.lastPointedLine].b)) {
          dancer.move(offsetX, offsetY);
        }
      }
      
      // Template
      this.lines[this.lastPointedLine].a.x += offsetX;
      this.lines[this.lastPointedLine].a.y += offsetY;
      this.lines[this.lastPointedLine].b.x += offsetX;
      this.lines[this.lastPointedLine].b.y += offsetY;
    } else {
      for (let dancer of dancers) {
        for (let line of this.lines) {
          if (this.util.isOnSegment(dancer, line.a, line.b)) {
            dancer.move(offsetX, offsetY);
            break;
          }
        }
      }
      
      // Template
      for (let line of this.lines) {
        line.a.x += offsetX;
        line.a.y += offsetY;
        line.b.x += offsetX;
        line.b.y += offsetY;
      }
    }
  } 
  
  /**
   * Placement initiale des danseurs sur le template.
   */
  initForm(dancers) {
    let nbDancersPerLine = dancers.length / this.lines.length;
    if (this.util.isInt(nbDancersPerLine)) {
      // Même nombre de danseurs par ligne
      for (let i = 0; i < this.lines.length; i++) {
        if (nbDancersPerLine == 1) {
          let m = this.util.getMiddle(this.lines[i].a, this.lines[i].b);
          dancers[i].x = m.x;
          dancers[i].y = m.y;
        } else {
          let offsetx = (this.lines[i].b.x - this.lines[i].a.x) / (nbDancersPerLine - 1);
          let offsety = (this.lines[i].b.y - this.lines[i].a.y) / (nbDancersPerLine - 1);
          
          for (let j = 0; j < nbDancersPerLine; j++) {
            dancers[i * nbDancersPerLine + j].x = this.lines[i].a.x + offsetx * j;
            dancers[i * nbDancersPerLine + j].y = this.lines[i].a.y + offsety * j;
          }
        }
      }
    } else {
      // On arrondit pour les premières lignes et on prend le reste pour la dernière ligne
      let nbDancersFirstLines = Math.round(nbDancersPerLine);
      let nbDancersLastLine = dancers.length - (nbDancersFirstLines * (this.lines.length - 1));
      
      // Premières lignes
      for (let i = 0; i < this.lines.length - 1; i++) {
        if (nbDancersPerLine == 1) {
          let m = this.util.getMiddle(this.lines[i].a, this.lines[i].b);
          dancers[i].x = m.x;
          dancers[i].y = m.y;
        } else {
          let offsetx = (this.lines[i].b.x - this.lines[i].a.x) / (nbDancersFirstLines - 1);
          let offsety = (this.lines[i].b.y - this.lines[i].a.y) / (nbDancersFirstLines - 1);
          
          for (let j = 0; j < nbDancersFirstLines; j++) {
            dancers[i * nbDancersFirstLines + j].x = this.lines[i].a.x + offsetx * j;
            dancers[i * nbDancersFirstLines + j].y = this.lines[i].a.y + offsety * j;
          }
        }
      }
      
      // Dernière ligne
      let last = this.lines.length - 1;
      if (nbDancersLastLine == 1) {
        let m = this.util.getMiddle(this.lines[last].a, this.lines[last].b);
        dancers[last * nbDancersFirstLines].x = m.x;
        dancers[last * nbDancersFirstLines].y = m.y;
      } else {
        let offsetx = (this.lines[last].b.x - this.lines[last].a.x) / (nbDancersLastLine - 1);
        let offsety = (this.lines[last].b.y - this.lines[last].a.y) / (nbDancersLastLine - 1);
        
        for (let j = 0; j < nbDancersLastLine; j++) {
          dancers[last * nbDancersFirstLines + j].x = this.lines[last].a.x + offsetx * j;
          dancers[last * nbDancersFirstLines + j].y = this.lines[last].a.y + offsety * j;
        }
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
  
  setLastPointedLine(index) {
    this.lastPointedLine = index;
  }
}
