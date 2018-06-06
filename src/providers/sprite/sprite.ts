import { Injectable } from '@angular/core';
import { DancerProvider } from '../dancer/dancer';
import { ImageHandlerProvider } from '../image-handler/image-handler';

const cDirection = { DOWN: 0, LEFT: 1, UP: 2, RIGHT: 3 };
const framePeriod: number = 200;
const diskOffsetY: number = 10;

/*
  Generated class for the SpriteProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SpriteProvider extends DancerProvider {
  frameWidth: number;
  frameHeight: number;
  image: any;
  moveNumber: number = 1;
  frameNumber: number = 0; 
  
  frameCurrentDuration: number = 0;

  constructor(public imageHandler: ImageHandlerProvider) {
    super();
    let imageInfo = imageHandler.get('dancer.png'); 
    this.image = imageInfo.image;
    this.frameWidth = imageInfo.width / 8;
    this.frameHeight = imageInfo.height / 10;
    this.width = this.frameWidth / 2;
    this.height = this.frameHeight / 2;
  }
  
  updatePos(elapsedTime) {
    this.x += this.speedX * elapsedTime;
    this.y += this.speedY * elapsedTime;
    
    // Changement de frame
    this.frameCurrentDuration += elapsedTime;
    if (this.frameCurrentDuration >= framePeriod) {
      this.nextFrame();
      this.frameCurrentDuration = this.frameCurrentDuration - framePeriod;
    }
  }
  
  drawMoving(ctx) {
    ctx.drawImage(this.image, this.frameNumber * this.frameWidth, this.moveNumber * this.frameHeight, this.frameWidth, this.frameHeight,
        this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    this.drawDiskWithName(ctx);
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
    
    let moveNumber;
    let frameNumber;
    if (direction == cDirection.LEFT) {
      moveNumber = 8;
      frameNumber = 5;
    } else if (direction == cDirection.UP) {
      moveNumber = 8;
      frameNumber = 3;
    } else if (direction == cDirection.RIGHT) {
      moveNumber = 8;
      frameNumber = 1;
    } else {
      // Par défaut, le danseur est orienté vers le bas
      moveNumber = 0;
      frameNumber = 0;
    }
    
    ctx.drawImage(this.image, frameNumber * this.frameWidth, moveNumber * this.frameHeight, this.frameWidth, this.frameHeight,
        this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
    // Disque de couleur
    this.drawDiskWithName(ctx);
  }
  
  drawDiskWithName(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.height / 2 + diskOffsetY, this.height / 8, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    if (this.name != null) {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = 'White';
      ctx.fillText(this.name, this.x - 6, this.y + this.height / 2 + 10 + 6);
    }
  }
  
  /**
   * Dessine le danseur avec un halo.
   */
  drawMotionlessHalo(ctx, stepNumber) {
    let offset = 2;
    
    // Halo
    ctx.beginPath();
    ctx.arc(this.x, this.y + this.height / 2 + diskOffsetY, this.height / 8 + offset, 0, Math.PI * 2, false);
    if (this.color == 'Orange') {
      ctx.fillStyle = 'Yellow';
    } else {
      ctx.fillStyle = 'Orange';
    }
    ctx.fill();
    
    this.drawMotionless(ctx);
  }

  /*
  draw(ctx) {
    ctx.drawImage(this.image, this.frameNumber * this.frameWidth, this.moveNumber * this.frameHeight, this.frameWidth, this.frameHeight,
        this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
  */
  
  /**
   * Indique si la AABB du danseur contient un point.
   */
  contains(x, y) {
    return (x >= (this.x - this.width / 2)) && (x <= (this.x + this.width / 2)) && (y >= (this.y - this.height / 2)) && (y <= (this.y + this.height / 2 + diskOffsetY + this.height / 8));
  }
  
  copy(dancer) {
    this.x = dancer.x;
    this.y = dancer.y;
    this.height = dancer.height;
    this.width = this.frameWidth / this.frameHeight * dancer.height;
    this.speedX = dancer.speedX;
    this.speedY = dancer.speedY;
    this.color = dancer.color;
    this.steps = dancer.steps;
    this.name = dancer.name;
  }
  
  resize(length) {
    if (length < 0 && this.width <= 1) {
      return;
    }
    this.height += length;
    this.width = this.frameWidth / this.frameHeight * this.height;
  }
  
  nextFrame() {
    this.frameNumber++;
    if (this.frameNumber > 7) {
      this.frameNumber = 0;
      this.moveNumber++;
      if (this.moveNumber > 8) {
        this.moveNumber = 1;
      }
    }
  }
}
