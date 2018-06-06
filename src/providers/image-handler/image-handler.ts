import { Injectable } from '@angular/core';

/*
  Generated class for the ImageHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ImageHandlerProvider {
  images: { [key: string]: any } = {};

  constructor() {
  }

  loadImage(imageName) {
    var self = this;
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.src = 'assets/imgs/' + imageName;
      image.onload = function() {
        self.images[imageName] = image;
        resolve(imageName);
      }
      image.onerror = function() { 
        reject(imageName);
      };
    });
  }
  
  loadImages(imagesNames) {
    var promises = [];
    imagesNames.forEach(imageName => {
      promises.push(this.loadImage(imageName));
    });
    return Promise.all(promises);
  }
  
  get(imageName) {
    let image = this.images[imageName];
    return { image: image, width: image.width, height: image.height }; 
  }
}
