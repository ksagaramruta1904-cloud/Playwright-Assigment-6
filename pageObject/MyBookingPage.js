const { expect } = require('@playwright/test');

class MyBookingPage
{
      /**
   * @param {import('@playwright/test').Page} page
   */
    constructor(page)
    {
        this.page=page; 
        this.myBookingMenu=page.getByTestId('nav-bookings');
        this.bookingCards=page.getByTestId('booking-card');
        this.myBookingheader=page.getByRole('heading',{level:1 });
        
    }
            async clickMyBooking()
            {
                await this.myBookingMenu.click();           
                await this.page.waitForURL('**/bookings');
            }

            async validateBooking(patchedBooking)
            { 
                //Assert My Bookings header
                await expect(this.myBookingheader).toHaveText('My Bookings');
                await this.bookingCards.first().waitFor({ state: 'visible' });  // Waiting for cards to be visible 
                 
                const eventCardCount=await this.bookingCards.count();
                //console.log('Total Cards: '+ eventCardCount); 
                // Assert patched event card - Step 6 
                const patchedCard = this.page.locator('[data-testid="booking-card"]').filter({has: this.page.locator('.booking-ref', { hasText: patchedBooking.bookingRef }),});
                await expect(patchedCard).toBeVisible();
                await expect(patchedCard.locator('h3')).toHaveText(patchedBooking.event.title);
                await expect(patchedCard).toContainText(`${patchedBooking.quantity} tickets`);
                await expect(patchedCard).toContainText(`$${patchedBooking.totalPrice}`);

                // ---------- Step 7: at least one other card is still live/different ----------
               const allRefs = await this.page.locator('.booking-ref').allTextContents();
               const otherLiveRefs = allRefs.filter(ref => ref !== patchedBooking.bookingRef);
               await expect(otherLiveRefs.length).toBeGreaterThan(0);

            // ---------- Step 9 (register BEFORE the click in step 8): detail interceptor ----------
              await this.page.route(
               (url) => url.hostname === 'api.eventhub.rahulshettyacademy.com'
               && url.pathname === `/api/bookings/${patchedBooking.id}`,
              async (route) => {
              const response = await route.fetch();
              const json = await response.json();

              json.data.bookingRef = patchedBooking.bookingRef;
              json.data.quantity = patchedBooking.quantity;
              json.data.totalPrice = patchedBooking.totalPrice;
             json.data.event.title = patchedBooking.event.title;
              // json.data.customerEmail intentionally left untouched — must stay live

               await route.fulfill({ response, json });

             // ---------- Step 8: click View Details, confirm nav preserved the original id ----------
              await patchedCard.getByRole('button', { name: 'View Details' }).click();
              await expect(this.page).toHaveURL(new RegExp(`/bookings/${patchedBooking.id}$`));

          // ---------- Step 10: detail page fields match patched values; email stays original ----------
              await expect(this.page.locator('nav span.font-mono')).toHaveText(patchedBooking.bookingRef);
              await expect(this.page.locator('h1')).toHaveText(patchedBooking.event.title);
            await expect(
                 this.page.locator('div.flex.justify-between', { hasText: 'Tickets' }).locator('span').last()
                        ).toHaveText(String(patchedBooking.quantity));
            await expect(this.page.locator('span.text-lg.font-bold.text-indigo-700')).toHaveText(`$${patchedBooking.totalPrice}`);
              await expect(
                  this.page.locator('div.flex.justify-between', { hasText: 'Email' }).locator('span').last()
                ).toHaveText(patchedBooking.customerEmail); // original/live value, never overwritten

                // ---------- Step 11: back to list, re-find by reference, confirm total matches ----------
                  await this.page.goBack();
                const patchedCardAgain = page.locator('[data-testid="booking-card"]').filter({
                 has: this.page.locator('.booking-ref', { hasText: patchedBooking.bookingRef }),
                  });
                await expect(patchedCardAgain).toBeVisible();
                      await expect(patchedCardAgain).toContainText(`$${patchedBooking.totalPrice}`);

  }
);
               
                
            }



}
module.exports={MyBookingPage}
