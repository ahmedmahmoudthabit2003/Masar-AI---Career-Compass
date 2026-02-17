
import React, { useState, useEffect, useRef } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { searchJobsSmart } from '../../services/geminiService';
import { JobListing } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import L from 'leaflet';

const JobsDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<L.Map | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // تنظيف الخريطة عند الخروج لمنع Memory Leaks
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'map' && mapRef.current) {
      if (!leafletMapInstance.current) {
        leafletMapInstance.current = L.map(mapRef.current).setView([24.7136, 46.6753], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(leafletMapInstance.current);
      }
      
      const map = leafletMapInstance.current;
      // مسح العلامات القديمة
      map.eachLayer(l => l instanceof L.Marker && map.removeLayer(l));
      
      jobs.forEach(j => {
        if (j.location?.lat && j.location?.lng) {
          L.marker([j.location.lat, j.location.lng])
            .addTo(map)
            .bindPopup(`<b>${j.title}</b><br>${j.company.display_name}`);
        }
      });
    }
  }, [viewMode, jobs]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchJobsSmart(searchQuery || 'تقنية', location || 'الرياض');
      setJobs(res.jobs);
      showToast('تم تحديث قائمة الفرص الحية', 'success');
    } catch (e) {
      showToast('فشل في جلب الوظائف، حاول لاحقاً', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <Card className="p-8 border-none shadow-2xl bg-white dark:bg-surface-900 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="المسمى الوظيفي..." 
            className="flex-1 p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-surface-800 outline-none font-bold" 
          />
          <input 
            type="text" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            placeholder="المدينة..." 
            className="flex-1 p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-surface-800 outline-none font-bold" 
          />
          <Button onClick={handleSearch} isLoading={loading} variant="gradient" className="px-10 rounded-2xl">بحث</Button>
        </div>
        <div className="flex justify-center gap-2">
           <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-xl font-bold transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500'}`}>قائمة</button>
           <button onClick={() => setViewMode('map')} className={`px-6 py-2 rounded-xl font-bold transition-all ${viewMode === 'map' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500'}`}>خريطة</button>
        </div>
      </Card>

      {viewMode === 'map' ? (
        <div ref={mapRef} className="h-[500px] w-full rounded-[3rem] shadow-2xl border-4 border-white dark:border-surface-800 overflow-hidden z-10" />
      ) : (
        <div className="grid gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="p-6 rounded-[2.5rem] hover:shadow-2xl transition-all border-none bg-white dark:bg-surface-800 group">
              <div className="flex justify-between items-start">
                 <div>
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors">{job.title}</h4>
                    <p className="text-slate-500 font-bold">{job.company.display_name} • {job.location.display_name}</p>
                 </div>
                 <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="bg-primary-50 text-primary-600 px-6 py-2 rounded-xl font-black text-sm hover:bg-primary-600 hover:text-white transition-all">تقديم</a>
              </div>
              <p className="text-sm text-slate-500 mt-4 line-clamp-2 leading-relaxed">{job.description}</p>
            </Card>
          ))}
          {!loading && jobs.length === 0 && <div className="text-center py-20 text-slate-400 font-bold">ابدأ البحث لاكتشاف الفرص المهنية...</div>}
        </div>
      )}
    </div>
  );
};

export default JobsDashboard;
