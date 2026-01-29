import { test, expect, type Page } from '@playwright/test';

const requiredEnv = [
  'E2E_CUSTOMER_EMAIL',
  'E2E_CUSTOMER_PASSWORD',
  'E2E_PROVIDER_EMAIL',
  'E2E_PROVIDER_PASSWORD',
];

const getMissingEnv = () =>
  requiredEnv.filter((key) => !process.env[key] || process.env[key]?.trim() === '');

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard');
};

test('customer posts a job, provider bids, customer awards', async ({ browser }) => {
  const missing = getMissingEnv();
  test.skip(missing.length > 0, `Missing E2E env vars: ${missing.join(', ')}`);

  const customerContext = await browser.newContext();
  const providerContext = await browser.newContext();

  const customerPage = await customerContext.newPage();
  const providerPage = await providerContext.newPage();

  const jobTitle = `E2E Job ${Date.now()} - Deep cleaning request`;
  const jobDescription =
    'Need a thorough cleaning of a two-bedroom apartment. Please include supplies, estimated duration, and availability next week.';
  const bidProposal =
    'I can complete this job within two days, include all supplies, and provide a detailed checklist of completed tasks.';

  try {
    await login(
      customerPage,
      process.env.E2E_CUSTOMER_EMAIL as string,
      process.env.E2E_CUSTOMER_PASSWORD as string
    );

    await customerPage.goto('/jobs/new');
    await customerPage.getByLabel('Job Title').fill(jobTitle);
    await customerPage.getByLabel('Description').fill(jobDescription);

    await customerPage.getByRole('combobox').click();
    const firstCategory = customerPage.getByRole('option').first();
    await firstCategory.waitFor({ state: 'visible' });
    await firstCategory.click();
    await customerPage.getByRole('button', { name: 'Next' }).click();

    await customerPage.getByLabel('Budget ($)').fill('150');
    await customerPage.getByLabel('Location').fill('Austin, TX');
    await customerPage.getByRole('button', { name: 'Next' }).click();

    await customerPage.getByRole('button', { name: 'Next' }).click();
    await customerPage.getByLabel('I agree to the terms and conditions').check();
    await customerPage.getByRole('button', { name: 'Publish Job' }).click();
    await customerPage.waitForURL('**/jobs');

    await customerPage.getByPlaceholder('Search jobs...').fill(jobTitle);
    await customerPage.getByRole('link', { name: new RegExp(jobTitle) }).click();
    await expect(
      customerPage.getByRole('heading', { name: jobTitle })
    ).toBeVisible();

    const jobId = new URL(customerPage.url()).pathname.split('/').pop();
    if (!jobId) {
      throw new Error('Unable to determine job id from URL.');
    }

    await login(
      providerPage,
      process.env.E2E_PROVIDER_EMAIL as string,
      process.env.E2E_PROVIDER_PASSWORD as string
    );

    await providerPage.goto(`/jobs/${jobId}`);
    await expect(
      providerPage.getByRole('heading', { name: jobTitle })
    ).toBeVisible();

    await providerPage.getByLabel('Your Bid Amount ($)').fill('140');
    await providerPage.getByLabel('Your Proposal').fill(bidProposal);
    await providerPage.getByRole('button', { name: 'Submit Bid' }).click();

    await expect(providerPage.getByText('pending')).toBeVisible();

    await customerPage.reload();
    const awardButton = customerPage.getByRole('button', { name: 'Award' }).first();
    await awardButton.waitFor({ state: 'visible', timeout: 15000 });
    await awardButton.click();

    await expect(customerPage.getByText('awarded')).toBeVisible();
  } finally {
    await customerContext.close();
    await providerContext.close();
  }
});
