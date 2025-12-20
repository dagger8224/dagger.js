/* ************************************************************************
 *  <copyright file="eventDelegator.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import { emptyObjectCreator, isFunction } from './utils.mjs';
import { originalSetAdd } from './constants.mjs';

const bubbleSet = new Set;

const captureSet = new Set;

const handler = (event, capture, targets, index = 0) => {
    const currentTarget = targets[index++];
    if (!currentTarget) {
        return;
    }
    const eventListenerSet = currentTarget.$eventListenerMap?.[event.type];
    const eventListeners = eventListenerSet ? [...eventListenerSet].filter(listener => Object.is(!!listener.decorators.capture, !!capture)) : [];
    if (!eventListeners.length) {
        return handler(event, capture, targets, index);
    }
    Object.defineProperty(event, 'currentTarget', { configurable: true, value: currentTarget });
    for (const { decorators, handler } of eventListeners) {
        handler(event);
        if (decorators.stopImmediate) {
            return event.stopImmediatePropagation();
        }
    }
    event.cancelBubble || handler(event, capture, targets, index);
};

export const eventDelegator = (eventName, target, listener, capture) => {
    if (!target.$eventListenerMap) {
        target.$eventListenerMap = emptyObjectCreator();
    }
    const listenerSet = target.$eventListenerMap[eventName] || new Set;
    if (isFunction(listener)) {
        listener = {
            decorators: { capture },
            handler: listener
        };
    }
    originalSetAdd.call(listenerSet, listener);
    target.$eventListenerMap[eventName] = listenerSet;
    if ((capture && captureSet.has(eventName)) || (!capture && bubbleSet.has(eventName))) {
        return;
    }
    if (capture) {
        captureSet.add(eventName);
    } else {
        bubbleSet.add(eventName);
    }
    window.addEventListener(eventName, event => handler(event, capture, capture ? event.composedPath().reverse() : event.composedPath(), 0), capture);
};
