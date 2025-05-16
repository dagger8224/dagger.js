/* ************************************************************************
 *  <copyright file="dagger.release.js" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2025 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

export default ((context = Symbol('context'), currentController = null, daggerChangeEventName = 'dg-change', directiveQueue = [], dispatchSource = { bubble: 'bubble', self: 'self', mutation: 'mutation' }, moduleNameRegExp = /^[_a-z]{1}[\w]*$/, remoteUrlRegExp = /^(http:\/\/|https:\/\/|\/|\.\/|\.\.\/)/i, rootNamespace = null, rootScope = null, rootScopeCallback = null, rootNodeProfiles = [], arrayWrapper = target => Array.isArray(target) ? target : [target], emptier = () => Object.create(null), processorCaches = emptier(), styleModuleSet = new Set, eventDelegator = ((bubbleSet = new Set, captureSet = new Set, handler = (event, capture, targets, index = 0) => {
    const currentTarget = targets[index++];
    if (!currentTarget) { return; }
    const eventListenerSet = currentTarget.$eventListenerMap && currentTarget.$eventListenerMap[event.type], eventListeners = eventListenerSet ? [...eventListenerSet].filter(listener => Object.is(listener.decorators.capture, capture)) : [];
    if (!eventListeners.length) { return handler(event, capture, targets, index); }
    Object.defineProperty(event, 'currentTarget', { configurable: true, value: currentTarget });
    for (const { decorators, handler } of eventListeners) {
        handler(event);
        if (decorators.stopImmediate) {
            return event.stopImmediatePropagation();
        }
    }
    event.cancelBubble || handler(event, capture, targets, index);
}) => (eventName, target, listener, capture) => {
    target.$eventListenerMap || (target.$eventListenerMap = emptier());
    const listenerSet = target.$eventListenerMap[eventName] || new Set;
    isFunction(listener) && (listener = { decorators: { capture }, handler: listener });
    originalSetAdd.call(listenerSet, listener);
    target.$eventListenerMap[eventName] = listenerSet;
    if ((capture && captureSet.has(eventName)) || (!capture && bubbleSet.has(eventName))) { return; }
    (capture ? captureSet : bubbleSet).add(eventName);
    window.addEventListener(eventName, event => handler(event, capture, capture ? event.composedPath().reverse() : event.composedPath(), 0), capture);
})(), attributeNameResolver = name => name.replace(/-[a-z]/g, string => string[1].toUpperCase()), forEach = (iterators, processor) => {
    if (!iterators) { return; }
    const length = iterators.length || 0;
    for (let index = 0; index < length; ++index) { processor(iterators[index], index); }
}, hashTableResolver = (...array) => {
    const hashTable = emptier();
    return forEach(array, key => (hashTable[key] = true)) || hashTable;
}, meta = Symbol('meta'), moduleType = { json: 'json', namespace: 'namespace', script: 'script', style: 'style', string: 'string', view: 'view' }, promisor = Promise.resolve(), routerTopology = null, sentrySet = new Set, textNode = document.createTextNode(''), observerEventHandlerNames = hashTableResolver('observe-intersection', 'observe-mutation', 'observe-resize'), configResolver = ((defaultConfigContent = { options: { rootSelectors: ['title', 'body'] }, modules: { view: { uri: ['template#view'], type: moduleType.view, optional: true }, script: { uri: ['script[type="dagger/script"]'], type: moduleType.script, anonymous: true, optional: true }, style: { uri: ['style[type="dagger/style"]'], type: moduleType.style, scoped: true, optional: true } }, routers: { mode: 'hash', prefix: '', aliases: {}, default: '', routing: null } }, resolver = (base, content, type, extendsDefaultConfig) => ({ base, content: extendsDefaultConfig ? Object.assign({}, defaultConfigContent[type], content) : content })) => (baseElement, base, type = 'modules') => {
    const configContainer = querySelector(baseElement, `script[type="dagger/${ type }"]`);
    if (configContainer) {
        const src = configContainer.getAttribute('src'), extendsDefaultConfig = !Object.is(type, 'modules') || configContainer.hasAttribute('extends');
        configContainer.hasAttribute('base') && (base = new URL(configContainer.getAttribute('base') || '', base).href);
        return src ? remoteResourceResolver(new URL(src, base), configContainer.integrity).then(({ content }) => resolver(base, functionResolver(content), type, extendsDefaultConfig)) : resolver(base, configContainer.textContent.trim() ? functionResolver(configContainer.textContent) : {}, type, extendsDefaultConfig);
    }
    return { base, content: defaultConfigContent[type] };
})(), functionResolver = expression => {
    if (!Reflect.has(processorCaches, expression)) {
        try {
            try {
                processorCaches[expression] = new Function(`return (${ expression });`)();
            } catch (error) {
                processorCaches[expression] = new Function(`return (() => {${ expression }})();`)();
            }
        } catch (error) {}
    }
    return processorCaches[expression];
}, isFunction = target => (target instanceof Function), isObject = target => (target instanceof Object), isPromise = target => (target instanceof Promise), isShoelace = tagName => tagName.startsWith('SL-'), isString = target => Object.is(typeof target, 'string'), moduleConfigNormalizer = ((resolvedTypes = hashTableResolver(...Object.keys(moduleType).map(type => `@${ type }`)), normalizer = (config, type) => {
    const isArray = Array.isArray(config), rawConfig = config;
    if (isString(config) || (isArray && config.every(isString))) {
        config = { uri: config };
    } else if (isArray) {
        config = { candidates: config };
    }
    if (config.candidates) {
        config.candidates = arrayWrapper(config.candidates);
        const matchedCandidate = config.candidates.find(item => isObject(item) && (!Reflect.has(item, 'media') || matchMedia(item.media).matches));
        Object.assign(config, matchedCandidate);
    }
    config.type || (config.type = type);
    config.uri && (config.uri = arrayWrapper(config.uri));
    return config;
}) => config => forEach(Object.keys(config), key => resolvedTypes[key] && isObject(config[key]) ? (forEach(Object.entries(config[key]), ([name, value]) => {
    config[name] = normalizer(value, key.substring(1));
}) || Reflect.deleteProperty(config, key)) : (config[key] = normalizer(config[key]))) || config)(), ownKeys = target => Reflect.ownKeys(target).filter(key => !Object.is(key, meta)), serializer = async ([resolver, ...nextResolvers], token = { stop: false }) => {
    if (token.stop) { return; }
    if (isPromise(resolver)) {
        return resolver.then(resolver => serializer([resolver, ...nextResolvers], token));
    } else if (isFunction(resolver)) {
        return serializer([resolver(null, token), ...nextResolvers], token);
    } else {
        return nextResolvers.length ? serializer([nextResolvers.shift()(resolver, token), ...nextResolvers], token) : resolver;
    }
}, originalStringifyMethod = JSON.stringify, originalSetAdd = Set.prototype.add, originalSetClear = Set.prototype.clear, originalSetDelete = Set.prototype.delete, originalMapClear = Map.prototype.clear, originalMapSet = Map.prototype.set, originalWeakMapSet = WeakMap.prototype.set, processorResolver = () => {
    if (!directiveQueue.length) { return; }
    forEach(functionResolver(`[${ directiveQueue.map(directive => directive.processor).join(', ') }]`), (processor, index) => {
        const directive = directiveQueue[index];
        processorCaches[directive.processor] = processor;
        directive.processor = processor;
    });
    directiveQueue.length = 0;
}, processorWrapper = originalMethod => {
    const handler = function (...parameters) {
        const controller = currentController;
        currentController = null;
        let result = null;
        try {
            result = originalMethod.apply(this, parameters);
        } catch (error) { // constructable
            result = Reflect.construct(originalMethod, parameters);
        }
        currentController = controller;
        return result;
    };
    handler.prototype = originalMethod.prototype;
    return handler;
}, querySelector = (baseElement, selector, all = false) => baseElement[all ? 'querySelectorAll' : 'querySelector'](selector), remoteResourceResolver = (url, integrity = '') => fetch(url, integrity ? { integrity: `sha256-${ integrity }` } : {}).then(response => {
    if (response.ok) {
        return response.text().then(content => ({ content, type: response.headers.get('content-type') }));
    }
}).catch(() => {}), styleResolver = (content, name, disabled) => {
    const style = document.createElement('style');
    content && (style.textContent = content);
    document.head.appendChild(style);
    style.disabled = disabled;
    style.setAttribute('name', name);
    return style;
}, templateResolver = content => {
    const template = document.createElement('template');
    template.innerHTML = content;
    return template.content;
}, selectorInjector = (element, tags) => forEach(element.children, child => {
    if (Object.is(child.tagName, 'TEMPLATE')) {
        (child.hasAttribute('@slot') || child.hasAttribute('*html')) && (child.$tags = tags);
        selectorInjector(child.content, tags);
    } else if (child instanceof HTMLElement) {
        forEach(tags, tag => child.setAttribute(tag, ''));
    }
}), textResolver = (data, trim = true) => {
    if (!isString(data)) {
        if ((data == null) || Number.isNaN(data)) { return ''; }
        if (isObject(data)) { return originalStringifyMethod(data); }
        data = String(data);
    }
    return trim ? data.trim() : data;
}, proxyResolver = ((hasOwnProperty = Object.prototype.hasOwnProperty, invalidSymbols = new Set([...Reflect.ownKeys(Symbol).map(key => Symbol[key]).filter(item => Object.is(typeof item, 'symbol')), context, meta]), resolvedDataMap = new WeakMap, validConstructorSet = new Set([void(0), Array, Object]), proxyHandler = {
    get: (target, property) => {
        const value = target[property];
        if (currentController && !invalidSymbols.has(property) && (Object.is(value) || hasOwnProperty.call(target, property))) {
            const { topologySet } = currentController;
            forEach([...target[meta]].filter(topology => !topology.parent || topologySet.has(topology)), topology => topology.fetch(property, value).subscribe());
        }
        return value;
    },
    set: (target, property, newValue) => {
        target[property] = newValue;
        if (!invalidSymbols.has(property) && hasOwnProperty.call(target, property)) {
            const topologySet = target[meta];
            currentController && topologySet.forEach(topology => topology.unsubscribe(currentController));
            newValue = proxyResolver(target, property);
            topologySet.forEach(topology => topology.fetch(property).update(newValue, dispatchSource.self));
        }
        return true;
    },
    deleteProperty: (target, property) => {
        const exist = Reflect.has(target, property);
        if (Reflect.deleteProperty(target, property)) {
            exist && isString(property) && target[meta].forEach(topology => topology.fetch(property).update(void(0), dispatchSource.self));
            return true;
        }
        return false;
    }
}) => (target, property) => {
    const isRootScope = property == null;
    let data = isRootScope ? target : target[property];
    if (isObject(data) || (data && !data.constructor)) {
        const resolvedData = resolvedDataMap.get(data);
        if (resolvedData) {
            data = resolvedData;
        } else {
            data[meta] = new Set;
            if (validConstructorSet.has(data.constructor)) {
                const resolvedData = new Proxy(data, proxyHandler);
                originalWeakMapSet.call(resolvedDataMap, data, resolvedData);
                forEach(ownKeys(data), key => proxyResolver(data, key));
                data = resolvedData;
            }
            originalWeakMapSet.call(resolvedDataMap, data, data);
        }
    }
    isRootScope ? data[meta].add(new Topology(null, '', data)) : (target[property] = data);
    return data;
})(), ModuleProfile = ((elementProfileCacheMap = new Map, embeddedType = { json: 'dagger/json', namespace: 'dagger/modules', script: 'dagger/script', style: 'dagger/style', string: 'dagger/string' }, integrityProfileCache = emptier(), mimeType = { html: 'text/html', json: 'application/json', script: ['application/javascript', 'javascript/esm', 'text/javascript'], style: 'text/css' }, relativePathRegExp = /(?:^|;|\s+)(?:export|import)\s*?(?:(?:(?:[$\w*\s{},]*)\s*from\s*?)|)(?:(?:"([^"]+)?")|(?:'([^']+)?'))[\s]*?(?:$|)/gm, scopedRuleResolver = ((selectorRegExp = /([\s:+>~])/, whitelist = [':root', ':scope', 'html', 'body']) => (sheet, rule, name, iterator, conditionText = '') => {
    if (rule instanceof CSSKeyframesRule) {
        const originalName = rule.name;
        rule.name = `${ originalName }-${ name }`;
        sheet.insertRule(rule.cssText, iterator.index++);
        rule.name = originalName;
    }
    if (rule.cssRules?.length) {
        const { conditionText } = rule;
        forEach(rule.cssRules, rule => scopedRuleResolver(sheet, rule, name, iterator, conditionText));
    } else if (rule.selectorText) {
        const { style } = rule, originalAnimationName = style.animationName, resolvedRule = `${ rule.selectorText.split(',').map(selector => (selector = selector.trim()) && ((whitelist.some(key => selector.startsWith(key)) && selector) || `${ selectorRegExp.test(selector) ? selector.replace(selectorRegExp, `[${ name }]$1`) : `${ selector }[${ name }]` }, [${ name }] ${ selector }`)).join(', ') }{${ style.cssText }}`;
        originalAnimationName && (style.animationName = `${ originalAnimationName }-${ name }`);
        sheet.insertRule(conditionText ? `@media ${ conditionText }{ ${ resolvedRule } }` : resolvedRule, iterator.index++);
        originalAnimationName && (style.animationName = originalAnimationName);
    }
})(), scriptModuleResolver = (module, resolvedModule) => {
    try {
        forEach(ownKeys(module), key => {
            const value = module[key];
            if (isFunction(value)) {
                resolvedModule[key] = processorWrapper(value);
            } else {
                resolvedModule[key] = value;
                isObject(value) && scriptModuleResolver(value, value);
            }
        });
    } catch (error) {} finally { return resolvedModule; }
}, ModuleProfile = class {
    constructor (config = {}, base = '', name = '', parent = null) {
        name = name.trim();
        this.name = name, this.state = 'unresolved', this.valid = true, this.module = this.integrity = this.parent = this.children = this.type = this.content = this.resolvedContent = null;
        if (parent) {
            this.parent = parent, this.path = parent.path ? `${ parent.path }.${ name }` : name, this.tags = [...parent.tags, this.path.replace(/\./g, '__')], this.baseElement = parent.baseElement;
        } else {
            this.path = name, this.tags = [], this.baseElement = document;
        }
        const { integrity, uri, type } = config;
        type && (this.type = type);
        if (Reflect.has(config, 'content')) {
            this.content = config.content;
        } else if (uri) {
            this.URIs = uri;
        }
        this.integrity = integrity;
        this.config = config, this.promise = new Promise(resolver => (this.resolver = resolver)), this.base = new URL(config.base || base, parent?.base || document.baseURI).href;
        config.prefetch && this.resolve();
    }
    fetch (paths) {
        if (!paths.length) { return this; }
        const path = paths.shift(), moduleProfile = this.fetchChild(path);
        return moduleProfile.fetch(paths);
    }
    fetchChild (name) {
        return this.children?.find(child => Object.is(child.name, name) && child.valid);
    }
    fetchViewModule (name) {
        return this.fetchChild(name) || this.parent.fetchChild(name);
    }
    resolve (childNameSet = null) {
        const { type } = this;
        if (!Object.is(this.state, 'unresolved')) {
            if (childNameSet) { // rootNamespace
                this.promise = new Promise(resolver => (this.resolver = resolver));
            } else {
                if (this.valid && Object.is(this.state, 'resolved')) {
                    if (Object.is(type, moduleType.style)) {
                        originalSetAdd.call(styleModuleSet, this.module);
                    } else if (Object.is(type, moduleType.namespace)) {
                        forEach(this.children, child => child.resolve());
                    }
                }
                return this.promise;
            }
        }
        this.state = 'resolving';
        let pipeline = null;
        if (this.content == null) {
            pipeline = [...this.URIs.map(uri => {
                return (data, token) => (token.stop = !!data) || this.resolveURI(uri);
            }), moduleProfile => moduleProfile || (this.valid = false) || this.resolved(null)];
        } else {
            const { content } = this;
            if ([moduleType.namespace, moduleType.json].includes(type)) {
                pipeline = [Object.is(type, moduleType.namespace) ? this.resolveNamespace(content, this.base, childNameSet) : content];
            } else {
                pipeline = [this.resolveContent(content)];
            }
            pipeline = [...pipeline, resolvedContent => this.resolveModule(resolvedContent), module => this.resolved(module)];
        }
        promisor.then(() => serializer(pipeline));
        return this.promise;
    }
    resolveCachedModuleProfile (moduleProfile) {
        this.type || (this.type = moduleProfile.type);
        return moduleProfile.resolvedContent;
    }
    resolveContent (content) {
        isString(content) || (content = originalStringifyMethod(content));
        this.content = content.trim();
        const { type } = this;
        if (Object.is(type, moduleType.namespace)) {
            this.baseElement = templateResolver(content);
            return serializer([configResolver(this.baseElement, this.base), ({ base, content }) => this.resolveNamespace(content, base)]);
        } else if (Object.is(type, moduleType.script)) {
            return import(`data:text/javascript, ${ encodeURIComponent(content.replace(relativePathRegExp, (match, url1, url2) => match.replace(url1 || url2, new URL(url1 || url2, this.base)))) }`);
        } else if (Object.is(type, moduleType.view)) {
            const fragment = templateResolver(content);
            selectorInjector(fragment, this.parent.tags);
            const nodeProfile = new NodeProfile(fragment, this.parent, null, null, false, {});
            return Promise.all(nodeProfile.promises || []).then(() => nodeProfile);
        } else if (Object.is(type, moduleType.style)) {
            return styleResolver(content, `${ this.path }-template`, true);
        } else if (Object.is(type, moduleType.json)) {
            return JSON.parse(content);
        } else if (Object.is(type, moduleType.string)) {
            return this.content;
        }
    }
    resolved (module) {
        this.module = module;
        this.state = 'resolved';
        this.resolver(this);
        return this;
    }
    resolveEmbeddedType (element) {
        if (this.type) { return; }
        const { tagName, type } = element;
        if (Object.is(tagName, 'TEMPLATE')) {
            this.type = moduleType.view;
        } else if (Object.is(tagName, 'STYLE') && Object.is(type, embeddedType.style)) {
            this.type = moduleType.style;
        } else if (Object.is(tagName, 'SCRIPT')) {
            if (Object.is(type, embeddedType.namespace)) {
                this.type = moduleType.namespace;
                return this.resolveNamespace(functionResolver(element.innerHTML), element.getAttribute('base') || this.base);
            } else if (Object.is(type, embeddedType.script)) {
                this.type = moduleType.script;
            } else if (Object.is(type, embeddedType.json)) {
                this.type = moduleType.json;
            } else if (Object.is(type, embeddedType.string)) {
                this.type = moduleType.string;
            }
        }
    }
    resolveModule (resolvedContent) {
        this.resolvedContent = resolvedContent;
        let module = resolvedContent;
        const { type } = this;
        if (Object.is(type, moduleType.namespace)) {
            module = this.module;
            this.children || (this.children = resolvedContent);
            this.config.explicit && (this.config.anonymous ? Object.assign(this.parent.module, module) : (this.parent.module[this.name] = module));
            this.parent && this.parent.resolve().then(moduleProfile => Object.setPrototypeOf(module, moduleProfile.module));
        } else if (Object.is(type, moduleType.script)) {
            module = scriptModuleResolver(module, emptier());
            Object.is(this.config.anonymous, false) ? (this.parent.module[this.name] = module) : Object.assign(this.parent.module, module);
        } else if (Object.is(type, moduleType.style)) {
            if (!Object.is(this.config.scoped, false)) {
                const style = styleResolver('', this.path, true), sheet = style.sheet, iterator = { index: 0 }, tag = this.parent.path.replace(/\./g, '__');
                tag ? forEach(module.sheet.cssRules, rule => scopedRuleResolver(sheet, rule, tag, iterator)) : (style.textContent = module.textContent);
                style.setAttribute('based', `${ this.path }-template`);
                module = style;
            }
            originalSetAdd.call(styleModuleSet, module);
        } else if (Object.is(type, moduleType.json)) {
            this.config.anonymous ? Object.assign(this.parent.module, module) : (this.parent.module[this.name] = module);
        } else if (Object.is(type, moduleType.string)) {
            this.parent.module[this.name] = module;
        }
        return module;
    }
    resolveNamespace (config, base, childNameSet = null) {
        this.parent && moduleConfigNormalizer(config);
        this.children || (this.children = Object.entries(config).map(([name, config]) => new ModuleProfile(config, base, name, this)));
        this.module = this.module || emptier();
        return Promise.all((childNameSet ? this.children.filter(child => childNameSet.has(child.name)) : this.children).map(child => child.resolve()));
    }
    resolveRemoteType (content, type, url) {
        this.base = url;
        if (this.type) { return; }
        if (url.endsWith('.js') || url.endsWith('.mjs') || mimeType.script.some(scriptType => type.includes(scriptType))) {
            this.type = moduleType.script;
        } else if (url.endsWith('.css') || type.includes(mimeType.style)) {
            this.type = moduleType.style;
        } else if (url.endsWith('.html') || type.includes(mimeType.html)) {
            content = content.trim();
            this.type = (content.startsWith('<html>') || content.startsWith('<!DOCTYPE ')) ? moduleType.namespace : moduleType.view;
        } else if (url.endsWith('.json') || type.includes(mimeType.json)) {
            this.type = moduleType.json;
        } else {
            this.type = moduleType.string;
        }
    }
    resolveURI (uri) {
        uri = uri.trim();
        if (!uri) { return; }
        let pipeline = null;
        if (remoteUrlRegExp.test(uri)) {
            const cachedProfile = integrityProfileCache[this.integrity];
            if (cachedProfile) {
                pipeline = [cachedProfile.resolve(), moduleProfile => this.resolveCachedModuleProfile(moduleProfile)];
            } else {
                this.integrity && (integrityProfileCache[this.integrity] = this);
                const base = new URL(uri, this.base).href;
                pipeline = [(_, token) => serializer([remoteResourceResolver(base, this.integrity), result => result || (token.stop = true)]), ({ content, type }) => this.resolveRemoteType(content, type, base) || this.resolveContent(content)];
            }
        } else if (moduleNameRegExp.test(uri)) { // alias
            pipeline = [this.parent.fetch(uri, true), moduleProfile => this.resolveCachedModuleProfile(moduleProfile)];
        } else { // selector
            const element = querySelector(this.baseElement, uri), cachedProfile = elementProfileCacheMap.get(element);
            if (!element) {
                return (this.valid = false) || this.resolved(null);
            }
            if (cachedProfile) {
                pipeline = [cachedProfile.resolve(), moduleProfile => this.resolveCachedModuleProfile(moduleProfile)];
            } else {
                originalMapSet.call(elementProfileCacheMap, element, this);
                pipeline = [this.resolveEmbeddedType(element) || this.resolveContent(element.innerHTML)];
            }
        }
        return pipeline && serializer([...pipeline, resolvedContent => this.resolveModule(resolvedContent), module => this.resolved(module)]);
    }
}) => ModuleProfile)(), NodeContext = ((dataUpdater = {
    file: node => (node.multiple ? [...node.files] : node.files[0]) || null,
    focus: node => node.isSameNode(document.activeElement),
    result: ((processor = (file, { buffer, data, encoding }) => {
        let result = { file, loaded: 0, progress: 0, state: 'initialized', content: null };
        const fileReader = new FileReader();
        fileReader.onloadstart = () => (result = (result && result[meta] && [...result[meta]][0].value) || result, result.state = 'loading');
        fileReader.onprogress = ({ loaded }) => (result.loaded = loaded, result.progress = Math.floor(loaded / file.size * 100));
        fileReader.onload = () => (result.state = 'loaded', result.content = fileReader.result);
        fileReader.onerror = () => (result.state = 'error');
        fileReader.onabort = () => (result.state = 'abort');
        if (buffer) {
            fileReader.readAsArrayBuffer(file);
        } else if (data) {
            fileReader.readAsDataURL(file);
        } else {
            fileReader.readAsText(file, encoding || 'utf-8');
        }
        return result;
    }) => (node, decorators) => node.multiple ? [...node.files].map(file => processor(file, decorators)) : processor(node.files[0], decorators))(),
    value: ({ tagName, type, value, valueAsNumber, multiple, selectedOptions }, { number, trim, raw }, { detail }) => {
        if (Object.is(detail, true)) { return null; }
        if (['INPUT', 'SL-INPUT'].includes(tagName)) {
            if (raw) { return value; }
            if (['date', 'datetime-local'].includes(type)) { return new Date(valueAsNumber || 0); }
            if (['number', 'range'].includes(type)) { return valueAsNumber; }
            if (number) { return Number.parseFloat(value); }
        } else if (Object.is(tagName, 'SELECT')) { // 'SL-SELECT'
            value = multiple ? [...(selectedOptions || [])].map(node => valueResolver(node)) : valueResolver(selectedOptions?.[0]);
        }
        return trim && isString(value) ? value.trim() : value;
    }
}, nameFilters = ['draggable'], targetOnlyEventNames = hashTableResolver('blur', 'focus', 'mouseenter', 'mouseleave', 'resize', 'scroll', 'error', 'select'), generalUpdater = (data, node, _, { name }) => {
    if (isShoelace(node.tagName) && isObject(data)) {
        node[attributeNameResolver(name)] = data;
    } else {
        (data == null) ? node.removeAttribute(name) : node.setAttribute(name, textResolver(data));
    }
}, nodeUpdater = {
    $boolean: (data, node, _, { name }) => node.toggleAttribute(name, !!data),
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
                forEach(data, className => originalSetAdd.call(classNameSet, textResolver(className)));
            } else if (isObject(data)) {
                forEach(Object.keys(data), key => data[key] && originalSetAdd.call(classNameSet, key.trim()));
            } else {
                originalSetAdd.call(classNameSet, textResolver(data));
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
        forEach(entries, ([key, value], index) => sliceResolver(index, key, value, children, childrenMap, newChildrenMap, indexName, keyName, itemName, nodeContext, profile, parentNode));
        children.length = entries.length;
        childrenMap.forEach(array => forEach(array, nodeContext => (nodeContext.parent = null, nodeContext.destructor(true))));
        nodeContext.childrenMap = newChildrenMap;
    })(),
    exist: (data, _, nodeContext) => data ? (Object.is(nodeContext.state, 'unloaded') && nodeContext.loading()) : nodeContext.unloading(true),
    file: () => {},
    focus: (data, node, _, { decorators: { prevent = false } }) => data ? node.focus({ preventScroll: prevent }) : node.blur(),
    html: (data, node, nodeContext, { decorators: { root = false, strict = false } }) => {
        data = textResolver(data);
        nodeContext.removeChildren(true);
        if (!data) { return; }
        !strict && moduleNameRegExp.test(data) && (data = `<${ data }></${ data }>`);
        const rootNodeProfiles = [], profile = nodeContext.profile, fragment = templateResolver(data);
        if (!node) {
            const tags = profile.node.$tags;
            tags && selectorInjector(fragment, tags);
        }
        Reflect.construct(NodeProfile, [fragment, root ? rootNamespace : profile.namespace, rootNodeProfiles, null, true]);
        if (rootNodeProfiles.length) {
            processorResolver();
            Promise.all(rootNodeProfiles.map(nodeProfile => Promise.all(nodeProfile.promises || []))).then(() => forEach(rootNodeProfiles, (nodeProfile, index) => nodeContext.profile && Reflect.construct(NodeContext, [nodeProfile, root ? null : nodeContext, index, null, (nodeProfile.landmark || nodeProfile.node).parentNode])));
        }
        node ? node.appendChild(fragment) : nodeContext.parentNode.insertBefore(fragment, nodeContext.landmark);
    },
    result: (data, node) => {
        if (!(Object.is(node.tagName, 'INPUT') && Object.is(node.type, 'file'))) {
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
        resolvedStyles[key] = value;
    }) => (data, node, { profile: { inlineStyle, styles } }) => {
        if (data) {
            const resolvedStyles = Object.assign({}, styles);
            if (Array.isArray(data)) {
                forEach(data, item => styleUpdater(resolvedStyles, textResolver(item)));
            } else if (isObject(data)) {
                forEach(Object.keys(data), key => (resolvedStyles[key.trim()] = textResolver(data[key])));
            } else {
                forEach(textResolver(data).split(';'), item => styleUpdater(resolvedStyles, item.trim()));
            }
            node.style.cssText = Object.keys(resolvedStyles).filter(key => resolvedStyles[key]).map(key => `${ key }: ${ resolvedStyles[key] }; `).join('').trim();
        } else {
            inlineStyle ? node.setAttribute('style', inlineStyle) : node.removeAttribute('style');
        }
    })(),
    text: (data, node) => {
        data = textResolver(data);
        Object.is(data, node.textContent) || (node.textContent = data);
    },
    value: ((timeNormalizer = (data, padLength = 2) => String(data).padStart(padLength, '0')) => (data, node, nodeContext, { decorators: { trim = false } }) => {
        trim && (data = textResolver(data, trim));
        nodeContext.value = data;
        let fieldName = 'value';
        const { tagName, type } = node;
        if (Object.is(tagName, 'INPUT')) {
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
                data = textResolver(data, trim);
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
                data = textResolver(data, trim);
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
            const isSlSelect = Object.is(tagName, 'SL-SELECT');
            forEach(isSlSelect ? node.getAllOptions?.() : node.children, option => {
                const value = valueResolver(option);
                option.selected = multiple ? data.includes(value) : Object.is(data, value);
            });
            if (isSlSelect) {
                multiple || node.selectionChanged?.();
            } else {
                return;
            }
        } else if (Object.is(tagName, 'SL-RADIO-GROUP')) {
            forEach(node.children, radio => {
                radio.checked = Object.is(data, valueResolver(radio));
            });
        } else {
            return generalUpdater(data, node, null, { name: 'value' });
        }
        node[fieldName] = data;
    })()
}, modifierResolver = ((resolver = (event, modifier) => {
    modifier = String(modifier);
    const positive = !modifier.startsWith('!');
    positive || (modifier = modifier.substring(1));
    const modifierRegExp = new RegExp(modifier), result = (event.getModifierState && event.getModifierState(modifier)) || [event.code, event.key, event.button].some(value => modifierRegExp.test(value));
    return positive == result;
}) => (event, modifiers, methodName) => (!modifiers || (modifiers = arrayWrapper(modifiers), modifiers[methodName](modifier => resolver(event, modifier)))))(), directivesRemover = (targetNames, directives, callback) => directives && forEach(directives.filter((directive, index) => directive && (directive.index = index, directive.decorators && targetNames.includes(directive.decorators.name))).reverse(), directive => callback(directive) || directives.splice(directive.index, 1)), eventHandlerRemover = ({ target, event, handler, options, listener, observer }) => {
    if (observer) {
        observer.disconnect();
    } else if (listener) {
        originalSetDelete.call(target.$eventListenerMap[event], listener);
    } else {
        target.removeEventListener(event, handler, options);
    }
}, valueResolver = node => node && Reflect.has(node[context] || {}, 'value') ? node[context].value : node.value, NodeContext = class {
    constructor (profile, parent = null, index = 0, sliceScope = null, parentNode = null) {
        const { directives, dynamic, namespace, node, landmark, plain, text, html, raw } = profile;
        this.directives = directives, this.profile = profile, this.index = index, this.state = 'loaded', this.parent = this.children = this.childrenMap = this.existController = this.landmark = this.upperBoundary = this.childrenController = this.controller = this.controllers = this.eventHandlers = this.scope = this.sentry = this.node = null;
        if (parent) {
            this.parent = parent;
            this.parentNode = parentNode || parent.node || parent.parentNode;
            this.scope = parent.scope;
            parent.children.splice(index, 0, this);
        } else {
            this.parentNode = node.parentNode || landmark.parentNode;
            this.scope = rootScope;
        }
        this.module = namespace.module;
        if (html) {
            return this.loading();
        }
        if (raw || plain) { // comment/raw/script/style/view
            this.resolveNode();
            this.node.removeAttribute && this.node.removeAttribute('dg-cloak');
            plain && this.resolveChildren();
        } else if (text) {
            this.resolveNode(() => (this.controller = this.resolveController(text)));
        } else {
            const each = this.directives?.each;
            (each || profile.virtual) && this.resolveLandmark(sliceScope);
            if (sliceScope) {
                const { plain, root } = each.decorators;
                this.sliceScope = this.resolveScope(sliceScope, plain, root);
                (parent.children.length > index + 1) && forEach(parent.children, (sibling, siblingIndex) => sibling && (siblingIndex > index) && (sibling.index++));
            } else {
                profile.slotScope && (this.slotScope = this.resolveScope(Object.assign({}, profile.slotScope), true));
                if (each) {
                    this.children = [], this.childrenMap = new Map, this.controller = this.resolveController(each);
                    return this;
                }
            }
            if (dynamic) {
                const expressions = dynamic.processor(this.module, this.scope, this.parentNode), directives = this.directives;
                this.directives = Object.assign({}, directives, { controllers: [...(directives.controllers || [])], eventHandlers: [...(directives.eventHandlers || [])] });
                forEach(arrayWrapper(expressions), expression => {
                    if (isString(expression)) {
                        const index = expression.indexOf('='), withoutValue = index < 0;
                        expression = withoutValue ? { name: expression, value: '' } : { name: expression.substring(0, index), value: expression.substring(index + 1) };
                    }
                    profile.resolveDirective(expression.name.trim(), expression.value, this.directives);
                });
                processorResolver();
            }
            const exist = this.directives?.exist;
            if (exist) {
                this.lanmark || this.resolveLandmark(sliceScope);
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
                this.landmark && this.landmark.remove();
                this.upperBoundary && this.upperBoundary.remove();
            }
            this.existController && this.removeController(this.existController);
            const siblings = this.parent?.children;
            if (isRoot && siblings) {
                forEach(siblings, (sibling, siblingIndex) => (siblingIndex > this.index) && (sibling.index--));
                siblings.splice(this.index, 1);
            }
        }
        forEach(Reflect.ownKeys(this), key => { this[key] = null; });
    }
    initialize () {
        const { html, virtual } = this.profile;
        html ? (this.node = html) : (virtual || this.resolveNode());
        const loaded = this.directives?.loaded;
        this.resolvePromise(loaded && loaded.processor(this.module, this.scope, this.node), () => this.postLoaded());
        html || this.resolveChildren();
    }
    loading () {
        this.state = 'loading';
        const load = this.directives?.load;
        if (!load) { return this.initialize(); }
        const { init, plain, root } = load.decorators;
        this.resolvePromise(load.processor(this.module, root ? rootScope : this.scope, null), scope => {
            if (!Object.is(this.state, 'loading')) { return; }
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
        this.node && this.node.removeAttribute('dg-cloak');
        if (rootScopeCallback) {
            rootScopeCallback(this.scope);
            rootScopeCallback = null;
        } else if (this.directives) {
            const { controllers, eventHandlers, sentry } = this.directives;
            if (sentry) {
                this.sentry = Object.assign({}, sentry, { owner: this, processor: sentry.processor.bind(null, this.module, this.scope) });
                originalSetAdd.call(sentrySet, this.sentry);
            }
            eventHandlers && (this.eventHandlers = eventHandlers.map(({ event, decorators = {}, processor, name }) => {
                const { capture, outside, once, passive, target, undelegate } = decorators, resolvedTarget = target ? (window[target] || querySelector(document, target)) : this.node, currentTarget = outside ? window : resolvedTarget, handler = event => this.updateEventHandler(event, name, processor.bind(null, this.module, this.scope), decorators, resolvedTarget);
                if (observerEventHandlerNames[event]) {
                    let constructor = null;
                    const options = {};
                    if (Object.is(event, 'observe-intersection')) { // IntersectionObserver
                        const { root, margin, threshold } = decorators;
                        root && (options.root = window[root] || querySelector(document, root));
                        margin && (options.rootMargin = margin);
                        threshold && (options.threshold = threshold);
                        constructor = IntersectionObserver;
                    } else if (Object.is(event, 'observe-mutation')) { // MutationObserver
                        const { attributes, childlist, subtree } = decorators;
                        attributes && (options.attributes = true);
                        childlist && (options.childList = true);
                        subtree && (options.subtree = true);
                        constructor = MutationObserver;
                    } else if (Object.is(event, 'observe-resize')) { // ResizeObserver
                        constructor = ResizeObserver;
                    }
                    const observer = new constructor(entries => processor(this.module, this.scope, this.node, entries), options);
                    observer.observe(resolvedTarget);
                    return { target: currentTarget, event, observer, options };
                } else if (once || passive || undelegate || targetOnlyEventNames[event]) {
                    const options = { capture, once, passive };
                    currentTarget.addEventListener(event, handler, options);
                    return { target: currentTarget, event, handler, options };
                } else { // use event delegate
                    const listener = { decorators, handler };
                    eventDelegator(event, currentTarget, listener, capture);
                    return { target: currentTarget, event, decorators, listener };
                }
            }));
            controllers && (this.controllers = controllers.map(controller => this.resolveController(controller)).filter(controller => controller));
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
        controller.observer && controller.observer.disconnect();
        Object.is(controller, this.childrenController) && (this.childrenController = null);
        Object.is(controller, this.existController) && (this.existController = null);
    }
    removeDirectives (data, targetNames) { // TODO: assert
        if (!data) { return; }
        targetNames = arrayWrapper(targetNames);
        directivesRemover(targetNames, [...this.controllers, this.childrenController, this.existController], controller => this.removeController(controller));
        directivesRemover(targetNames, this.eventHandlers, eventHandlerRemover);
    }
    resolveChildren () {
        const { children } = this.profile, child = this.directives?.child;
        !this.children && (children || (child && Object.is(child.name, 'html'))) && (this.children = []);
        child ? (this.childrenController = this.resolveController(child)) : forEach(children, (child, index) => new NodeContext(child, this, index));
    }
    resolveController ({ name, decorators = {}, processor }) {
        const { node } = this, subscribable = !decorators.once || decorators.lazy, controller = {
            name,
            owner: this,
            decorators,
            processor: processor.bind(null, this.module, this.scope),
            topologySet: subscribable ? new Set : null,
            observer: null,
            updater: name && (nodeUpdater[name] || (node && ((decorators.bool || (!nameFilters.includes(name) && Object.is(typeof node[attributeNameResolver(name)], 'boolean'))) && nodeUpdater.$boolean)) || generalUpdater)
        };
        subscribable && node && Object.is(name, 'value') && ['SELECT', 'SL-SELECT'].includes(node.tagName) && (controller.observer = new MutationObserver(() => this.updateController(controller, true))).observe(node, { childList: true });
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
            this.landmark = parentNode.insertBefore(textNode.cloneNode(false), baseLandmark);
        } else {
            this.landmark = landmark;
        }
        (virtual || this.directives?.each) && (this.upperBoundary = parentNode.insertBefore(textNode.cloneNode(false), this.landmark));
    }
    resolveNode (callback) {
        const { node: baseNode, unique, raw } = this.profile, node = unique ? baseNode : baseNode.cloneNode(raw);
        this.node = node;
        node[context] = this;
        callback && callback();
        if (!node.isConnected) {
            const landmark = this.landmark || (this.parent && (this.parent.node ? null : this.parent.landmark));
            this.parentNode.insertBefore(node, landmark && Object.is(this.parentNode, landmark.parentNode) ? landmark : null);
        }
    }
    resolvePromise (promise, callback) {
        isPromise(promise) ? promise.then(callback) : callback(promise);
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
        plain || (scope = proxyResolver(scope));
        this.scope = Object.setPrototypeOf(scope, root ? rootScope : this.scope);
        return scope;
    }
    unloading (isRoot) {
        if (Object.is(this.state, 'unloaded')) { return; }
        this.controller && (this.removeController(this.controller) || (this.controller = null));
        if (this.profile.text) {
            this.state = 'unloaded';
        } else {
            this.state = 'unloading';
            if (this.profile.plain || this.childrenMap) { return this.removeChildren(isRoot); }
            this.childrenController && this.removeController(this.childrenController);
            forEach(this.controllers, controller => this.removeController(controller)) || (this.controllers = null);
            forEach(this.eventHandlers, eventHandlerRemover) || (this.eventHandlers = null) || (this.node && (this.node.$eventListenerMap = null));
            if (this.sentry) {
                originalSetDelete.call(sentrySet, this.sentry);
                this.sentry = null;
            }
            const unload = this.directives?.unload;
            unload && unload.processor(this.module, this.scope, this.node);
            const { node } = this;
            isRoot && node && node.remove();
            this.node = null;
            this.removeChildren(isRoot);
            this.scope = this.sliceScope || this.parent?.scope || rootScope;
            const unloaded = this.directives?.unloaded;
            unloaded && unloaded.processor(this.module, this.scope, null);
            this.state = 'unloaded';
        }
    }
    updateEventHandler (event, name, processor, decorators, bindingTarget) {
        if (!name) {
            const { on, inside, outside, every, some, prevent, stop, stopImmediate } = decorators, { type, target, currentTarget } = event, isCurrent = Object.is(target, currentTarget);
            if (!((!(on || inside || outside) || (outside && bindingTarget.contains && !bindingTarget.contains(target)) || (on && isCurrent) || (inside && (!currentTarget.contains || (currentTarget.contains(target) && !isCurrent)))) && modifierResolver(event, every, 'every') && modifierResolver(event, some, 'some'))) { return; }
            prevent && ([true, 'prevent'].includes(prevent) || arrayWrapper(prevent).some(source => Object.is(event.detail?.source, source))) && event.preventDefault();
            stop && event.stopPropagation();
            stopImmediate && event.stopImmediatePropagation();
        }
        const suspendedController = currentController, remove = decorators.remove;
        currentController = null;
        const data = processor(this.node, name ? (dataUpdater[name] ? dataUpdater[name](this.node, decorators, event) : this.node[name]) : event);
        remove && (isPromise(data) ? data.then(data => this.removeDirectives(data, remove)) : this.removeDirectives(data, remove));
        currentController = suspendedController;
    }
}) => {
    NodeContext.prototype.updateController = ((queueingControllerSet = new Set, processor = (nodeContext, controller, force) => {
        if (!nodeContext.profile) { return; }
        const { decorators: { once, remove, route, lazy }, topologySet, updater, name } = controller, subscribable = !once || lazy;
        if (force || (topologySet && [...topologySet].some(topology => !Object.is(topology.oldValue, topology.value)))) {
            if (topologySet && topologySet.size) {
                topologySet.forEach(topology => topology.unsubscribe(controller)); // TODO: optimize with cache
                originalSetClear.call(topologySet);
            }
            const suspendedController = currentController;
            currentController = subscribable ? controller : null;
            const data = controller.processor(nodeContext.node);
            subscribable && route && routerTopology.subscribe();
            currentController = suspendedController;
            if (lazy && !name) { // lazy watch
                controller.processor = data;
                controller.decorators.lazy = false;
            } else if (isPromise(data)) {
                data.then(data => (remove && nodeContext.removeDirectives(data, remove), updater && updater(data, nodeContext.node, nodeContext, controller)));
            } else {
                remove && nodeContext.removeDirectives(data, remove);
                updater && updater(data, nodeContext.node, nodeContext, controller);
            }
        }
    }) => function (controller, force) {
        if (!queueingControllerSet.has(controller)) {
            originalSetAdd.call(queueingControllerSet, controller);
            promisor.then(() => {
                originalSetDelete.call(queueingControllerSet, controller);
                processor(this, controller, force);
            });
        }
    })();
    return NodeContext;
})(), NodeProfile = ((directiveType = { '*': 'controller', '+': 'event' }, lifeCycleDirectiveNames = hashTableResolver('load', 'loaded', 'sentry', 'unload', 'unloaded'), rawElementNames = hashTableResolver('STYLE', 'SCRIPT'), twoWayDataBindingTable = ((slChange = ['sl-change'], slUpdate = ['sl-change', 'sl-input'], slFocus = ['sl-blur', 'sl-focus'], slShow = ['sl-show', 'sl-hide']) => ({
    'INPUT': {
        checked: { checkbox: true, radio: true },
        focus: { '*': true },
        value: { '*': true }, // TODO: assert for file type
        file: { file: true },
        result: { file: true }
    },
    'OPTION': { selected: daggerChangeEventName },
    'SELECT': { value: true },
    'TEXTAREA': { focus: true, value: true },
    'SL-ALERT': { open: slShow },
    'SL-ANIMATION': { play: ['sl-start', 'sl-finish', 'sl-cancel'] },
    // 'SL-ANIMATED-IMAGE': { play: true },
    'SL-BUTTON': { focus: slFocus },
    'SL-CHECKBOX': { checked: slChange, indeterminate: slChange, focus: slFocus },
    'SL-COLOR-PICKER': { value: slUpdate, format: slUpdate, focus: slFocus },
    'SL-DETAILS': { open: slShow },
    'SL-DIALOG': { open: slShow },
    'SL-DRAWER': { open: slShow },
    'SL-DROPDOWN': { open: slShow },
    'SL-ICON-BUTTON': { focus: slFocus },
    'SL-IMAGE-COMPARER': { position: slChange },
    'SL-INPUT': { value: slUpdate },
    'SL-SELECT': { value: slChange, focus: slFocus, open: slShow },
    'SL-RADIO': { focus: slFocus },
    'SL-RADIO-BUTTON': { focus: slFocus },
    'SL-RADIO-GROUP': { value: slChange },
    'SL-RANGE': { value: slUpdate, focus: slFocus },
    'SL-RATING': { value: slChange },
    'SL-SPLIT-PANEL': { position: ['sl-reposition'] },
    'SL-SWITCH': { checked: slChange, focus: slFocus },
    'SL-TEXTAREA': { value: slUpdate },
    'SL-TOOLTIP': { open: slShow },
    'SL-TREE-ITEM': { expanded: ['sl-expand', 'sl-collapse'] } // selected
}))(), dataBinder = (directives, value, fields, event) => directives.eventHandlers.push(directiveResolver(`Object.is(${ value }, _$data_) || (${ value } = _$data_)`, Object.assign({ event }, fields), '$node, _$data_')), directiveResolver = ((baseSignature = '$module, $scope') => (expression, fields = {}, signature = '$node') => {
    expression = `${ signature ? `(${ baseSignature }, ${ signature })` : `(${ baseSignature })` } => { with ($module) with ($scope) return (() => { 'use strict';\n return ${ expression }; })(); }`;
    const processor = processorCaches[expression], directive = Object.assign({}, fields, { processor: processor || expression });
    processor || directiveQueue.push(directive);
    return directive;
})(), NodeProfile = class {
    constructor (node, namespace = rootNamespace, rootNodeProfiles = null, parent = null, unique = false, defaultSlotScope = null) {
        this.node = node, this.namespace = namespace, this.unique = unique, this.defaultSlotScope = defaultSlotScope || parent?.defaultSlotScope || null, this.dynamic = this.plain = this.raw = this.virtual = false, this.text = this.inlineStyle = this.styles = this.directives = this.landmark = this.children = this.classNames = this.html = this.slotScope = this.moduleProfile = null;
        const type = node.nodeType;
        if (Object.is(type, Node.TEXT_NODE)) {
            const resolvedTextContent = node.textContent.trim();
            if (!resolvedTextContent) { return; }
            if (resolvedTextContent.includes('${') && resolvedTextContent.includes('}')) {
                rootNodeProfiles && rootNodeProfiles.push(this);
                this.text = directiveResolver(`\`${ resolvedTextContent }\``, { name: 'text' }, ''), this.promises = [], this.node = this.resolveLandmark(node);
            } else {
                this.raw = true;
            }
            parent.children.push(this);
        } else if (Object.is(type, Node.ELEMENT_NODE)) {
            this.promises = [];
            const cloak = 'dg-cloak', { attributes, tagName } = node, rawDirective = '@raw', raw = attributes[rawDirective];
            this.html = node.isSameNode(document.documentElement) && node, this.raw = !!(raw || rawElementNames[tagName]);
            if (this.raw) {
                raw && node.removeAttribute(rawDirective);
                rootNodeProfiles && node.removeAttribute(cloak);
            } else {
                const controllers = [], eventHandlers = [], directives = { controllers, eventHandlers }, name = tagName.includes('__') ? tagName.toLowerCase().replace(/__[a-z]/g, string => string[2].toUpperCase()) : tagName.toLowerCase(), moduleProfile = Object.is(node.constructor, HTMLUnknownElement) && namespace.fetchViewModule(name.split('.')[0]), resolved = Object.is(moduleProfile.state, 'resolved'), dynamicDirective = '@directive', dynamic = attributes[dynamicDirective], slotDirective = '@slot';
                if (moduleProfile) {
                    this.virtual = true;
                    this.resolveLandmark(node);
                }
                if (moduleProfile && !resolved) {
                    this.resolveDirective('*html', `\`${ node.outerHTML.replace(/`/g, '\\`').replace(/\${/g, '\\${') }\``, directives);
                    this.directives = directives;
                } else {
                    if (node.hasAttribute(slotDirective)) {
                        const slotValue = node.getAttribute(slotDirective).trim(), slotName = `_$slot_${ slotValue }`;
                        node.removeAttribute(slotDirective);
                        if (this.defaultSlotScope) {
                            this.defaultSlotScope[slotName] = node.innerHTML;
                            node.removeAttribute('*html');
                            node.removeAttribute('*text');
                            this.resolveDirective('*html#strict', slotName, directives);
                        }
                    }
                    forEach([...attributes], ({ name, value }) => this.resolveDirective(name, value, directives));
                    if (dynamic) {
                        this.directives = directives, this.dynamic = directiveResolver(dynamic.value);
                        node.removeAttribute(dynamicDirective);
                    } else {
                        controllers.length || (directives.controllers = null);
                        eventHandlers.length || (directives.eventHandlers = null);
                        (directives.controllers || directives.eventHandlers || (Object.values(directives).length > 2)) && (this.directives = directives);
                    }
                    if (this.html) { return processorResolver(); }
                    this.plain = !(this.directives || this.landmark);
                }
                rootNodeProfiles && (this.plain ? (node.hasAttribute(cloak) && forEach(node.children, child => child.setAttribute(cloak, '')) || node.removeAttribute(cloak)) : (rootNodeProfiles.push(this) && (rootNodeProfiles = null)));
                if (moduleProfile) {
                    resolved && this.resolveViewModule(moduleProfile.fetch(name.split('.').slice(1)));
                } else {
                    if (Object.is(name, 'template')) {
                        if (this.plain) {
                            (this.raw = true) && (this.plain = false);
                        } else {
                            this.virtual = true;
                            this.resolveLandmark(node);
                        }
                    }
                    this.raw || directives.child || this.resolveChildren(node, rootNodeProfiles);
                }
            }
            if (parent) {
                parent.children.push(this);
                this.promises.length && parent.promises.push(Promise.all(this.promises));
            }
        } else if (Object.is(type, Node.DOCUMENT_FRAGMENT_NODE)) {
            this.promises = [];
            this.resolveChildren(node, rootNodeProfiles);
        } else if (Object.is(type, Node.COMMENT_NODE)) {
            this.raw = true;
        }
    }
    resolveChildren (node, rootNodeProfiles) {
        const { childNodes } = this.virtual ? node.content : node;
        if (childNodes.length) {
            this.children = [];
            forEach(childNodes, childNode => Reflect.construct(NodeProfile, [childNode, this.namespace, rootNodeProfiles, this, !!this.unique]));
            this.plain && this.children.every(child => child.raw) && (this.raw = true) && (this.plain = false);
        } else if (this.plain) {
            (this.raw = true) && (this.plain = false);
        }
        this.raw && (this.children = null);
        return this;
    }
    resolveDirective (attributeName, value, directives) {
        const resolvedType = directiveType[attributeName[0]];
        if (!resolvedType) { return; }
        const { node } = this;
        node.removeAttribute(attributeName);
        const [name, ...rawDecorators] = attributeName.substring(1).split('#'), decorators = emptier(), fields = { decorators };
        forEach(rawDecorators.filter(decorator => decorator), decorator => {
            const [name, value] = decorator.split(':').map(content => decodeURIComponent(attributeNameResolver(content)).trim());
            try {
                decorators[name] = value ? JSON.parse(value) : name;
            } catch (error) {
                decorators[name] = value;
            }
        });
        if (Object.is(resolvedType, 'event')) {
            fields.event = name;
            if (lifeCycleDirectiveNames[name]) {
                directives[name] = directiveResolver(value, fields, Object.is(name, 'sentry') ? '$nextRoute' : '$node');
            } else {
                directives.eventHandlers.push(directiveResolver(value, fields, observerEventHandlerNames[name] ? '$node, $entries' : '$node, $event'));
            }
        } else {
            value || (value = attributeNameResolver(name)); // shorthand
            if (Object.is(name, 'watch')) {
                decorators.lazy && (value = `${ value.substring(value.indexOf('(') + 1, value.indexOf(')')).trim() || 'null' }, $node => { 'use strict';\n ${ decorators.debug ? 'debugger;\n\r' : '' }return ${ value }; }`);
            } else {
                fields.name = name;
            }
            const directive = directiveResolver(value, fields);
            if (Object.is(name, 'each')) {
                directives.each = directive;
                this.resolveLandmark(node);
                this.unique = false;
            } else if (Object.is(name, 'exist')) {
                directives.exist = directive;
                this.resolveLandmark(node);
                this.unique = false;
            } else if (Object.is(name, 'html') || Object.is(name, 'text')) {
                directives.child = directive;
            } else {
                if (Object.is(name, 'class')) {
                    this.classNames || (node.classList.length && (this.classNames = [...node.classList].map(className => className.trim())));
                } else if (Object.is(name, 'style')) {
                    if (!this.styles) {
                        const { style } = node, styleKeys = [...style];
                        if (styleKeys.length) {
                            this.inlineStyle = node.getAttribute('style');
                            this.styles = emptier();
                            forEach(styleKeys, key => {
                                const value = style[key], priority = style.getPropertyPriority(key);
                                this.styles[key] = priority ? `${ value } !${ priority }` : value;
                            });
                        }
                    }
                } else if (!decorators.oneway) { // validate two-way data binding
                    const { tagName } = node, { change } = decorators, directiveNameTable = twoWayDataBindingTable[tagName];
                    if (directiveNameTable) {
                        const table = directiveNameTable[name];
                        if (table) {
                            let eventNames = [];
                            if (Object.is(table, daggerChangeEventName)) {
                                eventNames = [daggerChangeEventName];
                            } else if (isShoelace(tagName)) {
                                eventNames = change ? ['sl-change'] : table;
                            } else if (Object.is(table, true) || table[node.type] || table['*']) {
                                eventNames = Object.is(name, 'focus') ? ['blur', 'focus'] : [change ? 'change' : 'input'];
                            }
                            if (eventNames.length) {
                                decorators.capture = true; // useCapture
                                eventNames.forEach(eventName => dataBinder(directives, value, fields, eventName));
                            }
                        }
                    }
                }
                directives.controllers.push(directive);
            }
        }
    }
    resolveLandmark (node) {
        if (this.landmark) { return; }
        this.landmark = textNode.cloneNode(false);
        this.promises.push(promisor.then(() => node.replaceWith(this.landmark)));
        return this.landmark;
    }
    resolveViewModule (moduleProfile) {
        const { module } = moduleProfile, isViewModule = module instanceof NodeProfile;
        isViewModule || (moduleProfile = moduleProfile.fetchChild('view'));
        const view = isViewModule ? module : moduleProfile.module;
        this.children = view.children;
        this.moduleProfile = moduleProfile;
        this.defaultSlotScope = view.defaultSlotScope;
        if (Object.keys(this.defaultSlotScope).length) {
            const slotScope = {}, emptySlot = '_$slot_', slotDirective = '@slot';
            forEach(this.node.children, container => {
                if (container.hasAttribute(slotDirective)) {
                    const slotValue = container.getAttribute(slotDirective).trim(), slotName = `${ emptySlot }${ slotValue }`;
                    container.removeAttribute(slotDirective);
                    slotScope[slotName] = Object.is(container.tagName, 'TEMPLATE') ? container.innerHTML : container.outerHTML;
                }
            });
            Reflect.has(this.defaultSlotScope, emptySlot) && !Reflect.has(slotScope, emptySlot) && this.node.innerHTML && (slotScope[emptySlot] = this.node.innerHTML);
            this.slotScope = Object.assign({}, this.defaultSlotScope, slotScope);
        }
    }
}) => NodeProfile)(), Topology = class {
    constructor (parent, name, value) {
        this.value = this.oldValue = value, this.parent = null, this.controllerSet = new Set, this.children = emptier(), this.name = name;
        if (parent) {
            parent.children[name] = this;
            this.parent = parent;
        }
    }
    dispatch (source = dispatchSource.bubble) {
        Object.is(source, dispatchSource.mutation) || (this.parent && this.parent.parent && this.parent.dispatch(dispatchSource.bubble));
        const force = Object.is(source, dispatchSource.bubble);
        (this.value && this.value[meta]) ? this.value[meta].forEach(topology => topology.trigger(force)) : this.trigger(force);
    }
    fetch (name, value) {
        const topology = this.children[name] || new Topology(this, name, value);
        value && value[meta] && originalSetAdd.call(value[meta], topology);
        return topology;
    }
    subscribe () {
        if (currentController) {
            originalSetAdd.call(currentController.topologySet, this);
            originalSetAdd.call(this.controllerSet, currentController);
            const { parent } = this;
            parent && parent.parent && parent.unsubscribe(currentController);
        }
        return this;
    }
    trigger (force) {
        this.controllerSet.size ? this.controllerSet.forEach(controller => controller.owner.updateController(controller, force)) || promisor.then(() => (this.oldValue = this.value)) : (this.oldValue = this.value);
    }
    unsubscribe (controller) {
        originalSetDelete.call(controller.topologySet, this);
        originalSetDelete.call(this.controllerSet, controller);
    }
    update (newValue, source) {
        const { value } = this;
        if (Object.is(value, newValue)) { return; }
        isObject(value) && Reflect.has(value, meta) && originalSetDelete.call(value[meta], this);
        isObject(newValue) && Reflect.has(newValue, meta) && originalSetAdd.call(newValue[meta], this);
        this.value = newValue;
        this.dispatch(source);
        if (Object.is(newValue) && this.parent) {
            Reflect.deleteProperty(this.parent.children, this.name);
            this.parent = null;
        }
        forEach(ownKeys(this.children), key => this.children[key].update((newValue || emptier())[key], dispatchSource.mutation));
    }
}) => styleResolver('[dg-cloak] { display: none !important; }', 'dg-global-style', false) && document.addEventListener('DOMContentLoaded', () => Promise.all(['options', 'modules', 'routers'].map(type => configResolver(document, document.baseURI, type))).then(((base = '', originalPushState = history.pushState, originalReplaceState = history.replaceState, rootRouter = null, routerConfigs = null, styleModuleCache = { '': styleModuleSet }, anchorResolver = (anchor, event = null) => {
    try {
        const anchorElement = anchor && (document.getElementById(anchor) || querySelector(document, `a[name=${ anchor }]`));
        if(!anchorElement) { return; }
        event && event.preventDefault();
        anchorElement.scrollIntoView();
        location.href.endsWith(`#@${ anchor }`) || originalPushState.call(history, null, '', `${ location.href }#@${ anchor }`);
        return true;
    } catch (error) {
        return;
    }
}, routingChangeResolver = ((routerChangeResolver = ((resolver = nextRoute => {
    processorResolver();
    const currentStyleModuleSet = rootScope.$route && styleModuleCache[rootScope.$route.path];
    rootScope.$route = nextRoute;
    if (!routerTopology) {
        routerTopology = [...nextRoute[meta]][0];
        rootNodeProfiles.map(nodeProfile => new NodeContext(nodeProfile));
    }
    if (!Object.is(currentStyleModuleSet, styleModuleSet)) {
        currentStyleModuleSet && currentStyleModuleSet.forEach(style => (style.disabled = !styleModuleSet.has(style)));
        styleModuleSet.forEach(style => (style.disabled = false));
    }
    anchorResolver(nextRoute.anchor);
}) => nextRoute => {
    const { path } = nextRoute;
    if (Object.is(rootScope.$route?.path, path)) {
        return;
    }
    styleModuleSet = styleModuleCache[path] || (styleModuleCache[path] = new Set);
    return rootNamespace.resolve(nextRoute.modules).then(() => resolver(nextRoute));
})()) => () => {
    const slash = '/', anchorIndex = location.hash.lastIndexOf('#@'), anchor = (anchorIndex >= 0) ? location.hash.substring(anchorIndex + 2) : '';
    let fullPath = ((Object.is(routerConfigs.mode, 'history') ? `${ location.pathname }${ location.search }` : location.hash.replace(anchor, ''))).replace(routerConfigs.prefix, '');
    fullPath.startsWith(slash) || (fullPath = `${ slash }${ fullPath }`);
    const { mode, aliases, prefix } = routerConfigs, [rawPath = '', query = ''] = fullPath.split('?'), path = rawPath.substring(1), params = {}, paths = Object.is(rawPath, slash) ? [''] : rawPath.split(slash), routes = [];
    !Object.is(rawPath, slash) && rawPath.endsWith(slash) && paths.splice(paths.length - 1, 1);
    let redirectPath = aliases[path];
    if (Object.is(redirectPath)) {
        if (rootRouter.match(routes, params, paths)) {
            routes.reverse();
            redirectPath = routes.find(route => route.redirectPath || Object.is(route.redirectPath, ''))?.redirectPath;
        } else if (Reflect.has(routerConfigs, 'default')) {
            redirectPath = routerConfigs.default;
        } else {
            return;
        }
    }
    if (redirectPath != null) {
        return history.replaceState(null, '', `${ query ? `${ redirectPath }?${ query }` : redirectPath }${ anchor }` || routerConfigs.prefix);
    }
    const queries = {}, variables = Object.assign({}, ...routes.map(route => route.variables)), constants = Object.assign({}, ...routes.map(route => route.constants));
    query && forEach([...new URLSearchParams(query)], ([key, value]) => (queries[key] = value));
    forEach(Object.keys(variables), key => {
        if (Reflect.has(queries, key) && !Reflect.has(constants, key)) {
            const type = typeof variables[key], query = queries[key];
            try {
                variables[key] = Object.is(type, 'string') ? query : window[`${ type[0].toUpperCase() }${ type.substring(1) }`](JSON.parse(query));
            } catch (error) {}
        }
    });
    const nextRoute = { url: location.href, mode, prefix, path, paths, modules: new Set(routes.map(route => route.modules).flat()), query, queries, params, variables, constants, anchor };
    Promise.all([...sentrySet].map(sentry => Promise.resolve(sentry.processor(nextRoute)).then(prevent => ({ sentry, prevent })))).then(results => {
        const matchedOwners = results.filter(result => result.prevent).map(result => result.sentry.owner);
        matchedOwners.length ? originalPushState.call(history, null, '', rootScope.$route.url) : routerChangeResolver(nextRoute);
    });
})(), Router = class {
    constructor (route, parent = null) {
        const { children, constants = {}, variables = {}, modules = [], tailable = false, redirect = '' } = route;
        let path = (route.path || '').trim();
        this.modules = arrayWrapper(modules);
        if (parent) {
            (!path || Object.is(path, '*')) && (path = '.+');
            this.path = `${ parent.path }/${ path }`;
        } else {
            path = '';
            this.path = '';
        }
        if (redirect) {
            this.redirectPath = isFunction(redirect) ? redirect(rootScope, rootNamespace.module) : redirect;
        }
        this.constants = constants, this.variables = variables, this.children = null, this.parent = parent, this.params = isObject(path) ? Object.keys(path).map(param => ({ param, regExp: new RegExp(path[param] || '^.+$') })) : path.split('/').map(subPath => {
            subPath = subPath.trim();
            return subPath.startsWith(':') ? {
                param: subPath.substring(1).trim(),
                regExp: /^.+$/
            } : {
                param: subPath,
                regExp: new RegExp(`^${ subPath }$`)
            };
        });
        children && (this.children = children.map(child => new Router(child, this)));
        this.tailable = tailable || !this.children?.length;
    }
    match (routes, params, paths, length = paths.length, start = 0) {
        const paramLength = this.params.length;
        if ((length >= paramLength) && this.params.every(({ param, regExp }, index) => {
            const path = paths[start + index];
            if (regExp.test(path)) {
                params[param] = path;
                return true;
            }
        })) {
            start += paramLength;
            return ((Object.is(length, start) && this.tailable) || this.children?.find(child => child.match(routes, params, paths, length, start))) && routes.push(this);
        }
    }
}) => {
    const register = ((resolver = (prototype, name) => {
        const method = prototype?.[name];
        const resolvedMethod = function (...parameters) {
            const result = method.apply(this, parameters);
            this[meta] && this[meta].forEach(topology => topology.dispatch());
            return result;
        };
        Reflect.defineProperty(resolvedMethod, 'name', { configurable: true, value: name });
        Reflect.defineProperty(prototype, name, { get: () => resolvedMethod });
    }) => (target, names) => forEach(names, name => resolver(target.prototype, name)))();
    eventDelegator('click', window, event => {
        let { target } = event;
        while (target && !['A', 'AREA'].includes(target.tagName)) {
            target = target.parentNode;
        }
        if (!target || !target.hasAttribute('href')) { return; }
        const href = target.getAttribute('href').trim();
        if (href.startsWith('#') && anchorResolver(href.substring(1), event)) { return; }
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
    eventDelegator('reset', window, () => event => Object.is(event.target.tagName, 'FORM') && forEach(querySelector(document.body, 'input, textarea', true), child => {
        child.dispatchEvent(new CustomEvent('input', eventPayload));
        child.dispatchEvent(new CustomEvent('change', eventPayload));
    }));
    register(Date, ['setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'setYear']) || register(Map, ['set', 'delete', 'clear']) || register(Set, ['add', 'delete', 'clear']) || register(WeakMap, ['set', 'delete']) || register(WeakSet, ['add', 'delete']);
    JSON.stringify = processorWrapper(JSON.stringify);
    forEach(['concat', 'copyWithin', 'fill', 'find', 'findIndex', 'lastIndexOf', 'pop', 'push', 'reverse', 'shift', 'unshift', 'slice', 'sort', 'splice', 'includes', 'indexOf', 'join', 'keys', 'entries', 'values', 'forEach', 'filter', 'flat', 'flatMap', 'map', 'every', 'some', 'reduce', 'reduceRight', 'toLocaleString', 'toString', 'at'], key => (Array.prototype[key] = processorWrapper(Array.prototype[key])));
    const stateResolver = (method, parameters) => {
        const url = parameters?.[2], prefix = routerConfigs.prefix;
        url && !url.startsWith(prefix) && (parameters[2] = `${ prefix }${ url }`);
        method.apply(history, parameters);
        routingChangeResolver();
    };
    history.pushState = (...parameters) => stateResolver(originalPushState, parameters);
    history.replaceState = (...parameters) => stateResolver(originalReplaceState, parameters);
    window.$dagger = Object.freeze(Object.assign(emptier(), { register, version: '1.0.0-RC-release', validator: () => {} }));
    return ([options, modules, routers]) => {
        base = modules.base;
        routerConfigs = routers.content;
        const { prefix } = routerConfigs, isHistoryMode = Object.is(routerConfigs.mode, 'history');
        routerConfigs.prefix = `${ isHistoryMode ? '/' : '#' }${ prefix ? `${ prefix }/` : '' }`;
        rootScope = Object.seal(proxyResolver({ $route: null }));
        moduleConfigNormalizer(modules.content);
        const html = document.documentElement, routing = routerConfigs.routing || { modules: Object.keys(modules.content) };
        rootScopeCallback = scope => {
            rootScope = scope;
            rootRouter = new Router(routing);
            const { rootSelectors } = options.content;
            const rootNodeSet = new Set(rootSelectors.map(rootSelector => [...querySelector(document, rootSelector, true)]).flat());
            rootNodeSet.delete(html);
            const rootNodes = [...rootNodeSet];
            forEach(rootNodes, rootNode => Reflect.construct(NodeProfile, [rootNode, rootNamespace, rootNodeProfiles, null, true]));
            eventDelegator('popstate', window, routingChangeResolver);
            history.replaceState(null, '', isHistoryMode ? `${ location.pathname }${ location.search }${ location.hash }` : location.hash);
        };
        rootNamespace = new ModuleProfile({ content: modules.content, type: moduleType.namespace }, base);
        rootNamespace.resolve(new Set(arrayWrapper(routing.modules || []))).then(() => styleModuleSet.forEach(style => (style.disabled = false)) || new NodeContext(new NodeProfile(html)));
    };
})())))();
