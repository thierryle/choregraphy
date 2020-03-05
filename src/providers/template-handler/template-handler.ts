import { PolygonProvider } from '../../providers/polygon/polygon';
import { CircleProvider } from '../../providers/circle/circle';
import { LineProvider } from '../../providers/line/line';
import { MultilineProvider } from '../../providers/multiline/multiline';
import { UtilProvider } from '../../providers/util/util';
import { Injectable } from '@angular/core';

/*
  Generated class for the TemplateHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TemplateHandlerProvider {

  constructor(public tplPolygon: PolygonProvider, public tplCircle: CircleProvider, public tplLine: LineProvider, public tplMultiline: MultilineProvider,
    public util: UtilProvider) {
  }

  setFormData(formName, formData) {
    if (formName == 'circle') {
      this.tplCircle.set(formData.x, formData.y, formData.radius);
    } else if (formName == 'line') {
      this.tplLine.set(formData.a, formData.b); 
    } else if (formName == 'polygon') {
      this.tplPolygon.set(formData);
    } else if (formName == 'multiline') {
      this.tplMultiline.set(formData);
    } 
  }
  
  rotate(formName, dancers) {
    if (formName == 'circle') {
      this.tplCircle.rotateForm(-2 * Math.PI / 180, dancers);
    } else if (formName == 'line') {
      this.tplLine.rotate(-2 * Math.PI / 180, dancers);
    } else if (formName == 'polygon') {
      this.tplPolygon.rotate(-2 * Math.PI / 180, dancers);
    }
  }
  
  rotateDancers(formName, dancers) {
    if (formName == 'circle') {
      this.tplCircle.rotateForm(-2 * Math.PI / 180, dancers);
    } else if (formName == 'line') {
      // Rien pour l'instant
    } else if (formName == 'polygon') {
      this.tplPolygon.rotateForm(4, dancers);
    }
  }
  
  resize(formName, length, dancers) {
    if (formName == 'circle') {
      this.tplCircle.resize(length, dancers);
    } else if (formName == 'line') {
      this.tplLine.resize(length, dancers);
    } else if (formName == 'polygon') {
      this.tplPolygon.resize(length, dancers);
    } else if (formName == 'multiline') {
      this.tplMultiline.resize(length, dancers);
    }
  }
  
  rescale(formName, formData, ratioWidth, ratioHeight) {
    if (formName == 'circle') {
      formData.x = formData.x * ratioWidth;
      formData.y = formData.y * ratioHeight;
      formData.radius = formData.radius * ratioWidth;
    } else if (formName == 'line') {
      formData.a.x = formData.a.x * ratioWidth;
      formData.a.y = formData.a.y * ratioHeight;
      formData.b.x = formData.b.x * ratioWidth;
      formData.b.y = formData.b.y * ratioHeight;
    } else if (formName == 'polygon') {
      for (let point of formData) {
        point.x = point.x * ratioWidth;
        point.y = point.y * ratioHeight;
      }
    } else if (formName == 'multiline') {
      for (let line of formData) {
        line.a.x = line.a.x * ratioWidth;
        line.a.y = line.a.y * ratioHeight;
        line.b.x = line.b.x * ratioWidth;
        line.b.y = line.b.y * ratioHeight;
      }      
    }
  }
  
  getFormData(formName) {
    if (formName == 'circle') {
      return this.tplCircle.getCopy();
    }
    if (formName == 'line') {
      return this.tplLine.getCopy();
    }
    if (formName == 'polygon') {
      return this.tplPolygon.getCopy();
    }
    if (formName == 'multiline') {
      return this.tplMultiline.getCopy();
    }
    return null;
  }
  
  getCollisionPoint(formName, circle) {
    if (formName == 'polygon') {
      return this.util.collisionPolygonCircle(this.tplPolygon.points, circle);
    }
    if (formName == 'circle') {
      return this.util.collisionCircleDisk(this.tplCircle, circle);
    }
    if (formName == 'line') {
      return this.util.collisionSegmentCircle(this.tplLine.a, this.tplLine.b, circle);
    }
    if (formName == 'multiline') {
      /*
      for (let line of this.tplMultiline.lines) {
        let point = this.util.collisionSegmentCircle(line.a, line.b, circle);
        if (point != null) {
          return point;
        }
      }
      */
      for (let i = 0; i < this.tplMultiline.lines.length; i++) {
        let point = this.util.collisionSegmentCircle(this.tplMultiline.lines[i].a, this.tplMultiline.lines[i].b, circle);
        if (point != null) {
          this.tplMultiline.setLastPointedLine(i);
          return point;
        }
      }
    }
    return null;
  }
  
  move(formName, offsetX, offsetY, dancers) {
    if (formName == 'polygon') {
      this.tplPolygon.move(offsetX, offsetY, dancers);
    } else if (formName == 'circle') {
      this.tplCircle.move(offsetX, offsetY, dancers);
    } else if (formName == 'line') {
      this.tplLine.move(offsetX, offsetY, dancers);
    } else if (formName == 'multiline') {
      this.tplMultiline.move(offsetX, offsetY, dancers);
    }
  }
  
  draw(formName, ctx, color) {
    if (formName == 'circle') {
      this.tplCircle.draw(ctx, color);
    } else if (formName == 'line') {
      this.tplLine.draw(ctx, color);
    } else if (formName == 'polygon') {
      this.tplPolygon.draw(ctx, color);
    } else if (formName == 'multiline') {
      this.tplMultiline.draw(ctx, color);
    }
  }
  
  // ===== Formation rectangle =====
  
  newRectangleForm(width, height, percent, stepNumber, dancers) {
    this.tplPolygon.setDefaultRectangle(width, height, percent);
    this.initPolygonForm(stepNumber, dancers);
  }
  
  // ===== Formation carré =====
  
  newSquareForm(width, height, percent, stepNumber, dancers) {
    this.tplPolygon.setDefaultSquare(width, height, percent);
    this.initPolygonForm(stepNumber, dancers);
  }
  
  // ===== Formation triangle =====
  
  newTriangleForm(width, height, percent, stepNumber, dancers) {
    this.tplPolygon.setDefaultTriangle(width, height, percent);
    this.initPolygonForm(stepNumber, dancers);
  }
  
  /**
   * Place les danseurs autour du polygône.
   */
  initPolygonForm(stepNumber, dancers) {
    if (stepNumber > 0) {
      this.tplPolygon.initCleverForm(dancers);
    } else {
      this.tplPolygon.initForm(dancers);
    }
  }
  
  // ===== Formation ligne =====
  
  newVerticalLineForm(width, height, percent, stepNumber, dancers) {
    this.tplLine.setDefaultVertical(width, height, percent);
    this.initLineForm(stepNumber, dancers);
  }
  
  newHorizontalLineForm(width, height, percent, stepNumber, dancers) {
    this.tplLine.setDefaultHorizontal(width, height, percent);
    this.initLineForm(stepNumber, dancers);
  }
  
  /**
   * Place les danseurs sur la ligne
   */
  initLineForm(stepNumber, dancers) {
    if (stepNumber > 0) {
      this.tplLine.initCleverForm(dancers);
    } else {
      this.tplLine.initForm(dancers);
    }
  }
  
  // ===== Formation cercle =====
  
  newCircleForm(width, height, percent, stepNumber, dancers) {
    this.tplCircle.setDefault(width, height, percent);
    this.initCircleForm(stepNumber, dancers);
  }
  
  /**
   * Place les danseurs autour du cercle.
   */
  initCircleForm(stepNumber, dancers) {
    if (stepNumber > 0) {
      this.tplCircle.initCleverForm(dancers);
    } else {
      this.tplCircle.initForm(dancers);
    }
  }
  
  // ===== Formation multi-ligne =====
  
  newVerticalMultilineForm(width, height, percent, stepNumber, dancers, nbLines) {
    this.tplMultiline.setDefaultVertical(width, height, percent, nbLines);
    this.initMultilineForm(stepNumber, dancers);
  }
  
  newHorizontalMultilineForm(width, height, percent, stepNumber, dancers, nbLines) {
    this.tplMultiline.setDefaultHorizontal(width, height, percent, nbLines);
    this.initMultilineForm(stepNumber, dancers);
  }
  
  initMultilineForm(stepNumber, dancers) {
    if (stepNumber > 0) {
      this.tplMultiline.initCleverForm(dancers);
    } else {
      this.tplMultiline.initForm(dancers);
    }
  }
}
