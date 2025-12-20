/* ************************************************************************
 *  <copyright file="utils.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { meta, originalStringifyMethod } from './constants.mjs';
import { runtime } from './runtime.mjs';

export const attributeNameConverter = name => name.replace(/-[a-z]/g, string => string[1].toUpperCase());

export const forEach = (iterators, processor) => {
    if (!iterators) { return; }
    const length = iterators.length || 0;
    for (let index = 0; index < length; ++index) {
        processor(iterators[index], index);
    }
};

export const isFunction = target => (target instanceof Function);

export const isObject = target => (target instanceof Object);

export const isPromise = target => (target instanceof Promise);

export const isString = target => (typeof target ==='string');

export const isShoelaceElement = tagName => tagName.startsWith('SL-');

export const arrayNormalizer = target => Array.isArray(target) ? target : [target];

export const emptyObjectCreator = () => Object.create(null);

export const hashTableCreator = (...array) => {
    const hashTable = emptyObjectCreator();
    return forEach(array, key => (hashTable[key] = true)) || hashTable;
};

export const ownKeys = target => Reflect.ownKeys(target).filter(key => !Object.is(key, meta));

export const processorResolver = () => {
    const { directiveQueue, processorCaches } = runtime;
    if (!directiveQueue.length) { return; }
    forEach(functionCreator(`[${ directiveQueue.map(directive => directive.processor).join(', ') }]`), (processor, index) => {
        const directive = directiveQueue[index];
        processorCaches[directive.processor] = processor;
        directive.processor = processor;
    });
    directiveQueue.length = 0;
};

export const textConverter = (data, trim = true) => {
    if (!isString(data)) {
        if ((data == null) || Number.isNaN(data)) { return ''; }
        if (isObject(data)) { return originalStringifyMethod(data); }
        data = String(data);
    }
    return trim ? data.trim() : data;
};

export const moduleConfigNormalizer = configs => {
    forEach(Object.keys(configs), key => {
        let config = configs[key];
        const isArray = Array.isArray(config);
        const rawConfig = config;
        if (isString(config) || (isArray && config.every(isString))) {
            config = { uri: config };
        } else if (isArray) {
            config = { candidates: config };
        }
        if (config.candidates) {
            config.candidates = arrayNormalizer(config.candidates);
            const matchedCandidate = config.candidates.find(item => {
                if (!isObject(item)) {
                    return false;
                } else if (Reflect.has(item, 'media')) {
                    return matchMedia(item.media).matches;
                }
                return true;
            });
            Console.assert(['There is no matched config candidate within "%o" for the current runtime environment', rawConfig], matchedCandidate);
            Object.assign(config, matchedCandidate);
        }
        if (config.uri) {
            config.uri = arrayNormalizer(config.uri);
        }
        configs[key] = config;
    });
    return configs;
};

// TODO: optimize
export const serializer = async ([resolver, ...nextResolvers], token = { stop: false }) => {
    if (token.stop) { return; }
    if (isPromise(resolver)) {
        return resolver.then(resolver => serializer([resolver, ...nextResolvers], token));
    } else if (isFunction(resolver)) {
        return serializer([resolver(null, token), ...nextResolvers], token);
    } else if (nextResolvers.length) {
        return serializer([nextResolvers.shift()(resolver, token), ...nextResolvers], token);
    }
    return resolver;
};

// used to convert a string to a function
export const functionCreator = expression => {
    const { processorCaches } = runtime;
    if (!Reflect.has(processorCaches, expression)) {
        try {
            try {
                processorCaches[expression] = new Function(`return (${ expression });`)();
            } catch (error) {
                processorCaches[expression] = new Function(`return (() => {${ expression }})();`)();
            }
        } catch (error) {
            Console.assert(`The content "${ expression }" is not legal javaScript code, parsing with error "${ error.message }"`);
        }
    }
    return processorCaches[expression];
};

export const functionConverter = originalMethod => {
    const handler = function (...parameters) {
        const controller = runtime.currentController;
        runtime.currentController = null;
        let result = null;
        try {
            result = originalMethod.apply(this, parameters);
        } catch (error) { // constructable
            try {
                result = Reflect.construct(originalMethod, parameters);
            } catch (error) {
                Console.assert(['Failed to execute the function "%o"', originalMethod]);
            }
        }
        runtime.currentController = controller;
        return result;
    };
    handler.prototype = originalMethod.prototype;
    return handler;
};

export const querySelector = (baseElement, selector, all = false, ignoreMismatch = false) => {
    try {
        const element = baseElement[all ? 'querySelectorAll' : 'querySelector'](selector);
        ignoreMismatch || Console.assert(`Failed to get element(s) matched selector "${ selector }"`, all ? element.length : element);
        return element;
    } catch (error) {
        Console.assert(`The string "${ selector }" is not a valid querySelector`, !Object.is(error.message, 'dagger AssertionError occurred!'));
    }
};

export const remoteResourceFetcher = (url, integrity = '') => {
    const option = {};
    if (runtime.daggerOptions.integrity && integrity) {
        option.integrity = `sha256-${ integrity }`;
    }
    return fetch(url, option).then(response => {
        if (response.ok) {
            const type = response.headers.get('content-type');
            Console.assert(`Missing "content-type" for the response content of "${ url }"`, type);
            return response.text().then(content => ({ content, type }));
        } else {
            Console.warn(`❎ Failed to fetch remote resource from "${ url }"`);
        }
    }).catch(error => Console.warn(`❎ Failed to fetch remote resource from "${ url }": ${ error.message }`));
};

export const styleElementCreator = (content, name, disabled) => {
    const style = document.createElement('style');
    if (content) {
        style.textContent = content;
    }
    document.head.appendChild(style);
    style.disabled = disabled;
    style.setAttribute('name', name);
    style.setAttribute('route-debug', location.href);
    style.setAttribute('active-debug', !disabled);
    return style;
};

const templateElement = document.createElement('template');
export const elementCreator = content => {
    templateElement.innerHTML = content;
    return templateElement.content;
};

const textNode = document.createTextNode('');
export const landmarkCreator = () => textNode.cloneNode(false);

export const selectorInjector = (element, tags) => forEach(element.children, child => {
    if (Object.is(child.tagName, 'TEMPLATE')) {
        if (child.hasAttribute('@slot') || child.hasAttribute('*html')) {
            child.$tags = tags;
        }
        selectorInjector(child.content, tags);
    } else if (child instanceof HTMLElement) {
        forEach(tags, tag => child.setAttribute(tag, ''));
    }
});
