"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Receipt, Printer, Plus, Trash2, Building2, User, Palette, Calculator, Briefcase, Download } from "lucide-react";

const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'PKR', symbol: 'Rs', locale: 'en-PK' },
  { code: 'INR', symbol: '₹', locale: 'en-IN' }
];

const THEMES = [
  { id: "slate", color: "bg-slate-800", text: "text-slate-800", border: "border-slate-800" },
  { id: "indigo", color: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-600" },
  { id: "emerald", color: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600" },
  { id: "rose", color: "bg-rose-600", text: "text-rose-600", border: "border-rose-600" },
];

const formatCurrency = (val, currencyCode, locale) => {
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency: currencyCode, 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(val || 0);
};

const InvoiceGenerator = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [theme, setTheme] = useState(THEMES[1]);

  const [invoiceNo, setInvoiceNo] = useState("INV-2026-001");
  const [issueDate, setIssueDate] = useState("");
  const [terms, setTerms] = useState("15"); 
  const [dueDate, setDueDate] = useState("");

  const [fromDetails, setFromDetails] = useState({
    name: "Acme Web Solutions",
    email: "billing@acme.com",
    address: "123 Tech Boulevard, Silicon Valley, CA",
    taxId: "TAX-9876543"
  });

  const [toDetails, setToDetails] = useState({
    name: "Global Startups Inc.",
    email: "accounts@globalstartups.com",
    address: "456 Innovation Drive, Suite 900, NY",
    taxId: ""
  });

  const [items, setItems] = useState([
    { id: 1, desc: "Premium Web App Development", qty: 2, rate: 2500 }
  ]);

  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");

  const [totals, setTotals] = useState({
    subTotal: 0,
    taxAmount: 0,
    total: 0
  });

  useEffect(() => {
    setIsMounted(true);
    const today = new Date();
    setIssueDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (issueDate && terms) {
      const date = new Date(issueDate);
      date.setDate(date.getDate() + parseInt(terms));
      setDueDate(date.toISOString().split('T')[0]);
    }
  }, [issueDate, terms]);

  const calculateTotals = useCallback(() => {
    let sub = 0;
    items.forEach(item => {
      sub += (Number(item.qty) || 0) * (Number(item.rate) || 0);
    });

    const tax = sub * ((Number(taxRate) || 0) / 100);
    const disc = Number(discount) || 0;
    const finalTotal = sub + tax - disc;

    setTotals({
      subTotal: sub,
      taxAmount: tax,
      total: finalTotal > 0 ? finalTotal : 0
    });
  }, [items, taxRate, discount]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), desc: "", qty: 1, rate: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePrint = () => {
    window.print();
  };

  // ✅ PRO CSV EXPORT
  const handleExportCSV = () => {
    const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;
    let csvData = [];
    
    csvData.push(["INVOICE DETAILS"]);
    csvData.push(["Invoice No", escape(invoiceNo)]);
    csvData.push(["Issue Date", escape(issueDate)]);
    csvData.push(["Due Date", terms === "0" ? "Upon Receipt" : escape(dueDate)]);
    csvData.push(["Currency", escape(currency.code)]);
    csvData.push([]); 
    
    csvData.push(["FROM (SENDER)"]);
    csvData.push(["Business Name", escape(fromDetails.name)]);
    csvData.push(["Email", escape(fromDetails.email)]);
    csvData.push(["Address", escape(fromDetails.address)]);
    if (fromDetails.taxId) csvData.push(["Tax ID", escape(fromDetails.taxId)]);
    csvData.push([]);
    
    csvData.push(["BILLED TO (CLIENT)"]);
    csvData.push(["Client Name", escape(toDetails.name)]);
    csvData.push(["Email", escape(toDetails.email)]);
    csvData.push(["Address", escape(toDetails.address)]);
    if (toDetails.taxId) csvData.push(["Tax ID", escape(toDetails.taxId)]);
    csvData.push([]);
    
    csvData.push(["LINE ITEMS"]);
    csvData.push(["Description", "Quantity", "Unit Rate", "Total Amount"]);
    items.forEach(item => {
      const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
      csvData.push([escape(item.desc), item.qty, item.rate, amount]);
    });
    csvData.push([]);
    
    csvData.push(["FINANCIALS"]);
    csvData.push(["Subtotal", "", "", totals.subTotal]);
    if (Number(taxRate) > 0) csvData.push([`Tax (${taxRate}%)`, "", "", totals.taxAmount]);
    if (Number(discount) > 0) csvData.push(["Discount", "", "", `-${discount}`]);
    csvData.push(["TOTAL DUE", "", "", totals.total]);
    
    const csvString = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${invoiceNo || 'Invoice'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDetailChange = (type, field, value) => {
    if (type === 'from') {
      setFromDetails(prev => ({ ...prev, [field]: value }));
    } else {
      setToDetails(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 relative">
      
      {/* ⚠️ BULLETPROOF PRINT OVERRIDE (Fixes blank page & extra pages) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* 1. Hide the entire UI (Forms, Header, Sidebar) */
          .no-print { 
            display: none !important; 
          }
          
          /* 2. Strip background styling from the body */
          body, html {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* 3. Flatten layout wrappers so they don't force grid/flex alignment */
          .grid { display: block !important; }
          .sticky { position: relative !important; top: 0 !important; }
          
          /* 4. Make ONLY the invoice preview render properly */
          #invoice-live-preview {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            background: white !important;
          }
          
          /* 5. Force browsers to print background colors (like your theme ribbon) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-xl shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Pro Billing Studio</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
            <Download className="w-4 h-4" /> Export Data (CSV)
          </button>
          
          <button onClick={handlePrint} className="flex items-center gap-2 text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Save PDF / Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[450px,1fr] gap-8 items-start">
        
        {/* ================= INPUT FORM COLUMN ================= */}
        <div className="flex flex-col gap-6 no-print h-full max-h-[80vh] overflow-y-auto custom-scrollbar pr-2 pb-10">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Palette className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Invoice Settings</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Currency</label>
                <select value={currency.code} onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 cursor-pointer">
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Brand Color</label>
                <div className="flex items-center gap-2 pt-1">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setTheme(t)} className={`w-8 h-8 rounded-full ${t.color} border-2 transition-all ${theme.id === t.id ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Invoice #</label>
                <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Net Terms</label>
                <select value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 cursor-pointer">
                  <option value="0">Due on Receipt</option>
                  <option value="7">Net 7</option>
                  <option value="15">Net 15</option>
                  <option value="30">Net 30</option>
                  <option value="60">Net 60</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Issue Date</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
              </div>
              <div className={`space-y-1.5 ${terms === '0' ? 'opacity-50' : ''}`}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Due Date</label>
                {terms === '0' ? (
                  <input type="text" value="Upon Receipt" readOnly className="w-full text-sm font-bold p-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                ) : (
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building2 className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Your Details (From)</h3>
            </div>
            <input type="text" placeholder="Your Business Name" value={fromDetails.name} onChange={(e) => handleDetailChange('from', 'name', e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100" />
            <input type="text" placeholder="Email Address" value={fromDetails.email} onChange={(e) => handleDetailChange('from', 'email', e.target.value)} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100" />
            <textarea placeholder="Address" value={fromDetails.address} onChange={(e) => handleDetailChange('from', 'address', e.target.value)} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100 h-20 resize-none"></textarea>
            <input type="text" placeholder="Tax ID / VAT (Optional)" value={fromDetails.taxId} onChange={(e) => handleDetailChange('from', 'taxId', e.target.value)} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <User className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Client Details (To)</h3>
            </div>
            <input type="text" placeholder="Client Business Name" value={toDetails.name} onChange={(e) => handleDetailChange('to', 'name', e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100" />
            <input type="text" placeholder="Client Email" value={toDetails.email} onChange={(e) => handleDetailChange('to', 'email', e.target.value)} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100" />
            <textarea placeholder="Client Address" value={toDetails.address} onChange={(e) => handleDetailChange('to', 'address', e.target.value)} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100 h-20 resize-none"></textarea>
            <input type="text" placeholder="Client Tax ID (Optional)" value={toDetails.taxId} onChange={(e) => handleDetailChange('to', 'taxId', e.target.value)} className="w-full text-sm p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-800 dark:text-slate-100" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Line Items</h3>
                </div>
            </div>
            
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 relative group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => handleRemoveItem(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input type="text" placeholder="Description of service/product" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} className="w-full text-sm font-bold p-2 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100" />
                <div className="grid grid-cols-2 gap-4 mt-2">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-slate-500">Qty</label>
                     <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full text-sm p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded outline-none text-slate-800 dark:text-slate-100" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-slate-500">Rate</label>
                     <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full text-sm p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded outline-none text-slate-800 dark:text-slate-100" />
                   </div>
                </div>
              </div>
            ))}
            
            <button onClick={handleAddItem} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 transition-all">
               <Plus className="w-4 h-4" /> Add Line Item
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Totals & Taxes</h3>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tax Rate (%)</label>
                  <input type="number" min="0" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Discount ({currency.symbol})</label>
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full text-sm font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100" />
                </div>
            </div>
          </div>

        </div>

        {/* ================= LIVE A4 PREVIEW COLUMN ================= */}
        <div className="sticky top-6 flex justify-center z-10">
           <div id="invoice-live-preview" className="w-full max-w-[800px] bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-800 relative">
              
              <div className={`h-3 w-full ${theme.color}`}></div>

              <div className="p-10 flex-grow flex flex-col print:p-0 print:pt-4">
                  <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                     <div className="space-y-1">
                        <h1 className={`text-4xl font-black tracking-tighter uppercase ${theme.text}`}>INVOICE</h1>
                        <p className="text-sm font-bold text-slate-500 tracking-widest">{invoiceNo || "INV-000"}</p>
                     </div>
                     <div className="text-right space-y-1">
                        <h2 className="text-lg font-bold text-slate-800">{fromDetails.name || "Your Business"}</h2>
                        <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{fromDetails.address}</p>
                        {fromDetails.email && <p className="text-xs text-slate-500">{fromDetails.email}</p>}
                        {fromDetails.taxId && <p className="text-xs text-slate-400 mt-1">Tax ID: {fromDetails.taxId}</p>}
                     </div>
                  </div>

                  <div className="flex justify-between items-start mb-10">
                     <div className="space-y-4">
                        <div>
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billed To</h3>
                           <h2 className="text-sm font-bold text-slate-800">{toDetails.name || "Client Name"}</h2>
                           <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed max-w-[250px]">{toDetails.address}</p>
                           {toDetails.email && <p className="text-xs text-slate-500">{toDetails.email}</p>}
                           {toDetails.taxId && <p className="text-xs text-slate-400 mt-1">Tax ID: {toDetails.taxId}</p>}
                        </div>
                     </div>
                     
                     <div className="flex gap-12 text-right">
                        <div className="space-y-1">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</h3>
                           <p className="text-sm font-bold text-slate-800">{issueDate || "—"}</p>
                        </div>
                        
                        {terms !== "0" && (
                          <div className="space-y-1">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Due</h3>
                             <p className={`text-sm font-bold ${theme.text}`}>{dueDate || "—"}</p>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="w-full mb-8">
                     <div className={`grid grid-cols-[1fr,60px,100px,100px] gap-4 border-b-2 ${theme.border} pb-2 mb-4`}>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</div>
                        <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</div>
                        <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</div>
                        <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</div>
                     </div>
                     
                     <div className="space-y-4">
                        {items.map((item, i) => {
                          const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                          return (
                            <div key={item.id} className="grid grid-cols-[1fr,60px,100px,100px] gap-4 items-start border-b border-slate-100 pb-4">
                                <div className="text-sm font-semibold text-slate-800 pr-2 whitespace-pre-wrap break-words">{item.desc || `Item ${i+1}`}</div>
                                <div className="text-center text-sm text-slate-600">{item.qty}</div>
                                <div className="text-right text-sm text-slate-600">{formatCurrency(item.rate, currency.code, currency.locale)}</div>
                                <div className="text-right text-sm font-bold text-slate-800">{formatCurrency(amount, currency.code, currency.locale)}</div>
                            </div>
                          )
                        })}
                     </div>
                  </div>

                  <div className="flex justify-end mt-auto pt-8">
                     <div className="w-80 space-y-3">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-500 font-medium">Subtotal</span>
                           <span className="text-slate-800 font-bold">{isMounted ? formatCurrency(totals.subTotal, currency.code, currency.locale) : "0"}</span>
                        </div>
                        
                        {Number(taxRate) > 0 && (
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-500 font-medium">Tax ({taxRate}%)</span>
                             <span className="text-slate-800 font-bold">+{isMounted ? formatCurrency(totals.taxAmount, currency.code, currency.locale) : "0"}</span>
                          </div>
                        )}
                        
                        {Number(discount) > 0 && (
                          <div className="flex justify-between text-sm">
                             <span className="text-slate-500 font-medium">Discount</span>
                             <span className="text-rose-500 font-bold">-{isMounted ? formatCurrency(discount, currency.code, currency.locale) : "0"}</span>
                          </div>
                        )}
                        
                        <div className={`flex justify-between items-center border-t-2 ${theme.border} pt-3 mt-3`}>
                           <span className="text-sm font-black uppercase tracking-widest text-slate-800">Total Due</span>
                           <span className={`text-2xl font-black ${theme.text}`}>
                             {isMounted ? formatCurrency(totals.total, currency.code, currency.locale) : "0"}
                           </span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-16 text-center text-[10px] text-slate-400 font-medium pb-4">
                     {terms === "0" 
                        ? "Thank you for your business. Payment is due upon receipt of this invoice."
                        : `Thank you for your business. Please remit payment within ${terms} days of the issue date.`
                     }
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;