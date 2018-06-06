import { StepProvider } from '../step/step';
import { Injectable } from '@angular/core';

/*
  Generated class for the StepHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StepHandlerProvider {
  currentStep: StepProvider; // Copie du step en cours d'édition ou nouveau step

  constructor() {
    this.currentStep = new StepProvider();
  }

  setCurrentFormName(formName) {
    this.currentStep.formName = formName;
  }
  
  getCurrentFormName() {
    return this.currentStep.formName;
  }
  
  setCurrentFormData(formData) {
    this.currentStep.formData = formData;
  }
  
  getCurrentFormData() {
    return this.currentStep.formData;
  }
  
  getCurrentMoveDuration() {
    return this.currentStep.moveDuration;
  }
  
  getCurrentMotionlessDuration() {
    return this.currentStep.motionlessDuration;
  }
  
  /**
   * Copie le step en paramètre, pour pouvoir travailler sur une copie.
   */
  setStep(step) {
    this.currentStep.copy(step);
  }
  
  clearDuration() {
    this.currentStep.motionlessDuration = 1;
    this.currentStep.moveDuration = 2;
    this.currentStep.note = '';
  }
}
