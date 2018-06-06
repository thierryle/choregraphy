import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, AlertController } from 'ionic-angular';

/*
  Generated class for the UtilProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilProvider {

  constructor(public http: HttpClient, public toastCtrl: ToastController, public alertCtrl: AlertController) {
    console.log('Hello UtilProvider Provider');
  }
  
  // ===== IHM =====
  
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
  
  warning(title, content) {
    let alert = this.alertCtrl.create({
      title: title,
      message: content,
      buttons: ['OK']
    });
    alert.present();
  }
  
  confirm(title, content, callbackYes, callbackNo, param) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: content,
      buttons: [
        { text: 'Non', handler: () => { callbackNo(param); } },
        { text: 'Oui', handler: () => { callbackYes(param); } }
      ]
    });
    confirm.present();
  }
  
  // ===== Math =====
  
  isInt(value) {
    if (isNaN(value)) {
      return false;
    }
    let x = parseFloat(value);
    return (x | 0) === x;
  }
  
  sqr(x) {
    return x * x;
  }

  /**
   * Longueur entre deux points
   */
  getLength(point1, point2) {
    return Math.sqrt(this.sqr(point2.x - point1.x) + this.sqr(point2.y - point1.y));
  }

  /**
   * Longueur d'un des segments d'un polygône. 
   */  
  getPolygonSegmentLength(polygon, index) {
    let nextPoint;
    if (index == polygon.length - 1) {
      nextPoint = 0;
    } else {
      nextPoint = index + 1;
    }
    return this.getLength(polygon[index], polygon[nextPoint]);
  }
  
  isOnSegment(point, point1, point2) {
    return Math.abs(((point2.x - point1.x) * (point.y - point1.y) - (point2.y - point1.y) * (point.x - point1.x))) < 0.01;
  }
  
  isOnCircle(point, circle) {
    let d2 = this.sqr(circle.x - point.x) + this.sqr(circle.y - point.y);
    return Math.abs(d2 - this.sqr(circle.radius)) < 0.01;
  }
  
  isOnPolygon(point, polygon) {
    let nextPoint;
    for (let i = 0; i < polygon.length; i++) {
      if (i == polygon.length - 1) {
        nextPoint = 0;
      } else {
        nextPoint = i + 1;
      }
      if (this.isOnSegment(point, polygon[i], polygon[nextPoint]) && !(point.x == polygon[nextPoint].x && point.y == polygon[nextPoint].y)) {
        return { a: i, b: nextPoint };
      }
    }
    return null;
  }
  
  getPerimeter(polygon) {
    let perimeter = 0;
    let nextPoint;
    for (let i = 0; i < polygon.length; i++) {
      if (i == polygon.length - 1) {
        nextPoint = 0;
      } else {
        nextPoint = i + 1;
      }
      perimeter += this.getLength(polygon[i], polygon[nextPoint]);
    }
    return perimeter;
  }
  
  getMiddle(a, b) {
    let m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    return m;
  }
  
  getBarycenter(polygon) {
    let barycenter = { x: 0, y: 0};
    for (let point of polygon) {
      barycenter.x += point.x;
      barycenter.y += point.y;
    }
    barycenter.x /= polygon.length;
    barycenter.y /= polygon.length;
    return barycenter;
  }
  
  resizePolygon(polygon, step) {
    let g = this.getBarycenter(polygon);
    for (let point of polygon) {
      this.stretch(point, g, step);
    }
  }
  
  /**
   * Prolonge une droite d'une certaine distance.
   */
  stretch(point, center, step) {
    let distanceToC = this.getLength(point, center);
    point.x = center.x + (point.x - center.x) * (distanceToC + step) / distanceToC;
    point.y = center.y + (point.y - center.y) * (distanceToC + step) / distanceToC;
  }
  
  /*
  getStretchRatio(point, center, step) {
    let a = { x: point.x, y: point.y };
    let distance = this.getLength(a, center);
    this.stretch(a, center, step);
    let newDistance = this.getLength(a, center);
    return newDistance / distance;
  }
  */
  
  /**
   * Lorsqu'on agrandit une droite, étire les points se trouvant sur la droite en respectant le ratio
   * (si un point se trouvait au 3/4 de la droite, il doit le rester après agrandissement de la droite).
   */
  stretchOnLine(point, a, b, step) {
    let m = this.getMiddle(a, b);
    if (this.sameValue(m.x, point.x) && this.sameValue(m.y, point.y)) {
      return;
    }
    let a2 = { x: a.x, y: a.y };
    this.stretch(a2, m, step);
    let ratio = this.getLength(a2, m) / this.getLength(a, m);
    let distance = this.getLength(point, m);
    this.stretch(point, m, distance * (ratio - 1));
  }
  
  stretchOnPolygon(point, polygon, step) {
    let g = this.getBarycenter(polygon);
    let segment = this.isOnPolygon(point, polygon);
    if (segment != null) {
      let a = { x: polygon[segment.a].x, y: polygon[segment.a].y };
      let b = { x: polygon[segment.b].x, y: polygon[segment.b].y };
      this.stretch(a, g, step);
      this.stretch(b, g, step);
      
      let i = this.intersectionLineLine(a, b, g, point);
      if (i == null) {
        // Le point est sur un sommet
        point.x = a.x;
        point.y = b.y;
      } else {
        point.x = i.x;
        point.y = i.y;
      }        
    }
  }
  
  rotateAroundPolygon(point, polygon, step) {
    // Sur quel segment est-on ?
    let segment = this.isOnPolygon(point, polygon);
    if (segment == null) {
      return false;
    }
    
    // Distance restante sur le segment courant
    let distanceLeft = this.getLength(point, polygon[segment.b]);
    if (step <= distanceLeft) {
      // On continue sur le segment courant
      point.x = point.x + step * (polygon[segment.b].x - point.x) / distanceLeft;
      point.y = point.y + step * (polygon[segment.b].y - point.y) / distanceLeft;
    } else {
      // On place le point au bout du segment et on rappelle récursivement la méthode avec la distance restante
      point.x = polygon[segment.b].x;
      point.y = polygon[segment.b].y;
      this.rotateAroundPolygon(point, polygon, (step - distanceLeft));
    }
  }
  
  rotateAroundCircle(point, circle, angle) {
    if (this.sameValue(point.x, circle.x) && this.sameValue(point.y, circle.y)) {
      return;
    }
    // Angle actuel
    let cosalpha = (point.x - circle.x) / circle.radius;
    if (cosalpha > 1) {
      cosalpha = 1;
    }
    let alpha;
    if (point.y > circle.y) {
      alpha = -Math.acos(cosalpha);
    } else {
      alpha = Math.acos(cosalpha);
    }
    
    point.x = circle.x + circle.radius * Math.cos(alpha + angle);
    point.y = circle.y - circle.radius * Math.sin(alpha + angle);    
  }
  
  // ===== Collisions =====
  
  collisionPointCircle(point, circle) {
    let d2 = this.sqr(point.x - circle.x) + this.sqr(point.y - circle.y);
    return (d2 <= this.sqr(circle.radius));
  }
  
  collisionLineCircle(a, b, circle) {
    let u = { x: b.x - a.x, y: b.y - a.y };
    let ac = { x: circle.x - a.x, y: circle.y - a.y };
    let numerator = u.x * ac.y - u.y * ac.x; // Norme du vecteur v
    if (numerator < 0) {
      numerator = -numerator; // Valeur absolue
    }
    let denominator = Math.sqrt(this.sqr(u.x) + this.sqr(u.y)); // Norme de u
    let ci = numerator / denominator;
    return (ci <= circle.radius);
  }
  
  collisionSegmentCircle(a, b, circle) {
    if (!this.collisionLineCircle(a, b, circle)) {
      return null;
    }
    let ab = { x: b.x - a.x, y: b.y - a.y };
    let ac = { x: circle.x - a.x, y: circle.y - a.y };
    let bc = { x: circle.x - b.x, y: circle.y - b.y };

    let pscal1 = ab.x * ac.x + ab.y * ac.y; // Produit scalaire
    let pscal2 = (-ab.x) * bc.x + (-ab.y) * bc.y;  // produit scalaire
    if (pscal1 >= 0 && pscal2 >= 0) {
      return this.projection(a, b, circle); // I entre A et B, OK
    }
  
    // Dernière possibilité, A ou B dans le cercle
    if (this.collisionPointCircle(a, circle)) {
      return this.projection(a, b, circle);
    }
    if (this.collisionPointCircle(b, circle)) {
      return this.projection(a, b, circle);
    }
    
    return null;
  }
  
  projection(a, b, c) {
    let u = { x: b.x - a.x, y: b.y - a.y };
    let ac = { x: c.x - a.x, y: c.y - a.y };
    let ti = (u.x * ac.x + u.y * ac.y) / (this.sqr(u.x) + this.sqr(u.y));
    let i = { x: a.x + ti * u.x, y: a.y + ti * u.y };
    return i;
  }
  
  collisionPolygonCircle(polygon, circle) {
    let nextPoint;
    for (let i = 0; i < polygon.length; i++) {
      if (i == polygon.length - 1) {
        nextPoint = 0;
      } else {
        nextPoint = i + 1;
      }
      let p = this.collisionSegmentCircle(polygon[i], polygon[nextPoint], circle); 
      if (p != null) {
        return p;
      }
    }
    return null;
  }
  
  collisionCircleCircle(circle1, circle2) {
    let d2 = this.sqr(circle1.x - circle2.x) + this.sqr(circle1.y - circle2.y);
    if (d2 > this.sqr(circle1.radius + circle2.radius)) {
      return null;
    }
    let distance = Math.sqrt(d2);
    let i = { x: circle1.x + circle1.radius * (circle2.x - circle1.x) / distance, y: circle1.y + circle1.radius * (circle2.y - circle1.y) / distance }
    return i;
  }
  
  collisionCircleDisk(circle, disk) {
    let d2 = this.sqr(circle.x - disk.x) + this.sqr(circle.y - disk.y);
    if (d2 > this.sqr(circle.radius + disk.radius) || d2 < this.sqr(circle.radius - disk.radius)) {
      return null;
    }
    let distance = Math.sqrt(d2);
    let i = { x: circle.x + circle.radius * (disk.x - circle.x) / distance, y: circle.y + circle.radius * (disk.y - circle.y) / distance }
    return i;
  }
  
  /**
   * Avec les erreurs d'arrondi, deux valeurs ne sont jamais totalement identiques.
   */
  sameValue(a, b) {
    return Math.abs(a - b) < 0.01;
  }
  
  intersectionLineLine(a, b, c, d) {
    let i = { x: 0, y: 0 };
    let m1, p1, m2, p2;
    
    //if (a.x != b.x) {
    if (!this.sameValue(a.x, b.x)) {
      // Equation de la première droite
      m1 = (b.y - a.y) / (b.x - a.x);
      p1 = a.y - m1 * a.x; 
    }
    
    //if (c.x != d.x) {
    if (!this.sameValue(c.x, d.x)) {
      // Equation de la seconde droite
      m2 = (d.y - c.y) / (d.x - c.x);
      p2 = c.y - m2 * c.x;
    }
    
    //if (a.x == b.x) {
    if (this.sameValue(a.x, b.x)) {
      //if (c.x == d.x) {
      if (this.sameValue(c.x, d.x)) {
        return null;
      }
      i.x = a.x;
      i.y = m2 * i.x + p2;
      return i;
    }
    
    //if (c.x == d.x) {
    if (this.sameValue(c.x, d.x)) {
      i.x = c.x;
      i.y = m1 * i.x + p1;
      return i;
    }
    
    //if (m1 == m2) {
    if (this.sameValue(m1, m2)) {
      // Les deux droites sont parallèles
      return null;
    }
    
    // Cas général
    i.x = (p2 - p1) / (m1 - m2);
    i.y = m1 * (p2 - p1) / (m1 - m2) + p1;
    return i;
  }
  
  getNearestPoint(x, y, points) {
    let a = { x: x, y: y };
    let nearest = 0;
    let minDistance = this.getLength(a, points[0]);
    for (let i = 1; i < points.length; i++) {
      let distance = this.getLength(a, points[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = i;
      }
    }
    return nearest;
  }
}
