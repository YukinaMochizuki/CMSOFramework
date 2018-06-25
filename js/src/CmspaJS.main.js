/*!
 * CmsoJS JavaScript Library v0.1.0a
 * https://github.com/YukinaMochizuki
 *
 *
 * Date: 2018-05-21
 */
(function (global, $) {
    let emptyFunction = function () {
    };

    let config = {};
    let nowPage;
    let page = {};

    class EventManager {
        constructor() {
            this.source = "EventManager";
            this.eventListener = [];
        }

        registerListener(eventBusUnit) {
            this.eventListener.push(eventBusUnit);
        }

        eventPost(eventType) {
            this.eventListener.forEach(function (value, index, ar) {
                if (eventType === value.eventType) {
                    value.callback();
                }
            })
        }
    }

    class EventBusUnit {
        constructor(callback, eventType) {
            this.callback = callback;
            this.eventType = eventType;
        }
    }


    class componentFactory {
        constructor(object, type) {
            if (typeof object.name === "undefined") throw new ReferenceError("Component name undefined");
            else this.name = object.name;

            if (typeof object.template === "undefined") throw new ReferenceError("Component template undefined");
            this.template = object.template;

            this.dynamicRendering = object.dynamicRendering | false;

            if (typeof object.renderingFunction === "undefined") this.renderingFunction = emptyFunction;
            else this.renderingFunction = object.renderingFunction;

            if (typeof object.mainFunction === "undefined") this.mainFunction = emptyFunction;
            else this.mainFunction = object.mainFunction;

            this.inject = object.inject | false;

            if (type === "frame") {
                this.type = "frame";
            } else if (type === "component") {
                this.type = "component";
            } else {
                throw new ReferenceError("Type undefined");
            }
        }
    }

    class containerFactory {
        constructor(component, childNodeArray, parent, parentNode, override) {
            if (typeof component === "undefined") throw new ReferenceError("Container component undefined");
            else this.component = component;

            if (Array.isArray(childNodeArray)) this.childNodeArray = childNodeArray;
            else if (typeof childNodeArray === "string") this.childNodeArray = [childNodeArray];
            else this.childNodeArray = [];

            if (typeof override !== "undefined") {

                if (typeof override.dynamicRenderingFunction !== "undefined" && typeof override.dynamicRenderingFunction !== "function")
                    throw new Error("Container's override dynamicRenderingFunction must be a function");

                else if (typeof override.renderingFunction !== "undefined" && typeof override.renderingFunction !== "function")
                    throw new Error("Container's override renderingFunction must be a function");

                else if (typeof override.mainFunction !== "undefined" && typeof override.mainFunction !== "function")
                    throw new Error("Container's override mainFunction must be a function");

                this.override = override;
            }

            this.parent = parent;

            this.parentNode = parentNode;
            this.type = "container";

            this.childArray = [];

            this.registerParent();
        }

        setNewParent(parent, parentNode) {
            let newClone = Object.assign({}, this);

            if (typeof parent === "undefined") throw new ReferenceError("Container parent undefined");
            else newClone.parent = parent;

            if (typeof parentNode === "undefined") throw new ReferenceError("Container parentNode undefined");
            else newClone.parentNode = parentNode;

            newClone.registerParent();
            return newClone;
        }

        registerParent() {
            if (this.parent) this.parent.childArray.push(this);
        }
    }

    class structureFactory {
        constructor(containerArray, childNodeArray) {
            if (typeof containerArray === "undefined" || !Array.isArray(containerArray))
                throw new ReferenceError("Structure container array undefined");
            else this.containerArray = containerArray;

            // if(Array.isArray(childNodeArray) || typeof childNodeArray === "undefined")this.childNodeArray = childNodeArray | false;
            if (Array.isArray(childNodeArray)) {
                childNodeArray.map(function (value) {
                    if (typeof value.extended === "undefined") throw new ReferenceError("Structure's child extended not find");
                    else if (typeof value.node === "undefined") throw new ReferenceError("Structure's child node not find");

                    if (typeof value.extended === "object") value.extended = [value.extended];
                    if (!Array.isArray(value.node)) throw new Error("Structure's child node must be a array");
                }, this);

                this.childNodeArray = childNodeArray;
            } else if (typeof childNodeArray === "object") {
                if (typeof childNodeArray.extended === "undefined") throw new ReferenceError("Structure's extended not find");
                else if (typeof childNodeArray.node === "undefined") throw new ReferenceError("Structure's node not find");

                if (typeof value.extended === "object") value.extended = [value.extended];
                if (!Array.isArray(value.node)) throw new Error("Structure's child node must be a array");

                this.childNodeArray = [childNodeArray];
            } else this.childNodeArray = [];

            this.type = "structure";
            this.childArray = [];
            this.root = [];
        }

        setNewParent(parent, parentNode) {
            let newClone = Object.assign({}, this);

            if (typeof parent === "undefined") throw new ReferenceError("Structure parent undefined");
            else newClone.parent = parent;

            if (typeof parentNode === "undefined") throw new ReferenceError("Structure parent node undefined");
            else newClone.parentNode = parentNode;

            newClone.registerParent(parent);
            return newClone;
        }

        registerParent(parent) {
            if (parent) this.parent.childArray.push(this);
        }
    }

    class pageFactory {
        constructor(structureArray, configObject) {
            if (typeof structureArray === "undefined") throw new ReferenceError("Page structure array undefined");
            else if (Array.isArray(structureArray)) {
                this.structureArray = structureArray;
            }
            else if (structureArray.type === "structure") {
                this.structureArray = [structureArray];
            }
            else {
                throw new ReferenceError("Unknown structure or container data type");
            }

            if (typeof configObject.name === "undefined") throw new ReferenceError("Page name undefined");
            else this.name = configObject.name;

            if (typeof configObject.mainFunction === "undefined") this.mainFunction = emptyFunction;
            else this.mainFunction = configObject.mainFunction;

            this.inject = configObject.inject | false;
            this.module = configObject.module | false;
            this.containerCount = 0;
            this.nowContainerCount = 0;


            this.root = [];

            let command = "page." + this.name + "=this;";
            eval(command);
        }
    }

    let cmspa = {
        //public member
        config: {},

        //main function
        bootstrap: function (pageChange) {
            let cmspaObject = this;
            let source = "bootstrap";

            let httpGETAjaxArray = [];

            loggerInfo("Starting boot CMSPA");

            setConfig();
            loggerDebugObject(config);

            let eventManager = new EventManager();

            let cmsApp = $("[cms-app]");
            if (cmsApp.length === 0) {
                throw new ReferenceError("cms-app not find");
            }
            cmsApp.hide();

            if(cmsApp.find("*").length !== 0)cmsApp.each().empty();

            if (window.location.hash !== "" && config.openRouter) config.router = window.location.hash.substring(1);
            else config.router = "index";
            loggerDebug("In first promise");
            loggerDebugObject(eval("page." + config.router + ";"));

            setTimeout(function () {
                loadPage(eval("page." + config.router + ";"));

                setTimeout(function () {
                    let httpAjaxpromise = $.when.apply($, httpGETAjaxArray);

                    httpAjaxpromise.done(function () {
                        buildPage(eval("page." + config.router + ";"));

                        cmsApp.show();
                        setTimeout(function () {
                            loggerDebugObject("Run page main function");
                            nowPage.mainFunction();
                            // loggerDebugObject(nowPage.containerCount);
                            // loggerDebugObject(nowPage.nowContainerCount);
                            //    TODO bug
                        }, 110)
                    });
                }, 0);
            }, 0);

            //private function
            function setConfig() {
                config = {
                    //app
                    debug: cmspaObject.config.debug | true,
                    SPAMode: cmspaObject.config.SPAMode | true,
                    openRouter: cmspaObject.config.openRouter | true,

                    //toast
                    useToastr: cmspaObject.config.useToastr | true,
                    useToastrError: cmspaObject.config.useToastrError | false,
                    customToastrConfig: cmspaObject.config.customToastrConfig | false,

                    // loading ui
                    blockUIFunction: cmspaObject.config.blockUIFunction | false,
                    unblockUIFunction: cmspaObject.config.unblockUIFunction | false
                };
            }

            function test() {
            }

            function loadPage(page) {
                let that = {page, cmspaObject};

                if (typeof page === "undefined") throw new ReferenceError("Page name not find");
                else {
                    page.structureArray.map(loadStructure, that);
                    if (page.root.length === 0) throw new Error("Root structure not find");
                }

                setTimeout(function () {
                    page.structureArray.map(function (structure) {
                        structure.childNodeArray.map(function (childObject) {
                            childObject.extended.map(function (extendedContainer) {
                                if (childObject.containerArray.indexOf(extendedContainer) === -1)
                                    throw new Error("Can not find the extended child in structure's container array");
                            });

                            setTimeout(function () {
                                childObject.node.map(function (extendedNode) {
                                    let findExtendedNodeFlag = 0;
                                    childObject.extended.map(function (extendedContainer) {
                                        if (extendedContainer.childNodeArray.indexOf(extendedNode) !== -1) findExtendedNodeFlag++;
                                    });

                                    setTimeout(function () {
                                        if (findExtendedNodeFlag === 0) throw new Error("Can not find the extended node in structure's extended child");
                                        else if (findExtendedNodeFlag > 1) throw new Error("The extended node only can be had one same extended child");
                                    }, 0)
                                })
                            }, 0)
                        })
                    }, that);
                }, 0)
            }

            function loadStructure(structure, that) {
                if (typeof that === "number" || typeof that === "undefined") that = this;
                let thatThat = {structure, cmspaObject, page : this.page};

                if (structure.parentNode === "root" || typeof structure.parentNode === "undefined") {
                    that.page.root.push(structure);
                    structure.parentNode = "root";
                }

                setTimeout(function () {
                    structure.containerArray.map(loadContainer, thatThat);

                    setTimeout(function () {
                        structure.containerArray.map(function (container) {
                            if (container.parent) {
                                if (structure.containerArray.indexOf(container.parent) === -1 ||
                                    container.parent.childNodeArray.indexOf(container.parentNode) === -1)
                                    throw new Error("The container \"" + container.parentNode + "\" parent or parent node not find");
                            }
                        }, thatThat);
                    })
                }, 0);
            }

            function loadContainer(container, thatThat) {
                if (typeof thatThat === "number" || typeof thatThat === "undefined") thatThat = this;
                let that = {container, cmspaObject};

                if (container.parentNode === "root" || typeof container.parentNode === "undefined") {
                    thatThat.structure.root.push(container);
                    container.parentNode = "root";
                }

                httpGETAjaxArray.push($.get(container.component.template, function (data) {
                    container.component.Jhtml = $(data);

                    container.htmlCombineObject = parseHtml(container.component.Jhtml);
                    loggerDebugObject("htmlCombineObject loading done");
                    container.childNodeArray.map(function (value, index, array) {
                        if (this.container.htmlCombineObject.combineArrayValue.indexOf(value) === -1)
                            throw new ReferenceError("The child(comb) \"" + value + "\" in html is not be index");
                    }, that)
                }));

                thatThat.page.containerCount = thatThat.page.containerCount + 1;
            }

            function buildPage(page) {
                loggerDebugObject("Starting deep clone page object");
                let newPage = _.cloneDeep(page);
                let oldPage = nowPage;
                nowPage = newPage;

                newPage.root.map(async (structure) => buildRootStructure(structure));
            }

            function buildRootStructure(structure) {
                buildStructure(structure);

                setTimeout(() => structure.childArray.map(buildRootStructure), 0)
            }

            function buildStructure(structure) {
                if (structure.parentNode === "root") structure.rootNode = cmsApp;

                loggerDebugObject(structure.root);
                structure.root.map(buildRootContainer, structure);
            }

            async function buildRootContainer(container) {
                buildContainer(container, this);

                setTimeout(() => container.childArray.map(buildRootContainer), 100)
            }

            function buildContainer(container, structure) {
                if (container.component.dynamicRendering) {
                    let parent = container.parent;
                    if (typeof container.component.renderingFunction === "string")
                        $.get(container.component.renderingFunction, function (data, status) {
                            let renderObject = $.parseJSON(data);
                            if(typeof renderObject === "undefined")renderObject = [];

                            renderObject.map(async function (value, index, array) {
                                let newContainer = _.cloneDeep(container);

                                // newContrainer.htmlCombineObject.renderingAndBindValue.map(function (renderingAndBindValueObject) {
                                //     if (eval("typeof value." + renderingAndBindValueObject.key) !== "undefined") {
                                //         let renderingAndBindValue = eval("value." + renderingAndBindValueObject.key);
                                //         renderingAndBindValueObject.Jhtml.text(renderingAndBindValue);
                                //     } else renderingAndBindValueObject.Jhtml.text("");
                                // });

                                $.get(container.component.template, function (data) {
                                    let Jhtml = $(data);
                                    value.map(function (object, index, array) {
                                        Jhtml.html(Jhtml.html().replace("{{" + object.key + "}}",object.value));
                                        // loggerDebugObject(newContainer.component.Jhtml.html());
                                        // loggerDebugObject("---")
                                    });
                                    if (newContainer.parentNode === "root") {
                                        Jhtml.appendTo(structure.rootNode);
                                    }
                                    else {
                                        let command = "Jhtml.appendTo($(\"[cms-comb=" + newContainer.parentNode + "]\"));";

                                        eval(command);
                                    }
                                });

                                // value.map(function (object, index, array) {
                                //     newContainer.component.Jhtml.html(newContainer.component.Jhtml.html().replace("{{" + object.key + "}}",object.value));
                                // });
                                //
                                // setTimeout(function () {
                                //     if (newContainer.parentNode === "root") {
                                //         newContainer.component.Jhtml.appendTo(structure.rootNode);
                                //         setTimeout(function () {
                                //             container.component.mainFunction(newContainer.component.Jhtml);
                                //             //    TODO 依賴注入
                                //         })
                                //     }
                                //     else {
                                //         let JNode = undefined;
                                //         parent.htmlCombineObject.combineArray.map(function (value, index, array) {
                                //             if (value.attr("cms-comb") === newContainer.parentNode) JNode = value
                                //         });
                                //
                                //         setTimeout(function () {
                                //             newContainer.component.Jhtml.appendTo(JNode);
                                //
                                //             setTimeout(function () {
                                //                 newContainer.component.mainFunction(newContainer.component.Jhtml);
                                //                 //    TODO 依賴注入
                                //             })
                                //         }, 0);
                                //     }
                                // }, 0)
                            })
                        });
                    else {
                        let renderObject = container.component.renderingFunction();
                        if(typeof renderObject === "undefined")renderObject = [];

                        setTimeout(function () {
                            renderObject.map(function (value, index, array) {
                                let newContainer = _.cloneDeep(container);

                                // newContrainer.htmlCombineObject.renderingAndBindValue.map(function (renderingAndBindValueObject) {
                                //     if (eval("typeof value." + renderingAndBindValueObject.key) !== "undefined") {
                                //         let renderingAndBindValue = eval("value." + renderingAndBindValueObject.key);
                                //         renderingAndBindValueObject.Jhtml.text(renderingAndBindValue);
                                //     } else renderingAndBindValueObject.Jhtml.text("");
                                // });

                                $.get(container.component.template, function (data) {
                                    let Jhtml = $(data);
                                    value.map(function (object, index, array) {
                                        Jhtml.html(Jhtml.html().replace("{{" + object.key + "}}",object.value));
                                        // loggerDebugObject(newContainer.component.Jhtml.html());
                                        // loggerDebugObject("---")
                                    });
                                    if (newContainer.parentNode === "root") {
                                        Jhtml.appendTo(structure.rootNode);
                                    }
                                    else {
                                        let command = "Jhtml.appendTo($(\"[cms-comb=" + newContainer.parentNode + "]\"));";

                                        eval(command);
                                    }
                                });
                                //TODO 優化寫法


                                // setTimeout(function () {
                                //     if (newContainer.parentNode === "root") {
                                //         newContainer.component.Jhtml.appendTo(structure.rootNode);
                                //
                                //         setTimeout(function () {
                                //             container.component.mainFunction(newContainer.component.Jhtml);
                                //             //    TODO 依賴注入
                                //         })
                                //     }
                                //     else {
                                //         // let JNode = undefined;
                                //         // parent.htmlCombineObject.combineArray.map(function (value, index, array) {
                                //         //     if (value.attr("cms-comb") === newContainer.parentNode) JNode = value;
                                //         // });
                                //
                                //         setTimeout(function () {
                                //             // let command = "newContainer.component.Jhtml.appendTo($(\"[cms-comb=" + newContainer.parentNode + "]\"));";
                                //             //
                                //             // eval(command);
                                //
                                //             setTimeout(function () {
                                //                 newContainer.component.mainFunction(newContainer.component.Jhtml);
                                //                 //    TODO 依賴注入
                                //             })
                                //         }, 0);
                                //     }
                                // }, 100)
                            })
                        }, 0);
                    }
                } else {
                    if (typeof container.component.renderingFunction === "string")
                        $.get(container.component.renderingFunction, function (data, status) {
                            let renderArray = $.parseJSON(data);
                            if(typeof renderArray === "undefined")renderArray = [];

                            setTimeout(function () {
                                // container.htmlCombineObject.renderingAndBindValue.map(function (renderingAndBindValueObject) {
                                //     if (eval("typeof renderObject." + renderingAndBindValueObject.key) !== "undefined") {
                                //         let renderingAndBindValue = eval("renderObject" + renderingAndBindValueObject.key);
                                //         renderingAndBindValueObject.Jhtml.text(renderingAndBindValue);
                                //     } else renderingAndBindValueObject.Jhtml.text("");
                                // });

                                renderArray.map(function (renderObject) {
                                    container.component.Jhtml.html(container.component.Jhtml.html().replace("{{" + renderObject.key + "}}",renderObject.value));
                                });

                                setTimeout(function () {
                                    if (container.parentNode === "root") {
                                        container.component.Jhtml.appendTo(structure.rootNode);

                                        setTimeout(function () {
                                            container.component.mainFunction(container.component.Jhtml);
                                            //    TODO 依賴注入
                                        })
                                    }
                                    else {
                                        let JNode = undefined;
                                        container.parent.htmlCombineObject.combineArray.map(function (value, index, array) {
                                            if (value.attr("cms-comb") === container.parentNode) JNode = value;
                                        });

                                        setTimeout(function () {
                                            container.component.Jhtml.appendTo(JNode);

                                            setTimeout(function () {
                                                container.component.mainFunction(container.component.Jhtml);
                                                //    TODO 依賴注入
                                            })
                                        }, 0);
                                    }
                                }, 0)
                            }, 0)
                        });
                    else {
                        let renderArray = container.component.renderingFunction();
                        if(typeof renderArray === "undefined")renderArray = [];

                        setTimeout(function () {
                            renderArray.map(function (renderObject) {
                                container.component.Jhtml.html(container.component.Jhtml.html().replace("{{" + renderObject.key + "}}",renderObject.value));
                            });

                            // container.htmlCombineObject.renderingAndBindValue.map(function (renderingAndBindValueObject) {
                            //     if (eval("typeof renderObject." + renderingAndBindValueObject.key) !== "undefined") {
                            //         let renderingAndBindValue = eval("renderObject" + renderingAndBindValueObject.key);
                            //         renderingAndBindValueObject.Jhtml.text(renderingAndBindValue);
                            //     } else renderingAndBindValueObject.Jhtml.text("");
                            // })
                        }, 0);

                        setTimeout(function () {
                            if (container.parentNode === "root") {
                                container.component.Jhtml.appendTo(structure.rootNode);

                                setTimeout(function () {
                                    container.component.mainFunction(container.component.Jhtml);
                                    //    TODO 依賴注入
                                })
                            }
                            else {
                                let JNode = undefined;
                                container.parent.htmlCombineObject.combineArray.map(function (value, index, array) {
                                    if (value.attr("cms-comb") === container.parentNode) JNode = value;
                                });

                                setTimeout(function () {
                                    container.component.Jhtml.appendTo(JNode);

                                    setTimeout(function () {
                                        container.component.mainFunction(container.component.Jhtml);
                                        //    TODO 依賴注入
                                    })
                                }, );
                            }
                        }, 0)
                    }
                }
                nowPage.nowContainerCount = nowPage.nowContainerCount + 1;
            }

            function loggerInfo(message) {
                logger(source, 1, message);
            }

            function loggerDebug(message) {
                logger(source, 0, message)
            }
        },

        debug: function () {
            config.debug = true;
        },

        // Register component
        frame: function (object) {
            return new componentFactory(object, "frame")
        },
        component: function (object) {
            return new componentFactory(object, "component")
        },

        // Register container
        container: function (Component, childNodeArray, parent, parentNode) {
            return new containerFactory(Component, childNodeArray, parent, parentNode)
        },

        structure: function (containerArray, childNodeArray) {
            return new structureFactory(containerArray, childNodeArray)
        },

        // Register page
        page: function (structureArray, configObject) {
            return new pageFactory(structureArray, configObject)
        },
    };

    function parseHtml(Jhtml) {
        let combineArray = [];
        let combineArrayValue = [];
        let renderingAndBindValue = [];

        let firstSelecter = Jhtml.attr("cms-comb");

        if (firstSelecter) {
            combineArray.push(Jhtml);
            combineArrayValue.push(firstSelecter)
        }

        Jhtml.find("[cms-comb]").each(function () {
            combineArray.push($(this));
            if (combineArrayValue.indexOf($(this).attr("cms-comb")) === -1)
                combineArrayValue.push($(this).attr("cms-comb"));
            else throw new Error("The component only can having one same cms-comb value");
        });

        Jhtml.each(function () {
            let nodeText = $(this).contents().filter(function () {
                return this.nodeType === Node.TEXT_NODE;
            }).text();

            if (nodeText.length > 4) {
                if (nodeText.substr(0, 2).indexOf("{{") !== -1 && nodeText.substr(nodeText.length - 2).indexOf("}}")) {
                    let renderingAndBindObject = {Jhtml: $(this)};

                    if (nodeText.substr(2, 5).indexOf("bind:")) {
                        renderingAndBindObject.type = "bind";
                        renderingAndBindObject.key = nodeText.substr(7, nodeText.length - 3);
                    } else {
                        renderingAndBindObject.type = "normal";
                        renderingAndBindObject.key = nodeText.substr(2, nodeText.length - 3);
                    }
                }
            }
        });
        return {combineArray, combineArrayValue, renderingAndBindValue}
    }


    function logger(source, level, message) {
        if (level === 0 && config.debug) {
            console.log("[DEBUG]" + "[" + source + "]: " + message);
        } else if (level === 1) {
            console.log("[INFO]" + "[" + source + "]: " + message);
        } else if (level === 2) {
            console.log("[WARN]" + "[" + source + "]: " + message);
        } else if (level === 3) {
            console.log("[ERROR]" + "[" + source + "]: " + message);
        }
    }

    function loggerDebugObject(object) {
        if (config.debug) console.log(object);
    }

    global.cmspa = C$ = cmspa;
})(window, jQuery);

