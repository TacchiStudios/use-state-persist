/// <reference lib="dom"/>
import { StorageProvider, StorageEvents } from './types';
import { Event } from './event';

class SyncStorage implements StorageProvider {
  static instance: SyncStorage;

  private constructor(private events: StorageEvents = {}) {}

  static getInstance() {
    if (SyncStorage.instance) return SyncStorage.instance;
    return (SyncStorage.instance = new SyncStorage());
  }

  // API Compatibility with native
  static loaded = true;
  async init() {}

  subscribe(key: string, callback: (data: any) => void) {
    return this.getEvent(key).on(callback);
  }

  getItem<T>(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return;
    return JSON.parse(value) as T;
  }

  setItem<T>(key: string, value: T) {
    if (!key) throw Error('No key provided');
    localStorage.setItem(key, JSON.stringify(value));
    this.getEvent(key).trigger(value);
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
    this.getEvent(key).trigger(undefined);
  }

  get length() {
    return localStorage.length;
  }

  getEvent(key: string) {
    if (this.events[key]) {
      return this.events[key];
    }
    return (this.events[key] = new Event());
  }

  clear() {
    localStorage.clear();
  }

  getAllKeys() {
    return Object.keys(localStorage);
  }
}

export const syncStorage = SyncStorage.getInstance();
