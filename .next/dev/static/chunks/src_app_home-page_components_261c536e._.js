(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/home-page/components/Switch.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "Switch-module__fEbDlG__active",
  "hiddenInput": "Switch-module__fEbDlG__hiddenInput",
  "knob": "Switch-module__fEbDlG__knob",
  "label": "Switch-module__fEbDlG__label",
  "switch": "Switch-module__fEbDlG__switch",
  "wrapper": "Switch-module__fEbDlG__wrapper",
});
}),
"[project]/src/app/home-page/components/Switch.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/app/home-page/components/Switch.module.css [app-client] (css module)");
"use client";
;
;
;
;
function Switch(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(15);
    if ($[0] !== "76299f8d098a401b2201851ad2d2cde3ed0ff58d2e91560ec65d9979fc437709") {
        for(let $i = 0; $i < 15; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "76299f8d098a401b2201851ad2d2cde3ed0ff58d2e91560ec65d9979fc437709";
    }
    const { checked, onChange, label } = t0;
    const t1 = `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].switch} ${checked ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ""}`;
    let t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].knob
        }, void 0, false, {
            fileName: "[project]/src/app/home-page/components/Switch.jsx",
            lineNumber: 22,
            columnNumber: 10
        }, this);
        $[1] = t2;
    } else {
        t2 = $[1];
    }
    let t3;
    if ($[2] !== t1) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            children: t2
        }, void 0, false, {
            fileName: "[project]/src/app/home-page/components/Switch.jsx",
            lineNumber: 29,
            columnNumber: 10
        }, this);
        $[2] = t1;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    let t4;
    if ($[4] !== onChange) {
        t4 = ({
            "Switch[<input>.onChange]": (e)=>onChange(e.target.checked)
        })["Switch[<input>.onChange]"];
        $[4] = onChange;
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] !== checked || $[7] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
            type: "checkbox",
            checked: checked,
            onChange: t4,
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hiddenInput
        }, void 0, false, {
            fileName: "[project]/src/app/home-page/components/Switch.jsx",
            lineNumber: 47,
            columnNumber: 10
        }, this);
        $[6] = checked;
        $[7] = t4;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== label) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
            children: label
        }, void 0, false, {
            fileName: "[project]/src/app/home-page/components/Switch.jsx",
            lineNumber: 56,
            columnNumber: 10
        }, this);
        $[9] = label;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== t3 || $[12] !== t5 || $[13] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wrapper,
            children: [
                t3,
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/home-page/components/Switch.jsx",
            lineNumber: 64,
            columnNumber: 10
        }, this);
        $[11] = t3;
        $[12] = t5;
        $[13] = t6;
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    return t7;
}
_c = Switch;
var _c;
__turbopack_context__.k.register(_c, "Switch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_home-page_components_261c536e._.js.map