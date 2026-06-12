# TMDone Admin Console - Automation Testing Coverage (Detailed Explanation)

Me document eken harima wistharathmakawa explain karanne TMDone Admin console eke Playwright automation scripts walin test karana main modules saha ewaye features monawada kiyala. 

Meka kiyawaddi oyata therei script eka athule step-by-step monawada wenne kiyala.

---

## 1. Authentication (`01-auth`)
* **Valid Login:** Script eka mulinma browser eka open karala login page ekata yanawa. Eta passe hari username (email) eka saha password eka type karala 'Login' button eka click karanawa. Login wunata passe URL eka maru wela dashboard eka load wenawada kiyala check karanawa.
* **Invalid Login:** Waradi email ekak hari password ekak hari deela login click kalama, system eken "Invalid credentials" kiyala ratu patin error message eka display wenawada kiyala script eken verify karanawa.

## 2. Dashboard (`02-dashboard`)
* **Page Load & Widgets:** Dashboard ekata giyama eke thiyena pradhana widgets (Active Orders, Revenue, Users counts) hariyata load wela data pennanawada kiyala check karanawa. Empty cards nemei, numbers thiyanawada kiyala balanawa.
* **Sidebar Navigation:** Sidebar eke thiyena links (Stores, Users, Campaigns) click karala e adala pages walata yanawada kiyala menu eka check karanawa.

## 3. Vendor Performance (`03-vendor-performance`)
* **Data Table:** Vendor lage orders saha ratings pennana table eka load wenawada kiyala balanawa. Table eke headers saha adu gane eka row ekak hari thiyanawada kiyala check karanawa.
* **Filters & Pagination:** Stores hari dates hari filter kalama table eka update wenawada saha pages maru karanakota next page ekata data enawada kiyala check karanawa.

## 4. Reports (`04-reports`)
* **Tabs & Navigation:** Reports page eke thiyena tabs (e.g., Financial, Operational) athara maru wenakota hariyata tab eka active wenawada kiyala balanawa.
* **Filters:** Zone eka saha Store eka dropdown walin select karanakota list eka filter wenawada kiyala check karanawa. Date picker eken 'Today' hari adala daws hari select karanna puluwanda balanawa.
* **Export:** Download / Export button eka disable wela nathuwa click karanna puluwan thathwaye thiyanawada kiyala check karanawa.

## 5. Analysis (`05-analysis`)
* **Charts Validation:** Analysis page eke thiyena Highcharts/Canvas graphs html DOM eke render wela thiyanawada kiyala check karanawa.
* **Store Comparison:** Compare section eke dropdowns deken stores dekak select karala ekata compare karanna puluwanda kiyala test karanawa.

## 6. Stores & Store Ratings (`06-stores`)
* **Store Search:** Search box eke "Test" kiyala type karala search kalama, adala store eka witharak table eke pennanawada kiyala check karanawa. Eka ayeth clear kalama parana list ekama enawada balanawa.
* **Store Status Edit:** Store eke nama click karala details dialog eka open karagena, eke thiyena 'Active' toggle switch eka click karala store eka disable/enable karala save karanawa.
* **Ratings:** Store ratings page ekata gihin eke ratings table eka saha export button eka wada karanawada kiyala balanawa.

## 7. Offers (`07-offers`) (Full CRUD Test)
* **Create:** 'Create Offer' click karala popup eke nama (Offer name), category eka select karala Save karanawa.
* **Read:** Hadapu offer eke nama search box eke gahala eka table eke enawada kiyala confirm karanawa.
* **Update:** E hadapu offer eka row eke options walin 'Edit' click karala, nama wenas karala update karanawa.
* **Delete:** Antimata e offer ekama 'Delete' click karala, SweetAlert confirmation box eke 'Yes' click karala delete karala danawa.

## 8. Order Management (`08-order-management`)
* **Search Orders:** Order ID ekak dunnama eka table eke enawada kiyala check karanawa.
* **Status Updates:** Order eka view karala, eke status eka (e.g., Pending to Accepted) wenas karanna puluwanda kiyala e adala popup eken check karanawa.

## 9. Portfolio & Accounts (`09-portfolio-accounts`)
* **Filters:** Portfolio table eke data filter karana dropdowns wada da kiyala balanawa.
* **Row Editing:** Table eke records edit karala (inline editing) save karana action eka wada da kiyala check karanawa.

## 10. Campaigns (`10-campaigns`)
* **Advanced Create:** Aluth campaign ekak hadanakota Name, Budget, Dates okkoma fill karala save karanawa.
* **State Toggles:** Thiyena campaign ekak "Pause" karala ayeth "Resume" karanawa.
* **Pagination & Search:** Campaigns godak thiyenakota pages maru karana eka saha global filter eken text ekak deela search karana eka check karanawa.

## 11. Smart Boost (`10b-smart-boost`)
* **Boost Creation:** Smart Boost campaign ekak form eka fill karala create karanawa.
* **Top-up:** Hadapu campaign eke options menu eken "Top-Up" click karala thawa budget ekak add karala save karanawa.
* **Terminate:** Campaign eka options walin "Terminate" gihin reason ekak select karala cancel karanawa.

## 12. Reels (`11-reels`)
* **Multi-step Form:** Aluth reel ekak hadanakota Step 1 eke Title, Description dila 'Next' gihin, Step 2 eke Video upload section eka (Drop zone eka) penenawada kiyala check karanawa.
* **Interactions:** Hadapu reel eka table eken Edit karana eka saha View karala details balana eka check karanawa.

## 13. Driver KPI Slabs (`11b-driver-kpi`)
* **Slabs Setup:** Speed of delivery KPI eke Min minutes (e.g., 1), Max minutes (e.g., 10), Weight (e.g., 5) deela aluth slab ekak create karanawa. Eta passe eka edit karala Weight eka wenas karala save karanawa. Awasanayeta eka delete karanawa.

## 14. TM Done Club (`12-tmdone-club`)
* **Subscriptions:** Club members lata thiyena subscription plans create karana eka. Eke benefits, price add karala submit karana eka saha eka pahasuwen update/delete karana eka test karanawa.

---

**Summery (Mechchara dewal test karanne aeyi?):**
Me okkoma actions, ekakk passey ekak automated script eken play wenawa (harima manussayek browser eka use karanawa wage). System eke aluthen code dapu gaman meka run kalama, parana code walata mokakhari haniyak wela nam (regression bugs), me script eken point karala pennanawa koheda waradda kiyala. Eken admin console eke quality eka uparimayen thiyaganna puluwan.
