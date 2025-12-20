/* ************************************************************************
 *  <copyright file="runtime.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { meta, daggerChangeEventName, remoteUrlRegExp, originalStringifyMethod, ModuleType, promisor } from './constants.mjs';
import { arrayNormalizer, emptyObjectCreator, forEach, functionConverter, isFunction, isObject, isString, styleElementCreator, moduleConfigNormalizer, querySelector } from './utils.mjs';
import { eventDelegator } from './eventDelegator.mjs';
import { configResolver } from './configs.mjs';
import { proxyCreator } from './proxy.mjs';
import { ModuleProfile } from './ModuleProfile.mjs';
import { NodeContext } from './NodeContext.mjs';
import { NodeProfile } from './NodeProfile.mjs';
import { Router } from './Router.mjs';
import { routingChangeResolver } from './routerResolver.mjs';

const register = (target, names) => {
    Console.assert(['The 1st argument of "$dagger.register" should be valid "object" instead of "%o"', target], isObject(target));
    Console.assert(['The 2nd argument of "$dagger.register" should be "string array" instead of "%o"', names], Array.isArray(names) && names.every(name => isString(name)));
    forEach(names, name => {
        const { prototype } = target;
        const method = prototype?.[name];
        Console.assert([`"${ name }" is not a valid method name of prototype object "%o"`, prototype], method && isFunction(method));
        const resolvedMethod = function (...parameters) {
            const result = method.apply(this, parameters);
            this[meta] && this[meta].forEach(topology => topology.dispatch());
            return result;
        };
        Reflect.defineProperty(resolvedMethod, 'name', {
            configurable: true,
            value: name
        });
        Reflect.defineProperty(prototype, name, { get: () => resolvedMethod });
    });
};

/* export the global $dagger object */
window.$dagger = Object.freeze(Object.assign(emptyObjectCreator(), {
    register,
    version: '1.0.0-RC-debug',
    validator: (data, path, { type, assert, required } = {}) => {
        if ((data == null) || Number.isNaN(data)) {
            Console.assert([`The data "${ path }" should be assigned a valid value instead of "%o" before using`, data], !required);
        }
        if (type) {
            if (Array.isArray(type)) {
                Console.assert([`The type of data "${ path }" should be one of "%o" instead of "%o"`, type, data.constructor?.name], type.some(type => Object.is(typeof data, type)));
            } else {
                Console.assert([`The type of data "${ path }" should be "%o" instead of "%o"`, type, data.constructor?.name], Object.is(typeof data, type));
            }
        }
        if (!assert) {
            return;
        }
        if (isFunction(assert)) {
            Console.assert(`The assert of "${ path }" is falsy`, assert(data));
        } else if (Array.isArray(assert)) {
            forEach(assert, func => {
                Console.assert(`The type of assert should be "function" instead of "${ typeof func }"`, isFunction(func));
                Console.assert(`The assert of "${ path }" is falsy`, func(data));
            });
        } else {
            Console.assert(`The type of assert should be "function" or "function array" instead of "${ typeof assert }"`);
        }
    }
}));

document.addEventListener('DOMContentLoaded', async () => {
    let base = '';
    const [options, modules, routers] = await Promise.all(['options', 'modules', 'routers'].map(type => configResolver(document, document.baseURI, type)));
    runtime.daggerOptions = options.content;
    Console.initialize(options.content);
    Console.log(`
***********************************************************************

꧁ Powered by "🗡️ dagger V${ $dagger.version } (https://daggerjs.org)". ꧂

***********************************************************************
    `);
    // create global style element
    styleElementCreator('[dg-cloak] { display: none !important; }', 'dg-global-style', false);
    Console.log('Creating global event delegator...');
    eventDelegator('click', window, event => {
        let { target } = event;
        while (target && !['A', 'AREA'].includes(target.tagName)) {
            target = target.parentNode;
        }
        if (!target || !target.hasAttribute('href')) {
            return;
        }
        const href = target.getAttribute('href').trim();
        if (href.startsWith('#') && anchorResolver(href.substring(1), event)) {
            return;
        }
        if (href && !remoteUrlRegExp.test(href)) {
            event.preventDefault();
            history.pushState(null, '', href);
        }
    }, true);
    const eventPayload = { detail: true };
    eventDelegator('input', window, event => {
        const { target } = event;
        if (Object.is(target.tagName, 'SELECT')) {
            promisor.then(() => forEach(target.children, option => option.dispatchEvent(new CustomEvent(daggerChangeEventName, eventPayload))));
        }
    }, true);
    eventDelegator('reset', window, event => {
        if (Object.is(event.target.tagName, 'FORM')) {
            forEach(querySelector(document.body, 'input, textarea', true, true), child => {
                child.dispatchEvent(new CustomEvent('input', eventPayload));
                child.dispatchEvent(new CustomEvent('change', eventPayload));
            });
        }
    });
    // register responsive methods for object instances
    register(Date, ['setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear']);
    register(Map, ['set', 'delete', 'clear']);
    register(Set, ['add', 'delete', 'clear']);
    register(WeakMap, ['set', 'delete']);
    register(WeakSet, ['add', 'delete']);

    JSON.stringify = functionConverter(originalStringifyMethod);
    forEach(['concat', 'copyWithin', 'fill', 'find', 'findIndex', 'lastIndexOf', 'pop', 'push', 'reverse', 'shift', 'unshift', 'slice', 'sort', 'splice', 'includes', 'indexOf', 'join', 'keys', 'entries', 'values', 'forEach', 'filter', 'flat', 'flatMap', 'map', 'every', 'some', 'reduce', 'reduceRight', 'toLocaleString', 'toString', 'at'], key => (Array.prototype[key] = functionConverter(Array.prototype[key])));
    Console.assert(`The integrity feature is available with "https" protocol or "localhost" host only, while the current origin is "${ location.origin }"`, !runtime.daggerOptions.integrity || crypto.subtle);
    base = modules.base;
    runtime.routerConfigs = routers.content;
    const prefix = runtime.routerConfigs.prefix.trim(), isHistoryMode = Object.is(runtime.routerConfigs.mode, 'history');
    if (prefix) {
        if (isHistoryMode) {
            Console.assert(`In "history" route mode, it's illegal to use "${ prefix }" as route prefix because it contains non-word character`, /^\w*$/.test(prefix));
            runtime.routerConfigs.prefix = `/${ prefix }/`;
        } else {
            Console.assert(`In "hash" route mode, it's illegal to use "${ prefix }" as route prefix because it starts with "@"`, !prefix.startsWith('@'));
            runtime.routerConfigs.prefix = `#${ prefix }/`;
        }
    } else {
        runtime.routerConfigs.prefix = isHistoryMode ? '/' : '#';
    }
    runtime.plainRootScope = { $route: null };
    runtime.rootScope = Object.seal(proxyCreator(runtime.plainRootScope));
    moduleConfigNormalizer(modules.content);
    const html = document.documentElement, routing = runtime.routerConfigs.routing || { modules: Object.keys(modules.content) };
    Console.group('resolving top level modules');
    runtime.rootScopeCallback = scope => {
        runtime.rootScope = scope;
        Console.group('resolving routers');
        runtime.rootRouter = new Router(routing);
        Console.groupEnd('resolving routers');
        const { rootSelectors } = runtime.daggerOptions;
        Console.assert(['The "rootSelectors" should be "string array" instead of "%o"', rootSelectors], Array.isArray(rootSelectors) && rootSelectors.every(isString));
        forEach(rootSelectors, rootSelector => Console.warn(`There is no element matching the rootSelector "${ rootSelector }"`, document.querySelector(rootSelector)));
        const rootNodeSet = new Set(rootSelectors.map(rootSelector => [...querySelector(document, rootSelector, true, true)]).flat());
        Console.warn(['❎ It\'s illegal to set "%o" as root node', html], !rootNodeSet.has(html));
        rootNodeSet.delete(html);
        const rootNodes = [...rootNodeSet];
        forEach(rootNodes, rootNode => Reflect.construct(NodeProfile, [rootNode, runtime.rootNamespace, runtime.rootNodeProfiles, null, true]));
        Console.warn(['❎ No node with valid directive was detected under root elements "%o"', rootNodes], runtime.rootNodeProfiles.length);
        eventDelegator('popstate', window, routingChangeResolver);
        history.replaceState(null, '', isHistoryMode ? `${ location.pathname }${ location.search }${ location.hash }` : location.hash);
    };
    runtime.rootNamespace = new ModuleProfile({ content: modules.content, type: ModuleType.namespace }, base);
    runtime.rootNamespace.resolve(new Set(arrayNormalizer(routing.modules || []))).then(() => runtime.styleModuleSet.forEach(style => (style.disabled = false)) || Console.groupEnd('resolving top level modules') || new NodeContext(new NodeProfile(html)));
});

const styleModuleSet = new Set;

export const runtime = {
    isRouterWritable: false,
    plainRootScope: null,
    rootScope: null,
    rootNamespace: null,
    processorCaches: emptyObjectCreator(),
    rootNodeProfiles: [],
    routerConfigs: null,
    rootRouter: null,
    rootScopeCallback: null,
    routerTopology: null,
    currentController: null,
    directiveQueue: [],
    sentrySet: new Set,
    styleModuleSet,
    styleModuleCache: {
        '': styleModuleSet
    },
    daggerOptions: {
        integrity: true
    }
};
