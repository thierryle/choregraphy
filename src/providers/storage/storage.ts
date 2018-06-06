import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  musicStorage: Storage;

  constructor(public http: HttpClient, public storage: Storage) {
    this.musicStorage = new Storage({ name: 'dance', storeName: 'music', driverOrder: ['indexeddb', 'sqlite', 'websql'] });
  }

  addChoregraphy(choregraphy) {
    return new Promise((resolve, reject) => {
      this.getNextKey(this.storage).then(key => {
        this.storage.set(key, choregraphy).then(() => {
          resolve(key);
        });
      });
    });
  }
  
  updateChoregraphy(key, choregraphy) {
    return new Promise((resolve, reject) => {
      this.checkMusicChange(key, choregraphy).then(() => {
        this.storage.set(key, choregraphy).then(() => {
          resolve();
        });
      });
    });
  }
  
  checkMusicChange(key, choregraphy) {
    return new Promise((resolve, reject) => {
      this.storage.get(key).then(oldChoregraphy => {
        if (oldChoregraphy.musicId != null && oldChoregraphy.musicId != choregraphy.musicId) {
          this.deleteMusic(oldChoregraphy.musicId).then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
  
  getChoregraphy(key) {
    return this.storage.get(key);
  }
  
  deleteChoregraphy(key) {
    return this.storage.remove(key);
  }
  
  getNextKey(storage) {
    return new Promise<string>((resolve, reject) => {
      storage.keys().then(keys => {
        let max = 0;
        for (let key of keys) {
          let current = parseInt(key);
          if (current > max) {
            max = current;
          }
        }
        resolve((max + 1).toString());
      });
    });
  }
  
  /**
   * Retourne les clés et noms des chorégraphies.
   */
  getChoregraphies() {
    return new Promise<any[]>((resolve, reject) => {
      let choregraphies = [];
      this.storage.forEach((value, key, index) => {
        choregraphies.push({ key: key, name: value.name });
      }).then(() => {
        resolve(choregraphies);
      });
    });
  }
  
  // ===== Musique =====
  
  addMusic(music) {
    return new Promise<string>((resolve, reject) => {
      this.getNextKey(this.musicStorage).then(key => {
        this.musicStorage.set(key, music).then(() => {
          resolve(key);
        });
      });
    });
  }
  
  getMusic(key) {
    return this.musicStorage.get(key);
  }
  
  getMusics() {
    return new Promise<any[]>((resolve, reject) => {
      let musics = [];
      this.musicStorage.forEach((value, key, index) => {
        musics.push({ key: key, name: value.name });
      }).then(() => {
        resolve(musics);
      });
    });
  }
  
  deleteMusic(key) {
    return this.musicStorage.remove(key);
  }
}
