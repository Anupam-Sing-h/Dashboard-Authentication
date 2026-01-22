// import { useEffect, useState } from 'react';
// import API from '../apis/api';
// import { useNavigate } from 'react-router-dom';
// import { LogOut, Trash2, Edit2, Check, X, Plus } from 'lucide-react'; // Icons for better UI

// const Dashboard = () => {
//   const [tasks, setTasks] = useState([]);
//   const [newTask, setNewTask] = useState('');
  
//   // State for Editing
//   const [editingId, setEditingId] = useState(null); // ID of task being edited
//   const [editText, setEditText] = useState('');     // The text in the edit input

//   const navigate = useNavigate();

//   // 1. Fetch tasks
//   const fetchTasks = async () => {
//     try {
//       const { data } = await API.get('/tasks');
//       setTasks(data);
//     } catch (error) {
//       console.error("Failed to fetch tasks");
//     }
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   // 2. Add Task
//   const handleAddTask = async (e) => {
//     e.preventDefault();
//     if (!newTask.trim()) return;
//     try {
//       await API.post('/tasks', { title: newTask });
//       setNewTask('');
//       fetchTasks();
//     } catch (error) {
//       alert("Failed to add task");
//     }
//   };

//   // 3. Delete Task
//   const handleDelete = async (id) => {
//     if(!window.confirm("Are you sure?")) return;
//     try {
//       await API.delete(`/tasks/${id}`);
//       fetchTasks();
//     } catch (error) {
//       alert("Failed to delete task");
//     }
//   };

//   // 4. Start Editing
//   const startEditing = (task) => {
//     setEditingId(task._id);
//     setEditText(task.title);
//   };

//   // 6. Save (Update) Task
//   const handleUpdate = async (id) => {
//     try {
//       await API.put(`/tasks/${id}`, { title: editText });
//       setEditingId(null); // Stop editing mode
//       fetchTasks();       // Refresh list
//     } catch (error) {
//       alert("Failed to update task");
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
//         <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold">
//           <LogOut size={20} /> Logout
//         </button>
//       </div>

//       {/* Add Task Form */}
//       <form onSubmit={handleAddTask} className="flex gap-2 max-w-2xl mx-auto mb-8">
//         <input 
//           type="text" 
//           className="flex-1 p-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
//           placeholder="Add a new task..." 
//           value={newTask}
//           onChange={(e) => setNewTask(e.target.value)}
//         />
//         <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition">
//           <Plus size={20} /> Add
//         </button>
//       </form>

//       {/* Task List */}
//       <div className="max-w-2xl mx-auto space-y-3">
//         {tasks.map((task) => (
//           <div key={task._id} className="flex justify-between items-center p-4 bg-white rounded shadow hover:shadow-md transition">
            
//             {/* CHECK: Are we editing this specific task? */}
//             {editingId === task._id ? (
//               // --- EDIT MODE ---
//               <div className="flex items-center gap-2 flex-1">
//                 <input 
//                   type="text" 
//                   value={editText} 
//                   onChange={(e) => setEditText(e.target.value)}
//                   className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
//                 />
//                 <button onClick={() => handleUpdate(task._id)} className="text-green-600 hover:bg-green-50 p-2 rounded">
//                   <Check size={20} />
//                 </button>
//               </div>
//             ) : (
//               // --- VIEW MODE ---
//               <>
//                 <span className="text-lg text-gray-700">{task.title}</span>
//                 <div className="flex items-center gap-2">
//                   <button 
//                     onClick={() => startEditing(task)}
//                     className="text-blue-500 hover:bg-blue-50 p-2 rounded transition"
//                   >
//                     <Edit2 size={18} />
//                   </button>
//                   <button 
//                     onClick={() => handleDelete(task._id)}
//                     className="text-red-500 hover:bg-red-50 p-2 rounded transition"
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}
//         {tasks.length === 0 && <p className="text-gray-400 text-center">No tasks yet. Add one!</p>}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import { useEffect, useState } from 'react';
import API from '../apis/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Professional Notifications
import { LogOut, Trash2, Edit2, Check, X, Plus, Search, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for Search
  const [loading, setLoading] = useState(true); // State for Loading Spinner
  
  // Editing States
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const navigate = useNavigate();

  // 1. Fetch Tasks
  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return toast.error("Task cannot be empty");
    
    // Optimistic UI: Make it feel instant
    const tempId = Date.now();
    const optimisticTask = { _id: tempId, title: newTask };
    setTasks([...tasks, optimisticTask]);
    setNewTask('');

    try {
      await API.post('/tasks', { title: newTask.trim() });
      toast.success("Task added!");
      fetchTasks(); // Sync with real DB ID
    } catch (error) {
      toast.error("Failed to add task");
      setTasks(tasks.filter(t => t._id !== tempId)); // Rollback on error
    }
  };

  // 3. Delete Task
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id)); // Remove locally first
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  // 4. Update Task
  const handleUpdate = async (id) => {
    if (!editText.trim()) return;
    try {
      await API.put(`/tasks/${id}`, { title: editText });
      setTasks(tasks.map(t => (t._id === id ? { ...t, title: editText } : t)));
      setEditingId(null);
      toast.success("Task updated!");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  // 5. Filter Logic (The "Search" Requirement)
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your trading notes & tasks</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Search & Add Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <form onSubmit={handleAddTask} className="flex gap-3 mb-4">
            <input 
              type="text" 
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="What needs to be done?" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all">
              <Plus size={20} /> Add
            </button>
          </form>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-2.5 bg-gray-50 border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Task List Section */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10 text-gray-400">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task._id} className="group flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                
                {editingId === task._id ? (
                  // Edit Mode
                  <div className="flex items-center gap-3 flex-1 animate-fadeIn">
                    <input 
                      type="text" 
                      value={editText} 
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button onClick={() => handleUpdate(task._id)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <span className="text-gray-700 font-medium text-lg truncate flex-1">{task.title}</span>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingId(task._id); setEditText(task.title); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(task._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            // Empty State
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <Search className="text-gray-400" size={24} />
              </div>
              <h3 className="text-gray-900 font-medium">No tasks found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adding a new task or changing your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;