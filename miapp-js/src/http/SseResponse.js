/** Adaptador sobre la respuesta Express para emitir Server-Sent Events. */
class SseResponse {
  constructor(res) {
    this.res = res;
  }

  open() {
    this.res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    });
    this.res.flushHeaders?.();
  }

  get closed() {
    return this.res.writableEnded || this.res.destroyed;
  }

  sendText(text) {
    this.#write({ text });
  }

  sendError(error) {
    this.#write({ error });
  }

  done() {
    if (!this.closed) this.res.write('data: [DONE]\n\n');
  }

  close() {
    if (!this.closed) this.res.end();
  }

  #write(payload) {
    if (!this.closed) this.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}

module.exports = { SseResponse };
