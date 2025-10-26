import { BasePage } from "./BasePage";

export class FlashcardsPage extends BasePage {
  private readonly pageTitle = 'h1:has-text("My Flashcards")';
  private readonly pageSubtitle = 'p:has-text("Manage and review your flashcard collection")';
  private readonly createNewButton = 'button:has-text("Create New Flashcard")';
  private readonly createFirstButton = 'button:has-text("Create Your First Flashcard")';
  private readonly flashcardCards = "article.bg-white";
  private readonly emptyStateMessage = "h3";
  private readonly loadingSkeletons = ".animate-pulse";
  private readonly yourFlashcardsHeading = 'h2:has-text("Your Flashcards")';
  private readonly notificationContainer = '[role="status"]';

  async navigateToFlashcards(): Promise<void> {
    await this.navigate("/flashcards");
    await this.waitForLoad();
  }

  async getPageTitle(): Promise<string> {
    // @ts-expect-error Playwright's textContent() can return null but this method should always return string
    return this.page.locator(this.pageTitle).textContent();
  }

  async getPageSubtitle(): Promise<string> {
    // @ts-expect-error Playwright's textContent() can return null but this method should always return string
    return this.page.locator(this.pageSubtitle).textContent();
  }

  async isPageLoaded(): Promise<boolean> {
    return this.page.locator(this.pageTitle).isVisible();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator(this.emptyStateMessage).isVisible();
  }

  async isLoadingVisible(): Promise<boolean> {
    return this.page.locator(this.loadingSkeletons).first().isVisible();
  }

  async getFlashcardCount(): Promise<number> {
    return this.page.locator(this.flashcardCards).count();
  }

  async getFlashcardTitles(): Promise<string[]> {
    return this.page.locator(`${this.flashcardCards} h3`).allTextContents();
  }

  async getFlashcardContents(): Promise<string[]> {
    return this.page.locator(`${this.flashcardCards} p.text-sm`).allTextContents();
  }

  async getFlashcardStatuses(): Promise<string[]> {
    return this.page.locator(`${this.flashcardCards} span.px-2`).allTextContents();
  }

  async clickCreateNewFlashcard(): Promise<void> {
    const createNewExists = await this.page.locator(this.createNewButton).isVisible();
    if (createNewExists) {
      await this.page.locator(this.createNewButton).click();
    } else {
      await this.page.locator(this.createFirstButton).click();
    }
  }

  async clickEditFlashcard(index = 0): Promise<void> {
    await this.page.locator(`${this.flashcardCards}:nth-child(${index + 1}) button:has-text("Edit")`).click();
  }

  async clickDeleteFlashcard(index = 0): Promise<void> {
    await this.page.locator(`${this.flashcardCards}:nth-child(${index + 1}) button:has-text("Delete")`).click();
  }

  async clickApproveFlashcard(index = 0): Promise<void> {
    await this.page.locator(`${this.flashcardCards}:nth-child(${index + 1}) button:has-text("Approve")`).click();
  }

  async clickRejectFlashcard(index = 0): Promise<void> {
    await this.page.locator(`${this.flashcardCards}:nth-child(${index + 1}) button:has-text("Reject")`).click();
  }

  async isYourFlashcardsHeadingVisible(): Promise<boolean> {
    return this.page.locator(this.yourFlashcardsHeading).isVisible();
  }

  async getNotificationCount(): Promise<number> {
    return this.page.locator(this.notificationContainer).count();
  }

  async waitForFlashcardsToLoad(): Promise<void> {
    // Wait until loading is complete and cards are visible or empty state appears
    await this.page.waitForFunction(
      () => {
        const loading = document.querySelector(".animate-pulse");
        const cards = document.querySelectorAll("article.bg-white");
        const emptyStateHeading = document.querySelector("h3");
        const emptyState = emptyStateHeading && emptyStateHeading.textContent?.includes("No flashcards yet");
        return !loading && (cards.length > 0 || emptyState);
      },
      { timeout: 10000 }
    );
  }

  async confirmDeleteFlashcard(): Promise<void> {
    const confirmButton = this.page.locator('[data-testid="confirmation-modal-confirm-button"]');
    await confirmButton.click();
  }

  async cancelDeleteFlashcard(): Promise<void> {
    const cancelButton = this.page.locator('[data-testid="confirmation-modal-cancel-button"]');
    await cancelButton.click();
  }

  async isDeleteModalVisible(): Promise<boolean> {
    return this.page.locator('h2:has-text("Delete Flashcard")').isVisible();
  }
}
