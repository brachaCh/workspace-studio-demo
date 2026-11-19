import { describe, expect, it } from "vitest";
import {
  insertFieldRelative,
  moveField,
  reorderField,
  removeFieldFromOrder,
  resolveFieldOrder,
} from "@/lib/field-order";

describe("resolveFieldOrder", () => {
  it("keeps stored order and appends new ids", () => {
    expect(resolveFieldOrder(["b", "a"], ["a", "b", "c"])).toEqual(["b", "a", "c"]);
  });
});

describe("insertFieldRelative", () => {
  it("inserts after anchor", () => {
    expect(
      insertFieldRelative(["a", "b"], ["a", "b", "x"], "x", "a", "after"),
    ).toEqual(["a", "x", "b"]);
  });

  it("inserts before anchor", () => {
    expect(
      insertFieldRelative(["a", "b"], ["a", "b", "x"], "x", "b", "before"),
    ).toEqual(["a", "x", "b"]);
  });
});

describe("moveField", () => {
  it("swaps with neighbor", () => {
    expect(moveField(["a", "b", "c"], ["a", "b", "c"], "b", "up")).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(moveField(["a", "b", "c"], ["a", "b", "c"], "b", "down")).toEqual([
      "a",
      "c",
      "b",
    ]);
  });
});

describe("reorderField", () => {
  it("moves dragged id to target position", () => {
    expect(reorderField(["a", "b", "c"], ["a", "b", "c"], "c", "a")).toEqual([
      "c",
      "a",
      "b",
    ]);
    expect(reorderField(["a", "b", "c"], ["a", "b", "c"], "a", "c")).toEqual([
      "b",
      "c",
      "a",
    ]);
  });
});

describe("removeFieldFromOrder", () => {
  it("drops removed id", () => {
    expect(removeFieldFromOrder(["a", "b", "c"], ["a", "c"], "b")).toEqual(["a", "c"]);
  });
});
