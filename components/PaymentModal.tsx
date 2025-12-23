
import React, { useState, useEffect } from 'react';
import { CreditPlan, Category, SubscriptionTier, User } from '../types';

interface PaymentModalProps {
  plan: CreditPlan;
  onClose: () => void;
  onSuccess: (siteDetails?: any) => void;
  currentUser?: User | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess, currentUser }) => {
  const [step, setStep] = useState<'pay' | 'burning' | 'details'>('pay');
  const [timer, setTimer] = useState(30);
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
    if (step === 'burning' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (step === 'burning' && timer === 0) {
      if (plan.tier === SubscriptionTier.FREE) {
        onSuccess();
      } else {
        setStep('details');
      }
    }
    return () => clearInterval(interval);
  }, [step, timer, plan.tier, onSuccess]);

  const handlePaymentClick = () => {
    setStep('burning');
  };

  const handleSubmitDetails = () => {
    onSuccess(siteForm);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative">
        {step === 'pay' && (
          <div className="p-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Secure Checkout</h2>
            <p className="text-slate-500 mb-8">Upgrading to <span className="theme-text font-bold">{plan.name}</span></p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500 font-medium">Subscription</span>
                <span className="font-bold text-slate-900">${plan.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Credits Included</span>
                <span className="theme-text font-black">{plan.credits} Pts</span>
              </div>
            </div>

            <button 
              onClick={handlePaymentClick}
              className="w-full py-4 theme-bg text-white rounded-xl font-black text-lg shadow-xl hover:scale-[1.02] transition-transform"
            >
              Complete Payment
            </button>
            <button onClick={onClose} className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600">Cancel</button>
          </div>
        )}

        {step === 'burning' && (
          <div className="p-8 h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-orange-600">
            <div className="absolute inset-0 z-0 animate-pulse opacity-50">
               <div className="w-full h-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400" />
            </div>
            <div className="relative z-10 text-center text-white">
              <i className="fa-solid fa-fire text-8xl mb-6 animate-bounce"></i>
              <h2 className="text-4xl font-black mb-2 italic">PROCESSING...</h2>
              <p className="text-xl font-bold opacity-80">Security Protocol Alpha: {timer}s</p>
              <p className="mt-8 text-sm max-w-xs mx-auto">Please do not refresh. Our neural nodes are authenticating your transaction in a secure burning environment.</p>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">List Your Website</h2>
            <p className="text-slate-500 mb-6 text-sm">As a {plan.tier} member, you can now add your site to the top of our directory.</p>
            
            <div className="space-y-4">
              <input 
                placeholder="Website Name" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                value={siteForm.name}
                onChange={e => setSiteForm({...siteForm, name: e.target.value})}
              />
              <input 
                placeholder="Website URL (https://...)" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                value={siteForm.url}
                onChange={e => setSiteForm({...siteForm, url: e.target.value})}
              />
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                value={siteForm.category}
                onChange={e => setSiteForm({...siteForm, category: e.target.value as Category})}
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                placeholder="Logo Image URL" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                value={siteForm.logo}
                onChange={e => setSiteForm({...siteForm, logo: e.target.value})}
              />
              <textarea 
                placeholder="Catchy Description" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] h-24"
                value={siteForm.description}
                onChange={e => setSiteForm({...siteForm, description: e.target.value})}
              />
              
              <button 
                onClick={handleSubmitDetails}
                disabled={!siteForm.name || !siteForm.url}
                className="w-full py-4 theme-bg text-white rounded-xl font-black shadow-lg disabled:opacity-50"
              >
                Submit Site Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
