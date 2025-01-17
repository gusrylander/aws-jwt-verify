"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
//
// Utility to parse JSON safely
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJsonParse = exports.isJsonObject = void 0;
/**
 * Check if a piece of JSON is a JSON object, and not e.g. a mere string or null
 *
 * @param j - the JSON
 */
function isJsonObject(j) {
    // It is not enough to check that `typeof j === "object"`
    // because in JS `typeof null` is also "object", and so is `typeof []`.
    // So we need to check that j is an object, and not null, and not an array
    return typeof j === "object" && !Array.isArray(j) && j !== null;
}
exports.isJsonObject = isJsonObject;
/**
 * Parse a string as JSON, while removing __proto__ and constructor, so JS prototype pollution is prevented
 *
 * @param s - the string to JSON parse
 */
function safeJsonParse(s) {
    return JSON.parse(s, (_, value) => {
        if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            delete value.__proto__;
            delete value.constructor;
        }
        return value;
    });
}
exports.safeJsonParse = safeJsonParse;
