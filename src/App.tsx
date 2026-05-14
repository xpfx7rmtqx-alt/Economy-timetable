import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  ChevronRight, 
  GraduationCap, 
  LayoutDashboard, 
  Search, 
  User,
  Plus,
  MoreVertical,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Category = 'common' | 'specialized' | 'related';
type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F' | 'P' | 'N' | 'none';

interface Course {
  id: string;
  name: string;
  room: string;
  day: Day;
  period: number;
  credits: number;
  category: Category;
  semester: string;
  grade: Grade;
  color?: string;
}

// --- Mock Data ---
const INITIAL_COURSES: Course[] = [
  { id: '1', name: 'ミクロ経済学 I', room: '101講義室', day: 'Mon', period: 1, credits: 2, category: 'specialized', semester: '2024-Autumn', grade: 'none', color: '#003B71' },
  { id: '2', name: '基礎統計学', room: '演習室B', day: 'Wed', period: 1, credits: 2, category: 'specialized', semester: '2024-Autumn', grade: 'none', color: '#003B71' },
  { id: '3', name: '経済数学', room: '202講義室', day: 'Fri', period: 1, credits: 2, category: 'specialized', semester: '2024-Autumn', grade: 'none', color: '#003B71' },
  { id: '4', name: '法学概論', room: 'L104', day: 'Tue', period: 2, credits: 2, category: 'common', semester: '2024-Autumn', grade: 'none', color: '#10B981' },
  { id: '5', name: 'ミクロ経済学 I', room: '101講義室', day: 'Thu', period: 2, credits: 2, category: 'specialized', semester: '2024-Autumn', grade: 'none', color: '#003B71' },
  // Past courses
  { id: 'p1', name: 'マクロ経済学 I', room: '101', day: 'Mon', period: 1, credits: 2, category: 'specialized', semester: '2024-Spring', grade: 'A', color: '#003B71' },
  { id: 'p2', name: '経済原論', room: '102', day: 'Tue', period: 2, credits: 2, category: 'specialized', semester: '2024-Spring', grade: 'S', color: '#003B71' },
  { id: 'p3', name: '情報リテラシー', room: 'PC2', day: 'Wed', period: 3, credits: 1, category: 'common', semester: '2024-Spring', grade: 'A', color: '#10B981' },
];

const GRAD_REQUIREMENTS = {
  common: 32,
  specialized: 60,
  related: 32,
  total: 124,
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-[#EBF1F7] text-[#003B71] font-semibold shadow-sm' 
        : 'text-[#4A4D55] hover:bg-gray-100'
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

const ProgressBar = ({ label, current, total, color = '#003B71' }: { label: string, current: number, total: number, color?: string }) => {
  const percentage = Math.min(100, (current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#4A4D55] font-medium">{label}</span>
        <span className="font-semibold">{current} / {total}</span>
      </div>
      <div className="h-2.5 bg-[#EBF1F7] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const CourseModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  course, 
  existingCourses, 
  currentSemester 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (course: Partial<Course>) => void, 
  course?: Course | null, 
  existingCourses: Course[],
  currentSemester: string
}) => {
  const [formData, setFormData] = useState<Partial<Course>>(course || { 
    name: '', room: '', day: 'Mon', period: 1, credits: 2, 
    category: 'specialized', grade: 'none', semester: currentSemester 
  });
  const [error, setError] = useState<string | null>(null);

  // Reset form when course change or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(course || { 
        name: '', room: '', day: 'Mon', period: 1, credits: 2, 
        category: 'specialized', grade: 'none', semester: currentSemester 
      });
      setError(null);
    }
  }, [isOpen, course, currentSemester]);

  if (!isOpen) return null;

  const handleValidateAndSave = () => {
    if (!formData.name) {
      setError('科目名を入力してください');
      return;
    }

    // Duplicate check for the same semester
    const duplicate = existingCourses.find(c => 
      c.id !== course?.id && 
      c.semester === formData.semester && 
      c.day === formData.day && 
      c.period === formData.period
    );

    if (duplicate) {
      setError(`登録失敗: ${duplicate.name} が既に同じ時間帯（${duplicate.day}曜 ${duplicate.period}限）に登録されています。`);
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <h3 className="text-xl font-bold mb-6">{course ? '科目の編集' : '新規科目登録'}</h3>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">学期</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] outline-none"
              value={formData.semester}
              onChange={e => setFormData({...formData, semester: e.target.value})}
            >
              <option value="2024-Spring">2024年度 春学期</option>
              <option value="2024-Autumn">2024年度 秋学期</option>
              <option value="2025-Spring">2025年度 春学期</option>
              <option value="2025-Autumn">2025年度 秋学期</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">科目名</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] focus:ring-1 focus:ring-[#003B71] transition-all outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="例: マクロ経済学"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">教室</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] focus:ring-1 focus:ring-[#003B71] outline-none"
                value={formData.room}
                onChange={e => setFormData({...formData, room: e.target.value})}
                placeholder="例: 101"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">単位数</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] focus:ring-1 focus:ring-[#003B71] outline-none"
                value={formData.credits}
                onChange={e => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">曜日</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] outline-none"
                value={formData.day}
                onChange={e => setFormData({...formData, day: e.target.value as Day})}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => <option key={d} value={d}>{
                  d === 'Mon' ? '月' : d === 'Tue' ? '火' : d === 'Wed' ? '水' : d === 'Thu' ? '木' : '金'
                }</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">時限</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] outline-none"
                value={formData.period}
                onChange={e => setFormData({...formData, period: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}限</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">カテゴリー</label>
            <div className="flex gap-2 mt-2">
              {(['common', 'specialized', 'related'] as Category[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    formData.category === cat ? 'bg-[#003B71] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'common' ? '基礎' : cat === 'specialized' ? '専門' : '関連'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">成績 (任意)</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#003B71] outline-none"
              value={formData.grade}
              onChange={e => setFormData({...formData, grade: e.target.value as Grade})}
            >
              <option value="none">未定</option>
              <option value="S">S (秀)</option>
              <option value="A">A (優)</option>
              <option value="B">B (良)</option>
              <option value="C">C (可)</option>
              <option value="D">D (可)</option>
              <option value="F">F (不可)</option>
              <option value="P">P (合格)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all">キャンセル</button>
          <button onClick={handleValidateAndSave} className="flex-1 px-4 py-3 rounded-xl bg-[#003B71] text-white font-bold hover:bg-[#002B56] transition-all shadow-lg">保存する</button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('timetable');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [currentSemester, setCurrentSemester] = useState('2024-Autumn');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleSaveCourse = (data: Partial<Course>) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...data } as Course : c));
    } else {
      const newCourse = { ...data, id: Date.now().toString() } as Course;
      setCourses([...courses, newCourse]);
    }
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const currentSemesterCourses = useMemo(() => {
    return courses.filter(c => c.semester === currentSemester);
  }, [courses, currentSemester]);

  const creditsByCategory = useMemo(() => {
    // Only count passing grades or current courses as "towards graduation"
    // Passing grades: S, A, B, C, D, P
    return courses.reduce((acc, course) => {
      const isPassing = ['S', 'A', 'B', 'C', 'D', 'P', 'none'].includes(course.grade);
      if (isPassing) {
        acc[course.category] = (acc[course.category] || 0) + course.credits;
      }
      return acc;
    }, { common: 0, specialized: 0, related: 0 } as Record<Category, number>);
  }, [courses]);

  const gpaData = useMemo(() => {
    const gradePoints: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 1, 'F': 0 };
    const gradedCourses = courses.filter(c => gradePoints[c.grade] !== undefined);
    
    if (gradedCourses.length === 0) return { totalGPA: 0, totalCredits: 0 };

    let weightedSum = 0;
    let totalGradedCredits = 0;

    gradedCourses.forEach(c => {
      weightedSum += gradePoints[c.grade] * c.credits;
      totalGradedCredits += c.credits;
    });

    return {
      totalGPA: totalGradedCredits > 0 ? (weightedSum / totalGradedCredits).toFixed(2) : 0,
      totalCredits: totalGradedCredits
    };
  }, [courses]);

  const totalCredits = useMemo(() => {
    return Object.values(creditsByCategory).reduce((sum, c) => sum + c, 0);
  }, [creditsByCategory]);

  const timetable = useMemo(() => {
    const grid: Record<string, Course | null> = {};
    const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (let p = 1; p <= 5; p++) {
      for (const d of days) {
        const course = currentSemesterCourses.find(c => c.day === d && c.period === p);
        grid[`${d}-${p}`] = course || null;
      }
    }
    return grid;
  }, [currentSemesterCourses]);

  return (
    <div className="h-screen flex flex-col bg-[#F0F2F5] font-sans overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-[#003B71] text-white flex items-center justify-between px-6 shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">W</div>
          <h1 className="text-xl font-bold tracking-tight">WADAI PORTAL <span className="font-light opacity-80 text-sm ml-2 hidden sm:inline">： 経済学部</span></h1>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="hidden md:flex flex-col items-end text-xs">
            <select 
              className="bg-transparent text-white font-semibold outline-none cursor-pointer text-right appearance-none"
              value={currentSemester}
              onChange={e => setCurrentSemester(e.target.value)}
            >
              <option value="2024-Spring" className="text-gray-900">2024年 春学期</option>
              <option value="2024-Autumn" className="text-gray-900">2024年 秋学期</option>
              <option value="2025-Spring" className="text-gray-900">2025年 春学期</option>
              <option value="2025-Autumn" className="text-gray-900">2025年 秋学期</option>
            </select>
            <span className="text-white/60">第3クォーター</span>
          </div>
          <div className="flex items-center gap-3 pl-5 border-l border-white/20">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">和歌山 太郎</p>
              <p className="text-[10px] opacity-60">21E001 · 4年次</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <User size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-2 shrink-0">
          <SidebarItem icon={LayoutDashboard} label="ダッシュボード" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Calendar} label="履修・時間割" active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} />
          <SidebarItem icon={GraduationCap} label="卒業要件確認" active={activeTab === 'grad'} onClick={() => setActiveTab('grad')} />
          <SidebarItem icon={Search} label="シラバス検索" />
          
          <div className="mt-auto p-4 bg-blue-50 rounded-2xl">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Next Class</p>
            <p className="text-sm font-bold text-[#003B71]">ミクロ経済学 I</p>
            <p className="text-xs text-gray-500 mt-1">10:40 · 101講義室</p>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Timetable / Major Content */}
            <section className="lg:col-span-2 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{activeTab === 'timetable' ? '週間時間割' : activeTab === 'grad' ? '卒業要件・成績' : 'ダッシュボード'}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentSemester.replace('-', ' ')} Semester
                    </p>
                  </div>
                  <button 
                    onClick={handleAddCourse}
                    className="flex items-center gap-2 bg-[#003B71] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#002B56] transition-colors shadow-md"
                  >
                    <Plus size={18} />
                    科目登録
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' ? (
                    <motion.div 
                      key="dashboard-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#003B71] text-white p-6 rounded-3xl shadow-lg">
                          <h4 className="text-xs font-bold text-white/60 uppercase mb-4 tracking-widest">GPA Achievement</h4>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                              <span className="text-2xl font-black">{gpaData.totalGPA}</span>
                            </div>
                            <div>
                              <p className="text-lg font-bold">優秀な成績です</p>
                              <p className="text-sm text-white/60">修得済み: {totalCredits} 単位</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                          <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Today's Schedule</h4>
                          <div className="space-y-3">
                            {currentSemesterCourses.filter(c => c.day === 'Mon').slice(0, 2).map(c => (
                              <div key={c.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                  {c.period}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{c.name}</p>
                                  <p className="text-[10px] text-gray-500">{c.room}</p>
                                </div>
                              </div>
                            ))}
                            {currentSemesterCourses.filter(c => c.day === 'Mon').length === 0 && (
                              <p className="text-sm text-gray-400 italic">本日の講義はありません</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-3xl p-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">卒業までの進捗</h4>
                        <div className="space-y-4">
                          <ProgressBar label="共通教育" current={creditsByCategory.common} total={GRAD_REQUIREMENTS.common} color="#10B981" />
                          <ProgressBar label="専門科目" current={creditsByCategory.specialized} total={GRAD_REQUIREMENTS.specialized} color="#003B71" />
                        </div>
                      </div>
                    </motion.div>
                  ) : activeTab === 'grad' ? (
                    <motion.div 
                      key="grad-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-blue-50 rounded-2xl">
                          <h4 className="text-sm font-bold text-[#003B71] mb-2 uppercase tracking-wider">全体のGPA</h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-[#003B71]">{gpaData.totalGPA}</span>
                            <span className="text-sm text-[#003B71]/60">/ 4.00</span>
                          </div>
                        </div>
                        <div className="p-6 bg-green-50 rounded-2xl">
                          <h4 className="text-sm font-bold text-green-700 mb-2 uppercase tracking-wider">修得単位数</h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-green-700">{totalCredits}</span>
                            <span className="text-sm text-green-700/60">/ {GRAD_REQUIREMENTS.total}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Clock size={18} className="text-gray-400" />
                          履修履歴と成績
                        </h3>
                        {Array.from(new Set(courses.map(c => c.semester))).sort().reverse().map(sem => (
                          <div key={sem} className="space-y-3">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">{sem.replace('-', ' ')}</h4>
                            <div className="grid gap-2">
                              {courses.filter(c => c.semester === sem).map(c => (
                                <div 
                                  key={c.id} 
                                  onClick={() => handleEditCourse(c)}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                                      ['S', 'A'].includes(c.grade) ? 'bg-blue-100 text-blue-700' : 
                                      ['B', 'C'].includes(c.grade) ? 'bg-green-100 text-green-700' :
                                      c.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {c.grade === 'none' ? '-' : c.grade}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">{c.name}</p>
                                      <p className="text-[10px] text-gray-500 uppercase">{c.category} · {c.credits}単位</p>
                                    </div>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="timetable-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="overflow-x-auto"
                    >
                      <div className="min-w-[600px]">
                        <div className="grid grid-cols-[50px_repeat(5,1fr)] gap-2">
                          <div />
                          {['月', '火', '水', '木', '金'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">{day}</div>
                          ))}

                          {[1, 2, 3, 4, 5].map(period => (
                            <React.Fragment key={period}>
                              <div className="flex flex-col items-center justify-center text-[10px] font-bold text-gray-400 border-r border-gray-100">
                                <span>{period}</span>
                                <span className="opacity-50 font-normal">限</span>
                              </div>
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                                const course = timetable[`${day}-${period}`];
                                return (
                                  <div 
                                    key={`${day}-${period}`} 
                                    onClick={() => course && handleEditCourse(course)}
                                    className="h-28 rounded-xl bg-gray-50 border border-gray-100 p-3 transition-all hover:shadow-md cursor-pointer group relative overflow-hidden"
                                  >
                                    {course ? (
                                      <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="h-full flex flex-col justify-between"
                                      >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#003B71]" />
                                        <div>
                                          <p className="text-xs font-bold text-[#003B71] leading-tight line-clamp-2">{course.name}</p>
                                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                            <Clock size={10} />
                                            <span>{course.room}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                            course.category === 'specialized' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                          }`}>
                                            {course.credits}単
                                          </span>
                                          <MoreVertical size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                      </motion.div>
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={20} className="text-gray-300" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </section>

            {/* Right: Credit Summary & Stats */}
            <section className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col h-full"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-8">卒業必要単位の状況</h2>
                
                <div className="space-y-8 flex-1">
                  <ProgressBar 
                    label="共通教育科目" 
                    current={creditsByCategory.common} 
                    total={GRAD_REQUIREMENTS.common} 
                    color="#10B981"
                  />
                  <ProgressBar 
                    label="経済学部 専門科目" 
                    current={creditsByCategory.specialized} 
                    total={GRAD_REQUIREMENTS.specialized} 
                    color="#003B71"
                  />
                  <ProgressBar 
                    label="関連科目・自由選択" 
                    current={creditsByCategory.related} 
                    total={GRAD_REQUIREMENTS.related} 
                    color="#6366F1"
                  />
                </div>

                <div className="mt-12 grid grid-cols-2 gap-4 pb-8 border-b border-gray-100">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">修得済み</p>
                    <p className="text-4xl font-black text-[#003B71]">{totalCredits}</p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">残り単位</p>
                    <p className="text-4xl font-black text-gray-300">{Math.max(0, GRAD_REQUIREMENTS.total - totalCredits)}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <div 
                    onClick={() => setActiveTab('grad')}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#003B71]">
                        <BarChart3 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">詳細な成績分析</p>
                        <p className="text-[10px] text-gray-500">GPA: {gpaData.totalGPA}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </main>
      </div>

      <CourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCourse} 
        course={editingCourse}
        existingCourses={courses}
        currentSemester={currentSemester}
      />
    </div>
  );
}

