/* ************************************************************************
 *  <copyright file="Router.mjs" company="DAGGER TEAM">
 *  Copyright (c) 2016, 2026 All Right Reserved
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

import Console from './Console.mjs';
import { moduleNameRegExp } from './constants.mjs';
import { isString, isFunction, isObject, arrayNormalizer } from './utils.mjs';

export const Router = class {
    constructor (route, parent = null) {
        const { children, constants = {}, variables = {}, modules = [], tailable = false, redirect = '' } = route;
        this.layer = parent ? (parent.layer + 1) : 0;
        const space = new Array(this.layer * 4).fill(' ').join('');
        let path = isString(route.path) ? (route.path || '').trim() : route.path;
        this.modules = arrayNormalizer(modules);
        Console.assert([`${ space }The "modules" field of route should be either "string" or "string array" matched RegExp "${ moduleNameRegExp.toString() }" instead of "%o"`, modules], this.modules.every(module => isString(module) && moduleNameRegExp.test(module)));
        if (parent) {
            (!path || Object.is(path, '*')) && (path = '.+');
            this.path = `${ parent.path }/${ path }`;
        } else {
            Console.warn(`${ space }❎ The "path" field of the root route will be ignored`, !Reflect.has(route, 'path'));
            path = '';
            this.path = '';
        }
        Console.log(`${ space }⏳ resolving the ${ this.path ? `route with path "${ this.path }"` : 'root route' }`);
        if (redirect) {
            Console.assert([`${ space }The "redirect" field of route should be either "string" or "function" instead of "%o"`, redirect], isString(redirect) || isFunction(redirect));
            this.redirectPath = isFunction(redirect) ? redirect(runtime.rootScope, runtime.rootNamespace.module) : redirect;
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
        if (children) {
            Console.assert([`${ space }The route's "children" field should be "array" instead of "%o"`, children], Array.isArray(children));
            this.children = children.map(child => new Router(child, this));
        }
        this.tailable = tailable || !this.children?.length;
        Console.log(`${ space }✅ resolved the ${ this.path ? `route with path "${ this.path }"` : 'root route' }`);
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
};
