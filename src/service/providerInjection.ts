// Определение ключа с типом
import { inject, InjectionKey, provide, Ref, ref } from 'vue';

export const globalValidateKey: InjectionKey<Ref<() => void>> = Symbol('globalValidate');

// Определение провайдера
export function setupGlobalValidator() {
  const globalValidate = ref(() => {
  });
  provide(globalValidateKey, globalValidate);
}

// Добавление иньекции в компонент
export function setupComponentValidator(callback: () => void) {
  const inj = inject(globalValidateKey);
  if (inj) {
    inj.value = callback;
  }
}


const processIdKey: InjectionKey<Ref<string>> = Symbol('processId');

export const processIdPI = {
  provider: () => {
    const val = ref('');
    provide(processIdKey, val);
    return val;
  },
  injection: () => {
    return inject(processIdKey);
  },
};



