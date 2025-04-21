// 框架内存管理，用于解决变量名重复问题
// 调试日志 window.catvm 把框架功能集中管理，

var dogvm = {};
// 框架运行内存
dogvm.memory = {
    config: {print: true, proxy: true}, // 框架配置：是否打印，是否使用proxy
    htmlelements:{}, // 所有的html节点元素存放位置
    htmlNode: new Map(), //html节点关系
    htmlId: [], //html元素id
    media: {}, //媒体
    cssChose: [], //css选择器
    listeners:{}, // 所有事件存放位置
    log:[], // 环境调用日志统一存放点
    storage:{}, // localStorage 全局存放点
    webgl:{}
}; // 默认关闭打印



// 主要用来保护伪造的函数，使其更难被识别
// 主要用来保护伪造的函数，让其更难识破
;
(() => {
    'use strict';
    // 取原型链上的toString
    const $toString = Function.toString;
    // 取方法名 reload
    const myFunction_toString_symbol = Symbol('('.concat('', ')_', (Math.random() + '').toString(36)));
    const myToString = function () {
        return typeof this == 'function' && this[myFunction_toString_symbol] || $toString.call(this);
    };

    function set_native(func, key, value) {
        Object.defineProperty(func, key, {
            "enumerable": false,  // 不可枚举
            "configurable": true, // 可配置
            "writable": true, // 可写
            "value": value
        })
    }

    delete Function.prototype['toString'];// 删除原型链上的toString
    set_native(Function.prototype, "toString", myToString); // 自定义一个getter方法，其实就是一个hook
    //套个娃，保护一下我们定义的toString，避免js对toString再次toString，如：location.reload.toString.toString() 否则就暴露了
    set_native(Function.prototype.toString, myFunction_toString_symbol, "function toString() { [native code] }");
    this.dogvm.safefunction = (func) => {
        set_native(func, myFunction_toString_symbol, `function ${myFunction_toString_symbol,func.name || ''}() { [native code] }`);
    }; //导出函数到globalThis，更改原型上的toSting为自己的toString。这个方法相当于过掉func的toString检测点
}).call(this);

// 主要用来保护伪造的原型，使其更难被识别
;
(() => {
    'use strict';
    // 自动处理属性的逻辑
    function hookProperties(func) {
        debugger;
        let properties = Object.getOwnPropertyDescriptors(func.prototype);
        // 遍历所有属性
        Object.entries(properties).forEach(([prop, descriptor]) => {
            // 检查是否存在 getter
            if (descriptor.get) {
                // let get_result = descriptor.get;
                // 在原型链上定义属性（添加非法调用检查逻辑）
                Object.defineProperty(func.prototype, prop, {
                    get: function () {
                        debugger;
                        if (this !== func.prototype) {
                            return descriptor.get.call(this); 
                        }
                        throw new TypeError("Illegal invocation");
                    },
                    enumerable: true,
                    configurable: true
                });
            }
        });
    }
    // 将函数导出到全局对象（如 globalThis），并提供接口用于动态处理
    this.dogvm.safeproperty = hookProperties
})();


// 日志调试功能
dogvm.print = {};
dogvm.memory.print = []; // 缓存
dogvm.print.log = function () {
    if (dogvm.memory.config.print) {
        console.table(dogvm.memory.log);
    }
};

dogvm.print.getAll = function () { // 列出所有日志
    if (dogvm.memory.config.print) {
        console.table(dogvm.memory.log);
        console.log(dogvm.memory.print);
    }
};
// 框架代理功能
dogvm.proxy = function (obj) {
    // Proxy 可以多层代理，即 a = new proxy(a); a = new proxy(a);第二次代理
    // 后代理的检测不到先代理的
    if (dogvm.memory.config.proxy == false) {
        return obj
    }
    return new Proxy(obj, {
        set(target, property, value) {
            //console.log({"类型":"set-->","调用者":target,"调用属性":property,"设置值":value});
            dogvm.memory.log.push({"类型":"set-->","调用者":target,"调用属性":property,"设置值":value});
            return Reflect.set(...arguments); //这是一种反射语句，这种不会产生死循环问题
        },
        get(target, property, receiver) {
            const d = Reflect.get(target, property, receiver);
            if(property === Symbol.for('debug.description') || property === Symbol.for('nodejs.util.inspect.custom') || property == "toString"){
                return d;
            }
            //console.log({"类型":"get<--","调用者":target,"调用属性":property,"获取值":d});
            dogvm.memory.log.push({"类型":"get<--","调用者":target,"调用属性":property,"获取值":d});
            return d;  // target中访问属性不会再被proxy拦截，所以不会死循环
        }
    });
}

// Event
var Event = function Event(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(Event);
Object.defineProperties(Event.prototype, {
    [Symbol.toStringTag]: {
        value: "Event",
        configurable: true
    }
});

Object.defineProperty(Event, "NONE",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(Event, "CAPTURING_PHASE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(Event, "AT_TARGET",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(Event, "BUBBLING_PHASE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
// Object.defineProperty(Event.prototype, "type",{"configurable":true,"enumerable":true,"get": function type_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "target",{"configurable":true,"enumerable":true,"get": function target_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "currentTarget",{"configurable":true,"enumerable":true,"get": function currentTarget_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "eventPhase",{"configurable":true,"enumerable":true,"get": function eventPhase_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "bubbles",{"configurable":true,"enumerable":true,"get": function bubbles_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "cancelable",{"configurable":true,"enumerable":true,"get": function cancelable_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "defaultPrevented",{"configurable":true,"enumerable":true,"get": function defaultPrevented_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "composed",{"configurable":true,"enumerable":true,"get": function composed_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "timeStamp",{"configurable":true,"enumerable":true,"get": function timeStamp_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "srcElement",{"configurable":true,"enumerable":true,"get": function srcElement_get(){debugger;},set:undefined, });
// Object.defineProperty(Event.prototype, "returnValue",{"configurable":true,"enumerable":true,"get": function returnValue_get(){debugger;},"set": function returnValue_set(){debugger;},});
// Object.defineProperty(Event.prototype, "cancelBubble",{"configurable":true,"enumerable":true,"get": function cancelBubble_get(){debugger;},"set": function cancelBubble_set(){debugger;},});
Object.defineProperty(Event.prototype, "NONE",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(Event.prototype, "CAPTURING_PHASE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(Event.prototype, "AT_TARGET",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(Event.prototype, "BUBBLING_PHASE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(Event.prototype, "composedPath",{"configurable":true,"enumerable":true,"writable":true,"value": function composedPath(){debugger;},});dogvm.safefunction(Event.prototype.composedPath);
Object.defineProperty(Event.prototype, "initEvent",{"configurable":true,"enumerable":true,"writable":true,"value": function initEvent(){debugger;},});dogvm.safefunction(Event.prototype.initEvent);
Object.defineProperty(Event.prototype, "preventDefault",{"configurable":true,"enumerable":true,"writable":true,"value": function preventDefault(){debugger;},});dogvm.safefunction(Event.prototype.preventDefault);
Object.defineProperty(Event.prototype, "stopImmediatePropagation",{"configurable":true,"enumerable":true,"writable":true,"value": function stopImmediatePropagation(){debugger;},});dogvm.safefunction(Event.prototype.stopImmediatePropagation);
Object.defineProperty(Event.prototype, "stopPropagation",{"configurable":true,"enumerable":true,"writable":true,"value": function stopPropagation(){debugger;},});dogvm.safefunction(Event.prototype.stopPropagation);



// UIEvent
var UIEvent = function UIEvent(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(UIEvent);
Object.defineProperties(UIEvent.prototype, {
    [Symbol.toStringTag]: {
        value: "UIEvent",
        configurable: true
    }
});

// Object.defineProperty(UIEvent.prototype, "view",{"configurable":true,"enumerable":true,"get": function view_get(){debugger;},set:undefined, });
// Object.defineProperty(UIEvent.prototype, "detail",{"configurable":true,"enumerable":true,"get": function detail_get(){debugger;},set:undefined, });
// Object.defineProperty(UIEvent.prototype, "sourceCapabilities",{"configurable":true,"enumerable":true,"get": function sourceCapabilities_get(){debugger;},set:undefined, });
// Object.defineProperty(UIEvent.prototype, "which",{"configurable":true,"enumerable":true,"get": function which_get(){debugger;},set:undefined, });
Object.defineProperty(UIEvent.prototype, "initUIEvent",{"configurable":true,"enumerable":true,"writable":true,"value": function initUIEvent(){debugger;},});dogvm.safefunction(UIEvent.prototype.initUIEvent);
Object.setPrototypeOf(UIEvent.prototype, Event.prototype);
// MouseEvent
var MouseEvent = function MouseEvent(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(MouseEvent);
Object.defineProperties(MouseEvent.prototype, {
    [Symbol.toStringTag]: {
        value: "MouseEvent",
        configurable: true
    }
});

// Object.defineProperty(MouseEvent.prototype, "screenX",{"configurable":true,"enumerable":true,"get": function screenX_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "screenY",{"configurable":true,"enumerable":true,"get": function screenY_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "clientX",{"configurable":true,"enumerable":true,"get": function clientX_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "clientY",{"configurable":true,"enumerable":true,"get": function clientY_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "ctrlKey",{"configurable":true,"enumerable":true,"get": function ctrlKey_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "shiftKey",{"configurable":true,"enumerable":true,"get": function shiftKey_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "altKey",{"configurable":true,"enumerable":true,"get": function altKey_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "metaKey",{"configurable":true,"enumerable":true,"get": function metaKey_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "button",{"configurable":true,"enumerable":true,"get": function button_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "buttons",{"configurable":true,"enumerable":true,"get": function buttons_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "relatedTarget",{"configurable":true,"enumerable":true,"get": function relatedTarget_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "pageX",{"configurable":true,"enumerable":true,"get": function pageX_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "pageY",{"configurable":true,"enumerable":true,"get": function pageY_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "x",{"configurable":true,"enumerable":true,"get": function x_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "y",{"configurable":true,"enumerable":true,"get": function y_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "offsetX",{"configurable":true,"enumerable":true,"get": function offsetX_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "offsetY",{"configurable":true,"enumerable":true,"get": function offsetY_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "movementX",{"configurable":true,"enumerable":true,"get": function movementX_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "movementY",{"configurable":true,"enumerable":true,"get": function movementY_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "fromElement",{"configurable":true,"enumerable":true,"get": function fromElement_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "toElement",{"configurable":true,"enumerable":true,"get": function toElement_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "layerX",{"configurable":true,"enumerable":true,"get": function layerX_get(){debugger;},set:undefined, });
// Object.defineProperty(MouseEvent.prototype, "layerY",{"configurable":true,"enumerable":true,"get": function layerY_get(){debugger;},set:undefined, });
Object.defineProperty(MouseEvent.prototype, "getModifierState",{"configurable":true,"enumerable":true,"writable":true,"value": function getModifierState(){debugger;},});dogvm.safefunction(MouseEvent.prototype.getModifierState);
Object.defineProperty(MouseEvent.prototype, "initMouseEvent",{"configurable":true,"enumerable":true,"writable":true,"value": function initMouseEvent(){debugger;},});dogvm.safefunction(MouseEvent.prototype.initMouseEvent);
Object.setPrototypeOf(MouseEvent.prototype, UIEvent.prototype);
MouseEvent.prototype.type = "mousemove";

// MouseEvent = dogvm.proxy(MouseEvent);


MouseEvent.getMeDog = function getMeDog(data){
    // mouseEvent对象
    let mouseEvent = {};
    Object.defineProperty(mouseEvent, "isTrusted",{"configurable":false,"enumerable":true,"get": function isTrusted_get(){debugger; return "true"},set:undefined, });
    Object.setPrototypeOf(mouseEvent, MouseEvent.prototype);
    mouseEvent.clientX = data.clientX
    mouseEvent.clientY = data.clientY
    mouseEvent.screenX = data.screenX
    mouseEvent.screenY = data.screenY    
    mouseEvent.movementX = data.movementX    
    mouseEvent.movementY = data.movementY
    mouseEvent.pageX = data.pageX
    mouseEvent.pageY = data.pageY
    mouseEvent.offsetX = data.offsetX
    mouseEvent.offsetY = data.offsetY
    return dogvm.proxy(mouseEvent);
};


// CSS对象
var CSS = {};
Object.defineProperty(CSS, Symbol.toStringTag,{"value":"CSS","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CSS, "highlights",{"configurable":true,"enumerable":true,"get": function highlights_get(){debugger; return "[object HighlightRegistry]"},set:undefined, });
Object.defineProperty(CSS, "Hz",{"configurable":true,"enumerable":true,"writable":true,"value": function Hz(){debugger;},});dogvm.safefunction(CSS.Hz);
Object.defineProperty(CSS, "Q",{"configurable":true,"enumerable":true,"writable":true,"value": function Q(){debugger;},});dogvm.safefunction(CSS.Q);
Object.defineProperty(CSS, "cap",{"configurable":true,"enumerable":true,"writable":true,"value": function cap(){debugger;},});dogvm.safefunction(CSS.cap);
Object.defineProperty(CSS, "ch",{"configurable":true,"enumerable":true,"writable":true,"value": function ch(){debugger;},});dogvm.safefunction(CSS.ch);
Object.defineProperty(CSS, "cm",{"configurable":true,"enumerable":true,"writable":true,"value": function cm(){debugger;},});dogvm.safefunction(CSS.cm);
Object.defineProperty(CSS, "cqb",{"configurable":true,"enumerable":true,"writable":true,"value": function cqb(){debugger;},});dogvm.safefunction(CSS.cqb);
Object.defineProperty(CSS, "cqh",{"configurable":true,"enumerable":true,"writable":true,"value": function cqh(){debugger;},});dogvm.safefunction(CSS.cqh);
Object.defineProperty(CSS, "cqi",{"configurable":true,"enumerable":true,"writable":true,"value": function cqi(){debugger;},});dogvm.safefunction(CSS.cqi);
Object.defineProperty(CSS, "cqmax",{"configurable":true,"enumerable":true,"writable":true,"value": function cqmax(){debugger;},});dogvm.safefunction(CSS.cqmax);
Object.defineProperty(CSS, "cqmin",{"configurable":true,"enumerable":true,"writable":true,"value": function cqmin(){debugger;},});dogvm.safefunction(CSS.cqmin);
Object.defineProperty(CSS, "cqw",{"configurable":true,"enumerable":true,"writable":true,"value": function cqw(){debugger;},});dogvm.safefunction(CSS.cqw);
Object.defineProperty(CSS, "deg",{"configurable":true,"enumerable":true,"writable":true,"value": function deg(){debugger;},});dogvm.safefunction(CSS.deg);
Object.defineProperty(CSS, "dpcm",{"configurable":true,"enumerable":true,"writable":true,"value": function dpcm(){debugger;},});dogvm.safefunction(CSS.dpcm);
Object.defineProperty(CSS, "dpi",{"configurable":true,"enumerable":true,"writable":true,"value": function dpi(){debugger;},});dogvm.safefunction(CSS.dpi);
Object.defineProperty(CSS, "dppx",{"configurable":true,"enumerable":true,"writable":true,"value": function dppx(){debugger;},});dogvm.safefunction(CSS.dppx);
Object.defineProperty(CSS, "dvb",{"configurable":true,"enumerable":true,"writable":true,"value": function dvb(){debugger;},});dogvm.safefunction(CSS.dvb);
Object.defineProperty(CSS, "dvh",{"configurable":true,"enumerable":true,"writable":true,"value": function dvh(){debugger;},});dogvm.safefunction(CSS.dvh);
Object.defineProperty(CSS, "dvi",{"configurable":true,"enumerable":true,"writable":true,"value": function dvi(){debugger;},});dogvm.safefunction(CSS.dvi);
Object.defineProperty(CSS, "dvmax",{"configurable":true,"enumerable":true,"writable":true,"value": function dvmax(){debugger;},});dogvm.safefunction(CSS.dvmax);
Object.defineProperty(CSS, "dvmin",{"configurable":true,"enumerable":true,"writable":true,"value": function dvmin(){debugger;},});dogvm.safefunction(CSS.dvmin);
Object.defineProperty(CSS, "dvw",{"configurable":true,"enumerable":true,"writable":true,"value": function dvw(){debugger;},});dogvm.safefunction(CSS.dvw);
Object.defineProperty(CSS, "em",{"configurable":true,"enumerable":true,"writable":true,"value": function em(){debugger;},});dogvm.safefunction(CSS.em);
Object.defineProperty(CSS, "escape",{"configurable":true,"enumerable":true,"writable":true,"value": function escape(){debugger;},});dogvm.safefunction(CSS.escape);
Object.defineProperty(CSS, "ex",{"configurable":true,"enumerable":true,"writable":true,"value": function ex(){debugger;},});dogvm.safefunction(CSS.ex);
Object.defineProperty(CSS, "fr",{"configurable":true,"enumerable":true,"writable":true,"value": function fr(){debugger;},});dogvm.safefunction(CSS.fr);
Object.defineProperty(CSS, "grad",{"configurable":true,"enumerable":true,"writable":true,"value": function grad(){debugger;},});dogvm.safefunction(CSS.grad);
Object.defineProperty(CSS, "ic",{"configurable":true,"enumerable":true,"writable":true,"value": function ic(){debugger;},});dogvm.safefunction(CSS.ic);
Object.defineProperty(CSS, "in", {
    "configurable": true,
    "enumerable": true,
    "writable": true,
    "value": function () {
      debugger;
    },
  });
  dogvm.safefunction(CSS["in"]);
  
Object.defineProperty(CSS, "kHz",{"configurable":true,"enumerable":true,"writable":true,"value": function kHz(){debugger;},});dogvm.safefunction(CSS.kHz);
Object.defineProperty(CSS, "lh",{"configurable":true,"enumerable":true,"writable":true,"value": function lh(){debugger;},});dogvm.safefunction(CSS.lh);
Object.defineProperty(CSS, "lvb",{"configurable":true,"enumerable":true,"writable":true,"value": function lvb(){debugger;},});dogvm.safefunction(CSS.lvb);
Object.defineProperty(CSS, "lvh",{"configurable":true,"enumerable":true,"writable":true,"value": function lvh(){debugger;},});dogvm.safefunction(CSS.lvh);
Object.defineProperty(CSS, "lvi",{"configurable":true,"enumerable":true,"writable":true,"value": function lvi(){debugger;},});dogvm.safefunction(CSS.lvi);
Object.defineProperty(CSS, "lvmax",{"configurable":true,"enumerable":true,"writable":true,"value": function lvmax(){debugger;},});dogvm.safefunction(CSS.lvmax);
Object.defineProperty(CSS, "lvmin",{"configurable":true,"enumerable":true,"writable":true,"value": function lvmin(){debugger;},});dogvm.safefunction(CSS.lvmin);
Object.defineProperty(CSS, "lvw",{"configurable":true,"enumerable":true,"writable":true,"value": function lvw(){debugger;},});dogvm.safefunction(CSS.lvw);
Object.defineProperty(CSS, "mm",{"configurable":true,"enumerable":true,"writable":true,"value": function mm(){debugger;},});dogvm.safefunction(CSS.mm);
Object.defineProperty(CSS, "ms",{"configurable":true,"enumerable":true,"writable":true,"value": function ms(){debugger;},});dogvm.safefunction(CSS.ms);
Object.defineProperty(CSS, "number",{"configurable":true,"enumerable":true,"writable":true,"value": function number(){debugger;},});dogvm.safefunction(CSS.number);
Object.defineProperty(CSS, "pc",{"configurable":true,"enumerable":true,"writable":true,"value": function pc(){debugger;},});dogvm.safefunction(CSS.pc);
Object.defineProperty(CSS, "percent",{"configurable":true,"enumerable":true,"writable":true,"value": function percent(){debugger;},});dogvm.safefunction(CSS.percent);
Object.defineProperty(CSS, "pt",{"configurable":true,"enumerable":true,"writable":true,"value": function pt(){debugger;},});dogvm.safefunction(CSS.pt);
Object.defineProperty(CSS, "px",{"configurable":true,"enumerable":true,"writable":true,"value": function px(){debugger;},});dogvm.safefunction(CSS.px);
Object.defineProperty(CSS, "rad",{"configurable":true,"enumerable":true,"writable":true,"value": function rad(){debugger;},});dogvm.safefunction(CSS.rad);
Object.defineProperty(CSS, "rcap",{"configurable":true,"enumerable":true,"writable":true,"value": function rcap(){debugger;},});dogvm.safefunction(CSS.rcap);
Object.defineProperty(CSS, "rch",{"configurable":true,"enumerable":true,"writable":true,"value": function rch(){debugger;},});dogvm.safefunction(CSS.rch);
Object.defineProperty(CSS, "registerProperty",{"configurable":true,"enumerable":true,"writable":true,"value": function registerProperty(){debugger;},});dogvm.safefunction(CSS.registerProperty);
Object.defineProperty(CSS, "rem",{"configurable":true,"enumerable":true,"writable":true,"value": function rem(){debugger;},});dogvm.safefunction(CSS.rem);
Object.defineProperty(CSS, "rex",{"configurable":true,"enumerable":true,"writable":true,"value": function rex(){debugger;},});dogvm.safefunction(CSS.rex);
Object.defineProperty(CSS, "ric",{"configurable":true,"enumerable":true,"writable":true,"value": function ric(){debugger;},});dogvm.safefunction(CSS.ric);
Object.defineProperty(CSS, "rlh",{"configurable":true,"enumerable":true,"writable":true,"value": function rlh(){debugger;},});dogvm.safefunction(CSS.rlh);
Object.defineProperty(CSS, "s",{"configurable":true,"enumerable":true,"writable":true,"value": function s(){debugger;},});dogvm.safefunction(CSS.s);
Object.defineProperty(CSS, "svb",{"configurable":true,"enumerable":true,"writable":true,"value": function svb(){debugger;},});dogvm.safefunction(CSS.svb);
Object.defineProperty(CSS, "svh",{"configurable":true,"enumerable":true,"writable":true,"value": function svh(){debugger;},});dogvm.safefunction(CSS.svh);
Object.defineProperty(CSS, "svi",{"configurable":true,"enumerable":true,"writable":true,"value": function svi(){debugger;},});dogvm.safefunction(CSS.svi);
Object.defineProperty(CSS, "svmax",{"configurable":true,"enumerable":true,"writable":true,"value": function svmax(){debugger;},});dogvm.safefunction(CSS.svmax);
Object.defineProperty(CSS, "svmin",{"configurable":true,"enumerable":true,"writable":true,"value": function svmin(){debugger;},});dogvm.safefunction(CSS.svmin);
Object.defineProperty(CSS, "svw",{"configurable":true,"enumerable":true,"writable":true,"value": function svw(){debugger;},});dogvm.safefunction(CSS.svw);
Object.defineProperty(CSS, "turn",{"configurable":true,"enumerable":true,"writable":true,"value": function turn(){debugger;},});dogvm.safefunction(CSS.turn);
Object.defineProperty(CSS, "vb",{"configurable":true,"enumerable":true,"writable":true,"value": function vb(){debugger;},});dogvm.safefunction(CSS.vb);
Object.defineProperty(CSS, "vh",{"configurable":true,"enumerable":true,"writable":true,"value": function vh(){debugger;},});dogvm.safefunction(CSS.vh);
Object.defineProperty(CSS, "vi",{"configurable":true,"enumerable":true,"writable":true,"value": function vi(){debugger;},});dogvm.safefunction(CSS.vi);
Object.defineProperty(CSS, "vmax",{"configurable":true,"enumerable":true,"writable":true,"value": function vmax(){debugger;},});dogvm.safefunction(CSS.vmax);
Object.defineProperty(CSS, "vmin",{"configurable":true,"enumerable":true,"writable":true,"value": function vmin(){debugger;},});dogvm.safefunction(CSS.vmin);
Object.defineProperty(CSS, "vw",{"configurable":true,"enumerable":true,"writable":true,"value": function vw(){debugger;},});dogvm.safefunction(CSS.vw);
Object.defineProperty(CSS, "x",{"configurable":true,"enumerable":true,"writable":true,"value": function x(){debugger;},});dogvm.safefunction(CSS.x);
Object.defineProperty(CSS, "paintWorklet",{"configurable":true,"enumerable":true,"get": function paintWorklet_get(){debugger; return "[object Worklet]"},set:undefined, });

Object.defineProperty(CSS, "supports",{"configurable":true,"enumerable":true,"writable":true,
    "value": function supports(){
        if(arguments[0]=="overscroll-behavior" && arguments[1]=="auto"){
            return true;
        }
        debugger;
        return false;
    },});dogvm.safefunction(CSS.supports);

CSS = dogvm.proxy(CSS);
// CSSStyleDeclaration对象
var CSSStyleDeclaration = function CSSStyleDeclaration(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(CSSStyleDeclaration);

Object.defineProperty(CSSStyleDeclaration.prototype, Symbol.toStringTag,{"value":"CSSStyleDeclaration","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CSSStyleDeclaration.prototype, "cssText",{"configurable":true,"enumerable":true,"get": function cssText_get(){debugger; return ""},"set": function cssText_set(){debugger;},});
Object.defineProperty(CSSStyleDeclaration.prototype, "length",{"configurable":true,"enumerable":true,"get": function length_get(){debugger; return "0"},set:undefined, });
Object.defineProperty(CSSStyleDeclaration.prototype, "parentRule",{"configurable":true,"enumerable":true,"get": function parentRule_get(){debugger; return "null"},set:undefined, });
Object.defineProperty(CSSStyleDeclaration.prototype, "cssFloat",{"configurable":true,"enumerable":true,"get": function cssFloat_get(){debugger; return ""},"set": function cssFloat_set(){debugger;},});
Object.defineProperty(CSSStyleDeclaration.prototype, "getPropertyPriority",{"configurable":true,"enumerable":true,"writable":true,"value": function getPropertyPriority(){debugger;},});dogvm.safefunction(CSSStyleDeclaration.prototype.getPropertyPriority);

Object.defineProperty(CSSStyleDeclaration.prototype, "item",{"configurable":true,"enumerable":true,"writable":true,"value": function item(){debugger;},});dogvm.safefunction(CSSStyleDeclaration.prototype.item);
Object.defineProperty(CSSStyleDeclaration.prototype, "removeProperty",{"configurable":true,"enumerable":true,"writable":true,"value": function removeProperty(){debugger;},});dogvm.safefunction(CSSStyleDeclaration.prototype.removeProperty);
Object.defineProperty(CSSStyleDeclaration.prototype, "setProperty",{"configurable":true,"enumerable":true,"writable":true,"value": function setProperty(){debugger;},});dogvm.safefunction(CSSStyleDeclaration.prototype.setProperty);

Object.defineProperty(CSSStyleDeclaration.prototype, "getPropertyValue",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function getPropertyValue(property){
        debugger;
        if (property == 'color'){
            return this.color;
        }
    },});dogvm.safefunction(CSSStyleDeclaration.prototype.getPropertyValue);



dogvm.safeproperty(CSSStyleDeclaration);


////////////////////////////////////// 实列
CSSStyleDeclaration.createCSSStyleDog = function createCSSStyleDog(element){
    // a对象
    debugger;
    let a = Object.create(CSSStyleDeclaration.prototype);
    Object.defineProperty(a,"display",{"configurable":true,"enumerable":true,"get": function display_get(){debugger; return this._display || ""},"set": function display_set(value){debugger;this._display = value;},})
    if(element == undefined){
        return dogvm.proxy(a);
    }
    function setColor(p){
        return p =='green' ? 'rgb(0, 128, 0)' : p=='red' ? 'rgb(255, 0, 0)' : p=='blue' ? 'rgb(0, 0, 255)'  : 'rgb(0, 0, 0)';
    }
    a.color = setColor(element.innerHTML);
    // 获取元素的最开始父节点
    let parentNode = {};
    for (const [key, value] of dogvm.memory.htmlNode ) {
        value.forEach(e => {
            e.innerHTML.includes(element.innerHTML) ? parentNode = key : null;
        });
    }

    for(const css of dogvm.memory.cssChose){
        let dealObj = css.selector.split(':')[0].trim();
        // body相关
        if(parentNode.constructor.name.includes('Body') && dealObj.includes("body")){
            // 有not
            if(css.selector.includes("not")){
                if(css.selector.includes(element.id)){
                    a.color = setColor(element.innerHTML);
                }else   a.color = setColor(css.color);
            }else{
                if(css.selector.includes(element.id)){
                    a.color = setColor(css.color);
                }else   a.color = setColor(element.innerHTML);
            }
        }
        // 不是body  判断是否含义目标
        contains = element.parentList.some(item => dealObj.includes(item));
        if(contains){
            if(css.selector.includes("not")){
                if(css.selector.includes(element.id)){
                    a.color = setColor(element.innerHTML);
                }else   a.color = setColor(css.color);
            }else{
                if(css.selector.includes(element.id)){
                    a.color = setColor(css.color);
                }else   a.color = setColor(element.innerHTML);
            }
        }
    }
    return dogvm.proxy(a);
};dogvm.safefunction(CSSStyleDeclaration.createCSSStyleDog);




// Location
var Location = function Location(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(Location);

Object.defineProperty(Location.prototype, Symbol.toStringTag,{"value":"Location","writable":false,"enumerable":false,"configurable":true});


// location对象
var location = {
    ancestorOrigins: 'https://pintia.cn'
}

// DOMStringList
DOMStringList = function DOMStringList(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(DOMStringList);

Object.defineProperty(DOMStringList.prototype, Symbol.toStringTag,{"value":"DOMStringList","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(DOMStringList.prototype, "length",{"configurable":true,"enumerable":true,"get": function length_get(){debugger;},set:undefined,});
Object.defineProperty(DOMStringList.prototype, "contains",{"configurable":true,"enumerable":true,"writable":true,"value": function contains(){debugger;},});dogvm.safefunction(DOMStringList.prototype.contains);
Object.defineProperty(DOMStringList.prototype, "item",{"configurable":true,"enumerable":true,"writable":true,"value": function item(){debugger;},});dogvm.safefunction(DOMStringList.prototype.item);

DOMStringList.getDOMDog = function getDOMDog(){
    let aaa = {};
    aaa.__proto__ = DOMStringList.prototype;
    return aaa;
};dogvm.safefunction(DOMStringList);

////////////////////////////////////
location.assign = function assign(){debugger;};dogvm.safefunction(location.assign);
location.hash = "";
location.host = "turing.captcha.gtimg.com";
location.hostname = "turing.captcha.gtimg.com";
location.href = "https://turing.captcha.gtimg.com/1/template/drag_ele.html";
location.origin = "https://turing.captcha.gtimg.com";
location.pathname = "/1/template/drag_ele.html";
location.port = "";
location.protocol = "https:";
location.reload = function reload(){debugger;};dogvm.safefunction(location.reload);dogvm.safefunction(location.reload);
location.replace = function replace(){debugger;};dogvm.safefunction(location.replace);dogvm.safefunction(location.replace);
location.search = "";

Object.setPrototypeOf(location, Location.prototype);
var Navigator = function Navigator() { // 构造函数
    throw new TypeError("Illegal constructor");
};
dogvm.safefunction(Navigator);

Object.defineProperties(Navigator.prototype, {
    [Symbol.toStringTag]: {
        value: "Navigator",
        configurable: true
    }
});

navigator = {};
navigator.__proto__ = Navigator.prototype;

////////// 浏览器代码自动生成部分

// Navigator对象
Object.defineProperty(Navigator.prototype, "vendorSub",{"configurable":true,"enumerable":true,"get": function vendorSub_get(){debugger; return ""},set:undefined, });
Object.defineProperty(Navigator.prototype, "productSub",{"configurable":true,"enumerable":true,"get": function productSub_get(){debugger; return "20030107"},set:undefined, });
Object.defineProperty(Navigator.prototype, "vendor",{"configurable":true,"enumerable":true,"get": function vendor_get(){debugger; return "Google Inc."},set:undefined, });
Object.defineProperty(Navigator.prototype, "maxTouchPoints",{"configurable":true,"enumerable":true,"get": function maxTouchPoints_get(){debugger; return "0"},set:undefined, });
Object.defineProperty(Navigator.prototype, "scheduling",{"configurable":true,"enumerable":true,"get": function scheduling_get(){debugger; return "[object Scheduling]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "userActivation",{"configurable":true,"enumerable":true,"get": function userActivation_get(){debugger; return "[object UserActivation]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "doNotTrack",{"configurable":true,"enumerable":true,"get": function doNotTrack_get(){debugger; return "null"},set:undefined, });
Object.defineProperty(Navigator.prototype, "geolocation",{"configurable":true,"enumerable":true,"get": function geolocation_get(){debugger; return "[object Geolocation]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "connection",{"configurable":true,"enumerable":true,"get": function connection_get(){debugger; return "[object NetworkInformation]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "plugins",{"configurable":true,"enumerable":true,"get": function plugins_get(){debugger; return "[object PluginArray]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "mimeTypes",{"configurable":true,"enumerable":true,"get": function mimeTypes_get(){debugger; return "[object MimeTypeArray]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "pdfViewerEnabled",{"configurable":true,"enumerable":true,"get": function pdfViewerEnabled_get(){debugger; return "true"},set:undefined, });
Object.defineProperty(Navigator.prototype, "webkitTemporaryStorage",{"configurable":true,"enumerable":true,"get": function webkitTemporaryStorage_get(){debugger; return "[object DeprecatedStorageQuota]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "webkitPersistentStorage",{"configurable":true,"enumerable":true,"get": function webkitPersistentStorage_get(){debugger; return "[object DeprecatedStorageQuota]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "windowControlsOverlay",{"configurable":true,"enumerable":true,"get": function windowControlsOverlay_get(){debugger; return "[object WindowControlsOverlay]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "hardwareConcurrency",{"configurable":true,"enumerable":true,"get": function hardwareConcurrency_get(){debugger; return 16},set:undefined, });
Object.defineProperty(Navigator.prototype, "cookieEnabled",{"configurable":true,"enumerable":true,"get": function cookieEnabled_get(){debugger; return "true"},set:undefined, });
Object.defineProperty(Navigator.prototype, "appCodeName",{"configurable":true,"enumerable":true,"get": function appCodeName_get(){debugger; return "Mozilla"},set:undefined, });
Object.defineProperty(Navigator.prototype, "appName",{"configurable":true,"enumerable":true,"get": function appName_get(){debugger; return "Netscape"},set:undefined, });
Object.defineProperty(Navigator.prototype, "appVersion",{"configurable":true,"enumerable":true,"get": function appVersion_get(){debugger; return "'5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0'"},set:undefined, });
Object.defineProperty(Navigator.prototype, "platform",{"configurable":true,"enumerable":true,"get": function platform_get(){debugger; return "Win32"},set:undefined, });
Object.defineProperty(Navigator.prototype, "product",{"configurable":true,"enumerable":true,"get": function product_get(){debugger; return "Gecko"},set:undefined, });
Object.defineProperty(Navigator.prototype, "userAgent",{"configurable":true,"enumerable":true,"get": function userAgent_get(){debugger; return "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0'"},set:undefined, });
Object.defineProperty(Navigator.prototype, "language",{"configurable":true,"enumerable":true,"get": function language_get(){debugger; return "zh-CN"},set:undefined, });
Object.defineProperty(Navigator.prototype, "languages",{"configurable":true,"enumerable":true,"get": function languages_get(){debugger; return ['zh-CN', 'en', 'en-GB', 'en-US']},set:undefined, });
Object.defineProperty(Navigator.prototype, "onLine",{"configurable":true,"enumerable":true,"get": function onLine_get(){debugger; return "true"},set:undefined, });
Object.defineProperty(Navigator.prototype, "webdriver",{"configurable":true,"enumerable":true,"get": function webdriver_get(){debugger; return "false"},set:undefined, });
Object.defineProperty(Navigator.prototype, "getGamepads",{"configurable":true,"enumerable":true,"writable":true,"value": function getGamepads(){debugger;},});dogvm.safefunction(Navigator.prototype.getGamepads);
Object.defineProperty(Navigator.prototype, "javaEnabled",{"configurable":true,"enumerable":true,"writable":true,"value": function javaEnabled(){debugger;},});dogvm.safefunction(Navigator.prototype.javaEnabled);
Object.defineProperty(Navigator.prototype, "sendBeacon",{"configurable":true,"enumerable":true,"writable":true,"value": function sendBeacon(){debugger;},});dogvm.safefunction(Navigator.prototype.sendBeacon);
Object.defineProperty(Navigator.prototype, "vibrate",{"configurable":true,"enumerable":true,"writable":true,"value": function vibrate(){debugger;},});dogvm.safefunction(Navigator.prototype.vibrate);
Object.defineProperty(Navigator.prototype, "deprecatedRunAdAuctionEnforcesKAnonymity",{"configurable":true,"enumerable":true,"get": function deprecatedRunAdAuctionEnforcesKAnonymity_get(){debugger; return "false"},set:undefined, });
Object.defineProperty(Navigator.prototype, "protectedAudience",{"configurable":true,"enumerable":true,"get": function protectedAudience_get(){debugger; return "[object ProtectedAudience]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "bluetooth",{"configurable":true,"enumerable":true,"get": function bluetooth_get(){debugger; return "[object Bluetooth]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "storageBuckets",{"configurable":true,"enumerable":true,"get": function storageBuckets_get(){debugger; return "[object StorageBucketManager]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "clipboard",{"configurable":true,"enumerable":true,"get": function clipboard_get(){debugger; return "[object Clipboard]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "credentials",{"configurable":true,"enumerable":true,"get": function credentials_get(){debugger; return "[object CredentialsContainer]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "keyboard",{"configurable":true,"enumerable":true,"get": function keyboard_get(){debugger; return "[object Keyboard]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "managed",{"configurable":true,"enumerable":true,"get": function managed_get(){debugger; return "[object NavigatorManagedData]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "mediaDevices",{"configurable":true,"enumerable":true,"get": function mediaDevices_get(){debugger; return "[object MediaDevices]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "storage",{"configurable":true,"enumerable":true,"get": function storage_get(){debugger; return "[object StorageManager]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "serviceWorker",{"configurable":true,"enumerable":true,"get": function serviceWorker_get(){debugger; return ServiceWorkerContainer.createDog();},set:undefined, });
Object.defineProperty(Navigator.prototype, "virtualKeyboard",{"configurable":true,"enumerable":true,"get": function virtualKeyboard_get(){debugger; return "[object VirtualKeyboard]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "wakeLock",{"configurable":true,"enumerable":true,"get": function wakeLock_get(){debugger; return "[object WakeLock]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "deviceMemory",{"configurable":true,"enumerable":true,"get": function deviceMemory_get(){debugger; return "8"},set:undefined, });
Object.defineProperty(Navigator.prototype, "userAgentData",{"configurable":true,"enumerable":true,"get": function userAgentData_get(){debugger; return "[object NavigatorUAData]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "login",{"configurable":true,"enumerable":true,"get": function login_get(){debugger; return "[object NavigatorLogin]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "ink",{"configurable":true,"enumerable":true,"get": function ink_get(){debugger; return "[object Ink]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "mediaCapabilities",{"configurable":true,"enumerable":true,"get": function mediaCapabilities_get(){debugger; return "[object MediaCapabilities]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "hid",{"configurable":true,"enumerable":true,"get": function hid_get(){debugger; return "[object HID]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "locks",{"configurable":true,"enumerable":true,"get": function locks_get(){debugger; return "[object LockManager]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "gpu",{"configurable":true,"enumerable":true,"get": function gpu_get(){debugger; return "[object GPU]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "mediaSession",{"configurable":true,"enumerable":true,"get": function mediaSession_get(){debugger; return "[object MediaSession]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "permissions",{"configurable":true,"enumerable":true,"get": function permissions_get(){debugger; return "[object Permissions]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "presentation",{"configurable":true,"enumerable":true,"get": function presentation_get(){debugger; return "[object Presentation]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "usb",{"configurable":true,"enumerable":true,"get": function usb_get(){debugger; return "[object USB]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "xr",{"configurable":true,"enumerable":true,"get": function xr_get(){debugger; return "[object XRSystem]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "serial",{"configurable":true,"enumerable":true,"get": function serial_get(){debugger; return "[object Serial]"},set:undefined, });
Object.defineProperty(Navigator.prototype, "adAuctionComponents",{"configurable":true,"enumerable":true,"writable":true,"value": function adAuctionComponents(){debugger;},});dogvm.safefunction(Navigator.prototype.adAuctionComponents);
Object.defineProperty(Navigator.prototype, "runAdAuction",{"configurable":true,"enumerable":true,"writable":true,"value": function runAdAuction(){debugger;},});dogvm.safefunction(Navigator.prototype.runAdAuction);
Object.defineProperty(Navigator.prototype, "canLoadAdAuctionFencedFrame",{"configurable":true,"enumerable":true,"writable":true,"value": function canLoadAdAuctionFencedFrame(){debugger;},});dogvm.safefunction(Navigator.prototype.canLoadAdAuctionFencedFrame);
Object.defineProperty(Navigator.prototype, "canShare",{"configurable":true,"enumerable":true,"writable":true,"value": function canShare(){debugger;},});dogvm.safefunction(Navigator.prototype.canShare);
Object.defineProperty(Navigator.prototype, "share",{"configurable":true,"enumerable":true,"writable":true,"value": function share(){debugger;},});dogvm.safefunction(Navigator.prototype.share);
Object.defineProperty(Navigator.prototype, "clearAppBadge",{"configurable":true,"enumerable":true,"writable":true,"value": function clearAppBadge(){debugger;},});dogvm.safefunction(Navigator.prototype.clearAppBadge);
Object.defineProperty(Navigator.prototype, "getBattery",{"configurable":true,"enumerable":true,"writable":true,"value": function getBattery(){debugger;},});dogvm.safefunction(Navigator.prototype.getBattery);
Object.defineProperty(Navigator.prototype, "getUserMedia",{"configurable":true,"enumerable":true,"writable":true,"value": function getUserMedia(){debugger;},});dogvm.safefunction(Navigator.prototype.getUserMedia);
Object.defineProperty(Navigator.prototype, "requestMIDIAccess",{"configurable":true,"enumerable":true,"writable":true,"value": function requestMIDIAccess(){debugger;},});dogvm.safefunction(Navigator.prototype.requestMIDIAccess);
Object.defineProperty(Navigator.prototype, "requestMediaKeySystemAccess",{"configurable":true,"enumerable":true,"writable":true,"value": function requestMediaKeySystemAccess(){debugger;},});dogvm.safefunction(Navigator.prototype.requestMediaKeySystemAccess);
Object.defineProperty(Navigator.prototype, "setAppBadge",{"configurable":true,"enumerable":true,"writable":true,"value": function setAppBadge(){debugger;},});dogvm.safefunction(Navigator.prototype.setAppBadge);
Object.defineProperty(Navigator.prototype, "webkitGetUserMedia",{"configurable":true,"enumerable":true,"writable":true,"value": function webkitGetUserMedia(){debugger;},});dogvm.safefunction(Navigator.prototype.webkitGetUserMedia);
Object.defineProperty(Navigator.prototype, "clearOriginJoinedAdInterestGroups",{"configurable":true,"enumerable":true,"writable":true,"value": function clearOriginJoinedAdInterestGroups(){debugger;},});dogvm.safefunction(Navigator.prototype.clearOriginJoinedAdInterestGroups);
Object.defineProperty(Navigator.prototype, "createAuctionNonce",{"configurable":true,"enumerable":true,"writable":true,"value": function createAuctionNonce(){debugger;},});dogvm.safefunction(Navigator.prototype.createAuctionNonce);
Object.defineProperty(Navigator.prototype, "joinAdInterestGroup",{"configurable":true,"enumerable":true,"writable":true,"value": function joinAdInterestGroup(){debugger;},});dogvm.safefunction(Navigator.prototype.joinAdInterestGroup);
Object.defineProperty(Navigator.prototype, "leaveAdInterestGroup",{"configurable":true,"enumerable":true,"writable":true,"value": function leaveAdInterestGroup(){debugger;},});dogvm.safefunction(Navigator.prototype.leaveAdInterestGroup);
Object.defineProperty(Navigator.prototype, "updateAdInterestGroups",{"configurable":true,"enumerable":true,"writable":true,"value": function updateAdInterestGroups(){debugger;},});dogvm.safefunction(Navigator.prototype.updateAdInterestGroups);
Object.defineProperty(Navigator.prototype, "deprecatedReplaceInURN",{"configurable":true,"enumerable":true,"writable":true,"value": function deprecatedReplaceInURN(){debugger;},});dogvm.safefunction(Navigator.prototype.deprecatedReplaceInURN);
Object.defineProperty(Navigator.prototype, "deprecatedURNToURL",{"configurable":true,"enumerable":true,"writable":true,"value": function deprecatedURNToURL(){debugger;},});dogvm.safefunction(Navigator.prototype.deprecatedURNToURL);
Object.defineProperty(Navigator.prototype, "getInstalledRelatedApps",{"configurable":true,"enumerable":true,"writable":true,"value": function getInstalledRelatedApps(){debugger;},});dogvm.safefunction(Navigator.prototype.getInstalledRelatedApps);
Object.defineProperty(Navigator.prototype, "getInterestGroupAdAuctionData",{"configurable":true,"enumerable":true,"writable":true,"value": function getInterestGroupAdAuctionData(){debugger;},});dogvm.safefunction(Navigator.prototype.getInterestGroupAdAuctionData);
Object.defineProperty(Navigator.prototype, "registerProtocolHandler",{"configurable":true,"enumerable":true,"writable":true,"value": function registerProtocolHandler(){debugger;},});dogvm.safefunction(Navigator.prototype.registerProtocolHandler);
Object.defineProperty(Navigator.prototype, "unregisterProtocolHandler",{"configurable":true,"enumerable":true,"writable":true,"value": function unregisterProtocolHandler(){debugger;},});dogvm.safefunction(Navigator.prototype.unregisterProtocolHandler);

////////////

////////

dogvm.safeproperty(Navigator);

navigator = dogvm.proxy(navigator);
// Storage对象
var Storage = function Storage(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(Storage);

Object.defineProperty(Storage.prototype, Symbol.toStringTag,{"value":"Storage","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(Storage.prototype, "length",{"configurable":true,"enumerable":true,"get": function length_get(){
    debugger;
    return "3"
},set:undefined, });
Object.defineProperty(Storage.prototype, "clear",{"configurable":true,"enumerable":true,"writable":true,"value": function clear(){debugger;},});dogvm.safefunction(Storage.prototype.clear);
Object.defineProperty(Storage.prototype, "getItem",{"configurable":true,"enumerable":true,"writable":true,"value": function getItem(keyName){
    debugger;
    if(dogvm.memory.storage[keyName] == undefined){
        return null;
    }
    return dogvm.memory.storage[keyName];
},});dogvm.safefunction(Storage.prototype.getItem);
Object.defineProperty(Storage.prototype, "key",{"configurable":true,"enumerable":true,"writable":true,"value": function key(){debugger;},});dogvm.safefunction(Storage.prototype.key);
Object.defineProperty(Storage.prototype, "removeItem",{"configurable":true,"enumerable":true,"writable":true,"value": function removeItem(){debugger;},});dogvm.safefunction(Storage.prototype.removeItem);
Object.defineProperty(Storage.prototype, "setItem",{"configurable":true,"enumerable":true,"writable":true,"value": function setItem(keyName, keyValue){
    debugger;
    dogvm.memory.storage[keyName] = keyValue;
},});dogvm.safefunction(Storage.prototype.setItem);



// localStorage对象
var localStorage = {};
Object.defineProperty(localStorage, "captcha_webworker_supported",{"configurable":true,"enumerable":true,"writable":true,"value":"2",});
Object.defineProperty(localStorage, "user-cache",{"configurable":true,"enumerable":true,"writable":true,"value":'{"theme":"light","loginRedirect":"/"}',});
Object.defineProperty(localStorage, "isWhitelist",{"configurable":true,"enumerable":true,"writable":true,"value":"false",});
Object.setPrototypeOf(localStorage, Storage.prototype);


localStorage = dogvm.proxy(localStorage);


// sessionStorage对象
var sessionStorage = {};
Object.defineProperty(sessionStorage, "_bl_sid",{"configurable":true,"enumerable":true,"writable":true,"value":"gFmhj5bIawep9zks6oysj4z7878h",});
Object.setPrototypeOf(sessionStorage, Storage.prototype);

sessionStorage = dogvm.proxy(sessionStorage);
// WebGLRenderingContext对象
var WebGLRenderingContext = function WebGLRenderingContext(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(WebGLRenderingContext);
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_BUFFER_BIT",{"configurable":false,"enumerable":true,"writable":false,"value":256,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BUFFER_BIT",{"configurable":false,"enumerable":true,"writable":false,"value":1024,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_BUFFER_BIT",{"configurable":false,"enumerable":true,"writable":false,"value":16384,});
Object.defineProperty(WebGLRenderingContext.prototype, "POINTS",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINES",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINE_LOOP",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINE_STRIP",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(WebGLRenderingContext.prototype, "TRIANGLES",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(WebGLRenderingContext.prototype, "TRIANGLE_STRIP",{"configurable":false,"enumerable":true,"writable":false,"value":5,});
Object.defineProperty(WebGLRenderingContext.prototype, "TRIANGLE_FAN",{"configurable":false,"enumerable":true,"writable":false,"value":6,});
Object.defineProperty(WebGLRenderingContext.prototype, "ZERO",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(WebGLRenderingContext.prototype, "SRC_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":768,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_SRC_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":769,});
Object.defineProperty(WebGLRenderingContext.prototype, "SRC_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":770,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_SRC_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":771,});
Object.defineProperty(WebGLRenderingContext.prototype, "DST_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":772,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_DST_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":773,});
Object.defineProperty(WebGLRenderingContext.prototype, "DST_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":774,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_DST_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":775,});
Object.defineProperty(WebGLRenderingContext.prototype, "SRC_ALPHA_SATURATE",{"configurable":false,"enumerable":true,"writable":false,"value":776,});
Object.defineProperty(WebGLRenderingContext.prototype, "FUNC_ADD",{"configurable":false,"enumerable":true,"writable":false,"value":32774,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION",{"configurable":false,"enumerable":true,"writable":false,"value":32777,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION_RGB",{"configurable":false,"enumerable":true,"writable":false,"value":32777,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":34877,});
Object.defineProperty(WebGLRenderingContext.prototype, "FUNC_SUBTRACT",{"configurable":false,"enumerable":true,"writable":false,"value":32778,});
Object.defineProperty(WebGLRenderingContext.prototype, "FUNC_REVERSE_SUBTRACT",{"configurable":false,"enumerable":true,"writable":false,"value":32779,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_DST_RGB",{"configurable":false,"enumerable":true,"writable":false,"value":32968,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_SRC_RGB",{"configurable":false,"enumerable":true,"writable":false,"value":32969,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_DST_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32970,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_SRC_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32971,});
Object.defineProperty(WebGLRenderingContext.prototype, "CONSTANT_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":32769,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_CONSTANT_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":32770,});
Object.defineProperty(WebGLRenderingContext.prototype, "CONSTANT_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32771,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_CONSTANT_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32772,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":32773,});
Object.defineProperty(WebGLRenderingContext.prototype, "ARRAY_BUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":34962,});
Object.defineProperty(WebGLRenderingContext.prototype, "ELEMENT_ARRAY_BUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":34963,});
Object.defineProperty(WebGLRenderingContext.prototype, "ARRAY_BUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":34964,});
Object.defineProperty(WebGLRenderingContext.prototype, "ELEMENT_ARRAY_BUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":34965,});
Object.defineProperty(WebGLRenderingContext.prototype, "STREAM_DRAW",{"configurable":false,"enumerable":true,"writable":false,"value":35040,});
Object.defineProperty(WebGLRenderingContext.prototype, "STATIC_DRAW",{"configurable":false,"enumerable":true,"writable":false,"value":35044,});
Object.defineProperty(WebGLRenderingContext.prototype, "DYNAMIC_DRAW",{"configurable":false,"enumerable":true,"writable":false,"value":35048,});
Object.defineProperty(WebGLRenderingContext.prototype, "BUFFER_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34660,});
Object.defineProperty(WebGLRenderingContext.prototype, "BUFFER_USAGE",{"configurable":false,"enumerable":true,"writable":false,"value":34661,});
Object.defineProperty(WebGLRenderingContext.prototype, "CURRENT_VERTEX_ATTRIB",{"configurable":false,"enumerable":true,"writable":false,"value":34342,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRONT",{"configurable":false,"enumerable":true,"writable":false,"value":1028,});
Object.defineProperty(WebGLRenderingContext.prototype, "BACK",{"configurable":false,"enumerable":true,"writable":false,"value":1029,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRONT_AND_BACK",{"configurable":false,"enumerable":true,"writable":false,"value":1032,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_2D",{"configurable":false,"enumerable":true,"writable":false,"value":3553,});
Object.defineProperty(WebGLRenderingContext.prototype, "CULL_FACE",{"configurable":false,"enumerable":true,"writable":false,"value":2884,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND",{"configurable":false,"enumerable":true,"writable":false,"value":3042,});
Object.defineProperty(WebGLRenderingContext.prototype, "DITHER",{"configurable":false,"enumerable":true,"writable":false,"value":3024,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_TEST",{"configurable":false,"enumerable":true,"writable":false,"value":2960,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_TEST",{"configurable":false,"enumerable":true,"writable":false,"value":2929,});
Object.defineProperty(WebGLRenderingContext.prototype, "SCISSOR_TEST",{"configurable":false,"enumerable":true,"writable":false,"value":3089,});
Object.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_FILL",{"configurable":false,"enumerable":true,"writable":false,"value":32823,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_ALPHA_TO_COVERAGE",{"configurable":false,"enumerable":true,"writable":false,"value":32926,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE",{"configurable":false,"enumerable":true,"writable":false,"value":32928,});
Object.defineProperty(WebGLRenderingContext.prototype, "NO_ERROR",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_ENUM",{"configurable":false,"enumerable":true,"writable":false,"value":1280,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":1281,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_OPERATION",{"configurable":false,"enumerable":true,"writable":false,"value":1282,});
Object.defineProperty(WebGLRenderingContext.prototype, "OUT_OF_MEMORY",{"configurable":false,"enumerable":true,"writable":false,"value":1285,});
Object.defineProperty(WebGLRenderingContext.prototype, "CW",{"configurable":false,"enumerable":true,"writable":false,"value":2304,});
Object.defineProperty(WebGLRenderingContext.prototype, "CCW",{"configurable":false,"enumerable":true,"writable":false,"value":2305,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINE_WIDTH",{"configurable":false,"enumerable":true,"writable":false,"value":2849,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALIASED_POINT_SIZE_RANGE",{"configurable":false,"enumerable":true,"writable":false,"value":33901,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALIASED_LINE_WIDTH_RANGE",{"configurable":false,"enumerable":true,"writable":false,"value":33902,});
Object.defineProperty(WebGLRenderingContext.prototype, "CULL_FACE_MODE",{"configurable":false,"enumerable":true,"writable":false,"value":2885,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRONT_FACE",{"configurable":false,"enumerable":true,"writable":false,"value":2886,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_RANGE",{"configurable":false,"enumerable":true,"writable":false,"value":2928,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":2930,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_CLEAR_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":2931,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_FUNC",{"configurable":false,"enumerable":true,"writable":false,"value":2932,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_CLEAR_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":2961,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_FUNC",{"configurable":false,"enumerable":true,"writable":false,"value":2962,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":2964,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_PASS_DEPTH_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":2965,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_PASS_DEPTH_PASS",{"configurable":false,"enumerable":true,"writable":false,"value":2966,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_REF",{"configurable":false,"enumerable":true,"writable":false,"value":2967,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_VALUE_MASK",{"configurable":false,"enumerable":true,"writable":false,"value":2963,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":2968,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_FUNC",{"configurable":false,"enumerable":true,"writable":false,"value":34816,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":34817,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_PASS_DEPTH_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":34818,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_PASS_DEPTH_PASS",{"configurable":false,"enumerable":true,"writable":false,"value":34819,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_REF",{"configurable":false,"enumerable":true,"writable":false,"value":36003,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_VALUE_MASK",{"configurable":false,"enumerable":true,"writable":false,"value":36004,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":36005,});
Object.defineProperty(WebGLRenderingContext.prototype, "VIEWPORT",{"configurable":false,"enumerable":true,"writable":false,"value":2978,});
Object.defineProperty(WebGLRenderingContext.prototype, "SCISSOR_BOX",{"configurable":false,"enumerable":true,"writable":false,"value":3088,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_CLEAR_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":3106,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":3107,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_ALIGNMENT",{"configurable":false,"enumerable":true,"writable":false,"value":3317,});
Object.defineProperty(WebGLRenderingContext.prototype, "PACK_ALIGNMENT",{"configurable":false,"enumerable":true,"writable":false,"value":3333,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_TEXTURE_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":3379,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VIEWPORT_DIMS",{"configurable":false,"enumerable":true,"writable":false,"value":3386,});
Object.defineProperty(WebGLRenderingContext.prototype, "SUBPIXEL_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3408,});
Object.defineProperty(WebGLRenderingContext.prototype, "RED_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3410,});
Object.defineProperty(WebGLRenderingContext.prototype, "GREEN_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3411,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLUE_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3412,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALPHA_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3413,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3414,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3415,});
Object.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":10752,});
Object.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_FACTOR",{"configurable":false,"enumerable":true,"writable":false,"value":32824,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_BINDING_2D",{"configurable":false,"enumerable":true,"writable":false,"value":32873,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_BUFFERS",{"configurable":false,"enumerable":true,"writable":false,"value":32936,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLES",{"configurable":false,"enumerable":true,"writable":false,"value":32937,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":32938,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE_INVERT",{"configurable":false,"enumerable":true,"writable":false,"value":32939,});
Object.defineProperty(WebGLRenderingContext.prototype, "COMPRESSED_TEXTURE_FORMATS",{"configurable":false,"enumerable":true,"writable":false,"value":34467,});
Object.defineProperty(WebGLRenderingContext.prototype, "DONT_CARE",{"configurable":false,"enumerable":true,"writable":false,"value":4352,});
Object.defineProperty(WebGLRenderingContext.prototype, "FASTEST",{"configurable":false,"enumerable":true,"writable":false,"value":4353,});
Object.defineProperty(WebGLRenderingContext.prototype, "NICEST",{"configurable":false,"enumerable":true,"writable":false,"value":4354,});
Object.defineProperty(WebGLRenderingContext.prototype, "GENERATE_MIPMAP_HINT",{"configurable":false,"enumerable":true,"writable":false,"value":33170,});
Object.defineProperty(WebGLRenderingContext.prototype, "BYTE",{"configurable":false,"enumerable":true,"writable":false,"value":5120,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_BYTE",{"configurable":false,"enumerable":true,"writable":false,"value":5121,});
Object.defineProperty(WebGLRenderingContext.prototype, "SHORT",{"configurable":false,"enumerable":true,"writable":false,"value":5122,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT",{"configurable":false,"enumerable":true,"writable":false,"value":5123,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT",{"configurable":false,"enumerable":true,"writable":false,"value":5124,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_INT",{"configurable":false,"enumerable":true,"writable":false,"value":5125,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":5126,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_COMPONENT",{"configurable":false,"enumerable":true,"writable":false,"value":6402,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":6406,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB",{"configurable":false,"enumerable":true,"writable":false,"value":6407,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGBA",{"configurable":false,"enumerable":true,"writable":false,"value":6408,});
Object.defineProperty(WebGLRenderingContext.prototype, "LUMINANCE",{"configurable":false,"enumerable":true,"writable":false,"value":6409,});
Object.defineProperty(WebGLRenderingContext.prototype, "LUMINANCE_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":6410,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_4_4_4_4",{"configurable":false,"enumerable":true,"writable":false,"value":32819,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_5_5_5_1",{"configurable":false,"enumerable":true,"writable":false,"value":32820,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_5_6_5",{"configurable":false,"enumerable":true,"writable":false,"value":33635,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAGMENT_SHADER",{"configurable":false,"enumerable":true,"writable":false,"value":35632,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_SHADER",{"configurable":false,"enumerable":true,"writable":false,"value":35633,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_ATTRIBS",{"configurable":false,"enumerable":true,"writable":false,"value":34921,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_UNIFORM_VECTORS",{"configurable":false,"enumerable":true,"writable":false,"value":36347,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VARYING_VECTORS",{"configurable":false,"enumerable":true,"writable":false,"value":36348,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_COMBINED_TEXTURE_IMAGE_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":35661,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_TEXTURE_IMAGE_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":35660,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_TEXTURE_IMAGE_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":34930,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_FRAGMENT_UNIFORM_VECTORS",{"configurable":false,"enumerable":true,"writable":false,"value":36349,});
Object.defineProperty(WebGLRenderingContext.prototype, "SHADER_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":35663,});
Object.defineProperty(WebGLRenderingContext.prototype, "DELETE_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35712,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINK_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35714,});
Object.defineProperty(WebGLRenderingContext.prototype, "VALIDATE_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35715,});
Object.defineProperty(WebGLRenderingContext.prototype, "ATTACHED_SHADERS",{"configurable":false,"enumerable":true,"writable":false,"value":35717,});
Object.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_UNIFORMS",{"configurable":false,"enumerable":true,"writable":false,"value":35718,});
Object.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_ATTRIBUTES",{"configurable":false,"enumerable":true,"writable":false,"value":35721,});
Object.defineProperty(WebGLRenderingContext.prototype, "SHADING_LANGUAGE_VERSION",{"configurable":false,"enumerable":true,"writable":false,"value":35724,});
Object.defineProperty(WebGLRenderingContext.prototype, "CURRENT_PROGRAM",{"configurable":false,"enumerable":true,"writable":false,"value":35725,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEVER",{"configurable":false,"enumerable":true,"writable":false,"value":512,});
Object.defineProperty(WebGLRenderingContext.prototype, "LESS",{"configurable":false,"enumerable":true,"writable":false,"value":513,});
Object.defineProperty(WebGLRenderingContext.prototype, "EQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":514,});
Object.defineProperty(WebGLRenderingContext.prototype, "LEQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":515,});
Object.defineProperty(WebGLRenderingContext.prototype, "GREATER",{"configurable":false,"enumerable":true,"writable":false,"value":516,});
Object.defineProperty(WebGLRenderingContext.prototype, "NOTEQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":517,});
Object.defineProperty(WebGLRenderingContext.prototype, "GEQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":518,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALWAYS",{"configurable":false,"enumerable":true,"writable":false,"value":519,});
Object.defineProperty(WebGLRenderingContext.prototype, "KEEP",{"configurable":false,"enumerable":true,"writable":false,"value":7680,});
Object.defineProperty(WebGLRenderingContext.prototype, "REPLACE",{"configurable":false,"enumerable":true,"writable":false,"value":7681,});
Object.defineProperty(WebGLRenderingContext.prototype, "INCR",{"configurable":false,"enumerable":true,"writable":false,"value":7682,});
Object.defineProperty(WebGLRenderingContext.prototype, "DECR",{"configurable":false,"enumerable":true,"writable":false,"value":7683,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVERT",{"configurable":false,"enumerable":true,"writable":false,"value":5386,});
Object.defineProperty(WebGLRenderingContext.prototype, "INCR_WRAP",{"configurable":false,"enumerable":true,"writable":false,"value":34055,});
Object.defineProperty(WebGLRenderingContext.prototype, "DECR_WRAP",{"configurable":false,"enumerable":true,"writable":false,"value":34056,});
Object.defineProperty(WebGLRenderingContext.prototype, "VENDOR",{"configurable":false,"enumerable":true,"writable":false,"value":7936,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERER",{"configurable":false,"enumerable":true,"writable":false,"value":7937,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERSION",{"configurable":false,"enumerable":true,"writable":false,"value":7938,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEAREST",{"configurable":false,"enumerable":true,"writable":false,"value":9728,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINEAR",{"configurable":false,"enumerable":true,"writable":false,"value":9729,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEAREST_MIPMAP_NEAREST",{"configurable":false,"enumerable":true,"writable":false,"value":9984,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINEAR_MIPMAP_NEAREST",{"configurable":false,"enumerable":true,"writable":false,"value":9985,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEAREST_MIPMAP_LINEAR",{"configurable":false,"enumerable":true,"writable":false,"value":9986,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINEAR_MIPMAP_LINEAR",{"configurable":false,"enumerable":true,"writable":false,"value":9987,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_MAG_FILTER",{"configurable":false,"enumerable":true,"writable":false,"value":10240,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_MIN_FILTER",{"configurable":false,"enumerable":true,"writable":false,"value":10241,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_WRAP_S",{"configurable":false,"enumerable":true,"writable":false,"value":10242,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_WRAP_T",{"configurable":false,"enumerable":true,"writable":false,"value":10243,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE",{"configurable":false,"enumerable":true,"writable":false,"value":5890,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP",{"configurable":false,"enumerable":true,"writable":false,"value":34067,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_BINDING_CUBE_MAP",{"configurable":false,"enumerable":true,"writable":false,"value":34068,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_X",{"configurable":false,"enumerable":true,"writable":false,"value":34069,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_X",{"configurable":false,"enumerable":true,"writable":false,"value":34070,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_Y",{"configurable":false,"enumerable":true,"writable":false,"value":34071,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_Y",{"configurable":false,"enumerable":true,"writable":false,"value":34072,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_Z",{"configurable":false,"enumerable":true,"writable":false,"value":34073,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_Z",{"configurable":false,"enumerable":true,"writable":false,"value":34074,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_CUBE_MAP_TEXTURE_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34076,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE0",{"configurable":false,"enumerable":true,"writable":false,"value":33984,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE1",{"configurable":false,"enumerable":true,"writable":false,"value":33985,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE2",{"configurable":false,"enumerable":true,"writable":false,"value":33986,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE3",{"configurable":false,"enumerable":true,"writable":false,"value":33987,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE4",{"configurable":false,"enumerable":true,"writable":false,"value":33988,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE5",{"configurable":false,"enumerable":true,"writable":false,"value":33989,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE6",{"configurable":false,"enumerable":true,"writable":false,"value":33990,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE7",{"configurable":false,"enumerable":true,"writable":false,"value":33991,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE8",{"configurable":false,"enumerable":true,"writable":false,"value":33992,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE9",{"configurable":false,"enumerable":true,"writable":false,"value":33993,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE10",{"configurable":false,"enumerable":true,"writable":false,"value":33994,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE11",{"configurable":false,"enumerable":true,"writable":false,"value":33995,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE12",{"configurable":false,"enumerable":true,"writable":false,"value":33996,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE13",{"configurable":false,"enumerable":true,"writable":false,"value":33997,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE14",{"configurable":false,"enumerable":true,"writable":false,"value":33998,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE15",{"configurable":false,"enumerable":true,"writable":false,"value":33999,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE16",{"configurable":false,"enumerable":true,"writable":false,"value":34000,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE17",{"configurable":false,"enumerable":true,"writable":false,"value":34001,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE18",{"configurable":false,"enumerable":true,"writable":false,"value":34002,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE19",{"configurable":false,"enumerable":true,"writable":false,"value":34003,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE20",{"configurable":false,"enumerable":true,"writable":false,"value":34004,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE21",{"configurable":false,"enumerable":true,"writable":false,"value":34005,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE22",{"configurable":false,"enumerable":true,"writable":false,"value":34006,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE23",{"configurable":false,"enumerable":true,"writable":false,"value":34007,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE24",{"configurable":false,"enumerable":true,"writable":false,"value":34008,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE25",{"configurable":false,"enumerable":true,"writable":false,"value":34009,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE26",{"configurable":false,"enumerable":true,"writable":false,"value":34010,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE27",{"configurable":false,"enumerable":true,"writable":false,"value":34011,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE28",{"configurable":false,"enumerable":true,"writable":false,"value":34012,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE29",{"configurable":false,"enumerable":true,"writable":false,"value":34013,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE30",{"configurable":false,"enumerable":true,"writable":false,"value":34014,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE31",{"configurable":false,"enumerable":true,"writable":false,"value":34015,});
Object.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_TEXTURE",{"configurable":false,"enumerable":true,"writable":false,"value":34016,});
Object.defineProperty(WebGLRenderingContext.prototype, "REPEAT",{"configurable":false,"enumerable":true,"writable":false,"value":10497,});
Object.defineProperty(WebGLRenderingContext.prototype, "CLAMP_TO_EDGE",{"configurable":false,"enumerable":true,"writable":false,"value":33071,});
Object.defineProperty(WebGLRenderingContext.prototype, "MIRRORED_REPEAT",{"configurable":false,"enumerable":true,"writable":false,"value":33648,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC2",{"configurable":false,"enumerable":true,"writable":false,"value":35664,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC3",{"configurable":false,"enumerable":true,"writable":false,"value":35665,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC4",{"configurable":false,"enumerable":true,"writable":false,"value":35666,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT_VEC2",{"configurable":false,"enumerable":true,"writable":false,"value":35667,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT_VEC3",{"configurable":false,"enumerable":true,"writable":false,"value":35668,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT_VEC4",{"configurable":false,"enumerable":true,"writable":false,"value":35669,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL",{"configurable":false,"enumerable":true,"writable":false,"value":35670,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC2",{"configurable":false,"enumerable":true,"writable":false,"value":35671,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC3",{"configurable":false,"enumerable":true,"writable":false,"value":35672,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC4",{"configurable":false,"enumerable":true,"writable":false,"value":35673,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT2",{"configurable":false,"enumerable":true,"writable":false,"value":35674,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT3",{"configurable":false,"enumerable":true,"writable":false,"value":35675,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT4",{"configurable":false,"enumerable":true,"writable":false,"value":35676,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLER_2D",{"configurable":false,"enumerable":true,"writable":false,"value":35678,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLER_CUBE",{"configurable":false,"enumerable":true,"writable":false,"value":35680,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_ENABLED",{"configurable":false,"enumerable":true,"writable":false,"value":34338,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34339,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_STRIDE",{"configurable":false,"enumerable":true,"writable":false,"value":34340,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":34341,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_NORMALIZED",{"configurable":false,"enumerable":true,"writable":false,"value":34922,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_POINTER",{"configurable":false,"enumerable":true,"writable":false,"value":34373,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":34975,});
Object.defineProperty(WebGLRenderingContext.prototype, "IMPLEMENTATION_COLOR_READ_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":35738,});
Object.defineProperty(WebGLRenderingContext.prototype, "IMPLEMENTATION_COLOR_READ_FORMAT",{"configurable":false,"enumerable":true,"writable":false,"value":35739,});
Object.defineProperty(WebGLRenderingContext.prototype, "COMPILE_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35713,});
Object.defineProperty(WebGLRenderingContext.prototype, "LOW_FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":36336,});
Object.defineProperty(WebGLRenderingContext.prototype, "MEDIUM_FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":36337,});
Object.defineProperty(WebGLRenderingContext.prototype, "HIGH_FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":36338,});
Object.defineProperty(WebGLRenderingContext.prototype, "LOW_INT",{"configurable":false,"enumerable":true,"writable":false,"value":36339,});
Object.defineProperty(WebGLRenderingContext.prototype, "MEDIUM_INT",{"configurable":false,"enumerable":true,"writable":false,"value":36340,});
Object.defineProperty(WebGLRenderingContext.prototype, "HIGH_INT",{"configurable":false,"enumerable":true,"writable":false,"value":36341,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":36160,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":36161,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGBA4",{"configurable":false,"enumerable":true,"writable":false,"value":32854,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB5_A1",{"configurable":false,"enumerable":true,"writable":false,"value":32855,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB565",{"configurable":false,"enumerable":true,"writable":false,"value":36194,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_COMPONENT16",{"configurable":false,"enumerable":true,"writable":false,"value":33189,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_INDEX8",{"configurable":false,"enumerable":true,"writable":false,"value":36168,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_STENCIL",{"configurable":false,"enumerable":true,"writable":false,"value":34041,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_WIDTH",{"configurable":false,"enumerable":true,"writable":false,"value":36162,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_HEIGHT",{"configurable":false,"enumerable":true,"writable":false,"value":36163,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_INTERNAL_FORMAT",{"configurable":false,"enumerable":true,"writable":false,"value":36164,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_RED_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36176,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_GREEN_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36177,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_BLUE_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36178,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_ALPHA_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36179,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_DEPTH_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36180,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_STENCIL_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36181,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":36048,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME",{"configurable":false,"enumerable":true,"writable":false,"value":36049,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",{"configurable":false,"enumerable":true,"writable":false,"value":36050,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE",{"configurable":false,"enumerable":true,"writable":false,"value":36051,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_ATTACHMENT0",{"configurable":false,"enumerable":true,"writable":false,"value":36064,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36096,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36128,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_STENCIL_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":33306,});
Object.defineProperty(WebGLRenderingContext.prototype, "NONE",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_COMPLETE",{"configurable":false,"enumerable":true,"writable":false,"value":36053,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36054,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36055,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_DIMENSIONS",{"configurable":false,"enumerable":true,"writable":false,"value":36057,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_UNSUPPORTED",{"configurable":false,"enumerable":true,"writable":false,"value":36061,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":36006,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":36007,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_RENDERBUFFER_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34024,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_FRAMEBUFFER_OPERATION",{"configurable":false,"enumerable":true,"writable":false,"value":1286,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_FLIP_Y_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37440,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_PREMULTIPLY_ALPHA_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37441,});
Object.defineProperty(WebGLRenderingContext.prototype, "CONTEXT_LOST_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37442,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_COLORSPACE_CONVERSION_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37443,});
Object.defineProperty(WebGLRenderingContext.prototype, "BROWSER_DEFAULT_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37444,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB8",{"configurable":false,"enumerable":true,"writable":false,"value":32849,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGBA8",{"configurable":false,"enumerable":true,"writable":false,"value":32856,});
Object.defineProperty(WebGLRenderingContext.prototype, Symbol.toStringTag,{"value":"WebGLRenderingContext","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(WebGLRenderingContext.prototype, "canvas",{"configurable":true,"enumerable":true,"get": function canvas_get(){},});
Object.defineProperty(WebGLRenderingContext.prototype, "drawingBufferWidth",{"configurable":true,"enumerable":true,"get": function drawingBufferWidth_get(){}, });
Object.defineProperty(WebGLRenderingContext.prototype, "drawingBufferHeight",{"configurable":true,"enumerable":true,"get": function drawingBufferHeight_get(){}, });
Object.defineProperty(WebGLRenderingContext.prototype, "drawingBufferColorSpace",{"configurable":true,"enumerable":true,"get": function drawingBufferColorSpace_get(){},});
Object.defineProperty(WebGLRenderingContext.prototype, "unpackColorSpace",{"configurable":true,"enumerable":true,"get": function unpackColorSpace_get(){},"set": function unpackColorSpace_set(){},});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_BUFFER_BIT",{"configurable":false,"enumerable":true,"writable":false,"value":256,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BUFFER_BIT",{"configurable":false,"enumerable":true,"writable":false,"value":1024,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_BUFFER_BIT",{"configurable":false,"enumerable":true,"writable":false,"value":16384,});
Object.defineProperty(WebGLRenderingContext.prototype, "POINTS",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINES",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINE_LOOP",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINE_STRIP",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(WebGLRenderingContext.prototype, "TRIANGLES",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(WebGLRenderingContext.prototype, "TRIANGLE_STRIP",{"configurable":false,"enumerable":true,"writable":false,"value":5,});
Object.defineProperty(WebGLRenderingContext.prototype, "TRIANGLE_FAN",{"configurable":false,"enumerable":true,"writable":false,"value":6,});
Object.defineProperty(WebGLRenderingContext.prototype, "ZERO",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(WebGLRenderingContext.prototype, "SRC_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":768,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_SRC_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":769,});
Object.defineProperty(WebGLRenderingContext.prototype, "SRC_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":770,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_SRC_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":771,});
Object.defineProperty(WebGLRenderingContext.prototype, "DST_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":772,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_DST_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":773,});
Object.defineProperty(WebGLRenderingContext.prototype, "DST_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":774,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_DST_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":775,});
Object.defineProperty(WebGLRenderingContext.prototype, "SRC_ALPHA_SATURATE",{"configurable":false,"enumerable":true,"writable":false,"value":776,});
Object.defineProperty(WebGLRenderingContext.prototype, "FUNC_ADD",{"configurable":false,"enumerable":true,"writable":false,"value":32774,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION",{"configurable":false,"enumerable":true,"writable":false,"value":32777,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION_RGB",{"configurable":false,"enumerable":true,"writable":false,"value":32777,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_EQUATION_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":34877,});
Object.defineProperty(WebGLRenderingContext.prototype, "FUNC_SUBTRACT",{"configurable":false,"enumerable":true,"writable":false,"value":32778,});
Object.defineProperty(WebGLRenderingContext.prototype, "FUNC_REVERSE_SUBTRACT",{"configurable":false,"enumerable":true,"writable":false,"value":32779,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_DST_RGB",{"configurable":false,"enumerable":true,"writable":false,"value":32968,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_SRC_RGB",{"configurable":false,"enumerable":true,"writable":false,"value":32969,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_DST_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32970,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_SRC_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32971,});
Object.defineProperty(WebGLRenderingContext.prototype, "CONSTANT_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":32769,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_CONSTANT_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":32770,});
Object.defineProperty(WebGLRenderingContext.prototype, "CONSTANT_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32771,});
Object.defineProperty(WebGLRenderingContext.prototype, "ONE_MINUS_CONSTANT_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":32772,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND_COLOR",{"configurable":false,"enumerable":true,"writable":false,"value":32773,});
Object.defineProperty(WebGLRenderingContext.prototype, "ARRAY_BUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":34962,});
Object.defineProperty(WebGLRenderingContext.prototype, "ELEMENT_ARRAY_BUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":34963,});
Object.defineProperty(WebGLRenderingContext.prototype, "ARRAY_BUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":34964,});
Object.defineProperty(WebGLRenderingContext.prototype, "ELEMENT_ARRAY_BUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":34965,});
Object.defineProperty(WebGLRenderingContext.prototype, "STREAM_DRAW",{"configurable":false,"enumerable":true,"writable":false,"value":35040,});
Object.defineProperty(WebGLRenderingContext.prototype, "STATIC_DRAW",{"configurable":false,"enumerable":true,"writable":false,"value":35044,});
Object.defineProperty(WebGLRenderingContext.prototype, "DYNAMIC_DRAW",{"configurable":false,"enumerable":true,"writable":false,"value":35048,});
Object.defineProperty(WebGLRenderingContext.prototype, "BUFFER_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34660,});
Object.defineProperty(WebGLRenderingContext.prototype, "BUFFER_USAGE",{"configurable":false,"enumerable":true,"writable":false,"value":34661,});
Object.defineProperty(WebGLRenderingContext.prototype, "CURRENT_VERTEX_ATTRIB",{"configurable":false,"enumerable":true,"writable":false,"value":34342,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRONT",{"configurable":false,"enumerable":true,"writable":false,"value":1028,});
Object.defineProperty(WebGLRenderingContext.prototype, "BACK",{"configurable":false,"enumerable":true,"writable":false,"value":1029,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRONT_AND_BACK",{"configurable":false,"enumerable":true,"writable":false,"value":1032,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_2D",{"configurable":false,"enumerable":true,"writable":false,"value":3553,});
Object.defineProperty(WebGLRenderingContext.prototype, "CULL_FACE",{"configurable":false,"enumerable":true,"writable":false,"value":2884,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLEND",{"configurable":false,"enumerable":true,"writable":false,"value":3042,});
Object.defineProperty(WebGLRenderingContext.prototype, "DITHER",{"configurable":false,"enumerable":true,"writable":false,"value":3024,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_TEST",{"configurable":false,"enumerable":true,"writable":false,"value":2960,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_TEST",{"configurable":false,"enumerable":true,"writable":false,"value":2929,});
Object.defineProperty(WebGLRenderingContext.prototype, "SCISSOR_TEST",{"configurable":false,"enumerable":true,"writable":false,"value":3089,});
Object.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_FILL",{"configurable":false,"enumerable":true,"writable":false,"value":32823,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_ALPHA_TO_COVERAGE",{"configurable":false,"enumerable":true,"writable":false,"value":32926,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE",{"configurable":false,"enumerable":true,"writable":false,"value":32928,});
Object.defineProperty(WebGLRenderingContext.prototype, "NO_ERROR",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_ENUM",{"configurable":false,"enumerable":true,"writable":false,"value":1280,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":1281,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_OPERATION",{"configurable":false,"enumerable":true,"writable":false,"value":1282,});
Object.defineProperty(WebGLRenderingContext.prototype, "OUT_OF_MEMORY",{"configurable":false,"enumerable":true,"writable":false,"value":1285,});
Object.defineProperty(WebGLRenderingContext.prototype, "CW",{"configurable":false,"enumerable":true,"writable":false,"value":2304,});
Object.defineProperty(WebGLRenderingContext.prototype, "CCW",{"configurable":false,"enumerable":true,"writable":false,"value":2305,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINE_WIDTH",{"configurable":false,"enumerable":true,"writable":false,"value":2849,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALIASED_POINT_SIZE_RANGE",{"configurable":false,"enumerable":true,"writable":false,"value":33901,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALIASED_LINE_WIDTH_RANGE",{"configurable":false,"enumerable":true,"writable":false,"value":33902,});
Object.defineProperty(WebGLRenderingContext.prototype, "CULL_FACE_MODE",{"configurable":false,"enumerable":true,"writable":false,"value":2885,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRONT_FACE",{"configurable":false,"enumerable":true,"writable":false,"value":2886,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_RANGE",{"configurable":false,"enumerable":true,"writable":false,"value":2928,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":2930,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_CLEAR_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":2931,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_FUNC",{"configurable":false,"enumerable":true,"writable":false,"value":2932,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_CLEAR_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":2961,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_FUNC",{"configurable":false,"enumerable":true,"writable":false,"value":2962,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":2964,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_PASS_DEPTH_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":2965,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_PASS_DEPTH_PASS",{"configurable":false,"enumerable":true,"writable":false,"value":2966,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_REF",{"configurable":false,"enumerable":true,"writable":false,"value":2967,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_VALUE_MASK",{"configurable":false,"enumerable":true,"writable":false,"value":2963,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":2968,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_FUNC",{"configurable":false,"enumerable":true,"writable":false,"value":34816,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":34817,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_PASS_DEPTH_FAIL",{"configurable":false,"enumerable":true,"writable":false,"value":34818,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_PASS_DEPTH_PASS",{"configurable":false,"enumerable":true,"writable":false,"value":34819,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_REF",{"configurable":false,"enumerable":true,"writable":false,"value":36003,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_VALUE_MASK",{"configurable":false,"enumerable":true,"writable":false,"value":36004,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BACK_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":36005,});
Object.defineProperty(WebGLRenderingContext.prototype, "VIEWPORT",{"configurable":false,"enumerable":true,"writable":false,"value":2978,});
Object.defineProperty(WebGLRenderingContext.prototype, "SCISSOR_BOX",{"configurable":false,"enumerable":true,"writable":false,"value":3088,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_CLEAR_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":3106,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_WRITEMASK",{"configurable":false,"enumerable":true,"writable":false,"value":3107,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_ALIGNMENT",{"configurable":false,"enumerable":true,"writable":false,"value":3317,});
Object.defineProperty(WebGLRenderingContext.prototype, "PACK_ALIGNMENT",{"configurable":false,"enumerable":true,"writable":false,"value":3333,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_TEXTURE_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":3379,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VIEWPORT_DIMS",{"configurable":false,"enumerable":true,"writable":false,"value":3386,});
Object.defineProperty(WebGLRenderingContext.prototype, "SUBPIXEL_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3408,});
Object.defineProperty(WebGLRenderingContext.prototype, "RED_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3410,});
Object.defineProperty(WebGLRenderingContext.prototype, "GREEN_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3411,});
Object.defineProperty(WebGLRenderingContext.prototype, "BLUE_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3412,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALPHA_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3413,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3414,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_BITS",{"configurable":false,"enumerable":true,"writable":false,"value":3415,});
Object.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":10752,});
Object.defineProperty(WebGLRenderingContext.prototype, "POLYGON_OFFSET_FACTOR",{"configurable":false,"enumerable":true,"writable":false,"value":32824,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_BINDING_2D",{"configurable":false,"enumerable":true,"writable":false,"value":32873,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_BUFFERS",{"configurable":false,"enumerable":true,"writable":false,"value":32936,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLES",{"configurable":false,"enumerable":true,"writable":false,"value":32937,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE_VALUE",{"configurable":false,"enumerable":true,"writable":false,"value":32938,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLE_COVERAGE_INVERT",{"configurable":false,"enumerable":true,"writable":false,"value":32939,});
Object.defineProperty(WebGLRenderingContext.prototype, "COMPRESSED_TEXTURE_FORMATS",{"configurable":false,"enumerable":true,"writable":false,"value":34467,});
Object.defineProperty(WebGLRenderingContext.prototype, "DONT_CARE",{"configurable":false,"enumerable":true,"writable":false,"value":4352,});
Object.defineProperty(WebGLRenderingContext.prototype, "FASTEST",{"configurable":false,"enumerable":true,"writable":false,"value":4353,});
Object.defineProperty(WebGLRenderingContext.prototype, "NICEST",{"configurable":false,"enumerable":true,"writable":false,"value":4354,});
Object.defineProperty(WebGLRenderingContext.prototype, "GENERATE_MIPMAP_HINT",{"configurable":false,"enumerable":true,"writable":false,"value":33170,});
Object.defineProperty(WebGLRenderingContext.prototype, "BYTE",{"configurable":false,"enumerable":true,"writable":false,"value":5120,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_BYTE",{"configurable":false,"enumerable":true,"writable":false,"value":5121,});
Object.defineProperty(WebGLRenderingContext.prototype, "SHORT",{"configurable":false,"enumerable":true,"writable":false,"value":5122,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT",{"configurable":false,"enumerable":true,"writable":false,"value":5123,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT",{"configurable":false,"enumerable":true,"writable":false,"value":5124,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_INT",{"configurable":false,"enumerable":true,"writable":false,"value":5125,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":5126,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_COMPONENT",{"configurable":false,"enumerable":true,"writable":false,"value":6402,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":6406,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB",{"configurable":false,"enumerable":true,"writable":false,"value":6407,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGBA",{"configurable":false,"enumerable":true,"writable":false,"value":6408,});
Object.defineProperty(WebGLRenderingContext.prototype, "LUMINANCE",{"configurable":false,"enumerable":true,"writable":false,"value":6409,});
Object.defineProperty(WebGLRenderingContext.prototype, "LUMINANCE_ALPHA",{"configurable":false,"enumerable":true,"writable":false,"value":6410,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_4_4_4_4",{"configurable":false,"enumerable":true,"writable":false,"value":32819,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_5_5_5_1",{"configurable":false,"enumerable":true,"writable":false,"value":32820,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNSIGNED_SHORT_5_6_5",{"configurable":false,"enumerable":true,"writable":false,"value":33635,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAGMENT_SHADER",{"configurable":false,"enumerable":true,"writable":false,"value":35632,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_SHADER",{"configurable":false,"enumerable":true,"writable":false,"value":35633,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_ATTRIBS",{"configurable":false,"enumerable":true,"writable":false,"value":34921,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_UNIFORM_VECTORS",{"configurable":false,"enumerable":true,"writable":false,"value":36347,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VARYING_VECTORS",{"configurable":false,"enumerable":true,"writable":false,"value":36348,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_COMBINED_TEXTURE_IMAGE_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":35661,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_VERTEX_TEXTURE_IMAGE_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":35660,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_TEXTURE_IMAGE_UNITS",{"configurable":false,"enumerable":true,"writable":false,"value":34930,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_FRAGMENT_UNIFORM_VECTORS",{"configurable":false,"enumerable":true,"writable":false,"value":36349,});
Object.defineProperty(WebGLRenderingContext.prototype, "SHADER_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":35663,});
Object.defineProperty(WebGLRenderingContext.prototype, "DELETE_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35712,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINK_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35714,});
Object.defineProperty(WebGLRenderingContext.prototype, "VALIDATE_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35715,});
Object.defineProperty(WebGLRenderingContext.prototype, "ATTACHED_SHADERS",{"configurable":false,"enumerable":true,"writable":false,"value":35717,});
Object.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_UNIFORMS",{"configurable":false,"enumerable":true,"writable":false,"value":35718,});
Object.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_ATTRIBUTES",{"configurable":false,"enumerable":true,"writable":false,"value":35721,});
Object.defineProperty(WebGLRenderingContext.prototype, "SHADING_LANGUAGE_VERSION",{"configurable":false,"enumerable":true,"writable":false,"value":35724,});
Object.defineProperty(WebGLRenderingContext.prototype, "CURRENT_PROGRAM",{"configurable":false,"enumerable":true,"writable":false,"value":35725,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEVER",{"configurable":false,"enumerable":true,"writable":false,"value":512,});
Object.defineProperty(WebGLRenderingContext.prototype, "LESS",{"configurable":false,"enumerable":true,"writable":false,"value":513,});
Object.defineProperty(WebGLRenderingContext.prototype, "EQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":514,});
Object.defineProperty(WebGLRenderingContext.prototype, "LEQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":515,});
Object.defineProperty(WebGLRenderingContext.prototype, "GREATER",{"configurable":false,"enumerable":true,"writable":false,"value":516,});
Object.defineProperty(WebGLRenderingContext.prototype, "NOTEQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":517,});
Object.defineProperty(WebGLRenderingContext.prototype, "GEQUAL",{"configurable":false,"enumerable":true,"writable":false,"value":518,});
Object.defineProperty(WebGLRenderingContext.prototype, "ALWAYS",{"configurable":false,"enumerable":true,"writable":false,"value":519,});
Object.defineProperty(WebGLRenderingContext.prototype, "KEEP",{"configurable":false,"enumerable":true,"writable":false,"value":7680,});
Object.defineProperty(WebGLRenderingContext.prototype, "REPLACE",{"configurable":false,"enumerable":true,"writable":false,"value":7681,});
Object.defineProperty(WebGLRenderingContext.prototype, "INCR",{"configurable":false,"enumerable":true,"writable":false,"value":7682,});
Object.defineProperty(WebGLRenderingContext.prototype, "DECR",{"configurable":false,"enumerable":true,"writable":false,"value":7683,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVERT",{"configurable":false,"enumerable":true,"writable":false,"value":5386,});
Object.defineProperty(WebGLRenderingContext.prototype, "INCR_WRAP",{"configurable":false,"enumerable":true,"writable":false,"value":34055,});
Object.defineProperty(WebGLRenderingContext.prototype, "DECR_WRAP",{"configurable":false,"enumerable":true,"writable":false,"value":34056,});
Object.defineProperty(WebGLRenderingContext.prototype, "VENDOR",{"configurable":false,"enumerable":true,"writable":false,"value":7936,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERER",{"configurable":false,"enumerable":true,"writable":false,"value":7937,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERSION",{"configurable":false,"enumerable":true,"writable":false,"value":7938,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEAREST",{"configurable":false,"enumerable":true,"writable":false,"value":9728,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINEAR",{"configurable":false,"enumerable":true,"writable":false,"value":9729,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEAREST_MIPMAP_NEAREST",{"configurable":false,"enumerable":true,"writable":false,"value":9984,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINEAR_MIPMAP_NEAREST",{"configurable":false,"enumerable":true,"writable":false,"value":9985,});
Object.defineProperty(WebGLRenderingContext.prototype, "NEAREST_MIPMAP_LINEAR",{"configurable":false,"enumerable":true,"writable":false,"value":9986,});
Object.defineProperty(WebGLRenderingContext.prototype, "LINEAR_MIPMAP_LINEAR",{"configurable":false,"enumerable":true,"writable":false,"value":9987,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_MAG_FILTER",{"configurable":false,"enumerable":true,"writable":false,"value":10240,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_MIN_FILTER",{"configurable":false,"enumerable":true,"writable":false,"value":10241,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_WRAP_S",{"configurable":false,"enumerable":true,"writable":false,"value":10242,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_WRAP_T",{"configurable":false,"enumerable":true,"writable":false,"value":10243,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE",{"configurable":false,"enumerable":true,"writable":false,"value":5890,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP",{"configurable":false,"enumerable":true,"writable":false,"value":34067,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_BINDING_CUBE_MAP",{"configurable":false,"enumerable":true,"writable":false,"value":34068,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_X",{"configurable":false,"enumerable":true,"writable":false,"value":34069,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_X",{"configurable":false,"enumerable":true,"writable":false,"value":34070,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_Y",{"configurable":false,"enumerable":true,"writable":false,"value":34071,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_Y",{"configurable":false,"enumerable":true,"writable":false,"value":34072,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_POSITIVE_Z",{"configurable":false,"enumerable":true,"writable":false,"value":34073,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE_CUBE_MAP_NEGATIVE_Z",{"configurable":false,"enumerable":true,"writable":false,"value":34074,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_CUBE_MAP_TEXTURE_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34076,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE0",{"configurable":false,"enumerable":true,"writable":false,"value":33984,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE1",{"configurable":false,"enumerable":true,"writable":false,"value":33985,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE2",{"configurable":false,"enumerable":true,"writable":false,"value":33986,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE3",{"configurable":false,"enumerable":true,"writable":false,"value":33987,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE4",{"configurable":false,"enumerable":true,"writable":false,"value":33988,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE5",{"configurable":false,"enumerable":true,"writable":false,"value":33989,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE6",{"configurable":false,"enumerable":true,"writable":false,"value":33990,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE7",{"configurable":false,"enumerable":true,"writable":false,"value":33991,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE8",{"configurable":false,"enumerable":true,"writable":false,"value":33992,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE9",{"configurable":false,"enumerable":true,"writable":false,"value":33993,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE10",{"configurable":false,"enumerable":true,"writable":false,"value":33994,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE11",{"configurable":false,"enumerable":true,"writable":false,"value":33995,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE12",{"configurable":false,"enumerable":true,"writable":false,"value":33996,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE13",{"configurable":false,"enumerable":true,"writable":false,"value":33997,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE14",{"configurable":false,"enumerable":true,"writable":false,"value":33998,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE15",{"configurable":false,"enumerable":true,"writable":false,"value":33999,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE16",{"configurable":false,"enumerable":true,"writable":false,"value":34000,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE17",{"configurable":false,"enumerable":true,"writable":false,"value":34001,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE18",{"configurable":false,"enumerable":true,"writable":false,"value":34002,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE19",{"configurable":false,"enumerable":true,"writable":false,"value":34003,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE20",{"configurable":false,"enumerable":true,"writable":false,"value":34004,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE21",{"configurable":false,"enumerable":true,"writable":false,"value":34005,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE22",{"configurable":false,"enumerable":true,"writable":false,"value":34006,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE23",{"configurable":false,"enumerable":true,"writable":false,"value":34007,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE24",{"configurable":false,"enumerable":true,"writable":false,"value":34008,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE25",{"configurable":false,"enumerable":true,"writable":false,"value":34009,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE26",{"configurable":false,"enumerable":true,"writable":false,"value":34010,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE27",{"configurable":false,"enumerable":true,"writable":false,"value":34011,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE28",{"configurable":false,"enumerable":true,"writable":false,"value":34012,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE29",{"configurable":false,"enumerable":true,"writable":false,"value":34013,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE30",{"configurable":false,"enumerable":true,"writable":false,"value":34014,});
Object.defineProperty(WebGLRenderingContext.prototype, "TEXTURE31",{"configurable":false,"enumerable":true,"writable":false,"value":34015,});
Object.defineProperty(WebGLRenderingContext.prototype, "ACTIVE_TEXTURE",{"configurable":false,"enumerable":true,"writable":false,"value":34016,});
Object.defineProperty(WebGLRenderingContext.prototype, "REPEAT",{"configurable":false,"enumerable":true,"writable":false,"value":10497,});
Object.defineProperty(WebGLRenderingContext.prototype, "CLAMP_TO_EDGE",{"configurable":false,"enumerable":true,"writable":false,"value":33071,});
Object.defineProperty(WebGLRenderingContext.prototype, "MIRRORED_REPEAT",{"configurable":false,"enumerable":true,"writable":false,"value":33648,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC2",{"configurable":false,"enumerable":true,"writable":false,"value":35664,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC3",{"configurable":false,"enumerable":true,"writable":false,"value":35665,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_VEC4",{"configurable":false,"enumerable":true,"writable":false,"value":35666,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT_VEC2",{"configurable":false,"enumerable":true,"writable":false,"value":35667,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT_VEC3",{"configurable":false,"enumerable":true,"writable":false,"value":35668,});
Object.defineProperty(WebGLRenderingContext.prototype, "INT_VEC4",{"configurable":false,"enumerable":true,"writable":false,"value":35669,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL",{"configurable":false,"enumerable":true,"writable":false,"value":35670,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC2",{"configurable":false,"enumerable":true,"writable":false,"value":35671,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC3",{"configurable":false,"enumerable":true,"writable":false,"value":35672,});
Object.defineProperty(WebGLRenderingContext.prototype, "BOOL_VEC4",{"configurable":false,"enumerable":true,"writable":false,"value":35673,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT2",{"configurable":false,"enumerable":true,"writable":false,"value":35674,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT3",{"configurable":false,"enumerable":true,"writable":false,"value":35675,});
Object.defineProperty(WebGLRenderingContext.prototype, "FLOAT_MAT4",{"configurable":false,"enumerable":true,"writable":false,"value":35676,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLER_2D",{"configurable":false,"enumerable":true,"writable":false,"value":35678,});
Object.defineProperty(WebGLRenderingContext.prototype, "SAMPLER_CUBE",{"configurable":false,"enumerable":true,"writable":false,"value":35680,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_ENABLED",{"configurable":false,"enumerable":true,"writable":false,"value":34338,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34339,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_STRIDE",{"configurable":false,"enumerable":true,"writable":false,"value":34340,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":34341,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_NORMALIZED",{"configurable":false,"enumerable":true,"writable":false,"value":34922,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_POINTER",{"configurable":false,"enumerable":true,"writable":false,"value":34373,});
Object.defineProperty(WebGLRenderingContext.prototype, "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":34975,});
Object.defineProperty(WebGLRenderingContext.prototype, "IMPLEMENTATION_COLOR_READ_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":35738,});
Object.defineProperty(WebGLRenderingContext.prototype, "IMPLEMENTATION_COLOR_READ_FORMAT",{"configurable":false,"enumerable":true,"writable":false,"value":35739,});
Object.defineProperty(WebGLRenderingContext.prototype, "COMPILE_STATUS",{"configurable":false,"enumerable":true,"writable":false,"value":35713,});
Object.defineProperty(WebGLRenderingContext.prototype, "LOW_FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":36336,});
Object.defineProperty(WebGLRenderingContext.prototype, "MEDIUM_FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":36337,});
Object.defineProperty(WebGLRenderingContext.prototype, "HIGH_FLOAT",{"configurable":false,"enumerable":true,"writable":false,"value":36338,});
Object.defineProperty(WebGLRenderingContext.prototype, "LOW_INT",{"configurable":false,"enumerable":true,"writable":false,"value":36339,});
Object.defineProperty(WebGLRenderingContext.prototype, "MEDIUM_INT",{"configurable":false,"enumerable":true,"writable":false,"value":36340,});
Object.defineProperty(WebGLRenderingContext.prototype, "HIGH_INT",{"configurable":false,"enumerable":true,"writable":false,"value":36341,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":36160,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER",{"configurable":false,"enumerable":true,"writable":false,"value":36161,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGBA4",{"configurable":false,"enumerable":true,"writable":false,"value":32854,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB5_A1",{"configurable":false,"enumerable":true,"writable":false,"value":32855,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGB565",{"configurable":false,"enumerable":true,"writable":false,"value":36194,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_COMPONENT16",{"configurable":false,"enumerable":true,"writable":false,"value":33189,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_INDEX8",{"configurable":false,"enumerable":true,"writable":false,"value":36168,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_STENCIL",{"configurable":false,"enumerable":true,"writable":false,"value":34041,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_WIDTH",{"configurable":false,"enumerable":true,"writable":false,"value":36162,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_HEIGHT",{"configurable":false,"enumerable":true,"writable":false,"value":36163,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_INTERNAL_FORMAT",{"configurable":false,"enumerable":true,"writable":false,"value":36164,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_RED_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36176,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_GREEN_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36177,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_BLUE_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36178,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_ALPHA_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36179,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_DEPTH_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36180,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_STENCIL_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":36181,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE",{"configurable":false,"enumerable":true,"writable":false,"value":36048,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME",{"configurable":false,"enumerable":true,"writable":false,"value":36049,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",{"configurable":false,"enumerable":true,"writable":false,"value":36050,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE",{"configurable":false,"enumerable":true,"writable":false,"value":36051,});
Object.defineProperty(WebGLRenderingContext.prototype, "COLOR_ATTACHMENT0",{"configurable":false,"enumerable":true,"writable":false,"value":36064,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36096,});
Object.defineProperty(WebGLRenderingContext.prototype, "STENCIL_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36128,});
Object.defineProperty(WebGLRenderingContext.prototype, "DEPTH_STENCIL_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":33306,});
Object.defineProperty(WebGLRenderingContext.prototype, "NONE",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_COMPLETE",{"configurable":false,"enumerable":true,"writable":false,"value":36053,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36054,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",{"configurable":false,"enumerable":true,"writable":false,"value":36055,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_INCOMPLETE_DIMENSIONS",{"configurable":false,"enumerable":true,"writable":false,"value":36057,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_UNSUPPORTED",{"configurable":false,"enumerable":true,"writable":false,"value":36061,});
Object.defineProperty(WebGLRenderingContext.prototype, "FRAMEBUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":36006,});
Object.defineProperty(WebGLRenderingContext.prototype, "RENDERBUFFER_BINDING",{"configurable":false,"enumerable":true,"writable":false,"value":36007,});
Object.defineProperty(WebGLRenderingContext.prototype, "MAX_RENDERBUFFER_SIZE",{"configurable":false,"enumerable":true,"writable":false,"value":34024,});
Object.defineProperty(WebGLRenderingContext.prototype, "INVALID_FRAMEBUFFER_OPERATION",{"configurable":false,"enumerable":true,"writable":false,"value":1286,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_FLIP_Y_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37440,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_PREMULTIPLY_ALPHA_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37441,});
Object.defineProperty(WebGLRenderingContext.prototype, "CONTEXT_LOST_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37442,});
Object.defineProperty(WebGLRenderingContext.prototype, "UNPACK_COLORSPACE_CONVERSION_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37443,});
Object.defineProperty(WebGLRenderingContext.prototype, "BROWSER_DEFAULT_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37444,});
Object.defineProperty(WebGLRenderingContext.prototype, "activeTexture",{"configurable":true,"enumerable":true,"writable":true,"value": function activeTexture(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.activeTexture);
Object.defineProperty(WebGLRenderingContext.prototype, "attachShader",{"configurable":true,"enumerable":true,"writable":true,"value": function attachShader(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.attachShader);
Object.defineProperty(WebGLRenderingContext.prototype, "bindAttribLocation",{"configurable":true,"enumerable":true,"writable":true,"value": function bindAttribLocation(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bindAttribLocation);
Object.defineProperty(WebGLRenderingContext.prototype, "bindRenderbuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function bindRenderbuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bindRenderbuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "blendColor",{"configurable":true,"enumerable":true,"writable":true,"value": function blendColor(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.blendColor);
Object.defineProperty(WebGLRenderingContext.prototype, "blendEquation",{"configurable":true,"enumerable":true,"writable":true,"value": function blendEquation(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.blendEquation);
Object.defineProperty(WebGLRenderingContext.prototype, "blendEquationSeparate",{"configurable":true,"enumerable":true,"writable":true,"value": function blendEquationSeparate(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.blendEquationSeparate);
Object.defineProperty(WebGLRenderingContext.prototype, "blendFunc",{"configurable":true,"enumerable":true,"writable":true,"value": function blendFunc(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.blendFunc);
Object.defineProperty(WebGLRenderingContext.prototype, "blendFuncSeparate",{"configurable":true,"enumerable":true,"writable":true,"value": function blendFuncSeparate(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.blendFuncSeparate);
Object.defineProperty(WebGLRenderingContext.prototype, "bufferData",{"configurable":true,"enumerable":true,"writable":true,"value": function bufferData(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bufferData);
Object.defineProperty(WebGLRenderingContext.prototype, "bufferSubData",{"configurable":true,"enumerable":true,"writable":true,"value": function bufferSubData(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bufferSubData);
Object.defineProperty(WebGLRenderingContext.prototype, "checkFramebufferStatus",{"configurable":true,"enumerable":true,"writable":true,"value": function checkFramebufferStatus(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.checkFramebufferStatus);
Object.defineProperty(WebGLRenderingContext.prototype, "compileShader",{"configurable":true,"enumerable":true,"writable":true,"value": function compileShader(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.compileShader);
Object.defineProperty(WebGLRenderingContext.prototype, "compressedTexImage2D",{"configurable":true,"enumerable":true,"writable":true,"value": function compressedTexImage2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.compressedTexImage2D);
Object.defineProperty(WebGLRenderingContext.prototype, "compressedTexSubImage2D",{"configurable":true,"enumerable":true,"writable":true,"value": function compressedTexSubImage2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.compressedTexSubImage2D);
Object.defineProperty(WebGLRenderingContext.prototype, "copyTexImage2D",{"configurable":true,"enumerable":true,"writable":true,"value": function copyTexImage2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.copyTexImage2D);
Object.defineProperty(WebGLRenderingContext.prototype, "copyTexSubImage2D",{"configurable":true,"enumerable":true,"writable":true,"value": function copyTexSubImage2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.copyTexSubImage2D);
Object.defineProperty(WebGLRenderingContext.prototype, "createBuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function createBuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.createBuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "createFramebuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function createFramebuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.createFramebuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "createProgram",{"configurable":true,"enumerable":true,"writable":true,"value": function createProgram(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.createProgram);
Object.defineProperty(WebGLRenderingContext.prototype, "createRenderbuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function createRenderbuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.createRenderbuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "createShader",{"configurable":true,"enumerable":true,"writable":true,"value": function createShader(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.createShader);
Object.defineProperty(WebGLRenderingContext.prototype, "createTexture",{"configurable":true,"enumerable":true,"writable":true,"value": function createTexture(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.createTexture);
Object.defineProperty(WebGLRenderingContext.prototype, "cullFace",{"configurable":true,"enumerable":true,"writable":true,"value": function cullFace(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.cullFace);
Object.defineProperty(WebGLRenderingContext.prototype, "deleteBuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteBuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.deleteBuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "deleteFramebuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteFramebuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.deleteFramebuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "deleteProgram",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteProgram(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.deleteProgram);
Object.defineProperty(WebGLRenderingContext.prototype, "deleteRenderbuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteRenderbuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.deleteRenderbuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "deleteShader",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteShader(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.deleteShader);
Object.defineProperty(WebGLRenderingContext.prototype, "deleteTexture",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteTexture(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.deleteTexture);
Object.defineProperty(WebGLRenderingContext.prototype, "depthFunc",{"configurable":true,"enumerable":true,"writable":true,"value": function depthFunc(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.depthFunc);
Object.defineProperty(WebGLRenderingContext.prototype, "depthMask",{"configurable":true,"enumerable":true,"writable":true,"value": function depthMask(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.depthMask);
Object.defineProperty(WebGLRenderingContext.prototype, "depthRange",{"configurable":true,"enumerable":true,"writable":true,"value": function depthRange(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.depthRange);
Object.defineProperty(WebGLRenderingContext.prototype, "detachShader",{"configurable":true,"enumerable":true,"writable":true,"value": function detachShader(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.detachShader);
Object.defineProperty(WebGLRenderingContext.prototype, "disable",{"configurable":true,"enumerable":true,"writable":true,"value": function disable(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.disable);
Object.defineProperty(WebGLRenderingContext.prototype, "enable",{"configurable":true,"enumerable":true,"writable":true,"value": function enable(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.enable);
Object.defineProperty(WebGLRenderingContext.prototype, "finish",{"configurable":true,"enumerable":true,"writable":true,"value": function finish(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.finish);
Object.defineProperty(WebGLRenderingContext.prototype, "flush",{"configurable":true,"enumerable":true,"writable":true,"value": function flush(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.flush);
Object.defineProperty(WebGLRenderingContext.prototype, "framebufferRenderbuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function framebufferRenderbuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.framebufferRenderbuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "framebufferTexture2D",{"configurable":true,"enumerable":true,"writable":true,"value": function framebufferTexture2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.framebufferTexture2D);
Object.defineProperty(WebGLRenderingContext.prototype, "frontFace",{"configurable":true,"enumerable":true,"writable":true,"value": function frontFace(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.frontFace);
Object.defineProperty(WebGLRenderingContext.prototype, "generateMipmap",{"configurable":true,"enumerable":true,"writable":true,"value": function generateMipmap(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.generateMipmap);
Object.defineProperty(WebGLRenderingContext.prototype, "getActiveAttrib",{"configurable":true,"enumerable":true,"writable":true,"value": function getActiveAttrib(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getActiveAttrib);
Object.defineProperty(WebGLRenderingContext.prototype, "getActiveUniform",{"configurable":true,"enumerable":true,"writable":true,"value": function getActiveUniform(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getActiveUniform);
Object.defineProperty(WebGLRenderingContext.prototype, "getAttachedShaders",{"configurable":true,"enumerable":true,"writable":true,"value": function getAttachedShaders(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getAttachedShaders);
Object.defineProperty(WebGLRenderingContext.prototype, "getAttribLocation",{"configurable":true,"enumerable":true,"writable":true,"value": function getAttribLocation(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getAttribLocation);
Object.defineProperty(WebGLRenderingContext.prototype, "getBufferParameter",{"configurable":true,"enumerable":true,"writable":true,"value": function getBufferParameter(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getBufferParameter);
Object.defineProperty(WebGLRenderingContext.prototype, "getContextAttributes",{"configurable":true,"enumerable":true,"writable":true,"value": function getContextAttributes(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getContextAttributes);
Object.defineProperty(WebGLRenderingContext.prototype, "getError",{"configurable":true,"enumerable":true,"writable":true,"value": function getError(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getError);
Object.defineProperty(WebGLRenderingContext.prototype, "getFramebufferAttachmentParameter",{"configurable":true,"enumerable":true,"writable":true,"value": function getFramebufferAttachmentParameter(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getFramebufferAttachmentParameter);
Object.defineProperty(WebGLRenderingContext.prototype, "getProgramInfoLog",{"configurable":true,"enumerable":true,"writable":true,"value": function getProgramInfoLog(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getProgramInfoLog);
Object.defineProperty(WebGLRenderingContext.prototype, "getProgramParameter",{"configurable":true,"enumerable":true,"writable":true,"value": function getProgramParameter(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getProgramParameter);
Object.defineProperty(WebGLRenderingContext.prototype, "getRenderbufferParameter",{"configurable":true,"enumerable":true,"writable":true,"value": function getRenderbufferParameter(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getRenderbufferParameter);
Object.defineProperty(WebGLRenderingContext.prototype, "getShaderInfoLog",{"configurable":true,"enumerable":true,"writable":true,"value": function getShaderInfoLog(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getShaderInfoLog);
Object.defineProperty(WebGLRenderingContext.prototype, "getShaderParameter",{"configurable":true,"enumerable":true,"writable":true,"value": function getShaderParameter(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getShaderParameter);
Object.defineProperty(WebGLRenderingContext.prototype, "getShaderPrecisionFormat",{"configurable":true,"enumerable":true,"writable":true,"value": function getShaderPrecisionFormat(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getShaderPrecisionFormat);
Object.defineProperty(WebGLRenderingContext.prototype, "getShaderSource",{"configurable":true,"enumerable":true,"writable":true,"value": function getShaderSource(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getShaderSource);
Object.defineProperty(WebGLRenderingContext.prototype, "getTexParameter",{"configurable":true,"enumerable":true,"writable":true,"value": function getTexParameter(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getTexParameter);
Object.defineProperty(WebGLRenderingContext.prototype, "getUniform",{"configurable":true,"enumerable":true,"writable":true,"value": function getUniform(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getUniform);
Object.defineProperty(WebGLRenderingContext.prototype, "getUniformLocation",{"configurable":true,"enumerable":true,"writable":true,"value": function getUniformLocation(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getUniformLocation);
Object.defineProperty(WebGLRenderingContext.prototype, "getVertexAttrib",{"configurable":true,"enumerable":true,"writable":true,"value": function getVertexAttrib(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getVertexAttrib);
Object.defineProperty(WebGLRenderingContext.prototype, "getVertexAttribOffset",{"configurable":true,"enumerable":true,"writable":true,"value": function getVertexAttribOffset(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.getVertexAttribOffset);
Object.defineProperty(WebGLRenderingContext.prototype, "hint",{"configurable":true,"enumerable":true,"writable":true,"value": function hint(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.hint);
Object.defineProperty(WebGLRenderingContext.prototype, "isBuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function isBuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isBuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "isContextLost",{"configurable":true,"enumerable":true,"writable":true,"value": function isContextLost(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isContextLost);
Object.defineProperty(WebGLRenderingContext.prototype, "isEnabled",{"configurable":true,"enumerable":true,"writable":true,"value": function isEnabled(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isEnabled);
Object.defineProperty(WebGLRenderingContext.prototype, "isFramebuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function isFramebuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isFramebuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "isProgram",{"configurable":true,"enumerable":true,"writable":true,"value": function isProgram(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isProgram);
Object.defineProperty(WebGLRenderingContext.prototype, "isRenderbuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function isRenderbuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isRenderbuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "isShader",{"configurable":true,"enumerable":true,"writable":true,"value": function isShader(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isShader);
Object.defineProperty(WebGLRenderingContext.prototype, "isTexture",{"configurable":true,"enumerable":true,"writable":true,"value": function isTexture(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.isTexture);
Object.defineProperty(WebGLRenderingContext.prototype, "lineWidth",{"configurable":true,"enumerable":true,"writable":true,"value": function lineWidth(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.lineWidth);
Object.defineProperty(WebGLRenderingContext.prototype, "linkProgram",{"configurable":true,"enumerable":true,"writable":true,"value": function linkProgram(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.linkProgram);
Object.defineProperty(WebGLRenderingContext.prototype, "pixelStorei",{"configurable":true,"enumerable":true,"writable":true,"value": function pixelStorei(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.pixelStorei);
Object.defineProperty(WebGLRenderingContext.prototype, "polygonOffset",{"configurable":true,"enumerable":true,"writable":true,"value": function polygonOffset(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.polygonOffset);
Object.defineProperty(WebGLRenderingContext.prototype, "readPixels",{"configurable":true,"enumerable":true,"writable":true,"value": function readPixels(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.readPixels);
Object.defineProperty(WebGLRenderingContext.prototype, "renderbufferStorage",{"configurable":true,"enumerable":true,"writable":true,"value": function renderbufferStorage(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.renderbufferStorage);
Object.defineProperty(WebGLRenderingContext.prototype, "sampleCoverage",{"configurable":true,"enumerable":true,"writable":true,"value": function sampleCoverage(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.sampleCoverage);
Object.defineProperty(WebGLRenderingContext.prototype, "shaderSource",{"configurable":true,"enumerable":true,"writable":true,"value": function shaderSource(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.shaderSource);
Object.defineProperty(WebGLRenderingContext.prototype, "stencilFunc",{"configurable":true,"enumerable":true,"writable":true,"value": function stencilFunc(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.stencilFunc);
Object.defineProperty(WebGLRenderingContext.prototype, "stencilFuncSeparate",{"configurable":true,"enumerable":true,"writable":true,"value": function stencilFuncSeparate(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.stencilFuncSeparate);
Object.defineProperty(WebGLRenderingContext.prototype, "stencilMask",{"configurable":true,"enumerable":true,"writable":true,"value": function stencilMask(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.stencilMask);
Object.defineProperty(WebGLRenderingContext.prototype, "stencilMaskSeparate",{"configurable":true,"enumerable":true,"writable":true,"value": function stencilMaskSeparate(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.stencilMaskSeparate);
Object.defineProperty(WebGLRenderingContext.prototype, "stencilOp",{"configurable":true,"enumerable":true,"writable":true,"value": function stencilOp(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.stencilOp);
Object.defineProperty(WebGLRenderingContext.prototype, "stencilOpSeparate",{"configurable":true,"enumerable":true,"writable":true,"value": function stencilOpSeparate(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.stencilOpSeparate);
Object.defineProperty(WebGLRenderingContext.prototype, "texImage2D",{"configurable":true,"enumerable":true,"writable":true,"value": function texImage2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.texImage2D);
Object.defineProperty(WebGLRenderingContext.prototype, "texParameterf",{"configurable":true,"enumerable":true,"writable":true,"value": function texParameterf(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.texParameterf);
Object.defineProperty(WebGLRenderingContext.prototype, "texParameteri",{"configurable":true,"enumerable":true,"writable":true,"value": function texParameteri(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.texParameteri);
Object.defineProperty(WebGLRenderingContext.prototype, "texSubImage2D",{"configurable":true,"enumerable":true,"writable":true,"value": function texSubImage2D(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.texSubImage2D);
Object.defineProperty(WebGLRenderingContext.prototype, "useProgram",{"configurable":true,"enumerable":true,"writable":true,"value": function useProgram(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.useProgram);
Object.defineProperty(WebGLRenderingContext.prototype, "validateProgram",{"configurable":true,"enumerable":true,"writable":true,"value": function validateProgram(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.validateProgram);
Object.defineProperty(WebGLRenderingContext.prototype, "bindBuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function bindBuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bindBuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "bindFramebuffer",{"configurable":true,"enumerable":true,"writable":true,"value": function bindFramebuffer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bindFramebuffer);
Object.defineProperty(WebGLRenderingContext.prototype, "bindTexture",{"configurable":true,"enumerable":true,"writable":true,"value": function bindTexture(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.bindTexture);
Object.defineProperty(WebGLRenderingContext.prototype, "clear",{"configurable":true,"enumerable":true,"writable":true,"value": function clear(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.clear);
Object.defineProperty(WebGLRenderingContext.prototype, "clearColor",{"configurable":true,"enumerable":true,"writable":true,"value": function clearColor(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.clearColor);
Object.defineProperty(WebGLRenderingContext.prototype, "clearDepth",{"configurable":true,"enumerable":true,"writable":true,"value": function clearDepth(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.clearDepth);
Object.defineProperty(WebGLRenderingContext.prototype, "clearStencil",{"configurable":true,"enumerable":true,"writable":true,"value": function clearStencil(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.clearStencil);
Object.defineProperty(WebGLRenderingContext.prototype, "colorMask",{"configurable":true,"enumerable":true,"writable":true,"value": function colorMask(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.colorMask);
Object.defineProperty(WebGLRenderingContext.prototype, "disableVertexAttribArray",{"configurable":true,"enumerable":true,"writable":true,"value": function disableVertexAttribArray(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.disableVertexAttribArray);
Object.defineProperty(WebGLRenderingContext.prototype, "drawArrays",{"configurable":true,"enumerable":true,"writable":true,"value": function drawArrays(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.drawArrays);
Object.defineProperty(WebGLRenderingContext.prototype, "drawElements",{"configurable":true,"enumerable":true,"writable":true,"value": function drawElements(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.drawElements);
Object.defineProperty(WebGLRenderingContext.prototype, "enableVertexAttribArray",{"configurable":true,"enumerable":true,"writable":true,"value": function enableVertexAttribArray(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.enableVertexAttribArray);
Object.defineProperty(WebGLRenderingContext.prototype, "scissor",{"configurable":true,"enumerable":true,"writable":true,"value": function scissor(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.scissor);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform1f",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform1f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform1f);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform1fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform1fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform1fv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform1i",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform1i(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform1i);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform1iv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform1iv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform1iv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform2f",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform2f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform2f);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform2fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform2fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform2fv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform2i",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform2i(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform2i);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform2iv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform2iv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform2iv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform3f",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform3f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform3f);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform3fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform3fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform3fv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform3i",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform3i(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform3i);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform3iv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform3iv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform3iv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform4f",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform4f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform4f);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform4fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform4fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform4fv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform4i",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform4i(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform4i);
Object.defineProperty(WebGLRenderingContext.prototype, "uniform4iv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniform4iv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniform4iv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniformMatrix2fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniformMatrix2fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniformMatrix2fv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniformMatrix3fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniformMatrix3fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniformMatrix3fv);
Object.defineProperty(WebGLRenderingContext.prototype, "uniformMatrix4fv",{"configurable":true,"enumerable":true,"writable":true,"value": function uniformMatrix4fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.uniformMatrix4fv);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib1f",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib1f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib1f);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib1fv",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib1fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib1fv);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib2f",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib2f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib2f);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib2fv",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib2fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib2fv);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib3f",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib3f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib3f);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib3fv",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib3fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib3fv);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib4f",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib4f(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib4f);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttrib4fv",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttrib4fv(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttrib4fv);
Object.defineProperty(WebGLRenderingContext.prototype, "vertexAttribPointer",{"configurable":true,"enumerable":true,"writable":true,"value": function vertexAttribPointer(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.vertexAttribPointer);
Object.defineProperty(WebGLRenderingContext.prototype, "viewport",{"configurable":true,"enumerable":true,"writable":true,"value": function viewport(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.viewport);
Object.defineProperty(WebGLRenderingContext.prototype, "drawingBufferFormat",{"configurable":true,"enumerable":true,"get": function drawingBufferFormat_get(){}, });
Object.defineProperty(WebGLRenderingContext.prototype, "RGB8",{"configurable":false,"enumerable":true,"writable":false,"value":32849,});
Object.defineProperty(WebGLRenderingContext.prototype, "RGBA8",{"configurable":false,"enumerable":true,"writable":false,"value":32856,});
Object.defineProperty(WebGLRenderingContext.prototype, "drawingBufferStorage",{"configurable":true,"enumerable":true,"writable":true,"value": function drawingBufferStorage(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.drawingBufferStorage);
Object.defineProperty(WebGLRenderingContext.prototype, "makeXRCompatible",{"configurable":true,"enumerable":true,"writable":true,"value": function makeXRCompatible(){debugger;},});dogvm.safefunction(WebGLRenderingContext.prototype.makeXRCompatible);

Object.defineProperty(WebGLRenderingContext.prototype, "getSupportedExtensions",{"configurable":true,"enumerable":true,"writable":true,"value": function getSupportedExtensions(){
    // debugger;
    return ['ANGLE_instanced_arrays', 'EXT_blend_minmax', 'EXT_clip_control', 'EXT_color_buffer_half_float', 'EXT_depth_clamp', 'EXT_disjoint_timer_query', 'EXT_float_blend', 'EXT_frag_depth', 'EXT_polygon_offset_clamp', 'EXT_shader_texture_lod', 'EXT_texture_compression_bptc', 'EXT_texture_compression_rgtc', 'EXT_texture_filter_anisotropic', 'EXT_texture_mirror_clamp_to_edge', 'EXT_sRGB', 'KHR_parallel_shader_compile', 'OES_element_index_uint', 'OES_fbo_render_mipmap', 'OES_standard_derivatives', 'OES_texture_float', 'OES_texture_float_linear', 'OES_texture_half_float', 'OES_texture_half_float_linear', 'OES_vertex_array_object', 'WEBGL_blend_func_extended', 'WEBGL_color_buffer_float', 'WEBGL_compressed_texture_s3tc', 'WEBGL_compressed_texture_s3tc_srgb', 'WEBGL_debug_renderer_info', 'WEBGL_debug_shaders', 'WEBGL_depth_texture', 'WEBGL_draw_buffers', 'WEBGL_lose_context', 'WEBGL_multi_draw', 'WEBGL_polygon_mode'];
},});dogvm.safefunction(WebGLRenderingContext.prototype.getSupportedExtensions);


Object.defineProperty(WebGLRenderingContext.prototype, "getExtension",{"configurable":true,"enumerable":true,"writable":true,
    "value": function getExtension(name){
        all = WebGLRenderingContext.prototype.getSupportedExtensions()
        if(all.includes(name)){
            return dogvm.memory.webgl[name];
        }else{
            debugger;
            return null;
        }
    },});dogvm.safefunction(WebGLRenderingContext.prototype.getExtension);


Object.defineProperty(WebGLRenderingContext.prototype, "getParameter",{"configurable":true,"enumerable":true,"writable":true,
    "value": function getParameter(pname){
        if(pname==37446){
            return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Laptop GPU (0x00002520) Direct3D11 vs_5_0 ps_5_0, D3D11)';
        }
        if(pname==37445){
            return 'Google Inc. (NVIDIA)';
        }
        debugger;
        return null
    },});dogvm.safefunction(WebGLRenderingContext.prototype.getParameter);

    
WebGLRenderingContext.getWebDog = function getWebDog(){
    webGLRenderingContext = {};
    webGLRenderingContext.__proto__ = WebGLRenderingContext.prototype;
    webGLRenderingContext.canvas = this;
    webGLRenderingContext.drawingBufferColorSpace = "srgb";
    webGLRenderingContext.drawingBufferFormat = 32856;
    webGLRenderingContext.drawingBufferHeight = 150;
    webGLRenderingContext.drawingBufferWidth = 300;
    webGLRenderingContext.unpackColorSpace = "srgb";
    return dogvm.proxy(webGLRenderingContext);
};
// CanvasRenderingContext2D对象
var CanvasRenderingContext2D = function CanvasRenderingContext2D(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(CanvasRenderingContext2D);

Object.defineProperty(CanvasRenderingContext2D.prototype, Symbol.toStringTag,{"value":"CanvasRenderingContext2D","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CanvasRenderingContext2D.prototype, "canvas",{"configurable":true,"enumerable":true,"get": function canvas_get(){debugger; return "[object HTMLCanvasElement]"},set:undefined, });
Object.defineProperty(CanvasRenderingContext2D.prototype, "globalAlpha",{"configurable":true,"enumerable":true,"get": function globalAlpha_get(){debugger; return "1"},"set": function globalAlpha_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "globalCompositeOperation",{"configurable":true,"enumerable":true,"get": function globalCompositeOperation_get(){debugger; return "source-over"},"set": function globalCompositeOperation_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "filter",{"configurable":true,"enumerable":true,"get": function filter_get(){debugger; return "none"},"set": function filter_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "imageSmoothingEnabled",{"configurable":true,"enumerable":true,"get": function imageSmoothingEnabled_get(){debugger; return "true"},"set": function imageSmoothingEnabled_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "imageSmoothingQuality",{"configurable":true,"enumerable":true,"get": function imageSmoothingQuality_get(){debugger; return "low"},"set": function imageSmoothingQuality_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "strokeStyle",{"configurable":true,"enumerable":true,"get": function strokeStyle_get(){debugger; return "#000000"},"set": function strokeStyle_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "fillStyle",{"configurable":true,"enumerable":true,"get": function fillStyle_get(){debugger; return "#000000"},"set": function fillStyle_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "shadowOffsetX",{"configurable":true,"enumerable":true,"get": function shadowOffsetX_get(){debugger; return "0"},"set": function shadowOffsetX_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "shadowOffsetY",{"configurable":true,"enumerable":true,"get": function shadowOffsetY_get(){debugger; return "0"},"set": function shadowOffsetY_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "shadowBlur",{"configurable":true,"enumerable":true,"get": function shadowBlur_get(){debugger; return "0"},"set": function shadowBlur_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "shadowColor",{"configurable":true,"enumerable":true,"get": function shadowColor_get(){debugger; return "rgba(0, 0, 0, 0)"},"set": function shadowColor_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "lineWidth",{"configurable":true,"enumerable":true,"get": function lineWidth_get(){debugger; return "1"},"set": function lineWidth_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "lineCap",{"configurable":true,"enumerable":true,"get": function lineCap_get(){debugger; return "butt"},"set": function lineCap_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "lineJoin",{"configurable":true,"enumerable":true,"get": function lineJoin_get(){debugger; return "miter"},"set": function lineJoin_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "miterLimit",{"configurable":true,"enumerable":true,"get": function miterLimit_get(){debugger; return "10"},"set": function miterLimit_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "lineDashOffset",{"configurable":true,"enumerable":true,"get": function lineDashOffset_get(){debugger; return "0"},"set": function lineDashOffset_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "font",{"configurable":true,"enumerable":true,"get": function font_get(){debugger; return "10px sans-serif"},"set": function font_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "textAlign",{"configurable":true,"enumerable":true,"get": function textAlign_get(){debugger; return "start"},"set": function textAlign_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "textBaseline",{"configurable":true,"enumerable":true,"get": function textBaseline_get(){debugger; return "alphabetic"},"set": function textBaseline_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "direction",{"configurable":true,"enumerable":true,"get": function direction_get(){debugger; return "ltr"},"set": function direction_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "fontKerning",{"configurable":true,"enumerable":true,"get": function fontKerning_get(){debugger; return "auto"},"set": function fontKerning_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "fontStretch",{"configurable":true,"enumerable":true,"get": function fontStretch_get(){debugger; return "normal"},"set": function fontStretch_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "fontVariantCaps",{"configurable":true,"enumerable":true,"get": function fontVariantCaps_get(){debugger; return "normal"},"set": function fontVariantCaps_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "letterSpacing",{"configurable":true,"enumerable":true,"get": function letterSpacing_get(){debugger; return "0px"},"set": function letterSpacing_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "textRendering",{"configurable":true,"enumerable":true,"get": function textRendering_get(){debugger; return "auto"},"set": function textRendering_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "wordSpacing",{"configurable":true,"enumerable":true,"get": function wordSpacing_get(){debugger; return "0px"},"set": function wordSpacing_set(){debugger;},});
Object.defineProperty(CanvasRenderingContext2D.prototype, "clip",{"configurable":true,"enumerable":true,"writable":true,"value": function clip(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.clip);
Object.defineProperty(CanvasRenderingContext2D.prototype, "createConicGradient",{"configurable":true,"enumerable":true,"writable":true,"value": function createConicGradient(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.createConicGradient);
Object.defineProperty(CanvasRenderingContext2D.prototype, "createImageData",{"configurable":true,"enumerable":true,"writable":true,"value": function createImageData(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.createImageData);
Object.defineProperty(CanvasRenderingContext2D.prototype, "createLinearGradient",{"configurable":true,"enumerable":true,"writable":true,"value": function createLinearGradient(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.createLinearGradient);
Object.defineProperty(CanvasRenderingContext2D.prototype, "createPattern",{"configurable":true,"enumerable":true,"writable":true,"value": function createPattern(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.createPattern);
Object.defineProperty(CanvasRenderingContext2D.prototype, "createRadialGradient",{"configurable":true,"enumerable":true,"writable":true,"value": function createRadialGradient(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.createRadialGradient);
Object.defineProperty(CanvasRenderingContext2D.prototype, "drawFocusIfNeeded",{"configurable":true,"enumerable":true,"writable":true,"value": function drawFocusIfNeeded(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.drawFocusIfNeeded);
Object.defineProperty(CanvasRenderingContext2D.prototype, "drawImage",{"configurable":true,"enumerable":true,"writable":true,"value": function drawImage(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.drawImage);
Object.defineProperty(CanvasRenderingContext2D.prototype, "fill",{"configurable":true,"enumerable":true,"writable":true,"value": function fill(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.fill);
Object.defineProperty(CanvasRenderingContext2D.prototype, "fillText",{"configurable":true,"enumerable":true,"writable":true,"value": function fillText(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.fillText);
Object.defineProperty(CanvasRenderingContext2D.prototype, "getContextAttributes",{"configurable":true,"enumerable":true,"writable":true,"value": function getContextAttributes(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.getContextAttributes);
Object.defineProperty(CanvasRenderingContext2D.prototype, "getImageData",{"configurable":true,"enumerable":true,"writable":true,"value": function getImageData(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.getImageData);
Object.defineProperty(CanvasRenderingContext2D.prototype, "getLineDash",{"configurable":true,"enumerable":true,"writable":true,"value": function getLineDash(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.getLineDash);
Object.defineProperty(CanvasRenderingContext2D.prototype, "getTransform",{"configurable":true,"enumerable":true,"writable":true,"value": function getTransform(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.getTransform);
Object.defineProperty(CanvasRenderingContext2D.prototype, "isContextLost",{"configurable":true,"enumerable":true,"writable":true,"value": function isContextLost(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.isContextLost);
Object.defineProperty(CanvasRenderingContext2D.prototype, "isPointInPath",{"configurable":true,"enumerable":true,"writable":true,"value": function isPointInPath(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.isPointInPath);
Object.defineProperty(CanvasRenderingContext2D.prototype, "isPointInStroke",{"configurable":true,"enumerable":true,"writable":true,"value": function isPointInStroke(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.isPointInStroke);
Object.defineProperty(CanvasRenderingContext2D.prototype, "measureText",{"configurable":true,"enumerable":true,"writable":true,"value": function measureText(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.measureText);
Object.defineProperty(CanvasRenderingContext2D.prototype, "putImageData",{"configurable":true,"enumerable":true,"writable":true,"value": function putImageData(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.putImageData);
Object.defineProperty(CanvasRenderingContext2D.prototype, "reset",{"configurable":true,"enumerable":true,"writable":true,"value": function reset(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.reset);
Object.defineProperty(CanvasRenderingContext2D.prototype, "roundRect",{"configurable":true,"enumerable":true,"writable":true,"value": function roundRect(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.roundRect);
Object.defineProperty(CanvasRenderingContext2D.prototype, "save",{"configurable":true,"enumerable":true,"writable":true,"value": function save(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.save);
Object.defineProperty(CanvasRenderingContext2D.prototype, "scale",{"configurable":true,"enumerable":true,"writable":true,"value": function scale(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.scale);
Object.defineProperty(CanvasRenderingContext2D.prototype, "setLineDash",{"configurable":true,"enumerable":true,"writable":true,"value": function setLineDash(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.setLineDash);
Object.defineProperty(CanvasRenderingContext2D.prototype, "setTransform",{"configurable":true,"enumerable":true,"writable":true,"value": function setTransform(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.setTransform);
Object.defineProperty(CanvasRenderingContext2D.prototype, "stroke",{"configurable":true,"enumerable":true,"writable":true,"value": function stroke(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.stroke);
Object.defineProperty(CanvasRenderingContext2D.prototype, "strokeText",{"configurable":true,"enumerable":true,"writable":true,"value": function strokeText(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.strokeText);
Object.defineProperty(CanvasRenderingContext2D.prototype, "transform",{"configurable":true,"enumerable":true,"writable":true,"value": function transform(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.transform);
Object.defineProperty(CanvasRenderingContext2D.prototype, "translate",{"configurable":true,"enumerable":true,"writable":true,"value": function translate(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.translate);
Object.defineProperty(CanvasRenderingContext2D.prototype, "arc",{"configurable":true,"enumerable":true,"writable":true,"value": function arc(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.arc);
Object.defineProperty(CanvasRenderingContext2D.prototype, "arcTo",{"configurable":true,"enumerable":true,"writable":true,"value": function arcTo(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.arcTo);
Object.defineProperty(CanvasRenderingContext2D.prototype, "beginPath",{"configurable":true,"enumerable":true,"writable":true,"value": function beginPath(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.beginPath);
Object.defineProperty(CanvasRenderingContext2D.prototype, "bezierCurveTo",{"configurable":true,"enumerable":true,"writable":true,"value": function bezierCurveTo(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.bezierCurveTo);
Object.defineProperty(CanvasRenderingContext2D.prototype, "clearRect",{"configurable":true,"enumerable":true,"writable":true,"value": function clearRect(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.clearRect);
Object.defineProperty(CanvasRenderingContext2D.prototype, "closePath",{"configurable":true,"enumerable":true,"writable":true,"value": function closePath(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.closePath);
Object.defineProperty(CanvasRenderingContext2D.prototype, "ellipse",{"configurable":true,"enumerable":true,"writable":true,"value": function ellipse(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.ellipse);
Object.defineProperty(CanvasRenderingContext2D.prototype, "fillRect",{"configurable":true,"enumerable":true,"writable":true,"value": function fillRect(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.fillRect);
Object.defineProperty(CanvasRenderingContext2D.prototype, "lineTo",{"configurable":true,"enumerable":true,"writable":true,"value": function lineTo(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.lineTo);
Object.defineProperty(CanvasRenderingContext2D.prototype, "moveTo",{"configurable":true,"enumerable":true,"writable":true,"value": function moveTo(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.moveTo);
Object.defineProperty(CanvasRenderingContext2D.prototype, "quadraticCurveTo",{"configurable":true,"enumerable":true,"writable":true,"value": function quadraticCurveTo(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.quadraticCurveTo);
Object.defineProperty(CanvasRenderingContext2D.prototype, "rect",{"configurable":true,"enumerable":true,"writable":true,"value": function rect(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.rect);
Object.defineProperty(CanvasRenderingContext2D.prototype, "resetTransform",{"configurable":true,"enumerable":true,"writable":true,"value": function resetTransform(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.resetTransform);
Object.defineProperty(CanvasRenderingContext2D.prototype, "restore",{"configurable":true,"enumerable":true,"writable":true,"value": function restore(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.restore);
Object.defineProperty(CanvasRenderingContext2D.prototype, "rotate",{"configurable":true,"enumerable":true,"writable":true,"value": function rotate(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.rotate);
Object.defineProperty(CanvasRenderingContext2D.prototype, "strokeRect",{"configurable":true,"enumerable":true,"writable":true,"value": function strokeRect(){debugger;},});dogvm.safefunction(CanvasRenderingContext2D.prototype.strokeRect);

CanvasRenderingContext2D.create2DDog = function create2DDog(){
    let dd = {};
    dd.__proto__ = CanvasRenderingContext2D.prototype;
    return dogvm.proxy(dd);
};dogvm.safefunction(CanvasRenderingContext2D.create2DDog);
// CustomElementRegistry对象
var CustomElementRegistry = function CustomElementRegistry(){};dogvm.safefunction(CustomElementRegistry);

Object.defineProperty(CustomElementRegistry.prototype, Symbol.toStringTag,{"value":"CustomElementRegistry","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CustomElementRegistry.prototype, "define",{"configurable":true,"enumerable":true,"writable":true,"value": function define(){debugger;},});dogvm.safefunction(CustomElementRegistry.prototype.define);
Object.defineProperty(CustomElementRegistry.prototype, "get",{"configurable":true,"enumerable":true,"writable":true,"value": function get(){debugger;},});dogvm.safefunction(CustomElementRegistry.prototype.get);
Object.defineProperty(CustomElementRegistry.prototype, "getName",{"configurable":true,"enumerable":true,"writable":true,"value": function getName(){debugger;},});dogvm.safefunction(CustomElementRegistry.prototype.getName);
Object.defineProperty(CustomElementRegistry.prototype, "upgrade",{"configurable":true,"enumerable":true,"writable":true,"value": function upgrade(){debugger;},});dogvm.safefunction(CustomElementRegistry.prototype.upgrade);
Object.defineProperty(CustomElementRegistry.prototype, "whenDefined",{"configurable":true,"enumerable":true,"writable":true,"value": function whenDefined(){debugger;},});dogvm.safefunction(CustomElementRegistry.prototype.whenDefined);
// CSSRule
var CSSRule = function CSSRule(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(CSSRule);
Object.defineProperty(CSSRule, "STYLE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(CSSRule, "CHARSET_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(CSSRule, "IMPORT_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(CSSRule, "MEDIA_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(CSSRule, "FONT_FACE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":5,});
Object.defineProperty(CSSRule, "PAGE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":6,});
Object.defineProperty(CSSRule, "NAMESPACE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":10,});
Object.defineProperty(CSSRule, "KEYFRAMES_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":7,});
Object.defineProperty(CSSRule, "KEYFRAME_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":8,});
Object.defineProperty(CSSRule, "COUNTER_STYLE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":11,});
Object.defineProperty(CSSRule, "FONT_FEATURE_VALUES_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":14,});
Object.defineProperty(CSSRule, "SUPPORTS_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":12,});
Object.defineProperty(CSSRule, "MARGIN_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":9,});
Object.defineProperty(CSSRule.prototype, Symbol.toStringTag,{"value":"CSSRule","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CSSRule.prototype, "parentRule",{"configurable":true,"enumerable":true,"get": function parentRule_get(){},set:undefined, });
Object.defineProperty(CSSRule.prototype, "parentStyleSheet",{"configurable":true,"enumerable":true,"get": function parentStyleSheet_get(){},set:undefined, });
Object.defineProperty(CSSRule.prototype, "STYLE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(CSSRule.prototype, "CHARSET_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(CSSRule.prototype, "IMPORT_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(CSSRule.prototype, "MEDIA_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(CSSRule.prototype, "FONT_FACE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":5,});
Object.defineProperty(CSSRule.prototype, "PAGE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":6,});
Object.defineProperty(CSSRule.prototype, "NAMESPACE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":10,});
Object.defineProperty(CSSRule.prototype, "KEYFRAMES_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":7,});
Object.defineProperty(CSSRule.prototype, "KEYFRAME_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":8,});
Object.defineProperty(CSSRule.prototype, "COUNTER_STYLE_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":11,});
Object.defineProperty(CSSRule.prototype, "FONT_FEATURE_VALUES_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":14,});
Object.defineProperty(CSSRule.prototype, "SUPPORTS_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":12,});
Object.defineProperty(CSSRule.prototype, "MARGIN_RULE",{"configurable":false,"enumerable":true,"writable":false,"value":9,});

Object.defineProperty(CSSRule.prototype, "type",{"configurable":true,"enumerable":true,"get": function type_get(){return this._type;},set:undefined, });
Object.defineProperty(CSSRule.prototype, "cssText",{"configurable":true,"enumerable":true,"get": function cssText_get(){return this._cssText},"set": function cssText_set(value){debugger;this._cssText=value;},});
// CSSRuleList
var CSSRuleList = function CSSRuleList(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(CSSRuleList);

Object.defineProperty(CSSRuleList.prototype, Symbol.toStringTag,{"value":"CSSRuleList","writable":false,"enumerable":false,"configurable":true})

Object.defineProperty(CSSRuleList.prototype, "item",{"configurable":true,"enumerable":true,"writable":true,"value": function item(){debugger;},});dogvm.safefunction(CSSRuleList.prototype.item);

Object.defineProperty(CSSRuleList.prototype, "length",{"configurable":true,"enumerable":true,
    "get": function length_get(){
        return this._rule.length;
    },set:undefined, });

CSSRuleList.createDog = function createDog(_innerHtml){
    let obj = Object.create(CSSRuleList.prototype);
    obj[0] = CSSStyleRule.createDog(_innerHtml);
    obj._rule = [obj[0]];
    return obj;
};dogvm.safefunction(CSSRuleList.createDog);
// CSSStyleRule
var CSSStyleRule = function CSSStyleRule(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(CSSStyleRule);

Object.defineProperty(CSSStyleRule.prototype, Symbol.toStringTag,{"value":"CSSStyleRule","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CSSStyleRule.prototype, "selectorText",{"configurable":true,"enumerable":true,"get": function selectorText_get(){return this._selectorText;},"set": function selectorText_set(value){debugger;this._selectorText=value;},});
Object.defineProperty(CSSStyleRule.prototype, "style",{"configurable":true,"enumerable":true,"get": function style_get(){},"set": function style_set(){debugger;},});
Object.defineProperty(CSSStyleRule.prototype, "styleMap",{"configurable":true,"enumerable":true,"get": function styleMap_get(){},set:undefined, });
Object.defineProperty(CSSStyleRule.prototype, "cssRules",{"configurable":true,"enumerable":true,"get": function cssRules_get(){},set:undefined, });
Object.defineProperty(CSSStyleRule.prototype, "deleteRule",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteRule(){debugger;},});dogvm.safefunction(CSSStyleRule.prototype.deleteRule);
Object.defineProperty(CSSStyleRule.prototype, "insertRule",{"configurable":true,"enumerable":true,"writable":true,"value": function insertRule(){debugger;},});dogvm.safefunction(CSSStyleRule.prototype.insertRule);
Object.setPrototypeOf(CSSStyleRule.prototype, CSSRule.prototype);

CSSStyleRule.createDog = function createDog(_innerHtml){
    let csRule = Object.create(CSSStyleRule.prototype);
    csRule.selectorText = _innerHtml;
    csRule.cssText = _innerHtml;
    csRule._type = 1;
    return csRule;
}
// StyleSheet对象
var StyleSheet = function StyleSheet(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(StyleSheet);
Object.defineProperty(StyleSheet.prototype, Symbol.toStringTag,{"value":"StyleSheet","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(StyleSheet.prototype, "type",{"configurable":true,"enumerable":true,"get": function type_get(){return this._type;},set:undefined, });
Object.defineProperty(StyleSheet.prototype, "href",{"configurable":true,"enumerable":true,"get": function href_get(){},set:undefined, });
Object.defineProperty(StyleSheet.prototype, "ownerNode",{"configurable":true,"enumerable":true,"get": function ownerNode_get(){},set:undefined, });
Object.defineProperty(StyleSheet.prototype, "parentStyleSheet",{"configurable":true,"enumerable":true,"get": function parentStyleSheet_get(){},set:undefined, });
Object.defineProperty(StyleSheet.prototype, "title",{"configurable":true,"enumerable":true,"get": function title_get(){},set:undefined, });
Object.defineProperty(StyleSheet.prototype, "media",{"configurable":true,"enumerable":true,"get": function media_get(){},"set": function media_set(){debugger;},});
Object.defineProperty(StyleSheet.prototype, "disabled",{"configurable":true,"enumerable":true,"get": function disabled_get(){},"set": function disabled_set(){debugger;},});


dogvm.safeproperty(StyleSheet);

// CSSStyleSheet
var CSSStyleSheet = function CSSStyleSheet(_innerHtml){
    let cs = Object.create(CSSStyleSheet.prototype);
    cs._type = "text/css";
    cs._innerHtml = _innerHtml;
    return dogvm.proxy(cs);
};dogvm.safefunction(CSSStyleSheet);

Object.defineProperty(CSSStyleSheet.prototype, Symbol.toStringTag,{"value":"CSSStyleSheet","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CSSStyleSheet.prototype, "ownerRule",{"configurable":true,"enumerable":true,"get": function ownerRule_get(){ return "null"},set:undefined, });
Object.defineProperty(CSSStyleSheet.prototype, "rules",{"configurable":true,"enumerable":true,"get": function rules_get(){ return "[object CSSRuleList]"},set:undefined, });
Object.defineProperty(CSSStyleSheet.prototype, "addRule",{"configurable":true,"enumerable":true,"writable":true,"value": function addRule(){debugger;},});dogvm.safefunction(CSSStyleSheet.prototype.addRule);
Object.defineProperty(CSSStyleSheet.prototype, "deleteRule",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteRule(){debugger;},});dogvm.safefunction(CSSStyleSheet.prototype.deleteRule);
Object.defineProperty(CSSStyleSheet.prototype, "insertRule",{"configurable":true,"enumerable":true,"writable":true,"value": function insertRule(){debugger;},});dogvm.safefunction(CSSStyleSheet.prototype.insertRule);
Object.defineProperty(CSSStyleSheet.prototype, "removeRule",{"configurable":true,"enumerable":true,"writable":true,"value": function removeRule(){debugger;},});dogvm.safefunction(CSSStyleSheet.prototype.removeRule);
Object.defineProperty(CSSStyleSheet.prototype, "replace",{"configurable":true,"enumerable":true,"writable":true,"value": function replace(){debugger;},});dogvm.safefunction(CSSStyleSheet.prototype.replace);
Object.defineProperty(CSSStyleSheet.prototype, "replaceSync",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceSync(){debugger;},});dogvm.safefunction(CSSStyleSheet.prototype.replaceSync);
Object.setPrototypeOf(CSSStyleSheet.prototype, StyleSheet.prototype);


Object.defineProperty(CSSStyleSheet.prototype, "cssRules",{"configurable":true,"enumerable":true,
    "get": function cssRules_get(){
        list = CSSRuleList.createDog(this._innerHtml);
        return list;
    },
    set:undefined, });

WebGLDebugRendererInfo = {};
WebGLDebugRendererInfo.prototype = {};

Object.defineProperties(WebGLDebugRendererInfo.prototype, {
    [Symbol.toStringTag]: {
        value: "WebGLDebugRendererInfo",
        configurable: true
    }
});
Object.defineProperty(WebGLDebugRendererInfo.prototype, "UNMASKED_RENDERER_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37446,});
Object.defineProperty(WebGLDebugRendererInfo.prototype, "UNMASKED_VENDOR_WEBGL",{"configurable":false,"enumerable":true,"writable":false,"value":37445,});

WebGLDebugRendererInfo = dogvm.proxy(WebGLDebugRendererInfo);

webGLDebugRendererInfo = {};
webGLDebugRendererInfo.__proto__ = WebGLDebugRendererInfo.prototype;

dogvm.memory.webgl["WEBGL_debug_renderer_info"] = webGLDebugRendererInfo;

// // Error对象
// // 重写 Error 构造函数
// debugger;
// var originalError = Error;
// var Error = function (message) {
//     debugger;
//     const error = new originalError(message);
//     // 获取堆栈信息
//     let stack = error.stack;
//     // 格式化堆栈信息
//     function replaceStackTrace(str, targetPath, endPath) {

//     }

//     const targetPath = "tdc.js?app_data=7283145436216164352&t=573262812";
//     const str = 'Error: errr\n    at eval (eval-ee8821db.repl:1:1)\n    at D:\\code\\逆向\\js补环境/debugger.js:3126:17\n    at B (D:\\code\\逆向\\js补环境/debugger.js:3128:14)\n    at Array.R (D:\\code\\逆向\\js补环境/debugger.js:3241:20)\n    at __TENCENT_CHAOS_VM (D:\\code\\逆向\\js补环境/debugger.js:3380:34)\n    at Proxy.Q (D:\\code\\逆向\\js补环境/debugger.js:3221:24)\n    at Array.R (D:\\code\\逆向\\js补环境/debugger.js:3155:29)\n    at __TENCENT_CHAOS_VM (D:\\code\\逆向\\js补环境/debugger.js:3380:34)\n    at Object.Q [as getData] (D:\\code\\逆向\\js补环境/debugger.js:3221:24)\n    at D:\\code\\逆向\\js补环境/debugger.js:3533:12';
//     stack = replaceStackTrace(stack, targetPath, 'at e.getTdcData (dy-ele.5be1e8be.js:1:99567)');

//     // 修改堆栈
//     error.stack = stack;

//     return error;
// };
// dogvm.safefunction(Error);


// Error = dogvm.proxy(Error);

debugger

Error.prepareStackTrace = (err, structuredStackTrace) => {
    debugger;
    // 获取错误信息并作为第一行
    const errorMessage = `${err.name}: ${err.message}`;
    const stackLines = structuredStackTrace.map((callSite, index) => {

        const functionName = callSite.getFunctionName() ;
        const fileName = callSite.getFileName() || '';
        const lineNumber = callSite.getLineNumber();
        const columnNumber = callSite.getColumnNumber();
        const newFileName = fileName.split('debugger.js')[0].replace(/.*/, replaceUrl);
        if (index === 0 && callSite.isEval()) {
            return `    at eval (eval at <anonymous> (${newFileName}:${1}:${1}), <anonymous>:1:12)`;
        }

        if (index !== 0 && callSite.getFunctionName() == null){
            return `    at e.getTdcData (https://turing.captcha.gtimg.com/1/dy-ele.5be1e8be.js:1:99985)`;
        }

        if (index === structuredStackTrace.length - 1) {
            return `    at t.verify (https://turing.captcha.gtimg.com/1/dy-ele.5be1e8be.js:1:126659)`;
        }

        return functionName == null
            ?`    at ${newFileName}:${lineNumber}:${columnNumber}`
            :`    at ${functionName} (${newFileName}:${lineNumber}:${columnNumber})`;
    }).join('\n');

    // 将错误信息和堆栈信息组合
    // stackLines = '    at https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:19:24\n    at B (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:21:14)\n    at Array.R (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:130:20)\n    at __TENCENT_CHAOS_VM (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:266:34)\n    at Q (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:110:24)\n    at Array.R (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:48:29)\n    at __TENCENT_CHAOS_VM (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:266:34)\n    at Object.Q [as getData] (https://turing.captcha.qcloud.com/tdc.js?app_data=7288551096081035264&t=640801614:110:24)\n    at e.getTdcData (https://turing.captcha.gtimg.com/1/dy-ele.5be1e8be.js:1:99985)\n    at t.verify (https://turing.captcha.gtimg.com/1/dy-ele.5be1e8be.js:1:126659)';
    return `${errorMessage}\n${stackLines}`;
};


var EventTarget = function EventTarget() { // 构造函数

};
dogvm.safefunction(EventTarget);

// 因为EventTarget是构造函数，而我们要的是原型，因此需要先hook EventTarget.prototype，设置下原型的名字，否则它会使用父亲的名字
Object.defineProperties(EventTarget.prototype, {
    [Symbol.toStringTag]: {
        value: "EventTarget",
        configurable: true
    }
})

EventTarget.prototype.addEventListener = function addEventListener(type,callback) {
    debugger; //debugger的意义在于检测到是否检测了该方法
    if(!(type in dogvm.memory.listeners)){
        dogvm.memory.listeners[type] = [];
    }
    dogvm.memory.listeners[type].push(callback);
};
dogvm.safefunction(EventTarget.prototype.addEventListener);

EventTarget.prototype.dispatchEvent = function dispatchEvent() {
    debugger;
};
dogvm.safefunction(EventTarget.prototype.dispatchEvent);

EventTarget.prototype.removeEventListener = function removeEventListener() {
    debugger;
};
dogvm.safefunction(EventTarget.prototype.removeEventListener);

// EventTarget = dogvm.proxy(EventTarget);
// EventTarget.prototype = dogvm.proxy(EventTarget.prototype);

var Node = function Node(){
    throw new TypeError("Illegal constructor");
};
dogvm.safefunction(Node);

Node.prototype.__proto__ = EventTarget.prototype;

///////////////////////////////////////
Object.defineProperty(Node, "ELEMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(Node, "ATTRIBUTE_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(Node, "TEXT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(Node, "CDATA_SECTION_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(Node, "ENTITY_REFERENCE_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":5,});
Object.defineProperty(Node, "ENTITY_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":6,});
Object.defineProperty(Node, "PROCESSING_INSTRUCTION_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":7,});
Object.defineProperty(Node, "COMMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":8,});
Object.defineProperty(Node, "DOCUMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":9,});
Object.defineProperty(Node, "DOCUMENT_TYPE_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":10,});
Object.defineProperty(Node, "DOCUMENT_FRAGMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":11,});
Object.defineProperty(Node, "NOTATION_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":12,});
Object.defineProperty(Node, "DOCUMENT_POSITION_DISCONNECTED",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(Node, "DOCUMENT_POSITION_PRECEDING",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(Node, "DOCUMENT_POSITION_FOLLOWING",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(Node, "DOCUMENT_POSITION_CONTAINS",{"configurable":false,"enumerable":true,"writable":false,"value":8,});
Object.defineProperty(Node, "DOCUMENT_POSITION_CONTAINED_BY",{"configurable":false,"enumerable":true,"writable":false,"value":16,});
Object.defineProperty(Node, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",{"configurable":false,"enumerable":true,"writable":false,"value":32,});
Object.defineProperty(Node.prototype, Symbol.toStringTag,{"value":"Node","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(Node.prototype, "baseURI",{"configurable":true,"enumerable":true,"get": function baseURI_get(){},set:Node, });
Object.defineProperty(Node.prototype, "isConnected",{"configurable":true,"enumerable":true,"get": function isConnected_get(){},set:Node, });
Object.defineProperty(Node.prototype, "ownerDocument",{"configurable":true,"enumerable":true,"get": function ownerDocument_get(){},set:Node, });
Object.defineProperty(Node.prototype, "parentElement",{"configurable":true,"enumerable":true,"get": function parentElement_get(){},set:Node, });
Object.defineProperty(Node.prototype, "childNodes",{"configurable":true,"enumerable":true,"get": function childNodes_get(){},set:Node, });
Object.defineProperty(Node.prototype, "firstChild",{"configurable":true,"enumerable":true,"get": function firstChild_get(){},set:Node, });
Object.defineProperty(Node.prototype, "lastChild",{"configurable":true,"enumerable":true,"get": function lastChild_get(){},set:Node, });
Object.defineProperty(Node.prototype, "previousSibling",{"configurable":true,"enumerable":true,"get": function previousSibling_get(){},set:Node, });
Object.defineProperty(Node.prototype, "nextSibling",{"configurable":true,"enumerable":true,"get": function nextSibling_get(){},set:Node, });
Object.defineProperty(Node.prototype, "nodeValue",{"configurable":true,"enumerable":true,"get": function nodeValue_get(){},"set": function nodeValue_set(){debugger;},});
Object.defineProperty(Node.prototype, "textContent",{"configurable":true,"enumerable":true,"get": function textContent_get(){},"set": function textContent_set(){debugger;},});
Object.defineProperty(Node.prototype, "ELEMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(Node.prototype, "ATTRIBUTE_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(Node.prototype, "TEXT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(Node.prototype, "CDATA_SECTION_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(Node.prototype, "ENTITY_REFERENCE_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":5,});
Object.defineProperty(Node.prototype, "ENTITY_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":6,});
Object.defineProperty(Node.prototype, "PROCESSING_INSTRUCTION_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":7,});
Object.defineProperty(Node.prototype, "COMMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":8,});
Object.defineProperty(Node.prototype, "DOCUMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":9,});
Object.defineProperty(Node.prototype, "DOCUMENT_TYPE_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":10,});
Object.defineProperty(Node.prototype, "DOCUMENT_FRAGMENT_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":11,});
Object.defineProperty(Node.prototype, "NOTATION_NODE",{"configurable":false,"enumerable":true,"writable":false,"value":12,});
Object.defineProperty(Node.prototype, "DOCUMENT_POSITION_DISCONNECTED",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(Node.prototype, "DOCUMENT_POSITION_PRECEDING",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(Node.prototype, "DOCUMENT_POSITION_FOLLOWING",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(Node.prototype, "DOCUMENT_POSITION_CONTAINS",{"configurable":false,"enumerable":true,"writable":false,"value":8,});
Object.defineProperty(Node.prototype, "DOCUMENT_POSITION_CONTAINED_BY",{"configurable":false,"enumerable":true,"writable":false,"value":16,});
Object.defineProperty(Node.prototype, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",{"configurable":false,"enumerable":true,"writable":false,"value":32,});
Object.defineProperty(Node.prototype, "compareDocumentPosition",{"configurable":true,"enumerable":true,"writable":true,"value": function compareDocumentPosition(){debugger;},});dogvm.safefunction(Node.prototype.compareDocumentPosition);
Object.defineProperty(Node.prototype, "contains",{"configurable":true,"enumerable":true,"writable":true,"value": function contains(){debugger;},});dogvm.safefunction(Node.prototype.contains);
Object.defineProperty(Node.prototype, "getRootNode",{"configurable":true,"enumerable":true,"writable":true,"value": function getRootNode(){debugger;},});dogvm.safefunction(Node.prototype.getRootNode);
Object.defineProperty(Node.prototype, "hasChildNodes",{"configurable":true,"enumerable":true,"writable":true,"value": function hasChildNodes(){debugger;},});dogvm.safefunction(Node.prototype.hasChildNodes);
Object.defineProperty(Node.prototype, "isDefaultNamespace",{"configurable":true,"enumerable":true,"writable":true,"value": function isDefaultNamespace(){debugger;},});dogvm.safefunction(Node.prototype.isDefaultNamespace);
Object.defineProperty(Node.prototype, "isEqualNode",{"configurable":true,"enumerable":true,"writable":true,"value": function isEqualNode(){debugger;},});dogvm.safefunction(Node.prototype.isEqualNode);
Object.defineProperty(Node.prototype, "isSameNode",{"configurable":true,"enumerable":true,"writable":true,"value": function isSameNode(){debugger;},});dogvm.safefunction(Node.prototype.isSameNode);
Object.defineProperty(Node.prototype, "lookupNamespaceURI",{"configurable":true,"enumerable":true,"writable":true,"value": function lookupNamespaceURI(){debugger;},});dogvm.safefunction(Node.prototype.lookupNamespaceURI);
Object.defineProperty(Node.prototype, "lookupPrefix",{"configurable":true,"enumerable":true,"writable":true,"value": function lookupPrefix(){debugger;},});dogvm.safefunction(Node.prototype.lookupPrefix);
Object.defineProperty(Node.prototype, "normalize",{"configurable":true,"enumerable":true,"writable":true,"value": function normalize(){debugger;},});dogvm.safefunction(Node.prototype.normalize);
Object.defineProperty(Node.prototype, "replaceChild",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceChild(){debugger;},});dogvm.safefunction(Node.prototype.replaceChild);
Object.setPrototypeOf(Node.prototype, EventTarget.prototype);


Object.defineProperty(Node.prototype, "appendChild",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function appendChild(aChild){
        debugger;

        if (aChild.parentNode) {
            aChild.parentNode.removeChild(aChild);
        }

        // dogvm.memory.htmlelements[this].push(aChild);

        aChild.parentNode = this;

        return aChild;
    },});dogvm.safefunction(Node.prototype.appendChild);


Object.defineProperty(Node.prototype, "removeChild",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function removeChild(child){
        debugger;
        if(!child instanceof Node){
            throw new Error("parameter 1 is not of type 'Node'");
        }
        let list = dogvm.memory.htmlNode.get(this);
        let childIndex = list.findIndex(element => element === child);

        if (childIndex !== -1) {
            // 从父节点的子节点列表中移除
            dogvm.memory.htmlNode.get(this).splice(childIndex, 1);
            for (let i = dogvm.memory.htmlId.length - 1; i >= 0; i--) {
                if (child.innerHTML.includes(dogvm.memory.htmlId[i].id)) { 
                    dogvm.memory.htmlId.splice(i, 1); 
                }
            }
            return child; // 返回被移除的节点
        } else {
            throw new NotFoundError("The node to be removed is not a child of this node");
        }

    },});dogvm.safefunction(Node.prototype.removeChild);


Object.defineProperty(Node.prototype, "parentNode", {
    "configurable": true,
    "enumerable": true,
    "get": function parentNode_get() {
        debugger;
        // 从 dogvm 的内存中获取该节点的父节点
        for (const [key, value] of dogvm.memory.htmlNode ) {
            if (value.includes(this)) {
                return key;
            }
        }
        return null;
    },
    "set": function parentNode_set(newParent) {
        debugger;

        // 确保新父节点的子节点列表存在
        if (!dogvm.memory.htmlNode.get(newParent)) {
            dogvm.memory.htmlNode.set(newParent, [])
        }
        // 添加到新父节点的子节点列表
        if (!dogvm.memory.htmlNode.get(newParent).includes(this)) {
            dogvm.memory.htmlNode.get(newParent).push(this);
        }
    }
    
});

Object.defineProperty(Node.prototype, "cloneNode",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function cloneNode(deep = false){
        debugger;
        // 克隆当前节点
        const clonedNode = document.createElement(this._tagName);
        // 如果需要深度克隆，克隆子节点
        if (deep) {
            debugger
            // clonedNode.children = this.children.map(child => child.cloneNode(true));
        }
        return dogvm.proxy(clonedNode);    
    },});dogvm.safefunction(Node.prototype.cloneNode);

Object.defineProperty(Node.prototype, "nodeType",{"configurable":true,"enumerable":true,"get": function nodeType_get(){},set:Node, });
Object.defineProperty(Node.prototype, "nodeName",{"configurable":true,"enumerable":true,"get": function nodeName_get(){},set:Node, });


Object.defineProperty(Node.prototype, "insertBefore",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function insertBefore(newNode, referenceNode){
        debugger;
        if (newNode.parentNode) {
            newNode.parentNode.removeChild(newNode);
        }
        newNode.parentNode = this;
        if(referenceNode != undefined){
            //将一个节点插入到指定父节点的子节点中，并位于参考节点之前
            let list = dogvm.memory.htmlNode.get(this);
           let childIndex = list.findIndex(e=>e===referenceNode);
           if(childIndex!==-1){
                const lastElement = list[list.length - 1];
                dogvm.memory.htmlNode.get(this).pop();
                dogvm.memory.htmlNode.get(this).splice(childIndex, 0, lastElement);
           }else{
                debugger;
                // 参考节点不是子节点 考虑报错
           }
        }
        return newNode;
    },});dogvm.safefunction(Node.prototype.insertBefore);



dogvm.safeproperty(Node);

var WindowProperties = function WindowProperties() { // 构造函数

};
dogvm.safefunction(WindowProperties);

Object.defineProperties(WindowProperties.prototype, {
    [Symbol.toStringTag]: {
        value: "WindowProperties",
        configurable: true
    }
})

// 设置原型的父对象
WindowProperties.prototype.__proto__ = EventTarget.prototype;



window = this;
debugger;
var Window = function Window() { // 构造函数
    // 容易被检测到的  js可以查看堆栈
    throw new TypeError("Illegal constructor");
};
dogvm.safefunction(Window);

Object.defineProperties(Window.prototype, {
    [Symbol.toStringTag]: {
        value: "Window",
        configurable: true
    }
})
Window.prototype.__proto__ = WindowProperties.prototype;
window.__proto__ = Window.prototype;

///////////////////////////// 浏览器代码自动生成部分
Object.defineProperty(Window.prototype, "TEMPORARY",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(Window.prototype, "PERSISTENT",{"configurable":false,"enumerable":true,"writable":false,"value":1,});

window.setTimeout = function (x, y) {
    debugger;
    // x可能是方法也可能是文本
    typeof (x) == "function" ? x() : undefined;
    typeof (x) == "string" ? eval(x) : undefined;
    // 正确应该 生成UUID，并且保存到内存
    return crypto.randomUUID();;
};
dogvm.safefunction(window.setTimeout);


window.open = function open() {
    debugger;
};
dogvm.safefunction(window.open);
// 赋值空对象最好使用这种class chrome{} 形式，而不是 {},因为这样我们可以看名字，并且最好挂上代理
window.chrome = dogvm.proxy(class chrome {
});


window.DeviceOrientationEvent = function DeviceOrientationEvent() {
    debugger;
};
dogvm.safefunction(window.DeviceOrientationEvent);

window.DeviceMotionEvent = function DeviceMotionEvent() {
    debugger;
};
dogvm.safefunction(window.DeviceMotionEvent);

window.btoa = function btoa(stringToEncode){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = stringToEncode;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars; 
         str.charAt(i | 0) || (map = '=', i % 1); 
         output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

        charCode = str.charCodeAt(i += 3 / 4);

        if (charCode > 0xFF) {
            throw new Error('"btoa" failed: The string to be encoded contains characters outside of the Latin1 range.');
        }

        block = block << 8 | charCode;
    }

    return output;
};dogvm.safefunction(window.btoa);
window.atob = function atob(encodedData){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = encodedData.replace(/=+$/, ''); // 移除末尾的填充字符
    let output = '';

    if (str.length % 4 === 1) {
        throw new Error('"atob" failed: The string to be decoded is not correctly encoded.');
    }

    for (let bc = 0, bs, buffer, i = 0; buffer = str.charAt(i++); ) {
        buffer = chars.indexOf(buffer);

        if (buffer === -1) continue; // 忽略无效字符

        bs = bc % 4 ? bs * 64 + buffer : buffer;

        if (bc++ % 4) {
            output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
        }
    }

    return output;
};dogvm.safefunction(window.atob);

window.setInterval = function(func,delay){
    debugger;
    return crypto.randomUUID();
};dogvm.safefunction(window.setInterval);

window.innerWidth = 360
window.innerHeight = 360 //edge 867 chrome 945

window.customElements = dogvm.proxy(new CustomElementRegistry());

window.getComputedStyle = function getComputedStyle(element, pseudoElt){
    debugger;
    return CSSStyleDeclaration.createCSSStyleDog(element);
};dogvm.safefunction(window.getComputedStyle);

window.matchMedia = function matchMedia(mediaQueryString){
    debugger;
    return MediaQueryList.createDog(mediaQueryString);
};dogvm.safefunction(window.matchMedia);

window.SyncManager = function SyncManager(){
    debugger;
};dogvm.safefunction(window.SyncManager);

window.TCaptchaReferrer = 'https://pintia.cn/auth/login?redirect=%2F';

window = dogvm.proxy(window);

Global = class global{
    
};

window.top = new Global();

// Screen对象
var Screen = function Screen(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(Screen);
Object.defineProperty(Screen.prototype, Symbol.toStringTag,{"value":"Screen","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(Screen.prototype, "availWidth",{"configurable":true,"enumerable":true,"get": function availWidth_get(){return 1536},set:undefined, });
Object.defineProperty(Screen.prototype, "availHeight",{"configurable":true,"enumerable":true,"get": function availHeight_get(){return 1032},set:undefined, });
Object.defineProperty(Screen.prototype, "width",{"configurable":true,"enumerable":true,"get": function width_get(){return 1536},set:undefined, });
Object.defineProperty(Screen.prototype, "height",{"configurable":true,"enumerable":true,"get": function height_get(){return 864},set:undefined, });
Object.defineProperty(Screen.prototype, "colorDepth",{"configurable":true,"enumerable":true,"get": function colorDepth_get(){return 24},set:undefined, });
Object.defineProperty(Screen.prototype, "pixelDepth",{"configurable":true,"enumerable":true,"get": function pixelDepth_get(){return 24},set:undefined, });
Object.defineProperty(Screen.prototype, "availLeft",{"configurable":true,"enumerable":true,"get": function availLeft_get(){return 0},set:undefined, });
Object.defineProperty(Screen.prototype, "availTop",{"configurable":true,"enumerable":true,"get": function availTop_get(){return 0},set:undefined, });
Object.defineProperty(Screen.prototype, "orientation",{"configurable":true,"enumerable":true,"get": function orientation_get(){return "[object ScreenOrientation]"},set:undefined, });
Object.defineProperty(Screen.prototype, "onchange",{"configurable":true,"enumerable":true,"get": function onchange_get(){return null},"set": function onchange_set(){},});
Object.defineProperty(Screen.prototype, "isExtended",{"configurable":true,"enumerable":true,"get": function isExtended_get(){return false},set:undefined, });
Object.setPrototypeOf(Screen.prototype, EventTarget.prototype);

var screen = {}
Object.setPrototypeOf(screen, Screen.prototype);
screen = dogvm.proxy(screen);


// CharacterData
var CharacterData = function CharacterData(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(CharacterData);
Object.defineProperty(CharacterData.prototype, Symbol.toStringTag,{"value":"CharacterData","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(CharacterData.prototype, "data",{"configurable":true,"enumerable":true,"get": function data_get(){},"set": function data_set(){debugger;},});
Object.defineProperty(CharacterData.prototype, "length",{"configurable":true,"enumerable":true,"get": function length_get(){},set:undefined, });
Object.defineProperty(CharacterData.prototype, "previousElementSibling",{"configurable":true,"enumerable":true,"get": function previousElementSibling_get(){},set:undefined, });
Object.defineProperty(CharacterData.prototype, "nextElementSibling",{"configurable":true,"enumerable":true,"get": function nextElementSibling_get(){},set:undefined, });
Object.defineProperty(CharacterData.prototype, "after",{"configurable":true,"enumerable":true,"writable":true,"value": function after(){debugger;},});dogvm.safefunction(CharacterData.prototype.after);
Object.defineProperty(CharacterData.prototype, "appendData",{"configurable":true,"enumerable":true,"writable":true,"value": function appendData(){debugger;},});dogvm.safefunction(CharacterData.prototype.appendData);
Object.defineProperty(CharacterData.prototype, "before",{"configurable":true,"enumerable":true,"writable":true,"value": function before(){debugger;},});dogvm.safefunction(CharacterData.prototype.before);
Object.defineProperty(CharacterData.prototype, "deleteData",{"configurable":true,"enumerable":true,"writable":true,"value": function deleteData(){debugger;},});dogvm.safefunction(CharacterData.prototype.deleteData);
Object.defineProperty(CharacterData.prototype, "insertData",{"configurable":true,"enumerable":true,"writable":true,"value": function insertData(){debugger;},});dogvm.safefunction(CharacterData.prototype.insertData);
Object.defineProperty(CharacterData.prototype, "remove",{"configurable":true,"enumerable":true,"writable":true,"value": function remove(){debugger;},});dogvm.safefunction(CharacterData.prototype.remove);
Object.defineProperty(CharacterData.prototype, "replaceData",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceData(){debugger;},});dogvm.safefunction(CharacterData.prototype.replaceData);
Object.defineProperty(CharacterData.prototype, "replaceWith",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceWith(){debugger;},});dogvm.safefunction(CharacterData.prototype.replaceWith);
Object.defineProperty(CharacterData.prototype, "substringData",{"configurable":true,"enumerable":true,"writable":true,"value": function substringData(){debugger;},});dogvm.safefunction(CharacterData.prototype.substringData);
Object.setPrototypeOf(CharacterData.prototype, Node.prototype);


// Text
var Text = function Text(){};
Object.defineProperty(Text.prototype, Symbol.toStringTag,{"value":"Text","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(Text.prototype, "wholeText",{"configurable":true,"enumerable":true,"get": function wholeText_get(){},set:undefined, });
Object.defineProperty(Text.prototype, "assignedSlot",{"configurable":true,"enumerable":true,"get": function assignedSlot_get(){},set:undefined, });
Object.defineProperty(Text.prototype, "splitText",{"configurable":true,"enumerable":true,"writable":true,"value": function splitText(){debugger;},});dogvm.safefunction(Text.prototype.splitText);
Object.setPrototypeOf(Text.prototype, CharacterData.prototype);


Text.createTextDog = function createTextDog(text){
    let my_text = Object.create(Text.prototype);
    my_text.wholeText = text;
    my_text.nodeType = 3;  // TEXT_NODE
    my_text.nodeName = "#text";
};dogvm.safefunction(Text.createTextDog);

dogvm.safeproperty(Text);
// MediaQueryList
var MediaQueryList = function MediaQueryList(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(MediaQueryList);

Object.defineProperty(MediaQueryList.prototype, Symbol.toStringTag,{"value":"MediaQueryList","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(MediaQueryList.prototype, "media",{"configurable":true,"enumerable":true,"get": function media_get(){return this._media;},set:undefined, });
Object.defineProperty(MediaQueryList.prototype, "matches",{"configurable":true,"enumerable":true,"get": function matches_get(){return this._matches;},set:undefined, });
Object.defineProperty(MediaQueryList.prototype, "onchange",{"configurable":true,"enumerable":true,"get": function onchange_get(){return this._onchange;},"set": function onchange_set(value){debugger; this._onchange = value},});
Object.defineProperty(MediaQueryList.prototype, "addListener",{"configurable":true,"enumerable":true,"writable":true,"value": function addListener(){debugger;},});dogvm.safefunction(MediaQueryList.prototype.addListener);
Object.defineProperty(MediaQueryList.prototype, "removeListener",{"configurable":true,"enumerable":true,"writable":true,"value": function removeListener(){debugger;},});dogvm.safefunction(MediaQueryList.prototype.removeListener);
Object.setPrototypeOf(MediaQueryList.prototype, EventTarget.prototype);

dogvm.safeproperty(MediaQueryList);


MediaQueryList.createDog = function createDog(mediaQueryString){
    let a = Object.create(MediaQueryList.prototype);
    a._media = mediaQueryString;
    a.onchange = null;
    debugger;
    match = mediaQueryString.match(/\(([^:]+):/);
    let kind = match[1].trim()
    if (!dogvm.memory.media[kind]){
        // 类型第一次出现 给第一个为true
        dogvm.memory.media[kind] = mediaQueryString;
        a._matches = true;
        return dogvm.proxy(a);
    }
    //不是第一次出现 赋值false;
    a._matches = false;
    return dogvm.proxy(a);
}
// Element
var Element = function Element(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(Element);

Object.defineProperties(Element.prototype, {
    [Symbol.toStringTag]: {
        value: "Element",
        configurable: true
    }
});

Object.defineProperties(Element.prototype, {
    [Symbol.unscopables]: {
        value: {
            after: true,
            append: true,
            before: true,
            prepend: true,
            remove: true,
            replaceChildren: true,
            replaceWith: true,
            slot: true
        },
        configurable: true
    }
});

Element.prototype.__proto__ = Node.prototype;

// Element属性
Object.defineProperty(Element.prototype, "namespaceURI",{"configurable":true,"enumerable":true,"get": function namespaceURI_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "prefix",{"configurable":true,"enumerable":true,"get": function prefix_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "localName",{"configurable":true,"enumerable":true,"get": function localName_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "id",{"configurable":true,"enumerable":true,"get": function id_get(){return this._id;},"set": function id_set(){debugger;},});
Object.defineProperty(Element.prototype, "className",{"configurable":true,"enumerable":true,"get": function className_get(){},"set": function className_set(){debugger;},});
Object.defineProperty(Element.prototype, "classList",{"configurable":true,"enumerable":true,"get": function classList_get(){},"set": function classList_set(){debugger;},});
Object.defineProperty(Element.prototype, "slot",{"configurable":true,"enumerable":true,"get": function slot_get(){},"set": function slot_set(){debugger;},});
Object.defineProperty(Element.prototype, "shadowRoot",{"configurable":true,"enumerable":true,"get": function shadowRoot_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "part",{"configurable":true,"enumerable":true,"get": function part_get(){},"set": function part_set(){debugger;},});
Object.defineProperty(Element.prototype, "assignedSlot",{"configurable":true,"enumerable":true,"get": function assignedSlot_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "scrollTop",{"configurable":true,"enumerable":true,"get": function scrollTop_get(){},"set": function scrollTop_set(){debugger;},});
Object.defineProperty(Element.prototype, "scrollLeft",{"configurable":true,"enumerable":true,"get": function scrollLeft_get(){},"set": function scrollLeft_set(){debugger;},});
Object.defineProperty(Element.prototype, "scrollWidth",{"configurable":true,"enumerable":true,"get": function scrollWidth_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "scrollHeight",{"configurable":true,"enumerable":true,"get": function scrollHeight_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "clientTop",{"configurable":true,"enumerable":true,"get": function clientTop_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "clientLeft",{"configurable":true,"enumerable":true,"get": function clientLeft_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "clientWidth",{"configurable":true,"enumerable":true,"get": function clientWidth_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "clientHeight",{"configurable":true,"enumerable":true,"get": function clientHeight_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "onbeforecopy",{"configurable":true,"enumerable":true,"get": function onbeforecopy_get(){},"set": function onbeforecopy_set(){debugger;},});
Object.defineProperty(Element.prototype, "onbeforecut",{"configurable":true,"enumerable":true,"get": function onbeforecut_get(){},"set": function onbeforecut_set(){debugger;},});
Object.defineProperty(Element.prototype, "onbeforepaste",{"configurable":true,"enumerable":true,"get": function onbeforepaste_get(){},"set": function onbeforepaste_set(){debugger;},});
Object.defineProperty(Element.prototype, "onsearch",{"configurable":true,"enumerable":true,"get": function onsearch_get(){},"set": function onsearch_set(){debugger;},});
Object.defineProperty(Element.prototype, "elementTiming",{"configurable":true,"enumerable":true,"get": function elementTiming_get(){},"set": function elementTiming_set(){debugger;},});
Object.defineProperty(Element.prototype, "onfullscreenchange",{"configurable":true,"enumerable":true,"get": function onfullscreenchange_get(){},"set": function onfullscreenchange_set(){debugger;},});
Object.defineProperty(Element.prototype, "onfullscreenerror",{"configurable":true,"enumerable":true,"get": function onfullscreenerror_get(){},"set": function onfullscreenerror_set(){debugger;},});
Object.defineProperty(Element.prototype, "onwebkitfullscreenchange",{"configurable":true,"enumerable":true,"get": function onwebkitfullscreenchange_get(){},"set": function onwebkitfullscreenchange_set(){debugger;},});
Object.defineProperty(Element.prototype, "onwebkitfullscreenerror",{"configurable":true,"enumerable":true,"get": function onwebkitfullscreenerror_get(){},"set": function onwebkitfullscreenerror_set(){debugger;},});
Object.defineProperty(Element.prototype, "role",{"configurable":true,"enumerable":true,"get": function role_get(){},"set": function role_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaAtomic",{"configurable":true,"enumerable":true,"get": function ariaAtomic_get(){},"set": function ariaAtomic_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaAutoComplete",{"configurable":true,"enumerable":true,"get": function ariaAutoComplete_get(){},"set": function ariaAutoComplete_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaBusy",{"configurable":true,"enumerable":true,"get": function ariaBusy_get(){},"set": function ariaBusy_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaBrailleLabel",{"configurable":true,"enumerable":true,"get": function ariaBrailleLabel_get(){},"set": function ariaBrailleLabel_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaBrailleRoleDescription",{"configurable":true,"enumerable":true,"get": function ariaBrailleRoleDescription_get(){},"set": function ariaBrailleRoleDescription_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaChecked",{"configurable":true,"enumerable":true,"get": function ariaChecked_get(){},"set": function ariaChecked_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaColCount",{"configurable":true,"enumerable":true,"get": function ariaColCount_get(){},"set": function ariaColCount_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaColIndex",{"configurable":true,"enumerable":true,"get": function ariaColIndex_get(){},"set": function ariaColIndex_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaColSpan",{"configurable":true,"enumerable":true,"get": function ariaColSpan_get(){},"set": function ariaColSpan_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaCurrent",{"configurable":true,"enumerable":true,"get": function ariaCurrent_get(){},"set": function ariaCurrent_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaDescription",{"configurable":true,"enumerable":true,"get": function ariaDescription_get(){},"set": function ariaDescription_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaDisabled",{"configurable":true,"enumerable":true,"get": function ariaDisabled_get(){},"set": function ariaDisabled_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaExpanded",{"configurable":true,"enumerable":true,"get": function ariaExpanded_get(){},"set": function ariaExpanded_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaHasPopup",{"configurable":true,"enumerable":true,"get": function ariaHasPopup_get(){},"set": function ariaHasPopup_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaHidden",{"configurable":true,"enumerable":true,"get": function ariaHidden_get(){},"set": function ariaHidden_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaInvalid",{"configurable":true,"enumerable":true,"get": function ariaInvalid_get(){},"set": function ariaInvalid_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaKeyShortcuts",{"configurable":true,"enumerable":true,"get": function ariaKeyShortcuts_get(){},"set": function ariaKeyShortcuts_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaLabel",{"configurable":true,"enumerable":true,"get": function ariaLabel_get(){},"set": function ariaLabel_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaLevel",{"configurable":true,"enumerable":true,"get": function ariaLevel_get(){},"set": function ariaLevel_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaLive",{"configurable":true,"enumerable":true,"get": function ariaLive_get(){},"set": function ariaLive_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaModal",{"configurable":true,"enumerable":true,"get": function ariaModal_get(){},"set": function ariaModal_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaMultiLine",{"configurable":true,"enumerable":true,"get": function ariaMultiLine_get(){},"set": function ariaMultiLine_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaMultiSelectable",{"configurable":true,"enumerable":true,"get": function ariaMultiSelectable_get(){},"set": function ariaMultiSelectable_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaOrientation",{"configurable":true,"enumerable":true,"get": function ariaOrientation_get(){},"set": function ariaOrientation_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaPlaceholder",{"configurable":true,"enumerable":true,"get": function ariaPlaceholder_get(){},"set": function ariaPlaceholder_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaPosInSet",{"configurable":true,"enumerable":true,"get": function ariaPosInSet_get(){},"set": function ariaPosInSet_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaPressed",{"configurable":true,"enumerable":true,"get": function ariaPressed_get(){},"set": function ariaPressed_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaReadOnly",{"configurable":true,"enumerable":true,"get": function ariaReadOnly_get(){},"set": function ariaReadOnly_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRelevant",{"configurable":true,"enumerable":true,"get": function ariaRelevant_get(){},"set": function ariaRelevant_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRequired",{"configurable":true,"enumerable":true,"get": function ariaRequired_get(){},"set": function ariaRequired_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRoleDescription",{"configurable":true,"enumerable":true,"get": function ariaRoleDescription_get(){},"set": function ariaRoleDescription_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRowCount",{"configurable":true,"enumerable":true,"get": function ariaRowCount_get(){},"set": function ariaRowCount_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRowIndex",{"configurable":true,"enumerable":true,"get": function ariaRowIndex_get(){},"set": function ariaRowIndex_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRowSpan",{"configurable":true,"enumerable":true,"get": function ariaRowSpan_get(){},"set": function ariaRowSpan_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaSelected",{"configurable":true,"enumerable":true,"get": function ariaSelected_get(){},"set": function ariaSelected_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaSetSize",{"configurable":true,"enumerable":true,"get": function ariaSetSize_get(){},"set": function ariaSetSize_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaSort",{"configurable":true,"enumerable":true,"get": function ariaSort_get(){},"set": function ariaSort_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaValueMax",{"configurable":true,"enumerable":true,"get": function ariaValueMax_get(){},"set": function ariaValueMax_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaValueMin",{"configurable":true,"enumerable":true,"get": function ariaValueMin_get(){},"set": function ariaValueMin_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaValueNow",{"configurable":true,"enumerable":true,"get": function ariaValueNow_get(){},"set": function ariaValueNow_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaValueText",{"configurable":true,"enumerable":true,"get": function ariaValueText_get(){},"set": function ariaValueText_set(){debugger;},});
Object.defineProperty(Element.prototype, "firstElementChild",{"configurable":true,"enumerable":true,"get": function firstElementChild_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "lastElementChild",{"configurable":true,"enumerable":true,"get": function lastElementChild_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "childElementCount",{"configurable":true,"enumerable":true,"get": function childElementCount_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "previousElementSibling",{"configurable":true,"enumerable":true,"get": function previousElementSibling_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "nextElementSibling",{"configurable":true,"enumerable":true,"get": function nextElementSibling_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "after",{"configurable":true,"enumerable":true,"writable":true,"value": function after(){debugger;},});dogvm.safefunction(Element.prototype.after);
Object.defineProperty(Element.prototype, "animate",{"configurable":true,"enumerable":true,"writable":true,"value": function animate(){debugger;},});dogvm.safefunction(Element.prototype.animate);
Object.defineProperty(Element.prototype, "append",{"configurable":true,"enumerable":true,"writable":true,"value": function append(){debugger;},});dogvm.safefunction(Element.prototype.append);
Object.defineProperty(Element.prototype, "attachShadow",{"configurable":true,"enumerable":true,"writable":true,"value": function attachShadow(){debugger;},});dogvm.safefunction(Element.prototype.attachShadow);
Object.defineProperty(Element.prototype, "before",{"configurable":true,"enumerable":true,"writable":true,"value": function before(){debugger;},});dogvm.safefunction(Element.prototype.before);
Object.defineProperty(Element.prototype, "checkVisibility",{"configurable":true,"enumerable":true,"writable":true,"value": function checkVisibility(){debugger;},});dogvm.safefunction(Element.prototype.checkVisibility);
Object.defineProperty(Element.prototype, "closest",{"configurable":true,"enumerable":true,"writable":true,"value": function closest(){debugger;},});dogvm.safefunction(Element.prototype.closest);
Object.defineProperty(Element.prototype, "computedStyleMap",{"configurable":true,"enumerable":true,"writable":true,"value": function computedStyleMap(){debugger;},});dogvm.safefunction(Element.prototype.computedStyleMap);
Object.defineProperty(Element.prototype, "getAnimations",{"configurable":true,"enumerable":true,"writable":true,"value": function getAnimations(){debugger;},});dogvm.safefunction(Element.prototype.getAnimations);
Object.defineProperty(Element.prototype, "getAttributeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function getAttributeNS(){debugger;},});dogvm.safefunction(Element.prototype.getAttributeNS);
Object.defineProperty(Element.prototype, "getAttributeNames",{"configurable":true,"enumerable":true,"writable":true,"value": function getAttributeNames(){debugger;},});dogvm.safefunction(Element.prototype.getAttributeNames);
Object.defineProperty(Element.prototype, "getAttributeNode",{"configurable":true,"enumerable":true,"writable":true,"value": function getAttributeNode(){debugger;},});dogvm.safefunction(Element.prototype.getAttributeNode);
Object.defineProperty(Element.prototype, "getAttributeNodeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function getAttributeNodeNS(){debugger;},});dogvm.safefunction(Element.prototype.getAttributeNodeNS);
Object.defineProperty(Element.prototype, "getBoundingClientRect",{"configurable":true,"enumerable":true,"writable":true,"value": function getBoundingClientRect(){debugger;},});dogvm.safefunction(Element.prototype.getBoundingClientRect);
Object.defineProperty(Element.prototype, "getClientRects",{"configurable":true,"enumerable":true,"writable":true,"value": function getClientRects(){debugger;},});dogvm.safefunction(Element.prototype.getClientRects);
Object.defineProperty(Element.prototype, "getElementsByClassName",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByClassName(){debugger;},});dogvm.safefunction(Element.prototype.getElementsByClassName);
Object.defineProperty(Element.prototype, "getElementsByTagName",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByTagName(){debugger;},});dogvm.safefunction(Element.prototype.getElementsByTagName);
Object.defineProperty(Element.prototype, "getElementsByTagNameNS",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByTagNameNS(){debugger;},});dogvm.safefunction(Element.prototype.getElementsByTagNameNS);
Object.defineProperty(Element.prototype, "getHTML",{"configurable":true,"enumerable":true,"writable":true,"value": function getHTML(){debugger;},});dogvm.safefunction(Element.prototype.getHTML);
Object.defineProperty(Element.prototype, "hasAttribute",{"configurable":true,"enumerable":true,"writable":true,"value": function hasAttribute(){debugger;},});dogvm.safefunction(Element.prototype.hasAttribute);
Object.defineProperty(Element.prototype, "hasAttributeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function hasAttributeNS(){debugger;},});dogvm.safefunction(Element.prototype.hasAttributeNS);
Object.defineProperty(Element.prototype, "hasAttributes",{"configurable":true,"enumerable":true,"writable":true,"value": function hasAttributes(){debugger;},});dogvm.safefunction(Element.prototype.hasAttributes);
Object.defineProperty(Element.prototype, "hasPointerCapture",{"configurable":true,"enumerable":true,"writable":true,"value": function hasPointerCapture(){debugger;},});dogvm.safefunction(Element.prototype.hasPointerCapture);
Object.defineProperty(Element.prototype, "insertAdjacentElement",{"configurable":true,"enumerable":true,"writable":true,"value": function insertAdjacentElement(){debugger;},});dogvm.safefunction(Element.prototype.insertAdjacentElement);
Object.defineProperty(Element.prototype, "insertAdjacentHTML",{"configurable":true,"enumerable":true,"writable":true,"value": function insertAdjacentHTML(){debugger;},});dogvm.safefunction(Element.prototype.insertAdjacentHTML);
Object.defineProperty(Element.prototype, "insertAdjacentText",{"configurable":true,"enumerable":true,"writable":true,"value": function insertAdjacentText(){debugger;},});dogvm.safefunction(Element.prototype.insertAdjacentText);
Object.defineProperty(Element.prototype, "matches",{"configurable":true,"enumerable":true,"writable":true,"value": function matches(){debugger;},});dogvm.safefunction(Element.prototype.matches);
Object.defineProperty(Element.prototype, "prepend",{"configurable":true,"enumerable":true,"writable":true,"value": function prepend(){debugger;},});dogvm.safefunction(Element.prototype.prepend);
Object.defineProperty(Element.prototype, "querySelector",{"configurable":true,"enumerable":true,"writable":true,"value": function querySelector(){debugger;},});dogvm.safefunction(Element.prototype.querySelector);
Object.defineProperty(Element.prototype, "querySelectorAll",{"configurable":true,"enumerable":true,"writable":true,"value": function querySelectorAll(){debugger;},});dogvm.safefunction(Element.prototype.querySelectorAll);
Object.defineProperty(Element.prototype, "releasePointerCapture",{"configurable":true,"enumerable":true,"writable":true,"value": function releasePointerCapture(){debugger;},});dogvm.safefunction(Element.prototype.releasePointerCapture);

Object.defineProperty(Element.prototype, "removeAttribute",{"configurable":true,"enumerable":true,"writable":true,"value": function removeAttribute(){debugger;},});dogvm.safefunction(Element.prototype.removeAttribute);
Object.defineProperty(Element.prototype, "removeAttributeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function removeAttributeNS(){debugger;},});dogvm.safefunction(Element.prototype.removeAttributeNS);
Object.defineProperty(Element.prototype, "removeAttributeNode",{"configurable":true,"enumerable":true,"writable":true,"value": function removeAttributeNode(){debugger;},});dogvm.safefunction(Element.prototype.removeAttributeNode);
Object.defineProperty(Element.prototype, "replaceChildren",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceChildren(){debugger;},});dogvm.safefunction(Element.prototype.replaceChildren);
Object.defineProperty(Element.prototype, "replaceWith",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceWith(){debugger;},});dogvm.safefunction(Element.prototype.replaceWith);
Object.defineProperty(Element.prototype, "requestFullscreen",{"configurable":true,"enumerable":true,"writable":true,"value": function requestFullscreen(){debugger;},});dogvm.safefunction(Element.prototype.requestFullscreen);
Object.defineProperty(Element.prototype, "requestPointerLock",{"configurable":true,"enumerable":true,"writable":true,"value": function requestPointerLock(){debugger;},});dogvm.safefunction(Element.prototype.requestPointerLock);
Object.defineProperty(Element.prototype, "scroll",{"configurable":true,"enumerable":true,"writable":true,"value": function scroll(){debugger;},});dogvm.safefunction(Element.prototype.scroll);
Object.defineProperty(Element.prototype, "scrollBy",{"configurable":true,"enumerable":true,"writable":true,"value": function scrollBy(){debugger;},});dogvm.safefunction(Element.prototype.scrollBy);
Object.defineProperty(Element.prototype, "scrollIntoView",{"configurable":true,"enumerable":true,"writable":true,"value": function scrollIntoView(){debugger;},});dogvm.safefunction(Element.prototype.scrollIntoView);
Object.defineProperty(Element.prototype, "scrollIntoViewIfNeeded",{"configurable":true,"enumerable":true,"writable":true,"value": function scrollIntoViewIfNeeded(){debugger;},});dogvm.safefunction(Element.prototype.scrollIntoViewIfNeeded);
Object.defineProperty(Element.prototype, "scrollTo",{"configurable":true,"enumerable":true,"writable":true,"value": function scrollTo(){debugger;},});dogvm.safefunction(Element.prototype.scrollTo);
Object.defineProperty(Element.prototype, "setAttributeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function setAttributeNS(){debugger;},});dogvm.safefunction(Element.prototype.setAttributeNS);
Object.defineProperty(Element.prototype, "setAttributeNode",{"configurable":true,"enumerable":true,"writable":true,"value": function setAttributeNode(){debugger;},});dogvm.safefunction(Element.prototype.setAttributeNode);
Object.defineProperty(Element.prototype, "setAttributeNodeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function setAttributeNodeNS(){debugger;},});dogvm.safefunction(Element.prototype.setAttributeNodeNS);
Object.defineProperty(Element.prototype, "setHTMLUnsafe",{"configurable":true,"enumerable":true,"writable":true,"value": function setHTMLUnsafe(){debugger;},});dogvm.safefunction(Element.prototype.setHTMLUnsafe);
Object.defineProperty(Element.prototype, "setPointerCapture",{"configurable":true,"enumerable":true,"writable":true,"value": function setPointerCapture(){debugger;},});dogvm.safefunction(Element.prototype.setPointerCapture);
Object.defineProperty(Element.prototype, "toggleAttribute",{"configurable":true,"enumerable":true,"writable":true,"value": function toggleAttribute(){debugger;},});dogvm.safefunction(Element.prototype.toggleAttribute);
Object.defineProperty(Element.prototype, "webkitMatchesSelector",{"configurable":true,"enumerable":true,"writable":true,"value": function webkitMatchesSelector(){debugger;},});dogvm.safefunction(Element.prototype.webkitMatchesSelector);
Object.defineProperty(Element.prototype, "webkitRequestFullScreen",{"configurable":true,"enumerable":true,"writable":true,"value": function webkitRequestFullScreen(){debugger;},});dogvm.safefunction(Element.prototype.webkitRequestFullScreen);
Object.defineProperty(Element.prototype, "webkitRequestFullscreen",{"configurable":true,"enumerable":true,"writable":true,"value": function webkitRequestFullscreen(){debugger;},});dogvm.safefunction(Element.prototype.webkitRequestFullscreen);
Object.defineProperty(Element.prototype, "currentCSSZoom",{"configurable":true,"enumerable":true,"get": function currentCSSZoom_get(){},set:undefined, });
Object.defineProperty(Element.prototype, "ariaColIndexText",{"configurable":true,"enumerable":true,"get": function ariaColIndexText_get(){},"set": function ariaColIndexText_set(){debugger;},});
Object.defineProperty(Element.prototype, "ariaRowIndexText",{"configurable":true,"enumerable":true,"get": function ariaRowIndexText_get(){},"set": function ariaRowIndexText_set(){debugger;},});
Object.setPrototypeOf(Element.prototype, Node.prototype);


Object.defineProperty(Element.prototype, "children",{"configurable":true,"enumerable":true,"get": function children_get(){},set:undefined, });


Object.defineProperty(Element.prototype, "tagName", {"configurable": true,"enumerable": true,
    get: function tagName_get() {
        debugger;
        if (!this._tagName) {
            return '';
        }
        return this._tagName.toUpperCase();
    },
    set: undefined
});

Object.defineProperty(Element.prototype, "remove",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function remove(){
        debugger;
        // 如果元素有父节点，从父节点中移除自己
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    },});dogvm.safefunction(Element.prototype.remove);

Object.defineProperty(Element.prototype, "setAttribute", {
    value: function setAttribute(name, value) {
        debugger;
        if (!this._attributes) {
            this._attributes = new Map();
        }
        if(name == 'id'){
            dogvm.memory.htmlId.push({
                tag: this.tagName,
                id: value,
                content: '' ,// 存储内容
                parentList: [this.tagName]
            }
            );
        }
        this._attributes.set(String(name), String(value));
    },
    writable: true,
    enumerable: true,
    configurable: true
});dogvm.safefunction(Element.prototype.setAttribute);    

Object.defineProperty(Element.prototype, "getAttribute", {
    value: function getAttribute(name) {
        debugger;
        if (!this._attributes) {
            return null;
        }
        return this._attributes.get(String(name)) || null;
    },
    writable: true,
    enumerable: true,
    configurable: true
});dogvm.safefunction(Element.prototype.getAttribute);


Object.defineProperty(Element.prototype, "attributes", {
    get: function() {
        debugger;
        if (!this._attributes) {
            this._attributes = new Map();
        }
        
        let attrs = [];
        this._attributes.forEach((value, name) => {
            attrs.push({
                name: name,
                value: value,
                nodeType: 2, // ATTRIBUTE_NODE
                toString: function() {
                    return this.name + '="' + this.value + '"';
                }
            });
        });

        attrs.getNamedItem = function(name) {
            return this.find(attr => attr.name === name);
        };
        attrs.item = function(index) {
            return this[index];
        };
        
        return attrs;
    },
    enumerable: true,
    configurable: true
});



Object.defineProperty(Element.prototype, "innerHTML", {"configurable": true,"enumerable": true,
    get: function innerHTML_get() {
        debugger;
        return this._innerHtml || '';
    },
    set: function innerHTML_set(value) {
        debugger;
        function getParentTagsByIds(html, targetId) {
            let tagStack = []; // 用于记录标签的堆栈
            let result = {}; // 存储每个目标 ID 的父标签路径
            let currentIndex = 0; // 当前解析位置
            html = html.replace(/\n/g, '').replace(/\s+/g, ' ');
            while (currentIndex < html.length) {
                let currentChar = html[currentIndex];
                // 查找开始标签
                if (currentChar === '<' && html[currentIndex + 1] !== '/') {
                    let tagEnd = html.indexOf('>', currentIndex); // 找到结束标签的 '>'
                    if (tagEnd === -1) break; // 防止索引超出范围
                    let tag = html.substring(currentIndex + 1, tagEnd).trim();
                    let tagName = tag.split(' ')[0]; // 提取标签名
                    // 将当前标签推入堆栈
                    tagStack.push(tagName);
                    // 检查是否包含目标 ID
                    if (tag.includes(`id="${targetId}"`)) {
                        // 记录父标签路径
                        result[targetId] = [...tagStack];
                    }
                    currentIndex = tagEnd + 1; // 更新解析位置
                }
                // 查找结束标签
                else if (currentChar === '<' && html[currentIndex + 1] === '/') {
                    let tagEnd = html.indexOf('>', currentIndex); // 找到结束标签的 '>'
                    if (tagEnd === -1) break; // 防止索引超出范围
        
                    let closingTag = html.substring(currentIndex + 2, tagEnd).trim();
                    if (tagStack[tagStack.length - 1] === closingTag) {
                        tagStack.pop(); // 弹出栈顶标签
                    }
        
                    currentIndex = tagEnd + 1; // 更新解析位置
                } else {
                    currentIndex++; // 如果不是标签字符，则继续前进
                }
            }
        
            // 返回每个目标 ID 的父标签路径
            return result;
        }
        function getTagsWithIds(htmlString,e) {
            if (!dogvm.memory.htmlId) {
                dogvm.memory.htmlId = [];
            }
            let matches = htmlString.match(/<([a-zA-Z0-9]+)[^>]*?id=["']([^"']+)["'][^>]*>(.*?)<\/\1>/g) || [];
            matches.forEach(match => {
                let tagName = match.match(/<([a-zA-Z0-9]+)/)[1]; // 获取标签名
                let id = match.match(/id=["']([^"']+)["']/)[1]; // 获取 id
                let content = match.match(/>(.*?)<\/[a-zA-Z0-9]+>/)[1]; // 获取标签内的内容
                let existingIndex = dogvm.memory.htmlId.findIndex(item => item.id === id);
                if (existingIndex === -1) {
                    dogvm.memory.htmlId.push({
                        tag: tagName,
                        id: id,
                        content: content ,// 存储内容
                        parentList: getParentTagsByIds(htmlString,id)[id]
                    });
                } else {
                    dogvm.memory.htmlId[existingIndex].tag = tagName;
                    dogvm.memory.htmlId[existingIndex].content = content;
                    dogvm.memory.htmlId[existingIndex].parentList = getParentTagsByIds(htmlString,id)[id]; // 更新内容
                }
            });
        }
        function getCssChose(cssString,e){
            function isValidCSSSelector(selector) {
                // 基本的 CSS 选择器正则表达式
                const cssSelectorRegex = /^[\w-]+(\s*>\s*[\w-]+|\s+[\w-]+|\s*:\s*not\([^)]+\))*(\s*:\s*[\w-]+)?(\s*\.[\w-]+)*(\s*#\w+)*$/;
                return cssSelectorRegex.test(selector.trim());
            }
            // 正则表达式提取选择器和颜色
            const regex = /(\w+\s*:\s*not\([^)]+\))\s*{\s*color:\s*([^;]+);/g;
            let match;
            while ((match = regex.exec(cssString)) !== null) {
                const selector = match[1].trim(); // 提取选择器
                const color = match[2].trim(); // 提取颜色
                if (isValidCSSSelector(selector)) {
                    dogvm.memory.cssChose.push({ selector, color })
                }
            }
        }

        getCssChose(value,this);
        getTagsWithIds(value,this);
        this._innerHtml = value;
        return value;
    }
});

Object.defineProperty(Element.prototype, "outerHTML",{"configurable":true,"enumerable":true,
    "get": function outerHTML_get(){
        debugger;
        //outerHTML属性获取描述元素（包括其后代）的序列化 HTML 片段。它也可以设置为用从给定字符串解析的节点替换元素
        // 如果没有父节点 或者 子节点  就只返回自己标签
        let innerHTML = '';
        function getHTML(e,inner){
            return "<" + e._tagName + ">" + inner + "<" + "/" + e._tagName + ">";
        }
        let children = dogvm.memory.htmlNode.get(this) || [];
        if(children.length > 0){
            //有子节点  将子节点标签放里面
            children.forEach(e=>{
                let str = getHTML(e,e.innerHTML);
                innerHTML = innerHTML + str;
            });
        }
        return getHTML(this,innerHTML);
    },"set": function outerHTML_set(){debugger;},});


dogvm.safeproperty(Element);
// HTMLElement
var HTMLElement = function HTMLElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLElement);

Object.defineProperties(HTMLElement.prototype, {
    [Symbol.toStringTag]: {
        value: "HTMLElement",
        configurable: true
    }
});

HTMLElement.prototype.__proto__ = Element.prototype;

// HTMLElement属性
Object.defineProperty(HTMLElement.prototype, "title",{"configurable":true,"enumerable":true,"get": function title_get(){},"set": function title_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "lang",{"configurable":true,"enumerable":true,"get": function lang_get(){},"set": function lang_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "translate",{"configurable":true,"enumerable":true,"get": function translate_get(){},"set": function translate_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "dir",{"configurable":true,"enumerable":true,"get": function dir_get(){},"set": function dir_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "hidden",{"configurable":true,"enumerable":true,"get": function hidden_get(){},"set": function hidden_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "inert",{"configurable":true,"enumerable":true,"get": function inert_get(){},"set": function inert_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "accessKey",{"configurable":true,"enumerable":true,"get": function accessKey_get(){},"set": function accessKey_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "draggable",{"configurable":true,"enumerable":true,"get": function draggable_get(){},"set": function draggable_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "spellcheck",{"configurable":true,"enumerable":true,"get": function spellcheck_get(){},"set": function spellcheck_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "autocapitalize",{"configurable":true,"enumerable":true,"get": function autocapitalize_get(){},"set": function autocapitalize_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "editContext",{"configurable":true,"enumerable":true,"get": function editContext_get(){},"set": function editContext_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "contentEditable",{"configurable":true,"enumerable":true,"get": function contentEditable_get(){},"set": function contentEditable_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "enterKeyHint",{"configurable":true,"enumerable":true,"get": function enterKeyHint_get(){},"set": function enterKeyHint_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "isContentEditable",{"configurable":true,"enumerable":true,"get": function isContentEditable_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "inputMode",{"configurable":true,"enumerable":true,"get": function inputMode_get(){},"set": function inputMode_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "virtualKeyboardPolicy",{"configurable":true,"enumerable":true,"get": function virtualKeyboardPolicy_get(){},"set": function virtualKeyboardPolicy_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "offsetParent",{"configurable":true,"enumerable":true,"get": function offsetParent_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "offsetTop",{"configurable":true,"enumerable":true,"get": function offsetTop_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "offsetLeft",{"configurable":true,"enumerable":true,"get": function offsetLeft_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "offsetWidth",{"configurable":true,"enumerable":true,"get": function offsetWidth_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "offsetHeight",{"configurable":true,"enumerable":true,"get": function offsetHeight_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "popover",{"configurable":true,"enumerable":true,"get": function popover_get(){},"set": function popover_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "innerText",{"configurable":true,"enumerable":true,"get": function innerText_get(){},"set": function innerText_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "outerText",{"configurable":true,"enumerable":true,"get": function outerText_get(){},"set": function outerText_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "writingSuggestions",{"configurable":true,"enumerable":true,"get": function writingSuggestions_get(){},"set": function writingSuggestions_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onbeforexrselect",{"configurable":true,"enumerable":true,"get": function onbeforexrselect_get(){},"set": function onbeforexrselect_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onabort",{"configurable":true,"enumerable":true,"get": function onabort_get(){},"set": function onabort_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onbeforeinput",{"configurable":true,"enumerable":true,"get": function onbeforeinput_get(){},"set": function onbeforeinput_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onbeforematch",{"configurable":true,"enumerable":true,"get": function onbeforematch_get(){},"set": function onbeforematch_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onbeforetoggle",{"configurable":true,"enumerable":true,"get": function onbeforetoggle_get(){},"set": function onbeforetoggle_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onblur",{"configurable":true,"enumerable":true,"get": function onblur_get(){},"set": function onblur_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncancel",{"configurable":true,"enumerable":true,"get": function oncancel_get(){},"set": function oncancel_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncanplay",{"configurable":true,"enumerable":true,"get": function oncanplay_get(){},"set": function oncanplay_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncanplaythrough",{"configurable":true,"enumerable":true,"get": function oncanplaythrough_get(){},"set": function oncanplaythrough_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onchange",{"configurable":true,"enumerable":true,"get": function onchange_get(){},"set": function onchange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onclick",{"configurable":true,"enumerable":true,"get": function onclick_get(){},"set": function onclick_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onclose",{"configurable":true,"enumerable":true,"get": function onclose_get(){},"set": function onclose_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncontentvisibilityautostatechange",{"configurable":true,"enumerable":true,"get": function oncontentvisibilityautostatechange_get(){},"set": function oncontentvisibilityautostatechange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncontextlost",{"configurable":true,"enumerable":true,"get": function oncontextlost_get(){},"set": function oncontextlost_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncontextmenu",{"configurable":true,"enumerable":true,"get": function oncontextmenu_get(){},"set": function oncontextmenu_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncontextrestored",{"configurable":true,"enumerable":true,"get": function oncontextrestored_get(){},"set": function oncontextrestored_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncuechange",{"configurable":true,"enumerable":true,"get": function oncuechange_get(){},"set": function oncuechange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondblclick",{"configurable":true,"enumerable":true,"get": function ondblclick_get(){},"set": function ondblclick_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondrag",{"configurable":true,"enumerable":true,"get": function ondrag_get(){},"set": function ondrag_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondragend",{"configurable":true,"enumerable":true,"get": function ondragend_get(){},"set": function ondragend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondragenter",{"configurable":true,"enumerable":true,"get": function ondragenter_get(){},"set": function ondragenter_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondragleave",{"configurable":true,"enumerable":true,"get": function ondragleave_get(){},"set": function ondragleave_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondragover",{"configurable":true,"enumerable":true,"get": function ondragover_get(){},"set": function ondragover_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondragstart",{"configurable":true,"enumerable":true,"get": function ondragstart_get(){},"set": function ondragstart_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondrop",{"configurable":true,"enumerable":true,"get": function ondrop_get(){},"set": function ondrop_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ondurationchange",{"configurable":true,"enumerable":true,"get": function ondurationchange_get(){},"set": function ondurationchange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onemptied",{"configurable":true,"enumerable":true,"get": function onemptied_get(){},"set": function onemptied_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onended",{"configurable":true,"enumerable":true,"get": function onended_get(){},"set": function onended_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onerror",{"configurable":true,"enumerable":true,"get": function onerror_get(){},"set": function onerror_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onfocus",{"configurable":true,"enumerable":true,"get": function onfocus_get(){},"set": function onfocus_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onformdata",{"configurable":true,"enumerable":true,"get": function onformdata_get(){},"set": function onformdata_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oninput",{"configurable":true,"enumerable":true,"get": function oninput_get(){},"set": function oninput_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oninvalid",{"configurable":true,"enumerable":true,"get": function oninvalid_get(){},"set": function oninvalid_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onkeydown",{"configurable":true,"enumerable":true,"get": function onkeydown_get(){},"set": function onkeydown_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onkeypress",{"configurable":true,"enumerable":true,"get": function onkeypress_get(){},"set": function onkeypress_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onkeyup",{"configurable":true,"enumerable":true,"get": function onkeyup_get(){},"set": function onkeyup_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onload",{"configurable":true,"enumerable":true,"get": function onload_get(){},"set": function onload_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onloadeddata",{"configurable":true,"enumerable":true,"get": function onloadeddata_get(){},"set": function onloadeddata_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onloadedmetadata",{"configurable":true,"enumerable":true,"get": function onloadedmetadata_get(){},"set": function onloadedmetadata_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onloadstart",{"configurable":true,"enumerable":true,"get": function onloadstart_get(){},"set": function onloadstart_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmousedown",{"configurable":true,"enumerable":true,"get": function onmousedown_get(){},"set": function onmousedown_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmouseenter",{"configurable":true,"enumerable":true,"get": function onmouseenter_get(){},"set": function onmouseenter_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmouseleave",{"configurable":true,"enumerable":true,"get": function onmouseleave_get(){},"set": function onmouseleave_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmousemove",{"configurable":true,"enumerable":true,"get": function onmousemove_get(){},"set": function onmousemove_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmouseout",{"configurable":true,"enumerable":true,"get": function onmouseout_get(){},"set": function onmouseout_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmouseover",{"configurable":true,"enumerable":true,"get": function onmouseover_get(){},"set": function onmouseover_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmouseup",{"configurable":true,"enumerable":true,"get": function onmouseup_get(){},"set": function onmouseup_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onmousewheel",{"configurable":true,"enumerable":true,"get": function onmousewheel_get(){},"set": function onmousewheel_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpause",{"configurable":true,"enumerable":true,"get": function onpause_get(){},"set": function onpause_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onplay",{"configurable":true,"enumerable":true,"get": function onplay_get(){},"set": function onplay_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onplaying",{"configurable":true,"enumerable":true,"get": function onplaying_get(){},"set": function onplaying_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onprogress",{"configurable":true,"enumerable":true,"get": function onprogress_get(){},"set": function onprogress_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onratechange",{"configurable":true,"enumerable":true,"get": function onratechange_get(){},"set": function onratechange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onreset",{"configurable":true,"enumerable":true,"get": function onreset_get(){},"set": function onreset_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onresize",{"configurable":true,"enumerable":true,"get": function onresize_get(){},"set": function onresize_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onscroll",{"configurable":true,"enumerable":true,"get": function onscroll_get(){},"set": function onscroll_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onsecuritypolicyviolation",{"configurable":true,"enumerable":true,"get": function onsecuritypolicyviolation_get(){},"set": function onsecuritypolicyviolation_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onseeked",{"configurable":true,"enumerable":true,"get": function onseeked_get(){},"set": function onseeked_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onseeking",{"configurable":true,"enumerable":true,"get": function onseeking_get(){},"set": function onseeking_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onselect",{"configurable":true,"enumerable":true,"get": function onselect_get(){},"set": function onselect_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onslotchange",{"configurable":true,"enumerable":true,"get": function onslotchange_get(){},"set": function onslotchange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onstalled",{"configurable":true,"enumerable":true,"get": function onstalled_get(){},"set": function onstalled_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onsubmit",{"configurable":true,"enumerable":true,"get": function onsubmit_get(){},"set": function onsubmit_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onsuspend",{"configurable":true,"enumerable":true,"get": function onsuspend_get(){},"set": function onsuspend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ontimeupdate",{"configurable":true,"enumerable":true,"get": function ontimeupdate_get(){},"set": function ontimeupdate_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ontoggle",{"configurable":true,"enumerable":true,"get": function ontoggle_get(){},"set": function ontoggle_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onvolumechange",{"configurable":true,"enumerable":true,"get": function onvolumechange_get(){},"set": function onvolumechange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onwaiting",{"configurable":true,"enumerable":true,"get": function onwaiting_get(){},"set": function onwaiting_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onwebkitanimationend",{"configurable":true,"enumerable":true,"get": function onwebkitanimationend_get(){},"set": function onwebkitanimationend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onwebkitanimationiteration",{"configurable":true,"enumerable":true,"get": function onwebkitanimationiteration_get(){},"set": function onwebkitanimationiteration_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onwebkitanimationstart",{"configurable":true,"enumerable":true,"get": function onwebkitanimationstart_get(){},"set": function onwebkitanimationstart_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onwebkittransitionend",{"configurable":true,"enumerable":true,"get": function onwebkittransitionend_get(){},"set": function onwebkittransitionend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onwheel",{"configurable":true,"enumerable":true,"get": function onwheel_get(){},"set": function onwheel_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onauxclick",{"configurable":true,"enumerable":true,"get": function onauxclick_get(){},"set": function onauxclick_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ongotpointercapture",{"configurable":true,"enumerable":true,"get": function ongotpointercapture_get(){},"set": function ongotpointercapture_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onlostpointercapture",{"configurable":true,"enumerable":true,"get": function onlostpointercapture_get(){},"set": function onlostpointercapture_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerdown",{"configurable":true,"enumerable":true,"get": function onpointerdown_get(){},"set": function onpointerdown_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointermove",{"configurable":true,"enumerable":true,"get": function onpointermove_get(){},"set": function onpointermove_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerrawupdate",{"configurable":true,"enumerable":true,"get": function onpointerrawupdate_get(){},"set": function onpointerrawupdate_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerup",{"configurable":true,"enumerable":true,"get": function onpointerup_get(){},"set": function onpointerup_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointercancel",{"configurable":true,"enumerable":true,"get": function onpointercancel_get(){},"set": function onpointercancel_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerover",{"configurable":true,"enumerable":true,"get": function onpointerover_get(){},"set": function onpointerover_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerout",{"configurable":true,"enumerable":true,"get": function onpointerout_get(){},"set": function onpointerout_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerenter",{"configurable":true,"enumerable":true,"get": function onpointerenter_get(){},"set": function onpointerenter_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpointerleave",{"configurable":true,"enumerable":true,"get": function onpointerleave_get(){},"set": function onpointerleave_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onselectstart",{"configurable":true,"enumerable":true,"get": function onselectstart_get(){},"set": function onselectstart_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onselectionchange",{"configurable":true,"enumerable":true,"get": function onselectionchange_get(){},"set": function onselectionchange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onanimationend",{"configurable":true,"enumerable":true,"get": function onanimationend_get(){},"set": function onanimationend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onanimationiteration",{"configurable":true,"enumerable":true,"get": function onanimationiteration_get(){},"set": function onanimationiteration_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onanimationstart",{"configurable":true,"enumerable":true,"get": function onanimationstart_get(){},"set": function onanimationstart_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ontransitionrun",{"configurable":true,"enumerable":true,"get": function ontransitionrun_get(){},"set": function ontransitionrun_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ontransitionstart",{"configurable":true,"enumerable":true,"get": function ontransitionstart_get(){},"set": function ontransitionstart_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ontransitionend",{"configurable":true,"enumerable":true,"get": function ontransitionend_get(){},"set": function ontransitionend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "ontransitioncancel",{"configurable":true,"enumerable":true,"get": function ontransitioncancel_get(){},"set": function ontransitioncancel_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncopy",{"configurable":true,"enumerable":true,"get": function oncopy_get(){},"set": function oncopy_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "oncut",{"configurable":true,"enumerable":true,"get": function oncut_get(){},"set": function oncut_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onpaste",{"configurable":true,"enumerable":true,"get": function onpaste_get(){},"set": function onpaste_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "dataset",{"configurable":true,"enumerable":true,"get": function dataset_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "nonce",{"configurable":true,"enumerable":true,"get": function nonce_get(){},"set": function nonce_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "autofocus",{"configurable":true,"enumerable":true,"get": function autofocus_get(){},"set": function autofocus_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "tabIndex",{"configurable":true,"enumerable":true,"get": function tabIndex_get(){},"set": function tabIndex_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "attributeStyleMap",{"configurable":true,"enumerable":true,"get": function attributeStyleMap_get(){},set:undefined, });
Object.defineProperty(HTMLElement.prototype, "attachInternals",{"configurable":true,"enumerable":true,"writable":true,"value": function attachInternals(){debugger;},});dogvm.safefunction(HTMLElement.prototype.attachInternals);
Object.defineProperty(HTMLElement.prototype, "blur",{"configurable":true,"enumerable":true,"writable":true,"value": function blur(){debugger;},});dogvm.safefunction(HTMLElement.prototype.blur);
Object.defineProperty(HTMLElement.prototype, "click",{"configurable":true,"enumerable":true,"writable":true,"value": function click(){debugger;},});dogvm.safefunction(HTMLElement.prototype.click);
Object.defineProperty(HTMLElement.prototype, "focus",{"configurable":true,"enumerable":true,"writable":true,"value": function focus(){debugger;},});dogvm.safefunction(HTMLElement.prototype.focus);
Object.defineProperty(HTMLElement.prototype, "hidePopover",{"configurable":true,"enumerable":true,"writable":true,"value": function hidePopover(){debugger;},});dogvm.safefunction(HTMLElement.prototype.hidePopover);
Object.defineProperty(HTMLElement.prototype, "showPopover",{"configurable":true,"enumerable":true,"writable":true,"value": function showPopover(){debugger;},});dogvm.safefunction(HTMLElement.prototype.showPopover);
Object.defineProperty(HTMLElement.prototype, "togglePopover",{"configurable":true,"enumerable":true,"writable":true,"value": function togglePopover(){debugger;},});dogvm.safefunction(HTMLElement.prototype.togglePopover);
Object.defineProperty(HTMLElement.prototype, "onscrollend",{"configurable":true,"enumerable":true,"get": function onscrollend_get(){},"set": function onscrollend_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onscrollsnapchange",{"configurable":true,"enumerable":true,"get": function onscrollsnapchange_get(){},"set": function onscrollsnapchange_set(){debugger;},});
Object.defineProperty(HTMLElement.prototype, "onscrollsnapchanging",{"configurable":true,"enumerable":true,"get": function onscrollsnapchanging_get(){},"set": function onscrollsnapchanging_set(){debugger;},});
Object.setPrototypeOf(HTMLElement.prototype, Element.prototype);


/////////////////////// 默认返回一个CSSStyleDeclaration对象  如果元素内容特殊 再在单独里面去重写
Object.defineProperty(HTMLElement.prototype, "style",{"configurable":true,"enumerable":true,
    "get": function style_get(){
        debugger;
        return CSSStyleDeclaration.createCSSStyleDog();
    },"set": function style_set(){debugger;},});


dogvm.safeproperty(HTMLElement);
var HTMLDivElement = function HTMLDivElement() { // 构造函数
    throw new TypeError("Illegal constructor");
};
dogvm.safefunction(HTMLDivElement);

Object.defineProperties(HTMLDivElement.prototype, {
    [Symbol.toStringTag]: {
        value: "HTMLDivElement",
        configurable: true
    }
});
////////// 浏览器代码自动生成部分
Object.defineProperty(HTMLDivElement.prototype, "align",{"configurable":true,"enumerable":true,"get": function align_get(){debugger; return ""},"set": function align_set(){debugger;},});
Object.setPrototypeOf(HTMLDivElement.prototype, HTMLElement.prototype);
////////

dogvm.safeproperty(HTMLDivElement);

// 用户创建div
dogvm.memory.htmlelements["div"] = function () {
    var div = new (function () {});
    div.__proto__ = HTMLDivElement.prototype;
    return div;
}


// HTMLHeadElement
var HTMLHeadElement = function HTMLHeadElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLHeadElement);

Object.defineProperty(HTMLHeadElement.prototype, Symbol.toStringTag,{"value":"HTMLHeadElement","writable":false,"enumerable":false,"configurable":true})
Object.setPrototypeOf(HTMLHeadElement.prototype, HTMLElement.prototype);


HTMLHeadElement.createHtmlHeadDog = function createHtmlHeadDog() {
    let instance = Object.create(HTMLHeadElement.prototype);
    return dogvm.proxy(instance);
};dogvm.safefunction(HTMLHeadElement.createHtmlHeadDog);


HTMLHeadElement.headDog = HTMLHeadElement.createHtmlHeadDog();



//////////////////////////////////

// HTMLBodyElement对象
var HTMLBodyElement = function HTMLBodyElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLBodyElement);

/////////////////////////////////
Object.defineProperty(HTMLBodyElement.prototype, Symbol.toStringTag,{"value":"HTMLBodyElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLBodyElement.prototype, "text",{"configurable":true,"enumerable":true,"get": function text_get(){; return ""},"set": function text_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "link",{"configurable":true,"enumerable":true,"get": function link_get(){; return ""},"set": function link_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "vLink",{"configurable":true,"enumerable":true,"get": function vLink_get(){; return ""},"set": function vLink_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "aLink",{"configurable":true,"enumerable":true,"get": function aLink_get(){; return ""},"set": function aLink_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "bgColor",{"configurable":true,"enumerable":true,"get": function bgColor_get(){; return ""},"set": function bgColor_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "background",{"configurable":true,"enumerable":true,"get": function background_get(){; return ""},"set": function background_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onblur",{"configurable":true,"enumerable":true,"get": function onblur_get(){; return "null"},"set": function onblur_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onerror",{"configurable":true,"enumerable":true,"get": function onerror_get(){; return "null"},"set": function onerror_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onfocus",{"configurable":true,"enumerable":true,"get": function onfocus_get(){; return "null"},"set": function onfocus_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onload",{"configurable":true,"enumerable":true,"get": function onload_get(){; return "null"},"set": function onload_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onresize",{"configurable":true,"enumerable":true,"get": function onresize_get(){; return 'function(){s["default"].tVerify()&&r["default"].setPopPosition(s["default"].tVerify(),i.loadingSize.width,i.loadingSize.height||0)}'},"set": function onresize_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onscroll",{"configurable":true,"enumerable":true,"get": function onscroll_get(){; return "null"},"set": function onscroll_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onafterprint",{"configurable":true,"enumerable":true,"get": function onafterprint_get(){; return "null"},"set": function onafterprint_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onbeforeprint",{"configurable":true,"enumerable":true,"get": function onbeforeprint_get(){; return "null"},"set": function onbeforeprint_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onbeforeunload",{"configurable":true,"enumerable":true,"get": function onbeforeunload_get(){; return "null"},"set": function onbeforeunload_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onhashchange",{"configurable":true,"enumerable":true,"get": function onhashchange_get(){; return "null"},"set": function onhashchange_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onlanguagechange",{"configurable":true,"enumerable":true,"get": function onlanguagechange_get(){; return "null"},"set": function onlanguagechange_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onmessage",{"configurable":true,"enumerable":true,"get": function onmessage_get(){; return "null"},"set": function onmessage_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onmessageerror",{"configurable":true,"enumerable":true,"get": function onmessageerror_get(){; return "null"},"set": function onmessageerror_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onoffline",{"configurable":true,"enumerable":true,"get": function onoffline_get(){; return "null"},"set": function onoffline_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "ononline",{"configurable":true,"enumerable":true,"get": function ononline_get(){; return "null"},"set": function ononline_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onpagehide",{"configurable":true,"enumerable":true,"get": function onpagehide_get(){; return "null"},"set": function onpagehide_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onpageshow",{"configurable":true,"enumerable":true,"get": function onpageshow_get(){; return "null"},"set": function onpageshow_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onpopstate",{"configurable":true,"enumerable":true,"get": function onpopstate_get(){; return "function(){for(var c=arguments.length,l=new Array(c),p=0;p<c;p++)l[p]=arguments[p];var b=e.location.href;if(g(t,b),d)return d.apply(this,l)}"},"set": function onpopstate_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onrejectionhandled",{"configurable":true,"enumerable":true,"get": function onrejectionhandled_get(){; return "null"},"set": function onrejectionhandled_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onstorage",{"configurable":true,"enumerable":true,"get": function onstorage_get(){; return "null"},"set": function onstorage_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onunhandledrejection",{"configurable":true,"enumerable":true,"get": function onunhandledrejection_get(){; return "null"},"set": function onunhandledrejection_set(){;},});
Object.defineProperty(HTMLBodyElement.prototype, "onunload",{"configurable":true,"enumerable":true,"get": function onunload_get(){; return "null"},"set": function onunload_set(){;},});
Object.setPrototypeOf(HTMLBodyElement.prototype, HTMLElement.prototype);
/////////////////////////////

dogvm.safeproperty(HTMLBodyElement);

HTMLBodyElement.createHtmlBodyDog = function createHtmlBodyDog() {
    let instance = Object.create(HTMLBodyElement.prototype);
    // 浏览器实例属性
    Object.defineProperty(instance, "_reactListeningxqzyu425lap",{"configurable":true,"enumerable":true,"writable":true,"value":true,});
    return dogvm.proxy(instance);
  };dogvm.safefunction(HTMLBodyElement.createHtmlBodyDog);
  
HTMLBodyElement.bodyDog = HTMLBodyElement.createHtmlBodyDog();
// HTMLHtmlElement对象
var HTMLHtmlElement = function HTMLHtmlElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLHtmlElement);
Object.defineProperty(HTMLHtmlElement.prototype, Symbol.toStringTag,{"value":"HTMLHtmlElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLHtmlElement.prototype, "version",{"configurable":true,"enumerable":true,"get": function version_get(){debugger; return ""},"set": function version_set(){debugger;},});
Object.setPrototypeOf(HTMLHtmlElement.prototype, HTMLElement.prototype);


HTMLHtmlElement.createHtmlElementDog = function createHtmlElementDog(){
    let html = Object.create(HTMLHtmlElement.prototype);
    return dogvm.proxy(html);
};dogvm.safefunction(HTMLHtmlElement.createHtmlElementDog);


dogvm.safeproperty(HTMLHtmlElement);
// HTMLCanvasElement
var HTMLCanvasElement = function HTMLCanvasElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLCanvasElement);

Object.defineProperties(HTMLCanvasElement.prototype, {
    [Symbol.toStringTag]: {
        value: "HTMLCanvasElement",
        configurable: true
    }
});

HTMLCanvasElement.prototype.__proto__ = HTMLElement.prototype;

// HTMLCanvasElement对象
Object.defineProperty(HTMLCanvasElement.prototype, Symbol.toStringTag,{"value":"HTMLCanvasElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLCanvasElement.prototype, "width",{"configurable":true,"enumerable":true,"get": function width_get(){},"set": function width_set(){},});
Object.defineProperty(HTMLCanvasElement.prototype, "height",{"configurable":true,"enumerable":true,"get": function height_get(){},"set": function height_set(){},});
Object.defineProperty(HTMLCanvasElement.prototype, "captureStream",{"configurable":true,"enumerable":true,"writable":true,"value": function captureStream(){debugger;},});dogvm.safefunction(HTMLCanvasElement.prototype.captureStream);
Object.defineProperty(HTMLCanvasElement.prototype, "toBlob",{"configurable":true,"enumerable":true,"writable":true,"value": function toBlob(){debugger;},});dogvm.safefunction(HTMLCanvasElement.prototype.toBlob);

Object.defineProperty(HTMLCanvasElement.prototype, "transferControlToOffscreen",{"configurable":true,"enumerable":true,"writable":true,"value": function transferControlToOffscreen(){debugger;},});dogvm.safefunction(HTMLCanvasElement.prototype.transferControlToOffscreen);
Object.defineProperty(HTMLCanvasElement.prototype, "getContext",{"configurable":true,"enumerable":true,"writable":true,"value": function getContext(contextId){
    if(contextId == "webgl" || contextId == "experimental-webgl"){
        return WebGLRenderingContext.getWebDog();
    }
    if(contextId == "2d"){
        debugger;  
        // 建立一个 CanvasRenderingContext2D 二维渲染上下文。
        return CanvasRenderingContext2D.create2DDog();
    }
    if(contextId == "webgl2"|| contextId == "experimental-webgl2"){
        debugger;  
        // 创建一个 WebGL2RenderingContext 三维渲染上下文对象。只在实现 WebGL 版本 2 (OpenGL ES 3.0) 的浏览器上可用。
    }
    if(contextId == "bitmaprenderer"){
        debugger;  
        // 创建一个只提供将 canvas 内容替换为指定ImageBitmap功能的ImageBitmapRenderingContext 。
    }
},}
);dogvm.safefunction(HTMLCanvasElement.prototype.getContext);


Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function toDataURL(){
        debugger;
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAAE7ZJREFUeF7tm3lcVWX+xz/ngl5REEbEjUkDF1wQSxQRU8tcksncdVwacwPMsaZlppeaTZNOttiUWbFqL63RH5lL5lLmzzVREbOQUnFfEJU0FpXtcs/v9RzuuR4uV8TA8Pn1uX+J95znfM/7+z1vvs9zHhTwQwIkQAKSEFAkiZNhViMBNQJqNQ4nzVBKHFjv0mTLeaBMoOQJ/DXhU1i/hhrPuRcIUFj3QhZ+4xgorN8YOC9XbQQorGpDKc9AFJY8uWKkZQmUF9akxR5wtWwE8JD9UEWdg9ioedrPUdG+sJp2Q1GfR2zUakyNW679f3zE2CrB1a+rqO9q4zp+ImNehtXU3n4dZ3Gqyooqx1Glm5Dj5N9CWBnwwkA8gwQsQwhO3xLMajyI4YjSvvdEPjbjvQqPrwphrmFVhd69cW5ZYUVFh8Bq2gxFXVBOUKqSpMnAUVjVdR93Iqybx35tj/OmwACLaziWTM6rrtD+v41zt4UlZNUD/0A26lYooGTcj5GIxErEapIS8noeI7Ebb8EX2dWOncKqdqS/+YA3heUggen74G0x4XUoaJZf4OF15ec/Btc258ev+eKlt0SH5e+X8la/fvEP7U4a1TztUN+zkZERGSL62PiYHKjKXNud5MBk7Y+Yack20W0C8BWAv9u+PwOTtQeKaufqXV0d83X07xeT0rhJ+tvxIfjMTsTWYUVERhzIyW78YOJnr/WEyTpy+sRpJxzjdHe/ujqx76Xx5Wg6dmXGjkzIusTln9o5ihoO/TvRQSrqGNtYsQAes3eXlUlXZMwwWE0j7J1f2fFK7z9mWgYq6mxLf0k4ZyfOddblGjtS/ReRaGKcdDJjMQUr0FW7mxa4YheGEMjnCMZyJFTmTrVj9LHCkYY0NMPi+h/ifOfzCDsKtMksO4w4VnzE+Cn+wO7WJiTDDy2tVzA+Lbvc8ZUO4hYHUlhVJVjz598UVmlRrxQSmDppmpui4BkoSIrrgndEmBEpaKkAcwsK3HOWLntnoKOwtAdSPCSqMsDe4YiHVVX+oz2U4iOmksA57XvxEVNPVTmnnWt7YH18TicMGzI/zKrif28lrMIC91YiBve62QfGjXvpZ1VBuh6nXbRieCtmfdgNV7Rr6UJwuJ79+s66y9L7mWKXii4bRR3udNpqzGfpuXPt4hPfledTygt1RwE3PrPHcvPYFzXhAxkVsjNyNspPTK8V9byta56kxTxpscdDrkdyxSU2YhEWog++Rgft3x4owDyEl/lZn7IZRVZR2S7CI3gKe3AYTTCh/ghM7BqN+qbr6JNWVlh5qINwzMAA/IhRTTdiZzug12Hg1cwpcPU/id5+W/HEfsBHi7R6PhRW9XCsyVFuCstW9EEdtj7ePSxxhlECeoBTk9HbYnF7bvOWiFBzrRuvGTusCROezzl5svOIXUlj/iQ6qogUvKAAD1++7P+gyVScU1RU55Uv17/4jhBd337xIQpw/OovzcYXFLj7NG50cuvliy3nbtk6OfZP4QvzGnhnFIprqsB2XUTaw241tRcdlgI0iU2IXtmsSfrWdm2/rffT4V7IzGxj7+ZEnIqCKFVFTHwIdmjxGx7q6ROnFYiuLL/Qo73oHLWO7PNX3xfC7tlr2fz2bXe3t1hq1b6c5TfS1bVo15qBp4dEpuDt/AKP0KysFqG1axWsbdLkeLHVirVlpGrskozrfgCGf+UbdfFSmzd3J42eKMQhxgPQ1sY2TwXmxHXBCV24emzeDc8fsFhqbVu+fP5fbsUuPT3s3Z27xi0fOnT+9418Th8TbGA1JcBkHRgxZdqfNV5d8Hcbl2fczjYalgUPdLeexqW0rtie2VMT1uZuBbjoVRpRHQvswhDdz14fT7y871/ad5VZZ/qgmye2ejXFw9cuoK45V5ORscPShfUctkDtdlAbd/g+aMI8bPZGeMgnCMgAupysvseDwqo+ljU1UjlhDXp8wQtNmx4bUeZhN0ZnW8Ny7LBGj55jPXeu44ikPSPNQUHfwMvzEpKTh6KgsB66BH+RGNRpm3n1mpldG3ide12IDiry/ifxX1eKi90eGTtm9mGraspb8vH7nSvTYekPoN71Xc66v+6aNTMH28L81ukalq276dN76fjWbZJmQUFubEL0e3XN1zcPGTI/vaTE9bqYZgphtQvY3e/a9QY/Ll8+fwhM1ikRU6b1VIDgw4d7fWAQg4vVik/swrrFGpwu7uzsxjn6NFYbT0UbvQPUjlHRBiVYcOZ8p43ZOY1b7d03XNxOztCh85d6eWW23vxNVGf9l4QjOxfX4iuxsXG+gR23NO8R9tnZdetfuJiZEdBk+pSIGULMolu9eLF1SbGlzrL09NC6J092wcPmQ5gQEo0iuGBB8j/gFnAEjTwv4JXk8+hZeBbfBAGXPYEhyUC9QmhTtn2tAdVSG8v2R+KD3C8rXBxf2t4b8048jQUN4pHV7uIthfVX81ewhBxCoxygX2qpsH5CMwzvVjoNFRKrrg+FVV0ka26cclPCAQMWxd7fIi1Q/41fLrQKhHU+o/2gnJxGE8PCEp9QrfjY3t0AmPCte3TqoUdH52Q3elkIS+tOFse0EVOipyY+u8lVKWm1fMW/29Vz/yXmdlNCXVgiNr1rUBTULi4217mQ2SYsK6v5GwciN+jraKW3YBPWuDEvJrh75A3Q7i8hukCsDfXsteyjFvelDdu2Y2KQv//+V9sF7O6dmdn68y/Xv/jP5r4/vTAwfOEIbYq6JHq3mJoFB69bHNx5wwOqikRnHVYd8/WHxDpc02bpF+1dom3KHRi49bkeYYkjynVnN9e2SoVbu6id3vG18v/uMWNX68jO7FrQYvXamUnFFrd/D37ize/37RvW8sjRHrOnTo66Umxxm772i5lh2b809oWt65sbEa6KaeBLQe8ix9OiSWlbgCs+8eyAdckT0LiwoNzCt1gg74+/wafpcUwKXII/4Ea5aZ6xVvQF9febLqxQWP3MB9EyZIu9m9LXtSYGJSDXjcKqOTXcm1cut+jeJfiLjODgjdYywjK+GVTUfc4W3cWU8PiJrmMLCuouEA+zEIjxloVMDn7/WHBlhbV7z6gOaT/2+cr+FtAwJTx3LnDIpk0zyr0NHLfNY0Lutab/qVPnWlYDrws7yqxh2aaEY8fOXOZR72pj7buPo1sKKQiJdOq0edL2HRO66MLKyfVZlpg4b5a/X8oKMYXVBLwkOl+sB/n7pcyyS9f4YgCAPqU78F24Z8qBwaPta1g2hjbZtS/TweqL6ibrFO0FBYDRWxp/eu1ag2FiSujiUpRn7LCcCWtP0uhFqT/2WT+gf/TlGzfq++1KGvOAmA5mZd3fc82amd561ym60nonmh2/5OqGEJxCwxtWTVg3zMC6rkC2ay3ssrbB42lFmJJ5THtzJ7YdOK5hZdUHNnSG08V0Ef/thCWOEXJSzIX26V/AydJ1LTFN9Ag6SGHdm86o0ajKbWsQ60LdQtacbNjw9AytQ9JlpS+W1y6qf6u3hGfPBYamHnq0df++cXtdXfPfjV8Sfdy+Z8tBdLfrsGwPvG+ZBXpF/TpialS+vugOfauFjtAmpV49/zu2Xbudfy3TxdimbN1DV9YL6rhl/7H0sNe37pjwqVjojoiMmHP9+h8WGoWlCWVxTE8vr8tRQwbPT6rlmv9hfHxcpHhj6O+XMv1WwhKhGN+wnj3X4cqmjc/W1l9KNL/v0Kj+/WKPKorlg/jFMd7aSwmXkuEocVkl3j5GTo3qXlxsfuDUqc6he/aOsHYNWf1SZTosTcAJcYv8W+4fE9Bmb5a7x5VhDbwuPHn4aFjezp0TRuhM8q55t05Le6RL/VQ/rcPa5tkM3yU/gXWFCdqie6K5I5aFuKFP3YPIs7jj+P5++DT35sva9KbA1sBS4I4L6XfSYelSG2d+Ek+HvIfAnDzkpd7c1rC3W+m2Bk4Ja9QP99zFy20cDVo4OtDb5+yeK1d93VNT+5UGbJtKiN/OFovbgl27/tyjxOL6qrNtDatWzw7o1GnzoFOnHoBYK4H+Rs1hKumsSxBrWoWFHjMf7r30uLf3yXn/XbFgSmi3VQ/dyK+P1B/6a5tCbWtCTWI/Wvxa1+6rfnCrk+enr5UB0KZT0yMn1xZrN0ePdW++fftT7vY1rUmLPdoGbk/29T3Sdv/+wcjNaaSNKaaV+fmes41TQr0Dcv/bm6s6B68fdj6jrbgfsa0hTEwhxTpXuSmhk/Tqa1gAjoiF74azZq8z8Lm57SMyZlh9j59Xde68AenpodcvZAb8RcisXftdW0JDVjW83ZRQE9aSmN5ijL6PJqT6+JxeqQKtAMyNi42bK0T2R98jSEkZtPej/DWhz2I03gl6DS6eOViaPA3bCztq0eubN/3qn9Y6rk6nShe+9TUs42J8RdXsrMNKyyy/z0p0cG9389GGOrwvXFvQ72A+jbUh4KL7PaeLmg/I6Z/m6OtCzrY1iAVf8XAUu8BLbHPQuxjbWy+Ih9L2kAbr00p9cVwcq5gg3vLZzxMI9EVnMa74WV8oFutDzr7T32Dq44rX/uK6Os6pyRhlMmFIZkbAG+s2PD8eFte5+kZSQ/eTK85x/NnZG0b9fmyL7jGjR72S6uV1ybPMovttcmmLqaudj2HRXY9XBeIVYKrOVL8/VYVZVfG+YsL5itjpWzjsbyBVXNCnxYZrzImNw3FdQF43ShfWkwLKL7L/4Ff6pvBMQ+CMz6/rdkRHpm9ZcNyHpSNzPEbEpl+b2xpqXhL3UgS3/FtCgww89ICN2wyMEhJiMQpLHO/w2h76w+14nqOwxENn7EpcS/CGvjHUFofWqegxGadfdrD6g7okpjeA9mIaaXwr5+Qc+5i6sPQ1LCiqtpte3M/VX5oNEtswGjU8k+BSq7Cx44uFO0mskY+qokgISUzBbWJ5Uoxl+/9EIV8VOABgbWWEpY9RZluIIScdz+BxISr/y8APzUundr5XoXU12XVL78LFWvGUr7L36kxYzoSkC7Q6r+0YI98SVjZr9+5xv4s/ftYE5YJpriWItm8krUxOHHaI61POiKcnNwIwpyrCqszl79Yxd/tPc+5W3FUdl8KqKsGaP/93ISzRcSgm3GffhHoH3PVuzLiR1jhNvSMB3sF17+ahFNbdpMux7yaB34WwqgrQuNdLG8uwNlTVsWvifAqrJqjzmtVBgMKqDoqSjUFhSZYwhmsnQGGxGEiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQhQGFJkyoGSgIkQGGxBkiABKQh8H+NkcUPVYUE9AAAAABJRU5ErkJggg==";
    },});dogvm.safefunction(HTMLCanvasElement.prototype.toDataURL);



dogvm.safeproperty(HTMLCanvasElement);


// 创建canvas
dogvm.memory.htmlelements["canvas"] = function () {
    var canvas = new (function () {});
    canvas.__proto__ = HTMLCanvasElement.prototype;
    return canvas;
}
// HTMLIFrameElement
var HTMLIFrameElement = function HTMLIFrameElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLIFrameElement);

Object.defineProperty(HTMLIFrameElement.prototype, Symbol.toStringTag,{"value":"HTMLIFrameElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLIFrameElement.prototype, "src",{"configurable":true,"enumerable":true,"get": function src_get(){debugger; return ""},"set": function src_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "srcdoc",{"configurable":true,"enumerable":true,"get": function srcdoc_get(){debugger; return ""},"set": function srcdoc_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "name",{"configurable":true,"enumerable":true,"get": function name_get(){debugger; return ""},"set": function name_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "sandbox",{"configurable":true,"enumerable":true,"get": function sandbox_get(){debugger; return ""},"set": function sandbox_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "allowFullscreen",{"configurable":true,"enumerable":true,"get": function allowFullscreen_get(){debugger; return "false"},"set": function allowFullscreen_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "width",{"configurable":true,"enumerable":true,"get": function width_get(){debugger; return ""},"set": function width_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "height",{"configurable":true,"enumerable":true,"get": function height_get(){debugger; return ""},"set": function height_set(){debugger;},});


Object.defineProperty(HTMLIFrameElement.prototype, "referrerPolicy",{"configurable":true,"enumerable":true,"get": function referrerPolicy_get(){debugger; return ""},"set": function referrerPolicy_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "csp",{"configurable":true,"enumerable":true,"get": function csp_get(){debugger; return ""},"set": function csp_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "allow",{"configurable":true,"enumerable":true,"get": function allow_get(){debugger; return ""},"set": function allow_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "featurePolicy",{"configurable":true,"enumerable":true,"get": function featurePolicy_get(){debugger; return "[object FeaturePolicy]"},set:undefined, });
Object.defineProperty(HTMLIFrameElement.prototype, "loading",{"configurable":true,"enumerable":true,"get": function loading_get(){debugger; return "auto"},"set": function loading_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "align",{"configurable":true,"enumerable":true,"get": function align_get(){debugger; return ""},"set": function align_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "scrolling",{"configurable":true,"enumerable":true,"get": function scrolling_get(){debugger; return ""},"set": function scrolling_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "frameBorder",{"configurable":true,"enumerable":true,"get": function frameBorder_get(){debugger; return ""},"set": function frameBorder_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "longDesc",{"configurable":true,"enumerable":true,"get": function longDesc_get(){debugger; return ""},"set": function longDesc_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "marginHeight",{"configurable":true,"enumerable":true,"get": function marginHeight_get(){debugger; return ""},"set": function marginHeight_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "marginWidth",{"configurable":true,"enumerable":true,"get": function marginWidth_get(){debugger; return ""},"set": function marginWidth_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "getSVGDocument",{"configurable":true,"enumerable":true,"writable":true,"value": function getSVGDocument(){debugger;},});dogvm.safefunction(HTMLIFrameElement.prototype.getSVGDocument);
Object.defineProperty(HTMLIFrameElement.prototype, "credentialless",{"configurable":true,"enumerable":true,"get": function credentialless_get(){debugger; return "false"},"set": function credentialless_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "allowPaymentRequest",{"configurable":true,"enumerable":true,"get": function allowPaymentRequest_get(){debugger; return "false"},"set": function allowPaymentRequest_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "privateToken",{"configurable":true,"enumerable":true,"get": function privateToken_get(){debugger; return ""},"set": function privateToken_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "browsingTopics",{"configurable":true,"enumerable":true,"get": function browsingTopics_get(){debugger; return "false"},"set": function browsingTopics_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "adAuctionHeaders",{"configurable":true,"enumerable":true,"get": function adAuctionHeaders_get(){debugger; return "false"},"set": function adAuctionHeaders_set(){debugger;},});
Object.defineProperty(HTMLIFrameElement.prototype, "sharedStorageWritable",{"configurable":true,"enumerable":true,"get": function sharedStorageWritable_get(){debugger; return "false"},"set": function sharedStorageWritable_set(){debugger;},});
Object.setPrototypeOf(HTMLIFrameElement.prototype, HTMLElement.prototype);


Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow",{"configurable":true,"enumerable":true,
    "get": function contentWindow_get(){
        debugger;
        if(this.parentNode){
            return (window[0]=window,window);
        }
        return "null";
    },set:undefined, });
Object.defineProperty(HTMLIFrameElement.prototype, "contentDocument",{"configurable":true,"enumerable":true,
    "get": function contentDocument_get(){
        debugger; return "null"
    },set:undefined, });


// 创建iframe
dogvm.memory.htmlelements["iframe"] = function () {
    var iframe = new (function () {});
    iframe.__proto__ = HTMLIFrameElement.prototype;
    return iframe;
}
// HTMLParagraphElement
var HTMLParagraphElement = function HTMLParagraphElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLParagraphElement);
Object.defineProperty(HTMLParagraphElement.prototype, Symbol.toStringTag,{"value":"HTMLParagraphElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLParagraphElement.prototype, "align",{"configurable":true,"enumerable":true,"get": function align_get(){debugger; return ""},"set": function align_set(){debugger;},});
Object.setPrototypeOf(HTMLParagraphElement.prototype, HTMLElement.prototype);


// 创建p
dogvm.memory.htmlelements["p"] = function () {
    var p = new (function () {});
    p.__proto__ = HTMLParagraphElement.prototype;
    return p;
}
// HTMLSpanElement
var HTMLSpanElement = function HTMLSpanElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLSpanElement);

Object.defineProperty(HTMLSpanElement.prototype, Symbol.toStringTag,{"value":"HTMLSpanElement","writable":false,"enumerable":false,"configurable":true})
Object.setPrototypeOf(HTMLSpanElement.prototype, HTMLElement.prototype);

// 创建span
dogvm.memory.htmlelements["span"] = function () {
    var span = new (function () {});
    span.__proto__ = HTMLSpanElement.prototype;
    return span;
}
// HTMLStyleElement对象
var HTMLStyleElement = function HTMLStyleElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLStyleElement);

Object.defineProperty(HTMLStyleElement.prototype, Symbol.toStringTag,{"value":"HTMLStyleElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLStyleElement.prototype, "disabled",{"configurable":true,"enumerable":true,"get": function disabled_get(){debugger; return "false"},"set": function disabled_set(){debugger;},});
Object.defineProperty(HTMLStyleElement.prototype, "media",{"configurable":true,"enumerable":true,"get": function media_get(){debugger; return ""},"set": function media_set(){debugger;},});
Object.defineProperty(HTMLStyleElement.prototype, "type",{"configurable":true,"enumerable":true,"get": function type_get(){debugger; return ""},"set": function type_set(){debugger;},});

Object.defineProperty(HTMLStyleElement.prototype, "blocking",{"configurable":true,"enumerable":true,"get": function blocking_get(){debugger; return ""},"set": function blocking_set(){debugger;},});
Object.setPrototypeOf(HTMLStyleElement.prototype, HTMLElement.prototype);


Object.defineProperty(HTMLStyleElement.prototype, "sheet",{"configurable":true,"enumerable":true,
    "get": function sheet_get(){
        debugger;
        // 从 dogvm 的内存中获取该节点的父节点
        for (const [key, value] of dogvm.memory.htmlNode) {
            if (value.includes(this)) {
                // 该元素是子节点
                return new CSSStyleSheet(this._innerHtml);
            }
        }
        return "null";
    },set:undefined, });


// 创建HTMLStyleElement
dogvm.memory.htmlelements["style"] = function () {
    var style = new (function () {});
    style.__proto__ = HTMLStyleElement.prototype;
    return style;
}
// HTMLHeadingElement
var HTMLHeadingElement = function HTMLHeadingElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLHeadingElement);
Object.defineProperty(HTMLHeadingElement.prototype, Symbol.toStringTag,{"value":"HTMLHeadingElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLHeadingElement.prototype, "align",{"configurable":true,"enumerable":true,"get": function align_get(){},"set": function align_set(){debugger;},});
Object.setPrototypeOf(HTMLHeadingElement.prototype, HTMLElement.prototype);

// 创建HTMLHeadingElement
dogvm.memory.htmlelements["h"] = function () {
    var h = new (function () {});
    h.__proto__ = HTMLHeadingElement.prototype;
    return h;
}

// HTMLMediaElement对象
var HTMLMediaElement = function HTMLMediaElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLMediaElement);
Object.defineProperty(HTMLMediaElement, "NETWORK_EMPTY",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(HTMLMediaElement, "NETWORK_IDLE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(HTMLMediaElement, "NETWORK_LOADING",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(HTMLMediaElement, "NETWORK_NO_SOURCE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(HTMLMediaElement, "HAVE_NOTHING",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(HTMLMediaElement, "HAVE_METADATA",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(HTMLMediaElement, "HAVE_CURRENT_DATA",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(HTMLMediaElement, "HAVE_FUTURE_DATA",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(HTMLMediaElement, "HAVE_ENOUGH_DATA",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(HTMLMediaElement.prototype, Symbol.toStringTag,{"value":"HTMLMediaElement","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(HTMLMediaElement.prototype, "error",{"configurable":true,"enumerable":true,"get": function error_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "src",{"configurable":true,"enumerable":true,"get": function src_get(){},"set": function src_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "currentSrc",{"configurable":true,"enumerable":true,"get": function currentSrc_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "crossOrigin",{"configurable":true,"enumerable":true,"get": function crossOrigin_get(){},"set": function crossOrigin_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "networkState",{"configurable":true,"enumerable":true,"get": function networkState_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "preload",{"configurable":true,"enumerable":true,"get": function preload_get(){},"set": function preload_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "buffered",{"configurable":true,"enumerable":true,"get": function buffered_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "readyState",{"configurable":true,"enumerable":true,"get": function readyState_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "seeking",{"configurable":true,"enumerable":true,"get": function seeking_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "currentTime",{"configurable":true,"enumerable":true,"get": function currentTime_get(){},"set": function currentTime_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "duration",{"configurable":true,"enumerable":true,"get": function duration_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "paused",{"configurable":true,"enumerable":true,"get": function paused_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "defaultPlaybackRate",{"configurable":true,"enumerable":true,"get": function defaultPlaybackRate_get(){},"set": function defaultPlaybackRate_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "playbackRate",{"configurable":true,"enumerable":true,"get": function playbackRate_get(){},"set": function playbackRate_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "played",{"configurable":true,"enumerable":true,"get": function played_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "seekable",{"configurable":true,"enumerable":true,"get": function seekable_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "ended",{"configurable":true,"enumerable":true,"get": function ended_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "autoplay",{"configurable":true,"enumerable":true,"get": function autoplay_get(){},"set": function autoplay_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "loop",{"configurable":true,"enumerable":true,"get": function loop_get(){},"set": function loop_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "preservesPitch",{"configurable":true,"enumerable":true,"get": function preservesPitch_get(){},"set": function preservesPitch_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "controls",{"configurable":true,"enumerable":true,"get": function controls_get(){},"set": function controls_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "controlsList",{"configurable":true,"enumerable":true,"get": function controlsList_get(){},"set": function controlsList_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "volume",{"configurable":true,"enumerable":true,"get": function volume_get(){},"set": function volume_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "muted",{"configurable":true,"enumerable":true,"get": function muted_get(){},"set": function muted_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "defaultMuted",{"configurable":true,"enumerable":true,"get": function defaultMuted_get(){},"set": function defaultMuted_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "textTracks",{"configurable":true,"enumerable":true,"get": function textTracks_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "webkitAudioDecodedByteCount",{"configurable":true,"enumerable":true,"get": function webkitAudioDecodedByteCount_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "webkitVideoDecodedByteCount",{"configurable":true,"enumerable":true,"get": function webkitVideoDecodedByteCount_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "onencrypted",{"configurable":true,"enumerable":true,"get": function onencrypted_get(){},"set": function onencrypted_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "onwaitingforkey",{"configurable":true,"enumerable":true,"get": function onwaitingforkey_get(){},"set": function onwaitingforkey_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "srcObject",{"configurable":true,"enumerable":true,"get": function srcObject_get(){},"set": function srcObject_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "NETWORK_EMPTY",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(HTMLMediaElement.prototype, "NETWORK_IDLE",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(HTMLMediaElement.prototype, "NETWORK_LOADING",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(HTMLMediaElement.prototype, "NETWORK_NO_SOURCE",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(HTMLMediaElement.prototype, "HAVE_NOTHING",{"configurable":false,"enumerable":true,"writable":false,"value":0,});
Object.defineProperty(HTMLMediaElement.prototype, "HAVE_METADATA",{"configurable":false,"enumerable":true,"writable":false,"value":1,});
Object.defineProperty(HTMLMediaElement.prototype, "HAVE_CURRENT_DATA",{"configurable":false,"enumerable":true,"writable":false,"value":2,});
Object.defineProperty(HTMLMediaElement.prototype, "HAVE_FUTURE_DATA",{"configurable":false,"enumerable":true,"writable":false,"value":3,});
Object.defineProperty(HTMLMediaElement.prototype, "HAVE_ENOUGH_DATA",{"configurable":false,"enumerable":true,"writable":false,"value":4,});
Object.defineProperty(HTMLMediaElement.prototype, "addTextTrack",{"configurable":true,"enumerable":true,"writable":true,"value": function addTextTrack(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.addTextTrack);
Object.defineProperty(HTMLMediaElement.prototype, "canPlayType",{"configurable":true,"enumerable":true,"writable":true,"value": function canPlayType(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.canPlayType);
Object.defineProperty(HTMLMediaElement.prototype, "captureStream",{"configurable":true,"enumerable":true,"writable":true,"value": function captureStream(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.captureStream);
Object.defineProperty(HTMLMediaElement.prototype, "load",{"configurable":true,"enumerable":true,"writable":true,"value": function load(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.load);
Object.defineProperty(HTMLMediaElement.prototype, "pause",{"configurable":true,"enumerable":true,"writable":true,"value": function pause(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.pause);
Object.defineProperty(HTMLMediaElement.prototype, "play",{"configurable":true,"enumerable":true,"writable":true,"value": function play(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.play);
Object.defineProperty(HTMLMediaElement.prototype, "sinkId",{"configurable":true,"enumerable":true,"get": function sinkId_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "remote",{"configurable":true,"enumerable":true,"get": function remote_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "disableRemotePlayback",{"configurable":true,"enumerable":true,"get": function disableRemotePlayback_get(){},"set": function disableRemotePlayback_set(){debugger;},});
Object.defineProperty(HTMLMediaElement.prototype, "setSinkId",{"configurable":true,"enumerable":true,"writable":true,"value": function setSinkId(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.setSinkId);
Object.defineProperty(HTMLMediaElement.prototype, "mediaKeys",{"configurable":true,"enumerable":true,"get": function mediaKeys_get(){},set:undefined, });
Object.defineProperty(HTMLMediaElement.prototype, "setMediaKeys",{"configurable":true,"enumerable":true,"writable":true,"value": function setMediaKeys(){debugger;},});dogvm.safefunction(HTMLMediaElement.prototype.setMediaKeys);
Object.setPrototypeOf(HTMLMediaElement.prototype, HTMLElement.prototype);



dogvm.safeproperty(HTMLMediaElement);
// HTMLVideoElement对象
var HTMLVideoElement = function HTMLVideoElement(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLVideoElement);
Object.defineProperty(HTMLVideoElement.prototype, Symbol.toStringTag,{"value":"HTMLVideoElement","writable":false,"enumerable":false,"configurable":true})

Object.defineProperty(HTMLVideoElement.prototype, "width",{"configurable":true,"enumerable":true,"get": function width_get(){ return 160},"set": function width_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "height",{"configurable":true,"enumerable":true,"get": function height_get(){ return 120},"set": function height_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "videoWidth",{"configurable":true,"enumerable":true,"get": function videoWidth_get(){ return 0},set:undefined, });
Object.defineProperty(HTMLVideoElement.prototype, "videoHeight",{"configurable":true,"enumerable":true,"get": function videoHeight_get(){ return 0},set:undefined, });
Object.defineProperty(HTMLVideoElement.prototype, "poster",{"configurable":true,"enumerable":true,"get": function poster_get(){ return ""},"set": function poster_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "webkitDecodedFrameCount",{"configurable":true,"enumerable":true,"get": function webkitDecodedFrameCount_get(){ return "0"},set:undefined, });
Object.defineProperty(HTMLVideoElement.prototype, "webkitDroppedFrameCount",{"configurable":true,"enumerable":true,"get": function webkitDroppedFrameCount_get(){ return "0"},set:undefined, });
Object.defineProperty(HTMLVideoElement.prototype, "playsInline",{"configurable":true,"enumerable":true,"get": function playsInline_get(){ return "false"},"set": function playsInline_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "onenterpictureinpicture",{"configurable":true,"enumerable":true,"get": function onenterpictureinpicture_get(){ return "null"},"set": function onenterpictureinpicture_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "onleavepictureinpicture",{"configurable":true,"enumerable":true,"get": function onleavepictureinpicture_get(){ return "null"},"set": function onleavepictureinpicture_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "disablePictureInPicture",{"configurable":true,"enumerable":true,"get": function disablePictureInPicture_get(){ return "false"},"set": function disablePictureInPicture_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "cancelVideoFrameCallback",{"configurable":true,"enumerable":true,"writable":true,"value": function cancelVideoFrameCallback(){debugger;},});dogvm.safefunction(HTMLVideoElement.prototype.cancelVideoFrameCallback);
Object.defineProperty(HTMLVideoElement.prototype, "getVideoPlaybackQuality",{"configurable":true,"enumerable":true,"writable":true,"value": function getVideoPlaybackQuality(){debugger;},});dogvm.safefunction(HTMLVideoElement.prototype.getVideoPlaybackQuality);
Object.defineProperty(HTMLVideoElement.prototype, "requestPictureInPicture",{"configurable":true,"enumerable":true,"writable":true,"value": function requestPictureInPicture(){debugger;},});dogvm.safefunction(HTMLVideoElement.prototype.requestPictureInPicture);
Object.defineProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback",{"configurable":true,"enumerable":true,"writable":true,"value": function requestVideoFrameCallback(){debugger;},});dogvm.safefunction(HTMLVideoElement.prototype.requestVideoFrameCallback);
Object.defineProperty(HTMLVideoElement.prototype, "msVideoProcessing",{"configurable":true,"enumerable":true,"get": function msVideoProcessing_get(){ return "default"},"set": function msVideoProcessing_set(){debugger;},});
Object.defineProperty(HTMLVideoElement.prototype, "msGetVideoProcessingTypes",{"configurable":true,"enumerable":true,"writable":true,"value": function msGetVideoProcessingTypes(){debugger;},});dogvm.safefunction(HTMLVideoElement.prototype.msGetVideoProcessingTypes);
Object.setPrototypeOf(HTMLVideoElement.prototype, HTMLMediaElement.prototype);



dogvm.safeproperty(HTMLVideoElement);



// 创建HTMLMediaElement
dogvm.memory.htmlelements["video"] = function () {
    var media = new (function () {});
    media.__proto__ = HTMLVideoElement.prototype;
    return media;
}

// 从浏览器中知道Document是全局的，new Document会返回一个对象

// Document
var Document = function Document(){};
dogvm.safefunction(Document);
Object.defineProperties(Document.prototype, {
    [Symbol.toStringTag]: {
        value: "Document",
        configurable: true
    }
});
Document.prototype.__proto__ = Node.prototype;

//////////////////////////
Object.defineProperty(Document, "parseHTMLUnsafe",{"configurable":true,"enumerable":true,"writable":true,"value": function parseHTMLUnsafe(){debugger;},});dogvm.safefunction(Document.parseHTMLUnsafe);
Object.defineProperty(Document.prototype, Symbol.toStringTag,{"value":"Document","writable":false,"enumerable":false,"configurable":true})
Object.defineProperty(Document.prototype, "implementation",{"configurable":true,"enumerable":true,"get": function implementation_get(){debugger;return "[object DOMImplementation]"},set:undefined, });
Object.defineProperty(Document.prototype, "URL",{"configurable":true,"enumerable":true,"get": function URL_get(){debugger;return "https://turing.captcha.gtimg.com/1/template/drag_ele.html"},set:undefined, });
Object.defineProperty(Document.prototype, "documentURI",{"configurable":true,"enumerable":true,"get": function documentURI_get(){debugger;return "https://turing.captcha.gtimg.com/1/template/drag_ele.html"},set:undefined, });
Object.defineProperty(Document.prototype, "compatMode",{"configurable":true,"enumerable":true,"get": function compatMode_get(){debugger;return "CSS1Compat"},set:undefined, });
Object.defineProperty(Document.prototype, "characterSet",{"configurable":true,"enumerable":true,"get": function characterSet_get(){debugger;return "UTF-8"},set:undefined, });
Object.defineProperty(Document.prototype, "charset",{"configurable":true,"enumerable":true,"get": function charset_get(){debugger;return "UTF-8"},set:undefined, });
Object.defineProperty(Document.prototype, "inputEncoding",{"configurable":true,"enumerable":true,"get": function inputEncoding_get(){debugger;return "UTF-8"},set:undefined, });
Object.defineProperty(Document.prototype, "contentType",{"configurable":true,"enumerable":true,"get": function contentType_get(){debugger;return "text/html"},set:undefined, });
Object.defineProperty(Document.prototype, "doctype",{"configurable":true,"enumerable":true,"get": function doctype_get(){debugger;return "[object DocumentType]"},set:undefined, });
Object.defineProperty(Document.prototype, "xmlEncoding",{"configurable":true,"enumerable":true,"get": function xmlEncoding_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "xmlVersion",{"configurable":true,"enumerable":true,"get": function xmlVersion_get(){debugger;return "null"},"set": function xmlVersion_set(){debugger;},});
Object.defineProperty(Document.prototype, "xmlStandalone",{"configurable":true,"enumerable":true,"get": function xmlStandalone_get(){debugger;return "false"},"set": function xmlStandalone_set(){debugger;},});
Object.defineProperty(Document.prototype, "domain",{"configurable":true,"enumerable":true,"get": function domain_get(){debugger;return "turing.captcha.gtimg.com"},"set": function domain_set(){debugger;},});
Object.defineProperty(Document.prototype, "referrer",{"configurable":true,"enumerable":true,"get": function referrer_get(){debugger;return "https://pintia.cn/"},set:undefined, });
Object.defineProperty(Document.prototype, "lastModified",{"configurable":true,"enumerable":true,"get": function lastModified_get(){debugger;return "12/31/2024 14:47:24"},set:undefined, });
Object.defineProperty(Document.prototype, "readyState",{"configurable":true,"enumerable":true,"get": function readyState_get(){debugger;return "complete"},set:undefined, });
Object.defineProperty(Document.prototype, "title",{"configurable":true,"enumerable":true,"get": function title_get(){debugger;return "验证码"},"set": function title_set(){debugger;},});
Object.defineProperty(Document.prototype, "dir",{"configurable":true,"enumerable":true,"get": function dir_get(){debugger;return ""},"set": function dir_set(){debugger;},});
Object.defineProperty(Document.prototype, "images",{"configurable":true,"enumerable":true,"get": function images_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "embeds",{"configurable":true,"enumerable":true,"get": function embeds_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "plugins",{"configurable":true,"enumerable":true,"get": function plugins_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "links",{"configurable":true,"enumerable":true,"get": function links_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "forms",{"configurable":true,"enumerable":true,"get": function forms_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "scripts",{"configurable":true,"enumerable":true,"get": function scripts_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "currentScript",{"configurable":true,"enumerable":true,"get": function currentScript_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "defaultView",{"configurable":true,"enumerable":true,"get": function defaultView_get(){debugger;return "[object Window]"},set:undefined, });
Object.defineProperty(Document.prototype, "designMode",{"configurable":true,"enumerable":true,"get": function designMode_get(){debugger;return "off"},"set": function designMode_set(){debugger;},});
Object.defineProperty(Document.prototype, "onreadystatechange",{"configurable":true,"enumerable":true,"get": function onreadystatechange_get(){debugger;return "null"},"set": function onreadystatechange_set(){debugger;},});
Object.defineProperty(Document.prototype, "anchors",{"configurable":true,"enumerable":true,"get": function anchors_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "applets",{"configurable":true,"enumerable":true,"get": function applets_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "fgColor",{"configurable":true,"enumerable":true,"get": function fgColor_get(){debugger;return ""},"set": function fgColor_set(){debugger;},});
Object.defineProperty(Document.prototype, "linkColor",{"configurable":true,"enumerable":true,"get": function linkColor_get(){debugger;return ""},"set": function linkColor_set(){debugger;},});
Object.defineProperty(Document.prototype, "vlinkColor",{"configurable":true,"enumerable":true,"get": function vlinkColor_get(){debugger;return ""},"set": function vlinkColor_set(){debugger;},});
Object.defineProperty(Document.prototype, "alinkColor",{"configurable":true,"enumerable":true,"get": function alinkColor_get(){debugger;return ""},"set": function alinkColor_set(){debugger;},});
Object.defineProperty(Document.prototype, "bgColor",{"configurable":true,"enumerable":true,"get": function bgColor_get(){debugger;return ""},"set": function bgColor_set(){debugger;},});
Object.defineProperty(Document.prototype, "all",{"configurable":true,"enumerable":true,"get": function all_get(){debugger;return "[object HTMLAllCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "scrollingElement",{"configurable":true,"enumerable":true,"get": function scrollingElement_get(){debugger;return "[object HTMLHtmlElement]"},set:undefined, });
Object.defineProperty(Document.prototype, "onpointerlockchange",{"configurable":true,"enumerable":true,"get": function onpointerlockchange_get(){debugger;return "null"},"set": function onpointerlockchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerlockerror",{"configurable":true,"enumerable":true,"get": function onpointerlockerror_get(){debugger;return "null"},"set": function onpointerlockerror_set(){debugger;},});
Object.defineProperty(Document.prototype, "hidden",{"configurable":true,"enumerable":true,"get": function hidden_get(){debugger;return "false"},set:undefined, });
Object.defineProperty(Document.prototype, "visibilityState",{"configurable":true,"enumerable":true,"get": function visibilityState_get(){debugger;return "visible"},set:undefined, });
Object.defineProperty(Document.prototype, "wasDiscarded",{"configurable":true,"enumerable":true,"get": function wasDiscarded_get(){debugger;return "false"},set:undefined, });
Object.defineProperty(Document.prototype, "prerendering",{"configurable":true,"enumerable":true,"get": function prerendering_get(){debugger;return "false"},set:undefined, });
Object.defineProperty(Document.prototype, "featurePolicy",{"configurable":true,"enumerable":true,"get": function featurePolicy_get(){debugger;return "[object FeaturePolicy]"},set:undefined, });
Object.defineProperty(Document.prototype, "webkitVisibilityState",{"configurable":true,"enumerable":true,"get": function webkitVisibilityState_get(){debugger;return "visible"},set:undefined, });
Object.defineProperty(Document.prototype, "webkitHidden",{"configurable":true,"enumerable":true,"get": function webkitHidden_get(){debugger;return "false"},set:undefined, });
Object.defineProperty(Document.prototype, "onbeforecopy",{"configurable":true,"enumerable":true,"get": function onbeforecopy_get(){debugger;return "null"},"set": function onbeforecopy_set(){debugger;},});
Object.defineProperty(Document.prototype, "onbeforecut",{"configurable":true,"enumerable":true,"get": function onbeforecut_get(){debugger;return "null"},"set": function onbeforecut_set(){debugger;},});
Object.defineProperty(Document.prototype, "onbeforepaste",{"configurable":true,"enumerable":true,"get": function onbeforepaste_get(){debugger;return "null"},"set": function onbeforepaste_set(){debugger;},});
Object.defineProperty(Document.prototype, "onfreeze",{"configurable":true,"enumerable":true,"get": function onfreeze_get(){debugger;return "null"},"set": function onfreeze_set(){debugger;},});
Object.defineProperty(Document.prototype, "onprerenderingchange",{"configurable":true,"enumerable":true,"get": function onprerenderingchange_get(){debugger;return "null"},"set": function onprerenderingchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onresume",{"configurable":true,"enumerable":true,"get": function onresume_get(){debugger;return "null"},"set": function onresume_set(){debugger;},});
Object.defineProperty(Document.prototype, "onsearch",{"configurable":true,"enumerable":true,"get": function onsearch_get(){debugger;return "null"},"set": function onsearch_set(){debugger;},});
Object.defineProperty(Document.prototype, "onvisibilitychange",{"configurable":true,"enumerable":true,"get": function onvisibilitychange_get(){debugger;return "null"},"set": function onvisibilitychange_set(){debugger;},});
Object.defineProperty(Document.prototype, "timeline",{"configurable":true,"enumerable":true,"get": function timeline_get(){debugger;return "[object DocumentTimeline]"},set:undefined, });
Object.defineProperty(Document.prototype, "fullscreenEnabled",{"configurable":true,"enumerable":true,"get": function fullscreenEnabled_get(){debugger;return "false"},"set": function fullscreenEnabled_set(){debugger;},});
Object.defineProperty(Document.prototype, "fullscreen",{"configurable":true,"enumerable":true,"get": function fullscreen_get(){debugger;return "false"},"set": function fullscreen_set(){debugger;},});
Object.defineProperty(Document.prototype, "onfullscreenchange",{"configurable":true,"enumerable":true,"get": function onfullscreenchange_get(){debugger;return "null"},"set": function onfullscreenchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onfullscreenerror",{"configurable":true,"enumerable":true,"get": function onfullscreenerror_get(){debugger;return "null"},"set": function onfullscreenerror_set(){debugger;},});
Object.defineProperty(Document.prototype, "webkitIsFullScreen",{"configurable":true,"enumerable":true,"get": function webkitIsFullScreen_get(){debugger;return "false"},set:undefined, });
Object.defineProperty(Document.prototype, "webkitCurrentFullScreenElement",{"configurable":true,"enumerable":true,"get": function webkitCurrentFullScreenElement_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "webkitFullscreenEnabled",{"configurable":true,"enumerable":true,"get": function webkitFullscreenEnabled_get(){debugger;return "false"},set:undefined, });
Object.defineProperty(Document.prototype, "webkitFullscreenElement",{"configurable":true,"enumerable":true,"get": function webkitFullscreenElement_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "onwebkitfullscreenchange",{"configurable":true,"enumerable":true,"get": function onwebkitfullscreenchange_get(){debugger;return "null"},"set": function onwebkitfullscreenchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwebkitfullscreenerror",{"configurable":true,"enumerable":true,"get": function onwebkitfullscreenerror_get(){debugger;return "null"},"set": function onwebkitfullscreenerror_set(){debugger;},});
Object.defineProperty(Document.prototype, "rootElement",{"configurable":true,"enumerable":true,"get": function rootElement_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "pictureInPictureEnabled",{"configurable":true,"enumerable":true,"get": function pictureInPictureEnabled_get(){debugger;return "true"},set:undefined, });
Object.defineProperty(Document.prototype, "onbeforexrselect",{"configurable":true,"enumerable":true,"get": function onbeforexrselect_get(){debugger;return "null"},"set": function onbeforexrselect_set(){debugger;},});
Object.defineProperty(Document.prototype, "onabort",{"configurable":true,"enumerable":true,"get": function onabort_get(){debugger;return "null"},"set": function onabort_set(){debugger;},});
Object.defineProperty(Document.prototype, "onbeforeinput",{"configurable":true,"enumerable":true,"get": function onbeforeinput_get(){debugger;return "null"},"set": function onbeforeinput_set(){debugger;},});
Object.defineProperty(Document.prototype, "onbeforematch",{"configurable":true,"enumerable":true,"get": function onbeforematch_get(){debugger;return "null"},"set": function onbeforematch_set(){debugger;},});
Object.defineProperty(Document.prototype, "onbeforetoggle",{"configurable":true,"enumerable":true,"get": function onbeforetoggle_get(){debugger;return "null"},"set": function onbeforetoggle_set(){debugger;},});
Object.defineProperty(Document.prototype, "onblur",{"configurable":true,"enumerable":true,"get": function onblur_get(){debugger;return "null"},"set": function onblur_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncancel",{"configurable":true,"enumerable":true,"get": function oncancel_get(){debugger;return "null"},"set": function oncancel_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncanplay",{"configurable":true,"enumerable":true,"get": function oncanplay_get(){debugger;return "null"},"set": function oncanplay_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncanplaythrough",{"configurable":true,"enumerable":true,"get": function oncanplaythrough_get(){debugger;return "null"},"set": function oncanplaythrough_set(){debugger;},});
Object.defineProperty(Document.prototype, "onchange",{"configurable":true,"enumerable":true,"get": function onchange_get(){debugger;return "null"},"set": function onchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onclick",{"configurable":true,"enumerable":true,"get": function onclick_get(){debugger;return "null"},"set": function onclick_set(){debugger;},});
Object.defineProperty(Document.prototype, "onclose",{"configurable":true,"enumerable":true,"get": function onclose_get(){debugger;return "null"},"set": function onclose_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncontentvisibilityautostatechange",{"configurable":true,"enumerable":true,"get": function oncontentvisibilityautostatechange_get(){debugger;return "null"},"set": function oncontentvisibilityautostatechange_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncontextlost",{"configurable":true,"enumerable":true,"get": function oncontextlost_get(){debugger;return "null"},"set": function oncontextlost_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncontextmenu",{"configurable":true,"enumerable":true,"get": function oncontextmenu_get(){debugger;return "null"},"set": function oncontextmenu_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncontextrestored",{"configurable":true,"enumerable":true,"get": function oncontextrestored_get(){debugger;return "null"},"set": function oncontextrestored_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncuechange",{"configurable":true,"enumerable":true,"get": function oncuechange_get(){debugger;return "null"},"set": function oncuechange_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondblclick",{"configurable":true,"enumerable":true,"get": function ondblclick_get(){debugger;return "null"},"set": function ondblclick_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondrag",{"configurable":true,"enumerable":true,"get": function ondrag_get(){debugger;return "null"},"set": function ondrag_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondragend",{"configurable":true,"enumerable":true,"get": function ondragend_get(){debugger;return "null"},"set": function ondragend_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondragenter",{"configurable":true,"enumerable":true,"get": function ondragenter_get(){debugger;return "null"},"set": function ondragenter_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondragleave",{"configurable":true,"enumerable":true,"get": function ondragleave_get(){debugger;return "null"},"set": function ondragleave_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondragover",{"configurable":true,"enumerable":true,"get": function ondragover_get(){debugger;return "null"},"set": function ondragover_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondragstart",{"configurable":true,"enumerable":true,"get": function ondragstart_get(){debugger;return "null"},"set": function ondragstart_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondrop",{"configurable":true,"enumerable":true,"get": function ondrop_get(){debugger;return "null"},"set": function ondrop_set(){debugger;},});
Object.defineProperty(Document.prototype, "ondurationchange",{"configurable":true,"enumerable":true,"get": function ondurationchange_get(){debugger;return "null"},"set": function ondurationchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onemptied",{"configurable":true,"enumerable":true,"get": function onemptied_get(){debugger;return "null"},"set": function onemptied_set(){debugger;},});
Object.defineProperty(Document.prototype, "onended",{"configurable":true,"enumerable":true,"get": function onended_get(){debugger;return "null"},"set": function onended_set(){debugger;},});
Object.defineProperty(Document.prototype, "onerror",{"configurable":true,"enumerable":true,"get": function onerror_get(){debugger;return "null"},"set": function onerror_set(){debugger;},});
Object.defineProperty(Document.prototype, "onfocus",{"configurable":true,"enumerable":true,"get": function onfocus_get(){debugger;return "null"},"set": function onfocus_set(){debugger;},});
Object.defineProperty(Document.prototype, "onformdata",{"configurable":true,"enumerable":true,"get": function onformdata_get(){debugger;return "null"},"set": function onformdata_set(){debugger;},});
Object.defineProperty(Document.prototype, "oninput",{"configurable":true,"enumerable":true,"get": function oninput_get(){debugger;return "null"},"set": function oninput_set(){debugger;},});
Object.defineProperty(Document.prototype, "oninvalid",{"configurable":true,"enumerable":true,"get": function oninvalid_get(){debugger;return "null"},"set": function oninvalid_set(){debugger;},});
Object.defineProperty(Document.prototype, "onkeydown",{"configurable":true,"enumerable":true,"get": function onkeydown_get(){debugger;return "null"},"set": function onkeydown_set(){debugger;},});
Object.defineProperty(Document.prototype, "onkeypress",{"configurable":true,"enumerable":true,"get": function onkeypress_get(){debugger;return "null"},"set": function onkeypress_set(){debugger;},});
Object.defineProperty(Document.prototype, "onkeyup",{"configurable":true,"enumerable":true,"get": function onkeyup_get(){debugger;return "null"},"set": function onkeyup_set(){debugger;},});
Object.defineProperty(Document.prototype, "onload",{"configurable":true,"enumerable":true,"get": function onload_get(){debugger;return "null"},"set": function onload_set(){debugger;},});
Object.defineProperty(Document.prototype, "onloadeddata",{"configurable":true,"enumerable":true,"get": function onloadeddata_get(){debugger;return "null"},"set": function onloadeddata_set(){debugger;},});
Object.defineProperty(Document.prototype, "onloadedmetadata",{"configurable":true,"enumerable":true,"get": function onloadedmetadata_get(){debugger;return "null"},"set": function onloadedmetadata_set(){debugger;},});
Object.defineProperty(Document.prototype, "onloadstart",{"configurable":true,"enumerable":true,"get": function onloadstart_get(){debugger;return "null"},"set": function onloadstart_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmousedown",{"configurable":true,"enumerable":true,"get": function onmousedown_get(){debugger;return "null"},"set": function onmousedown_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmouseenter",{"configurable":true,"enumerable":true,"get": function onmouseenter_get(){debugger;return "null"},"set": function onmouseenter_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmouseleave",{"configurable":true,"enumerable":true,"get": function onmouseleave_get(){debugger;return "null"},"set": function onmouseleave_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmousemove",{"configurable":true,"enumerable":true,"get": function onmousemove_get(){debugger;return "null"},"set": function onmousemove_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmouseout",{"configurable":true,"enumerable":true,"get": function onmouseout_get(){debugger;return "null"},"set": function onmouseout_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmouseover",{"configurable":true,"enumerable":true,"get": function onmouseover_get(){debugger;return "null"},"set": function onmouseover_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmouseup",{"configurable":true,"enumerable":true,"get": function onmouseup_get(){debugger;return "null"},"set": function onmouseup_set(){debugger;},});
Object.defineProperty(Document.prototype, "onmousewheel",{"configurable":true,"enumerable":true,"get": function onmousewheel_get(){debugger;return "null"},"set": function onmousewheel_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpause",{"configurable":true,"enumerable":true,"get": function onpause_get(){debugger;return "null"},"set": function onpause_set(){debugger;},});
Object.defineProperty(Document.prototype, "onplay",{"configurable":true,"enumerable":true,"get": function onplay_get(){debugger;return "null"},"set": function onplay_set(){debugger;},});
Object.defineProperty(Document.prototype, "onplaying",{"configurable":true,"enumerable":true,"get": function onplaying_get(){debugger;return "null"},"set": function onplaying_set(){debugger;},});
Object.defineProperty(Document.prototype, "onprogress",{"configurable":true,"enumerable":true,"get": function onprogress_get(){debugger;return "null"},"set": function onprogress_set(){debugger;},});
Object.defineProperty(Document.prototype, "onratechange",{"configurable":true,"enumerable":true,"get": function onratechange_get(){debugger;return "null"},"set": function onratechange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onreset",{"configurable":true,"enumerable":true,"get": function onreset_get(){debugger;return "null"},"set": function onreset_set(){debugger;},});
Object.defineProperty(Document.prototype, "onresize",{"configurable":true,"enumerable":true,"get": function onresize_get(){debugger;return "null"},"set": function onresize_set(){debugger;},});
Object.defineProperty(Document.prototype, "onscroll",{"configurable":true,"enumerable":true,"get": function onscroll_get(){debugger;return "null"},"set": function onscroll_set(){debugger;},});
Object.defineProperty(Document.prototype, "onsecuritypolicyviolation",{"configurable":true,"enumerable":true,"get": function onsecuritypolicyviolation_get(){debugger;return "null"},"set": function onsecuritypolicyviolation_set(){debugger;},});
Object.defineProperty(Document.prototype, "onseeked",{"configurable":true,"enumerable":true,"get": function onseeked_get(){debugger;return "null"},"set": function onseeked_set(){debugger;},});
Object.defineProperty(Document.prototype, "onseeking",{"configurable":true,"enumerable":true,"get": function onseeking_get(){debugger;return "null"},"set": function onseeking_set(){debugger;},});
Object.defineProperty(Document.prototype, "onselect",{"configurable":true,"enumerable":true,"get": function onselect_get(){debugger;return "null"},"set": function onselect_set(){debugger;},});
Object.defineProperty(Document.prototype, "onslotchange",{"configurable":true,"enumerable":true,"get": function onslotchange_get(){debugger;return "null"},"set": function onslotchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onstalled",{"configurable":true,"enumerable":true,"get": function onstalled_get(){debugger;return "null"},"set": function onstalled_set(){debugger;},});
Object.defineProperty(Document.prototype, "onsubmit",{"configurable":true,"enumerable":true,"get": function onsubmit_get(){debugger;return "null"},"set": function onsubmit_set(){debugger;},});
Object.defineProperty(Document.prototype, "onsuspend",{"configurable":true,"enumerable":true,"get": function onsuspend_get(){debugger;return "null"},"set": function onsuspend_set(){debugger;},});
Object.defineProperty(Document.prototype, "ontimeupdate",{"configurable":true,"enumerable":true,"get": function ontimeupdate_get(){debugger;return "null"},"set": function ontimeupdate_set(){debugger;},});
Object.defineProperty(Document.prototype, "ontoggle",{"configurable":true,"enumerable":true,"get": function ontoggle_get(){debugger;return "null"},"set": function ontoggle_set(){debugger;},});
Object.defineProperty(Document.prototype, "onvolumechange",{"configurable":true,"enumerable":true,"get": function onvolumechange_get(){debugger;return "null"},"set": function onvolumechange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwaiting",{"configurable":true,"enumerable":true,"get": function onwaiting_get(){debugger;return "null"},"set": function onwaiting_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwebkitanimationend",{"configurable":true,"enumerable":true,"get": function onwebkitanimationend_get(){debugger;return "null"},"set": function onwebkitanimationend_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwebkitanimationiteration",{"configurable":true,"enumerable":true,"get": function onwebkitanimationiteration_get(){debugger;return "null"},"set": function onwebkitanimationiteration_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwebkitanimationstart",{"configurable":true,"enumerable":true,"get": function onwebkitanimationstart_get(){debugger;return "null"},"set": function onwebkitanimationstart_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwebkittransitionend",{"configurable":true,"enumerable":true,"get": function onwebkittransitionend_get(){debugger;return "null"},"set": function onwebkittransitionend_set(){debugger;},});
Object.defineProperty(Document.prototype, "onwheel",{"configurable":true,"enumerable":true,"get": function onwheel_get(){debugger;return "null"},"set": function onwheel_set(){debugger;},});
Object.defineProperty(Document.prototype, "onauxclick",{"configurable":true,"enumerable":true,"get": function onauxclick_get(){debugger;return "null"},"set": function onauxclick_set(){debugger;},});
Object.defineProperty(Document.prototype, "ongotpointercapture",{"configurable":true,"enumerable":true,"get": function ongotpointercapture_get(){debugger;return "null"},"set": function ongotpointercapture_set(){debugger;},});
Object.defineProperty(Document.prototype, "onlostpointercapture",{"configurable":true,"enumerable":true,"get": function onlostpointercapture_get(){debugger;return "null"},"set": function onlostpointercapture_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerdown",{"configurable":true,"enumerable":true,"get": function onpointerdown_get(){debugger;return "null"},"set": function onpointerdown_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointermove",{"configurable":true,"enumerable":true,"get": function onpointermove_get(){debugger;return "null"},"set": function onpointermove_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerrawupdate",{"configurable":true,"enumerable":true,"get": function onpointerrawupdate_get(){debugger;return "null"},"set": function onpointerrawupdate_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerup",{"configurable":true,"enumerable":true,"get": function onpointerup_get(){debugger;return "null"},"set": function onpointerup_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointercancel",{"configurable":true,"enumerable":true,"get": function onpointercancel_get(){debugger;return "null"},"set": function onpointercancel_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerover",{"configurable":true,"enumerable":true,"get": function onpointerover_get(){debugger;return "null"},"set": function onpointerover_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerout",{"configurable":true,"enumerable":true,"get": function onpointerout_get(){debugger;return "null"},"set": function onpointerout_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerenter",{"configurable":true,"enumerable":true,"get": function onpointerenter_get(){debugger;return "null"},"set": function onpointerenter_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpointerleave",{"configurable":true,"enumerable":true,"get": function onpointerleave_get(){debugger;return "null"},"set": function onpointerleave_set(){debugger;},});
Object.defineProperty(Document.prototype, "onselectstart",{"configurable":true,"enumerable":true,"get": function onselectstart_get(){debugger;return "null"},"set": function onselectstart_set(){debugger;},});
Object.defineProperty(Document.prototype, "onselectionchange",{"configurable":true,"enumerable":true,"get": function onselectionchange_get(){debugger;return "null"},"set": function onselectionchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onanimationend",{"configurable":true,"enumerable":true,"get": function onanimationend_get(){debugger;return "null"},"set": function onanimationend_set(){debugger;},});
Object.defineProperty(Document.prototype, "onanimationiteration",{"configurable":true,"enumerable":true,"get": function onanimationiteration_get(){debugger;return "null"},"set": function onanimationiteration_set(){debugger;},});
Object.defineProperty(Document.prototype, "onanimationstart",{"configurable":true,"enumerable":true,"get": function onanimationstart_get(){debugger;return "null"},"set": function onanimationstart_set(){debugger;},});
Object.defineProperty(Document.prototype, "ontransitionrun",{"configurable":true,"enumerable":true,"get": function ontransitionrun_get(){debugger;return "null"},"set": function ontransitionrun_set(){debugger;},});
Object.defineProperty(Document.prototype, "ontransitionstart",{"configurable":true,"enumerable":true,"get": function ontransitionstart_get(){debugger;return "null"},"set": function ontransitionstart_set(){debugger;},});
Object.defineProperty(Document.prototype, "ontransitionend",{"configurable":true,"enumerable":true,"get": function ontransitionend_get(){debugger;return "null"},"set": function ontransitionend_set(){debugger;},});
Object.defineProperty(Document.prototype, "ontransitioncancel",{"configurable":true,"enumerable":true,"get": function ontransitioncancel_get(){debugger;return "null"},"set": function ontransitioncancel_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncopy",{"configurable":true,"enumerable":true,"get": function oncopy_get(){debugger;return "null"},"set": function oncopy_set(){debugger;},});
Object.defineProperty(Document.prototype, "oncut",{"configurable":true,"enumerable":true,"get": function oncut_get(){debugger;return "null"},"set": function oncut_set(){debugger;},});
Object.defineProperty(Document.prototype, "onpaste",{"configurable":true,"enumerable":true,"get": function onpaste_get(){debugger;return "null"},"set": function onpaste_set(){debugger;},});
Object.defineProperty(Document.prototype, "children",{"configurable":true,"enumerable":true,"get": function children_get(){debugger;return "[object HTMLCollection]"},set:undefined, });
Object.defineProperty(Document.prototype, "firstElementChild",{"configurable":true,"enumerable":true,"get": function firstElementChild_get(){debugger;return "[object HTMLHtmlElement]"},set:undefined, });
Object.defineProperty(Document.prototype, "lastElementChild",{"configurable":true,"enumerable":true,"get": function lastElementChild_get(){debugger;return "[object HTMLHtmlElement]"},set:undefined, });
Object.defineProperty(Document.prototype, "childElementCount",{"configurable":true,"enumerable":true,"get": function childElementCount_get(){debugger;return "1"},set:undefined, });
Object.defineProperty(Document.prototype, "activeElement",{"configurable":true,"enumerable":true,"get": function activeElement_get(){debugger;return "[object HTMLBodyElement]"},set:undefined, });
Object.defineProperty(Document.prototype, "styleSheets",{"configurable":true,"enumerable":true,"get": function styleSheets_get(){debugger;return "[object StyleSheetList]"},set:undefined, });
Object.defineProperty(Document.prototype, "pointerLockElement",{"configurable":true,"enumerable":true,"get": function pointerLockElement_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "fullscreenElement",{"configurable":true,"enumerable":true,"get": function fullscreenElement_get(){debugger;return "null"},"set": function fullscreenElement_set(){debugger;},});
Object.defineProperty(Document.prototype, "adoptedStyleSheets",{"configurable":true,"enumerable":true,"get": function adoptedStyleSheets_get(){debugger;return ""},"set": function adoptedStyleSheets_set(){debugger;},});
Object.defineProperty(Document.prototype, "pictureInPictureElement",{"configurable":true,"enumerable":true,"get": function pictureInPictureElement_get(){debugger;return "null"},set:undefined, });
Object.defineProperty(Document.prototype, "fonts",{"configurable":true,"enumerable":true,"get": function fonts_get(){debugger;return "[object FontFaceSet]"},set:undefined, });
Object.defineProperty(Document.prototype, "adoptNode",{"configurable":true,"enumerable":true,"writable":true,"value": function adoptNode(){debugger;},});dogvm.safefunction(Document.prototype.adoptNode);
Object.defineProperty(Document.prototype, "append",{"configurable":true,"enumerable":true,"writable":true,"value": function append(){debugger;},});dogvm.safefunction(Document.prototype.append);
Object.defineProperty(Document.prototype, "captureEvents",{"configurable":true,"enumerable":true,"writable":true,"value": function captureEvents(){debugger;},});dogvm.safefunction(Document.prototype.captureEvents);
Object.defineProperty(Document.prototype, "caretRangeFromPoint",{"configurable":true,"enumerable":true,"writable":true,"value": function caretRangeFromPoint(){debugger;},});dogvm.safefunction(Document.prototype.caretRangeFromPoint);
Object.defineProperty(Document.prototype, "clear",{"configurable":true,"enumerable":true,"writable":true,"value": function clear(){debugger;},});dogvm.safefunction(Document.prototype.clear);
Object.defineProperty(Document.prototype, "close",{"configurable":true,"enumerable":true,"writable":true,"value": function close(){debugger;},});dogvm.safefunction(Document.prototype.close);
Object.defineProperty(Document.prototype, "createAttribute",{"configurable":true,"enumerable":true,"writable":true,"value": function createAttribute(){debugger;},});dogvm.safefunction(Document.prototype.createAttribute);
Object.defineProperty(Document.prototype, "createAttributeNS",{"configurable":true,"enumerable":true,"writable":true,"value": function createAttributeNS(){debugger;},});dogvm.safefunction(Document.prototype.createAttributeNS);
Object.defineProperty(Document.prototype, "createCDATASection",{"configurable":true,"enumerable":true,"writable":true,"value": function createCDATASection(){debugger;},});dogvm.safefunction(Document.prototype.createCDATASection);
Object.defineProperty(Document.prototype, "createComment",{"configurable":true,"enumerable":true,"writable":true,"value": function createComment(){debugger;},});dogvm.safefunction(Document.prototype.createComment);
Object.defineProperty(Document.prototype, "createDocumentFragment",{"configurable":true,"enumerable":true,"writable":true,"value": function createDocumentFragment(){debugger;},});dogvm.safefunction(Document.prototype.createDocumentFragment);
Object.defineProperty(Document.prototype, "createElement",{"configurable":true,"enumerable":true,"writable":true,"value": function createElement(){debugger;},});dogvm.safefunction(Document.prototype.createElement);
Object.defineProperty(Document.prototype, "createElementNS",{"configurable":true,"enumerable":true,"writable":true,"value": function createElementNS(){debugger;},});dogvm.safefunction(Document.prototype.createElementNS);
Object.defineProperty(Document.prototype, "createEvent",{"configurable":true,"enumerable":true,"writable":true,"value": function createEvent(){debugger;},});dogvm.safefunction(Document.prototype.createEvent);
Object.defineProperty(Document.prototype, "createExpression",{"configurable":true,"enumerable":true,"writable":true,"value": function createExpression(){debugger;},});dogvm.safefunction(Document.prototype.createExpression);
Object.defineProperty(Document.prototype, "createNSResolver",{"configurable":true,"enumerable":true,"writable":true,"value": function createNSResolver(){debugger;},});dogvm.safefunction(Document.prototype.createNSResolver);
Object.defineProperty(Document.prototype, "createNodeIterator",{"configurable":true,"enumerable":true,"writable":true,"value": function createNodeIterator(){debugger;},});dogvm.safefunction(Document.prototype.createNodeIterator);
Object.defineProperty(Document.prototype, "createProcessingInstruction",{"configurable":true,"enumerable":true,"writable":true,"value": function createProcessingInstruction(){debugger;},});dogvm.safefunction(Document.prototype.createProcessingInstruction);
Object.defineProperty(Document.prototype, "createRange",{"configurable":true,"enumerable":true,"writable":true,"value": function createRange(){debugger;},});dogvm.safefunction(Document.prototype.createRange);
Object.defineProperty(Document.prototype, "createTextNode",{"configurable":true,"enumerable":true,"writable":true,"value": function createTextNode(){debugger;},});dogvm.safefunction(Document.prototype.createTextNode);
Object.defineProperty(Document.prototype, "createTreeWalker",{"configurable":true,"enumerable":true,"writable":true,"value": function createTreeWalker(){debugger;},});dogvm.safefunction(Document.prototype.createTreeWalker);
Object.defineProperty(Document.prototype, "elementFromPoint",{"configurable":true,"enumerable":true,"writable":true,"value": function elementFromPoint(){debugger;},});dogvm.safefunction(Document.prototype.elementFromPoint);
Object.defineProperty(Document.prototype, "elementsFromPoint",{"configurable":true,"enumerable":true,"writable":true,"value": function elementsFromPoint(){debugger;},});dogvm.safefunction(Document.prototype.elementsFromPoint);
Object.defineProperty(Document.prototype, "evaluate",{"configurable":true,"enumerable":true,"writable":true,"value": function evaluate(){debugger;},});dogvm.safefunction(Document.prototype.evaluate);
Object.defineProperty(Document.prototype, "execCommand",{"configurable":true,"enumerable":true,"writable":true,"value": function execCommand(){debugger;},});dogvm.safefunction(Document.prototype.execCommand);
Object.defineProperty(Document.prototype, "exitFullscreen",{"configurable":true,"enumerable":true,"writable":true,"value": function exitFullscreen(){debugger;},});dogvm.safefunction(Document.prototype.exitFullscreen);
Object.defineProperty(Document.prototype, "exitPictureInPicture",{"configurable":true,"enumerable":true,"writable":true,"value": function exitPictureInPicture(){debugger;},});dogvm.safefunction(Document.prototype.exitPictureInPicture);
Object.defineProperty(Document.prototype, "exitPointerLock",{"configurable":true,"enumerable":true,"writable":true,"value": function exitPointerLock(){debugger;},});dogvm.safefunction(Document.prototype.exitPointerLock);
Object.defineProperty(Document.prototype, "getAnimations",{"configurable":true,"enumerable":true,"writable":true,"value": function getAnimations(){debugger;},});dogvm.safefunction(Document.prototype.getAnimations);
Object.defineProperty(Document.prototype, "getElementsByClassName",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByClassName(){debugger;},});dogvm.safefunction(Document.prototype.getElementsByClassName);
Object.defineProperty(Document.prototype, "getElementsByName",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByName(){debugger;},});dogvm.safefunction(Document.prototype.getElementsByName);
Object.defineProperty(Document.prototype, "getElementsByTagName",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByTagName(){debugger;},});dogvm.safefunction(Document.prototype.getElementsByTagName);
Object.defineProperty(Document.prototype, "getElementsByTagNameNS",{"configurable":true,"enumerable":true,"writable":true,"value": function getElementsByTagNameNS(){debugger;},});dogvm.safefunction(Document.prototype.getElementsByTagNameNS);
Object.defineProperty(Document.prototype, "getSelection",{"configurable":true,"enumerable":true,"writable":true,"value": function getSelection(){debugger;},});dogvm.safefunction(Document.prototype.getSelection);
Object.defineProperty(Document.prototype, "hasFocus",{"configurable":true,"enumerable":true,"writable":true,"value": function hasFocus(){debugger;},});dogvm.safefunction(Document.prototype.hasFocus);
Object.defineProperty(Document.prototype, "hasStorageAccess",{"configurable":true,"enumerable":true,"writable":true,"value": function hasStorageAccess(){debugger;},});dogvm.safefunction(Document.prototype.hasStorageAccess);
Object.defineProperty(Document.prototype, "hasUnpartitionedCookieAccess",{"configurable":true,"enumerable":true,"writable":true,"value": function hasUnpartitionedCookieAccess(){debugger;},});dogvm.safefunction(Document.prototype.hasUnpartitionedCookieAccess);
Object.defineProperty(Document.prototype, "importNode",{"configurable":true,"enumerable":true,"writable":true,"value": function importNode(){debugger;},});dogvm.safefunction(Document.prototype.importNode);
Object.defineProperty(Document.prototype, "open",{"configurable":true,"enumerable":true,"writable":true,"value": function open(){debugger;},});dogvm.safefunction(Document.prototype.open);
Object.defineProperty(Document.prototype, "prepend",{"configurable":true,"enumerable":true,"writable":true,"value": function prepend(){debugger;},});dogvm.safefunction(Document.prototype.prepend);
Object.defineProperty(Document.prototype, "queryCommandEnabled",{"configurable":true,"enumerable":true,"writable":true,"value": function queryCommandEnabled(){debugger;},});dogvm.safefunction(Document.prototype.queryCommandEnabled);
Object.defineProperty(Document.prototype, "queryCommandIndeterm",{"configurable":true,"enumerable":true,"writable":true,"value": function queryCommandIndeterm(){debugger;},});dogvm.safefunction(Document.prototype.queryCommandIndeterm);
Object.defineProperty(Document.prototype, "queryCommandState",{"configurable":true,"enumerable":true,"writable":true,"value": function queryCommandState(){debugger;},});dogvm.safefunction(Document.prototype.queryCommandState);
Object.defineProperty(Document.prototype, "queryCommandSupported",{"configurable":true,"enumerable":true,"writable":true,"value": function queryCommandSupported(){debugger;},});dogvm.safefunction(Document.prototype.queryCommandSupported);
Object.defineProperty(Document.prototype, "queryCommandValue",{"configurable":true,"enumerable":true,"writable":true,"value": function queryCommandValue(){debugger;},});dogvm.safefunction(Document.prototype.queryCommandValue);
Object.defineProperty(Document.prototype, "querySelector",{"configurable":true,"enumerable":true,"writable":true,"value": function querySelector(){debugger;},});dogvm.safefunction(Document.prototype.querySelector);
Object.defineProperty(Document.prototype, "querySelectorAll",{"configurable":true,"enumerable":true,"writable":true,"value": function querySelectorAll(){debugger;},});dogvm.safefunction(Document.prototype.querySelectorAll);
Object.defineProperty(Document.prototype, "releaseEvents",{"configurable":true,"enumerable":true,"writable":true,"value": function releaseEvents(){debugger;},});dogvm.safefunction(Document.prototype.releaseEvents);
Object.defineProperty(Document.prototype, "replaceChildren",{"configurable":true,"enumerable":true,"writable":true,"value": function replaceChildren(){debugger;},});dogvm.safefunction(Document.prototype.replaceChildren);
Object.defineProperty(Document.prototype, "requestStorageAccess",{"configurable":true,"enumerable":true,"writable":true,"value": function requestStorageAccess(){debugger;},});dogvm.safefunction(Document.prototype.requestStorageAccess);
Object.defineProperty(Document.prototype, "requestStorageAccessFor",{"configurable":true,"enumerable":true,"writable":true,"value": function requestStorageAccessFor(){debugger;},});dogvm.safefunction(Document.prototype.requestStorageAccessFor);
Object.defineProperty(Document.prototype, "startViewTransition",{"configurable":true,"enumerable":true,"writable":true,"value": function startViewTransition(){debugger;},});dogvm.safefunction(Document.prototype.startViewTransition);
Object.defineProperty(Document.prototype, "webkitCancelFullScreen",{"configurable":true,"enumerable":true,"writable":true,"value": function webkitCancelFullScreen(){debugger;},});dogvm.safefunction(Document.prototype.webkitCancelFullScreen);
Object.defineProperty(Document.prototype, "webkitExitFullscreen",{"configurable":true,"enumerable":true,"writable":true,"value": function webkitExitFullscreen(){debugger;},});dogvm.safefunction(Document.prototype.webkitExitFullscreen);
Object.defineProperty(Document.prototype, "write",{"configurable":true,"enumerable":true,"writable":true,"value": function write(){debugger;},});dogvm.safefunction(Document.prototype.write);
Object.defineProperty(Document.prototype, "writeln",{"configurable":true,"enumerable":true,"writable":true,"value": function writeln(){debugger;},});dogvm.safefunction(Document.prototype.writeln);
Object.defineProperty(Document.prototype, "fragmentDirective",{"configurable":true,"enumerable":true,"get": function fragmentDirective_get(){debugger;return "[object FragmentDirective]"},set:undefined, });
Object.defineProperty(Document.prototype, "browsingTopics",{"configurable":true,"enumerable":true,"writable":true,"value": function browsingTopics(){debugger;},});dogvm.safefunction(Document.prototype.browsingTopics);
Object.defineProperty(Document.prototype, "hasPrivateToken",{"configurable":true,"enumerable":true,"writable":true,"value": function hasPrivateToken(){debugger;},});dogvm.safefunction(Document.prototype.hasPrivateToken);
Object.defineProperty(Document.prototype, "hasRedemptionRecord",{"configurable":true,"enumerable":true,"writable":true,"value": function hasRedemptionRecord(){debugger;},});dogvm.safefunction(Document.prototype.hasRedemptionRecord);
Object.defineProperty(Document.prototype, "onscrollend",{"configurable":true,"enumerable":true,"get": function onscrollend_get(){debugger;return "null"},"set": function onscrollend_set(){debugger;},});
Object.defineProperty(Document.prototype, "onscrollsnapchange",{"configurable":true,"enumerable":true,"get": function onscrollsnapchange_get(){debugger;return "null"},"set": function onscrollsnapchange_set(){debugger;},});
Object.defineProperty(Document.prototype, "onscrollsnapchanging",{"configurable":true,"enumerable":true,"get": function onscrollsnapchanging_get(){debugger;return "null"},"set": function onscrollsnapchanging_set(){debugger;},});
Object.defineProperty(Document.prototype, "caretPositionFromPoint",{"configurable":true,"enumerable":true,"writable":true,"value": function caretPositionFromPoint(){debugger;},});dogvm.safefunction(Document.prototype.caretPositionFromPoint);


Object.defineProperty(Document.prototype, "head",{"configurable":true,"enumerable":true,
    "get": function head_get(){
        debugger;
        return HTMLHeadElement.headDog;
    },set:undefined, });


Object.defineProperty(Document.prototype, "body",{"configurable":true,"enumerable":true,
    "get": function body_get(){
    debugger;return HTMLBodyElement.bodyDog;
},"set": function body_set(){debugger;},});


Object.defineProperty(Document.prototype, "documentElement",{"configurable":true,"enumerable":true,
    "get": function documentElement_get(){
        debugger;return HTMLHtmlElement.createHtmlElementDog();
    },set:undefined, });

Object.defineProperty(Document.prototype, "getElementById",{"configurable":true,"enumerable":true,"writable":true,"value": 
    function getElementById(id) {
        debugger;
        let element = dogvm.memory.htmlId.find(e => e.id === id);
        // 先判断是否创建过 没有创建过就去创建 创建过的去内存寻址
        for (const [key, value] of dogvm.memory.htmlNode ) {
            for(let p in value){
                if (value[p] instanceof Element && value[p].getAttribute("id") == id) {
                    return value[p];
                }
            }
        }

        if (element) {
            let a = document.createElement(element.tag);
            a._id = element.id;
            a._tagName = element.tag;
            a.innerHTML = element.content;
            a.parentList = element.parentList;
            return a;
        }
        return null;
},});dogvm.safefunction(Document.prototype.getElementById);

var my_cookie_dog = "";
Object.defineProperty(Document.prototype, "cookie",{"configurable":true,"enumerable":true,
    "get": function cookie_get(){
        debugger;
        return my_cookie_dog;
    },
    "set": function cookie_set(value){
        debugger;
        console.log("cookie设置:",value)
        my_cookie_dog = value;
        return value;
    },});

//////////////////////////


// HTMLDocument
var HTMLDocument = function HTMLDocument(){
    throw new TypeError("Illegal constructor");
};dogvm.safefunction(HTMLDocument);

Object.defineProperties(HTMLDocument.prototype, {
    [Symbol.toStringTag]: {
        value: "HTMLDocument",
        configurable: true
    }
});
HTMLDocument.prototype.__proto__ = Document.prototype;


// document
document = {};
document.__proto__ = HTMLDocument.prototype;

// document属性方法
document.createElement = function createElement(tagName) {
    debugger
    tagName = tagName.toLowerCase();
    tagName = tagName.replace(/\d+/g, '')
    if (dogvm.memory.htmlelements[tagName] == undefined) {
        debugger;
    } else {
        var tagElement = dogvm.memory.htmlelements[tagName]();
        tagElement._tagName = tagName;
        return dogvm.proxy(tagElement);
    }
};
dogvm.safefunction(document.createElement);

document.location = location;
Object.defineProperty(document, "_reactListeningmdo4y3a4jz",{"configurable":true,"enumerable":true,"writable":true,"value":true,});
Object.defineProperty(document, "form_name_1735543137199",{"configurable":true,"enumerable":true,"writable":true,"value":{},});


document = dogvm.proxy(document);
debugger;
var www = [];
var pp = '';
window._VFlbHlWFMQdJikXRHNcSQPgckbDEdNXd = function() {
    return new Date()
}
;
window._lNWjZQKGKGZfgRFBWXbKCjJCHiUkeWEj = function(a, b) {
    return Date[a].apply(Date, b)
}
;
window.cTFDTEhSkQHajBcbGDGNPDfgKnUREkfh = 'Fvexx8T1+LS/kezKig7voe06fC6r/mbPjrjxSWUntEda651lJlYCeneC1ngpyfBupaU0DLrusESbyq+1dO6GvISM2yCnNyzuZtGKc2HEAMcQnqS8UONtTUV3vjI1hn6FEKVq9r6A+r0+SmASsRwTZ+HjNLzCYmyU5PQjI6lG3QeI1OpbhQ4XmLY+C3lYHoeV7pdUQY9V38yYGVFdpTqyKEaq39PSgK2W5Xp73AI1bxQ=';
var __TENCENT_CHAOS_STACK = function() {
    function __TENCENT_CHAOS_VM(m, c, w, I, h, M, n, U) {
        var Q, E = !I, S = (m = +m,
        c = c || [0],
        I = I || [[this], [{}]],
        h = h || {},
        []), J = null;
        function B() {
            return function(E, S, J) {
                return new (Function.bind.apply(E, S))
            }
            .apply(null, arguments)
        }
        Function.prototype.bind || (Q = [].slice,
        Function.prototype.bind = function(E) {
            if ("function" != typeof this)
                throw new TypeError("bind101");
            var S = Q.call(arguments, 1)
              , J = S.length
              , B = this
              , R = function() {}
              , A = function() {
                return S.length = J,
                S.push.apply(S, arguments),
                B.apply(R.prototype.isPrototypeOf(this) ? this : E, S)
            };
            return this.prototype && (R.prototype = this.prototype),
            A.prototype = new R,
            A
        }
        );
        for (var R = [function() {
            I[I.length - 1] = w[I[I.length - 1]]
        }
        , , , function() {
            var E = c[m++]
              , S = E ? I.slice(-E) : [];
            I.length -= E,
            value = I.pop().apply(w, S),
            I.push(value),
            console.log("0:"+value+" m:"+m+" w:"+w+" S:"+S);
            if(typeof value == 'string' && (value.includes('cd') || value.includes("https://pintia.cn/auth/login?redirect=%2F") || m == 34589) || m == 34276 ){
                if(m==34276){
                    pp = value;
                }else www.push(value);
            }
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] - I.pop()
        }
        , function() {
            I.push([I.pop(), I.pop()].reverse())
        }
        , function() {
            var E = c[m++];
            I[I.length - 1] && (m = E);
        }
        , function() {
            I.push([c[m++]])
        }
        , function() {
            I[I.length - 2] = I[I.length - 2]in I.pop()
        }
        , , function() {
            I[I.length - 2] = I[I.length - 2] * I.pop()
        }
        , , function() {
            I[I.length - 2] = I[I.length - 2] > I.pop()
        }
        , function() {
            I.push([w, I.pop()])
        }
        , function() {
            return !!J
        }
        , function() {
            var E = c[m++]
              , S = E ? I.slice(-E) : [];
            I.length -= E,
            S.unshift(null),
            value = B(I.pop(), S);
            I.push(value)
        }
        , function() {
            S.push([c[m++], I.length, c[m++]])
        }
        , function() {
            I.pop()
        }
        , function() {
            I[I.length - 1] += String.fromCharCode(c[m++]);
        }
        , function() {
            for (var J = c[m++], B = [], E = c[m++], S = c[m++], R = [], A = 0; A < E; A++)
                B[c[m++]] = I[c[m++]];
            for (A = 0; A < S; A++)
                R[A] = c[m++];
            I.push(function Q() {
                var E = B.slice(0);
                E[0] = [this],
                E[1] = [arguments],
                E[2] = [Q];
                for (var S = 0; S < R.length && S < arguments.length; S++)
                    0 < R[S] && (E[R[S]] = [arguments[S]]);
                // console.log(J, c, w, E, h, M, n, U);
                return __TENCENT_CHAOS_VM(J, c, w, E, h, M, n, U)
            })
        }
        , function() {
            I.push(!0)
        }
        , function() {
            var E = I.pop()
              , S = I.pop();
            I.push([S[0][S[1]], E])
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] | I.pop()
        }
        , function() {
            var E = c[m++]
              , S = E ? I.slice(-E) : []
              , E = (I.length -= E,
            S.unshift(null),
            I.pop());
            I.push(B(E[0][E[1]], S))
        }
        , function() {
            I[I[I.length - 2][0]][0] = I[I.length - 1]
        }
        , function() {
            var E = I.pop();
            I.push(delete E[0][E[1]])
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] / I.pop()
        }
        , function() {
            throw I[I.length - 1]
        }
        , function() {
            I.push("")
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] + I.pop()
        }
        , function() {
            I.push(!1)
        }
        , function() {
            var E, S = [];
            for (E in I.pop())
                S.push(E);
            I.push(S)
        }
        , , function() {
            m = c[m++]
        }
        , function() {
            var E = I[I.length - 2];
            E[0][E[1]] = I[I.length - 1];
        }
        , function() {
            I.push(!I.pop())
        }
        , function() {
            var E = c[m++]
              , S = I[I.length - 2 - E];
            I[I.length - 2 - E] = I.pop(),
            I.push(S)
        }
        , function() {
            var E = c[m++];
            I[E] = I[E] === undefined ? [] : I[E]
        }
        , , function() {
            I[I.length - 2] = I[I.length - 2] & I.pop()
        }
        , function() {
            I.push(I[I.pop()[0]][0])
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] ^ I.pop()
        }
        , function() {
            I.push(undefined)
        }
        , function() {
            I.push(null)
        }
        , , function() {
            I[I.length - 2] = I[I.length - 2] >>> I.pop()
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] >> I.pop()
        }
        , function() {
            I[I.length - 1] = c[m++]
        }
        , function() {
            I.push(I[I.length - 1])
        }
        , function() {
            I.push(c[m++])
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] % I.pop()
        }
        , function() {
            return !0
        }
        , function() {
            I.push(I[c[m++]][0])
        }
        , function() {
            J = null
        }
        , , function() {
            var E = I.pop();
            I.push([I[I.pop()][0], E])
        }
        , , , function() {
            I.length = c[m++]
        }
        , , , function() {
            I[I.length - 1].length ? I.push(I[I.length - 1].shift(), !0) : I.push(undefined, !1)
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] == I.pop()
        }
        , function() {
            I.push(typeof I.pop())
        }
        , function() {
            S.pop()
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] === I.pop()
        }
        , function() {
            var E = c[m++]
              , S = E ? I.slice(-E) : []
              , E = (I.length -= E,
            I.pop());
            let opp = E[0][E[1]].apply(E[0], S);
            I.push(opp);
            console.log("1:"+opp+" S:"+S);
        }
        , function() {
            var E = I.pop();
            I.push(E[0][E[1]])
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] << I.pop()
        }
        , function() {
            I[I.length - 2] = I[I.length - 2] >= I.pop()
        }
        ]; ; )
            try {
                for (var A = !1; !A; )
                    A = R[c[m++]]();
                if (J)
                    throw J;
                return E ? (I.pop(),
                I.slice(3 + __TENCENT_CHAOS_VM.v)) : I.pop()
            } catch (H) {
                var x = S.pop();
                if (x === undefined)
                    throw H;
                J = H,
                m = x[0],
                I.length = x[1],
                x[2] && (I[x[2]][0] = J)
            }
    }
    function h(E) {
        for (var S, J, B = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split(""), R = String(E).replace(/[=]+$/, ""), A = 0, Q = 0, m = ""; J = R.charAt(Q++); ~J && (S = A % 4 ? 64 * S + J : J,
        A++ % 4) && (m += String.fromCharCode(255 & S >> (-2 * A & 6))))
            J = function(E, S, J) {
                if ("function" == typeof Array.prototype.indexOf)
                    return Array.prototype.indexOf.call(E, S, J);
                var B;
                if (null == E)
                    throw new TypeError('"array" is null or not defined');
                var R = Object(E)
                  , A = R.length >>> 0;
                if (0 != A) {
                    E = 0 | J;
                    if (!(A <= E))
                        for (B = Math.max(0 <= E ? E : A - Math.abs(E), 0); B < A; B++)
                            if (B in R && R[B] === S)
                                return B
                }
                return -1
            }(B, J);
        return m
    }
    return __TENCENT_CHAOS_VM.v = 0,
    __TENCENT_CHAOS_VM(0, function(E) {
        var S = E[0]
          , J = E[1]
          , B = []
          , R = h(S)
          , A = J.shift()
          , Q = J.shift()
          , m = 0;
        function c() {
            for (; m === A; )
                B.push(Q),
                m++,
                A = J.shift(),
                Q = J.shift()
        }
        for (var w = 0; w < R.length; w++) {
            var I = R.charAt(w).charCodeAt(0);
            c(),
            B.push(I),
            m++
        }
        return c(),
        B
    }(["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bxJjEnUSbRJlEm4SdA0cEmMSchJlEmESdBJlEkUSbBJlEm0SZRJuEnQVHBJkEmkSdkIBGBERHBJkEm8SYxJ1Em0SZRJuEnQNHBJiEm8SZBJ5FRwSYRJwEnASZRJuEmQSQxJoEmkSbBJkFTQEQgERBwQcEmkSbhJuEmUSchJIElQSTRJMNxwSPBJwEiASYxJsEmEScxJzEj0SIhJmEmkSchJzEnQScBIiEj4SZhJpEnIScxJ0EnASPBIvEnASPhIKEiASIBIgEiASIBIgEiASIBI8EnASIBJpEmQSPRIiEnMSZRJjEm8SbhJkEnASIhI+EnMSZRJjEm8SbhJkEnASPBIvEnASPhIKEiASIBIgEiASIBIgEiASIBI8EnASIBJjEmwSYRJzEnMSPRIiEnQSaBJpEnISZBJwEiISPhJ0EmgSaRJyEmQScBI8Ei8ScBI+EgoSIBIgEiASIBIgEiASIBIgEjwSaBIyEj4SChIgEiASIBIgEiASIBIgEiASIBIgEjwScxJwEmESbhIgEmMSbBJhEnMScxI9EiISZhJvEm8SIhI+EmYSbxJvEjwSLxJzEnASYRJuEj4SChIgEiASIBIgEiASIBIgEiASIBIgEjwScxJwEmESbhIgEmMSbBJhEnMScxI9EiISYhJhEnISIhIgEmkSZBI9EiISYhJhEnISIhI+EmISYRJyEjwSLxJzEnASYRJuEj4SChIgEiASIBIgEiASIBIgEiASPBIvEmgSMhI+IhERBwUcEmQSbxJjEnUSbRJlEm4SdA0cEmMSchJlEmESdBJlEkUSbBJlEm0SZRJuEnQVHBJzEnQSeRJsEmVCARgREQcFHBJpEm4SbhJlEnISSBJUEk0STDccEmISbxJkEnkSIBI6Em4SbxJ0EigSLhJmEmkSchJzEnQScBIsEiASLhJ0EmgSaRJyEmQScBIpEiASexIKEiASIBIgEiASIBIgEiASIBJjEm8SbBJvEnISOhIgEmISbBJ1EmUSOxIKEiASIBIgEiASIBIgEn0SChIgEiASIBIgEiASIBJoEjISIBI6Em4SbxJ0EigScxJwEmESbhIuEmYSbxJvEikSIBJ7EgoSIBIgEiASIBIgEiASIBIgEmMSbxJsEm8SchI6EiASchJlEmQSOxIKEiASIBIgEiASIBIgEn0iEREcEmQSbxJjEnUSbRJlEm4SdA0c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", [5, 1518, 303, 445, 329, 334, 332, 443, 446, 305, 464, 798, 509, 513, 511, 553, 554, 559, 557, 693, 799, 466, 813, 1233, 833, 838, 836, 850, 857, 862, 860, 866, 873, 877, 875, 895, 896, 900, 898, 903, 904, 908, 906, 934, 935, 940, 938, 944, 1122, 1126, 1124, 1145, 1146, 1151, 1149, 1229, 1157, 1163, 1161, 1225, 1182, 1197, 1198, 1184, 1223, 1155, 1227, 1229, 1234, 815, 1251, 1374, 1266, 1270, 1268, 1296, 1297, 1318, 1300, 1309, 1310, 1302, 1316, 1352, 1320, 1346, 1347, 1322, 1375, 1253, 1391, 1482, 1483, 1393, 1542, 2085, 1702, 1814, 1706, 2082, 1742, 1801, 1802, 1744, 1812, 2082, 1817, 1704, 1865, 1928, 1929, 1867, 2086, 1544, 2100, 2914, 2211, 2760, 2272, 2276, 2274, 2293, 2294, 2668, 2347, 1e9, 2400, 1e9, 2494, 2498, 2496, 2583, 2602, 1e3, 2666, 2758, 2736, 2741, 2739, 2758, 2750, 1e3, 2761, 2213, 2785, 2839, 2840, 2787, 2868, 2877, 2878, 2870, 2915, 2102, 2929, 4091, 2946, 3425, 3204, 3214, 3208, 3422, 3212, 3422, 3217, 3206, 3261, 3266, 3264, 3316, 3362, 3367, 3365, 3421, 3428, 2948, 3437, 3990, 3586, 3591, 3589, 3764, 3631, 3636, 3634, 3659, 3754, 3764, 3758, 3981, 3762, 3981, 3767, 3756, 3811, 3816, 3814, 3868, 3914, 3919, 3917, 3980, 3925, 3977, 3985, 3989, 3993, 3439, 4092, 2931, 4106, 6614, 4157, 4296, 4175, 4180, 4178, 4183, 4214, 4218, 4219, 4224, 4222, 4294, 4250, 4255, 4253, 4290, 4288, 4242, 4299, 4159, 4308, 4888, 4416, 4421, 4419, 4840, 4437, 4442, 4440, 4446, 4444, 4817, 4522, 4533, 4531, 4553, 4560, 4565, 4563, 4577, 4589, 4768, 4596, 4621, 4622, 4747, 4641, 4686, 4649, 4672, 4670, 4701, 4684, 4701, 4694, 4697, 4720, 4725, 4723, 4817, 4737, 4740, 4745, 4817, 4766, 4817, 4788, 4794, 4792, 4801, 4815, 4817, 4838, 4393, 4891, 4310, 4908, 5046, 4945, 5027, 4972, 4977, 4975, 5044, 4983, 4989, 4987, 5020, 5018, 4981, 5022, 5044, 5025, 5044, 5049, 4910, 5062, 5151, 5100, 5105, 5103, 5149, 5147, 5077, 5154, 5064, 5163, 5457, 5205, 5210, 5208, 5382, 5232, 5237, 5235, 5285, 5301, 5306, 5304, 5324, 5336, 5341, 5339, 5359, 5380, 5182, 5412, 5417, 5415, 5455, 5453, 5389, 5460, 5165, 5510, 5514, 5512, 5563, 5564, 5741, 5567, 5733, 5578, 5582, 5580, 5616, 5617, 5621, 5619, 5664, 5665, 5669, 5667, 5709, 5710, 5718, 5716, 5732, 5734, 5569, 5739, 5760, 5743, 5755, 5756, 5745, 6184, 6563, 6220, 6291, 6224, 6512, 6289, 6512, 6294, 6222, 6308, 6342, 6343, 6348, 6346, 6354, 6534, 6553, 6554, 6536, 6564, 6186, 6615, 4108, 6629, 7002, 6654, 6771, 6663, 6763, 6764, 6665, 6772, 6656, 7003, 6631, 7017, 7058, 7059, 7019, 7073, 10020, 7098, 7207, 7132, 7137, 7135, 7203, 7201, 7124, 7210, 7100, 7218, 7298, 7301, 7220, 7309, 9145, 7372, 7422, 7383, 7393, 7387, 7419, 7391, 7419, 7396, 7385, 7423, 7374, 7433, 7483, 7444, 7454, 7448, 7480, 7452, 7480, 7457, 7446, 7484, 7435, 7494, 7544, 7505, 7515, 7509, 7541, 7513, 7541, 7518, 7507, 7545, 7496, 7560, 7685, 7596, 7601, 7599, 7673, 7671, 7588, 7686, 7562, 7711, 7761, 7722, 7732, 7726, 7758, 7730, 7758, 7735, 7724, 7762, 7713, 7777, 7902, 7813, 7818, 7816, 7890, 7888, 7805, 7903, 7779, 7933, 8055, 7969, 7974, 7972, 8043, 8041, 7961, 8056, 7935, 8086, 8210, 8124, 8129, 8127, 8198, 8196, 8116, 8211, 8088, 8241, 8366, 8277, 8282, 8280, 8354, 8352, 8269, 8367, 8243, 8397, 8522, 8433, 8438, 8436, 8510, 8508, 8425, 8523, 8399, 8548, 8598, 8559, 8569, 8563, 8595, 8567, 8595, 8572, 8561, 8599, 8550, 8609, 8659, 8620, 8630, 8624, 8656, 8628, 8656, 8633, 8622, 8660, 8611, 8675, 8797, 8711, 8716, 8714, 8785, 8783, 8703, 8798, 8677, 8828, 8952, 8866, 8871, 8869, 8940, 8938, 8858, 8953, 8830, 9007, 9012, 9010, 9137, 9135, 8984, 9148, 7311, 9169, 9523, 9215, 84941944608, 9221, 9226, 9224, 9501, 9240, 9316, 9250, 9282, 9280, 9347, 9309, 1908009, 9314, 9347, 9343, 1447426, 9362, 2654435769, 9375, 9460, 9388, 9423, 9421, 9494, 9453, 1908009, 9458, 9494, 9490, 1447426, 9499, 9214, 9526, 9171, 9564, 9933, 9567, 9928, 9783, 9798, 9799, 9804, 9802, 9924, 9836, .75, 9851, 9856, 9854, 9865, 9922, 9759, 9929, 9569, 9993, 10008, 10009, 9995, 10021, 7075, 10034, 11165, 11166, 10036, 11180, 11314, 11236, 11302, 11303, 11238, 11315, 11182, 11329, 11756, 11352, 11602, 11366, 11371, 11369, 11374, 11381, 11423, 11385, 11598, 11421, 11598, 11426, 11383, 11605, 11354, 11696, 11740, 11723, 11736, 11741, 11698, 11757, 11331, 11771, 12163, 11786, 12129, 11799, 11811, 11803, 12126, 11809, 12126, 11814, 11801, 11922, 11987, 12113, 12118, 12116, 12123, 12132, 11788, 12164, 11773, 12178, 12355, 12193, 12320, 12323, 12195, 12356, 12180, 12370, 12483, 12439, 12469, 12470, 12441, 12484, 12372, 12498, 12739, 12598, 12602, 12600, 12687, 12706, 1e3, 12740, 12500, 12754, 12950, 12810, 12938, 12925, 12931, 12929, 12934, 12939, 12812, 12951, 12756, 12965, 13165, 13091, 13151, 13118, 13126, 13124, 13130, 13152, 13093, 13166, 12967, 13180, 13312, 13236, 13300, 13301, 13238, 13313, 13182, 13327, 15356, 13358, 15072, 13399, 13404, 13402, 13408, 13454, 13457, 14643, 14827, 14654, 14666, 14658, 14824, 14664, 14824, 14669, 14656, 14812, 14817, 14815, 14821, 14828, 14645, 15021, 15026, 15024, 15069, 15034, 15039, 15037, 15046, 15067, 14998, 15075, 13360, 15168, 15198, 15172, 15210, 15196, 15210, 15201, 15170, 15255, 15342, 15266, 15300, 15270, 15339, 15298, 15339, 15303, 15268, 15343, 15257, 15357, 13329, 15371, 15953, 15386, 15919, 15405, 15417, 15409, 15916, 15415, 15916, 15420, 15407, 15697, 15722, 15723, 15726, 15877, 15881, 15879, 15914, 15922, 15388, 15954, 15373, 15968, 16866, 15983, 16832, 16008, 16020, 16012, 16829, 16018, 16829, 16023, 16010, 16483, 16486, 16819, 16823, 16821, 16827, 16835, 15985, 16867, 15970, 16881, 17395, 16896, 17361, 16915, 16927, 16919, 17358, 16925, 17358, 16930, 16917, 17229, 17232, 17364, 16898, 17396, 16883, 17410, 17467, 17425, 17433, 17436, 17427, 17468, 17412, 17482, 18481, 17497, 18447, 17522, 17534, 17526, 18444, 17532, 18444, 17537, 17524, 18285, 18310, 18311, 18314, 18450, 17499, 18482, 17484, 18496, 18910, 18546, 18550, 18548, 18576, 18587, 18597, 18591, 18780, 18595, 18780, 18600, 18589, 18648, 18652, 18650, 18778, 18746, 18765, 18766, 18748, 18825, 18894, 18881, 18887, 18885, 18890, 18895, 18827, 18911, 18498, 18925, 19516, 18942, 19153, 18953, 18965, 18957, 19150, 18963, 19150, 18968, 18955, 19063, 19067, 19065, 19137, 19092, 19103, 19101, 19123, 19138, 19143, 19141, 19147, 19156, 18944, 19200, 19204, 19202, 19253, 19254, 19431, 19257, 19423, 19268, 19272, 19270, 19306, 19307, 19311, 19309, 19354, 19355, 19359, 19357, 19399, 19400, 19408, 19406, 19422, 19424, 19259, 19429, 19450, 19433, 19445, 19446, 19435, 19517, 18927, 19531, 20538, 19550, 20260, 19567, 19609, 19571, 20257, 19607, 20257, 19612, 19569, 19687, 19700, 19691, 19742, 19698, 19742, 19703, 19689, 20263, 19552, 20274, 20418, 20313, 20318, 20316, 20322, 20421, 20276, 20478, 20522, 20505, 20518, 20523, 20480, 20539, 19533, 20553, 20650, 20609, 20638, 20639, 20611, 20651, 20555, 20665, 21021, 20682, 20807, 20693, 20750, 20697, 20804, 20700, 20710, 20704, 20745, 20708, 20745, 20713, 20702, 20748, 20804, 20753, 20695, 20810, 20684, 20866, 21005, 20883, 20893, 20887, 20980, 20891, 20980, 20896, 20885, 20962, 20967, 20965, 20979, 21006, 20868, 21022, 20667, 21036, 21151, 21105, 21137, 21138, 21107, 21152, 21038, 21166, 22600, 21193, 21478, 21202, 21212, 21206, 21475, 21210, 21475, 21215, 21204, 21281, 21464, 21296, 21306, 21300, 21461, 21304, 21461, 21309, 21298, 21394, 21399, 21397, 21460, 21429, 21434, 21432, 21460, 21465, 21283, 21481, 21195, 21490, 21676, 21617, 21622, 21620, 21625, 21664, 21668, 21666, 21675, 21679, 21492, 21686, 21741, 21744, 21688, 21852, 21860, 21861, 21854, 21870, 21878, 21879, 21872, 21912, 21993, 21947, 21951, 21949, 21984, 21994, 21914, 22025, 22106, 22060, 22064, 22062, 22097, 22107, 22027, 22118, 22433, 22127, 22137, 22131, 22430, 22135, 22430, 22140, 22129, 22169, 22408, 22178, 22221, 22182, 22405, 22219, 22405, 22224, 22180, 22231, 22236, 22234, 22277, 22284, 22289, 22287, 22324, 22409, 22171, 22434, 22120, 22474, 22589, 22485, 22498, 22489, 22586, 22496, 22586, 22501, 22487, 22590, 22476, 22601, 21168, 22615, 22768, 22724, 22754, 22755, 22726, 22769, 22617, 22783, 22977, 22845, 22882, 22883, 22886, 22933, 22963, 22964, 22935, 22978, 22785, 22992, 23153, 23048, 23141, 23134, 23137, 23142, 23050, 23154, 22994, 23168, 23271, 23224, 23259, 23260, 23226, 23272, 23170, 23286, 24090, 23355, 24076, 23438, 23515, 23516, 23571, 23616, 23695, 23696, 23753, 23761, 23881, 23874, 23884, 23879, 23884, 23892, 24014, 24007, 24017, 24012, 24017, 24077, 23357, 24091, 23288, 24105, 24203, 24161, 24191, 24186, 1589649962, 24192, 24163, 24204, 24107, 24218, 24641, 24241, 24487, 24255, 24260, 24258, 24263, 24270, 24312, 24274, 24483, 24310, 24483, 24315, 24272, 24490, 24243, 24581, 24625, 24608, 24621, 24626, 24583, 24642, 24220, 24656, 31897, 24699, 24795, 24750, 24787, 24788, 24752, 24798, 24701, 24806, 24915, 24839, 24907, 24861, 24876, 24877, 24888, 24889, 24902, 24905, 24909, 24918, 24808, 24929, 24983, 24986, 24931, 24995, 25054, 25057, 24997, 25066, 25094, 25097, 25068, 25106, 26754, 25129, 25139, 25133, 26750, 25137, 26750, 25142, 25131, 25925, 25935, 25929, 26672, 25933, 26672, 25938, 25927, 26120, 26124, 26122, 26302, 26303, 26307, 26305, 26483, 26484, 26488, 26486, 26668, 26757, 25108, 26764, 28206, 26787, 26797, 26791, 28202, 26795, 28202, 26800, 26789, 27747, 27757, 27751, 28124, 27755, 28124, 27760, 27749, 27944, 27948, 27946, 28120, 28209, 26766, 28216, 28620, 28233, 28243, 28237, 28616, 28241, 28616, 28246, 28235, 28363, 28479, 28480, 28612, 28623, 28218, 28630, 28929, 28647, 28657, 28651, 28925, 28655, 28925, 28660, 28649, 28785, 28921, 28932, 28632, 28939, 29896, 28960, 28970, 28964, 29892, 28968, 29892, 28973, 28962, 29670, 29709, 29710, 29747, 29748, 29793, 29899, 28941, 29906, 29969, 29972, 29908, 29979, 30078, 30034, 30038, 30036, 30077, 30081, 29981, 30090, 30446, 30214, 30436, 30243, 30248, 30246, 30251, 30302, 30339, 30340, 30304, 30391, 30396, 30394, 30434, 30423, 30428, 30426, 30371, 30432, 30371, 30437, 30216, 30447, 30092, 30458, 30981, 30607, 30612, 30610, 30671, 30658, 30584, 30661, 30671, 30665, 30973, 30669, 30973, 30674, 30663, 30700, 30704, 30702, 30746, 30747, 30752, 30750, 30972, 30789, 30794, 30792, 30972, 30819, 30879, 30877, 30933, 30939, 30944, 30942, 30949, 30970, 30766, 30982, 30460, 30995, 31264, 31016, 31026, 31020, 31260, 31024, 31260, 31029, 31018, 31265, 30997, 31316, 31865, 31329, 31339, 31333, 31840, 31337, 31840, 31342, 31331, 31866, 31318, 31898, 24658, 31912, 32303, 31933, 32143, 32025, 32029, 32027, 32114, 32133, 1e3, 32146, 31935, 32259, 32289, 32290, 32261, 32304, 31914, 32318, 32504, 32333, 32467, 32399, 32420, 32418, 32465, 32470, 32335, 32505, 32320, 32519, 32654, 32575, 32642, 32643, 32577, 32655, 32521, 32669, 34689, 32708, 33199, 32725, 32754, 32764, 32769, 32767, 33197, 32810, 32856, 32854, 32900, 33011, 33015, 33013, 33100, 33202, 32710, 33220, 33611, 33291, 33296, 33294, 33552, 33314, 33450, 33448, 33522, 33550, 33268, 33614, 33222, 33720, 33726, 33724, 33729, 33844, 33848, 33846, 33933, 33996, 34229, 34038, 34149, 34126, 34168, 34147, 34168, 34230, 33998, 34252, 34610, 34317, 34322, 34320, 34410, 34408, 34294, 34494, 34499, 34497, 34565, 34525, 34530, 34528, 34565, 34563, 34517, 34611, 34254, 34637, 34673, 34674, 34639, 34690, 32671, 34704, 36740, 34725, 35222, 34777, 34781, 34779, 34815, 34816, 34821, 34819, 35179, 34923, 34927, 34925, 34962, 34963, 35016, 35014, 35165, 35022, 35068, 35066, 35088, 35096, 35142, 35140, 35162, 35225, 34727, 35235, 35774, 35301, 35305, 35303, 35353, 35354, 35359, 35357, 35731, 35475, 35479, 35477, 35514, 35515, 35568, 35566, 35717, 35574, 35620, 35618, 35640, 35648, 35694, 35692, 35714, 35777, 35237, 35787, 36570, 35895, 35899, 35897, 35934, 35935, 35988, 35986, 36137, 35994, 36040, 36038, 36060, 36068, 36114, 36112, 36134, 36153, 36464, 36156, 36180, 36160, 36460, 36178, 36460, 36183, 36158, 36190, 36312, 36278, 36342, 36310, 36342, 36462, 36527, 36470, 36477, 36475, 36493, 36501, 36508, 36506, 36524, 36573, 35789, 36741, 34706, 36755, 37136, 36792, 37127, 36932, 36937, 36935, 37125, 37006, 37010, 37008, 37043, 37044, 37049, 37047, 37052, 37105, 37109, 37107, 37116, 37117, 37122, 37120, 37125, 37128, 36794, 37137, 36757, 37151, 37616, 37166, 37517, 37179, 37197, 37183, 37514, 37195, 37514, 37200, 37181, 37486, 37504, 37502, 37512, 37520, 37168, 37570, 37602, 37603, 37572, 37617, 37153, 37631, 38200, 37650, 38063, 37667, 37679, 37671, 38060, 37677, 38060, 37682, 37669, 37770, 37774, 37772, 37859, 37954, 38e3, 37998, 38055, 38066, 37652, 38079, 38089, 38083, 38095, 38087, 38095, 38092, 38081, 38140, 38184, 38167, 38180, 38185, 38142, 38201, 37633, 38215, 40316, 38234, 40048, 38259, 38515, 38274, 38284, 38278, 38512, 38282, 38512, 38287, 38276, 38489, 38494, 38492, 38502, 38518, 38261, 38604, 38663, 38664, 38721, 38722, 38787, 39306, 39318, 39310, 39337, 39316, 39337, 39321, 39308, 39371, 39459, 39403, 39408, 39406, 39457, 39460, 39373, 39516, 39671, 39520, 39783, 39561, 39644, 39614, 39622, 39623, 39616, 39627, 39635, 39636, 39629, 39645, 39563, 39652, 39660, 39661, 39654, 39669, 39783, 39674, 39518, 39715, 39772, 39773, 39717, 39807, 40033, 39818, 39857, 39822, 40030, 39855, 40030, 39860, 39820, 39947, 40019, 40004, 40009, 40007, 40017, 40020, 39949, 40034, 39809, 40042, 1e3, 40051, 38236, 40065, 40075, 40069, 40227, 40073, 40227, 40078, 40067, 40083, 40216, 40194, 40206, 40204, 40214, 40217, 40085, 40272, 40302, 40303, 40274, 40317, 38217, 40331, 40624, 40387, 40612, 40495, 40499, 40497, 40584, 40603, 1e3, 40613, 40389, 40625, 40333, 40639, 40991, 40752, 40977, 40771, 40775, 40773, 40793, 40794, 40799, 40797, 40928, 40830, 40835, 40833, 40883, 40881, 40807, 40978, 40754, 40992, 40641, 41006, 41814, 41021, 41706, 41040, 41050, 41044, 41703, 41048, 41703, 41053, 41042, 41275, 41283, 41281, 41321, 41395, 41403, 41401, 41443, 41515, 41523, 41521, 41527, 41619, 41627, 41625, 41695, 41686, 41692, 41690, 41695, 41709, 41023, 41759, 41800, 41801, 41761, 41815, 41008, 41829, 41948, 41894, 41934, 41935, 41896, 41949, 41831, 41963, 42490, 41984, 42149, 41997, 42001, 41999, 42023, 42024, 42029, 42027, 42147, 42152, 41986, 42246, 42310, 42311, 42248, 42331, 42424, 42425, 42333, 42447, 42476, 42477, 42449, 42491, 41965, 42505, 42542, 42543, 42507, 42557, 43465, 42583, 42593, 42587, 42731, 42591, 42731, 42596, 42585, 42604, 42609, 42607, 42730, 42611, 42621, 42615, 42648, 42619, 42648, 42624, 42613, 42643, 547796023, 42681, 547796023, 42685, 42690, 42688, 42698, 42776, 43451, 42789, 42806, 42793, 43426, 42804, 43426, 42809, 42791, 42862, 1e8, 42962, 43e3, 43001, 43031, 43032, 43417, 43102, 43179, 43265, 43270, 43268, 43278, 43308, 43385, 43415, 43425, 43452, 42778, 43466, 42559, 43480, 43754, 43584, 43740, 43611, 43617, 43615, 43736, 43741, 43586, 43755, 43482, 43769, 44100, 43790, 43915, 43801, 43858, 43805, 43912, 43808, 43818, 43812, 43853, 43816, 43853, 43821, 43810, 43856, 43912, 43861, 43803, 43918, 43792, 43942, 43952, 43946, 44011, 43950, 44011, 43955, 43944, 44056, 44086, 44087, 44058, 44101, 43771, 44115, 44261, 44130, 44226, 44143, 44148, 44146, 44222, 44183, 44188, 44186, 44222, 44229, 44132, 44262, 44117, 44276, 44391, 44345, 44377, 44378, 44347, 44392, 44278, 44406, 44505, 44423, 44458, 44446, 44451, 44449, 44455, 44461, 44425, 44506, 44408, 44520, 44758, 44586, 44603, 44624, 256, 44627, 44632, 44630, 44670, 44714, 44744, 44745, 44716, 44759, 44522, 44773, 45138, 44798, 44815, 44818, 44800, 44828, 44837, 44840, 44830, 44849, 44949, 44860, 44870, 44864, 44946, 44868, 44946, 44873, 44862, 44952, 44851, 44964, 45023, 44973, 44990, 44977, 45020, 44988, 45020, 44993, 44975, 45026, 44966, 45139, 44775, 45153, 45526, 45168, 45491, 45191, 45195, 45193, 45211, 45212, 45217, 45215, 45407, 45397, 45407, 45401, 45487, 45405, 45487, 45410, 45399, 45466, 45471, 45469, 45486, 45494, 45170, 45527, 45155, 45541, 45866, 45556, 45832, 45835, 45558, 45867, 45543]]), window)
}();
__TENCENT_CHAOS_STACK.g = function() {
    return __TENCENT_CHAOS_STACK.shift()[0]
}
;

debugger;

dogvm.print.getAll();
// mousemove 事件调用  340   242.857    (30-90,236-250)    1.97647  (332,266)   (187.5,150.2)
// 函数实现，参数 n 单位 毫秒 ；
function sleep ( n ) {
    var start = new Date().getTime() ;
    while ( true ) {
        if ( new Date( ).getTime( ) - start > n ) {
            // 使用  break  实现；
            break;
        }
    }
}

function generateTrajectoryWithRandomStart(startRange, end, frames) {
    /**
     * 生成从快到慢的轨迹数组，起点随机生成在范围内
     *
     * @param {Array} startRange 起点范围 [[xMin, xMax], [yMin, yMax]]
     * @param {Array} end 终点坐标 [x, y]
     * @param {number} frames 轨迹分为的帧数，越大轨迹越平滑
     * @return {Array} 轨迹点数组，每个点是 [x, y]
     */
    // 随机生成起点
    const start = [
        Math.random() * (startRange[0][1] - startRange[0][0]) + startRange[0][0],
        Math.random() * (startRange[1][1] - startRange[1][0]) + startRange[1][0],
    ];
    
    console.log(`随机生成起点: [${start[0].toFixed(2)}, ${start[1].toFixed(2)}]`);
    
    const trajectory = [];
    const totalDistance = [end[0] - start[0], end[1] - start[1]]; // 计算总位移

    for (let i = 0; i <= frames; i++) {
        const t = i / frames; // 当前帧归一化时间 (0 ~ 1)
        const progress = 1 - Math.pow(1 - t, 2); // 减速公式

        // 计算当前点位置
        const currentPosition = [
            start[0] + progress * totalDistance[0],
            start[1] + progress * totalDistance[1],
        ];
        trajectory.push(currentPosition);
    }
    
    return trajectory;
}

// 示例使用
const startRange = [[30, 90], [236, 250]]; // 起点范围
const end = [200, 300]; // 终点
const frames = 60; // 轨迹分为 60 帧

const trajectory = generateTrajectoryWithRandomStart(startRange, end, frames);

// 输出轨迹
// trajectory.forEach((point, index) => {
//     console.log(`Frame ${index}: [${point[0].toFixed(2)}, ${point[1].toFixed(2)}]`);
// });

data = {
    "screenX": 544,
    "screenY": 534,
    "clientX": 35,
    "clientY": 240,
    "movementX": 0,
    "movementY": 0,
    "pageX": 35,
    "pageY": 240,
    "offsetX": 35,
    "offsetY": 240,
};
mouseList = [data];
// sleep(1000+Math.random()*1000);
for(let i = 0;i<frames;i++){
    data.movementX = trajectory[i][0] - data.clientX;
    data.movementY = trajectory[i][1] - data.clientY;
    data.screenX = data.screenX + data.movementX;
    data.screenY = data.screenX + data.movementY;
    data.clientX = trajectory[i][0];
    data.clientY = trajectory[i][1];
    data.pageX = data.clientX;
    data.pageY = data.clientY;
    data.offsetX = data.clientX;
    data.offsetY = data.clientY;
    my_mouse = MouseEvent.getMeDog(data);
    dogvm.memory.listeners["mousemove"][0](my_mouse);
    // if(i==0 || i==1) {
    //     sleep(100 + Math.random() * 10);
    // }
    // else{
    //     sleep(Math.random()*10);
    // }
}
// window.setData 
t = {ft: 'qf_7Pf__H'};
window.TDC.setData(t);

const dtt = window.TDC.getData();
[decodeURIComponent(dtt), decodeURIComponent(dtt).length, window.TDC.getInfo(), www];
// return window.dt;