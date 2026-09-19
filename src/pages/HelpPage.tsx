import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const faqs = [
    {
      q: 'How does the digital slot booking system prevent Mandi crowding?',
      a: 'AgriSetu allocates specific arrival time slots and issues algorithmic queue tokens. Farmers receive live updates on their smartphones regarding the current token being served, eliminating the need to arrive hours in advance and queue up tractors outside the gate.',
    },
    {
      q: 'What documents do I need to bring to the procurement centre?',
      a: 'Bring your digital booking token (QR code on your smartphone or printed receipt), your government farmer registration card/Aadhaar, and land records verifying the crop cultivation.',
    },
    {
      q: 'What is the maximum permissible moisture limit for wheat and paddy?',
      a: 'Standard government MSP guidelines mandate a maximum moisture content of 12% for wheat and 17% for paddy at the weighbridge quality inspection checkpoint.',
    },
    {
      q: 'How long does it take for the DBT payment to reach my bank account?',
      a: 'Once the weighbridge receipt and electronic J-Form are issued, Direct Benefit Transfer (DBT) funds are initiated through the Public Financial Management System (PFMS) directly into your linked bank account within 24–48 hours.',
    },
    {
      q: 'Can I reschedule or cancel a booking if my harvest is delayed?',
      a: 'Yes, you can cancel or re-book a slot up to 2 hours prior to your scheduled arrival time via the "My Bookings" section in your farmer dashboard.',
    },
  ];

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setGrievanceSubmitted(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setGrievanceSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
          Help & Support Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
          Find quick answers, contact Mandi support desks, or submit a procurement grievance.
        </p>
      </div>

      {/* 3 Support Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 shadow-2xs">
          <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">Kisan Toll-Free Helpline</h4>
          <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">1800-180-1551</p>
          <p className="text-[11px] text-slate-400 dark:text-emerald-300/60">Available 6:00 AM - 10:00 PM</p>
        </div>

        <div className="p-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 shadow-2xs">
          <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">Procurement Desk Email</h4>
          <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">support@agrisetu.gov.in</p>
          <p className="text-[11px] text-slate-400 dark:text-emerald-300/60">Response within 24 business hours</p>
        </div>

        <div className="p-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center space-y-2 shadow-2xs">
          <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">Mandi Helpdesks</h4>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Physical Counters</p>
          <p className="text-[11px] text-slate-400 dark:text-emerald-300/60">Located at all procurement centres</p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Public_Sans']">
          <FileQuestion className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-emerald-900/40">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-emerald-400/60 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-emerald-100/80 leading-relaxed pt-2.5 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandi Grievance Form */}
      <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 p-6 sm:p-8 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-['Public_Sans']">
          <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Log a Mandi or Payment Grievance</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-emerald-200/70">
          If you experienced delays, discrepancy in weighbridge readings, or payment settlement issues, log an official grievance ticket below.
        </p>

        {grievanceSubmitted ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
            Thank you. Your grievance ticket has been registered with the district procurement officer. Ticket ID: #GRV-2025-{Math.floor(1000 + Math.random() * 9000)}.
          </div>
        ) : (
          <form onSubmit={handleGrievanceSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Weighbridge delay at North Zone Hub"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#07130E] focus:bg-white dark:focus:bg-[#0D261B] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 dark:focus:border-emerald-400 rounded-lg outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200">Description</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe the incident, date, and booking reference..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#07130E] focus:bg-white dark:focus:bg-[#0D261B] border border-slate-200 dark:border-emerald-800 focus:border-emerald-600 dark:focus:border-emerald-400 rounded-lg outline-none text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Submit Grievance
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
