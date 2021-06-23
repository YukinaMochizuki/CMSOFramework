# CMSOFramework
It is a single-page application javascript framework. Support template variable and dynamic rendering.

## General Information
- Project status: **Archived**, because the technology used is outdated
- Last update: Jun 26, 2018 Release v0.1.0a
- Last commit: Jun 22, 2021 Update README and Add example

## Table of Contents
- Dependencies
- Architecture
- Setup
- Usage and example


## Dependencies
- jquery >= 3.2.1
- lodash >= 4

## Architecture
- Component: Define template, rendering function and main function
- Container: Define a component's parent and binding node
- Structure: Define a structure composed of container(s)
- Page: Define a page composed of structure(s) and route matching

## Setup

```html
<script src="https://cdn.jsdelivr.net/gh/YukinaMochizuki/CMSOFramework@v0.1.0a/js/src/CmspaJS.main.js"></script>
```

## Usage and example

### Entry element

index.html
````html
<body>
    <div cms-app>
    </div>
</body>
````

### Setting and bootstrap

index.html
```html
<script>
    let component1 = cmspa.component({
        name: "Main",
        template: "main.html",
        renderingFunction: function() {
            return [{
                    key: "username",
                    value: "This is user value"
                }]
        }
    });

    let component2 = cmspa.component({
        name: "Item",
        template: "item.html",
        mainFunction: function(Jhtml) {
            console.log("main function");
        },
        renderingFunction: function() {
            return [{
                    key: "item",
                    value: "This is item value"
                }]
        }
    });

    /**
     * cmspa.container
     * @param {Component} component - components to be packaged 
     * @param {string | string[]} childNodeArray - public child node (The tag containing cms-comb), default []
     * @param {Component} parent - parent component, default null
     * @param {string} parentNode - binding node in parent, default root in structure
     */
    let container1 = cmspa.container(component1, "comb-item");
    let container2 = cmspa.container(component2, [], container1, "comb-item");

    let structure = cmspa.structure([container1, container2]);
    let page = cmspa.page(structure, {
        name: "index", //route matching, use 'index' to match the root URL
    });

    cmspa.bootstrap();
</script>
```

### Template

> CSS Framework used Tailwind CSS

main.html
```html
<div class="bg-gray-200" cms-comb="comb-item">
    <div class="bg-blue-400">
        <div>header</div>
        <div>username: {{username}}</div>
    </div>
</div>
```

item.html
```html
<div class="text-indigo-700">
        item: {{item}}
</div>
```

### Result

![](https://i.imgur.com/x8C77nI.png)
