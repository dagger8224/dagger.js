/* ************************************************************************
 *  <copyright file="NodeProfile.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { daggerChangeEventName, promisor, observerEventHandlerNameSet } from './constants.mjs';
import { attributeNameConverter, emptyObjectCreator, forEach, hashTableCreator, landmarkCreator, processorResolver, isShoelaceElement } from './utils.mjs';
import { runtime } from './runtime.mjs';

const slChange = ['sl-change'];
const slUpdate = ['sl-change', 'sl-input'];
const slFocus = ['sl-blur', 'sl-focus'];
const slShow = ['sl-show', 'sl-hide'];
const twoWayDataBindingTable = {
    'INPUT': {
        checked: { checkbox: true, radio: true },
        focus: { '*': true },
        value: { '*': true }, // TODO: assert for file type
        files: { file: true },
        result: { file: true }
    },
    'OPTION': { selected: daggerChangeEventName },
    'SELECT': { value: true },
    'TEXTAREA': { focus: true, value: true },
    // Shoelace
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
    'SL-TREE-ITEM': { expanded: ['sl-expand', 'sl-collapse'] }, // selected
    // wired-elements
    'WIRED-INPUT': { value: true },
};

const DirectiveType = {
    '*': 'controller',
    '+': 'event'
};

const lifeCycleDirectiveNames = hashTableCreator('load', 'loaded', 'sentry', 'unload', 'unloaded');

const rawElementNames = hashTableCreator('STYLE', 'SCRIPT');

const directiveResolver = (expression, fields = {}, signature = '$node') => {
    const { clear, debug } = fields.decorators || {};
    expression = `($module, $scope${ signature ? `, ${ signature }` : '' }) => {
        with ($module) {
            with ($scope) {
                return (() => {
                    'use strict';
                    ${ debug ? 'debugger;\n\r' : '' }
                    ${ clear ? 'console.clear();\n\r' : '' }
                    return ${ expression };
                })();
            }
        }
    }`;
    const processor = runtime.processorCaches[expression];
    const directive = Object.assign({}, fields, { processor: processor || expression });
    processor || runtime.directiveQueue.push(directive);
    return directive;
};

const directiveAttributeResolver = (node, name, value = '') => {
    if (runtime.daggerOptions.debugDirective) {
        node.setAttribute(`${ DirectiveType[name[0]] || 'meta' }-${ decodeURIComponent(name.substring(1)).trim().replace(/\#/g, '__').replace(/:/g, '_').replace(/[^\w]/g, '-') }-debug`, value);
    }
}

const dynamicDirective = '@directive';
const slotDirective = '@slot'
const rawDirective = '@raw';
export const NodeProfile = class {
    constructor (node, namespace = runtime.rootNamespace, rootNodeProfiles = null, parent = null, unique = false, defaultSlotScope = null) {
        this.node = node;
        this.namespace = namespace;
        this.unique = unique;
        this.defaultSlotScope = defaultSlotScope || parent?.defaultSlotScope || null;
        this.dynamic = false;
        this.plain = false;
        this.raw = false;
        this.virtual = false;
        this.text = '';
        this.inlineStyle = '';
        this.styles = null;
        this.directives = null;
        this.landmark = null;
        this.children = null;
        this.classNames = null;
        this.html = null;
        this.slotScope = null;
        this.moduleProfile = null;
        const type = node.nodeType;
        if (Object.is(type, Node.TEXT_NODE)) {
            const resolvedTextContent = node.textContent.trim();
            if (!resolvedTextContent) {
                return;
            }
            if (resolvedTextContent.includes('${') && resolvedTextContent.includes('}')) {
                rootNodeProfiles && rootNodeProfiles.push(this);
                this.text = directiveResolver(`\`${ resolvedTextContent }\``, { name: 'text' }, '');
                this.promises = [];
                this.node = this.resolveLandmark(node, 'string template replaced');
            } else {
                this.raw = true;
            }
            parent.children.push(this);
        } else if (Object.is(type, Node.ELEMENT_NODE)) {
            this.promises = [];
            const cloak = 'dg-cloak';
            const { attributes, tagName } = node;
            const raw = attributes[rawDirective];
            this.html = node.isSameNode(document.documentElement) && node;
            this.raw = !!(raw || rawElementNames[tagName]);
            if (this.raw) {
                if (raw) {
                    directiveAttributeResolver(node, rawDirective);
                    node.removeAttribute(rawDirective);
                }
                rootNodeProfiles && node.removeAttribute(cloak);
            } else {
                const controllers = [];
                const eventHandlers = [];
                const directives = { controllers, eventHandlers };
                const name = tagName.includes('__') ? tagName.toLowerCase().replace(/__[a-z]/g, string => string[2].toUpperCase()) : tagName.toLowerCase();
                const moduleProfile = Object.is(node.constructor, HTMLUnknownElement) && namespace.fetchViewModule(name.split('.')[0]);
                const resolved = Object.is(moduleProfile.state, 'resolved');
                const dynamic = attributes[dynamicDirective];
                moduleProfile && Console.assert(`It is illegal to use "*html" or "*text" directive on view module "${ name }"`, !node.hasAttribute('*html') && !node.hasAttribute('*text'));
                if (moduleProfile) {
                    this.virtual = true;
                    this.resolveLandmark(node, 'virtual node removed');
                }
                if (moduleProfile && !resolved) {
                    this.resolveDirective('*html', `\`${ node.outerHTML.replace(/`/g, '\\`').replace(/\${/g, '\\${') }\``, directives);
                    this.directives = directives;
                } else {
                    if (node.hasAttribute(slotDirective)) {
                        const slotValue = node.getAttribute(slotDirective).trim(), slotName = `_$slot_${ slotValue }`;
                        directiveAttributeResolver(node, slotDirective, slotValue);
                        node.removeAttribute(slotDirective);
                        if (this.defaultSlotScope) {
                            this.defaultSlotScope[slotName] = node.innerHTML;
                            Console.warn([`❎ Please avoid adding "*html" or "*text" directive on element "%o" as it's declared "${ slotDirective }" meta directive already`, node], !node.hasAttribute('*html') && !node.hasAttribute('*text'));
                            node.removeAttribute('*html');
                            node.removeAttribute('*text');
                            this.resolveDirective('*html#strict', slotName, directives);
                        }
                    }
                    forEach([...attributes], ({ name, value }) => this.resolveDirective(name, value, directives));
                    if (dynamic) {
                        this.directives = directives, this.dynamic = directiveResolver(dynamic.value || 'directive');
                        node.removeAttribute(dynamicDirective);
                    } else {
                        controllers.length || (directives.controllers = null);
                        eventHandlers.length || (directives.eventHandlers = null);
                        (directives.controllers || directives.eventHandlers || (Object.values(directives).length > 2)) && (this.directives = directives);
                    }
                    if (this.html) {
                        return processorResolver();
                    }
                    this.plain = !(this.directives || this.landmark);
                }
                rootNodeProfiles && (this.plain ? (node.hasAttribute(cloak) && forEach(node.children, child => child.setAttribute(cloak, '')) || node.removeAttribute(cloak)) : (rootNodeProfiles.push(this) && (rootNodeProfiles = null)));
                if (moduleProfile) {
                    if (resolved) {
                        this.resolveViewModule(moduleProfile.fetch(name.split('.').slice(1)));
                    }
                } else {
                    if (Object.is(name, 'template')) {
                        if (this.plain) {
                            this.raw = true;
                            this.plain = false;
                        } else {
                            this.virtual = true;
                            this.resolveLandmark(node, 'virtual node removed');
                        }
                    }
                    if (!this.raw && !directives.child) {
                        this.resolveChildren(node, rootNodeProfiles);
                    }
                }
            }
            if (parent) {
                parent.children.push(this);
                if (this.promises.length) {
                    parent.promises.push(Promise.all(this.promises));
                }
            }
        } else if (Object.is(type, Node.DOCUMENT_FRAGMENT_NODE)) {
            this.promises = [];
            this.resolveChildren(node, rootNodeProfiles);
        } else if (Object.is(type, Node.COMMENT_NODE)) {
            this.raw = true;
        } else {
            Console.assert(`The node type "${ type }" is not supported`);
        }
    }
    resolveChildren (node, rootNodeProfiles) {
        const { childNodes } = this.virtual ? node.content : node;
        if (childNodes.length) {
            this.children = [];
            forEach(childNodes, childNode => Reflect.construct(NodeProfile, [childNode, this.namespace, rootNodeProfiles, this, !!this.unique]));
            if (this.plain && this.children.every(child => child.raw)) {
                this.raw = true;
                this.plain = false;
            }
        } else if (this.plain) {
            this.raw = true;
            this.plain = false;
        }
        if (this.raw) {
            this.children = null;
        }
        return this;
    }
    resolveDirective (attributeName, value, directives) {
        const resolvedType = DirectiveType[attributeName[0]];
        if (!resolvedType) {
            return;
        }
        const { node } = this;
        directiveAttributeResolver(node, attributeName, value);
        node.removeAttribute(attributeName);
        const [name, ...rawDecorators] = attributeName.substring(1).split('#');
        const decorators = emptyObjectCreator();
        const fields = { decorators };
        forEach(rawDecorators.filter(decorator => decorator), decorator => {
            const [name, value] = decorator.split(':').map(content => decodeURIComponent(attributeNameConverter(content)).trim());
            try {
                decorators[name] = value ? JSON.parse(value) : name;
            } catch (error) {
                decorators[name] = value;
            }
        });
        if (Object.is(resolvedType, 'event')) {
            fields.event = name;
            let signature = '';
            const isLifeCycleDirective = lifeCycleDirectiveNames[name];
            if (isLifeCycleDirective) {
                signature = Object.is(name, 'sentry') ? '$nextRoute' : '$node';
            } else {
                signature = observerEventHandlerNameSet.has(name) ? '$node, $entries' : '$node, $event';
            }
            const directive = directiveResolver(value || `${ attributeNameConverter(name) }($scope, $module, ${ signature })`, fields, signature);
            if (isLifeCycleDirective) {
                directives[name] = directive;
            } else {
                directives.eventHandlers.push(directive);
            }
        } else {
            if (!value) {
                value = attributeNameConverter(name); // shorthand
            }
            if (Object.is(name, 'watch')) {
                if (decorators.lazy) {
                    value = `${ value.substring(value.indexOf('(') + 1, value.indexOf(')')).trim() || 'null' },
                    $node => {
                        'use strict';
                        ${ decorators.debug ? 'debugger;\n\r' : '' }
                        ${ decorators.clear ? 'console.clear();\n\r' : '' }
                        return ${ value };
                    }`;
                }
            } else {
                fields.name = name;
            }
            const directive = directiveResolver(value, fields);
            if (Object.is(name, 'each')) {
                // Console.assert(['It is illegal to use "*each" directive with "id" attribute together on node "%o"', node], !node.hasAttribute('id'));
                directives.each = directive;
                this.resolveLandmark(node, '"*each" node replaced');
                this.unique = false;
            } else if (Object.is(name, 'exist')) {
                directives.exist = directive;
                this.resolveLandmark(node, '"*exist" node replaced');
                this.unique = false;
            } else if (Object.is(name, 'html') || Object.is(name, 'text')) {
                Console.warn(['❎ Please avoid adding "*html" and "*text" directives together on element "%o"', node], !directives.child);
                directives.child = directive;
            } else {
                if (Object.is(name, 'class')) {
                    if (!this.classNames && node.classList.length) {
                        this.classNames = [...node.classList].map(className => className.trim());
                    }
                } else if (Object.is(name, 'style')) {
                    if (!this.styles) {
                        const { style } = node;
                        const styleKeys = [...style];
                        if (styleKeys.length) {
                            this.inlineStyle = node.getAttribute('style');
                            this.styles = emptyObjectCreator();
                            forEach(styleKeys, key => {
                                const value = style[key];
                                const priority = style.getPropertyPriority(key);
                                this.styles[key] = priority ? `${ value } !${ priority }` : value;
                            });
                        }
                    }
                } else if (!decorators.oneway) { // validate two-way data binding
                    const { tagName } = node;
                    const { change } = decorators;
                    const directiveNameTable = twoWayDataBindingTable[tagName];
                    if (directiveNameTable) {
                        const table = directiveNameTable[name];
                        if (table) {
                            let eventNames = [];
                            if (Object.is(table, daggerChangeEventName)) {
                                eventNames = [daggerChangeEventName];
                            } else if (isShoelaceElement(tagName)) {
                                eventNames = change ? ['sl-change'] : table;
                            } else if (Object.is(table, true) || table[node.type] || table['*']) {
                                eventNames = Object.is(name, 'focus') ? ['blur', 'focus'] : [change ? 'change' : 'input'];
                            }
                            if (eventNames.length) {
                                decorators.capture = true; // useCapture
                                eventNames.forEach(event => directives.eventHandlers.push(directiveResolver(`Object.is(${ value }, _$data_) || (${ value } = _$data_)`, Object.assign({ event }, fields), '$node, _$data_')));
                            }
                        }
                    }
                }
                directives.controllers.push(directive);
            }
        }
    }
    resolveLandmark (node, message) {
        if (this.landmark) {
            return;
        }
        this.landmark = landmarkCreator();
        this.promises.push(promisor.then(() => node.replaceWith(this.landmark) || message));
        return this.landmark;
    }
    resolveViewModule (moduleProfile) {
        const { module } = moduleProfile;
        const { path } = moduleProfile;
        const isViewModule = module instanceof NodeProfile;
        if (!isViewModule) {
            moduleProfile = moduleProfile.fetchChild('view');
        }
        const view = isViewModule ? module : moduleProfile.module;
        Console.assert(`"${ path }" or "${ path }.view" is not a valid view module`, view instanceof NodeProfile);
        this.children = view.children;
        this.moduleProfile = moduleProfile;
        this.defaultSlotScope = view.defaultSlotScope;
        if (Object.keys(this.defaultSlotScope).length) {
            const slotScope = {}, emptySlot = '_$slot_', slotDirective = '@slot';
            forEach(this.node.children, container => {
                if (container.hasAttribute(slotDirective)) {
                    const slotValue = container.getAttribute(slotDirective).trim();
                    const slotName = `${ emptySlot }${ slotValue }`;
                    directiveAttributeResolver(container, slotDirective, slotValue);
                    container.removeAttribute(slotDirective);
                    slotScope[slotName] = Object.is(container.tagName, 'TEMPLATE') ? container.innerHTML : container.outerHTML;
                }
            });
            if (Reflect.has(this.defaultSlotScope, emptySlot) && !Reflect.has(slotScope, emptySlot) && this.node.innerHTML) {
                slotScope[emptySlot] = this.node.innerHTML;
            }
            this.slotScope = Object.assign({}, this.defaultSlotScope, slotScope);
        }
    }
};
