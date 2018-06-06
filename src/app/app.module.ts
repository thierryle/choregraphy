import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { CanvasDrawComponent } from '../components/canvas-draw/canvas-draw';
import { UtilProvider } from '../providers/util/util';
import { StorageProvider } from '../providers/storage/storage';
import { DancerProvider } from '../providers/dancer/dancer';
import { PolygonProvider } from '../providers/polygon/polygon';
import { CircleProvider } from '../providers/circle/circle';
import { LineProvider } from '../providers/line/line';
import { StepProvider } from '../providers/step/step';
import { ChoregraphyProvider } from '../providers/choregraphy/choregraphy';
import { TimeHandlerProvider } from '../providers/time-handler/time-handler';
import { TemplateHandlerProvider } from '../providers/template-handler/template-handler';
import { BackgroundHandlerProvider } from '../providers/background-handler/background-handler';
import { ImageHandlerProvider } from '../providers/image-handler/image-handler';
import { SpriteProvider } from '../providers/sprite/sprite';
import { StateHandlerProvider } from '../providers/state-handler/state-handler';
import { StepHandlerProvider } from '../providers/step-handler/step-handler';
import { MultilineProvider } from '../providers/multiline/multiline';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CanvasDrawComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({ name: 'dance', storeName: 'choregraphy', driverOrder: ['indexeddb', 'sqlite', 'websql'] })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    HttpClientModule,
    UtilProvider,
    StorageProvider,
    DancerProvider,
    PolygonProvider,
    CircleProvider,
    LineProvider,
    StepProvider,
    ChoregraphyProvider,
    TimeHandlerProvider,
    TemplateHandlerProvider,
    BackgroundHandlerProvider,
    ImageHandlerProvider,
    SpriteProvider,
    StateHandlerProvider,
    StepHandlerProvider,
    MultilineProvider
  ]
})
export class AppModule {}
