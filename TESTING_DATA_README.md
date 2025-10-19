# Testing Data for Interview Review

## 📋 Sample Data for Live Demonstration

This document contains ready-to-use JSON data for testing the inventory management system during your interview review. Copy and paste these directly into the application for quick demonstration.

---

## 🏪 **1. Adding New Inventory Items**

### **Sample : Healthcare Item**

```json
{
  "name": "Paracetamol 500mg Tablets - Pack of 20",
  "sku": "PARA-500MG-20TAB-CIPLA",
  "description": "Pain relief and fever reducer tablets, 500mg strength",
  "category": "Healthcare",
  "subCategory": "Medicines",
  "quantity": 150,
  "unit": "strips",
  "reorderLevel": 30,
  "maxStockLevel": 300,
  "costPrice": 18,
  "sellingPrice": 28,
  "supplier": {
    "name": "Cipla Pharmaceuticals Ltd",
    "contactPerson": "Dr. Rajesh Patel",
    "phone": "+91-22-2482-0000",
    "email": "supply@cipla.com"
  },
  "warehouseLocation": "Warehouse C - Healthcare",
  "rackNumber": "C-08-A-15",
  "expiryDate": "2026-12-31",
  "batchNumber": "CP240815A",
  "status": "active",
  "notes": "Essential medicine, monitor expiry dates"
}
```

---

## 📦 **2. Stock OUT Transactions (Sales)**


### **Sample : Medicine Sale**

```json
{
  "itemId": ".......",
  "quantity": 25,
  "reason": "sale",
  "party": {
    "name": "Apollo Pharmacy",
    "type": "customer",
    "contact": "+91-40-4420-1000 | Dr. Sunita Rao | sunita.rao@apollopharmacy.com"
  },
  "unitPrice": 28,
  "notes": "Regular pharmacy chain order",
  "invoiceNumber": "OUT-INV-2025-10-1613"
}
```

### **Sample 3: Food & Beverage Sale**

```json
{
  "itemId": "TETLEY-GREENTEA-ORG-25",
  "quantity": 15,
  "reason": "sale",
  "party": {
    "name": "Organic Foods Mart",
    "type": "customer",
    "contact": "+91-80-2876-5432 | Neha Singh | neha@organicfoodsmart.com"
  },
  "unitPrice": 149,
  "notes": "Health food store chain order",
  "invoiceNumber": "OUT-INV-2025-10-1614"
}
```

---

## 📥 **3. Stock IN Transactions (Purchases)**


### **Sample : Healthcare Purchase**

```json
{
  "itemId": "PARA-500MG-20TAB-CIPLA",
  "quantity": 100,
  "reason": "purchase",
  "party": {
    "name": "Cipla Pharmaceuticals Ltd",
    "type": "supplier",
    "contact": "+91-22-2482-0000 | Dr. Rajesh Patel | supply@cipla.com"
  },
  "unitPrice": 18,
  "notes": "Essential medicines restock",
  "invoiceNumber": "INV-CIPLA-2025-10-425",
  "referenceNumber": "PO-MEDICINES-2025-10-089"
}
```