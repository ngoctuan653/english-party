import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { db } from '@/services/firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockChartData = [
  { name: 'Mon', sessions: 4 },
  { name: 'Tue', sessions: 7 },
  { name: 'Wed', sessions: 5 },
  { name: 'Thu', sessions: 12 },
  { name: 'Fri', sessions: 8 },
  { name: 'Sat', sessions: 15 },
  { name: 'Sun', sessions: 18 },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    usersCount: 0,
    questionsCount: 0,
    vocabCount: 0,
    sessionsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const questionsSnap = await getDocs(collection(db, 'questions'));
        const vocabSnap = await getDocs(collection(db, 'vocabulary'));
        const sessionsSnap = await getDocs(query(collection(db, 'study_sessions'), limit(100)));

        setStats({
          usersCount: usersSnap.size,
          questionsCount: questionsSnap.size,
          vocabCount: vocabSnap.size,
          sessionsCount: sessionsSnap.size,
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const adminActions = [
    {
      title: 'Import CSV Data',
      desc: 'Bulk import questions or vocabulary lists from a CSV file',
      icon: Icons.FileSpreadsheet,
      path: '/admin/import',
      color: 'text-violet-700 bg-violet-50/50 border-violet-200/60 hover:bg-violet-50',
    },
    {
      title: 'Manage Questions',
      desc: 'Create, edit, toggle, or view TOEIC mock exam questions',
      icon: Icons.HelpCircle,
      path: '/admin/questions',
      color: 'text-[#0071E3] bg-blue-50/50 border-blue-200/60 hover:bg-blue-50',
    },
    {
      title: 'Manage Vocabulary',
      desc: 'Create and update flashcard lists and synonyms',
      icon: Icons.BookOpen,
      path: '/admin/vocabulary',
      color: 'text-teal-700 bg-teal-50/50 border-teal-200/60 hover:bg-teal-50',
    },
  ];

  return (
    <div className="space-y-8 pb-8 text-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <Icons.ShieldAlert className="w-6 h-6 text-[#0071E3]" />
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900">Admin Control Center</h1>
        </div>
        <p className="mt-1 text-sm text-slate-505">
          Monitor party activity and update educational assets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.usersCount, icon: Icons.Users, color: 'text-indigo-600' },
          { label: 'Total Questions', value: stats.questionsCount, icon: Icons.FileQuestion, color: 'text-[#0071E3]' },
          { label: 'Vocabulary Words', value: stats.vocabCount, icon: Icons.BookOpen, color: 'text-teal-600' },
          { label: 'Study Sessions', value: stats.sessionsCount, icon: Icons.LineChart, color: 'text-violet-600' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="p-5 flex flex-col justify-between bg-white border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions list */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-850 mb-2">Actions</h2>
          {adminActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(action.path)}
                className={`flex gap-4 p-4 rounded-2xl border hover:scale-[1.01] transition-all cursor-pointer shadow-sm ${action.color}`}
              >
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 shrink-0 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{action.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sessions Activity Chart */}
        <Card className="lg:col-span-2 p-6 bg-white border border-slate-200/60 space-y-4 shadow-sm flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Study Sessions (Past 7 Days)</h2>
            <Badge variant="purple" className="text-[10px]">Real-time activity</Badge>
          </div>

          <div className="flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071E3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#86868b" fontSize={11} tickLine={false} />
                <YAxis stroke="#86868b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#1d1d1f',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#0071E3"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
