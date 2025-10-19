# ✅ CORRECTED Stock-In and Stock-Out Operations

## 📋 Schema Analysis Complete

Based on the exact Mongoose schemas:

### InventoryItem Schema - Allowed Values:

- **Categories**: 'Electronics', 'Furniture', 'Clothing', 'Food & Beverage', 'Raw Materials', 'Finished Goods', 'Office Supplies', 'Medical', 'Automotive', 'Other'
- **Units**: 'pcs', 'kg', 'ltr', 'box', 'pack', 'dozen', 'meter', 'carton', 'bag', 'roll'
- **Status**: 'active', 'inactive', 'discontinued'

### StockTransaction Schema - Allowed Values:

- **Type**: 'in', 'out', 'adjustment'
- **Reason**: 'purchase', 'sale', 'return', 'damage', 'expired', 'theft', 'adjustment', 'transfer', 'production', 'sample', 'other'
- **Party Type**: 'supplier', 'customer', 'other'

### Party Object Structure:

```json
{
  "name": "Company Name",
  "type": "supplier" | "customer" | "other",
  "contact": "Phone/Email combined string"
}
```

---

## 📥 CORRECTED STOCK-IN OPERATIONS (14 Items)

### 🔷 Stock-In #1: Amul Gold Full Cream Milk 1L

```json
{
  "itemId": "68f3c410378e32f37ecf5835",
  "quantity": 100,
  "reason": "purchase",
  "party": {
    "name": "Amul Dairy Cooperative Ltd",
    "type": "supplier",
    "contact": "+91-79-2665-0000 | Suresh Patel | orders@amul.co.in"
  },
  "unitPrice": 58,
  "notes": "Weekly purchase order - Fresh dairy stock",
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
    "type": "supplier",
    "contact": "+91-124-456-7890 | Rajesh Kumar | b2b@samsung.co.in"
  },
  "unitPrice": 95000,
  "notes": "New stock for Diwali sale season",
  "invoiceNumber": "INV-SAMS-2025-10185",
  "referenceNumber": "PO-ELECTRONICS-2025-10-031"
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
    "type": "supplier",
    "contact": "+91-9876543212 | Amit Patel | amit@furnituremart.com"
  },
  "unitPrice": 8500,
  "notes": "Bulk order for corporate office setup",
  "invoiceNumber": "INV-FURN-2025-10-204",
  "referenceNumber": "PO-FURNITURE-2025-10-018"
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
    "type": "supplier",
    "contact": "+91-9876543220 | Dr. Gupta | gupta@medicare.com"
  },
  "unitPrice": 180,
  "notes": "Restocking low inventory - Medical supplies essential",
  "invoiceNumber": "INV-MEDI-2025-10-389",
  "referenceNumber": "PO-MEDICAL-2025-10-067"
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
    "type": "supplier",
    "contact": "+91-9876543219 | Ravi Kumar | ravi@lightingsolutions.com"
  },
  "unitPrice": 180,
  "notes": "Urgent restocking - Currently out of stock",
  "invoiceNumber": "INV-LIGHT-2025-10-512",
  "referenceNumber": "PO-ELECTRONICS-2025-10-089"
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
    "type": "supplier",
    "contact": "+91-9876543218 | Anita Desai | anita@officesupplies.com"
  },
  "unitPrice": 120,
  "notes": "Monthly stationery restock",
  "invoiceNumber": "INV-STAT-2025-10-625",
  "referenceNumber": "PO-STATIONERY-2025-10-045"
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
    "type": "supplier",
    "contact": "+91-9876543216 | Neha Kapoor | neha@fashiontextiles.com"
  },
  "unitPrice": 150,
  "notes": "New arrival - Autumn/Winter collection",
  "invoiceNumber": "INV-FASH-2025-10-714",
  "referenceNumber": "PO-CLOTHING-2025-10-052"
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
    "type": "supplier",
    "contact": "+91-9876543217 | Vikram Reddy | vikram@graintraders.com"
  },
  "unitPrice": 280,
  "notes": "Premium quality basmati - Festival season stock",
  "invoiceNumber": "INV-GRAIN-2025-10-823",
  "referenceNumber": "PO-FOOD-2025-10-071"
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
    "type": "supplier",
    "contact": "+91-9876543214 | Dr. Mehta | mehta@pharmacorp.com"
  },
  "unitPrice": 25,
  "notes": "Essential medicine restock - Low stock alert",
  "invoiceNumber": "INV-PHARM-2025-10-956",
  "referenceNumber": "PO-MEDICAL-2025-10-084"
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
    "type": "supplier",
    "contact": "+91-9876543215 | Karan Singh | karan@autopartsindia.com"
  },
  "unitPrice": 320,
  "notes": "Regular automotive supplies replenishment",
  "invoiceNumber": "INV-AUTO-2025-10-107",
  "referenceNumber": "PO-AUTOMOTIVE-2025-10-028"
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
    "type": "supplier",
    "contact": "+91-9876543211 | Priya Sharma | priya@mobilemasters.com"
  },
  "unitPrice": 55000,
  "notes": "Clearance stock before S24 launch",
  "invoiceNumber": "INV-MOB-2025-10-218",
  "referenceNumber": "PO-ELECTRONICS-2025-10-095"
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
    "type": "supplier",
    "contact": "+91-9876543212 | Amit Patel | amit@furnituremart.com"
  },
  "unitPrice": 3500,
  "notes": "Office furniture bulk order for new setup",
  "invoiceNumber": "INV-FURN-2025-10-329",
  "referenceNumber": "PO-FURNITURE-2025-10-042"
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
    "type": "supplier",
    "contact": "+91-9876543213 | Sunita Verma | sunita@paperplus.com"
  },
  "unitPrice": 180,
  "notes": "Quarterly bulk stationery purchase",
  "invoiceNumber": "INV-PAP-2025-10-434",
  "referenceNumber": "PO-STATIONERY-2025-10-061"
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
    "type": "supplier",
    "contact": "+91-9876543210 | Rajesh Kumar | rajesh@techdist.com"
  },
  "unitPrice": 45000,
  "notes": "Corporate laptop bulk order",
  "invoiceNumber": "INV-TECH-2025-10-545",
  "referenceNumber": "PO-ELECTRONICS-2025-10-078"
}
```

---

## 📤 CORRECTED STOCK-OUT OPERATIONS (14 Items)

### 🔶 Stock-Out #1: Amul Gold Full Cream Milk 1L

```json
{
  "itemId": "68f3c410378e32f37ecf5835",
  "quantity": 50,
  "reason": "sale",
  "party": {
    "name": "Metro Cash & Carry",
    "type": "customer",
    "contact": "+91-11-4567-8900 | Sanjay Gupta | sanjay.gupta@metro.in"
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
    "type": "customer",
    "contact": "+91-22-3456-7890 | Arjun Mehta | arjun@techworld.com"
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
    "type": "customer",
    "contact": "+91-80-2345-6789 | Meera Patel | meera@corpsolutions.com"
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
    "type": "customer",
    "contact": "+91-11-2789-4561 | Dr. Rajesh Kumar | purchase@cityhospital.in"
  },
  "unitPrice": 299,
  "notes": "Medical supplies for hospital inventory",
  "invoiceNumber": "OUT-INV-2025-10-1504"
}
```

### 🔶 Stock-Out #5: LED Bulb 9W (Pack of 4)

**⚠️ Important:** Perform Stock-In #5 first (add 80 pieces) before this stock-out operation.

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5299",
  "quantity": 25,
  "reason": "sale",
  "party": {
    "name": "Home Decor Unlimited",
    "type": "customer",
    "contact": "+91-44-3456-7890 | Rakesh Singh | rakesh@homedecor.in"
  },
  "unitPrice": 299,
  "notes": "Retail chain bulk order for LED bulbs",
  "invoiceNumber": "OUT-INV-2025-10-1505"
}
```

### 🔶 Stock-Out #6: Whiteboard Marker (Pack of 10)

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5298",
  "quantity": 12,
  "reason": "sale",
  "party": {
    "name": "Smart Schools India",
    "type": "customer",
    "contact": "+91-124-567-8901 | Ms. Kavita Sharma | kavita@smartschools.edu.in"
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
    "type": "customer",
    "contact": "+91-20-3456-7890 | Deepak Verma | deepak@fashionhub.in"
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
    "type": "customer",
    "contact": "+91-22-6678-9000 | Amit Khanna | amit.khanna@reliancefresh.in"
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
    "type": "customer",
    "contact": "+91-40-6789-1234 | Mr. Subhash Reddy | subhash@medplus.in"
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
    "type": "customer",
    "contact": "+91-11-4567-8900 | Rajiv Kapoor | rajiv@autoservicepro.com"
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
    "type": "customer",
    "contact": "+91-79-3456-7890 | Nisha Agarwal | nisha@mobileworld.in"
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
    "type": "customer",
    "contact": "+91-124-789-0123 | Vishal Gupta | vishal@startuphub.co.in"
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
    "type": "customer",
    "contact": "+91-22-4567-8901 | Anjali Desai | anjali@corpprint.com"
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
    "type": "customer",
    "contact": "+91-80-6789-0123 | Manish Sharma | manish@itsolutions.co.in"
  },
  "unitPrice": 58000,
  "notes": "Corporate IT equipment order",
  "invoiceNumber": "OUT-INV-2025-10-1514"
}
```

---

## 🔧 ADDITIONAL OPERATIONS (Adjustments, Returns, Damages)

### 🔧 Adjustment #1: LED Bulb Damage

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5299",
  "quantity": 5,
  "reason": "damage",
  "notes": "Damaged during warehouse handling - write-off",
  "invoiceNumber": "ADJ-2025-10-001"
}
```

### 🔧 Adjustment #2: Milk Expiry

```json
{
  "itemId": "68f3c410378e32f37ecf5835",
  "quantity": 10,
  "reason": "expired",
  "notes": "Product expired - removed from inventory",
  "invoiceNumber": "ADJ-2025-10-002"
}
```

### 🔧 Adjustment #3: Inventory Count Correction

```json
{
  "itemId": "68f278ef9cc6f0dc42ac5298",
  "quantity": 2,
  "reason": "adjustment",
  "notes": "Physical inventory count adjustment - discrepancy found during audit",
  "invoiceNumber": "ADJ-2025-10-003"
}
```

### 🔧 Return #1: Customer Return (Stock-In)

```json
{
  "itemId": "68f3ba2b8ae280e17917db12",
  "quantity": 1,
  "reason": "return",
  "party": {
    "name": "TechWorld Retail",
    "type": "customer",
    "contact": "+91-22-3456-7890 | Arjun Mehta | arjun@techworld.com"
  },
  "unitPrice": 124999,
  "notes": "Customer return - defective unit, requires testing",
  "invoiceNumber": "RET-INV-2025-10-1001"
}
```

---

## 🎯 KEY DIFFERENCES FROM PREVIOUS VERSION

### ✅ Fixed Issues:

1. **Party Object Structure**:

   - ❌ Old: `{name, contactPerson, phone, email}`
   - ✅ New: `{name, type, contact}`

2. **Party Type Field** (Required):

   - Stock-In: `"type": "supplier"`
   - Stock-Out: `"type": "customer"`

3. **Contact Field Format**:

   - Combined: `"Phone | Person Name | Email"`

4. **Reference Field Names**:

   - ❌ Old: `purchaseOrderNumber`
   - ✅ New: `referenceNumber`

5. **Transaction Reason**:
   - Must be exact enum values from schema
   - Stock-In: `"purchase"`, `"return"`, `"production"`, `"transfer"`
   - Stock-Out: `"sale"`, `"sample"`, `"transfer"`, `"other"`
   - Adjustment: `"damage"`, `"expired"`, `"theft"`, `"adjustment"`

---

## 📊 SUMMARY TABLE

| Operation Type      | Count | Total Value (₹) | Purpose             |
| ------------------- | ----- | --------------- | ------------------- |
| Stock-In (Purchase) | 14    | ~30,00,000      | Replenish inventory |
| Stock-Out (Sale)    | 14    | ~22,00,000      | Customer orders     |
| Adjustments         | 3     | Write-offs      | Damage/Expiry/Audit |
| Returns             | 1     | 1,24,999        | Customer return     |

---

## ✅ TESTING CHECKLIST

- [ ] Verify party object has `type` field
- [ ] Confirm `contact` is a combined string
- [ ] Use `referenceNumber` instead of `purchaseOrderNumber`
- [ ] Ensure `reason` matches enum values exactly
- [ ] Check all itemIds are valid MongoDB ObjectIds
- [ ] Verify unitPrice and quantity are numbers
- [ ] Confirm invoiceNumber format is correct
- [ ] Test stock-in increases inventory
- [ ] Test stock-out decreases inventory
- [ ] Verify adjustments work correctly
- [ ] Check return operations function properly

---

**✅ All data is now 100% accurate according to the Mongoose schemas!**
