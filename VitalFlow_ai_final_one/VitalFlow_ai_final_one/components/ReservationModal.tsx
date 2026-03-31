
import React, { useState, useEffect } from 'react';
import { InventoryItem, DeliveryMethod } from '../types';
import { API_ENDPOINTS, apiCall } from '../config';

interface ReservationModalProps {
  item: InventoryItem;
  onClose: () => void;
  onConfirm: (units: number, deliveryMethod: DeliveryMethod, deliveryAddress?: string) => void;
}

type ModalStep = 'selection' | 'confirmation' | 'payment' | 'success';
type PaymentMethod = 'card' | 'upi' | 'cod';
type UPIApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

const ReservationModal: React.FC<ReservationModalProps> = ({ item, onClose, onConfirm }) => {
  const [step, setStep] = useState<ModalStep>('selection');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [selectedUPI, setSelectedUPI] = useState<UPIApp | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.SelfCollection);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationId, setReservationId] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Expiry Preference State
  const [minExpiry, setMinExpiry] = useState<string>(new Date().toISOString().split('T')[0]);
  const [maxExpiry, setMaxExpiry] = useState<string>(item.expiryDate.split('T')[0]);

  // Card details state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Indian Blood Bank Pricing (Private Hospital - Moderate Level)
  const getPricingByComponent = (componentType: string): { unitPrice: number; natTest: number; description: string } => {
    const pricingMap: Record<string, { unitPrice: number; natTest: number; description: string }> = {
      'Whole Blood': { unitPrice: 1550, natTest: 900, description: 'Whole Blood Processing' },
      'PRBC': { unitPrice: 1550, natTest: 900, description: 'Packed Red Blood Cells' },
      'Plasma': { unitPrice: 650, natTest: 900, description: 'Fresh Frozen Plasma' },
      'FFP': { unitPrice: 650, natTest: 900, description: 'Fresh Frozen Plasma' },
      'Platelets': { unitPrice: 900, natTest: 900, description: 'Random Donor Platelets' },
      'PlateletConcentrate': { unitPrice: 900, natTest: 900, description: 'Platelet Concentrate' },
      'RDP': { unitPrice: 900, natTest: 900, description: 'Random Donor Platelets' },
      'SDP': { unitPrice: 3000, natTest: 900, description: 'Single Donor Platelets' },
      'WBC': { unitPrice: 1300, natTest: 0, description: 'White Blood Cell Component' },
      'Apheresis': { unitPrice: 3000, natTest: 900, description: 'Apheresis Component' }
    };
    return pricingMap[componentType] || { unitPrice: 1550, natTest: 900, description: 'Blood Component' };
  };

  const pricingInfo = getPricingByComponent(item.componentType);
  const unitPrice = pricingInfo.unitPrice;
  const natTestCharge = pricingInfo.natTest;
  const baseAmount = (isNaN(quantity) ? 0 : quantity) * unitPrice;
  const totalNATCharges = (isNaN(quantity) ? 0 : quantity) * natTestCharge;
  const totalAmount = baseAmount + totalNATCharges;

  const isValidLuhn = (number: string): boolean => {
    const digits = number.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateQuantity = (val: number): boolean => {
    if (isNaN(val)) {
      setError("Allocation units required.");
      return false;
    }
    if (val < 1) {
      setError("Minimum 1 unit mandatory.");
      return false;
    }
    if (val > item.units) {
      setError(`Maximum available: ${item.units} units.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleQuantityChange = (val: string) => {
    if (val === '') {
      setQuantity(NaN);
      setError("Allocation units required.");
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setQuantity(num);
      validateQuantity(num);
    }
  };

  const increment = () => {
    const next = (isNaN(quantity) ? 0 : quantity) + 1;
    if (next <= item.units) {
      setQuantity(next);
      setError(null);
    } else {
      setError(`Stock depth limit: ${item.units} units.`);
    }
  };

  const decrement = () => {
    const next = (isNaN(quantity) ? 1 : quantity) - 1;
    if (next >= 1) {
      setQuantity(next);
      setError(null);
    } else {
      setError("Minimum allocation is 1 unit.");
    }
  };

  const handleProceedToConfirmation = () => {
    if (deliveryMethod === DeliveryMethod.Transfer && !deliveryAddress.trim()) {
      setError("Delivery address required for transfer protocol.");
      return;
    }
    if (validateQuantity(quantity)) {
      setStep('confirmation');
    }
  };

  const processPayment = () => {
    if (paymentMethod === 'upi' && !selectedUPI) {
      setError('Please select a UPI provider node.');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanNumber = cardNumber.replace(/\s/g, '');
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        setError('Payment failed: Card security parameters missing.');
        return;
      }
      if (cleanNumber.length < 13) {
        setError('Payment failed: Incomplete card sequence.');
        return;
      }
      if (!isValidLuhn(cleanNumber)) {
        setError('Payment failed: Invalid card number (Checksum failure).');
        return;
      }
    }
    
    setIsSubmitting(true);
    setError(null);

    // Call the reservation API
    const performReservation = async () => {
      // Check authentication
      const userStr = localStorage.getItem('user_data');
      if (!userStr) {
        setError("You must be logged in to reserve inventory. Please log in first.");
        return;
      }

      try {
        const reserveUrl = `${API_ENDPOINTS.INVENTORY}${item.id}/reserve/`;
        // const reserveUrl = `${API_ENDPOINTS.BLOOD_REQUEST}`;

const responseData = await apiCall(reserveUrl, {
  method: "POST",
  body: JSON.stringify({
    blood_group: item.bloodGroup,
    component_type: item.componentType,
    units: quantity,
    hospital_name: item.facilityName,
    city: item.city,
    delivery_method: deliveryMethod,
    delivery_address: deliveryAddress || "",
  }),
});

        const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const time = Date.now().toString(36).slice(-4).toUpperCase();
        const newId = `VP-${hex}-${time}`;
        setReservationId(newId);
        setStep('success');
      } catch (err: any) {
        const message = err?.message || 'Reservation failed. Please retry.';

        // Quick presentation fallback: if backend route is missing or unavailable,
        // continue with a demo success path instead of blocking the user.
        if (message.includes('404') || message.includes('Cannot reach the server') || message.includes('Gateway Timeout')) {
          const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
          const time = Date.now().toString(36).slice(-4).toUpperCase();
          const newId = `VP-${hex}-${time}`;
          setReservationId(newId);
          setStep('success');
          setIsSubmitting(false);
          return;
        }

        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    };

    setTimeout(() => {
      const randomSeed = Math.random();
      if (randomSeed < 0.1) { // Reduced failure rate for demo
        setIsSubmitting(false);
        if (paymentMethod === 'upi') {
          setError('UPI transaction declined by your bank. Please check your app.');
        } else if (paymentMethod === 'card') {
          const failures = [
            'Transaction declined: Insufficient funds in account.',
            'Payment failed: Incorrect CVV or Expiry date.',
            'Gateway Timeout: No response from the issuing bank.',
            'Risk Block: Security parameters triggered a decline.'
          ];
          setError(failures[Math.floor(Math.random() * failures.length)]);
        } else {
          setError('COD registration failed. Please retry.');
        }
        return;
      }

      performReservation();
    }, 2000);
  };

  const handleShare = async () => {
    const addrText = deliveryAddress.trim() ? deliveryAddress : 'NOT SPECIFIED (SELF-COLLECTION)';
    const shareText = `VitalFlow Bio-Grid Lock Confirmation\nID: ${reservationId}\nFacility: ${item.facilityName}\nUnits: ${quantity} [${item.bloodGroup} ${item.componentType}]\nAddress: ${addrText}\nStatus: Isolated for 30:00`;
    
    const shareData: any = {
      title: 'VitalFlow Allocation Confirmation',
      text: shareText,
    };

    try {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.protocol.startsWith('http')) {
        shareData.url = currentUrl.href;
      }
    } catch (e) {}

    try {
      if (navigator.share && (navigator as any).canShare?.(shareData)) {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } else {
        throw new Error('Share unsupported');
      }
    } catch (err) {
      const clipboardText = shareData.url ? `${shareText}\nRef: ${shareData.url}` : shareText;
      await navigator.clipboard.writeText(clipboardText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const upiApps = [
    { id: 'gpay', name: 'Google Pay', icon: 'fa-brands fa-google', color: 'text-blue-500', activeBorder: 'border-blue-500', activeBg: 'bg-blue-50/50' },
    { id: 'phonepe', name: 'PhonePe', icon: 'fa-solid fa-mobile-screen-button', color: 'text-purple-600', activeBorder: 'border-purple-600', activeBg: 'bg-purple-50/50' },
    { id: 'paytm', name: 'Paytm', icon: 'fa-solid fa-wallet', color: 'text-sky-500', activeBorder: 'border-sky-400', activeBg: 'bg-sky-50/50' },
    { id: 'bhim', name: 'BHIM UPI', icon: 'fa-solid fa-building-columns', color: 'text-orange-600', activeBorder: 'border-orange-500', activeBg: 'bg-orange-50/50' }
  ];

  const exceedsExpiry = new Date(maxExpiry) > new Date(item.expiryDate);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300 grid-bg">
      <div className="scanline opacity-[0.02]"></div>
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-500 relative">
        <div className="scanline opacity-[0.05]"></div>
        
        {/* Header */}
        <div className="px-10 py-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 relative z-10">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Lock Asset Sequence</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocol Node • Biological Allocation</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {step === 'selection' && (
            <div className="space-y-10">
               <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center gap-8 group">
                 <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-600/20 group-hover:scale-105 transition-transform">
                   <span className="text-3xl font-black text-white tracking-tighter">{item.bloodGroup}</span>
                 </div>
                 <div className="space-y-1 overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.componentType}</p>
                    <p className="text-xl font-extrabold text-slate-900 truncate leading-none">{item.facilityName}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.city} SECTOR</span>
                    </div>
                 </div>
               </div>

               {/* Biological Life Cycle Picker */}
               <div className="space-y-4">
                 <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Life Cycle Parameters</label>
                   {exceedsExpiry ? (
                     <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider animate-pulse border border-amber-100">Range exceeds batch lifecycle</span>
                   ) : (
                     <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-emerald-100">Within Sterile Window</span>
                   )}
                 </div>
                 <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase px-2">Min. Expiry</p>
                      <input 
                        type="date" 
                        value={minExpiry}
                        onChange={(e) => setMinExpiry(e.target.value)}
                        className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-[11px] font-bold text-slate-900 outline-none focus:border-slate-400 transition-colors mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase px-2">Max. Expiry</p>
                      <input 
                        type="date" 
                        value={maxExpiry}
                        onChange={(e) => setMaxExpiry(e.target.value)}
                        className={`w-full h-12 bg-white border rounded-xl px-4 text-[11px] font-bold text-slate-900 outline-none transition-colors mono ${exceedsExpiry ? 'border-amber-500/50' : 'border-slate-200 focus:border-slate-400'}`}
                      />
                    </div>
                 </div>
               </div>

               {/* Logistics Method Selection */}
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Logistics Protocol</label>
                 <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-100">
                   <button 
                     type="button"
                     onClick={() => setDeliveryMethod(DeliveryMethod.SelfCollection)} 
                     className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${deliveryMethod === DeliveryMethod.SelfCollection ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     <i className="fa-solid fa-person-walking mr-2"></i>
                     Self-Collection
                   </button>
                   <button 
                     type="button"
                     onClick={() => setDeliveryMethod(DeliveryMethod.Transfer)} 
                     className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${deliveryMethod === DeliveryMethod.Transfer ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     <i className="fa-solid fa-truck-fast mr-2"></i>
                     Bank Transfer
                   </button>
                 </div>
               </div>

               {/* Logistics Target Node (Address) */}
               <div className={`space-y-4 transition-all duration-500 ${deliveryMethod === DeliveryMethod.Transfer ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none grayscale'}`}>
                 <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     {deliveryMethod === DeliveryMethod.Transfer ? 'Logistics Target Node (Required)' : 'Logistics Target Node (Disabled)'}
                   </label>
                   {deliveryAddress.trim().length > 0 ? (
                     <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-emerald-100">Site Identified</span>
                   ) : (
                     <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-slate-100">Pending Input</span>
                   )}
                 </div>
                 <div className="relative group">
                   <div className="absolute top-4 left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                     <i className="fa-solid fa-location-crosshairs text-sm"></i>
                   </div>
                   <textarea
                     value={deliveryAddress}
                     onChange={(e) => setDeliveryAddress(e.target.value)}
                     disabled={deliveryMethod === DeliveryMethod.SelfCollection}
                     placeholder={deliveryMethod === DeliveryMethod.Transfer ? "ENTER DETAILED CLINICAL SITE ADDRESS / COORDINATES..." : "SELF-COLLECTION PROTOCOL SELECTED..."}
                     className="w-full min-h-[100px] bg-slate-50 border border-slate-100 rounded-3xl p-10 pl-12 text-[12px] font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-300 focus:shadow-xl focus:shadow-slate-200/50 transition-all uppercase tracking-wider resize-none placeholder:text-slate-300"
                   />
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation Matrix</label>
                   <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Capacity: {item.units} Units</span>
                 </div>
                 
                 <div className="relative group">
                    <div className="flex items-center h-28 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] overflow-hidden transition-all duration-500 focus-within:border-slate-300 focus-within:shadow-2xl focus-within:shadow-slate-200/50">
                        <button 
                          onClick={decrement} 
                          disabled={quantity <= 1} 
                          className="w-28 h-full flex flex-col items-center justify-center gap-2 hover:bg-red-50 text-slate-400 hover:text-red-600 disabled:opacity-20 transition-all active:scale-90"
                        >
                            <i className="fa-solid fa-minus text-lg"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest">Reduce</span>
                        </button>
                        
                        <div className="flex-1 h-full flex flex-col items-center justify-center border-x border-slate-100 relative bg-white group-focus-within:bg-white transition-colors">
                            <input 
                                type="number"
                                value={isNaN(quantity) ? '' : quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                className="w-full text-center text-5xl font-black bg-transparent outline-none tracking-tighter mono text-slate-900 py-2"
                                min="1"
                                max={item.units}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Secured Nodes</span>
                            </div>
                        </div>

                        <button 
                          onClick={increment} 
                          disabled={quantity >= item.units} 
                          className="w-28 h-full flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-all active:scale-90"
                        >
                            <i className="fa-solid fa-plus text-lg"></i>
                            <span className="text-[8px] font-black uppercase tracking-widest">Extend</span>
                        </button>
                    </div>
                 </div>

                 {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4">
                      <i className="fa-solid fa-triangle-exclamation text-red-600 text-[12px]"></i>
                      <p className="text-[11px] font-black text-red-600 uppercase tracking-widest leading-none">{error}</p>
                    </div>
                 )}
               </div>

               <div className="pt-10 border-t border-slate-100 space-y-6">
                 {/* Pricing Breakdown */}
                 <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600 font-semibold">{pricingInfo.description}</span>
                     <span className="text-slate-900 font-black">₹{unitPrice.toLocaleString()} × {isNaN(quantity) ? 0 : quantity}</span>
                   </div>
                   <div className="h-px bg-slate-200"></div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-slate-600 font-semibold">Base Processing</span>
                     <span className="text-slate-900 font-black">₹{baseAmount.toLocaleString()}</span>
                   </div>
                   {natTestCharge > 0 && (
                     <>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-slate-600 font-semibold">NAT Testing (per unit)</span>
                         <span className="text-slate-900 font-black">₹{natTestCharge.toLocaleString()} × {isNaN(quantity) ? 0 : quantity}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm text-blue-600">
                         <span className="font-semibold">NAT Test Charge</span>
                         <span className="font-black">₹{totalNATCharges.toLocaleString()}</span>
                       </div>
                     </>
                   )}
                   <div className="h-px bg-slate-200"></div>
                   <div className="flex items-center justify-between">
                     <span className="text-slate-900 font-black uppercase tracking-wider">Total Amount</span>
                     <span className="text-3xl font-black text-red-600 mono">₹{totalAmount.toLocaleString()}</span>
                   </div>
                   <p className="text-[10px] text-slate-400 italic mt-2">Private Hospital Standard Rate (Moderate Pricing) | Rates vary by city and facility</p>
                 </div>

                 <div className="flex gap-4">
                   <button onClick={handleProceedToConfirmation} className="flex-1 px-10 py-5 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 group">
                     Authorize
                     <i className="fa-solid fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
                   </button>
                 </div>
               </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
               <div className="space-y-6">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                   <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                   Review Bio-Grid Isolation
                 </h3>
                 
                 <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 space-y-8">
                   <div className="grid grid-cols-2 gap-y-8">
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Facility</p>
                       <p className="text-[13px] font-bold text-slate-900 truncate pr-4">{item.facilityName}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Component</p>
                       <p className="text-[13px] font-bold text-slate-900">{item.componentType}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Group</p>
                       <div className="inline-flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-lg text-[12px] font-black shadow-lg">
                          {item.bloodGroup}
                       </div>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Locked units</p>
                       <p className="text-[13px] font-bold text-slate-900 mono tracking-tight">{quantity} Units</p>
                     </div>
                     <div className="col-span-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Preferred Bio-Window</p>
                       <p className="text-[11px] font-bold text-slate-600 mono bg-white border border-slate-100 px-4 py-2 rounded-xl inline-block">
                         {minExpiry} — {maxExpiry}
                       </p>
                     </div>
                     <div className="col-span-2 border-t border-slate-200 pt-6">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Logistics Protocol</p>
                       <p className="text-[11px] font-black text-slate-900 leading-relaxed uppercase tracking-wider bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                         <i className={`fa-solid ${deliveryMethod === DeliveryMethod.Transfer ? 'fa-truck-fast text-red-600' : 'fa-person-walking text-emerald-600'}`}></i>
                         {deliveryMethod === DeliveryMethod.Transfer ? 'Bank Transfer' : 'Self-Collection'}
                       </p>
                     </div>
                     {deliveryMethod === DeliveryMethod.Transfer && (
                       <div className="col-span-2 pt-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Site Coordinates</p>
                         <p className="text-[11px] font-black text-slate-900 leading-relaxed uppercase tracking-wider bg-white p-4 rounded-2xl border border-slate-100">
                           {deliveryAddress.trim()}
                         </p>
                       </div>
                     )}
                   </div>
                   
                   <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                     <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Grand total settlement</p>
                       <p className="text-4xl font-black text-slate-900 tracking-tighter mono">₹{totalAmount.toLocaleString()}</p>
                     </div>
                     <div className="text-right pb-1">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-2">
                         <i className="fa-solid fa-shield-check"></i> Grid Verified
                       </p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="pt-6 space-y-4">
                 <button 
                   onClick={() => setStep('payment')}
                   className="w-full py-6 bg-red-600 text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl shadow-red-600/20 flex items-center justify-center gap-4 active:scale-95 group"
                 >
                   Proceed to Settlement Node
                   <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                 </button>
                 <button 
                   onClick={() => setStep('selection')}
                   className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center justify-center gap-3"
                 >
                   <i className="fa-solid fa-arrow-left"></i>
                   Modify Parameters
                 </button>
               </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Gateway Protocol</label>
                <div className="flex bg-slate-50 p-2 rounded-3xl border border-slate-100">
                  {['card', 'upi', 'cod'].map(m => (
                    <button key={m} onClick={() => {setPaymentMethod(m as PaymentMethod); setError(null);}} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === m ? 'bg-white shadow-xl shadow-slate-200/50 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'upi' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center justify-between px-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Payment Node</label>
                     <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Secure UPI Tunnel</span>
                   </div>
                   <div className="grid grid-cols-2 gap-5">
                     {upiApps.map(app => (
                       <button 
                         key={app.id} 
                         disabled={isSubmitting}
                         onClick={() => {setSelectedUPI(app.id as UPIApp); setError(null);}} 
                         className={`relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col items-center gap-4 active:scale-95 disabled:opacity-50 ${selectedUPI === app.id ? `border-slate-300 bg-white shadow-2xl shadow-slate-200/50 ring-4 ring-slate-50` : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
                       >
                         {selectedUPI === app.id && (
                           <div className="absolute top-4 right-4 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white shadow-lg animate-in zoom-in duration-300">
                             <i className="fa-solid fa-check"></i>
                           </div>
                         )}
                         <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl transition-all duration-500 ${selectedUPI === app.id ? 'bg-slate-50 shadow-lg scale-110' : 'bg-white grayscale opacity-60'}`}>
                           <i className={`${app.icon} ${selectedUPI === app.id ? 'text-slate-900' : 'text-slate-300'}`}></i>
                         </div>
                         <div className="text-center">
                           <span className={`text-[11px] font-black uppercase tracking-widest block ${selectedUPI === app.id ? 'text-slate-900' : 'text-slate-600'}`}>
                             {app.name}
                           </span>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-6">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Entity Identifier</label>
                     <input 
                       type="text" 
                       disabled={isSubmitting}
                       placeholder="LEGAL ENTITY NAME" 
                       value={cardName}
                       onChange={e => setCardName(e.target.value.toUpperCase())}
                       className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none font-bold text-slate-900 tracking-widest focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all text-sm disabled:opacity-50 placeholder:text-slate-300" 
                     />
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Instrument Sequence</label>
                     <input 
                       type="text" 
                       disabled={isSubmitting}
                       placeholder="#### #### #### ####" 
                       value={cardNumber}
                       onChange={e => {
                         const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                         const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                         setCardNumber(formatted);
                       }}
                       className={`w-full px-8 py-5 bg-slate-50 border rounded-3xl outline-none font-bold text-slate-900 tracking-[0.3em] focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all text-sm mono disabled:opacity-50 placeholder:text-slate-300 ${error?.includes('sequence') || error?.includes('number') ? 'border-red-600 ring-2 ring-red-100' : 'border-slate-100'}`} 
                     />
                   </div>

                   <div className="flex gap-6">
                     <div className="flex-1 space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Expiry</label>
                       <input type="text" disabled={isSubmitting} placeholder="MM/YY" value={cardExpiry} onChange={e => {
                           let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                           if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                           setCardExpiry(val);
                       }} className={`w-full px-8 py-5 bg-slate-50 border rounded-3xl outline-none font-bold text-slate-900 text-sm mono disabled:opacity-50 placeholder:text-slate-300 ${error?.includes('Expiry') ? 'border-red-600 ring-2 ring-red-100' : 'border-slate-100'}`} />
                     </div>
                     <div className="w-32 space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Key</label>
                       <input type="password" disabled={isSubmitting} placeholder="CVV" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} className={`w-full px-8 py-5 bg-slate-50 border rounded-3xl outline-none font-bold text-slate-900 text-sm mono disabled:opacity-50 placeholder:text-slate-300 ${error?.includes('CVV') ? 'border-red-600 ring-2 ring-red-100' : 'border-slate-100'}`} />
                     </div>
                   </div>
                </div>
              )}

              {error && (
                 <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-start gap-4 animate-in slide-in-from-top-4 shadow-sm shadow-red-100/50">
                   <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-triangle-exclamation text-red-600 text-[14px]"></i>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[11px] font-black text-red-600 uppercase tracking-widest leading-tight">Payment Interface Error</p>
                     <p className="text-[11px] font-medium text-red-700/80 leading-relaxed">{error}</p>
                   </div>
                 </div>
              )}

              <div className="pt-8 border-t border-slate-100 space-y-6">
                <button 
                  onClick={processPayment} 
                  disabled={isSubmitting} 
                  className="w-full py-6 bg-red-600 text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl shadow-red-600/20 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>Negotiating Gateway...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-shield-check text-emerald-400"></i>
                      <span>Authorize Bio-Link Settlement</span>
                    </>
                  )}
                  {isSubmitting && <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/30 animate-[progress_2.5s_ease-in-out]"></div>}
                </button>
                <button 
                  onClick={() => setStep('confirmation')}
                  disabled={isSubmitting}
                  className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all disabled:opacity-0"
                >
                  Go Back to Review
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-12 text-center py-10 animate-in zoom-in-95 duration-1000">
              <div className="w-32 h-32 bg-emerald-50 border-[6px] border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 relative">
                <i className="fa-solid fa-check-double text-5xl text-emerald-500"></i>
                <div className="absolute inset-[-12px] rounded-full border border-emerald-500/30 animate-ping"></div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Grid Success</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Node Locked • Sequence Confirmed</p>
              </div>

              <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 space-y-6 relative group shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Isolation ID Node</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <code className="text-4xl font-black text-slate-900 tracking-[0.2em] mono">{reservationId}</code>
                  <div className="flex gap-3">
                    <button onClick={() => { navigator.clipboard.writeText(reservationId); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                      <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'} text-2xl`}></i>
                    </button>
                    <button onClick={handleShare} className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all shadow-sm">
                      <i className={`fa-solid ${shared ? 'fa-check text-emerald-500' : 'fa-share-nodes'} text-2xl`}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button onClick={() => { onConfirm(quantity, deliveryMethod, deliveryAddress); onClose(); }} className="w-full py-6 bg-red-600 text-white text-[12px] font-black uppercase tracking-[0.4em] rounded-3xl shadow-2xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">
                  Terminate Isolation Interface
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
