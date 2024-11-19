import EventEmitter from 'eventemitter3';

declare global {
  var EventEmitter: EventEmitter | undefined;
}

// This empty export is necessary to make this a module
export {}; 