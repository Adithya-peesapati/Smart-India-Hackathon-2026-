import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Check } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSubmitted(true);
    setName('');
    setPhone('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 max-w-4xl mx-auto py-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          Contact Mandi Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
          Get in touch with state agricultural procurement coordinators or district nodal officers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Contact Info */}
        <div className="md:col-span-5 bg-[#0F291B] dark:bg-[#07170F] text-white rounded-xl p-6 sm:p-8 space-y-6 shadow-md border border-slate-800 dark:border-emerald-900/60">
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-['Public_Sans'] text-white">Nodal Headquarters</h3>
            <p className="text-xs text-slate-300 dark:text-emerald-200/70 leading-relaxed">
              Department of Agriculture & Farmers Welfare, National Mandi Digitization Directorate.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-300 dark:text-emerald-200/80 pt-4 border-t border-white/10 dark:border-emerald-900/40">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi 110001</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Toll-Free: 1800-180-1551</span>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>contact@agrisetu.gov.in</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 font-['Public_Sans']">Send a Message</h3>

          {submitted ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Your message has been sent to the district coordinator. We will reach out shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-emerald-200">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#07130E] focus:bg-white dark:focus:bg-[#0D261B] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 dark:focus:border-emerald-400 rounded-lg outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-emerald-200">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#07130E] focus:bg-white dark:focus:bg-[#0D261B] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 dark:focus:border-emerald-400 rounded-lg outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 dark:text-emerald-200">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you?"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#07130E] focus:bg-white dark:focus:bg-[#0D261B] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 dark:focus:border-emerald-400 rounded-lg outline-none text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
