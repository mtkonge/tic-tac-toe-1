import { assertEquals } from "jsr:@std/assert";

Deno.test("simple test", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

Deno.test("async test", async () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

Deno.test({
    name: "read file test",
    fn: () => {
        const data = Deno.readTextFileSync("./somefile.txt");
        assertEquals(data, "expected content");
    },
});
