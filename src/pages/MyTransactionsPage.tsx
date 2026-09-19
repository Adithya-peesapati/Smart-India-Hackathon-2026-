import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction } from '../types';
import { transactionService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  CreditCard,
  Search,
  FileText,
  FolderOpen,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MyTransactionsPageProps {
  currentUser: UserProfile | null;
  onNavigate: (page: string, params?: any) => void;
}

export const MyTransactionsPage: React.FC<MyTransactionsPageProps> = ({
  currentUser,
  onNavigate,
}) => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!currentUser) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await transactionService.getFarmerTransactions(currentUser.id);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const handleUpdate = () => fetchTransactions();
    window.addEventListener('farmlink_storage_update', handleUpdate);
    return () => window.removeEventListener('farmlink_storage_update', handleUpdate);
  }, [currentUser]);

  const filteredTxns = transactions.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.paymentStatus === filterStatus;
    const matchesSearch =
      t.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.centreName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalAmountEarned = transactions
    .filter((t) => t.paymentStatus === 'completed')
    .reduce((acc, t) => acc + t.totalAmount, 0);

  const totalQuintalsSold = transactions
    .filter((t) => t.paymentStatus === 'completed')
    .reduce((acc, t) => acc + t.quantityQuintals, 0);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-['Public_Sans']">
            {t('nav.transactions', 'My Transactions & Payouts')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70">
            Official Direct Benefit Transfer (DBT) settlement records and procurement weighbridge invoices.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            {t('dash.total_payments', 'Total Disbursed Earnings')}
          </span>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            ₹{totalAmountEarned.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-emerald-200/60 font-medium block">
            Direct to linked bank account
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            Total Volume Sold
          </span>
          <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {totalQuintalsSold} <span className="text-base font-normal">Qtl</span>
          </p>
          <span className="text-[11px] text-slate-500 dark:text-emerald-200/60 font-medium block">
            Weighed at certified weighbridges
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 dark:text-emerald-400/70 uppercase tracking-wider">
            {t('dash.completed_txns', 'Completed Settlements')}
          </span>
          <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {transactions.filter((t) => t.paymentStatus === 'completed').length}
          </p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium block">
            Verified J-Form receipts generated
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="p-4 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by txn ID, crop, centre..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#07130E] hover:bg-slate-100/60 dark:hover:bg-[#0B1E16] focus:bg-white dark:focus:bg-[#0E2419] border border-slate-200 dark:border-emerald-900 focus:border-emerald-600 rounded-lg outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'completed', label: 'Completed DBT' },
            { id: 'processing', label: 'Processing' },
            { id: 'pending', label: 'Pending Weighment' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-[#122A1F] text-slate-600 dark:text-emerald-200 hover:bg-slate-200/70 dark:hover:bg-[#1A3B2C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
          Loading DBT settlement records...
        </div>
      ) : filteredTxns.length === 0 ? (
        <div className="py-16 px-4 bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 text-center flex flex-col items-center justify-center shadow-2xs">
          <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-emerald-950 border border-slate-200 dark:border-emerald-800 flex items-center justify-center text-slate-400 mb-3">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Public_Sans']">No transaction records found</h3>
          <p className="text-xs text-slate-500 dark:text-emerald-200/70 max-w-sm mt-1 mb-4">
            Completed procurement bookings and weighbridge receipts will generate your official Direct Benefit Transfer (DBT) payout records here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('book-slot')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            {t('dash.book_slot', 'Book Procurement Slot')}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#07130E] text-slate-500 dark:text-emerald-300/80 font-semibold border-b border-slate-200 dark:border-emerald-900/60">
                <tr>
                  <th className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider">Transaction Ref</th>
                  <th className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider">Centre & Date</th>
                  <th className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider">Crop & Volume</th>
                  <th className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider">Rate (MSP/Qtl)</th>
                  <th className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider">Total Amount</th>
                  <th className="py-3.5 px-4 font-bold uppercase text-[11px] tracking-wider">Payment Status</th>
                  <th className="py-3.5 px-4 text-right font-bold uppercase text-[11px] tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                {filteredTxns.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#143224] transition-colors"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {t.transactionReference}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{t.centreName}</p>
                      <p className="text-[11px] text-slate-400 dark:text-emerald-400/60">{t.date}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{t.cropType}</p>
                      <p className="text-[11px] text-slate-400 dark:text-emerald-400/60">{t.quantityQuintals} Quintals</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700 dark:text-emerald-100">
                      ₹{t.ratePerQuintal}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                      ₹{t.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={t.paymentStatus} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTxn(t)}
                        className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* J-Form / Settlement Invoice Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#091C13] rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/60 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Electronic Mandi J-Form Receipt
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Public_Sans']">
                  {selectedTxn.transactionReference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#143224] text-slate-500 dark:text-emerald-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-[#07130E] rounded-xl border border-slate-200 dark:border-emerald-900/60">
                <div>
                  <span className="text-slate-400 dark:text-emerald-400/70">Farmer Name:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTxn.farmerName}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-emerald-400/70">Centre:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTxn.centreName}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-emerald-400/70">Commodity:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTxn.cropType}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-emerald-400/70">Net Certified Weight:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedTxn.quantityQuintals} Quintals</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">Total MSP Payout Disbursed</span>
                  <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    ₹{selectedTxn.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <StatusBadge status={selectedTxn.paymentStatus} size="md" />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-emerald-200/70 space-y-1">
                <p>Payment Mode: Direct Benefit Transfer (DBT) to registered bank account.</p>
                <p>Digital Mandi Gate Clearance Verified.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-emerald-900/60">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer"
              >
                Print Official J-Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
