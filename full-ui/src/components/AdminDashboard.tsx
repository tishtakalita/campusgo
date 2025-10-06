import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import api, { coursesAPI, directoryAPI, adminAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { Header } from './Header';

interface Props { 
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export default function AdminDashboard({ onBack, onNavigate }: Props) {
  const { user } = useUser();
  const [courses, setCourses] = useState<Array<{ id: string; code?: string; name?: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; class?: string; dept?: string; academic_year?: string; section?: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [existingTt, setExistingTt] = useState<any[]>([]);
  const [existingSat, setExistingSat] = useState<any[]>([]);
  // Edit and delete UI state (modal/inline confirm like faculty screens)
  const [editingTt, setEditingTt] = useState<any | null>(null);
  const [editTtData, setEditTtData] = useState<Partial<{ room: string; class: string; day_of_week: string; start_time: string; end_time: string }>>({});
  const [editingSat, setEditingSat] = useState<any | null>(null);
  const [editSatData, setEditSatData] = useState<Partial<{ date: string; class: string; tt_followed: string }>>({});
  const [confirmDelete, setConfirmDelete] = useState<null | { type: 'tt' | 'sat'; id: string }>(null);

  // Timetable form state
  const [tt, setTt] = useState({
    course_id: '',
    room: '',
    class: '', // class code
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '10:00',
  });

  // Saturday mapping form state
  const [sat, setSat] = useState({
    date: '', // YYYY-MM-DD
    class: '',
    tt_followed: 'monday',
  });

  useEffect(() => {
    (async () => {
      try {
        const [cRes, clsRes, ttRes, satRes] = await Promise.all([
          coursesAPI.getAllCourses(),
          directoryAPI.listClasses(),
          adminAPI.listTimetable(),
          adminAPI.listSaturday(),
        ]);
        if (!cRes.error && cRes.data?.courses) setCourses(cRes.data.courses as any);
        if (!clsRes.error && clsRes.data?.classes) setClasses(clsRes.data.classes as any);
        if (!ttRes.error) setExistingTt(ttRes.data?.classes || []);
        if (!satRes.error) setExistingSat(satRes.data?.saturday_class || []);
      } catch {}
    })();
  }, []);

  const createTimetable = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await adminAPI.createTimetable({ ...tt, start_time: normTime(tt.start_time), end_time: normTime(tt.end_time) });
      if (res.error) {
        window.alert(res.error);
      } else {
        window.alert('Timetable row created successfully!');
        // refresh list
        const ttRes = await adminAPI.listTimetable();
        if (!ttRes.error) setExistingTt(ttRes.data?.classes || []);
      }
    } finally { setBusy(false); }
  };

  const createSaturday = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await adminAPI.createSaturdayClass(sat);
      if (res.error) {
        window.alert(res.error);
      } else {
        window.alert('Saturday mapping created successfully!');
        const satRes = await adminAPI.listSaturday();
        if (!satRes.error) setExistingSat(satRes.data?.saturday_class || []);
      }
    } finally { setBusy(false); }
  };

  const normTime = (v: string) => (v?.length === 5 && v.includes(':') ? `${v}:00` : v);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <button onClick={onBack} className="flex items-center gap-2 mb-4"><ArrowLeft /> Back</button>
        <p>Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header 
        userName={user.name || 'Admin'}
        userAvatar={user.avatar || ''}
        onNotificationsClick={() => onNavigate?.('notifications')}
        onProfileClick={() => onNavigate?.('profile')}
      />

      <div className="p-5 text-white">
        <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

        <div className="space-y-6">
          {/* Create Timetable */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Create Timetable Row</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Course</label>
                <select value={tt.course_id} onChange={e=>setTt({...tt, course_id: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code || 'COURSE'} - {c.name || 'Untitled'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Room</label>
                <input value={tt.room} onChange={e=>setTt({...tt, room: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" placeholder="Room" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Class</label>
                <select value={tt.class} onChange={e=>setTt({...tt, class: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  <option value="">Select class</option>
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.class || ''}>
                      {(cl.class || '').toString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Day of Week</label>
                <select value={tt.day_of_week} onChange={e=>setTt({...tt, day_of_week: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  {['monday','tuesday','wednesday','thursday','friday','saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Time</label>
                  <input type="time" value={tt.start_time} onChange={e=>setTt({...tt, start_time: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Time</label>
                  <input type="time" value={tt.end_time} onChange={e=>setTt({...tt, end_time: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={createTimetable} disabled={busy} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-60">Create</button>
              </div>
            </div>
          </div>

          {/* Existing Timetable Entries */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Existing Timetable</h2>
          <div className="space-y-3">
            {existingTt.length === 0 ? (
              <p className="text-gray-400 text-sm">No entries</p>
            ) : (
              existingTt.map((row) => (
                <div key={row.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl bg-gray-700">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{row.courses?.code || ''} {row.courses?.name || ''}</div>
                    <div className="text-gray-300 text-sm">{(row.day_of_week || '').toString()} • {row.start_time?.slice(0,5)} - {row.end_time?.slice(0,5)} • Room {row.room}</div>
                    <div className="text-gray-400 text-xs">Class: {row.class || '-'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingTt(row);
                        setEditTtData({
                          room: row.room || '',
                          class: row.class || '',
                          day_of_week: (row.day_of_week || 'monday').toString().toLowerCase(),
                          start_time: (row.start_time || '').slice(0,5),
                          end_time: (row.end_time || '').slice(0,5),
                        });
                      }}
                      className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >Edit</button>
                    <button
                      onClick={() => setConfirmDelete({ type: 'tt', id: row.id })}
                      className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm"
                    >Delete</button>
                  </div>
                  {confirmDelete?.type === 'tt' && confirmDelete.id === row.id && (
                    <div className="mt-2 p-2 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-between">
                      <span className="text-sm text-gray-300">Delete this timetable row?</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg bg-gray-700 text-gray-200 text-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        <button
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                          onClick={async () => {
                            const res = await adminAPI.deleteTimetable(row.id);
                            if (res.error) window.alert(res.error);
                            else {
                              window.alert('Timetable deleted');
                              setExistingTt((prev) => prev.filter(r => r.id !== row.id));
                            }
                            setConfirmDelete(null);
                          }}
                        >Confirm</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          </div>

          {/* Create Saturday Mapping */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Create Saturday Mapping</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Date</label>
                <input type="date" value={sat.date} onChange={e=>setSat({...sat, date: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Class</label>
                <select value={sat.class} onChange={e=>setSat({...sat, class: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  <option value="">Select class</option>
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.class || ''}>
                      {(cl.class || '').toString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Timetable Followed</label>
                <select value={sat.tt_followed} onChange={e=>setSat({...sat, tt_followed: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  {['monday','tuesday','wednesday','thursday','friday','saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex justify-end">
                <button onClick={createSaturday} disabled={busy} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-60">Create</button>
              </div>
            </div>
          </div>

          {/* Existing Saturday Mappings */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Existing Saturday Class Mappings</h2>
          <div className="space-y-3">
            {existingSat.length === 0 ? (
              <p className="text-gray-400 text-sm">No entries</p>
            ) : (
              existingSat.map((row) => (
                <div key={row.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl bg-gray-700">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{row.date} • Follows {String(row.tt_followed || '').toUpperCase()}</div>
                    <div className="text-gray-300 text-sm">Class: {row.class || '-'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSat(row);
                        setEditSatData({
                          date: row.date || '',
                          class: row.class || '',
                          tt_followed: (row.tt_followed || 'monday').toString().toLowerCase(),
                        });
                      }}
                      className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >Edit</button>
                    <button
                      onClick={() => setConfirmDelete({ type: 'sat', id: row.id })}
                      className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm"
                    >Delete</button>
                  </div>
                  {confirmDelete?.type === 'sat' && confirmDelete.id === row.id && (
                    <div className="mt-2 p-2 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-between">
                      <span className="text-sm text-gray-300">Delete this Saturday mapping?</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg bg-gray-700 text-gray-200 text-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
                        <button
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                          onClick={async () => {
                            const res = await adminAPI.deleteSaturdayClass(row.id);
                            if (res.error) window.alert(res.error);
                            else {
                              window.alert('Saturday mapping deleted');
                              setExistingSat((prev) => prev.filter(r => r.id !== row.id));
                            }
                            setConfirmDelete(null);
                          }}
                        >Confirm</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Edit modals (non-popup) */}
      {editingTt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Timetable Row</h3>
              <button onClick={()=>setEditingTt(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Room</label>
                <input value={editTtData.room || ''} onChange={e=>setEditTtData({...editTtData, room: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Class</label>
                <select value={editTtData.class || ''} onChange={e=>setEditTtData({...editTtData, class: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  <option value="">Select class</option>
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.class || ''}>{(cl.class || '').toString()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Day of Week</label>
                <select value={editTtData.day_of_week || 'monday'} onChange={e=>setEditTtData({...editTtData, day_of_week: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  {['monday','tuesday','wednesday','thursday','friday','saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Time</label>
                  <input type="time" value={editTtData.start_time || ''} onChange={e=>setEditTtData({...editTtData, start_time: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Time</label>
                  <input type="time" value={editTtData.end_time || ''} onChange={e=>setEditTtData({...editTtData, end_time: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setEditingTt(null)} className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200">Cancel</button>
                <button
                  onClick={async ()=>{
                    if (!editingTt) return;
                    const payload: any = {
                      ...(editTtData.room !== undefined ? { room: editTtData.room } : {}),
                      ...(editTtData.class !== undefined ? { class: editTtData.class } : {}),
                      ...(editTtData.day_of_week ? { day_of_week: editTtData.day_of_week } : {}),
                      ...(editTtData.start_time ? { start_time: editTtData.start_time } : {}),
                      ...(editTtData.end_time ? { end_time: editTtData.end_time } : {}),
                    };
                    const res = await adminAPI.updateTimetable(editingTt.id, payload);
                    if (res.error) window.alert(res.error);
                    else {
                      window.alert('Timetable updated successfully!');
                      const ttRes = await adminAPI.listTimetable();
                      if (!ttRes.error) setExistingTt(ttRes.data?.classes || []);
                    }
                    setEditingTt(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSat && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Saturday Mapping</h3>
              <button onClick={()=>setEditingSat(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Date</label>
                <input type="date" value={editSatData.date || ''} onChange={e=>setEditSatData({...editSatData, date: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Class</label>
                <select value={editSatData.class || ''} onChange={e=>setEditSatData({...editSatData, class: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  <option value="">Select class</option>
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.class || ''}>{(cl.class || '').toString()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Timetable Followed</label>
                <select value={editSatData.tt_followed || 'monday'} onChange={e=>setEditSatData({...editSatData, tt_followed: e.target.value})} className="w-full bg-gray-700 rounded px-3 py-2">
                  {['monday','tuesday','wednesday','thursday','friday','saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setEditingSat(null)} className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200">Cancel</button>
                <button
                  onClick={async ()=>{
                    if (!editingSat) return;
                    const payload: any = {
                      ...(editSatData.date ? { date: editSatData.date } : {}),
                      ...(editSatData.class !== undefined ? { class: editSatData.class } : {}),
                      ...(editSatData.tt_followed ? { tt_followed: editSatData.tt_followed } : {}),
                    };
                    const res = await adminAPI.updateSaturdayClass(editingSat.id, payload);
                    if (res.error) window.alert(res.error);
                    else {
                      window.alert('Saturday mapping updated successfully!');
                      const satRes = await adminAPI.listSaturday();
                      if (!satRes.error) setExistingSat(satRes.data?.saturday_class || []);
                    }
                    setEditingSat(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation removed as requested */}
    </div>
  );
}
