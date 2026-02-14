
import React, { useState, useEffect } from 'react';
import { CreditPlan, Category, SubscriptionTier, User } from '../types';

interface PaymentModalProps {
  plan: CreditPlan;
  onClose: () => void;
  onSuccess: (siteDetails?: any) => void;
  currentUser?: User | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess, currentUser }) => {
  const [step, setStep] = useState<'review' | 'stripe' | 'processing' | 'details'>('review');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', zip: '' });
  
  const [siteForm, setSiteForm] = useState({
    name: '',
    description: '',
    url: '',
    logo: '',
    category: Category.TECH,
    isPaid: true
  });

  useEffect(() => {
    let interval: any;
    if (step === 'processing') {
      interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (plan.tier === SubscriptionTier.FREE) {
                onSuccess();
              } else {
                setStep('details');
              }
            }, 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [step, plan.tier, onSuccess]);

  const handleStripePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
  };

  const handleSubmitDetails = () => {
    onSuccess(siteForm);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-500">
      <div className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative">
        
        {/* Step: Review Order */}
        {step === 'review' && (
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Checkout</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Review your plan details</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <i className="fa-solid fa-xmark text-slate-400"></i>
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-bold">{plan.name}</span>
                <span className="theme-bg-soft theme-text px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{plan.tier}</span>
              </div>
              <div className="space-y-2 pb-4 border-b border-slate-200">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Points Bundle</span>
                  <span className="font-bold text-slate-700">{plan.credits} Pts</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Promoted Slots</span>
                  <span className="font-bold text-slate-700">{plan.maxSites} Site(s)</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-black text-slate-900">Total Due</span>
                <span className="text-2xl font-black theme-text">${plan.price}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('stripe')}
              className="w-full py-4 theme-bg text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span>Proceed to Payment</span>
              <i className="fa-solid fa-arrow-right text-sm"></i>
            </button>
          </div>
        )}

        {/* Step: Stripe Elements Mock */}
        {step === 'stripe' && (
          <div className="p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep('review')} className="text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 className="text-2xl font-black text-slate-900">Payment Details</h2>
            </div>

            <form onSubmit={handleStripePayment} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Card Information</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--theme-primary)] transition-all">
                  <div className="relative border-b border-slate-100 bg-white p-4">
                    <input 
                      required
                      placeholder="Card number"
                      className="w-full outline-none text-slate-700 font-medium tracking-widest bg-transparent"
                      value={formatCardNumber(cardData.number)}
                      onChange={e => setCardData({...cardData, number: e.target.value})}
                      maxLength={19}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                      <i className="fa-brands fa-cc-visa text-slate-300 text-xl"></i>
                      <i className="fa-brands fa-cc-mastercard text-slate-300 text-xl"></i>
                    </div>
                  </div>
                  <div className="flex bg-white">
                    <input 
                      required
                      placeholder="MM / YY"
                      className="w-1/2 p-4 border-r border-slate-100 outline-none text-slate-700 font-medium bg-transparent"
                      value={cardData.expiry}
                      onChange={e => setCardData({...cardData, expiry: e.target.value})}
                      maxLength={5}
                    />
                    <input 
                      required
                      placeholder="CVC"
                      className="w-1/2 p-4 outline-none text-slate-700 font-medium bg-transparent"
                      value={cardData.cvc}
                      onChange={e => setCardData({...cardData, cvc: e.target.value})}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Country or Region</label>
                <select className="w-full p-4 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[var(--theme-primary)]">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Germany</option>
                  <option>Japan</option>
                </select>
                <input 
                  placeholder="ZIP"
                  className="w-full mt-2 p-4 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 bg-white focus:ring-2 focus:ring-[var(--theme-primary)]"
                  value={cardData.zip}
                  onChange={e => setCardData({...cardData, zip: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 theme-bg text-white rounded-2xl font-black text-lg shadow-xl hover:opacity-90 active:scale-95 transition-all mt-4"
              >
                Pay ${plan.price}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment via Stripe</span>
              </div>
            </form>
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="p-10 h-[450px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48" cy="48" r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="48" cy="48" r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * processingProgress) / 100}
                  className="theme-text transition-all duration-300 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className={`fa-solid ${processingProgress >= 100 ? 'fa-check scale-150' : 'fa-shield-halved'} theme-text transition-all duration-500`}></i>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {processingProgress < 100 ? 'Authenticating...' : 'Payment Verified'}
            </h2>
            <p className="text-slate-500 font-medium max-w-xs">
              {processingProgress < 100 
                ? 'Please wait while we secure your transaction with your bank.' 
                : 'Redirecting you to complete your site listing...'}
            </p>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="h-1 w-8 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full theme-bg animate-shimmer"></div>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PCI-DSS Compliant</span>
              <div className="h-1 w-8 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full theme-bg animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Site Details */}
        {step === 'details' && (
          <div className="p-10 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Claim Your Slot</h2>
            <p className="text-slate-500 mb-8 text-sm font-medium">Payment successful! Now, let's set up your {plan.tier} listing.</p>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Website Title</label>
                <input 
                  placeholder="e.g. My Awesome Project" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all font-medium"
                  value={siteForm.name}
                  onChange={e => setSiteForm({...siteForm, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Target URL</label>
                <input 
                  placeholder="https://yourwebsite.com" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] transition-all font-medium"
                  value={siteForm.url}
                  onChange={e => setSiteForm({...siteForm, url: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Category</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] font-medium"
                    value={siteForm.category}
                    onChange={e => setSiteForm({...siteForm, category: e.target.value as Category})}
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Favicon URL</label>
                  <input 
                    placeholder="https://..." 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] font-medium"
                    value={siteForm.logo}
                    onChange={e => setSiteForm({...siteForm, logo: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Pitch Description</label>
                <textarea 
                  placeholder="Describe your site in a few words..." 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] h-28 font-medium resize-none"
                  value={siteForm.description}
                  onChange={e => setSiteForm({...siteForm, description: e.target.value})}
                />
              </div>
              
              <button 
                onClick={handleSubmitDetails}
                disabled={!siteForm.name || !siteForm.url}
                className="w-full py-4 theme-bg text-white rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all mt-4"
              >
                Launch Your Slot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
