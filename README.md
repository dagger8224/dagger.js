# dagger.js

**dagger.js** is a lightweight, zero-boilerplate, pure runtime front-end framework built for developers who value simplicity and performance. It brings a pure HTML + JavaScript development experience with no virtual DOM, no compilation step, and no complex abstractions — just clean, declarative UI.

---

## ✨ Features

- ⚡ **Zero Learning Curve**: Use plain HTML and native JavaScript — no JSX, no DSLs, no build tools required.
- ⚡ **Zero API**: dagger.js works in pure declarative mode, modules and directives provide everything you need to build your application.
- ⚡ **Reactive by Nature**: Automatic UI updates when your data changes — no manual DOM updates.
- ⚡ **Built-in Routing**: Simple, declarative routing system with no third-party dependency.
- ⚡ **Modular by Design**: Clear separation of logic and template, with automatic scoped data.
- ⚡ **Tiny & Fast**: Core runtime is just a few KB, with near-native performance.
- ⚡ **Web Native**: Fully compatible with Web Components (such as ***https://shoelace.style/***) and modern browser APIs.

---

## ✨ Installation

#### Simply insert the following script tag (CDN) insides the head section of the entry html page of your application to setup dagger.js:  
```
<script type="module" crossorigin="anonymous" src="https://cdn.jsdelivr.net/npm/@peakman/dagger.js@0.9.21/dagger.js" defer></script>
```
#### Or install dagger.js via npm:
```
npm install @peakman/dagger.js
```

---

## ✨ Directive Reference

dagger.js provides a set of pre-defined directives to declaratively render UI elements and bind data to them:

| Directive    | Description                             |
| ------------ | --------------------------------------- |
| `*checked`   | Dynamically toggle the checked state    |
| `*class`     | Dynamically toggle class names          |
| `*focus`     | Set focus on element when true          |
| `*text`      | Render plain text                       |
| `*html`      | Render raw HTML                         |
| `*each`      | Loop through an array                   |
| `*exist`     | Conditional rendering                   |
| `*value`     | Two-way binding for input elements      |
| `*selected`  | Dynamically toggle the selected state   |
| `*style`     | Dynamically bind style values           |
| `*watch`     | Run expression when dependencies change |
| `+eventName` | Event binding, e.g., `+click`, `+keyup` |
| `+load`      | Run before the element is created       |
| `+loaded`    | Run after the element is mounted        |
| `+unload`    | Run before the element is removed       |
| `+unloaded`  | Run after the element is removed        |
| `+sentry`    | Router guards                           |
| `@raw`       | Render raw HTML content without parsing |
| `@directive` | Dynamically adding directives           |

📘 [See full directive documentation →](https://daggerjs.org/#/directive/introduction)

---

## ✨ Module Configuration

dagger.js provides a simple and intuitive way to configure reusable modules for your application:

```
<script type="dagger/modules">
    {
        "view_module": "#view",
        "script_module": "#script",
        "style_module": "#style"
        ...
    }
</script>
```

📘 [See full module documentation →](https://daggerjs.org/#/module/introduction)

---

## ✨ Router Configuration

Router is a built-in feature of dagger.js that allows you to easily define routes and handle navigation between them:

```
<script type="dagger/routers">
    {
        "mode": "hash",
        "prefix": "",
        "default": "/",
        "routing": {
            "path": "",
            "tailable": true,
            "constants": {
                "title": "root title",
                "template": "view1"
            },
            "variables": {
                number: 0
            },
            "modules": ["script", "view1"],
            "children": [{
                "path": "parent1",
                "tailable": true,
                "constants": {
                "title": "parent1 title",
                "template": "view2"
                },
                "modules": "view2"
            }]
        }
        ...
    }
</script>
```

📘 [See full router documentation →](https://daggerjs.org/#/router/introduction)

---

## ✨ Demos

#### [CSS Mechanical Keyboard](https://codepen.io/dagger8224/pen/bGKPNwN)
https://github.com/user-attachments/assets/40e1abc5-0e12-454a-801a-faff764457b6

#### [3D Tic Tac Toe](https://codepen.io/dagger8224/pen/RwMedQx)
https://user-images.githubusercontent.com/66679262/184640434-2cc17b9a-2fce-4f4c-adc4-ffe059bb56b2.mp4

#### [Tesla](https://codepen.io/dagger8224/pen/RwMGvPv?editors=1010)
https://user-images.githubusercontent.com/66679262/179399791-241e3ca0-802a-4d15-bde1-28d2ca0f0f1a.mp4

#### [Cards](https://codepen.io/dagger8224/pen/zYWGGOY?editors=1100)
https://user-images.githubusercontent.com/66679262/179399489-a822ebc1-11ec-4b00-b70a-81ac67ea313f.mp4

#### [screensaver](https://codepen.io/dagger8224/pen/rNdOBmB?editors=1010)
https://user-images.githubusercontent.com/66679262/179399677-2a8972ce-0fdf-4ba6-a503-db4fdc604d6f.mp4

#### [Circular Progress Bar](https://codepen.io/dagger8224/pen/dympJXz?editors=1010)
https://user-images.githubusercontent.com/66679262/179399893-e99969a8-4329-4fb0-b4d7-a573d95c91f6.mp4

#### [Color Picker](https://codepen.io/dagger8224/pen/vYRmGJp?editors=1010)
https://user-images.githubusercontent.com/66679262/180006750-83e9427b-1a71-4178-b808-d5b6ccf94577.mp4

#### [Text Animation](https://codepen.io/dagger8224/pen/JjLXppg)
https://user-images.githubusercontent.com/66679262/179400179-5d50cbba-98e6-470a-b58b-cdee007b71e3.mp4

#### [3D Carousel](https://codepen.io/dagger8224/pen/JjLRbmz)
https://user-images.githubusercontent.com/66679262/179400265-ebd5bdbb-0222-454e-96c6-8b43b4d91625.mp4

And more [demos](https://codepen.io/collection/yyLOGj) on how to work with [Shoelace components](https://shoelace.style/components/).

---

## ✨ Contributing

We welcome all contributions! You can help by:

- Reporting bugs and issues

- Submitting pull requests for features or documentation

- Writing tutorials or sharing your use cases

- Spreading the word on social media

---

## ✨ Support Us

If you like dagger.js, you may:

- Star us on GitHub

- Share your projects and demos

- Join the discussions or rise issues

---

## ✨ Resources

- Official Site: https://daggerjs.org  
- Example Projects: https://codepen.io/dagger8224/pens  
- GitHub: https://github.com/dagger8224/dagger.js  
- NPM: https://www.npmjs.com/package/@peakman/dagger.js  

---

## ✨ License

[MIT](https://opensource.org/license/MIT)
