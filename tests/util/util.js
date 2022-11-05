"use strict";
/**
 * Utility functions used by unit and integration tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64url = exports.signJwt = exports.publicKeyToJwk = exports.generateKeyPair = void 0;
const crypto_1 = require("crypto");
function generateKeyPair(deconstructPublicKeyInDerFormat, options) {
    const { privateKey, publicKey } = (0, crypto_1.generateKeyPairSync)("rsa", {
        modulusLength: 4096,
        publicExponent: 0x10001,
    });
    const jwk = publicKeyToJwk(publicKey, deconstructPublicKeyInDerFormat, {
        kid: options?.kid,
        alg: options?.alg,
    });
    return {
        publicKey,
        publicKeyDer: publicKey.export({ format: "der", type: "spki" }),
        publicKeyPem: publicKey.export({ format: "pem", type: "spki" }),
        privateKey,
        privateKeyDer: privateKey.export({ format: "der", type: "pkcs8" }),
        privateKeyPem: privateKey.export({
            format: "pem",
            type: "pkcs8",
        }),
        jwks: { keys: [jwk] },
        jwk,
        nBuffer: Buffer.from(jwk.n, "base64"),
        eBuffer: Buffer.from(jwk.e, "base64"),
    };
}
exports.generateKeyPair = generateKeyPair;
function publicKeyToJwk(publicKey, deconstructPublicKeyInDerFormat, jwkOptions = {}) {
    jwkOptions = {
        kid: jwkOptions.kid ?? "testkid",
        alg: jwkOptions.alg ?? "RS256",
        kty: jwkOptions.kty ?? "RSA",
        use: jwkOptions.use ?? "sig",
    };
    const { n, e } = deconstructPublicKeyInDerFormat(publicKey.export({ format: "der", type: "spki" }));
    const res = {
        ...jwkOptions,
        n: base64url(removeLeadingZero(n)),
        e: base64url(removeLeadingZero(e)),
    };
    return res;
}
exports.publicKeyToJwk = publicKeyToJwk;
function removeLeadingZero(positiveInteger) {
    return positiveInteger[0] === 0
        ? positiveInteger.subarray(1)
        : positiveInteger;
}
var JwtSignatureAlgorithms;
(function (JwtSignatureAlgorithms) {
    JwtSignatureAlgorithms["RS256"] = "RSA-SHA256";
    JwtSignatureAlgorithms["RS384"] = "RSA-SHA384";
    JwtSignatureAlgorithms["RS512"] = "RSA-SHA512";
})(JwtSignatureAlgorithms || (JwtSignatureAlgorithms = {}));
function signJwt(header, payload, privateKey, produceValidSignature = true) {
    header = {
        ...header,
        alg: Object.keys(header).includes("alg") ? header.alg : "RS256",
    };
    payload = { exp: Math.floor(Date.now() / 1000 + 100), ...payload };
    const toSign = [
        base64url(JSON.stringify(header)),
        base64url(JSON.stringify(payload)),
    ].join(".");
    const sign = (0, crypto_1.createSign)(JwtSignatureAlgorithms[header.alg] ??
        "RSA-SHA256");
    sign.write(toSign);
    sign.end();
    const signature = sign.sign(privateKey);
    if (!produceValidSignature) {
        signature[0] = ~signature[0]; // swap first byte
    }
    const signedJwt = [toSign, base64url(signature)].join(".");
    return signedJwt;
}
exports.signJwt = signJwt;
function base64url(x) {
    // Note: since Node.js 14.18 you can just do Buffer.from(x).toString("base64url")
    // That's pretty recent still, and CI environments might run older Node14, so we'll do it ourselves for a while longer
    if (typeof x === "string") {
        x = Buffer.from(x);
    }
    return x
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
exports.base64url = base64url;
