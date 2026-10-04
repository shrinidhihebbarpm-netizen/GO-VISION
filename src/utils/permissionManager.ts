/**
 * Browser Camera & Microphone Permission Manager
 */

export type PermissionStateStatus = 'granted' | 'prompt' | 'denied' | 'unsupported';

export interface DevicePermissionsState {
  camera: PermissionStateStatus;
  microphone: PermissionStateStatus;
  isChecking: boolean;
}

class PermissionManager {
  private cameraStatus: PermissionStateStatus = 'prompt';
  private micStatus: PermissionStateStatus = 'prompt';
  private listeners: Array<(state: DevicePermissionsState) => void> = [];

  constructor() {
    this.initStatusCheck();
  }

  public subscribe(callback: (state: DevicePermissionsState) => void) {
    this.listeners.push(callback);
    callback(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  public getState(): DevicePermissionsState {
    return {
      camera: this.cameraStatus,
      microphone: this.micStatus,
      isChecking: false
    };
  }

  private async initStatusCheck() {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      return;
    }

    try {
      // Check Camera Permission API
      const camPermission = await navigator.permissions.query({ name: 'camera' as any }).catch(() => null);
      if (camPermission) {
        this.cameraStatus = camPermission.state as PermissionStateStatus;
        camPermission.onchange = () => {
          this.cameraStatus = camPermission.state as PermissionStateStatus;
          this.notify();
        };
      }
    } catch {
      // Ignore unsupported permissions API
    }

    try {
      // Check Microphone Permission API
      const micPermission = await navigator.permissions.query({ name: 'microphone' as any }).catch(() => null);
      if (micPermission) {
        this.micStatus = micPermission.state as PermissionStateStatus;
        micPermission.onchange = () => {
          this.micStatus = micPermission.state as PermissionStateStatus;
          this.notify();
        };
      }
    } catch {
      // Ignore unsupported permissions API
    }

    this.notify();
  }

  /**
   * Prompts user for camera permission via getUserMedia
   */
  public async requestCameraAccess(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.cameraStatus = 'unsupported';
      this.notify();
      return { granted: false, error: 'Camera API not supported in this browser environment.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });

      // Stream successfully acquired, stop tracks immediately after verification
      stream.getTracks().forEach(track => track.stop());
      this.cameraStatus = 'granted';
      this.notify();
      return { granted: true };
    } catch (err: any) {
      console.warn('Camera request error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.cameraStatus = 'denied';
      } else {
        this.cameraStatus = 'prompt';
      }
      this.notify();
      return { 
        granted: false, 
        error: err.name === 'NotAllowedError' ? 'Camera permission was denied in your browser.' : (err.message || 'Could not access camera.') 
      };
    }
  }

  /**
   * Prompts user for microphone permission via getUserMedia
   */
  public async requestMicrophoneAccess(): Promise<{ granted: boolean; error?: string }> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.micStatus = 'unsupported';
      this.notify();
      return { granted: false, error: 'Audio input API not supported in this browser environment.' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // Stream successfully acquired, stop tracks immediately after verification
      stream.getTracks().forEach(track => track.stop());
      this.micStatus = 'granted';
      this.notify();
      return { granted: true };
    } catch (err: any) {
      console.warn('Microphone request error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.micStatus = 'denied';
      } else {
        this.micStatus = 'prompt';
      }
      this.notify();
      return { 
        granted: false, 
        error: err.name === 'NotAllowedError' ? 'Microphone permission was denied in your browser.' : (err.message || 'Could not access microphone.') 
      };
    }
  }

  /**
   * Prompts for both Camera and Microphone permissions
   */
  public async requestBothPermissions(): Promise<{ cameraGranted: boolean; micGranted: boolean; errors: string[] }> {
    const camRes = await this.requestCameraAccess();
    const micRes = await this.requestMicrophoneAccess();
    const errors: string[] = [];
    if (camRes.error) errors.push(camRes.error);
    if (micRes.error) errors.push(micRes.error);

    return {
      cameraGranted: camRes.granted,
      micGranted: micRes.granted,
      errors
    };
  }
  /**
   * Toggles camera access on/off directly
   */
  public async toggleCamera(): Promise<boolean> {
    if (this.cameraStatus === 'granted') {
      this.cameraStatus = 'prompt';
      this.notify();
      return false;
    }
    const res = await this.requestCameraAccess();
    return res.granted;
  }

  /**
   * Toggles microphone access on/off directly
   */
  public async toggleMicrophone(): Promise<boolean> {
    if (this.micStatus === 'granted') {
      this.micStatus = 'prompt';
      this.notify();
      return false;
    }
    const res = await this.requestMicrophoneAccess();
    return res.granted;
  }
}

export const permissionManager = new PermissionManager();
