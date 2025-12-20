/* ************************************************************************
 *  <copyright file="constants.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

/* Strings */
export const daggerChangeEventName = 'dg-change';

/* Unique Symbols */
export const context = Symbol('context');

export const meta = Symbol('meta');

/* static Promises */
export const promisor = Promise.resolve();

/* Original methods */
export const originalStringifyMethod = JSON.stringify;

export const originalSetAdd = Set.prototype.add;

export const originalSetClear = Set.prototype.clear;

export const originalSetDelete = Set.prototype.delete;

export const originalMapClear = Map.prototype.clear;

export const originalMapSet = Map.prototype.set;

export const originalWeakMapSet = WeakMap.prototype.set;

export const originalPushState = history.pushState;

export const originalReplaceState = history.replaceState;

/* Regular expressions */
export const moduleNameRegExp = /^[_a-z]{1}[\w]*$/;

export const remoteUrlRegExp = /^(http:\/\/|https:\/\/|\/|\.\/|\.\.\/)/i;

/* Enums */
export const ModuleType = {
    json: 'json',
    namespace: 'namespace',
    script: 'script',
    string:'string',
    style:'style',
    view: 'view'
};

export const DispatchMode = {
    bubble: 'bubble',
    self: 'self',
    mutation: 'mutation'
};

/* predefined Hash Object */
export const observerEventHandlerNameSet = new Set(['observe-intersection', 'observe-mutation', 'observe-resize']);
