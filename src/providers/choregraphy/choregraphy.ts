import { Injectable } from '@angular/core';
import { StepProvider } from '../step/step';
import { DancerProvider } from '../dancer/dancer';
import { SpriteProvider } from '../sprite/sprite';
import { ImageHandlerProvider } from '../image-handler/image-handler';

let availableColours = ['Maroon', 'Red', 'Orange', 'Yellow', 'Olive', 'Green', 'Purple', 'Fuchsia', 'Lime', 'Teal', 'Aqua', 'Blue', 'Navy', 'Black', 'Gray'];

/*
  Generated class for the ChoregraphyProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ChoregraphyProvider {
  name: string;
  steps: any[]; // Tableau d'objets StepProvider
  dancers: any[]; // Tableau d'objets DancerProvider
  musicId: string; // ID de la musique dans la base
  dancerType: string = 'pawn';
  floorWidth: number;
  floorHeight: number;
  backstage: any; // Objet de type StepProvider

  constructor(public imageHandler: ImageHandlerProvider) {
  }

  /**
   * Nouvelle chorégraphie.
   */
  init(name, nbDancers) {
    this.steps = [];
    this.name = name;
    this.dancers = [];
    this.initDancers(nbDancers);
  }
  
  /**
   * Création des danseurs.
   */
  initDancers(nbDancers) {
    for (let i = 0; i < nbDancers; i++) {
      //let dancer = new SpriteProvider(this.imageHandler);
      let dancer = new DancerProvider();
      dancer.color = availableColours[i % availableColours.length];
      this.dancers.push(dancer);
    }
  }
  
  changeDancerType() {
    for (let i = 0; i < this.dancers.length; i++) {
      let dancer;
      if (this.dancerType == 'sprite') {
        dancer = new SpriteProvider(this.imageHandler);
      } else {
        dancer = new DancerProvider();
      }
      dancer.copy(this.dancers[i]);
      this.dancers[i] = dancer;
    }
  }
  
  /**
   * Chargement d'une chorégraphie en base.
   */
  load(jsonChoregraphy) {
    this.steps = this.loadSteps(jsonChoregraphy.steps);
    this.name = jsonChoregraphy.name;
    if (jsonChoregraphy.dancerType != null) {
      this.dancerType = jsonChoregraphy.dancerType;
    } else {
      this.dancerType = 'pawn';
    }
    if (jsonChoregraphy.backstage != null) {
      this.backstage = new StepProvider();
      this.backstage.copy(jsonChoregraphy.backstage);
    } else {
      this.backstage = null;
    }
    
    this.dancers = this.loadDancers(jsonChoregraphy.dancers);
  }
  
  /**
   * Instancie les objets DancerProvider à partir de la sauvegarde.
   */
  loadDancers(jsonDancers) {
    let dancers = [];
    for (let jsonDancer of jsonDancers) {
      let dancer;
      if (this.dancerType == 'sprite') {
        dancer = new SpriteProvider(this.imageHandler);
      } else {
        dancer = new DancerProvider();
      }
      dancer.copy(jsonDancer);
      dancers.push(dancer);
    }
    return dancers;
  }
  
  loadSteps(jsonSteps) {
    let steps = [];
    for (let jsonStep of jsonSteps) {
      let step = new StepProvider();
      step.copy(jsonStep);
      steps.push(step);
    }
    return steps;
  }
  
  setStep(stepNumber) {
    for (let dancer of this.dancers) {
      dancer.setStep(stepNumber);
    }
  }
  
  resizeDancers(length) {
    for (let dancer of this.dancers) {
      dancer.resize(length);
    }
  }
  
  addStep(step) {
    for (let dancer of this.dancers) {
      dancer.addStep();
    }
    let newStep = new StepProvider();
    newStep.copy(step);
    this.steps.push(newStep);
  }
  
  updateBackstage(step) {
    for (let dancer of this.dancers) {
      dancer.updateBackstage();
    }
    if (this.backstage == null) {
      this.backstage = new StepProvider();
    }
    this.backstage.copy(step);
  }
  
  setBackstage() {
    for (let dancer of this.dancers) {
      dancer.setBackstage();
    }
  }
  
  deleteBackstage() {
    for (let dancer of this.dancers) {
      dancer.deleteBackstage();
    }
    this.backstage = null;
  }
  
  updateStep(stepNumber, step) {
    for (let dancer of this.dancers) {
      dancer.updateStep(stepNumber);
    }
    this.steps[stepNumber].copy(step);
  }
  
  deleteStep(stepNumber) {
    this.steps.splice(stepNumber, 1);
    for (let dancer of this.dancers) {
      dancer.deleteStep(stepNumber);
    }
  }
  
  getFormName(stepNumber) {
    return this.steps[stepNumber].formName;
  }
  
  getFormData(stepNumber) {
    return this.steps[stepNumber].formData;
  }
  
  getCopy(withMusic?) {
    let musicId = null;
    if (withMusic == true) {
      musicId = this.musicId;
    }
    let copy = {
      name: this.name,
      steps: this.steps,
      dancers: this.getDancersCopy(),
      musicId: musicId,
      dancerType: this.dancerType,
      floorWidth: this.floorWidth,
      floorHeight: this.floorHeight,
      backstage: this.backstage
    }
    return copy;
  }
  
  getDancersCopy() {
    let dancersCopy = [];
    for (let dancer of this.dancers) {
      dancersCopy.push(dancer.getCopy());
    }
    return dancersCopy;
  }
}
