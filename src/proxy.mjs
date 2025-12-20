/* ************************************************************************
 *  <copyright file="proxy.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import { runtime } from './runtime.mjs';
import Console from './Console.mjs';
import { context, meta, originalWeakMapSet, DispatchMode } from './constants.mjs';
import { forEach, isFunction, isObject, ownKeys } from './utils.mjs';
import { Topology } from './Topology.mjs';

const { hasOwnProperty } = Object.prototype;
const resolvedDataMap = new WeakMap;
const validConstructorSet = new Set([void(0), Array, Object]);
const invalidSymbols = new Set([...Reflect.ownKeys(Symbol).map(key => Symbol[key]).filter(item => Object.is(typeof item, 'symbol')), context, meta]);
const proxyHandler = {
    get: (target, property) => {
        const value = target[property];
        if (runtime.currentController && !invalidSymbols.has(property) && (Object.is(value) || hasOwnProperty.call(target, property))) {
            const { topologySet } = runtime.currentController;
            forEach([...target[meta]].filter(topology => !topology.parent || topologySet.has(topology)), topology => topology.fetch(property, value).subscribe());
        }
        return value;
    },
    set: (target, property, newValue) => {
        Console.assert('It\'s illegal to overwrite "$route" of the rootScope', runtime.isRouterWritable || !Object.is(target, runtime.plainRootScope) || !Object.is(property, '$route'));
        target[property] = newValue;
        if (!invalidSymbols.has(property) && hasOwnProperty.call(target, property)) {
            const topologySet = target[meta];
            runtime.currentController && topologySet.forEach(topology => topology.unsubscribe(runtime.currentController));
            newValue = proxyCreator(target, property);
            topologySet.forEach(topology => topology.fetch(property).update(newValue, DispatchMode.self));
        }
        return true;
    },
    deleteProperty: (target, property) => {
        const exist = Reflect.has(target, property);
        if (Reflect.deleteProperty(target, property)) {
            exist && isString(property) && target[meta].forEach(topology => topology.fetch(property).update(void(0), DispatchMode.self));
            return true;
        }
        return false;
    }
};

export const proxyCreator = (target, property) => {
    const isRootScope = property == null;
    let data = isRootScope ? target : target[property];
    if (isObject(data) || (data && !data.constructor)) {
        let resolvedData = resolvedDataMap.get(data);
        if (resolvedData) {
            data = resolvedData;
        } else {
            data[meta] = new Set;
            if (isFunction(data)) {
                const resolvedData = functionConverter(data);
                originalWeakMapSet.call(resolvedDataMap, data, resolvedData);
                data = resolvedData;
            } else if (validConstructorSet.has(data.constructor)) {
                const resolvedData = new Proxy(data, proxyHandler);
                originalWeakMapSet.call(resolvedDataMap, data, resolvedData);
                forEach(ownKeys(data), key => proxyCreator(data, key));
                data = resolvedData;
            }
            originalWeakMapSet.call(resolvedDataMap, data, data);
        }
    }
    isRootScope ? data[meta].add(new Topology(null, '', data)) : (target[property] = data);
    return data;
};
