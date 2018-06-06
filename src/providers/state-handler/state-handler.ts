import { Injectable } from '@angular/core';
/*
const state = { IDLE: 0, PLAYING: 1, RENAMING_DANCER: 2, TURNING_DANCER: 3, DRAGGING_DANCER: 4, DRAGGING_TEMPLATE: 5, BACKSTAGE: 6,
  DRAGGING_STAGE: 7, DRAGGING_DANCER_BACKSTAGE: 8 };
*/
const state = { NORMAL: 0, PLAYING: 1, BACKSTAGE: 2 };
const action = { IDLE: 0, RENAME_DANCER: 1, TURN_DANCER: 2, DRAG_DANCER: 3, DRAG_TEMPLATE: 4, DRAG_STAGE: 5 };

/*
  Generated class for the StateHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StateHandlerProvider {
  currentState: number;
  currentAction: number;
  helpText: string;
  dirty: boolean;

  constructor() {
    this.currentState = state.NORMAL;
    this.currentAction = action.IDLE;
    this.dirty = false;
    this.helpText = 'Créez une nouvelle chorégraphie ou chargez une chorégraphie existante';
  }
  
  setStateNormal() {
    this.helpText = 'Ajoutez une nouvelle forme ou déplacez manuellement les danseurs';
    this.currentState = state.NORMAL;
  }
  
  isStateNormal() {
    return (this.currentState == state.NORMAL);
  }
  
  setStatePlaying() {
    this.currentState = state.PLAYING;
  }
  
  isStatePlaying() {
    return (this.currentState == state.PLAYING);
  }
  
  setStateBackstage() {
    this.helpText = 'Faites glisser la scène pour voir les coulisses';
    this.currentState = state.BACKSTAGE;
  }
  
  isStateBackstage() {
    return (this.currentState == state.BACKSTAGE);
  }
  
  setActionIdle() {
    this.currentAction = action.IDLE;
  }
  
  isActionIdle() {
    return (this.currentAction == action.IDLE);
  }
  
  setActionRenameDancer() {
    this.helpText = 'Sélectionnez un danseur, puis choisissez une lettre';
    this.currentAction = action.RENAME_DANCER;
  }
  
  isActionRenameDancer() {
    return (this.currentAction == action.RENAME_DANCER);
  }
  
  setActionTurnDancer() {
    this.helpText = 'Cliquez sur un danseur pour le tourner';
    this.currentAction = action.TURN_DANCER;
  }
  
  isActionTurnDancer() {
    return (this.currentAction == action.TURN_DANCER);
  }
  
  setActionDragDancer() {
    this.currentAction = action.DRAG_DANCER;
  }
  
  isActionDragDancer() {
    return (this.currentAction == action.DRAG_DANCER);
  }
  
  setActionDragStage() {
    this.currentAction = action.DRAG_STAGE;
  }
  
  isActionDragStage() {
    return (this.currentAction == action.DRAG_STAGE);
  }
  
  setActionDragTemplate() {
    this.currentAction = action.DRAG_TEMPLATE;
  }
  
  isActionDragTemplate() {
    return (this.currentAction == action.DRAG_TEMPLATE);
  }

  getCurrentStateName() {
    switch (this.currentState) {
      case 0:
        return "NORMAL";
      case 1:
        return "PLAYING";
      case 2:
        return "BACKSTAGE";
      default:
        return "";
    }
  }
    
  getCurrentActionName() {
    switch (this.currentAction) {
      case 0:
        return "IDLE";
      case 1:
        return "RENAME_DANCER";
      case 2:
        return "TURN_DANCER";
      case 3:
        return "DRAG_DANCER";
      case 4:
        return "DRAG_TEMPLATE";
      case 5:
        return "DRAG_STAGE";
      default:
        return "";
      }
  }
  
  choregraphyLoaded() {
    this.helpText = 'Sélectionnez la dernière étape pour continuer la chorégraphie';
  }
  
  choregraphySaved() {
    this.helpText = 'Ajoutez une nouvelle forme ou déplacez manuellement les danseurs';
  }
  
  choregraphyAdded() {
    this.helpText = 'Ajoutez une nouvelle forme';
  }
  
  formAdded() {
    this.helpText = 'Enregistrez l\'étape pour enregistrer la position des élèves';
    this.dirty = true;
  }
  
  stepSaved() {
    this.helpText = 'Ajoutez une nouvelle forme ou déplacez manuellement les danseurs';
    this.dirty = false;
  }
  
  stepChanged() {
    this.dirty = false;
  }
  
  musicLoaded() {
    this.helpText = 'Enregistrez la chorégraphie pour enregistrer la musique';
  }
  
  dancerDragged() {
    this.helpText = 'Enregistrez l\'étape pour prendre en compte la nouvelle position du danseur';
    this.dirty = true;
    this.currentAction = action.IDLE;
  }
  
  dancerTurned() {
    this.helpText = 'Enregistrez l\'étape pour prendre en compte l\'orientation du danseur';
    this.dirty = true;
  }
  
  dancerRenamed() {
    this.helpText = 'Enregistrez la chorégraphie pour prendre en compte les nouveaux noms';
  }
  
  dancerResized() {
    this.helpText = 'Enregistrez la chorégraphie pour prendre en compte la nouvelle taille des danseurs';
  }
  
  dancerTypeChanged() {
    this.helpText = 'Enregistrez la chorégraphie pour prendre en compte le nouveau type de danseurs';
  }
  
  templateModified() {
    this.helpText = 'Enregistrez l\'étape pour prendre en compte les nouvelles positions des danseurs';
    this.dirty = true;
    this.currentAction = action.IDLE;
  }
  
  stepParameterChanged() {
    this.helpText = 'Enregistrez l\'étape pour prendre en compte les nouveaux paramètres';
    this.dirty = true;
  }
  
  isDirty() {
    return this.dirty;
  }
}
