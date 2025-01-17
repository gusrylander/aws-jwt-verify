// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
//
// NodeJS implementation for fetching JSON documents over HTTPS
import { request } from "https";
import { validateHttpsJsonResponse } from "./https-common.js";
import { pipeline } from "stream";
import { TextDecoder } from "util";
import { safeJsonParse } from "./safe-json-parse.js";
import { FetchError, NonRetryableFetchError } from "./error.js";
/**
 * Execute a HTTPS request
 * @param uri - The URI
 * @param requestOptions - The RequestOptions to use
 * @param data - Data to send to the URI (e.g. POST data)
 * @returns - The response as parsed JSON
 */
export async function fetchJson(uri, requestOptions, data) {
    let responseTimeout;
    return new Promise((resolve, reject) => {
        const req = request(uri, {
            method: "GET",
            ...requestOptions,
        }, (response) => {
            // Capture response data
            // @types/node is incomplete so cast to any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pipeline([
                response,
                getJsonDestination(uri, response.statusCode, response.headers),
            ], done);
        });
        if (requestOptions?.responseTimeout) {
            responseTimeout = setTimeout(() => done(new FetchError(uri, `Response time-out (after ${requestOptions.responseTimeout} ms.)`)), requestOptions.responseTimeout);
            responseTimeout.unref(); // Don't block Node from exiting
        }
        function done(...args) {
            if (responseTimeout)
                clearTimeout(responseTimeout);
            if (args[0] == null) {
                resolve(args[1]);
                return;
            }
            // In case of errors, let the Agent (if any) know to abandon the socket
            // This is probably best, because the socket may have become stale
            /* istanbul ignore next */
            req.socket?.emit("agentRemove");
            // Turn error into FetchError so the URI is nicely captured in the message
            let error = args[0];
            if (!(error instanceof FetchError)) {
                error = new FetchError(uri, error.message);
            }
            req.destroy();
            reject(error);
        }
        // Handle errors while sending request
        req.on("error", done);
        // Signal end of request (include optional data)
        req.end(data);
    });
}
/**
 * Ensures the HTTPS response contains valid JSON
 *
 * @param uri - The URI you were requesting
 * @param statusCode - The response status code to your HTTPS request
 * @param headers - The response headers to your HTTPS request
 *
 * @returns - Async function that can be used as destination in a stream.pipeline, it will return the JSON, if valid, or throw an error otherwise
 */
function getJsonDestination(uri, statusCode, headers) {
    return async (responseIterable) => {
        validateHttpsJsonResponse(uri, statusCode, headers["content-type"]);
        const collected = [];
        for await (const chunk of responseIterable) {
            collected.push(chunk);
        }
        try {
            return safeJsonParse(new TextDecoder("utf8", { fatal: true, ignoreBOM: true }).decode(Buffer.concat(collected)));
        }
        catch (err) {
            throw new NonRetryableFetchError(uri, err);
        }
    };
}
