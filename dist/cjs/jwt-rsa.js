"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyObjectCache = exports.JwtRsaVerifier = exports.JwtRsaVerifierBase = exports.verifyJwtSync = exports.verifyJwt = void 0;
const jwk_js_1 = require("./jwk.js");
const assert_js_1 = require("./assert.js");
const jwt_model_js_1 = require("./jwt-model.js");
const jwt_js_1 = require("./jwt.js");
const error_js_1 = require("./error.js");
const _node_web_compat_1 = require("#node-web-compat");
/**
 * Sanity check the JWT header and the selected JWK
 *
 * @param header: the JWT header (decoded and JSON parsed)
 * @param jwk: the JWK
 */
function validateJwtHeaderAndJwk(header, jwk) {
    // Check that the JWK is in fact a JWK for RSA signatures
    (0, jwk_js_1.assertIsRsaSignatureJwk)(jwk);
    // Check that JWT signature algorithm matches JWK
    if (jwk.alg) {
        (0, assert_js_1.assertStringEquals)("JWT signature algorithm", header.alg, jwk.alg, error_js_1.JwtInvalidSignatureAlgorithmError);
    }
    // Check JWT signature algorithm is one of the supported signature algorithms
    (0, assert_js_1.assertStringArrayContainsString)("JWT signature algorithm", header.alg, jwt_model_js_1.supportedSignatureAlgorithms, error_js_1.JwtInvalidSignatureAlgorithmError);
}
/**
 * Verify a JWT asynchronously (thus allowing for the JWKS to be fetched from the JWKS URI)
 *
 * @param jwt The JWT
 * @param jwksUri The JWKS URI, where the JWKS can be fetched from
 * @param options Verification options
 * @returns Promise that resolves to the payload of the JWT––if the JWT is valid, otherwise the promise rejects
 */
async function verifyJwt(jwt, jwksUri, options) {
    return verifyDecomposedJwt((0, jwt_js_1.decomposeJwt)(jwt), jwksUri, options);
}
exports.verifyJwt = verifyJwt;
/**
 * Verify (asynchronously) a JWT that is already decomposed (by function `decomposeJwt`)
 *
 * @param decomposedJwt The decomposed JWT
 * @param jwksUri The JWKS URI, where the JWKS can be fetched from
 * @param options Verification options
 * @param jwkFetcher A function that can execute the fetch of the JWKS from the JWKS URI
 * @param transformJwkToKeyObjectFn A function that can transform a JWK into a crypto native key object
 * @returns Promise that resolves to the payload of the JWT––if the JWT is valid, otherwise the promise rejects
 */
async function verifyDecomposedJwt(decomposedJwt, jwksUri, options, jwkFetcher = jwk_js_1.fetchJwk, transformJwkToKeyObjectFn = _node_web_compat_1.nodeWebCompat.transformJwkToKeyObjectAsync) {
    const { header, headerB64, payload, payloadB64, signatureB64 } = decomposedJwt;
    const jwk = await jwkFetcher(jwksUri, decomposedJwt);
    validateJwtHeaderAndJwk(decomposedJwt.header, jwk);
    // Transform the JWK to native key format, that can be used with verifySignature
    const keyObject = await transformJwkToKeyObjectFn(jwk, header.alg, payload.iss);
    // Verify the JWT signature
    const valid = await _node_web_compat_1.nodeWebCompat.verifySignatureAsync({
        jwsSigningInput: `${headerB64}.${payloadB64}`,
        signature: signatureB64,
        alg: header.alg,
        keyObject,
    });
    if (!valid) {
        throw new error_js_1.JwtInvalidSignatureError("Invalid signature");
    }
    try {
        (0, jwt_js_1.validateJwtFields)(payload, options);
        if (options.customJwtCheck) {
            await options.customJwtCheck({ header, payload, jwk });
        }
    }
    catch (err) {
        if (options.includeRawJwtInErrors && err instanceof error_js_1.JwtInvalidClaimError) {
            throw err.withRawJwt(decomposedJwt);
        }
        throw err;
    }
    return payload;
}
/**
 * Verify a JWT synchronously, using a JWKS or JWK that has already been fetched
 *
 * @param jwt The JWT
 * @param jwkOrJwks The JWKS that includes the right JWK (indexed by kid). Alternatively, provide the right JWK directly
 * @param options Verification options
 * @param transformJwkToKeyObjectFn A function that can transform a JWK into a crypto native key object
 * @returns The (JSON parsed) payload of the JWT––if the JWT is valid, otherwise an error is thrown
 */
function verifyJwtSync(jwt, jwkOrJwks, options, transformJwkToKeyObjectFn = _node_web_compat_1.nodeWebCompat.transformJwkToKeyObjectSync) {
    return verifyDecomposedJwtSync((0, jwt_js_1.decomposeJwt)(jwt), jwkOrJwks, options, transformJwkToKeyObjectFn);
}
exports.verifyJwtSync = verifyJwtSync;
/**
 * Verify (synchronously) a JWT that is already decomposed (by function `decomposeJwt`)
 *
 * @param decomposedJwt The decomposed JWT
 * @param jwkOrJwks The JWKS that includes the right JWK (indexed by kid). Alternatively, provide the right JWK directly
 * @param options Verification options
 * @param transformJwkToKeyObjectFn A function that can transform a JWK into a crypto native key object
 * @returns The (JSON parsed) payload of the JWT––if the JWT is valid, otherwise an error is thrown
 */
function verifyDecomposedJwtSync(decomposedJwt, jwkOrJwks, options, transformJwkToKeyObjectFn) {
    const { header, headerB64, payload, payloadB64, signatureB64 } = decomposedJwt;
    let jwk;
    if ((0, jwk_js_1.isJwk)(jwkOrJwks)) {
        jwk = jwkOrJwks;
    }
    else if ((0, jwk_js_1.isJwks)(jwkOrJwks)) {
        const locatedJwk = header.kid
            ? (0, jwk_js_1.findJwkInJwks)(jwkOrJwks, header.kid)
            : undefined;
        if (!locatedJwk) {
            throw new error_js_1.KidNotFoundInJwksError(`JWK for kid ${header.kid} not found in the JWKS`);
        }
        jwk = locatedJwk;
    }
    else {
        throw new error_js_1.ParameterValidationError([
            `Expected a valid JWK or JWKS (parsed as JavaScript object), but received: ${jwkOrJwks}.`,
            "If you're passing a JWKS URI, use the async verify() method instead, it will download and parse the JWKS for you",
        ].join());
    }
    validateJwtHeaderAndJwk(decomposedJwt.header, jwk);
    // Transform the JWK to native key format, that can be used with verifySignature
    const keyObject = transformJwkToKeyObjectFn(jwk, header.alg, payload.iss);
    // Verify the JWT signature (JWS)
    const valid = _node_web_compat_1.nodeWebCompat.verifySignatureSync({
        jwsSigningInput: `${headerB64}.${payloadB64}`,
        signature: signatureB64,
        alg: header.alg,
        keyObject,
    });
    if (!valid) {
        throw new error_js_1.JwtInvalidSignatureError("Invalid signature");
    }
    try {
        (0, jwt_js_1.validateJwtFields)(payload, options);
        if (options.customJwtCheck) {
            const res = options.customJwtCheck({ header, payload, jwk });
            (0, assert_js_1.assertIsNotPromise)(res, () => new error_js_1.ParameterValidationError("Custom JWT checks must be synchronous but a promise was returned"));
        }
    }
    catch (err) {
        if (options.includeRawJwtInErrors && err instanceof error_js_1.JwtInvalidClaimError) {
            throw err.withRawJwt(decomposedJwt);
        }
        throw err;
    }
    return payload;
}
/**
 * Abstract class representing a verifier for JWTs signed with RSA (e.g. RS256, RS384, RS512)
 *
 * A class is used, because there is state:
 * - The JWKS is fetched (downloaded) from the JWKS URI and cached in memory
 * - Verification properties at verifier level, are used as default options for individual verify calls
 *
 * When instantiating this class, relevant type parameters should be provided, for your concrete case:
 * @param StillToProvide The verification options that you want callers of verify to provide on individual verify calls
 * @param SpecificVerifyProperties The verification options that you'll use
 * @param IssuerConfig The issuer config that you'll use (config options are used as default verification options)
 * @param MultiIssuer Verify multiple issuers (true) or just a single one (false)
 */
class JwtRsaVerifierBase {
    constructor(verifyProperties, jwksCache = new jwk_js_1.SimpleJwksCache()) {
        this.jwksCache = jwksCache;
        this.issuersConfig = new Map();
        this.publicKeyCache = new KeyObjectCache();
        if (Array.isArray(verifyProperties)) {
            if (!verifyProperties.length) {
                throw new error_js_1.ParameterValidationError("Provide at least one issuer configuration");
            }
            for (const prop of verifyProperties) {
                if (this.issuersConfig.has(prop.issuer)) {
                    throw new error_js_1.ParameterValidationError(`issuer ${prop.issuer} supplied multiple times`);
                }
                this.issuersConfig.set(prop.issuer, this.withJwksUri(prop));
            }
        }
        else {
            this.issuersConfig.set(verifyProperties.issuer, this.withJwksUri(verifyProperties));
        }
    }
    get expectedIssuers() {
        return Array.from(this.issuersConfig.keys());
    }
    getIssuerConfig(issuer) {
        if (!issuer) {
            if (this.issuersConfig.size !== 1) {
                throw new error_js_1.ParameterValidationError("issuer must be provided");
            }
            issuer = this.issuersConfig.keys().next().value;
        }
        const config = this.issuersConfig.get(issuer);
        if (!config) {
            throw new error_js_1.ParameterValidationError(`issuer not configured: ${issuer}`);
        }
        return config;
    }
    /**
     * This method loads a JWKS that you provide, into the JWKS cache, so that it is
     * available for JWT verification. Use this method to speed up the first JWT verification
     * (when the JWKS would otherwise have to be downloaded from the JWKS uri), or to provide the JWKS
     * in case the JwtVerifier does not have internet access to download the JWKS
     *
     * @param jwksThe JWKS
     * @param issuer The issuer for which you want to cache the JWKS
     *  Supply this field, if you instantiated the JwtVerifier with multiple issuers
     * @returns void
     */
    cacheJwks(...[jwks, issuer]) {
        const issuerConfig = this.getIssuerConfig(issuer);
        this.jwksCache.addJwks(issuerConfig.jwksUri, jwks);
        this.publicKeyCache.clearCache(issuerConfig.issuer);
    }
    /**
     * Hydrate the JWKS cache for (all of) the configured issuer(s).
     * This will fetch and cache the latest and greatest JWKS for concerned issuer(s).
     *
     * @param issuer The issuer to fetch the JWKS for
     * @returns void
     */
    async hydrate() {
        const jwksFetches = this.expectedIssuers
            .map((issuer) => this.getIssuerConfig(issuer).jwksUri)
            .map((jwksUri) => this.jwksCache.getJwks(jwksUri));
        await Promise.all(jwksFetches);
    }
    /**
     * Verify (synchronously) a JWT that is signed using RS256 / RS384 / RS512.
     *
     * @param jwt The JWT, as string
     * @param props Verification properties
     * @returns The payload of the JWT––if the JWT is valid, otherwise an error is thrown
     */
    verifySync(...[jwt, properties]) {
        const { decomposedJwt, jwksUri, verifyProperties } = this.getVerifyParameters(jwt, properties);
        return this.verifyDecomposedJwtSync(decomposedJwt, jwksUri, verifyProperties);
    }
    /**
     * Verify (synchronously) an already decomposed JWT, that is signed using RS256 / RS384 / RS512.
     *
     * @param decomposedJwt The decomposed Jwt
     * @param jwk The JWK to verify the JWTs signature with
     * @param verifyProperties The properties to use for verification
     * @returns The payload of the JWT––if the JWT is valid, otherwise an error is thrown
     */
    verifyDecomposedJwtSync(decomposedJwt, jwksUri, verifyProperties) {
        const jwk = this.jwksCache.getCachedJwk(jwksUri, decomposedJwt);
        return verifyDecomposedJwtSync(decomposedJwt, jwk, verifyProperties, this.publicKeyCache.transformJwkToKeyObjectSync.bind(this.publicKeyCache));
    }
    /**
     * Verify (asynchronously) a JWT that is signed using RS256 / RS384 / RS512.
     * This call is asynchronous, and the JWKS will be fetched from the JWKS uri,
     * in case it is not yet available in the cache.
     *
     * @param jwt The JWT, as string
     * @param props Verification properties
     * @returns Promise that resolves to the payload of the JWT––if the JWT is valid, otherwise the promise rejects
     */
    async verify(...[jwt, properties]) {
        const { decomposedJwt, jwksUri, verifyProperties } = this.getVerifyParameters(jwt, properties);
        return this.verifyDecomposedJwt(decomposedJwt, jwksUri, verifyProperties);
    }
    /**
     * Verify (asynchronously) an already decomposed JWT, that is signed using RS256 / RS384 / RS512.
     *
     * @param decomposedJwt The decomposed Jwt
     * @param jwk The JWK to verify the JWTs signature with
     * @param verifyProperties The properties to use for verification
     * @returns The payload of the JWT––if the JWT is valid, otherwise an error is thrown
     */
    verifyDecomposedJwt(decomposedJwt, jwksUri, verifyProperties) {
        return verifyDecomposedJwt(decomposedJwt, jwksUri, verifyProperties, this.jwksCache.getJwk.bind(this.jwksCache), this.publicKeyCache.transformJwkToKeyObjectAsync.bind(this.publicKeyCache));
    }
    /**
     * Get the verification parameters to use, by merging the issuer configuration,
     * with the overriding properties that are now provided
     *
     * @param jwt: the JWT that is going to be verified
     * @param verifyProperties: the overriding properties, that override the issuer configuration
     * @returns The merged verification parameters
     */
    getVerifyParameters(jwt, verifyProperties) {
        const decomposedJwt = (0, jwt_js_1.decomposeJwt)(jwt);
        (0, assert_js_1.assertStringArrayContainsString)("Issuer", decomposedJwt.payload.iss, this.expectedIssuers, error_js_1.JwtInvalidIssuerError);
        const issuerConfig = this.getIssuerConfig(decomposedJwt.payload.iss);
        return {
            decomposedJwt,
            jwksUri: issuerConfig.jwksUri,
            verifyProperties: {
                ...issuerConfig,
                ...verifyProperties,
            },
        };
    }
    /**
     * Get issuer config with JWKS URI, by adding a default JWKS URI if needed
     *
     * @param config: the issuer config.
     * @returns The config with JWKS URI
     */
    withJwksUri(config) {
        if (config.jwksUri) {
            return config;
        }
        const issuerUri = new URL(config.issuer).pathname.replace(/\/$/, "");
        return {
            jwksUri: new URL(`${issuerUri}/.well-known/jwks.json`, config.issuer)
                .href,
            ...config,
        };
    }
}
exports.JwtRsaVerifierBase = JwtRsaVerifierBase;
/**
 * Class representing a verifier for JWTs signed with RSA (e.g. RS256 / RS384 / RS512)
 */
class JwtRsaVerifier extends JwtRsaVerifierBase {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static create(verifyProperties, additionalProperties) {
        return new this(verifyProperties, additionalProperties?.jwksCache);
    }
}
exports.JwtRsaVerifier = JwtRsaVerifier;
/**
 * Class representing a cache of RSA public keys in native key object format
 *
 * Because it takes a bit of compute time to turn a JWK into native key object format,
 * we want to cache this computation.
 */
class KeyObjectCache {
    constructor(transformJwkToKeyObjectSyncFn = _node_web_compat_1.nodeWebCompat.transformJwkToKeyObjectSync, transformJwkToKeyObjectAsyncFn = _node_web_compat_1.nodeWebCompat.transformJwkToKeyObjectAsync) {
        this.transformJwkToKeyObjectSyncFn = transformJwkToKeyObjectSyncFn;
        this.transformJwkToKeyObjectAsyncFn = transformJwkToKeyObjectAsyncFn;
        this.publicKeys = new Map();
    }
    /**
     * Transform the JWK into an RSA public key in native key object format.
     * If the transformed JWK is already in the cache, it is returned from the cache instead.
     *
     * @param jwk: the JWK
     * @param jwtHeaderAlg: the alg from the JWT header (used if absent on JWK)
     * @param issuer: the issuer that uses the JWK for signing JWTs (used for caching the transformation)
     * @returns the RSA public key in native key object format
     */
    transformJwkToKeyObjectSync(jwk, jwtHeaderAlg, issuer) {
        const alg = jwk.alg ?? jwtHeaderAlg;
        if (!issuer || !jwk.kid || !alg) {
            return this.transformJwkToKeyObjectSyncFn(jwk, alg, issuer);
        }
        const fromCache = this.publicKeys.get(issuer)?.get(jwk.kid)?.get(alg);
        if (fromCache)
            return fromCache;
        const publicKey = this.transformJwkToKeyObjectSyncFn(jwk, alg, issuer);
        this.putKeyObjectInCache(issuer, jwk.kid, alg, publicKey);
        return publicKey;
    }
    /**
     * Transform the JWK into an RSA public key in native key object format (async).
     * If the transformed JWK is already in the cache, it is returned from the cache instead.
     *
     * @param jwk: the JWK
     * @param jwtHeaderAlg: the alg from the JWT header (used if absent on JWK)
     * @param issuer: the issuer that uses the JWK for signing JWTs (used for caching the transformation)
     * @returns the RSA public key in native key object format
     */
    async transformJwkToKeyObjectAsync(jwk, jwtHeaderAlg, issuer) {
        const alg = jwk.alg ?? jwtHeaderAlg;
        if (!issuer || !jwk.kid || !alg) {
            return this.transformJwkToKeyObjectAsyncFn(jwk, alg, issuer);
        }
        const fromCache = this.publicKeys.get(issuer)?.get(jwk.kid)?.get(alg);
        if (fromCache)
            return fromCache;
        const publicKey = await this.transformJwkToKeyObjectAsyncFn(jwk, alg, issuer);
        this.putKeyObjectInCache(issuer, jwk.kid, alg, publicKey);
        return publicKey;
    }
    putKeyObjectInCache(issuer, kid, alg, publicKey) {
        const cachedIssuer = this.publicKeys.get(issuer);
        const cachedIssuerKid = cachedIssuer?.get(kid);
        if (cachedIssuerKid) {
            cachedIssuerKid.set(alg, publicKey);
        }
        else if (cachedIssuer) {
            cachedIssuer.set(kid, new Map([[alg, publicKey]]));
        }
        else {
            this.publicKeys.set(issuer, new Map([[kid, new Map([[alg, publicKey]])]]));
        }
    }
    clearCache(issuer) {
        this.publicKeys.delete(issuer);
    }
}
exports.KeyObjectCache = KeyObjectCache;
