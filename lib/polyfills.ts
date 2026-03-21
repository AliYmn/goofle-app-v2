const globalScope = globalThis as typeof globalThis & {
  WeakRef?: new <T extends object>(value: T) => { deref(): T | undefined };
  FinalizationRegistry?: new <T>(cleanup: (heldValue: T) => void) => {
    register(target: object, heldValue: T, unregisterToken?: object): void;
    unregister(unregisterToken: object): boolean;
  };
};

if (typeof globalScope.WeakRef === 'undefined') {
  class WeakRefPolyfill<T extends object> {
    private value?: T;

    constructor(value: T) {
      this.value = value;
    }

    deref() {
      return this.value;
    }
  }

  globalScope.WeakRef = WeakRefPolyfill as typeof globalScope.WeakRef;
}

if (typeof globalScope.FinalizationRegistry === 'undefined') {
  class FinalizationRegistryPolyfill<T> {
    constructor(_cleanup: (heldValue: T) => void) {}

    register(_target: object, _heldValue: T, _unregisterToken?: object) {}

    unregister(_unregisterToken: object) {
      return false;
    }
  }

  globalScope.FinalizationRegistry =
    FinalizationRegistryPolyfill as typeof globalScope.FinalizationRegistry;
}
