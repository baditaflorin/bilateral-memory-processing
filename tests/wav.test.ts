import { describe, expect, it } from "vitest";
import { encodePcmWav } from "../src/features/audio/wav";

describe("wav export", () => {
  it("writes a mono 16-bit PCM WAV header", async () => {
    const blob = encodePcmWav(new Float32Array([0, 0.5, -0.5]), 16_000);
    const view = new DataView(await readBlob(blob));

    expect(blob.type).toBe("audio/wav");
    expect(readAscii(view, 0, 4)).toBe("RIFF");
    expect(readAscii(view, 8, 4)).toBe("WAVE");
    expect(readAscii(view, 12, 4)).toBe("fmt ");
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(readAscii(view, 36, 4)).toBe("data");
  });
});

function readBlob(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result as ArrayBuffer));
    reader.addEventListener("error", () =>
      reject(reader.error ?? new Error("Blob could not be read"))
    );
    reader.readAsArrayBuffer(blob);
  });
}

function readAscii(view: DataView, offset: number, length: number) {
  return Array.from({ length }, (_, index) =>
    String.fromCharCode(view.getUint8(offset + index))
  ).join("");
}
