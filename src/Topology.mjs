/* ************************************************************************
 *  <copyright file="Topology.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { meta, promisor, originalSetAdd, originalSetDelete, DispatchMode } from './constants.mjs';
import { emptyObjectCreator, forEach, isObject, ownKeys } from './utils.mjs';
import { runtime } from './runtime.mjs';

export const Topology = class {
    constructor (parent, name, value) {
        this.value = value;
        this.oldValue = value;
        this.parent = null;
        this.controllerSet = new Set;
        this.children = emptyObjectCreator();
        this.name = name;
        if (parent) {
            parent.children[name] = this;
            this.parent = parent;
        }
    }
    dispatch (source = DispatchMode.bubble) {
        Console.assert('It is illegal to modify fields under "$route" of the rootScope', runtime.isRouterWritable || !Object.is(runtime.routerTopology, this.parent));
        Object.is(source, DispatchMode.mutation) || (this.parent && this.parent.parent && this.parent.dispatch(DispatchMode.bubble));
        const force = Object.is(source, DispatchMode.bubble);
        (this.value && this.value[meta]) ? this.value[meta].forEach(topology => topology.trigger(force)) : this.trigger(force);
    }
    fetch (name, value) {
        const topology = this.children[name] || new Topology(this, name, value);
        if (value && value[meta]) {
            originalSetAdd.call(value[meta], topology);
        }
        return topology;
    }
    subscribe () {
        if (runtime.currentController) {
            originalSetAdd.call(runtime.currentController.topologySet, this);
            originalSetAdd.call(this.controllerSet, runtime.currentController);
            const { parent } = this;
            parent && parent.parent && parent.unsubscribe(runtime.currentController);
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
        forEach(ownKeys(this.children), key => this.children[key].update((newValue || emptyObjectCreator())[key], DispatchMode.mutation));
    }
};
