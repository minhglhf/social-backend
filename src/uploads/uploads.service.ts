import { Bucket } from '@google-cloud/storage';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigService } from 'src/config/config.service';
import { v4 as uuidv4 } from 'uuid';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import {
  FirebaseStorage,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import * as fs from 'fs';
@Injectable()
export class UploadsService {
  private storage: FirebaseStorage;
  constructor(configService: ConfigService) {
    // const adminConfig: ServiceAccount = {
    //   : configService.get('FIREBASE_PROJECT_ID'),
    //   privateKey: configService
    //     .get('FIREBASE_PRIVATE_KEY')
    //     .replace(/\\n/g, '\n'),
    //   clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
    // };
    // admin.initializeApp({
    //   credential: admin.credential.cert(adminConfig),
    //   storageBucket: configService.get('STORAGE_BUCKET_URL'),
    // });
    const firebaseConfig: FirebaseOptions = {
      projectId: configService.get('FIREBASE_PROJECT_ID'),
      authDomain: configService.get('AUTH_DOMAIN'),
      storageBucket: configService.get('STORAGE_BUCKET_URL'),
    };
    const firebaseApp = initializeApp(firebaseConfig);
    this.storage = getStorage(firebaseApp);

    //this.bucket = admin.storage().bucket();
  }
  public async uploadImageFile(
    file: Express.Multer.File,
    path: string,
  ): Promise<string> {
    try {
      const image = fs.readFileSync(file.path.toString());
      fs.unlinkSync(file.path.toString());
      if (image) {
        const metadata = {
          contentType: file.mimetype,
          firebaseStorageDownloadTokens: uuidv4(),
          size: file.size,
        };
        const storageRef = ref(this.storage, path);
        await uploadBytes(storageRef, image, metadata);
        return await getDownloadURL(storageRef);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFileUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
