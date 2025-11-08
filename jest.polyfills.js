// Polyfill for Web APIs (Request, Response, etc.) - MUST BE FIRST
// Node.js 18+ has these built-in, but we'll set them up for compatibility
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Polyfill for Web Streams API (required by undici)
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream, WritableStream, TransformStream } = require('web-streams-polyfill')
  globalThis.ReadableStream = ReadableStream
  globalThis.WritableStream = WritableStream
  globalThis.TransformStream = TransformStream
  global.ReadableStream = ReadableStream
  global.WritableStream = WritableStream
  global.TransformStream = TransformStream
}

// Polyfill MessagePort (required by undici)
if (typeof globalThis.MessagePort === 'undefined') {
  const { MessageChannel } = require('worker_threads')
  globalThis.MessagePort = MessageChannel.prototype.constructor
}

// Polyfill for fetch, Request, Response - MUST BE AFTER TextEncoder and Streams
// Use undici for Node.js < 18, or native fetch for Node.js 18+
if (typeof globalThis.fetch === 'undefined') {
  const { fetch, Request, Response, Headers } = require('undici')
  globalThis.fetch = fetch
  globalThis.Request = Request
  globalThis.Response = Response
  globalThis.Headers = Headers
  global.fetch = fetch
  global.Request = Request
  global.Response = Response
  global.Headers = Headers
} else {
  // Node.js 18+ has native fetch, but we still need Request/Response from undici
  const { Request, Response, Headers } = require('undici')
  globalThis.Request = Request
  globalThis.Response = Response
  globalThis.Headers = Headers
  global.Request = Request
  global.Response = Response
  global.Headers = Headers
}

