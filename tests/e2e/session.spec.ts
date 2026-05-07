import { expect, test } from "@playwright/test";

test("user can run the local guided path without uploading content", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByTestId("repo-link")).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/bilateral-memory-processing"
  );
  await expect(page.getByTestId("paypal-link")).toHaveAttribute(
    "href",
    "https://www.paypal.com/paypalme/florinbadita"
  );
  await expect(page.getByTestId("version-commit")).toContainText(/Version 0\.1\.0 · Commit/);

  await page.getByTestId("headphones-check").check();
  await page.getByTestId("privacy-check").check();
  await page.getByTestId("safety-check").check();
  await page.getByTestId("start-tone").click();
  await expect(page.getByTestId("bilateral-visualizer")).toHaveAttribute(
    "aria-label",
    "Bilateral tone is active"
  );

  await page
    .getByTestId("manual-transcript")
    .fill("I can describe one small piece of the memory while noticing the room around me.");
  await page.getByTestId("generate-reflection").click();

  await expect(page.getByTestId("guidance-headline")).toBeVisible();
  await expect(page.getByText("no session upload path")).toBeVisible();
});
