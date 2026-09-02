class LoginPage
{

    /**
   * @param {import('@playwright/test').Page} page
   */
    constructor(page)
    { 
        //Initialize Page locators 
        this.page=page; 
        this.userName=page.getByPlaceholder('you@email.com');
        this.password=page.locator('#password');
        this.signInButton=page.getByRole("button",{name:'Sign In'});
    }

    async goTo()  
    {
        // Navigate to EventHub page 
        await this.page.goto("https://eventhub.rahulshettyacademy.com/login",{ waitUntil: 'domcontentloaded' });
       // await this.page.waitForLoadState("domcontentloaded");
    }

    async loginEventHub(userName, password)
    {
       // Login to EventHub 
       await this.userName.fill(userName);
       await this.password.fill(password);
       await this.signInButton.click();
       await this.page.waitForLoadState('networkidle');
      
    }
}

module.exports = {LoginPage};