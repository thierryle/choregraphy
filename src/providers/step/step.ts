import { Injectable } from '@angular/core';

/*
  Generated class for the StepProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StepProvider {
  formName: string; // Nom de la formation (circle, line, polygon)
  formData: any; // Données décrivant la formation
  note: string; // Note saisie
  motionlessDuration: number = 1; // Durée d'immobilité initiale
  moveDuration: number = 2; // Durée d'animation jusqu'au step suivant  

  constructor() {
  }

  copy(step) {
    this.formName = step.formName;
    this.formData = step.formData;
    this.note = step.note;
    if (step.motionlessDuration != null) {
      this.motionlessDuration = step.motionlessDuration;
    } else {
      this.motionlessDuration = 1;
    }
    if (step.moveDuration != null) {
      this.moveDuration = step.moveDuration;
    } else {
      this.moveDuration = 2;
    }
  }
}
