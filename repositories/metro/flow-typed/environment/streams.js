/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall flow
 */

// Adapted from https://github.com/flow-typed/flow-typed/blob/main/definitions/environments/streams/flow_v0.261.x-/streams.js

type TextEncodeOptions = {options?: boolean, ...};

// $FlowFixMe[libdef-override]
declare class TextEncoder {
  encode(buffer: string, options?: TextEncodeOptions): Uint8Array;
}

declare class ReadableStreamController {
  close(): void;

  constructor(
    stream: ReadableStream,
    underlyingSource: UnderlyingSource,
    size: number,
    highWaterMark: number,
  ): void;

  desiredSize: number;
  enqueue(chunk: any): void;
  error(error: Error): void;
}

declare class ReadableStreamReader {
  cancel(reason: string): void;

  closed: boolean;

  constructor(stream: ReadableStream): void;
  read(): Promise<{
    done: boolean,
    value: ?any,
    ...
  }>;
  releaseLock(): void;
}

declare interface UnderlyingSource {
  autoAllocateChunkSize?: number;
  cancel?: (reason: string) => ?Promise<void>;

  pull?: (controller: ReadableStreamController) => ?Promise<void>;
  start?: (controller: ReadableStreamController) => ?Promise<void>;
  type?: string;
}

declare class TransformStream {
  readable: ReadableStream;
  writable: WritableStream;
}

interface PipeThroughTransformStream {
  readable: ReadableStream;
  writable: WritableStream;
}

type PipeToOptions = {
  preventAbort?: boolean,
  preventCancel?: boolean,
  preventClose?: boolean,
  ...
};

type QueuingStrategy = {
  highWaterMark: number,
  size(chunk: ?any): number,
  ...
};

declare class ReadableStream {
  cancel(reason: string): void;

  constructor(
    underlyingSource: ?UnderlyingSource,
    queuingStrategy: ?QueuingStrategy,
  ): void;

  getReader(): ReadableStreamReader;
  locked: boolean;
  pipeThrough(transform: PipeThroughTransformStream, options: ?any): void;
  pipeTo(dest: WritableStream, options: ?PipeToOptions): Promise<void>;
  tee(): [ReadableStream, ReadableStream];
}

declare interface WritableStreamController {
  error(error: Error): void;
}

declare interface UnderlyingSink {
  abort?: (reason: string) => ?Promise<void>;
  autoAllocateChunkSize?: number;

  close?: (controller: WritableStreamController) => ?Promise<void>;
  start?: (controller: WritableStreamController) => ?Promise<void>;
  type?: string;
  write?: (chunk: any, controller: WritableStreamController) => ?Promise<void>;
}

declare interface WritableStreamWriter {
  abort(reason: string): ?Promise<any>;
  close(): Promise<any>;
  closed: Promise<any>;

  desiredSize?: number;
  ready: Promise<any>;
  releaseLock(): void;
  write(chunk: any): Promise<any>;
}

declare class WritableStream {
  abort(reason: string): void;

  constructor(
    underlyingSink: ?UnderlyingSink,
    queuingStrategy: QueuingStrategy,
  ): void;

  getWriter(): WritableStreamWriter;
  locked: boolean;
}
