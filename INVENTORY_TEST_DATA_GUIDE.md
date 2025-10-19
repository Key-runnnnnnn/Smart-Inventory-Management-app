# 📦 Complete Inventory Test Data & Operations Guide

## 📊 Current Inventory Summary (14 Items)

| #   | Item Name                       | SKU                        | Category        | Quantity | Status       | Expiry              |
| --- | ------------------------------- | -------------------------- | --------------- | -------- | ------------ | ------------------- |
| 1   | Amul Gold Full Cream Milk 1L    | AMUL-MILK-GOLD-1L          | Food & Beverage | 190 ltr  | In-Stock     | Expiring Soon       |
| 2   | Samsung Galaxy S24 Ultra 256GB  | SAMS-GS24U-256GB-TBLK-2024 | Electronics     | 75 pcs   | In-Stock     | -                   |
| 3   | Wooden Desk (Large)             | FURN-DSK-WD-LG             | Furniture       | 18 pcs   | In-Stock     | -                   |
| 4   | Surgical Masks (Box of 50)      | MED-MSK-SURG50             | Medical         | 12 box   | Low Stock    | Expiring This Month |
| 5   | LED Bulb 9W (Pack of 4)         | ELEC-BUL-LED9W             | Electronics     | 0 pack   | Out of Stock | -                   |
| 6   | Whiteboard Marker (Pack of 10)  | STAT-MKR-WB-10             | Stationery      | 3 pack   | Low Stock    | -                   |
| 7   | Men's Cotton T-Shirt            | CLO-TSH-MCOT-L             | Clothing        | 120 pcs  | In-Stock     | -                   |
| 8   | Basmati Rice (5kg)              | FOOD-RIC-BAS-5KG           | Food            | 95 pack  | In-Stock     | Valid               |
| 9   | Paracetamol 500mg (100 Tablets) | MED-TAB-PARA500            | Medical         | 5 box    | Low Stock    | Valid               |
| 10  | Engine Oil 5W-30 (1 Liter)      | AUTO-OIL-5W30              | Automotive      | 80 ltr   | In-Stock     | -                   |
| 11  | Samsung Galaxy S23              | ELEC-MOB-SGS23             | Electronics     | 8 pcs    | Low Stock    | -                   |
| 12  | Office Chair Ergonomic          | FURN-CHR-ERG01             | Furniture       | 45 pcs   | In-Stock     | -                   |
| 13  | A4 Paper Ream (500 Sheets)      | STAT-PAP-A4-500            | Stationery      | 150 pack | In-Stock     | -                   |
| 14  | HP Laptop ProBook 450           | ELEC-LAP-HP450             | Electronics     | 25 pcs   | In-Stock     | -                   |

---

## 🆕 NEW ITEMS TO ADD FROM FRONTEND (10 Items)

### ✅ Item 1: Dell XPS 13 Laptop

```json
{
  "name": "Dell XPS 13 9315 Laptop",
  "sku": "DELL-XPS13-9315-512GB",
  "description": "Ultra-portable 13.4\" FHD+ touchscreen laptop with Intel Core i7-1250U, 16GB RAM, 512GB SSD",
  "category": "Electronics",
  "subCategory": "Computers",
  "quantity": 35,
  "unit": "pcs",
  "reorderLevel": 8,
  "maxStockLevel": 80,
  "costPrice": 78000,
  "sellingPrice": 105999,
  "supplier": {
    "name": "Dell India Pvt Ltd",
    "contactPerson": "Arjun Malhotra",
    "phone": "+91-80-4093-9000",
    "email": "enterprise@dell.co.in"
  },
  "warehouseLocation": "Main Warehouse - Electronics Section",
  "rackNumber": "E-08-B-03",
  "status": "active",
  "notes": "Premium ultrabook series with 2-year warranty"
}
```

### ✅ Item 2: Apple iPhone 15 Pro

```json
{
  "name": "Apple iPhone 15 Pro 256GB Titanium Blue",
  "sku": "APPL-IP15PRO-256GB-TBLU",
  "description": "Latest iPhone with A17 Pro chip, 48MP camera system, titanium design, and USB-C",
  "category": "Electronics",
  "subCategory": "Smartphones",
  "quantity": 42,
  "unit": "pcs",
  "reorderLevel": 12,
  "maxStockLevel": 150,
  "costPrice": 115000,
  "sellingPrice": 134900,
  "supplier": {
    "name": "Apple India Operations",
    "contactPerson": "Priya Malhotra",
    "phone": "+91-124-462-2000",
    "email": "b2b@apple.co.in"
  },
  "warehouseLocation": "Secure Storage - Premium Electronics",
  "rackNumber": "E-01-A-01",
  "status": "active",
  "notes": "High-value item, requires extra security measures"
}
```

### ✅ Item 3: Sony WH-1000XM5 Headphones

```json
{
  "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
  "sku": "SONY-WH1000XM5-BLK",
  "description": "Premium wireless over-ear headphones with industry-leading noise cancellation",
  "category": "Electronics",
  "subCategory": "Audio",
  "quantity": 65,
  "unit": "pcs",
  "reorderLevel": 20,
  "maxStockLevel": 200,
  "costPrice": 18500,
  "sellingPrice": 29990,
  "supplier": {
    "name": "Sony India Pvt Ltd",
    "contactPerson": "Vikram Bhatia",
    "phone": "+91-124-476-7000",
    "email": "orders@sony.co.in"
  },
  "warehouseLocation": "Main Warehouse - Electronics Section",
  "rackNumber": "E-15-C-08",
  "status": "active",
  "notes": "Premium audio product with 1-year warranty"
}
```

### ✅ Item 4: Nestle Maggi Noodles 2-Minute

```json
{
  "name": "Nestle Maggi 2-Minute Masala Noodles (12-Pack)",
  "sku": "NEST-MAG-MAS-12PK",
  "description": "Classic instant noodles, masala flavor, 70g each packet, box of 12",
  "category": "Food & Beverage",
  "subCategory": "Instant Food",
  "quantity": 280,
  "unit": "pack",
  "reorderLevel": 100,
  "maxStockLevel": 800,
  "costPrice": 108,
  "sellingPrice": 144,
  "supplier": {
    "name": "Nestle India Ltd",
    "contactPerson": "Ashok Kumar",
    "phone": "+91-124-238-4000",
    "email": "orders@nestle.co.in"
  },
  "warehouseLocation": "Food Storage - Dry Goods Section",
  "rackNumber": "F-12-B-05",
  "expiryDate": "2026-04-15T00:00:00.000Z",
  "manufacturingDate": "2025-10-10T00:00:00.000Z",
  "batchNumber": "BATCH-MAGGI-2025-Q4-001",
  "status": "active",
  "notes": "Fast-moving consumer goods (FMCG)"
}
```

### ✅ Item 5: Britannia Good Day Cookies

```json
{
  "name": "Britannia Good Day Butter Cookies (Pack of 24)",
  "sku": "BRIT-GDAY-BUTR-24PK",
  "description": "Premium butter cookies with real butter, 100g each pack, carton of 24",
  "category": "Food & Beverage",
  "subCategory": "Biscuits & Cookies",
  "quantity": 195,
  "unit": "carton",
  "reorderLevel": 80,
  "maxStockLevel": 500,
  "costPrice": 432,
  "sellingPrice": 600,
  "supplier": {
    "name": "Britannia Industries Ltd",
    "contactPerson": "Ramesh Gupta",
    "phone": "+91-80-4007-7000",
    "email": "trade@britannia.co.in"
  },
  "warehouseLocation": "Food Storage - Dry Goods Section",
  "rackNumber": "F-08-A-12",
  "expiryDate": "2025-12-31T00:00:00.000Z",
  "manufacturingDate": "2025-09-15T00:00:00.000Z",
  "batchNumber": "BATCH-BRIT-GD-2025-092",
  "status": "active",
  "notes": "Popular snack item, high turnover"
}
```

### ✅ Item 6: Dettol Hand Sanitizer 5L

```json
{
  "name": "Dettol Instant Hand Sanitizer 5 Liter Refill",
  "sku": "DETT-HSAN-5L-REF",
  "description": "Alcohol-based hand sanitizer 75%, kills 99.9% germs, bulk refill pack",
  "category": "Medical",
  "subCategory": "Hygiene Products",
  "quantity": 48,
  "unit": "ltr",
  "reorderLevel": 25,
  "maxStockLevel": 150,
  "costPrice": 850,
  "sellingPrice": 1299,
  "supplier": {
    "name": "Reckitt Benckiser India Ltd",
    "contactPerson": "Dr. Anjali Nair",
    "phone": "+91-124-466-6000",
    "email": "corporate@reckitt.com"
  },
  "warehouseLocation": "Warehouse D - Medical Supplies",
  "rackNumber": "D-18-B-04",
  "expiryDate": "2027-06-30T00:00:00.000Z",
  "manufacturingDate": "2025-07-01T00:00:00.000Z",
  "batchNumber": "BATCH-DETT-2025-Q3-078",
  "status": "active",
  "notes": "Essential hygiene product, increased demand post-pandemic"
}
```

### ✅ Item 7: Nike Air Max Running Shoes

```json
{
  "name": "Nike Air Max 270 Running Shoes - Men's Size 9",
  "sku": "NIKE-AM270-M9-BLK",
  "description": "Premium running shoes with Air Max cushioning, black/white colorway",
  "category": "Clothing",
  "subCategory": "Footwear",
  "quantity": 55,
  "unit": "pcs",
  "reorderLevel": 15,
  "maxStockLevel": 120,
  "costPrice": 5800,
  "sellingPrice": 8995,
  "supplier": {
    "name": "Nike India Pvt Ltd",
    "contactPerson": "Sameer Khan",
    "phone": "+91-124-480-5000",
    "email": "trade@nike.co.in"
  },
  "warehouseLocation": "Warehouse B - Clothing & Apparel",
  "rackNumber": "B-12-C-09",
  "status": "active",
  "notes": "Popular sports footwear, multiple sizes available"
}
```

### ✅ Item 8: LG 32\" Smart LED TV

```json
{
  "name": "LG 32LM563BPTC HD Smart LED TV 32 Inch",
  "sku": "LG-TV-32LM563B-HD-SMT",
  "description": "32-inch HD Ready Smart LED TV with WebOS, built-in WiFi, and screen mirroring",
  "category": "Electronics",
  "subCategory": "Televisions",
  "quantity": 22,
  "unit": "pcs",
  "reorderLevel": 8,
  "maxStockLevel": 60,
  "costPrice": 14500,
  "sellingPrice": 18990,
  "supplier": {
    "name": "LG Electronics India Pvt Ltd",
    "contactPerson": "Deepak Sharma",
    "phone": "+91-120-470-0000",
    "email": "b2b@lge.com"
  },
  "warehouseLocation": "Main Warehouse - Electronics Section",
  "rackNumber": "E-20-A-05",
  "status": "active",
  "notes": "Smart TV with 1-year comprehensive warranty"
}
```

### ✅ Item 9: Godrej Refrigerator 185L

```json
{
  "name": "Godrej RD Edge 185 CTI Direct Cool Refrigerator",
  "sku": "GODR-REF-185L-DC-BLU",
  "description": "185L single door direct cool refrigerator, 2-star energy rating, blue color",
  "category": "Electronics",
  "subCategory": "Home Appliances",
  "quantity": 14,
  "unit": "pcs",
  "reorderLevel": 5,
  "maxStockLevel": 40,
  "costPrice": 11200,
  "sellingPrice": 14990,
  "supplier": {
    "name": "Godrej & Boyce Manufacturing Co Ltd",
    "contactPerson": "Manish Desai",
    "phone": "+91-22-2518-8010",
    "email": "orders@godrej.com"
  },
  "warehouseLocation": "Large Items Storage - Appliances",
  "rackNumber": "LA-05-B-02",
  "status": "active",
  "notes": "Large appliance, requires special handling and delivery"
}
```

### ✅ Item 10: Coca-Cola 2L Bottle

```json
{
  "name": "Coca-Cola 2 Liter PET Bottle (Pack of 12)",
  "sku": "COKE-2L-PET-12PK",
  "description": "Carbonated soft drink, 2-liter PET bottle, pack of 12 bottles",
  "category": "Food & Beverage",
  "subCategory": "Beverages",
  "quantity": 156,
  "unit": "pack",
  "reorderLevel": 60,
  "maxStockLevel": 400,
  "costPrice": 660,
  "sellingPrice": 960,
  "supplier": {
    "name": "Coca-Cola India Pvt Ltd",
    "contactPerson": "Rohit Verma",
    "phone": "+91-124-622-5000",
    "email": "orders@coca-cola.co.in"
  },
  "warehouseLocation": "Cold Storage - Beverages Section",
  "rackNumber": "C-05-A-08",
  "expiryDate": "2026-02-28T00:00:00.000Z",
  "manufacturingDate": "2025-10-01T00:00:00.000Z",
  "batchNumber": "BATCH-COKE-2025-Q4-145",
  "status": "active",
  "notes": "Keep in cool storage, high-demand beverage"
}
```

---

## 📥 STOCK-IN OPERATIONS (For Each Existing Item)

### 🔷 Stock-In #1: Amul Gold Full Cream Milk 1L

```json
{
  "itemId": "68f3c410378e32f37ecf5835",
  "quantity": 100,
  "reason": "purchase",
  "party": {
    "name": "Amul Dairy Cooperative Ltd",
    "type": "supplier",
    "contact": "+91-79-2665-0000 | orders@amul.co.in"
  },
  "unitPrice": 58,
  "notes": "Weekly purchase order - Fresh dairy stock. Contact: Suresh Patel",
  "invoiceNumber": "INV-AMUL-2025-1018",
  "referenceNumber": "PO-DAIRY-2025-10-042"
}
```

### 🔷 Stock-In #2: Samsung Galaxy S24 Ultra

```json
{
  "itemId": "68f3ba2b8ae280e17917db12",
  "quantity": 25,
  "reason": "purchase",
  "party": {
    "name": "Samsung India Electronics Pvt Ltd",
    "contactPerson": "Rajesh Kumar",
    "phone": "+91-124-456-7890",
    "email": "b2b@samsung.co.in"
  },
  "unitPrice": 95000,
  "notes": "New stock for Diwali sale season",
  "invoiceNumber": "INV-SAMS-2025-10185",
  "purchaseOrderNumber": "PO-ELECTRONICS-2025-10-031"
}
```

### 🔷 Stock-In #3: Wooden Desk (Large)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac529b",
  "quantity": 12,
  "reason": "purchase",
  "party": {
    "name": "Furniture Mart",
    "contactPerson": "Amit Patel",
    "phone": "+91-9876543212",
    "email": "amit@furnituremart.com"
  },
  "unitPrice": 8500,
  "notes": "Bulk order for corporate office setup",
  "invoiceNumber": "INV-FURN-2025-10-204",
  "purchaseOrderNumber": "PO-FURNITURE-2025-10-018"
}
```

### 🔷 Stock-In #4: Surgical Masks (Box of 50)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac529a",
  "quantity": 50,
  "reason": "purchase",
  "party": {
    "name": "MediCare Supplies",
    "contactPerson": "Dr. Gupta",
    "phone": "+91-9876543220",
    "email": "gupta@medicare.com"
  },
  "unitPrice": 180,
  "notes": "Restocking low inventory - Medical supplies essential",
  "invoiceNumber": "INV-MEDI-2025-10-389",
  "purchaseOrderNumber": "PO-MEDICAL-2025-10-067"
}
```

### 🔷 Stock-In #5: LED Bulb 9W (Pack of 4)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5299",
  "quantity": 80,
  "reason": "purchase",
  "party": {
    "name": "Lighting Solutions",
    "contactPerson": "Ravi Kumar",
    "phone": "+91-9876543219",
    "email": "ravi@lightingsolutions.com"
  },
  "unitPrice": 180,
  "notes": "Urgent restocking - Currently out of stock",
  "invoiceNumber": "INV-LIGHT-2025-10-512",
  "purchaseOrderNumber": "PO-ELECTRONICS-2025-10-089"
}
```

### 🔷 Stock-In #6: Whiteboard Marker (Pack of 10)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5298",
  "quantity": 40,
  "reason": "purchase",
  "party": {
    "name": "Office Supplies Co",
    "contactPerson": "Anita Desai",
    "phone": "+91-9876543218",
    "email": "anita@officesupplies.com"
  },
  "unitPrice": 120,
  "notes": "Monthly stationery restock",
  "invoiceNumber": "INV-STAT-2025-10-625",
  "purchaseOrderNumber": "PO-STATIONERY-2025-10-045"
}
```

### 🔷 Stock-In #7: Men's Cotton T-Shirt

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5296",
  "quantity": 80,
  "reason": "purchase",
  "party": {
    "name": "Fashion Textiles",
    "contactPerson": "Neha Kapoor",
    "phone": "+91-9876543216",
    "email": "neha@fashiontextiles.com"
  },
  "unitPrice": 150,
  "notes": "New arrival - Autumn/Winter collection",
  "invoiceNumber": "INV-FASH-2025-10-714",
  "purchaseOrderNumber": "PO-CLOTHING-2025-10-052"
}
```

### 🔷 Stock-In #8: Basmati Rice (5kg)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5297",
  "quantity": 60,
  "reason": "purchase",
  "party": {
    "name": "Grain Traders",
    "contactPerson": "Vikram Reddy",
    "phone": "+91-9876543217",
    "email": "vikram@graintraders.com"
  },
  "unitPrice": 280,
  "notes": "Premium quality basmati - Festival season stock",
  "invoiceNumber": "INV-GRAIN-2025-10-823",
  "purchaseOrderNumber": "PO-FOOD-2025-10-071"
}
```

### 🔷 Stock-In #9: Paracetamol 500mg

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5294",
  "quantity": 45,
  "reason": "purchase",
  "party": {
    "name": "PharmaCorp",
    "contactPerson": "Dr. Mehta",
    "phone": "+91-9876543214",
    "email": "mehta@pharmacorp.com"
  },
  "unitPrice": 25,
  "notes": "Essential medicine restock - Low stock alert",
  "invoiceNumber": "INV-PHARM-2025-10-956",
  "purchaseOrderNumber": "PO-MEDICAL-2025-10-084"
}
```

### 🔷 Stock-In #10: Engine Oil 5W-30

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5295",
  "quantity": 40,
  "reason": "purchase",
  "party": {
    "name": "Auto Parts India",
    "contactPerson": "Karan Singh",
    "phone": "+91-9876543215",
    "email": "karan@autopartsindia.com"
  },
  "unitPrice": 320,
  "notes": "Regular automotive supplies replenishment",
  "invoiceNumber": "INV-AUTO-2025-10-107",
  "purchaseOrderNumber": "PO-AUTOMOTIVE-2025-10-028"
}
```

### 🔷 Stock-In #11: Samsung Galaxy S23

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5291",
  "quantity": 20,
  "reason": "purchase",
  "party": {
    "name": "Mobile Masters",
    "contactPerson": "Priya Sharma",
    "phone": "+91-9876543211",
    "email": "priya@mobilemasters.com"
  },
  "unitPrice": 55000,
  "notes": "Clearance stock before S24 launch",
  "invoiceNumber": "INV-MOB-2025-10-218",
  "purchaseOrderNumber": "PO-ELECTRONICS-2025-10-095"
}
```

### 🔷 Stock-In #12: Office Chair Ergonomic

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5292",
  "quantity": 25,
  "reason": "purchase",
  "party": {
    "name": "Furniture Mart",
    "contactPerson": "Amit Patel",
    "phone": "+91-9876543212",
    "email": "amit@furnituremart.com"
  },
  "unitPrice": 3500,
  "notes": "Office furniture bulk order for new setup",
  "invoiceNumber": "INV-FURN-2025-10-329",
  "purchaseOrderNumber": "PO-FURNITURE-2025-10-042"
}
```

### 🔷 Stock-In #13: A4 Paper Ream

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5293",
  "quantity": 100,
  "reason": "purchase",
  "party": {
    "name": "Paper Plus",
    "contactPerson": "Sunita Verma",
    "phone": "+91-9876543213",
    "email": "sunita@paperplus.com"
  },
  "unitPrice": 180,
  "notes": "Quarterly bulk stationery purchase",
  "invoiceNumber": "INV-PAP-2025-10-434",
  "purchaseOrderNumber": "PO-STATIONERY-2025-10-061"
}
```

### 🔷 Stock-In #14: HP Laptop ProBook 450

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5290",
  "quantity": 15,
  "reason": "purchase",
  "party": {
    "name": "Tech Distributors Ltd",
    "contactPerson": "Rajesh Kumar",
    "phone": "+91-9876543210",
    "email": "rajesh@techdist.com"
  },
  "unitPrice": 45000,
  "notes": "Corporate laptop bulk order",
  "invoiceNumber": "INV-TECH-2025-10-545",
  "purchaseOrderNumber": "PO-ELECTRONICS-2025-10-078"
}
```

---

## 📤 STOCK-OUT OPERATIONS (For Each Existing Item)

### 🔶 Stock-Out #1: Amul Gold Full Cream Milk 1L

```json
{
  "itemId": "68f3c410378e32f37ecf5835",
  "quantity": 50,
  "reason": "sale",
  "party": {
    "name": "Metro Cash & Carry",
    "contactPerson": "Sanjay Gupta",
    "phone": "+91-11-4567-8900",
    "email": "sanjay.gupta@metro.in"
  },
  "unitPrice": 64.99,
  "notes": "Wholesale order for retail chain",
  "invoiceNumber": "OUT-INV-2025-10-1501"
}
```

### 🔶 Stock-Out #2: Samsung Galaxy S24 Ultra

```json
{
  "itemId": "68f3ba2b8ae280e17917db12",
  "quantity": 8,
  "reason": "sale",
  "party": {
    "name": "TechWorld Retail",
    "contactPerson": "Arjun Mehta",
    "phone": "+91-22-3456-7890",
    "email": "arjun@techworld.com"
  },
  "unitPrice": 124999,
  "notes": "Corporate bulk order for employee purchase",
  "invoiceNumber": "OUT-INV-2025-10-1502"
}
```

### 🔶 Stock-Out #3: Wooden Desk (Large)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac529b",
  "quantity": 6,
  "reason": "sale",
  "party": {
    "name": "Corporate Solutions Pvt Ltd",
    "contactPerson": "Meera Patel",
    "phone": "+91-80-2345-6789",
    "email": "meera@corpsolutions.com"
  },
  "unitPrice": 13500,
  "notes": "Office setup for new branch",
  "invoiceNumber": "OUT-INV-2025-10-1503"
}
```

### 🔶 Stock-Out #4: Surgical Masks (Box of 50)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac529a",
  "quantity": 15,
  "reason": "sale",
  "party": {
    "name": "City Hospital",
    "contactPerson": "Dr. Rajesh Kumar",
    "phone": "+91-11-2789-4561",
    "email": "purchase@cityhospital.in"
  },
  "unitPrice": 299,
  "notes": "Medical supplies for hospital inventory",
  "invoiceNumber": "OUT-INV-2025-10-1504"
}
```

### 🔶 Stock-Out #5: LED Bulb 9W (Pack of 4)

**Note:** Currently out of stock (0 quantity). Perform stock-in first before stock-out.

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5299",
  "quantity": 25,
  "reason": "sale",
  "party": {
    "name": "Home Decor Unlimited",
    "contactPerson": "Rakesh Singh",
    "phone": "+91-44-3456-7890",
    "email": "rakesh@homedecor.in"
  },
  "unitPrice": 299,
  "notes": "Retail chain bulk order for LED bulbs",
  "invoiceNumber": "OUT-INV-2025-10-1505"
}
```

**⚠️ Important:** Stock-in this item first (add 80 pieces) before attempting stock-out.

### 🔶 Stock-Out #6: Whiteboard Marker (Pack of 10)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5298",
  "quantity": 12,
  "reason": "sale",
  "party": {
    "name": "Smart Schools India",
    "contactPerson": "Ms. Kavita Sharma",
    "phone": "+91-124-567-8901",
    "email": "kavita@smartschools.edu.in"
  },
  "unitPrice": 199,
  "notes": "Educational institution stationery order",
  "invoiceNumber": "OUT-INV-2025-10-1506"
}
```

### 🔶 Stock-Out #7: Men's Cotton T-Shirt

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5296",
  "quantity": 45,
  "reason": "sale",
  "party": {
    "name": "Fashion Hub Retail",
    "contactPerson": "Deepak Verma",
    "phone": "+91-20-3456-7890",
    "email": "deepak@fashionhub.in"
  },
  "unitPrice": 399,
  "notes": "Seasonal clothing sale to retail chain",
  "invoiceNumber": "OUT-INV-2025-10-1507"
}
```

### 🔶 Stock-Out #8: Basmati Rice (5kg)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5297",
  "quantity": 30,
  "reason": "sale",
  "party": {
    "name": "Reliance Fresh",
    "contactPerson": "Amit Khanna",
    "phone": "+91-22-6678-9000",
    "email": "amit.khanna@reliancefresh.in"
  },
  "unitPrice": 450,
  "notes": "FMCG retail chain order",
  "invoiceNumber": "OUT-INV-2025-10-1508"
}
```

### 🔶 Stock-Out #9: Paracetamol 500mg

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5294",
  "quantity": 18,
  "reason": "sale",
  "party": {
    "name": "MedPlus Pharmacy",
    "contactPerson": "Mr. Subhash Reddy",
    "phone": "+91-40-6789-1234",
    "email": "subhash@medplus.in"
  },
  "unitPrice": 45,
  "notes": "Pharmaceutical chain bulk order",
  "invoiceNumber": "OUT-INV-2025-10-1509"
}
```

### 🔶 Stock-Out #10: Engine Oil 5W-30

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5295",
  "quantity": 35,
  "reason": "sale",
  "party": {
    "name": "AutoService Pro",
    "contactPerson": "Rajiv Kapoor",
    "phone": "+91-11-4567-8900",
    "email": "rajiv@autoservicepro.com"
  },
  "unitPrice": 450,
  "notes": "Auto service center bulk purchase",
  "invoiceNumber": "OUT-INV-2025-10-1510"
}
```

### 🔶 Stock-Out #11: Samsung Galaxy S23

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5291",
  "quantity": 5,
  "reason": "sale",
  "party": {
    "name": "Mobile World Retailers",
    "contactPerson": "Nisha Agarwal",
    "phone": "+91-79-3456-7890",
    "email": "nisha@mobileworld.in"
  },
  "unitPrice": 72000,
  "notes": "Retail store stock replenishment",
  "invoiceNumber": "OUT-INV-2025-10-1511"
}
```

### 🔶 Stock-Out #12: Office Chair Ergonomic

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5292",
  "quantity": 20,
  "reason": "sale",
  "party": {
    "name": "Startup Hub Coworking",
    "contactPerson": "Vishal Gupta",
    "phone": "+91-124-789-0123",
    "email": "vishal@startuphub.co.in"
  },
  "unitPrice": 5500,
  "notes": "Coworking space furniture order",
  "invoiceNumber": "OUT-INV-2025-10-1512"
}
```

### 🔶 Stock-Out #13: A4 Paper Ream

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5293",
  "quantity": 60,
  "reason": "sale",
  "party": {
    "name": "Corporate Print Solutions",
    "contactPerson": "Anjali Desai",
    "phone": "+91-22-4567-8901",
    "email": "anjali@corpprint.com"
  },
  "unitPrice": 250,
  "notes": "Corporate stationery bulk order",
  "invoiceNumber": "OUT-INV-2025-10-1513"
}
```

### 🔶 Stock-Out #14: HP Laptop ProBook 450

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5290",
  "quantity": 10,
  "reason": "sale",
  "party": {
    "name": "IT Solutions Enterprise",
    "contactPerson": "Manish Sharma",
    "phone": "+91-80-6789-0123",
    "email": "manish@itsolutions.co.in"
  },
  "unitPrice": 58000,
  "notes": "Corporate IT equipment order",
  "invoiceNumber": "OUT-INV-2025-10-1514"
}
```

---

## 🔧 ADDITIONAL STOCK OPERATIONS (Adjustments, Returns, Damages)

### 🔧 Adjustment Example 1: LED Bulb Damage

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5299",
  "quantity": 5,
  "reason": "damage",
  "notes": "Damaged during warehouse handling - write-off",
  "invoiceNumber": "ADJ-2025-10-001"
}
```

### 🔧 Adjustment Example 2: Milk Expiry

```json
{
  "itemId": "68f3c410378e32f37ecf5835",
  "quantity": 10,
  "reason": "expired",
  "notes": "Product expired - removed from inventory",
  "invoiceNumber": "ADJ-2025-10-002"
}
```

### 🔧 Adjustment Example 3: Inventory Count Correction

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5298",
  "quantity": 2,
  "reason": "inventory-audit",
  "notes": "Physical inventory count adjustment - discrepancy found",
  "invoiceNumber": "ADJ-2025-10-003"
}
```

### 🔧 Return Example 1: Customer Return

```json
{
  "itemId": "68f3ba2b8ae280e17917db12",
  "quantity": 1,
  "reason": "customer-return",
  "party": {
    "name": "TechWorld Retail",
    "contactPerson": "Arjun Mehta",
    "phone": "+91-22-3456-7890",
    "email": "arjun@techworld.com"
  },
  "unitPrice": 124999,
  "notes": "Customer return - defective unit, testing required",
  "invoiceNumber": "RET-INV-2025-10-1001"
}
```

---

## 📊 SUMMARY OF OPERATIONS

### Inventory Status After All Operations:

| Item              | Current Qty | After Stock-In | After Stock-Out | Final Qty | Status      |
| ----------------- | ----------- | -------------- | --------------- | --------- | ----------- |
| Amul Milk         | 190 ltr     | +100 = 290     | -50 = 240       | 240 ltr   | ✅ In-Stock |
| Samsung S24 Ultra | 75 pcs      | +25 = 100      | -8 = 92         | 92 pcs    | ✅ In-Stock |
| Wooden Desk       | 18 pcs      | +12 = 30       | -6 = 24         | 24 pcs    | ✅ In-Stock |
| Surgical Masks    | 12 box      | +50 = 62       | -15 = 47        | 47 box    | ✅ In-Stock |
| LED Bulb          | 0 pack      | +80 = 80       | -25 = 55        | 55 pack   | ✅ In-Stock |
| Whiteboard Marker | 3 pack      | +40 = 43       | -12 = 31        | 31 pack   | ✅ In-Stock |
| Men's T-Shirt     | 120 pcs     | +80 = 200      | -45 = 155       | 155 pcs   | ✅ In-Stock |
| Basmati Rice      | 95 pack     | +60 = 155      | -30 = 125       | 125 pack  | ✅ In-Stock |
| Paracetamol       | 5 box       | +45 = 50       | -18 = 32        | 32 box    | ✅ In-Stock |
| Engine Oil        | 80 ltr      | +40 = 120      | -35 = 85        | 85 ltr    | ✅ In-Stock |
| Samsung S23       | 8 pcs       | +20 = 28       | -5 = 23         | 23 pcs    | ✅ In-Stock |
| Office Chair      | 45 pcs      | +25 = 70       | -20 = 50        | 50 pcs    | ✅ In-Stock |
| A4 Paper          | 150 pack    | +100 = 250     | -60 = 190       | 190 pack  | ✅ In-Stock |
| HP Laptop         | 25 pcs      | +15 = 40       | -10 = 30        | 30 pcs    | ✅ In-Stock |

---

## 🎯 TESTING WORKFLOW

### Step 1: Add New Items (10 items from frontend)

1. Navigate to Inventory page
2. Click "Add New Item"
3. Fill in details from "NEW ITEMS TO ADD" section above
4. Submit each item

### Step 2: Perform Stock-In Operations (14 operations)

1. Go to Transactions page
2. Click "Stock In"
3. Use data from "STOCK-IN OPERATIONS" section
4. Verify inventory quantities increase

### Step 3: Perform Stock-Out Operations (14 operations)

1. Go to Transactions page
2. Click "Stock Out"
3. Use data from "STOCK-OUT OPERATIONS" section
4. Verify inventory quantities decrease

### Step 4: Test Additional Operations

1. Try adjustment operations (damage, expiry, audit)
2. Test return operations
3. Verify transaction history updates

### Step 5: Verify Analytics & Reports

1. Check Dashboard for updated stats
2. Review Analytics page for trends
3. Generate monthly report
4. Check alerts for low stock items

---

## 🔍 VERIFICATION CHECKLIST

- [ ] All 10 new items added successfully
- [ ] All 14 stock-in operations completed
- [ ] All 14 stock-out operations completed
- [ ] Inventory quantities match expected values
- [ ] Transaction history shows all operations
- [ ] Dashboard stats updated correctly
- [ ] Analytics page reflects new data
- [ ] Low stock alerts triggered appropriately
- [ ] Stock value calculations accurate
- [ ] Real-time updates working via WebSocket

---

**✅ This guide provides complete test data for comprehensive inventory operations testing!**
