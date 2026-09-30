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
  const [theme, setTheme] = useState(THEMES);

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

  const baseInputStyle = "w-full min-w-0 h-11 px-3.5 bg-paper border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold";
  const baseSelectStyle = "w-full min-w-0 h-11 pl-3.5 pr-8 bg-paper border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all font-semibold cursor-pointer";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 sm:space-y-6 overflow-x-hidden text-ink relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          body, html { background-color: white !important; margin: 0 !important; padding: 0 !important; }
          .grid { display: block !important; }
          .sticky { position: relative !important; top: 0 !important; }
          #invoice-live-preview { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      {/* TOP HEADER - Mobile Stacked / Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-line px-4 sm:px-6 py-4 rounded-xl shadow-card no-print min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-brand shrink-0" />
          <h2 className="text-base sm:text-xl font-bold text-ink truncate">Pro Billing Studio</h2>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button type="button" onClick={handleExportCSV} className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-paper border border-line text-ink px-3 py-2 rounded-lg hover:bg-brand/10 hover:border-brand/35 transition-colors">
            <Download className="w-3.5 h-3.5 text-muted shrink-0" /> Export CSV
          </button>
          <button type="button" onClick={handlePrint} className="flex items-center justify-center gap-1.5 text-xs font-bold bg-brand text-white px-3 py-2 rounded-lg hover:opacity-95 transition-opacity shadow-sm">
            <Printer className="w-3.5 h-3.5 shrink-0" /> Save PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[440px,1fr] gap-6 md:gap-8 items-start min-w-0">
        
        {/* ================= INPUT FORM COLUMN ================= */}
        <div className="flex flex-col gap-5 no-print xl:h-[82vh] xl:overflow-y-auto custom-scrollbar xl:pr-1 xl:pb-10 min-w-0">
          
          {/* Invoice Settings */}
          <div className="bg-surface border border-line p-4 sm:p-5 rounded-xl shadow-card space-y-4 min-w-0">
            <div className="flex items-center gap-2 border-b border-line pb-2.5 min-w-0">
                <Palette className="w-4 h-4 text-brand shrink-0" />
                <h3 className="font-bold text-ink text-xs sm:text-sm truncate">Invoice Settings</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 min-w-0">
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Currency</label>
                <select value={currency.code} onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))} className={baseSelectStyle}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Brand Color</label>
                <div className="flex items-center gap-2 pt-1.5">
                  {THEMES.map(t => (
                    <button key={t.id} type="button" onClick={() => setTheme(t)} className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${t.color} border-2 transition-all shrink-0 ${theme.id === t.id ? 'border-ink scale-110 shadow-sm' : 'border-transparent'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-0">
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Invoice #</label>
                <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className={baseInputStyle} />
              </div>
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Net Terms</label>
                <select value={terms} onChange={(e) => setTerms(e.target.value)} className={baseSelectStyle}>
                  <option value="0">Due on Receipt</option>
                  <option value="7">Net 7</option>
                  <option value="15">Net 15</option>
                  <option value="30">Net 30</option>
                  <option value="60">Net 60</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 min-w-0">
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Issue Date</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={baseInputStyle} />
              </div>
              <div className={`space-y-1 min-w-0 ${terms === '0' ? 'opacity-50' : ''}`}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Due Date</label>
                {terms === '0' ? (
                  <input type="text" value="Upon Receipt" readOnly className={`${baseInputStyle} bg-line/30 text-muted cursor-not-allowed`} />
                ) : (
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={baseInputStyle} />
                )}
              </div>
            </div>
          </div>

          {/* Sender Details */}
          <div className="bg-surface border border-line p-4 sm:p-5 rounded-xl shadow-card space-y-3.5 min-w-0">
            <div className="flex items-center gap-2 border-b border-line pb-2.5 min-w-0">
                <Building2 className="w-4 h-4 text-brand shrink-0" />
                <h3 className="font-bold text-ink text-xs sm:text-sm truncate">Your Details (From)</h3>
            </div>
            <input type="text" placeholder="Your Business Name" value={fromDetails.name} onChange={(e) => handleDetailChange('from', 'name', e.target.value)} className={baseInputStyle} />
            <input type="text" placeholder="Email Address" value={fromDetails.email} onChange={(e) => handleDetailChange('from', 'email', e.target.value)} className={baseInputStyle} />
            <textarea placeholder="Address" value={fromDetails.address} onChange={(e) => handleDetailChange('from', 'address', e.target.value)} className="w-full text-sm p-3 bg-paper border border-line rounded-lg text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 h-16 sm:h-20 resize-none font-semibold"></textarea>
            <input type="text" placeholder="Tax ID / VAT (Optional)" value={fromDetails.taxId} onChange={(e) => handleDetailChange('from', 'taxId', e.target.value)} className={baseInputStyle} />
          </div>

          {/* Client Details */}
          <div className="bg-surface border border-line p-4 sm:p-5 rounded-xl shadow-card space-y-3.5 min-w-0">
            <div className="flex items-center gap-2 border-b border-line pb-2.5 min-w-0">
                <User className="w-4 h-4 text-brand shrink-0" />
                <h3 className="font-bold text-ink text-xs sm:text-sm truncate">Client Details (To)</h3>
            </div>
            <input type="text" placeholder="Client Business Name" value={toDetails.name} onChange={(e) => handleDetailChange('to', 'name', e.target.value)} className={baseInputStyle} />
            <input type="text" placeholder="Client Email" value={toDetails.email} onChange={(e) => handleDetailChange('to', 'email', e.target.value)} className={baseInputStyle} />
            <textarea placeholder="Client Address" value={toDetails.address} onChange={(e) => handleDetailChange('to', 'address', e.target.value)} className="w-full text-sm p-3 bg-paper border border-line rounded-lg text-ink focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 h-16 sm:h-20 resize-none font-semibold"></textarea>
            <input type="text" placeholder="Client Tax ID (Optional)" value={toDetails.taxId} onChange={(e) => handleDetailChange('to', 'taxId', e.target.value)} className={baseInputStyle} />
          </div>

          {/* Line Items */}
          <div className="bg-surface border border-line p-4 sm:p-5 rounded-xl shadow-card space-y-3.5 min-w-0">
            <div className="flex items-center justify-between border-b border-line pb-2.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <Briefcase className="w-4 h-4 text-brand shrink-0" />
                    <h3 className="font-bold text-ink text-xs sm:text-sm truncate">Line Items</h3>
                </div>
            </div>
            
            <div className="space-y-3 min-w-0">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-2 p-3 bg-paper rounded-lg border border-line min-w-0">
                  <div className="flex justify-between items-center mb-0.5 min-w-0">
                    <span className="text-[10px] font-black uppercase text-muted tracking-wider">Item {index + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-[#fb7185] hover:text-[#e11d48] transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input type="text" placeholder="Description of service/product" value={item.desc} onChange={(e) => handleItemChange(item.id, 'desc', e.target.value)} className="w-full text-xs sm:text-sm font-bold p-2 bg-surface border border-line rounded text-ink focus:outline-none focus:border-brand" />
                  <div className="grid grid-cols-2 gap-2 mt-1 min-w-0">
                     <div className="space-y-1 min-w-0">
                       <label className="text-[9px] font-bold uppercase text-muted block truncate">Qty</label>
                       <input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)} className="w-full text-xs sm:text-sm font-semibold p-2 bg-surface border border-line rounded text-ink focus:outline-none focus:border-brand" />
                     </div>
                     <div className="space-y-1 min-w-0">
                       <label className="text-[9px] font-bold uppercase text-muted block truncate">Rate</label>
                       <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} className="w-full text-xs sm:text-sm font-semibold p-2 bg-surface border border-line rounded text-ink focus:outline-none focus:border-brand" />
                     </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button type="button" onClick={handleAddItem} className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-line rounded-lg text-xs sm:text-sm font-bold text-brand hover:bg-brand/10 hover:border-brand/35 transition-all">
               <Plus className="w-4 h-4 shrink-0" /> Add Line Item
            </button>
          </div>

          {/* Totals & Taxes */}
          <div className="bg-surface border border-line p-4 sm:p-5 rounded-xl shadow-card space-y-3.5 min-w-0">
            <div className="flex items-center gap-2 border-b border-line pb-2.5 min-w-0">
                <Calculator className="w-4 h-4 text-brand shrink-0" />
                <h3 className="font-bold text-ink text-xs sm:text-sm truncate">Totals & Taxes</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Tax Rate (%)</label>
                  <input type="number" min="0" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={baseInputStyle} />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted block truncate">Discount ({currency.symbol})</label>
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className={baseInputStyle} />
                </div>
            </div>
          </div>

        </div>

        {/* ================= LIVE A4 PREVIEW COLUMN (Responsive Scaling) ================= */}
        <div className="sticky top-4 flex justify-center z-10 w-full min-w-0">
           <div id="invoice-live-preview" className="w-full max-w-[800px] bg-white border border-slate-200 shadow-xl sm:shadow-2xl overflow-hidden flex flex-col text-slate-800 relative">
             
             <div className={`h-2 sm:h-3 w-full ${theme.color}`}></div>

             <div className="p-5 sm:p-10 flex-grow flex flex-col print:p-0 print:pt-4 min-w-0">
                 
                 {/* Top Header Section */}
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-100 pb-5 mb-5 min-w-0">
                    <div className="space-y-0.5 min-w-0">
                       <h2 className={`text-2xl sm:text-4xl font-black tracking-tight uppercase ${theme.text}`}>INVOICE</h2>
                       <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-wider truncate">{invoiceNo || "INV-000"}</p>
                    </div>
                    <div className="text-left sm:text-right space-y-0.5 min-w-0 w-full sm:w-auto">
                       <h2 className="text-sm sm:text-lg font-bold text-slate-800 truncate">{fromDetails.name || "Your Business"}</h2>
                       <p className="text-[11px] sm:text-xs text-slate-500 whitespace-pre-line leading-relaxed">{fromDetails.address}</p>
                       {fromDetails.email && <p className="text-[11px] sm:text-xs text-slate-500 truncate">{fromDetails.email}</p>}
                       {fromDetails.taxId && <p className="text-[11px] sm:text-xs text-slate-400 truncate">Tax ID: {fromDetails.taxId}</p>}
                    </div>
                 </div>

                 {/* Billed To & Dates */}
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-5 mb-6 min-w-0">
                    <div className="space-y-1 min-w-0">
                        <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Billed To</h3>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{toDetails.name || "Client Name"}</h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 whitespace-pre-line leading-relaxed max-w-[250px]">{toDetails.address}</p>
                        {toDetails.email && <p className="text-[11px] sm:text-xs text-slate-500 truncate">{toDetails.email}</p>}
                        {toDetails.taxId && <p className="text-[11px] sm:text-xs text-slate-400 truncate">Tax ID: {toDetails.taxId}</p>}
                    </div>
                    
                    <div className="flex sm:gap-10 gap-6 text-left sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                       <div className="space-y-0.5">
                          <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</h3>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">{issueDate || "—"}</p>
                       </div>
                       
                       {terms !== "0" && (
                         <div className="space-y-0.5">
                            <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Due</h3>
                            <p className={`text-xs sm:text-sm font-bold ${theme.text}`}>{dueDate || "—"}</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Line Items Table (Mobile-friendly horizontal scroll safety or clean stacked grid) */}
                 <div className="w-full mb-5 min-w-0">
                    <div className={`grid grid-cols-[1fr,40px,70px,75px] sm:grid-cols-[1fr,50px,90px,90px] gap-2 sm:gap-4 border-b-2 ${theme.border} pb-2 mb-3 min-w-0`}>
                       <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Description</div>
                       <div className="text-center text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Qty</div>
                       <div className="text-right text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Rate</div>
                       <div className="text-right text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Amount</div>
                    </div>
                    
                    <div className="space-y-2.5 min-w-0">
                       {items.map((item, i) => {
                         const amount = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                         return (
                           <div key={item.id} className="grid grid-cols-[1fr,40px,70px,75px] sm:grid-cols-[1fr,50px,90px,90px] gap-2 sm:gap-4 items-start border-b border-slate-100 pb-2.5">
                              <div className="text-xs sm:text-sm font-semibold text-slate-800 pr-1 whitespace-pre-wrap break-words">{item.desc || `Item ${i+1}`}</div>
                              <div className="text-center text-xs sm:text-sm text-slate-600">{item.qty}</div>
                              <div className="text-right text-xs sm:text-sm text-slate-600 truncate">{formatCurrency(item.rate, currency.code, currency.locale)}</div>
                              <div className="text-right text-xs sm:text-sm font-bold text-slate-800 truncate">{formatCurrency(amount, currency.code, currency.locale)}</div>
                           </div>
                         )
                       })}
                    </div>
                 </div>

                 {/* Summary / Totals */}
                 <div className="flex justify-end mt-auto pt-4 min-w-0">
                    <div className="w-full sm:w-80 space-y-2">
                       <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-slate-500 font-medium">Subtotal</span>
                          <span className="text-slate-800 font-bold">{isMounted ? formatCurrency(totals.subTotal, currency.code, currency.locale) : "0"}</span>
                       </div>
                       
                       {Number(taxRate) > 0 && (
                         <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-500 font-medium">Tax ({taxRate}%)</span>
                            <span className="text-slate-800 font-bold">+{isMounted ? formatCurrency(totals.taxAmount, currency.code, currency.locale) : "0"}</span>
                         </div>
                       )}
                       
                       {Number(discount) > 0 && (
                         <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-500 font-medium">Discount</span>
                            <span className="text-rose-500 font-bold">-{isMounted ? formatCurrency(discount, currency.code, currency.locale) : "0"}</span>
                         </div>
                       )}
                       
                       <div className={`flex justify-between items-center border-t-2 ${theme.border} pt-2.5 mt-2`}>
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Total Due</span>
                            <span className={`text-lg sm:text-2xl font-black ${theme.text}`}>
                              {isMounted ? formatCurrency(totals.total, currency.code, currency.locale) : "0"}
                            </span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-8 sm:mt-12 text-center text-[9px] sm:text-[10px] text-slate-400 font-medium pb-2">
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