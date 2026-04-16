import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageHelperService {
  constructor() {}
  convertImageToBase64(file: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result!.toString().split(';base64,')[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  convertImageToByteArray(file: any): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = (error) => reject(error);
    });
  }

  downloadUrlImageToBlob(url: string): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      try {
        fetch(url).then((res) => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          res.blob().then((blob) => {
            resolve(blob);
          });
        });
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    });
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result!.toString().split(';base64,')[1]);
      reader.onerror = () => {
        reject(new Error('Error reading blob'));
      };
    });
  }

  getUrlToBlobToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.downloadUrlImageToBlob(url).then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result!.toString().split(';base64,')[1]);
        reader.onerror = () => {
          reject(new Error('Error reading blob'));
        };
      });
    });
  }

  displayBase64Image(pic: String) {
    return 'data:image/png;base64,' + pic;
  }
}
