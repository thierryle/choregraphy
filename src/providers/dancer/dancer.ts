import { Injectable } from '@angular/core';

const cDirection = { DOWN: 0, LEFT: 1, UP: 2, RIGHT: 3 };

/*
  Generated class for the DancerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DancerProvider {
  x : number = 0;
  y : number = 0;
  width: number = 30;
  height: number = 60;
  speedX: number = 0;
  speedY: number = 0;
  color: string;
  steps: any[] = []; // Tableau d'objets { x, y, direction }
  name: string;
  direction: number = cDirection.DOWN;
  backstage: any; // Objet { x, y, direction }
  
  constructor() {
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }
  
  updatePos(elapsedTime) {
    this.x += this.speedX * elapsedTime;
    this.y += this.speedY * elapsedTime;
  }
  
  setSpeedToStep(stepNumber, stepDuration) {
    this.speedX = (this.steps[stepNumber].x - this.x) / stepDuration;
    this.speedY = (this.steps[stepNumber].y - this.y) / stepDuration;
  }
  
  addStep() {
    this.steps.push({ x: this.x, y: this.y, direction: this.direction });
    this.direction = cDirection.DOWN;
  }
  
  updateBackstage() {
    this.backstage = { x: this.x, y: this.y, direction: this.direction };
  }
  
  deleteBackstage() {
    this.backstage = null;
  }
  
  /**
   * Positionne les danseurs en backstage.
   */
  setBackstage() {
    if (this.backstage != null) {
      this.x = this.backstage.x;
      this.y = this.backstage.y;
      this.direction = this.backstage.direction;
    }
  }
  
  /**
   * Met à jour un step avec la position courante du danseur.
   */
  updateStep(stepNumber) {
    this.steps[stepNumber].x = this.x;
    this.steps[stepNumber].y = this.y;
    this.steps[stepNumber].direction = this.direction;
  }
  
  /**
   * Positionne le danseur à un step.
   */
  setStep(stepNumber) {
    this.x = this.steps[stepNumber].x;
    this.y = this.steps[stepNumber].y;
    this.direction = this.steps[stepNumber].direction;
  }
  
  deleteStep(step) {
    this.steps.splice(step, 1);
  }
  
  /**
   * Dessine le danseur en mouvement.
   */
  drawMoving(ctx) {
    this.drawMotionless(ctx, cDirection.DOWN);
  }
  
  /**
   * Dessine le danseur lorsqu'il est immobile.
   */
  drawMotionless(ctx, pDirection?) {
    let direction;
    if (pDirection != null) {
      direction = pDirection;
    } else {
      direction = this.direction;
    }
    
    // Tête
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height / 4, this.height / 4, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Corps
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2, this.y + this.height / 2);
    ctx.quadraticCurveTo(this.x - this.width / 2, this.y, this.x, this.y);
    ctx.quadraticCurveTo(this.x + this.width / 2, this.y, this.x + this.width / 2, this.y + this.height / 2);
    ctx.fill();
    
    // Cheveux et yeux
    let eyeRadius = this.height / 40;
    ctx.fillStyle = 'Black';
    if (direction == cDirection.LEFT) {
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, -Math.PI * 5 / 6,  -Math.PI / 6, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, -Math.PI / 2,  Math.PI / 2, false);
      ctx.fill();
      
      // Yeux
      ctx.beginPath();
      ctx.arc(this.x - this.width / 4, this.y - this.height / 4, eyeRadius, 0, Math.PI * 2, false);
      ctx.fill();
    } else if (direction == cDirection.UP) {
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, -Math.PI * 5 / 6,  -Math.PI / 6, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, 0, Math.PI * 2, false);
      ctx.fill();
    } else if (direction == cDirection.RIGHT) {
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, -Math.PI * 5 / 6,  -Math.PI / 6, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, Math.PI / 2,  -Math.PI / 2, false);
      ctx.fill();
      
      // Yeux
      ctx.beginPath();
      ctx.arc(this.x + this.width / 4, this.y - this.height / 4, eyeRadius, 0, Math.PI * 2, false);
      ctx.fill();
    } else {
      // Par défaut, le danseur est orienté vers le bas
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, -Math.PI * 5 / 6,  -Math.PI / 6, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, -Math.PI / 4,  Math.PI / 4, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x, this.y - this.height / 4, this.height / 4, Math.PI * 3 / 4, -Math.PI * 3 / 4, false);
      ctx.fill();
      
      // Yeux
      ctx.beginPath();
      ctx.arc(this.x - this.width / 6, this.y - this.height / 4, eyeRadius, 0, Math.PI * 2, false);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(this.x + this.width / 6, this.y - this.height / 4, eyeRadius, 0, Math.PI * 2, false);
      ctx.fill();
    }   
    
    if (this.name != null) {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = 'White';
      ctx.fillText(this.name, this.x - 6, this.y + this.height / 4 + 6);
    }
  }
  
  /**
   * Dessine le danseur avec un halo.
   */
  drawMotionlessHalo(ctx, stepNumber) {
    let offset = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.height / 4, this.height / 4 + offset, 0, Math.PI * 2, false);
    if (this.color == 'Orange') {
      ctx.fillStyle = 'Yellow';
    } else {
      ctx.fillStyle = 'Orange';
    }
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x - this.width / 2 - offset, this.y + this.height / 2 + offset);
    ctx.quadraticCurveTo(this.x - this.width / 2 - offset, this.y - offset, this.x, this.y - offset);
    ctx.quadraticCurveTo(this.x + this.width / 2 + offset, this.y - offset, this.x + this.width / 2 + offset, this.y + this.height / 2 + offset);
    ctx.fill();
    
    this.drawMotionless(ctx);
  }
  
  /**
   * Indique si la AABB du danseur contient un point.
   */
  contains(x, y) {
    return (x >= (this.x - this.width / 2)) && (x <= (this.x + this.width / 2)) && (y >= (this.y - this.height / 2)) && (y <= (this.y + this.height / 2));
  }
  
  /**
   * Retourne le cercle intérieur du danseur pour la sélection.
   */
  getInnerCircle() {
    return { x: this.x, y: this.y, radius: this.width / 2 };
  }
  
  /**
   * Copie le danseur JSON.
   */
  copy(dancer) {
    this.x = dancer.x;
    this.y = dancer.y;
    this.height = dancer.height;
    this.width = dancer.height / 2;
    this.speedX = dancer.speedX;
    this.speedY = dancer.speedY;
    this.color = dancer.color;
    this.steps = dancer.steps;
    this.name = dancer.name;
    this.backstage = dancer.backstage;
  }
  
  getCopy() {
    let copy = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      speedX: this.speedX,
      speedY: this.speedY,
      color: this.color,
      steps: this.steps,
      name: this.name,
      backstage: this.backstage
    }
    return copy;
  }
  
  move(offsetX, offsetY) {
    this.x += offsetX;
    this.y += offsetY;
  }
  
  /**
   * Redimensionne le danseur en respectant le ratio.
   */
  resize(length) {
    if (length < 0 && this.width <= 1) {
      return;
    }
    this.height += length;
    this.width = this.height / 2;
  }
  
  /**
   * Change l'orientation du danseur.
   */
  turn() {
    if (this.direction == null) {
      this.direction = cDirection.LEFT;
    } else {
      this.direction = (this.direction + 1) % 4;
    }
  }
}
