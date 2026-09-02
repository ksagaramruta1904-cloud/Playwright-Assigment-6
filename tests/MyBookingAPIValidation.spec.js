// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObject/LoginPage';
import { MyBookingPage } from '../pageObject/MyBookingPage';

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goTo();
  await loginPage.loginEventHub('ksagaramruta1904@gmail.com', 'Amruta@123A');
});


test('My Booking Update Response ', async ({ page }) => {
 
let patchedBooking;
await page.route('**/api/bookings**', async (route) => {
  const response = await route.fetch();          
  const json = await response.json();        

  const target = json.data[0]; 
    patchedBooking = {
    ...target,
    id: target.id,                                 
    bookingRef: 'D-QAPATCH1',                      
    quantity: 3,                                   
    totalPrice: '650',                             
    event: {
      ...target.event,
      title: 'QA Patched Event ',             
    },
  }
  const index = json.data.findIndex(b => b.id === target.id);
  json.data[index] = patchedBooking;                // splice the patched record back in

  await route.fulfill({ response, json });   
});// closing page route 
  const myBookingPage=await new MyBookingPage(page); 
   await Promise.all([
     page.waitForResponse(res => res.url().includes('/api/bookings') && res.status() === 200),
     myBookingPage.clickMyBooking(),
    ]);
 // await page.pause(); 
  await myBookingPage.validateBooking(patchedBooking);
  //await page.screenshot();
  
});
