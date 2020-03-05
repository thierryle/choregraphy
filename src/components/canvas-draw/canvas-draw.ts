import { Component, ViewChild, Renderer, HostListener } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { UtilProvider } from '../../providers/util/util';
import { StorageProvider } from '../../providers/storage/storage';
//import { StepProvider } from '../../providers/step/step';
import { ChoregraphyProvider } from '../../providers/choregraphy/choregraphy';
import { TimeHandlerProvider } from '../../providers/time-handler/time-handler';
import { TemplateHandlerProvider } from '../../providers/template-handler/template-handler';
import { BackgroundHandlerProvider } from '../../providers/background-handler/background-handler';
import { ImageHandlerProvider } from '../../providers/image-handler/image-handler';
import { StateHandlerProvider } from '../../providers/state-handler/state-handler';
import { StepHandlerProvider } from '../../providers/step-handler/step-handler';

@Component({
  selector: 'canvas-draw',
  templateUrl: 'canvas-draw.html'
})
export class CanvasDrawComponent {
  @ViewChild('myCanvas') canvas: any;
  @ViewChild('bgCanvas') bgCanvas: any;
  @ViewChild('music') music: any;
  
  canvasElement: any;
  ctx: any;
  musicElement: any
  
  lastX: number;
  lastY: number;
  translateX: number = 0;
  translateY: number = 0;
  
  // Chorégraphie
  storageKey: string = null;
  
  // Danseurs
  selectedDancer: number = -1;
  
  // Etapes
  currentStepNumber: number = 0;
  lbStepNumber: number = 0;
  lbStepsNumbers: any[]; // Pour afficher la listbox des steps
  //stepRange: number = 0; // Pour faire défiler un step avec un range
  
  // Animation
  raf: any;
  timeout: any;
  
  // Templates
  tplColor: string = 'Gray';
  collisionPoint: any;
  percent: number = 0.7;
  
  // Musique
  musicInfo: any;
 
  constructor(public platform: Platform, public renderer: Renderer, public alertCtrl: AlertController, public util: UtilProvider,
    public storage: StorageProvider, public choregraphy: ChoregraphyProvider, public timeHandler: TimeHandlerProvider,
    public templateHandler: TemplateHandlerProvider, public backgroundHandler: BackgroundHandlerProvider, imageHandler: ImageHandlerProvider,
    public stateHandler: StateHandlerProvider, public stepHandler: StepHandlerProvider) {
    
    imageHandler.loadImages(['dancer.png']).then(imagesNames => {
      imagesNames.forEach(imageName => {
        console.log(imageName + ' chargée');
      });
    })
  }
  
  ngAfterViewInit() {
    this.canvasElement = this.canvas.nativeElement;
    this.renderer.setElementAttribute(this.canvasElement, 'width', this.platform.width() + '');
    this.renderer.setElementAttribute(this.canvasElement, 'height', this.platform.height() + '');
    this.ctx = this.canvasElement.getContext('2d');
    
    // Background
    let bgCanvasElement = this.bgCanvas.nativeElement;
    this.renderer.setElementAttribute(bgCanvasElement, 'width', this.platform.width() + '');
    this.renderer.setElementAttribute(bgCanvasElement, 'height', this.platform.height() + '');
    this.backgroundHandler.init(bgCanvasElement);

    // Composant musique
    this.musicElement = this.music.nativeElement;
    this.musicElement.controls = true;
  }
  
  /**
   * Nouvelle chorégraphie
   */
  initChoregraphy(name, nbDancers) {
    this.storageKey = null;
    this.choregraphy.init(name, nbDancers);
    this.initLbStepsNumbers();
    this.pushLbStepsNumbers(0);
    this.currentStepNumber = 0;
    this.lbStepNumber = 0;
    this.reinitMusic();
  }
  
  initLbStepsNumbers() {
    this.lbStepsNumbers = [{ label: 'Intro', value: -1 }];
  }
  
  pushLbStepsNumbers(value) {
    this.lbStepsNumbers.push({ label: (value + 1).toString(), value: value});
  }
  
  /**
   * Chargement d'une chorégraphie depuis la base de données.
   */
  loadChoregraphy(key) {
    this.storage.getChoregraphy(key).then(choregraphy => {
      this.storageKey = key;
      this.choregraphy.load(choregraphy);
      this.initLbStepsNumbers();
      for (let i = 0; i < this.choregraphy.steps.length + 1; i++) {
        this.pushLbStepsNumbers(i);
      }
      this.setStep(0);
      if (choregraphy.musicId != null) {
        this.loadMusic(choregraphy.musicId);
      } else {
        this.reinitMusic();
      }
      this.stateHandler.choregraphyLoaded();
    });
  }
  
  changeStep() {
    if (this.stateHandler.isDirty()) {
      this.util.confirm(
        'Modifications',
        'Vous avez effectué des modifications à l\'étape courante. Souhaitez-vous enregistrer ces modifications ?',
        this.saveAndSetStep.bind(this),
        this.setStep.bind(this),
        this.lbStepNumber)
    } else {
      this.setStep(this.lbStepNumber);
    }
  }
  
  saveAndSetStep(stepNumber) {
    this.saveStep();
    this.setStep(stepNumber);
  }
  
  /**
   * Positionne le step courant.
   */
  setStep(stepNumber) {
    this.currentStepNumber = stepNumber;
    this.lbStepNumber = this.currentStepNumber;
    if (stepNumber == -1) {
      // On passe en mode BACKSTAGE
      this.stateHandler.setStateBackstage();
      if (this.choregraphy.backstage == null) {
        // Le backstage n'existe pas encore
        this.stepHandler.setCurrentFormName('line');
        this.newHorizontalLineForm();
        this.stepHandler.clearDuration();
      } else {
        // Backstage existant
        this.choregraphy.setBackstage();
        this.stepHandler.setStep(this.choregraphy.backstage);
        this.setStepTemplate(stepNumber);
      }      
    } else if (stepNumber < this.choregraphy.steps.length) {
      // Step existant
      this.choregraphy.setStep(stepNumber);
      this.stepHandler.setStep(this.choregraphy.steps[stepNumber]);
      this.setStepTemplate(stepNumber);
      
      if (this.stateHandler.isStateBackstage()) {
        this.exitBackstage();
      }
    } else {
      // Dernier step (pas encore enregistré)
      if (this.choregraphy.steps.length > 0) {
        this.choregraphy.setStep(stepNumber - 1);
        this.stepHandler.setStep(this.choregraphy.steps[stepNumber - 1]);
        this.setStepTemplate(stepNumber - 1);
      }            
      if (this.stateHandler.isStateBackstage()) {
        this.exitBackstage();
      }
    }
    
    this.stateHandler.stepChanged();
    this.drawAll();
  }
  
  /*
  setStepRange() {
    if (this.currentStepNumber < this.choregraphy.steps.length - 1) {
      let nextStep = this.currentStepNumber + 1;
      for (let dancer of this.choregraphy.dancers) {
        dancer.x = dancer.steps[this.currentStepNumber].x + (dancer.steps[nextStep].x - dancer.steps[this.currentStepNumber].x) * this.stepRange / 100;
        dancer.y = dancer.steps[this.currentStepNumber].y + (dancer.steps[nextStep].y - dancer.steps[this.currentStepNumber].y) * this.stepRange / 100;
      }
      this.drawAll();
    }
  }
  */
  
  setStepTemplate(stepNumber) {
    let formName;
    if (stepNumber == -1) {
      formName = this.choregraphy.backstage.formName;
    } else {
      formName = this.choregraphy.getFormName(stepNumber);
    }
    let formData;
    if (stepNumber == -1) {
      formData = this.choregraphy.backstage.formData;
    } else {
      formData = this.choregraphy.getFormData(stepNumber);
    }
    this.templateHandler.setFormData(formName, formData);
  }
 
  // ===== Toolbar =====
  
  /**
   * Popup pour sélectionner la chorégraphie à ouvrir.
   */
  openChoregraphy() {
    this.storage.getChoregraphies().then(choregraphies => {
      if (choregraphies.length == 0) {
        this.util.warning('Chorégraphies', 'Aucune chorégraphie n\'a été enregistrée');
      } else {
        let alert = this.alertCtrl.create({
          title: 'Chorégraphies',
          buttons: [
            { text: 'Annuler', role: 'cancel' },
            { text: 'OK', handler: key => { return this.handleOpenChoregraphie(key); } }
          ]
        });
        for (let choregraphy of choregraphies) {
          alert.addInput({ type: 'radio', label: choregraphy.name, value: choregraphy.key, checked: false });
        }
        alert.present();
      }
    });
  }
  
  handleOpenChoregraphie(key) {
    if (key == null || key == '') {
      return false;
    }
    this.loadChoregraphy(key);
    return true;
  }
  
  /**
   * Sauvegarde de la chorégraphie.
   */
  saveChoregraphy() {
    if (this.choregraphy.name == null || this.choregraphy.name == '') {
      this.util.warning('Sauvegarde', 'Aucune chorégraphie en cours');
      return;
    }
    if (this.choregraphy.steps == null || this.choregraphy.steps.length == 0) {
      this.util.warning('Sauvegarde', 'Aucune étape n\'a été enregistrée');
      return;
    }
    
    if (this.musicInfo != null && this.choregraphy.musicId == null) {
      // L'utilisateur a chargé une musique, mais elle n'a pas encore été enregistrée
      this.storage.addMusic(this.musicInfo).then(key => {
        this.choregraphy.musicId = key;
        this.saveOrUpdateChoregraphy(this.choregraphy);
      });
    } else {
      this.saveOrUpdateChoregraphy(this.choregraphy);
    }
  }
  
  /**
   * Export de la chorégraphie dans un fichier texte.
   */
  exportChoregraphy() {
    this.choregraphy.floorWidth = this.canvasElement.width;
    this.choregraphy.floorHeight = this.canvasElement.height;
    let blob = new Blob([JSON.stringify(this.choregraphy.getCopy())], { type: 'text/plain' });
    let downloader = document.createElement('a');
    downloader.setAttribute('href', window.URL.createObjectURL(blob));
    downloader.setAttribute('download', this.choregraphy.name + '.txt');
    downloader.click();
  }
  
  /**
   * Import d'une chorégraphie depuis un fichier texte.
   */
  onFileImportChange(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];

      reader.readAsDataURL(file);
      reader.onload = () => {
        let jsonChoregraphy = JSON.parse(this.b64DecodeUnicode(reader.result.split(',')[1]));
        this.rescale(jsonChoregraphy);
        this.choregraphy.load(jsonChoregraphy);
        this.initLbStepsNumbers();
        for (let i = 0; i < this.choregraphy.steps.length + 1; i++) {
          this.pushLbStepsNumbers(i);
        }
        this.setStep(0); 
      };
    }
  }
  
  /**
   * Si la résolution d'écran n'est pas la même que celle du fichier à importer, il faut redimensionner les données à importer. 
   */
  rescale(jsonChoregraphy) {
    if (jsonChoregraphy.floorWidth == null || jsonChoregraphy.floorHeight == null) {
      return;
    }
    if (jsonChoregraphy.floorWidth == this.canvasElement.width && jsonChoregraphy.floorHeight == this.canvasElement.height) {
      return;
    }
    let ratioWidth = this.canvasElement.width / jsonChoregraphy.floorWidth;
    let ratioHeight = this.canvasElement.height / jsonChoregraphy.floorHeight;
    
    for (let dancer of jsonChoregraphy.dancers) {
      if (dancer.backstage != null) {
        dancer.backstage.x = dancer.backstage.x * ratioWidth;
        dancer.backstage.y = dancer.backstage.y * ratioHeight;
      }
      for (let step of dancer.steps) {
        step.x = step.x * ratioWidth;
        step.y = step.y * ratioHeight;
      }
    }
    
    for (let step of jsonChoregraphy.steps) {
      this.templateHandler.rescale(step.formName, step.formData, ratioWidth, ratioHeight);
    }
    if (jsonChoregraphy.backstage != null) {
      this.templateHandler.rescale(jsonChoregraphy.backstage.formName, jsonChoregraphy.backstage.formData, ratioWidth, ratioHeight);
    }
  }
  
  b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  }
  
  saveOrUpdateChoregraphy(choregraphy) {
    if (this.storageKey == null) {
      this.storage.addChoregraphy(choregraphy.getCopy(true)).then(key => {
        this.util.showToast('Chorégraphie sauvegardée');
        //this.stateHandler.choregraphySaved();
      });
    } else {
      this.storage.updateChoregraphy(this.storageKey, choregraphy.getCopy(true)).then(() => {
        this.util.showToast('Chorégraphie mise à jour');
        //this.stateHandler.choregraphySaved();
      });
    }
  }
  
  /**
   * Nouvelle chorégraphie.
   */
  addChoregraphy() {
    let alert = this.alertCtrl.create({
      title: 'Nouvelle chorégraphie',
      inputs: [
        { name: 'name', placeholder: 'Nom de la chorégraphie' },
        { name: 'nbDancers', placeholder: 'Nombre de danseurs' }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'OK', handler: data => { return this.handleAddChoregraphie(data); } }
      ]
    });
    alert.present();
  }
  
  handleAddChoregraphie(data) {
    if (data['name'] == null || data['name'] == '') {
      return false;
    }
    if (data['nbDancers'] == null || data['nbDancers'] == '' || isNaN(data['nbDancers'])) {
      return false;
    }
    this.initChoregraphy(data['name'], parseInt(data['nbDancers']));
    this.clearCanvas();
    this.stateHandler.choregraphyAdded();
    return true;
  }
  
  /**
   * Ajout d'une nouvelle formation.
   */
  addForm() {
    let alert = this.alertCtrl.create({
      title: 'Ajouter une formation',
      inputs: [
        { type: 'radio', label: 'Cercle', value: 'circle' },
        { type: 'radio', label: 'Rectangle', value: 'rectangle' },
        { type: 'radio', label: 'Carré', value: 'square' },
        { type: 'radio', label: 'Ligne horizontale', value: 'horizontalLine' },
        { type: 'radio', label: 'Ligne verticale', value: 'verticalLine' },
        { type: 'radio', label: 'Triangle', value: 'triangle' },
        { type: 'radio', label: 'Multi-ligne horizontal', value: 'horizontalMultiline' },
        { type: 'radio', label: 'Multi-ligne vertical', value: 'verticalMultiline' }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'OK', handler: data => { return this.handleAddForm(data); } }
      ]
    });
    alert.present();
  }
  
  handleAddForm(data) {
    if (data == null || data == '') {
      return false;
    }
    if (data == 'circle') {
      this.stepHandler.setCurrentFormName('circle');
      this.newCircleForm();
    } else if (data == 'rectangle') {
      this.stepHandler.setCurrentFormName('polygon');
      this.newRectangleForm();
    } else if (data == 'square') {
      this.stepHandler.setCurrentFormName('polygon');
      this.newSquareForm();
    } else if (data == 'horizontalLine') {
      this.stepHandler.setCurrentFormName('line');
      this.newHorizontalLineForm();
    } else if (data == 'verticalLine') {
      this.stepHandler.setCurrentFormName('line');
      this.newVerticalLineForm();
    } else if (data == 'triangle') {
      this.stepHandler.setCurrentFormName('polygon');
      this.newTriangleForm();
    } else if (data == 'horizontalMultiline' || data == 'verticalMultiline') {
      this.addMultilineForm(data);
      return true;      
    }
    this.drawAll();
    this.stateHandler.formAdded();
    return true;
  }
  
  addMultilineForm(formName) {
    let alert = this.alertCtrl.create({
      title: 'Ajouter une formation',
      inputs: [
        { name: 'nbLines', placeholder: 'Nombre de lignes', type: 'number' }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'OK', handler: data => { return this.handleAddMultilineForm(formName, data.nbLines); } }
      ]
    });
    alert.present();
  }
  
  handleAddMultilineForm(formName, nbLibnes) {
    if (nbLibnes == null || nbLibnes == '') {
      return false;
    }
    if (formName == 'horizontalMultiline') {
      this.stepHandler.setCurrentFormName('multiline');
      this.newHorizontalMultilineForm(parseInt(nbLibnes));
    } else if (formName == 'verticalMultiline') {
      this.stepHandler.setCurrentFormName('multiline');
      this.newVerticalMultilineForm(parseInt(nbLibnes));
    }
    this.drawAll();
    this.stateHandler.formAdded();
    return true;
  }
  
  /**
   * Rotation du template avec les danseurs dessus.
   */
  startRotating() {
    this.templateHandler.rotate(this.stepHandler.getCurrentFormName(), this.choregraphy.dancers);
    this.drawAll();

    this.raf = window.requestAnimationFrame(() => {
      this.startRotating();
    });
  }
  
  stopRotating() {
    window.cancelAnimationFrame(this.raf);
    this.stateHandler.templateModified();
  }
  
  /**
   * Rotation des danseurs autour du template.
   */
  startRotatingDancers() {
    this.templateHandler.rotateDancers(this.stepHandler.getCurrentFormName(), this.choregraphy.dancers);
    this.drawAll();

    this.raf = window.requestAnimationFrame(() => {
      this.startRotatingDancers();
    });
  }
  
  stopRotatingDancers() {
    window.cancelAnimationFrame(this.raf);
    this.stateHandler.templateModified();
  }
  
  /**
   * Redimensionnement du template avec les danseurs dessus.
   */
  startUpsizing() {
    this.startResizing(2);
  }
  
  stopUpsizing() {
    window.cancelAnimationFrame(this.raf);
    this.stateHandler.templateModified();
  }
  
  startDownsizing() {
    this.startResizing(-2);
  }
  
  stopDownsizing() {
    window.cancelAnimationFrame(this.raf);
    this.stateHandler.templateModified();
  }
  
  startResizing(length) {
    this.templateHandler.resize(this.stepHandler.getCurrentFormName(), length, this.choregraphy.dancers);
    this.drawAll();

    this.raf = window.requestAnimationFrame(() => {
      this.startResizing(length);
    });
  }
  
  /**
   * Redimensionnement des danseurs.
   */
  startUpsizingDancers() {
    this.startResizingDancers(1);
  }
  
  stopUpsizingDancers() {
    window.cancelAnimationFrame(this.raf);
    this.stateHandler.dancerResized();
  }
  
  startDownsizingDancers() {
    this.startResizingDancers(-1);
  }
  
  stopDownsizingDancers() {
    window.cancelAnimationFrame(this.raf);
    this.stateHandler.dancerResized();
  }
  
  startResizingDancers(length) {
    this.choregraphy.resizeDancers(length);
    this.drawAll();

    this.raf = window.requestAnimationFrame(() => {
      this.startResizingDancers(length);
    });
  }
  
  /**
   * Redimensionnement de la grille
   */
  startUpsizingGrid() {
    this.startResizingGrid(2);
  }
  
  startDownsizingGrid() {
    this.startResizingGrid(-2);
  }
  
  startResizingGrid(length) {
    this.backgroundHandler.resizeGrid(length);

    this.raf = window.requestAnimationFrame(() => {
      this.startResizingGrid(length);
    });
  }
  
  /**
   * Arrêt de l'animation en cours.
   */
  stop() {
    window.cancelAnimationFrame(this.raf);
  }
  
  /**
   * Enregistrement de l'étape courante.
   */
  saveStep() {
    this.stepHandler.setCurrentFormData(this.templateHandler.getFormData(this.stepHandler.getCurrentFormName()));
    
    if (this.stateHandler.isStateBackstage()) {
      this.choregraphy.updateBackstage(this.stepHandler.currentStep);
      this.setStep(0);
    } else {
      if (this.currentStepNumber == this.choregraphy.steps.length) {
        // Nouveau step
        this.choregraphy.addStep(this.stepHandler.currentStep);      
        this.currentStepNumber++;
        this.pushLbStepsNumbers(this.currentStepNumber);
        this.lbStepNumber = this.currentStepNumber;
        this.stepHandler.clearDuration();
      } else {
        // Ancien step
        this.choregraphy.updateStep(this.currentStepNumber, this.stepHandler.currentStep);
      }
    }
    this.stateHandler.stepSaved();
  }
  
  /**
   * Suppression de l'étape courante.
   */
  deleteStep() {
    if (this.stateHandler.isStateBackstage()) {
      this.choregraphy.deleteBackstage();
      this.setStep(0);
    } else if (this.currentStepNumber < this.choregraphy.steps.length) {
      this.choregraphy.deleteStep(this.currentStepNumber);
      
      this.initLbStepsNumbers();
      for (let i = 0; i < this.choregraphy.steps.length + 1; i++) {
        this.pushLbStepsNumbers(i);
      }
      this.setStep(this.currentStepNumber);
    }
  }
  
  /**
   * On montre ou cache la grille.
   */
  showOrHideGrid() {
    this.backgroundHandler.showOrHideGrid();
  }
  
  /**
   * Changement de type de dessin pour les danseurs.
   */
  changeDancerType() {
    this.choregraphy.changeDancerType();
    this.drawAll();
    this.stateHandler.dancerTypeChanged();
  }
  
  exitBackstage() {
    this.ctx.translate(-this.translateX, -this.translateY);
    this.backgroundHandler.translate(-this.translateX, -this.translateY, false);
    this.translateX = 0;
    this.translateY = 0;
    this.drawAll();
    this.stateHandler.setStateNormal();
  }
  
  stepParameterChanged() {
    this.stateHandler.stepParameterChanged();
  }
  
  // ===== Interactions avec le canvas =====
  
  handleStart(ev) {
    //this.startDrawing(ev.touches[0].pageX, ev.touches[0].pageY)
    this.startPointing(ev.touches[0].pageX, ev.touches[0].pageY);
  }
 
  handleMove(ev) {
    //this.draw(ev.touches[0].pageX, ev.touches[0].pageY);
    this.movePointing(ev.touches[0].pageX, ev.touches[0].pageY);
  }
  
  handleEnd(ev) {
    this.stopPointing();
  }
    
  handleMouseDown(ev) {
    this.startPointing(ev.offsetX, ev.offsetY);
  }
  
  handleMouseMove(ev) {
    this.movePointing(ev.offsetX, ev.offsetY);
  }
  
  handleMouseUp(ev) {
    this.stopPointing();
  }
  
  /**
   * L'utilisateur a cliqué avec la souris ou a touché l'écran.
   */
  startPointing(x, y) {
    this.lastX = x;
    this.lastY = y;
    
    if (this.stateHandler.isStateNormal()) {
      // Mode NORMAL
      if (this.selectDancer(x, y)) {
        // Sélection d'un danseur
        this.handleSelectDancer();
      } else if (this.selectTemplate(x, y)) {
        // Sélection d'un template
        this.stateHandler.setActionDragTemplate();
      } else {
        // Aucune action
        this.stateHandler.setActionIdle();
        this.drawAll();
      }
    } else if (this.stateHandler.isStateBackstage()) {
      // Mode BACKSTAGE, le pointeur est décalé
      if (this.selectDancer(x - this.translateX, y - this.translateY)) {
        // Sélection d'un danseur
        this.handleSelectDancer();
      } else {
        // S'il n'a pas sélectionné de danseur, il déplace la scène
        this.stateHandler.setActionDragStage();
      }      
    }
  }
  
  handleSelectDancer() {
    if (this.stateHandler.isActionRenameDancer()) {
      // On redessine le danseur pour afficher son aura
      this.drawAll();
    } else if (this.stateHandler.isActionTurnDancer()) {
      // On tourne le danseur et on redessine
      this.choregraphy.dancers[this.selectedDancer].turn();
      this.stateHandler.dancerTurned();
      this.drawAll();
    } else {
      // Sinon, déplacement du danseur
      this.stateHandler.setActionDragDancer();
    }
  }
  
  /**
   * L'utilisateur déplacer la souris.
   * Selon le mode, il peut être en train de déplacer un danseur ou le template.
   */
  movePointing(x, y) {
    if (this.stateHandler.isStateNormal()) {
      // Mode NORMAL
      if (this.stateHandler.isActionDragDancer()) {
        this.dragDancer(x, y);
      } else if (this.stateHandler.isActionDragTemplate()) {
        this.dragCurrentTemplate(x, y);
      }
    } else if (this.stateHandler.isStateBackstage()) {
      // Mode BACKSTAGE
      if (this.stateHandler.isActionDragDancer()) {
        this.dragDancer(x - this.translateX, y - this.translateY);
      } else if (this.stateHandler.isActionDragStage()) {
        this.dragStage(x, y);
      }
    }
    
    this.lastX = x;
    this.lastY = y;
  }
  
  /**
   * L'utilisateur lâche le bouton de la souris.
   */
  stopPointing() {
    if (this.stateHandler.isStateNormal()) {
      // Mode NORMAL
      if (this.stateHandler.isActionDragDancer()) {
        this.dropDancer();
        this.stateHandler.dancerDragged();
      } else if (this.stateHandler.isActionDragTemplate()) {
        this.dropTemplate();
        this.stateHandler.templateModified();
      }
    } else if (this.stateHandler.isStateBackstage()) {
      // Mode BACKSTAGE
      if (this.stateHandler.isActionDragDancer()) {
        this.stateHandler.dancerDragged();
      } else if (this.stateHandler.isActionDragStage()) {
        this.stateHandler.setActionIdle();
      }
    }
  }
  
  /**
   * Sélection d'un danseur.
   * Retourne true si un danseur a été sélectionné, false sinon.
   */
  selectDancer(x, y) {
    for (let i = 0; i < this.choregraphy.dancers.length; i++) {
      if (this.choregraphy.dancers[i].contains(x, y)) {
        this.selectedDancer = i;
        return true;
      }
    }
    return false;
  }
  
  /**
   * Lâchage du danseur.
   */
  dropDancer() {
    if (this.collisionPoint != null) {
      this.choregraphy.dancers[this.selectedDancer].setPos(this.collisionPoint.x, this.collisionPoint.y);
      this.tplColor = 'LightGray';
      this.drawAll();
    }
  }
  
  /**
   * Déplacement du danseur sélectionné.
   */
  dragDancer(x, y) {
    this.choregraphy.dancers[this.selectedDancer].setPos(x, y);
    this.adherence(this.choregraphy.dancers[this.selectedDancer]);
    this.drawAll();
  }
  
  /**
   * Sélection d'un template.
   * Retourne true si un template a été sélectionné, false sinon.
   */
  selectTemplate(x, y) {
    let circle = { x: x, y: y, radius: 5 };
    let collisionPoint = this.templateHandler.getCollisionPoint(this.stepHandler.getCurrentFormName(), circle);
    if (collisionPoint != null) {
      this.tplColor = 'Green';
      this.drawAll();
      return true;
    }
    
    return false;   
  }
  
  dragCurrentTemplate(x, y) {
    let offsetX = x - this.lastX;
    let offsetY = y - this.lastY;
    this.templateHandler.move(this.stepHandler.getCurrentFormName(), offsetX, offsetY, this.choregraphy.dancers);
    this.drawAll();
  }
  
  dropTemplate() {
    this.tplColor = 'LightGray';
    this.drawAll();
  }
  
  renameDancer() {
    if (!this.stateHandler.isActionRenameDancer()) {
      this.selectedDancer = -1;
      this.stateHandler.setActionRenameDancer();
    } else {
      this.stateHandler.setActionIdle();
    }
  }
  
  turnDancer() {
    if (!this.stateHandler.isActionTurnDancer()) {
      this.stateHandler.setActionTurnDancer();
    } else {
      this.stateHandler.setActionIdle();
    }
  }
  
  dragStage(x, y) {
    let offsetX = x - this.lastX;
    let offsetY = y - this.lastY;
    this.ctx.translate(offsetX, offsetY);
    this.translateX += offsetX;
    this.translateY += offsetY;
    this.backgroundHandler.translate(offsetX, offsetY, true);
    this.drawAll();
  }
  
  // ===== Adhérence =====
  
  /**
   * Le danseur est-il sur le template ?
   * Si oui, on l'y raccroche.
   */
  adherence(dancer) {
    let circle = dancer.getInnerCircle();
    this.collisionPoint = this.templateHandler.getCollisionPoint(this.stepHandler.getCurrentFormName(), circle);
    if (this.collisionPoint != null) {
      this.tplColor = 'Orange';
    } else {
      this.tplColor = 'LightGray';
    }
  }
  
  // ===== Dessin =====
 
  drawCurrentTemplate() {
    this.templateHandler.draw(this.stepHandler.getCurrentFormName(), this.ctx, this.tplColor);
  }
  
  clearCanvas() {
    if (this.stateHandler.isStateBackstage()) {
      this.ctx.clearRect(-this.canvasElement.width, -this.canvasElement.height, 3 * this.canvasElement.width, 3 * this.canvasElement.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }      
  }
  
  drawDancersMoving() {
    for (let dancer of this.choregraphy.dancers) {
        dancer.drawMoving(this.ctx);
    }
  }
  
  drawDancersMotionless() {
    for (let i = 0; i < this.choregraphy.dancers.length; i++) {
      if (this.stateHandler.isActionRenameDancer() && i == this.selectedDancer) {
        this.choregraphy.dancers[i].drawMotionlessHalo(this.ctx);
      } else {
        this.choregraphy.dancers[i].drawMotionless(this.ctx);
      }      
    }
  }
  
  drawAll() {
    this.clearCanvas();
    this.drawCurrentTemplate();
    this.drawDancersMotionless();
  }
  
  /**
   * Formation cercle.
   */ 
  newCircleForm() {
    this.templateHandler.newCircleForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers);
  }
  
  /**
   * Formation ligne verticale.
   */
  newVerticalLineForm() {
    this.templateHandler.newVerticalLineForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers);
  }
  
  /**
   * Formation ligne horizontale.
   */
  newHorizontalLineForm() {
    this.templateHandler.newHorizontalLineForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers);
  }
  
  /**
   * Formation rectangle.
   */
  newRectangleForm() {
    this.templateHandler.newRectangleForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers);
  }
  
  /**
   * Formation carré.
   */
  newSquareForm() {
    this.templateHandler.newSquareForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers);
  }
  
  /**
   * Formation triangle.
   */
  newTriangleForm() {
    this.templateHandler.newTriangleForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers);
  }
  
  /**
   * Formation multi-ligne.
   */
  newHorizontalMultilineForm(nbLines) {
    this.templateHandler.newHorizontalMultilineForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers, nbLines);
  }
  
  newVerticalMultilineForm(nbLines) {
    this.templateHandler.newVerticalMultilineForm(this.canvasElement.width, this.canvasElement.height, this.percent, this.currentStepNumber,
      this.choregraphy.dancers, nbLines);
  }
  
  // ===== Animation =====
  
  playStep() {
    if (this.currentStepNumber < this.choregraphy.steps.length - 1) {
      let stepMoveDuration = this.stepHandler.getCurrentMoveDuration() * 1000;
          
      // On calcule la vitesse de chaque danseur pour arriver au prochain step
      for (let dancer of this.choregraphy.dancers) {
        dancer.setSpeedToStep(this.currentStepNumber + 1, stepMoveDuration);
      }
      this.timeHandler.initStep();
      this.raf = window.requestAnimationFrame(timestamp => {
        this.animateCurrentStep(timestamp, stepMoveDuration, false);
      });
    }
  }
  
  /**
   * Joue toute la chorégraphie.
   */
  play() {
    if (this.choregraphy.steps == null || this.choregraphy.steps.length == 0 || this.stateHandler.isStatePlaying()) {
      return;
    }
    
    this.stateHandler.setStatePlaying();
    this.timeHandler.initTimer();
    
    if (this.choregraphy.backstage != null) {
      this.currentStepNumber = -1;
      this.lbStepNumber = this.currentStepNumber;
    } else {
      this.currentStepNumber = 0;
      this.lbStepNumber = this.currentStepNumber;
    }
    
    this.playCurrentStep();
  }
  
  /**
   * Joue le step courant.
   */
  playCurrentStep() {
    if (this.currentStepNumber == -1) {
      // Backstage
      this.stepHandler.setStep(this.choregraphy.backstage);
      this.choregraphy.setBackstage();
    } else {
      if (this.currentStepNumber == 0 && this.musicInfo != null) {
        // Musique
        this.playMusic();
      }
      this.stepHandler.setStep(this.choregraphy.steps[this.currentStepNumber]);
      this.choregraphy.setStep(this.currentStepNumber);
    }  
    
    this.clearCanvas();
    this.drawDancersMotionless();
    
    // Après la phase immobile, on va vers la phase d'animation, sauf si on est à la dernière étape
    if (this.currentStepNumber < this.choregraphy.steps.length - 1) {
      this.timeout = setTimeout(() => {
        let stepMoveDuration = this.stepHandler.getCurrentMoveDuration() * 1000;
        
        // On calcule la vitesse de chaque danseur pour arriver au prochain step
        for (let dancer of this.choregraphy.dancers) {
          dancer.setSpeedToStep(this.currentStepNumber + 1, stepMoveDuration);
        }
        this.timeHandler.initStep();
        this.raf = window.requestAnimationFrame(timestamp => {
          this.animateCurrentStep(timestamp, stepMoveDuration, true);
        });         
      }, this.stepHandler.getCurrentMotionlessDuration() * 1000);
    } else {
      // Dernière étape : pas de phase d'animation
      this.stateHandler.setStateNormal();
      this.stopPlaying();
    }    
  }
  
  /**
   * Joue la partie animée du step courant.
   */
  animateCurrentStep(timestamp, stepDuration, callNextStep) {
    this.timeHandler.frame(timestamp);
    
    // Dessins
    this.clearCanvas();
    for (let dancer of this.choregraphy.dancers) {
      dancer.updatePos(this.timeHandler.elapsedTime);
    }
    this.drawDancersMoving();

    if (this.timeHandler.stepCurrentDuration + this.timeHandler.elapsedTime > stepDuration) {
      // On va dépasser le temps à la prochaine frame : on s'arrête là et on passe à l'étape suivante
      this.currentStepNumber++;
      this.lbStepNumber = this.currentStepNumber;
      if (callNextStep) {
        this.playCurrentStep();
      } else {
        this.setStep(this.currentStepNumber);
      }      
    } else {
      this.raf = window.requestAnimationFrame(timestamp => {
        this.animateCurrentStep(timestamp, stepDuration, callNextStep);
      });
    }
  }
  
  stopPlaying() {
    if (this.stateHandler.isStatePlaying()) {
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
      window.cancelAnimationFrame(this.raf);
      this.stateHandler.setStateNormal();
    }
    this.timeHandler.stopTimer();
    
    if (this.musicInfo != null) {
      this.musicElement.pause();
    }
    
    this.setStep(this.choregraphy.steps.length);
  }
  
  // ===== Musique =====
  
  reinitMusic() {
    this.musicInfo = null;
    this.choregraphy.musicId = null;
    this.musicElement.src = null;
  }
  
  onFileChange(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.musicInfo = { name: file.name, data: reader.result };
        this.musicElement.src = this.musicInfo.data;
        
        this.stateHandler.musicLoaded();
      };
    }
  }
  
  loadMusic(key) {
    this.storage.getMusic(key).then(data => {
      this.musicInfo = data;
      this.choregraphy.musicId = key;
      this.musicElement.src = data.data;
    })
  }
  
  playMusic() {
    this.musicElement.currentTime = 0;
    this.musicElement.play();
  }
  
  stopMusic() {
    this.musicElement.pause();
  }
  
  getMusicName() {
    if (this.musicInfo == null) {
      return '';
    }
    if (this.musicInfo.name.length > 20) {
      return this.musicInfo.name.substring(0, 17) + '...';
    }
    return this.musicInfo.name;
  }
  
  // ===== Clavier =====
  
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.stateHandler.isActionRenameDancer() && this.selectedDancer != -1) {
      this.choregraphy.dancers[this.selectedDancer].name = event.key.toUpperCase();
      this.stateHandler.dancerRenamed();
      this.selectedDancer = -1;
      this.drawAll();
    }
  }
}