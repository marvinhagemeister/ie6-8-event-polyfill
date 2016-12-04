if (!window.addEventListener) {
  const registry: [(type: string, listener: EventListener) => void, EventListener][] = [];

  function shimAddEventListener(type: string, listener: EventListener): void {
    const target = this;

    function eventShim(event: any): void {
      event.currentTarget = target;
      event.preventDefault = () => event.returnValue = false;
      event.stopPropagation = () => event.cancelBubble = true;
      event.target = event.srcElement || target;

      listener.call(target, event);
    }

    registry.push([eventShim, listener]);
    this.attachEvent("on" + type, eventShim);
  }

  function shimRemoveEventListener(type: string, listener: EventListener): void {
    for (let i = 0; i < registry.length; ++i) {
      const item = registry[i];

      if (item[0] === this && item[1] === listener) {
        return this.detachEvent("on" + type, registry.splice(i, 1)[0][1]);
      }
    }
  };

  function shimDispatchEvent(event: Event): boolean {
    return this.fireEvent("on" + event.type, event);
  };

  const shim = [Window, Document, Element];
  for (let i = 0; i < shim.length; i++) {
    shim[i].prototype.addEventListener = shimAddEventListener;
    shim[i].prototype.removeEventListener = shimRemoveEventListener;
    shim[i].prototype.dispatchEvent = shimDispatchEvent;
  }
}
