# TMDone Admin Console - Automation Testing Coverage (Detailed Explanation)

This document explains, in detail, which main modules and features are covered by the Playwright automation scripts for the TMDone Admin Console.

As you read through it, you can understand what happens step by step inside each script.

---

## 1. Authentication (`01-auth`)
* **Valid Login:** The script first opens the browser and navigates to the login page. It then enters a valid username (email) and password, clicks the `Login` button, and checks whether the URL changes and the dashboard loads successfully.
* **Invalid Login:** When an incorrect email or password is entered and the login button is clicked, the script verifies that the system displays the `Invalid credentials` error message in red.

## 2. Dashboard (`02-dashboard`)
* **Page Load & Widgets:** After opening the dashboard, the script checks whether the main widgets, such as Active Orders, Revenue, and user counts, load correctly and display data. It verifies that the cards are not empty and contain numbers.
* **Sidebar Navigation:** The script clicks sidebar links such as Stores, Users, and Campaigns, then checks whether each link navigates to the correct page.

## 3. Vendor Performance (`03-vendor-performance`)
* **Data Table:** The script checks whether the table that displays vendor orders and ratings loads correctly. It verifies that the table headers are visible and that at least one row is available.
* **Filters & Pagination:** When stores or dates are filtered, the script checks whether the table updates correctly. It also verifies that pagination loads data when moving to the next page.

## 4. Reports (`04-reports`)
* **Tabs & Navigation:** The script checks whether report tabs, such as Financial and Operational, switch correctly and whether the selected tab becomes active.
* **Filters:** The script verifies that selecting a zone or store from the dropdown filters the list correctly. It also checks whether the date picker can select `Today` or other relevant dates.
* **Export:** The script checks whether the Download or Export button is enabled and can be clicked.

## 5. Analysis (`05-analysis`)
* **Charts Validation:** The script checks whether the Highcharts or Canvas graphs on the Analysis page are rendered in the HTML DOM.
* **Store Comparison:** The script selects two stores from the comparison dropdowns and checks whether the comparison can be performed.

## 6. Stores & Store Ratings (`06-stores`)
* **Store Search:** The script types `Test` in the search box and verifies that only the matching store appears in the table. After clearing the search, it checks whether the previous full list returns.
* **Store Status Edit:** The script opens the store details dialog by clicking the store name, then uses the `Active` toggle switch to disable or enable the store and save the change.
* **Ratings:** The script navigates to the Store Ratings page and checks whether the ratings table and export button work correctly.

## 7. Offers (`07-offers`) (Full CRUD Test)
* **Create:** The script clicks `Create Offer`, fills in the popup fields such as offer name and category, then saves the offer.
* **Read:** The script searches for the newly created offer by name and confirms that it appears in the table.
* **Update:** The script opens the options menu for the created offer, clicks `Edit`, changes the name, and updates the offer.
* **Delete:** Finally, the script clicks `Delete` for the same offer, confirms the SweetAlert prompt by clicking `Yes`, and deletes the offer.

## 8. Order Management (`08-order-management`)
* **Search Orders:** When an order ID is entered, the script checks whether the matching order appears in the table.
* **Status Updates:** The script opens an order, then checks from the relevant popup whether the order status can be changed, for example from Pending to Accepted.

## 9. Portfolio & Accounts (`09-portfolio-accounts`)
* **Filters:** The script checks whether the dropdown filters in the portfolio table work correctly.
* **Row Editing:** The script edits records in the table using inline editing and verifies that the save action works.

## 10. Campaigns (`10-campaigns`)
* **Advanced Create:** When creating a new campaign, the script fills in all required fields such as Name, Budget, and Dates, then saves the campaign.
* **State Toggles:** The script pauses an existing campaign and then resumes it again.
* **Pagination & Search:** When many campaigns are available, the script checks page navigation and verifies that text entered into the global filter searches correctly.

## 11. Smart Boost (`10b-smart-boost`)
* **Boost Creation:** The script fills in the Smart Boost campaign form and creates a campaign.
* **Top-up:** From the options menu of the created campaign, the script clicks `Top-Up`, adds an additional budget, and saves it.
* **Terminate:** From the campaign options menu, the script selects `Terminate`, chooses a reason, and cancels the campaign.

## 12. Reels (`11-reels`)
* **Multi-step Form:** When creating a new reel, the script fills in the Title and Description in Step 1, clicks `Next`, and checks whether the video upload drop zone appears in Step 2.
* **Interactions:** The script checks whether the created reel can be edited from the table and whether its details can be viewed.

## 13. Driver KPI Slabs (`11b-driver-kpi`)
* **Slabs Setup:** The script creates a new Speed of Delivery KPI slab by entering values such as Min minutes (for example, 1), Max minutes (for example, 10), and Weight (for example, 5). It then edits the slab, changes the Weight value, saves it, and finally deletes the slab.

## 14. TM Done Club (`12-tmdone-club`)
* **Subscriptions:** The script tests creating subscription plans for club members. It adds benefits and a price, submits the plan, and verifies that it can be updated or deleted easily.

---

**Summary: Why do we test this much?**
All these actions are played one after another by the automated script, similar to how a real user operates the browser. Whenever new code is added and this suite is run, the scripts can highlight where older functionality may have broken because of regression bugs. This helps maintain the quality of the admin console at a high level.
