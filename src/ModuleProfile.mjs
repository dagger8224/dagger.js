/* ************************************************************************
 *  <copyright file="ModuleProfile.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { moduleNameRegExp, ModuleType, promisor, remoteUrlRegExp, originalSetAdd, originalMapSet } from './constants.mjs';
import { NodeProfile } from './NodeProfile.mjs';
import { forEach,isObject, isFunction, isString, ownKeys, emptyObjectCreator, functionConverter, remoteResourceFetcher, serializer, querySelector, styleElementCreator, elementCreator, selectorInjector, moduleConfigNormalizer } from './utils.mjs';
import { configResolver } from './configs.mjs';
import { runtime } from './runtime.mjs';

const elementProfileCacheMap = new Map;

const integrityProfileCache = emptyObjectCreator();

const relativePathRegExp = /(?:^|;|\s+)(?:export|import)\s*?(?:(?:(?:[$\w*\s{},]*)\s*from\s*?)|)(?:(?:"([^"]+)?")|(?:'([^']+)?'))[\s]*?(?:$|)/gm;

const textEncoder = new TextEncoder();

const EmbeddedType = {
    json: 'dagger/json',
    namespace: 'dagger/modules',
    script: 'dagger/script',
    style: 'dagger/style',
    string: 'dagger/string'
};

const MIMEType = {
    html: 'text/html',
    json: 'application/json',
    script: ['application/javascript', 'javascript/esm', 'text/javascript'],
    style: 'text/css'
};

const selectorRegExp = /([\s:+>~])/;
const whitelist = [':root', ':scope', 'html', 'body'];
const scopedRuleResolver = (sheet, rule, name, iterator, conditionText = '') => {
    if (rule instanceof CSSKeyframesRule) {
        const originalName = rule.name;
        rule.name = `${originalName}-${name}`;
        sheet.insertRule(rule.cssText, iterator.index++);
        rule.name = originalName;
    }
    if (rule.cssRules?.length) {
        const { conditionText } = rule;
        forEach(rule.cssRules, rule => scopedRuleResolver(sheet, rule, name, iterator, conditionText));
    } else if (rule.selectorText) {
        const { style } = rule, originalAnimationName = style.animationName, resolvedRule = `${rule.selectorText.split(',').map(selector => (selector = selector.trim()) && ((whitelist.some(key => selector.startsWith(key)) && selector) || `${selectorRegExp.test(selector) ? selector.replace(selectorRegExp, `[${name}]$1`) : `${selector}[${name}]`}, [${name}] ${selector}`)).join(', ')}{${style.cssText}}`;
        originalAnimationName && (style.animationName = `${originalAnimationName}-${name}`);
        sheet.insertRule(conditionText ? `@media ${conditionText}{ ${resolvedRule} }` : resolvedRule, iterator.index++);
        originalAnimationName && (style.animationName = originalAnimationName);
    }
};

const scriptModuleResolver = (module, resolvedModule) => {
    try {
        forEach(ownKeys(module), key => {
            const value = module[key];
            if (isFunction(value)) {
                resolvedModule[key] = functionConverter(value);
            } else {
                resolvedModule[key] = value;
                isObject(value) && scriptModuleResolver(value, value);
            }
        });
    } catch (error) { } finally {
        return resolvedModule;
    }
}

export const ModuleProfile = class {
    constructor(config = {}, base = '', name = '', parent = null) {
        name = name.trim();
        Console.assert(`The module name should be valid string matched RegExp "${moduleNameRegExp.toString()}" instead of "${name}"`, !parent || moduleNameRegExp.test(name));
        this.layer = name ? ((parent?.layer || 0) + 1) : 0;
        this.indent = new Array(this.layer * 4).fill(' ').join('');
        this.name = name;
        this.state = 'unresolved';
        this.valid = true;
        this.module = null;
        this.integrity = null;
        this.parent = null;
        this.children = null;
        this.type = null;
        this.content = null;
        this.resolvedContent = null;
        if (parent) {
            this.parent = parent;
            this.path = parent.path ? `${parent.path}.${name}` : name;
            this.tags = [...parent.tags, this.path.replace(/\./g, '__')];
            this.baseElement = parent.baseElement;
        } else {
            this.path = name;
            this.tags = [];
            this.baseElement = document;
        }
        const { integrity, uri, type } = config;
        if (type) {
            Console.assert(`${this.indent}The type of module "${this.path}" should be one of "json, namespace, script, style, string, view" instead of "${type}"`, ModuleType[type]);
            this.type = type;
        }
        if (Reflect.has(config, 'content')) {
            this.content = config.content;
            Console.assert(`${this.indent}The type of module "${this.path}" should be specified as one of "json, namespace, script, style, string, view" instead of "${type}"`, type);
        } else if (uri) {
            this.URIs = uri;
        } else {
            Console.assert([`${this.indent}Failed to parse the config "%o" for module "${this.path}" as there is no valid "content" or "uri" definition`, config]);
        }
        this.integrity = integrity;
        this.config = config;
        this.promise = new Promise(resolver => (this.resolver = resolver));
        this.base = new URL(config.base || base, parent?.base || document.baseURI).href;
        config.prefetch && this.resolve();
    }
    fetch(paths) {
        if (!paths.length) { return this; }
        const path = paths.shift();
        const moduleProfile = this.fetchChild(path);
        return moduleProfile.fetch(paths);
    }
    fetchChild(name, ignoreMismatch = false) {
        const childModuleProfile = this.children?.find(child => Object.is(child.name, name) && child.valid);
        if (!childModuleProfile && ignoreMismatch) {
            return;
        }
        Console.assert(`${this.indent}Failed to fetch module "${name}" within ${this.path ? `namespace "${this.path}"` : 'the root namespace'}`, !Object.is(childModuleProfile));
        return childModuleProfile;
    }
    fetchViewModule(name) {
        const moduleProfile = this.fetchChild(name, true);
        if (moduleProfile) {
            Console.assert(`The module "${moduleProfile.path}" is referenced but not declared in the "modules" field of the current route`, !Object.is(moduleProfile.state, 'unresolved'));
            return moduleProfile;
        } else {
            Console.assert(`There is no valid module named "${name}" found`, this.parent);
            return this.parent.fetchViewModule(name);
        }
    }
    resolve(childNameSet = null) {
        const { type } = this;
        if (!Object.is(this.state, 'unresolved')) {
            if (childNameSet) { // rootNamespace
                this.promise = new Promise(resolver => (this.resolver = resolver));
            } else {
                if (this.valid && Object.is(this.state, 'resolved')) {
                    if (Object.is(type, ModuleType.style)) {
                        originalSetAdd.call(runtime.styleModuleSet, this.module);
                    } else if (Object.is(type, ModuleType.namespace)) {
                        forEach(this.children, child => child.resolve());
                    }
                }
                return this.promise;
            }
        }
        this.state = 'resolving';
        Console.log(`${this.indent}⏳ resolving the ${this.config.optional ? 'default optional ' : ''}${this.path ? `module "${this.path}"` : 'root module'}`);
        this.verifyDependency();
        let pipeline = null;
        if (this.content == null) {
            pipeline = [...this.URIs.map(uri => {
                Console.assert([`${this.indent}The "uri" of module "${this.path}" should be valid "string" instead of "%o"`, uri], isString(uri));
                return (data, token) => (token.stop = !!data) || this.resolveURI(uri);
            }), moduleProfile => {
                if (!moduleProfile) {
                    Console.assert([`${this.indent}Failed to resolve uri of module "${this.path}" from "%o"`, this.URIs]);
                    (this.valid = false) || this.resolved(null);
                }
            }];
        } else {
            const { content } = this;
            if ([ModuleType.namespace, ModuleType.json].includes(type)) {
                Console.assert([`${this.indent}The content of module "${this.path}" with type "${type}" should be valid "object" instead of "%o"`, content], content && Object.is(typeof content, 'object'));
                pipeline = [(!this.path && this.integrity) || this.resolveIntegrity(content), () => Object.is(type, ModuleType.namespace) ? this.resolveNamespace(content, this.base, childNameSet) : content];
            } else {
                pipeline = [this.resolveIntegrity(content), content => this.resolveContent(content)];
            }
            pipeline = [...pipeline, resolvedContent => this.resolveModule(resolvedContent), module => this.resolved(module)];
        }
        promisor.then(() => serializer(pipeline));
        return this.promise;
    }
    resolveCachedModuleProfile(moduleProfile) {
        this.integrity = moduleProfile.integrity;
        this.verifyDependency();
        this.type || (this.type = moduleProfile.type);
        return moduleProfile.resolvedContent;
    }
    resolveContent(content) {
        isString(content) || (content = originalStringifyMethod(content));
        this.content = content.trim();
        const { type } = this;
        if (Object.is(type, ModuleType.namespace)) {
            this.baseElement = elementCreator(content);
            return serializer([configResolver(this.baseElement, this.base), ({ base, content }) => this.resolveNamespace(content, base)]);
        } else if (Object.is(type, ModuleType.script)) {
            return import(`data:text/javascript, ${encodeURIComponent(content.replace(relativePathRegExp, (match, url1, url2) => match.replace(url1 || url2, new URL(url1 || url2, this.base))))}`).catch(() => Console.assert(`${this.indent}Failed to import dynamic script module "${this.path}" with resolved content "${content}"`));
        } else if (Object.is(type, ModuleType.view)) {
            const fragment = elementCreator(content);
            selectorInjector(fragment, this.parent.tags);
            const nodeProfile = new NodeProfile(fragment, this.parent, null, null, false, {});
            return Promise.all(nodeProfile.promises || []).then(() => nodeProfile);
        } else if (Object.is(type, ModuleType.style)) {
            return styleElementCreator(content, `${this.path}-template`, true);
        } else if (Object.is(type, ModuleType.json)) {
            return JSON.parse(content);
        } else if (Object.is(type, ModuleType.string)) {
            return this.content;
        } else {
            Console.assert(`${this.indent}Failed to resolve module "${this.path}" of unknown type "${type}"`);
        }
    }
    resolved(module) {
        this.module = module;
        this.state = 'resolved';
        this.resolver(this);
        Console.log(`${this.indent}✅ resolved the ${this.config.optional ? 'default optional ' : ''}${this.path ? `"${this.type}" module "${this.path}"` : 'root module'} ${this.valid ? 'successfully' : 'failed'}`);
        return this;
    }
    resolveEmbeddedType(element) {
        if (!this.type) {
            const { tagName, type } = element;
            if (Object.is(tagName, 'TEMPLATE')) {
                this.type = ModuleType.view;
            } else if (Object.is(tagName, 'STYLE') && Object.is(type, EmbeddedType.style)) {
                this.type = ModuleType.style;
            } else if (Object.is(tagName, 'SCRIPT')) {
                if (Object.is(type, EmbeddedType.namespace)) {
                    this.type = ModuleType.namespace;
                    return serializer([this.resolveIntegrity(element.innerHTML), content => this.resolveNamespace(functionCreator(content), element.getAttribute('base') || this.base)]);
                } else if (Object.is(type, EmbeddedType.script)) {
                    this.type = ModuleType.script;
                } else if (Object.is(type, EmbeddedType.json)) {
                    this.type = ModuleType.json;
                } else if (Object.is(type, EmbeddedType.string)) {
                    this.type = ModuleType.string;
                }
            }
            Console.assert([`The element "%o" of type "${type || 'undefined'}" is not supported`, element], this.type);
        }
        return serializer([this.resolveIntegrity(element.innerHTML), content => this.resolveContent(content)]);
    }
    resolveIntegrity(content) {
        return runtime.daggerOptions.integrity ? crypto.subtle.digest('SHA-256', textEncoder.encode(isString(content) ? content : originalStringifyMethod(content))).then(integrity => {
            const resolvedIntegrity = btoa([...new Uint8Array(integrity)].map(charCode => String.fromCharCode(charCode)).join(''));
            Console.assert(`The expected "SHA-256" integrity for module "${this.path}" is "${this.integrity}" while the computed integrity is "${resolvedIntegrity}"`, !this.integrity || Object.is(this.integrity, resolvedIntegrity));
            integrityProfileCache[resolvedIntegrity] || (integrityProfileCache[resolvedIntegrity] = this);
            this.integrity = resolvedIntegrity;
            this.verifyDependency();
            return content;
        }) : content;
    }
    resolveModule(resolvedContent) {
        this.resolvedContent = resolvedContent;
        let module = resolvedContent;
        const { type } = this, isNamespace = Object.is(type, ModuleType.namespace);
        if (this.parent && (isNamespace || Object.is(type, ModuleType.view))) {
            try {
                const element = document.createElement(this.name);
                Console.assert([`${this.indent}It's illegal to use "${this.name}" as a namespace or view module name as it's the tag name of builtin html element "%o"`, element.constructor], !Object.is(this.name, this.name.toLowerCase()) || (element instanceof HTMLUnknownElement));
            } catch (error) {
                Console.assert(`${this.indent}It's illegal to use "${this.name}" as a namespace or view module name`);
            }
        }
        if (isNamespace) {
            module = this.module;
            if (!this.children) {
                this.children = resolvedContent;
            }
            if (this.config.explicit) {
                if (this.config.anonymous) {
                    Object.assign(this.parent.module, module);
                } else {
                    this.parent.module[this.name] = module;
                }
            }
            if (this.parent) {
                this.parent.resolve().then(moduleProfile => Object.setPrototypeOf(module, moduleProfile.module));
            }
        } else if (Object.is(type, ModuleType.script)) {
            module = scriptModuleResolver(module, emptyObjectCreator());
            Object.is(this.config.anonymous, false) ? (this.parent.module[this.name] = module) : Object.assign(this.parent.module, module);
        } else if (Object.is(type, ModuleType.style)) {
            if (!Object.is(this.config.scoped, false)) {
                const style = styleElementCreator('', this.path, true);
                const { sheet } = style;
                const iterator = { index: 0 };
                const tag = this.parent.path.replace(/\./g, '__');
                if (tag) {
                    forEach(module.sheet.cssRules, rule => scopedRuleResolver(sheet, rule, tag, iterator));
                } else {
                    style.textContent = module.textContent;
                }
                style.setAttribute('based', `${this.path}-template`);
                module = style;
            }
            originalSetAdd.call(runtime.styleModuleSet, module);
        } else if (Object.is(type, ModuleType.json)) {
            if (this.config.anonymous) {
                Object.assign(this.parent.module, module);
            } else {
                this.parent.module[this.name] = module;
            }
        } else if (Object.is(type, ModuleType.string)) {
            this.parent.module[this.name] = module;
        }
        return module;
    }
    resolveNamespace(config, base, childNameSet = null) {
        if (this.parent) {
            moduleConfigNormalizer(config);
        }
        if (!this.children) {
            this.children = Object.entries(config).map(([name, config]) => new ModuleProfile(config, base, name, this));
        }
        let { children } = this;
        if (childNameSet) {
            children = this.children.filter(child => childNameSet.has(child.name));
            if (!Object.is(children.length, childNameSet.size)) {
                forEach(children, child => originalSetDelete.call(childNameSet, child.name));
                Console.assert([`The modules "%o" is not declared in the root namespace`, childNameSet]);
            }
        }
        if (!this.module) {
            this.module = emptyObjectCreator();
        }
        return Promise.all(children.map(child => child.resolve()));
    }
    resolveRemoteType(content, type, url) {
        this.base = url;
        if (this.type) {
            return;
        }
        if (url.endsWith('.js') || url.endsWith('.mjs') || MIMEType.script.some(scriptType => type.includes(scriptType))) {
            this.type = ModuleType.script;
        } else if (url.endsWith('.css') || type.includes(MIMEType.style)) {
            this.type = ModuleType.style;
        } else if (url.endsWith('.html') || type.includes(MIMEType.html)) {
            content = content.trim();
            this.type = (content.startsWith('<html>') || content.startsWith('<!DOCTYPE ')) ? ModuleType.namespace : ModuleType.view;
        } else if (url.endsWith('.json') || type.includes(MIMEType.json)) {
            this.type = ModuleType.json;
        } else {
            this.type = ModuleType.string;
        }
    }
    resolveURI(uri) {
        uri = uri.trim();
        if (!uri) {
            return;
        }
        let pipeline = null;
        if (remoteUrlRegExp.test(uri)) {
            const cachedProfile = integrityProfileCache[this.integrity];
            if (cachedProfile) {
                pipeline = [cachedProfile.resolve(), moduleProfile => this.resolveCachedModuleProfile(moduleProfile)];
            } else {
                this.integrity && (integrityProfileCache[this.integrity] = this);
                const base = new URL(uri, this.base).href;
                pipeline = [(_, token) => serializer([remoteResourceFetcher(base, this.integrity), result => result || (token.stop = true)]), ({ content, type }) => this.resolveRemoteType(content, type, base) || this.resolveIntegrity(content), content => this.resolveContent(content)];
            }
        } else { // selector
            const element = querySelector(this.baseElement, uri, false, this.config.optional);
            const cachedProfile = elementProfileCacheMap.get(element);
            if (!element) {
                return (this.valid = false) || this.resolved(null);
            }
            if (cachedProfile) {
                Console.warn([`${this.indent}❎ The module "${this.path}" and "${cachedProfile.path}" reference the same embedded element "%o"`, element]);
                pipeline = [cachedProfile.resolve(), moduleProfile => this.resolveCachedModuleProfile(moduleProfile)];
            } else {
                originalMapSet.call(elementProfileCacheMap, element, this);
                pipeline = [this.resolveEmbeddedType(element)];
            }
        }
        return pipeline && serializer([...pipeline, resolvedContent => this.resolveModule(resolvedContent), module => this.resolved(module)]);
    }
    verifyDependency() {
        if (this.integrity && (!this.type || Object.is(this.type, ModuleType.namespace))) {
            let parent = this.parent;
            while (parent) {
                Console.assert(`There is a circular reference between module "${this.path}" and module "${parent.path}"`, !Object.is(parent.integrity, this.integrity));
                parent = parent.parent;
            }
        }
    }
};
