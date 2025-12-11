module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/app/home-page/components/Switch.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "Switch-module__fEbDlG__active",
  "hiddenInput": "Switch-module__fEbDlG__hiddenInput",
  "knob": "Switch-module__fEbDlG__knob",
  "label": "Switch-module__fEbDlG__label",
  "switch": "Switch-module__fEbDlG__switch",
  "wrapper": "Switch-module__fEbDlG__wrapper",
});
}),
"[project]/src/app/home-page/components/Switch.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/app/home-page/components/Switch.module.css [app-ssr] (css module)");
"use client";
;
;
;
function Switch({ checked, onChange, label }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].wrapper,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].switch} ${checked ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].active : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].knob
                }, void 0, false, {
                    fileName: "[project]/src/app/home-page/components/Switch.jsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/home-page/components/Switch.jsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "checkbox",
                checked: checked,
                onChange: (e)=>onChange(e.target.checked),
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hiddenInput
            }, void 0, false, {
                fileName: "[project]/src/app/home-page/components/Switch.jsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$home$2d$page$2f$components$2f$Switch$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                children: label
            }, void 0, false, {
                fileName: "[project]/src/app/home-page/components/Switch.jsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/home-page/components/Switch.jsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0a2e1c4f._.js.map