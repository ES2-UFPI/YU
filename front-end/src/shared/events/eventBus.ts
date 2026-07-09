export type Listener<T> = (event: T) => void;

/**
 * Implementação simples do padrão Observer.
 *
 * Subject/Publisher: event bus
 * Observers/Subscribers: listeners registrados via subscribe()
 * Notificação: publish(event)
 */
export function createEventBus<T>() {
  const listeners = new Set<Listener<T>>();
  let lastEvent: T | null = null;

  function subscribe(listener: Listener<T>) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function publish(event: T) {
    lastEvent = event;

    Array.from(listeners).forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Erro ao notificar observer do event bus:", error);
      }
    });
  }

  function getLastEvent() {
    return lastEvent;
  }

  function clearLastEvent() {
    lastEvent = null;
  }

  return {
    subscribe,
    publish,
    getLastEvent,
    clearLastEvent,
  };
}
