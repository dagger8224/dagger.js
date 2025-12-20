/* ************************************************************************
 *  <copyright file="NodeContext.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { context, meta, moduleNameRegExp, promisor, observerEventHandlerNameSet, originalSetAdd, originalSetClear, originalSetDelete } from './constants.mjs';
import { arrayNormalizer, forEach, hashTableCreator, isPromise, landmarkCreator, processorResolver, isShoelaceElement, isObject, textConverter, attributeNameConverter, isString, querySelector } from './utils.mjs';
import { runtime } from './runtime.mjs';
import { proxyCreator } from './proxy.mjs';
import { eventDelegator } from './eventDelegator.mjs';

const dataUpdater = { // two-way data updater
    files: node => [...node.files],
    focus: node => node.isSameNode(document.activeElement),
    result:  (node, decorators) => [...node.files].map(file => {
        if (!file) {
            return null;
        }
        const { buffer, data, encoding } = decorators;
        let result = {
            file,
            content: null,
            loaded: 0,
            progress: 0,
            state: 'initialized'
        };
        const fileReader = new FileReader();
        fileReader.onloadstart = () => { // TODO: 需要优化
            if (result?.[meta]) {
                result = [...result[meta]][0].value;
            }
            result.state = 'loading';
        };
        fileReader.onprogress = ({ loaded }) => {
            result.loaded = loaded;
            result.progress = Math.floor(loaded / file.size * 100);
        };
        fileReader.onload = () => {
            result.state = 'loaded';
            result.content = fileReader.result;
        };
        fileReader.onerror = () => {
            result.state = 'error';
        };
        fileReader.onabort = () => {
            result.state = 'abort';
        };
        if (buffer) {
            fileReader.readAsArrayBuffer(file);
        } else if (data) {
            fileReader.readAsDataURL(file);
        } else {
            fileReader.readAsText(file, encoding || 'utf-8');
        }
        return result;
    }),
    value: ({ tagName, type, value, valueAsNumber, multiple, selectedOptions }, { number, trim, raw }, { detail }) => {
        if (Object.is(detail, true)) {
            return null;
        }
        if (['INPUT', 'SL-INPUT'].includes(tagName)) {
            if (raw) {
                return value;
            }
            if (['date', 'datetime-local'].includes(type)) {
                return new Date(valueAsNumber || 0);
            }
            if (['number', 'range'].includes(type)) {
                return valueAsNumber;
            }
            if (number) {
                return Number.parseFloat(value);
            }
        } else if (Object.is(tagName, 'SELECT')) { // 'SL-SELECT'
            value = multiple ? [...(selectedOptions || [])].map(node => valueResolver(node)) : valueResolver(selectedOptions?.[0]);
        }
        if (trim && isString(value)) {
            return value.trim();
        }
        return value;
    }
};

const targetOnlyEventNames = hashTableCreator('blur', 'focus', 'mouseenter', 'mouseleave', 'resize', 'scroll', 'error', 'select');

const generalUpdater = (data, node, _, { name }) => {
    if (isShoelaceElement(node.tagName) && isObject(data)) {
        node[attributeNameConverter(name)] = data;
    } else if (data == null) {
        node.removeAttribute(name);
    } else {
        node.setAttribute(name, textConverter(data));
    }
};

const nodeUpdater = {
    $boolean: (data, node, _, { name, decorators }) => node.toggleAttribute(isShoelaceElement(node.tagName) || decorators.raw ? name : attributeNameConverter(name), !!data),
    checked: (data, node, _, { decorators }) => {
        const { tagName, type } = node;
        if (Object.is(tagName, 'INPUT')) {
            if (Object.is(type, 'checkbox')) {
                decorators.indeterminate && (node.indeterminate = data == null);
                node.indeterminate || (node.checked = data);
            } else if (Object.is(type, 'radio')) {
                node.checked = !!data;
                node.name && promisor.then(() => forEach(querySelector(document.body, `input[type="radio"][name="${ node.name }"]`, true), radio => Object.is(radio, node) || radio.dispatchEvent(new Event('input'))));
            } else {
                generalUpdater(data, node, null, { name: 'checked' });
            }
        } else if (['SL-CHECKBOX', 'SL-SWITCH'].includes(tagName)) {
            nodeUpdater.$boolean(data, node, null, { name: 'checked' });
        } else {
            generalUpdater(data, node, null, { name: 'checked' });
        }
    },
    class: (data, node, { profile: { classNames } }) => {
        if (data) {
            const classNameSet = new Set(classNames);
            if (Array.isArray(data)) {
                forEach(data, className => originalSetAdd.call(classNameSet, textConverter(className)));
            } else if (isObject(data)) {
                forEach(Object.keys(data), key => data[key] && originalSetAdd.call(classNameSet, key.trim()));
            } else {
                originalSetAdd.call(classNameSet, textConverter(data));
            }
            node.setAttribute('class', [...classNameSet].join(' ').trim());
        } else {
            classNames ? node.setAttribute('class', classNames.join(' ')) : node.removeAttribute('class');
        }
    },
    each: ((sliceResolver = (index, key, value, children, childrenMap, newChildrenMap, indexName, keyName, itemName, nodeContext, profile, parentNode) => {
        let matchedNodeContext = null;
        const matchedArray = childrenMap.get(value);
        if (matchedArray) {
            matchedNodeContext = matchedArray.shift();
            matchedArray.length || originalMapDelete.call(childrenMap, value);
            if (!Object.is(index, matchedNodeContext.index)) {
                const { landmark, upperBoundary } = matchedNodeContext, array = [upperBoundary];
                let node = upperBoundary;
                while (!Object.is(node, landmark)) {
                    node = node.nextSibling;
                    array.push(node);
                }
                forEach(array.reverse(), node => parentNode.insertBefore(node, (index ? (children[index - 1].landmark || {}) : nodeContext.upperBoundary).nextSibling));
                children.includes(matchedNodeContext) && children.splice(matchedNodeContext.index, 1);
                matchedNodeContext.index = index;
                children[index] = matchedNodeContext;
            }
            matchedNodeContext.scope[keyName] = key;
            matchedNodeContext.scope[indexName] = index;
        } else {
            matchedNodeContext = new NodeContext(profile, nodeContext, index, { [indexName]: index, [keyName]: key, [itemName]: value });
        }
        const newMatchedArray = newChildrenMap.get(value);
        newMatchedArray ? newMatchedArray.push(matchedNodeContext) : originalMapSet.call(newChildrenMap, value, [matchedNodeContext]);
    }, originalMapDelete = Map.prototype.delete) => (data, _, nodeContext, { decorators }) => {
        data = data || {};
        const valueSet = new Set(isFunction(data.values) ? data.values() : Object.values(data)), entries = [...(isFunction(data.entries) ? data.entries() : Object.entries(data))], { children, childrenMap, profile, parentNode } = nodeContext, topologySet = data[meta];
        topologySet && forEach(entries, ([key, value]) => value && value[meta] && topologySet.forEach(topology => topology.fetch(key, value)));
        if (!entries.length) { return originalMapClear.call(childrenMap) || nodeContext.removeChildren(true); }
        childrenMap.forEach((array, value) => valueSet.has(value) || forEach(array, nodeContext => nodeContext.destructor(true)) || originalMapDelete.call(childrenMap, value));
        const newChildrenMap = new Map, { item: itemName = 'item', key: keyName = 'key', index: indexName = 'index' } = decorators;
        Console.warn(['❎ Duplication found in slice scope schemes "%o"', { item: itemName, key: keyName, index: indexName }], !Object.is(keyName, indexName) && !Object.is(keyName, itemName) && !Object.is(itemName, indexName));
        forEach(entries, ([key, value], index) => sliceResolver(index, key, value, children, childrenMap, newChildrenMap, indexName, keyName, itemName, nodeContext, profile, parentNode));
        children.length = entries.length;
        childrenMap.forEach(array => forEach(array, nodeContext => (nodeContext.parent = null, nodeContext.destructor(true))));
        nodeContext.childrenMap = newChildrenMap;
    })(),
    exist: (data, _, nodeContext) => data ? (Object.is(nodeContext.state, 'unloaded') && nodeContext.loading()) : nodeContext.unloading(true),
    files: (data, node) => Console.assert([`The data bound to directive "*files" of element "%o" should be "File array" instead of "%o"`, node, data], !data || (Array.isArray(data) && data.every(file => (file instanceof File)))),
    focus: (data, node, _, { decorators: { prevent = false } }) => data ? node.focus({ preventScroll: prevent }) : node.blur(),
    html: (data, node, nodeContext, { decorators: { root = false, strict = false } }) => {
        data = textConverter(data);
        nodeContext.removeChildren(true);
        if (!data) { return; }
        !strict && moduleNameRegExp.test(data) && (data = `<${ data }></${ data }>`);
        const rootNodeProfiles = [], profile = nodeContext.profile, fragment = elementCreator(data);
        if (!node) {
            const tags = profile.node.$tags;
            tags && selectorInjector(fragment, tags);
        }
        Reflect.construct(NodeProfile, [fragment, root ? runtime.rootNamespace : profile.namespace, rootNodeProfiles, null, true]);
        if (rootNodeProfiles.length) {
            processorResolver();
            Promise.all(rootNodeProfiles.map(nodeProfile => Promise.all(nodeProfile.promises || []))).then(() => forEach(rootNodeProfiles, (nodeProfile, index) => nodeContext.profile && Reflect.construct(NodeContext, [nodeProfile, root ? null : nodeContext, index, null, (nodeProfile.landmark || nodeProfile.node).parentNode])));
        }
        node ? node.appendChild(fragment) : nodeContext.parentNode.insertBefore(fragment, nodeContext.landmark);
    },
    result: (data, node) => {
        if (Object.is(node.tagName, 'INPUT') && Object.is(node.type, 'file')) {
            Console.assert([`The data bound to directive "*result" of element "%o" should be "object array" instead of "%o"`, node, data], !data || (Array.isArray(data) && data.every(isObject)));
        } else {
            generalUpdater(data, node, null, { name: 'result' });
        }
    },
    selected: (data, node) => {
        if (Object.is(node.tagName, 'OPTION')) {
            node.selected = !!data;
            node.parentElement.dispatchEvent(new Event('input'));
        } else {
            generalUpdater(data, node, null, { name: 'selected' });
        }
    },
    style: ((styleUpdater = (resolvedStyles, content) => {
        if (!content) { return; }
        const [key, value = ''] = content.split(':').map(item => item.trim());
        Console.assert(`The content "${ content }" is not a valid style declaration`, key && value);
        resolvedStyles[key] = value;
    }) => (data, node, { profile: { inlineStyle, styles } }) => {
        if (data) {
            const resolvedStyles = Object.assign({}, styles);
            if (Array.isArray(data)) {
                forEach(data, item => styleUpdater(resolvedStyles, textConverter(item)));
            } else if (isObject(data)) {
                forEach(Object.keys(data), key => (resolvedStyles[key.trim()] = textConverter(data[key])));
            } else {
                forEach(textConverter(data).split(';'), item => styleUpdater(resolvedStyles, item.trim()));
            }
            node.style.cssText = Object.keys(resolvedStyles).filter(key => resolvedStyles[key]).map(key => `${ key }: ${ resolvedStyles[key] }; `).join('').trim();
        } else {
            inlineStyle ? node.setAttribute('style', inlineStyle) : node.removeAttribute('style');
        }
    })(),
    text: (data, node) => {
        data = textConverter(data);
        Object.is(data, node.textContent) || (node.textContent = data);
    },
    value: ((timeNormalizer = (data, padLength = 2) => String(data).padStart(padLength, '0')) => (data, node, nodeContext, { decorators: { trim = false } }) => {
        trim && (data = textConverter(data, trim));
        nodeContext.value = data;
        let fieldName = 'value';
        const { tagName, type } = node;
        if (Object.is(tagName, 'INPUT')) {
            Console.assert(['It\'s illegal to use directive "*value" on element "%o"', node], !Object.is(type, 'file'));
            const isDate = ['date', 'datetime-local'].includes(type);
            if (data instanceof Date) {
                if (isDate || Object.is(type, 'week')) {
                    fieldName = 'valueAsNumber';
                } else if (Object.is(type, 'month')) {
                    data = `${ data.getUTCFullYear() }-${ timeNormalizer(data.getUTCMonth() + 1) }`;
                } else if (Object.is(type, 'time')) {
                    const step = node.step || 0;
                    let time = `${ timeNormalizer(data.getUTCHours()) }:${ timeNormalizer(data.getUTCMinutes()) }`;
                    if (step % 60) {
                        time = `${ time }:${ timeNormalizer(data.getUTCSeconds()) }`;
                        (step % 1) && (time = `${ time }.${ timeNormalizer(data.getUTCMilliseconds(), 3) }`);
                    }
                    data = time;
                }
            } else {
                data = textConverter(data, trim);
            }
        } else if (Object.is(tagName, 'TEXTAREA')) {
            nodeUpdater.text(data, node);
        } else if (Object.is(tagName, 'SL-INPUT')) {
            if (data instanceof Date) {
                data = data.toISOString().replace('Z', '');
                const [date, time] = data.split('T');
                if (Object.is(type, 'date')) {
                    data = date;
                } else if (Object.is(type, 'time')) {
                    data = time;
                }
            } else {
                data = textConverter(data, trim);
            }
        } else if (Object.is(tagName, 'OPTION')) { // 'SL-OPTION'
            const select = node.parentNode;
            if (select) {
                const { multiple } = select;
                const selectedValue = valueResolver(select);
                forEach(select.children, option => {
                    const value = valueResolver(option);
                    option.selected = multiple ? selectedValue.includes(value) : Object.is(selectedValue, value);
                });
            }
        } else if (['SELECT', 'SL-SELECT'].includes(tagName)) {
            const { multiple } = node;
            multiple && Console.assert(['The data bound to directive "*value" of element "%o" should be "array" instead of "%o"', node, data], (data == null) || Array.isArray(data));
            if (Object.is(tagName, 'SELECT')) {
                return forEach(node.children, option => {
                    const value = valueResolver(option);
                    option.selected = multiple ? data.includes(value) : Object.is(data, value);
                });
            }
        } else if (Object.is(tagName, 'SL-RADIO-GROUP')) {
            /* forEach(node.children, radio => {
                radio.checked = Object.is(data, valueResolver(radio));
            });*/
        } else {
            return generalUpdater(data, node, null, { name: 'value' });
        }
        node[fieldName] = data;
    })()
};


const modifierResolver = (event, modifiers, methodName) => {
    if (modifiers) {
        modifiers = arrayNormalizer(modifiers);
    } else {
        return true;
    }
    modifiers[methodName](modifier => {
        modifier = String(modifier);
        const positive = !modifier.startsWith('!');
        if (!positive) {
            modifier = modifier.substring(1);
        }
        const modifierRegExp = new RegExp(modifier);
        if (event.getModifierState && event.getModifierState(modifier)) {
            return positive;
        } else if ([event.code, event.key, event.button].some(value => modifierRegExp.test(value))) {
            return positive;
        }
        return !positive;
    });
};

const directivesRemover = (targetNames, directives, callback) => {
    if (directives) {
        forEach(directives.filter((directive, index) => directive && (directive.index = index, directive.decorators && targetNames.includes(directive.decorators.name))).reverse(), directive => callback(directive) || directives.splice(directive.index, 1));
    }
};

const eventHandlerRemover = ({ target, event, handler, options, listener, observer }) => {
    if (observer) {
        observer.disconnect();
    } else if (listener) {
        originalSetDelete.call(target.$eventListenerMap[event], listener);
    } else {
        target.removeEventListener(event, handler, options);
    }
};

const valueResolver = node => {
    if (node) {
        if (Reflect.has(node[context] || {}, 'value')) {
            return node[context].value;
        }
        return node.value;
    }
};

const queueingControllerSet = new Set;

export const NodeContext = class {
    constructor (profile, parent = null, index = 0, sliceScope = null, parentNode = null) {
        const { directives, dynamic, namespace, node, landmark, plain, text, html, raw } = profile;
        this.directives = directives;
        this.profile = profile;
        this.index = index;
        this.state = 'loaded';
        this.parent = null;
        this.children = null;
        this.childrenMap = null;
        this.existController = null;
        this.landmark = null;
        this.upperBoundary = null;
        this.childrenController = null;
        this.controller = null;
        this.controllers = null;
        this.eventHandlers = null;
        this.scope = null;
        this.sentry = null;
        this.node = null;
        if (parent) {
            this.parent = parent;
            this.parentNode = parentNode || parent.node || parent.parentNode;
            this.scope = parent.scope;
            parent.children.splice(index, 0, this);
        } else {
            this.parentNode = node.parentNode || landmark.parentNode;
            this.scope = runtime.rootScope;
        }
        this.module = namespace.module;
        if (html) {
            return this.loading();
        }
        if (raw || plain) { // comment/raw/script/style/view
            this.resolveNode();
            if (this.node.removeAttribute) {
                this.node.removeAttribute('dg-cloak');
            }
            if (plain) {
                this.resolveChildren();
            }
        } else if (text) {
            this.resolveNode(() => (this.controller = this.resolveController(text)));
        } else {
            const each = this.directives?.each;
            if (each || profile.virtual) {
                this.resolveLandmark(sliceScope);
            }
            if (sliceScope) {
                const { plain, root } = each.decorators;
                this.sliceScope = this.resolveScope(sliceScope, plain, root);
                if (parent.children.length > index + 1) {
                    forEach(parent.children, (sibling, siblingIndex) => sibling && (siblingIndex > index) && (sibling.index++));
                }
            } else {
                if (profile.slotScope) {
                    this.slotScope = this.resolveScope(Object.assign({}, profile.slotScope), true);
                }
                if (each) {
                    this.children = [];
                    this.childrenMap = new Map;
                    this.controller = this.resolveController(each);
                    return this;
                }
            }
            if (dynamic) {
                const expressions = dynamic.processor(this.module, this.scope, this.parentNode);
                const directives = this.directives;
                this.directives = Object.assign({}, directives, { controllers: [...(directives.controllers || [])], eventHandlers: [...(directives.eventHandlers || [])] });
                forEach(arrayNormalizer(expressions), expression => {
                    if (isString(expression)) {
                        const index = expression.indexOf('=');
                        if (index < 0) {
                            expression = { name: expression, value: '' };
                        } else {
                            expression = { name: expression.substring(0, index), value: expression.substring(index + 1) };
                        }
                    }
                    Console.assert(['The name of "@directive" expression should be "string" instead of "%o"', expression.name], isString(expression.name));
                    Console.assert(['The value of "@directive" expression should be "string" instead of "%o"', expression.value], isString(expression.value));
                    const name = expression.name.trim();
                    Console.assert([`It's illegal to create "@raw", "@directive" or "*each" directive with the "@directive" expression "%o"`, expressions], !name.startsWith('@raw') && !name.startsWith('@directive') && !name.startsWith('*each'));
                    profile.resolveDirective(name, expression.value, this.directives);
                });
                processorResolver();
            }
            const exist = this.directives?.exist;
            if (exist) {
                if (!this.lanmark) {
                    this.resolveLandmark(sliceScope);
                }
                this.state = 'unloaded';
                this.existController = this.resolveController(exist);
            } else {
                this.loading();
            }
        }
    }
    destructor (isRoot) {
        this.unloading(isRoot);
        const { plain, text } = this.profile;
        if (!plain && !text) {
            if (isRoot) {
                if (this.landmark) {
                    this.landmark.remove();
                }
                if (this.upperBoundary) {
                    this.upperBoundary.remove();
                }
            }
            if (this.existController) {
                this.removeController(this.existController);
            }
            const siblings = this.parent?.children;
            if (isRoot && siblings) {
                forEach(siblings, (sibling, siblingIndex) => {
                    if (siblingIndex > this.index) {
                        sibling.index--;
                    }
                });
                siblings.splice(this.index, 1);
            }
        }
        forEach(Reflect.ownKeys(this), key => {
            this[key] = null;
        });
    }
    initialize () {
        const { html, virtual } = this.profile;
        if (html) {
            this.node = html;
        } else if (!virtual) {
            this.resolveNode();
        }
        const loaded = this.directives?.loaded;
        this.resolvePromise(loaded && loaded.processor(this.module, this.scope, this.node), () => this.postLoaded());
        if (!html) {
            this.resolveChildren();
        }
    }
    loading () {
        this.state = 'loading';
        const load = this.directives?.load;
        if (!load) {
            return this.initialize();
        }
        const { init, plain, root } = load.decorators;
        this.resolvePromise(load.processor(this.module, root ? runtime.rootScope : this.scope, null), scope => {
            if (!Object.is(this.state, 'loading')) {
                return;
            }
            if (scope) {
                const { constructor } = scope;
                if (Object.is(constructor, Object) || (!constructor && Object.is(typeof scope, 'object'))) {
                    this.resolveScope(scope, plain, root, init);
                }
            } else if (init) {
                this.resolveScope(scope, plain, root, init);
            }
            this.initialize();
        });
    }
    postLoaded () {
        this.state = 'loaded';
        if (this.node) {
            this.node.removeAttribute('dg-cloak');
        }
        const { rootScopeCallback } = runtime;
        if (rootScopeCallback) {
            rootScopeCallback(this.scope);
            runtime.rootScopeCallback = null;
        } else if (this.directives) {
            const { controllers, eventHandlers, sentry } = this.directives;
            if (sentry) {
                this.sentry = Object.assign({}, sentry, { owner: this, processor: sentry.processor.bind(null, this.module, this.scope) });
                originalSetAdd.call(sentrySet, this.sentry);
            }
            if (eventHandlers) {
                this.eventHandlers = eventHandlers.map(({ event, decorators = {}, processor, name }) => {
                    const { capture, outside, once, passive, target, undelegate } = decorators;
                    const resolvedTarget = target ? (window[target] || querySelector(document, target)) : this.node;
                    const currentTarget = outside ? window : resolvedTarget;
                    const handler = event => this.updateEventHandler(event, name, processor.bind(null, this.module, this.scope), decorators, resolvedTarget);
                    Console.assert([`The target of "+${ event }" directive declared on element "%o" is invalid`, this.node || this.profile.node], resolvedTarget);
                    if (observerEventHandlerNameSet.has(event)) {
                        let constructor = null;
                        if (Object.is(event, 'observe-intersection')) { // IntersectionObserver
                            constructor = IntersectionObserver;
                            // supported options: root/rootMargin/threshold
                            const { root } = decorators;
                            if (root) {
                                decorators.root = window[root] || querySelector(document, root);
                            }
                        } else if (Object.is(event, 'observe-mutation')) { // MutationObserver
                            constructor = MutationObserver;
                            // supported options: attributes/attributeOldValue/attributeFilter/characterData/characterDataOldValue/childList/subtree
                        } else if (Object.is(event, 'observe-resize')) { // ResizeObserver
                            constructor = ResizeObserver;
                        }
                        const observer = new constructor(entries => processor(this.module, this.scope, this.node, entries), decorators);
                        observer.observe(resolvedTarget, decorators);
                        return {
                            target: currentTarget,
                            event,
                            observer,
                            options: decorators
                        };
                    } else if (once || passive || undelegate || targetOnlyEventNames[event]) {
                        // support options: capture/once/passive
                        currentTarget.addEventListener(event, handler, decorators);
                        return {
                            target: currentTarget,
                            event,
                            handler,
                            options: decorators
                        };
                    } else { // use event delegate
                        const listener = { decorators, handler };
                        eventDelegator(event, currentTarget, listener, capture);
                        return {
                            target: currentTarget,
                            event,
                            decorators,
                            listener
                        };
                    }
                });
            }
            if (controllers) {
                this.controllers = controllers.map(controller => this.resolveController(controller)).filter(controller => controller);
            }
        }
    }
    removeChildren (isRoot) {
        if (isRoot) {
            if (this.node) {
                this.node.innerHTML = '';
            } else if (this.upperBoundary) {
                let node = this.upperBoundary.nextSibling;
                while (node && !Object.is(node, this.landmark)) {
                    const { nextSibling } = node;
                    node.remove();
                    node = nextSibling;
                }
            }
        }
        if (this.children?.length) {
            forEach(this.children, child => child && child.destructor(false));
            this.children.length = 0;
        }
    }
    removeController (controller) {
        controller.topologySet.forEach(topology => topology.unsubscribe(controller));
        originalSetClear.call(controller.topologySet);
        if (controller.observer) {
            controller.observer.disconnect();
        }
        if (Object.is(controller, this.childrenController)) {
            this.childrenController = null;
        }
        if (Object.is(controller, this.existController)) {
            this.existController = null;
        }
    }
    removeDirectives (data, targetNames) { // TODO: assert
        if (!data) {
            return;
        }
        targetNames = arrayNormalizer(targetNames);
        directivesRemover(targetNames, [...this.controllers, this.childrenController, this.existController], controller => this.removeController(controller));
        directivesRemover(targetNames, this.eventHandlers, eventHandlerRemover);
    }
    resolveChildren () {
        const { children } = this.profile;
        const child = this.directives?.child;
        if (!this.children && (children || (child && Object.is(child.name, 'html')))) {
            this.children = [];
        }
        if (child) {
            this.childrenController = this.resolveController(child);
        } else {
            forEach(children, (child, index) => new NodeContext(child, this, index));
        }
    }
    resolveController ({ name, decorators = {}, processor }) {
        const { node } = this;
        const subscribable = !decorators.once || decorators.lazy;
        const controller = {
            name,
            owner: this,
            decorators,
            processor: processor.bind(null, this.module, this.scope),
            topologySet: subscribable ? new Set : null,
            observer: null,
            updater: generalUpdater
        };
        if (name) {
            if (nodeUpdater[name]) {
                controller.updater = nodeUpdater[name];
            } else if (node && (decorators.bool || (name !== 'draggable' && Object.is(typeof node[attributeNameConverter(name)], 'boolean')))) {
                controller.updater = nodeUpdater.$boolean;
            }
        }
        if (subscribable && node && Object.is(name, 'value') && ['SELECT', 'SL-SELECT'].includes(node.tagName)) {
            controller.observer = new MutationObserver(() => this.updateController(controller, true));
            controller.observer.observe(node, {
                childList: true
            });
        }
        this.updateController(controller, true);
        return subscribable && controller;
    }
    resolveLandmark (sliceScope) {
        const { index, parent, parentNode, profile: { landmark, virtual } } = this;
        if (parent) {
            let baseLandmark = null;
            const nextSibling = parent.children[index + 1];
            if (nextSibling) {
                baseLandmark = nextSibling.upperBoundary || nextSibling.node || nextSibling.landmark;
            } else if (sliceScope) {
                baseLandmark = parent.landmark;
            } else if (parentNode.contains(landmark || null)) {
                baseLandmark = landmark;
            } else {
                baseLandmark = parent.node ? null : parent.landmark;
            }
            this.landmark = parentNode.insertBefore(landmarkCreator(), baseLandmark);
        } else {
            this.landmark = landmark;
        }
        if (virtual || this.directives?.each) {
            this.upperBoundary = parentNode.insertBefore(landmarkCreator(), this.landmark);
        }
    }
    resolveNode (callback) {
        const { node: baseNode, unique, raw } = this.profile;
        const node = unique ? baseNode : baseNode.cloneNode(raw);
        this.node = node;
        node[context] = this;
        if (callback) {
            callback();
        }
        if (!node.isConnected) {
            let landmark = this.landmark;
            if (!landmark) {
                if (this.parent) {
                    landmark = this.parent.node ? null : this.parent.landmark;
                }
            }
            this.parentNode.insertBefore(node, landmark && Object.is(this.parentNode, landmark.parentNode) ? landmark : null);
        }
    }
    resolvePromise (promise, callback) {
        if (isPromise(promise)) {
            promise.then(callback);
        } else {
            callback(promise);
        }
    }
    resolveScope (scope, plain, root, init) {
        if (init) {
            const { moduleProfile } = this.profile;
            if (moduleProfile) {
                const initScope = moduleProfile.config.init;
                if (initScope) {
                    this.resolveScope(initScope, plain, root);
                    return scope && this.resolveScope(scope, plain);
                }
            }
        }
        if (!plain) {
            scope = proxyCreator(scope);
        }
        this.scope = Object.setPrototypeOf(scope, root ? runtime.rootScope : this.scope);
        return scope;
    }
    unloading (isRoot) {
        if (Object.is(this.state, 'unloaded')) {
            return;
        }
        if (this.controller) {
            this.removeController(this.controller);
            this.controller = null;
        }
        if (this.profile.text) {
            this.state = 'unloaded';
        } else {
            this.state = 'unloading';
            if (this.profile.plain || this.childrenMap) {
                return this.removeChildren(isRoot);
            }
            if (this.childrenController) {
                this.removeController(this.childrenController);
            }
            forEach(this.controllers, controller => {
                this.removeController(controller);
                this.controllers = null;
            });
            forEach(this.eventHandlers, eventHandlerRemover);
            this.eventHandlers = null;
            if (this.node) {
                this.node.$eventListenerMap = null;
            }
            if (this.sentry) {
                originalSetDelete.call(sentrySet, this.sentry);
                this.sentry = null;
            }
            const unload = this.directives?.unload;
            if (unload) {
                unload.processor(this.module, this.scope, this.node);
            }
            const { node } = this;
            if (isRoot && node) {
                node.remove();
            }
            this.node = null;
            this.removeChildren(isRoot);
            this.scope = this.sliceScope || this.parent?.scope || runtime.rootScope;
            const unloaded = this.directives?.unloaded;
            if (unloaded) {
                unloaded.processor(this.module, this.scope, null);
            }
            this.state = 'unloaded';
        }
    }
    updateEventHandler (event, name, processor, decorators, bindingTarget) {
        if (!name) {
            const { on, inside, outside, every, some, prevent, stop, stopImmediate } = decorators;
            const { type, target, currentTarget } = event;
            const isCurrent = Object.is(target, currentTarget);
            Console.warn([`❎ Please avoid using "on", "inside" or "outside" decorators together on "+${ type }" directive on element "%o".`, currentTarget], !!on + !!inside + !!outside < 2);
            if (outside && bindingTarget.contains?.(target)) {
                return;
            }
            if (on && !isCurrent) {
                return;
            }
            if (inside && !(currentTarget.contains?.(target) && !isCurrent)) {
                return;
            }
            if (!modifierResolver(event, every, 'every') || !modifierResolver(event, some, 'some')) {
                return;
            }
            if (prevent && ([true, 'prevent'].includes(prevent) || arrayNormalizer(prevent).some(source => Object.is(event.detail?.source, source)))) {
                event.preventDefault();
            }
            if (stop) {
                event.stopPropagation();
            }
            if (stopImmediate) {
                event.stopImmediatePropagation();
            }
        }
        const suspendedController = runtime.currentController;
        const remove = decorators.remove;
        runtime.currentController = null;
        let parameter = null;
        if (name) {
            parameter = dataUpdater[name] ? dataUpdater[name](this.node, decorators, event) : this.node[name];
        } else {
            parameter = event;
        }
        const data = processor(this.node, parameter);
        if (remove) {
            if (isPromise(data)) {
                data.then(data => this.removeDirectives(data, remove));
            } else {
                this.removeDirectives(data, remove);
            }
        }
        runtime.currentController = suspendedController;
    }
    updateController (controller, force) {
        if (!queueingControllerSet.has(controller)) {
            originalSetAdd.call(queueingControllerSet, controller);
            promisor.then(() => {
                originalSetDelete.call(queueingControllerSet, controller);
                if (!this.profile) {
                    return;
                }
                const { decorators: { once, remove, route, lazy }, topologySet, updater, name } = controller;
                const subscribable = !once || lazy;
                if (force || (topologySet && [...topologySet].some(topology => !Object.is(topology.oldValue, topology.value)))) {
                    if (topologySet && topologySet.size) {
                        topologySet.forEach(topology => topology.unsubscribe(controller)); // TODO: optimize with cache
                        originalSetClear.call(topologySet);
                    }
                    const suspendedController = runtime.currentController;
                    runtime.currentController = subscribable ? controller : null;
                    const data = controller.processor(this.node);
                    if (subscribable && route) {
                        runtime.routerTopology.subscribe();
                    }
                    runtime.currentController = suspendedController;
                    if (lazy && !name && isFunction(data)) { // lazy watch
                        controller.processor = data;
                        // controller.decorators.lazy = false;
                    } else if (isPromise(data)) {
                        data.then(data => {
                            if (remove) {
                                this.removeDirectives(data, remove);
                            }
                            if (updater) {
                                updater(data, this.node, this, controller);
                            }
                        });
                    } else {
                        if (remove) {
                            this.removeDirectives(data, remove);
                        }
                        if (updater) {
                            updater(data, this.node, this, controller);
                        }
                    }
                }
            });
        }
    }
};
