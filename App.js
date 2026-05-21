import { useState, useRef, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const SAMPLE_DATA = [
  { id:1, date:"2024-01-05", product:"Wireless Headphones", category:"Electronics", region:"North", units:42, revenue:5040, cost:2100 },
  { id:2, date:"2024-01-08", product:"Running Shoes", category:"Apparel", region:"South", units:78, revenue:7020, cost:3120 },
  { id:3, date:"2024-01-12", product:"Coffee Maker", category:"Kitchen", region:"East", units:35, revenue:3150, cost:1400 },
  { id:4, date:"2024-01-15", product:"Yoga Mat", category:"Fitness", region:"West", units:110, revenue:4400, cost:1650 },
  { id:5, date:"2024-01-20", product:"Wireless Headphones", category:"Electronics", region:"South", units:55, revenue:6600, cost:2750 },
  { id:6, date:"2024-01-22", product:"Smart Watch", category:"Electronics", region:"North", units:28, revenue:8400, cost:3920 },
  { id:7, date:"2024-02-01", product:"Coffee Maker", category:"Kitchen", region:"West", units:62, revenue:5580, cost:2480 },
  { id:8, date:"2024-02-05", product:"Running Shoes", category:"Apparel", region:"North", units:95, revenue:8550, cost:3800 },
  { id:9, date:"2024-02-10", product:"Laptop Stand", category:"Electronics", region:"East", units:140, revenue:9800, cost:4200 },
  { id:10, date:"2024-02-14", product:"Yoga Mat", category:"Fitness", region:"South", units:88, revenue:3520, cost:1320 },
  { id:11, date:"2024-02-18", product:"Smart Watch", category:"Electronics", region:"West", units:33, revenue:9900, cost:4620 },
  { id:12, date:"2024-02-25", product:"Wireless Headphones", category:"Electronics", region:"East", units:72, revenue:8640, cost:3600 },
  { id:13, date:"2024-03-03", product:"Running Shoes", category:"Apparel", region:"West", units:105, revenue:9450, cost:4200 },
  { id:14, date:"2024-03-08", product:"Coffee Maker", category:"Kitchen", region:"North", units:48, revenue:4320, cost:1920 },
  { id:15, date:"2024-03-15", product:"Laptop Stand", category:"Electronics", region:"South", units:165, revenue:11550, cost:4950 },
  { id:16, date:"2024-03-20", product:"Smart Watch", category:"Electronics", region:"East", units:41, revenue:12300, cost:5740 },
  { id:17, date:"2024-03-25", product:"Yoga Mat", category:"Fitness", region:"North", units:132, revenue:5280, cost:1980 },
  { id:18, date:"2024-04-02", product:"Wireless Headphones", category:"Electronics", region:"West", units:60, revenue:7200, cost:3000 },
  { id:19, date:"2024-04-09", product:"Running Shoes", category:"Apparel", region:"East", units:88, revenue:7920, cost:3520 },
  { id:20, date:"2024-04-15", product:"Coffee Maker", category:"Kitchen", region:"South", units:55, revenue:4950, cost:2200 },
  { id:21, date:"2024-04-20", product:"Laptop Stand", category:"Electronics", region:"North", units:190, revenue:13300, cost:5700 },
  { id:22, date:"2024-04-28", product:"Smart Watch", category:"Electronics", region:"West", units:52, revenue:15600, cost:7280 },
  { id:23, date:"2024-05-05", product:"Yoga Mat", category:"Fitness", region:"South", units:145, revenue:5800, cost:2175 },
  { id:24, date:"2024-05-12", product:"Wireless Headphones", category:"Electronics", region:"North", units:80, revenue:9600, cost:4000 },
  { id:25, date:"2024-05-18", product:"Running Shoes", category:"Apparel", region:"West", units:120, revenue:10800, cost:4800 },
  { id:26, date:"2024-05-24", product:"Laptop Stand", category:"Electronics", region:"East", units:175, revenue:12250, cost:5250 },
  { id:27, date:"2024-06-01", product:"Coffee Maker", category:"Kitchen", region:"North", units:70, revenue:6300, cost:2800 },
  { id:28, date:"2024-06-08", product:"Smart Watch", category:"Electronics", region:"South", units:45, revenue:13500, cost:6300 },
  { id:29, date:"2024-06-15", product:"Yoga Mat", category:"Fitness", region:"East", units:160, revenue:6400, cost:2400 },
  { id:30, date:"2024-06-22", product:"Running Shoes", category:"Apparel", region:"North", units:135, revenue:12150, cost:5400 },
];

const CHART_COLORS = ["#3266ad","#1D9E75","#BA7517","#993556","#7F77DD","#D85A30"];

function fmt(n) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n); }
function fmtNum(n) { return new Intl.NumberFormat("en-US").format(n); }
function fmtPct(n) { return n.toFixed(1) + "%"; }

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
  return lines.slice(1).map((line, idx) => {
    const vals = line.split(",").map(v => v.trim().replace(/"/g,""));
    const obj = { id: idx + 1 };
    headers.forEach((h, i) => {
      const v = vals[i] ?? "";
      obj[h] = isNaN(v) || v === "" ? v : Number(v);
    });
    return obj;
  }).filter(r => r.revenue);
}

export default function App() {
  const [data, setData] = useState(SAMPLE_DATA);
  const [filters, setFilters] = useState({ region:"All", category:"All", product:"All" });
  const [activeTab, setActiveTab] = useState("overview");
  const [importMsg, setImportMsg] = useState("Sample dataset loaded");
  const fileRef = useRef();

  const regions   = ["All", ...new Set(data.map(d => d.region))];
  const categories= ["All", ...new Set(data.map(d => d.category))];
  const products  = ["All", ...new Set(data.map(d => d.product))];

  const filtered = data.filter(r =>
    (filters.region   === "All" || r.region   === filters.region) &&
    (filters.category === "All" || r.category === filters.category) &&
    (filters.product  === "All" || r.product  === filters.product)
  );

  const totalRevenue = filtered.reduce((s,r) => s + r.revenue, 0);
  const totalUnits   = filtered.reduce((s,r) => s + r.units, 0);
  const totalCost    = filtered.reduce((s,r) => s + r.cost, 0);
  const grossProfit  = totalRevenue - totalCost;
  const margin       = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const byMonth = {};
  filtered.forEach(r => {
    const m = r.date.substring(0,7);
    if (!byMonth[m]) byMonth[m] = { month:m, revenue:0, profit:0, units:0 };
    byMonth[m].revenue += r.revenue;
    byMonth[m].profit  += r.revenue - r.cost;
    byMonth[m].units   += r.units;
  });
  const trendData = Object.values(byMonth)
    .sort((a,b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, label: new Date(d.month+"-01").toLocaleString("default",{month:"short"}) }));

  const byProduct = {};
  filtered.forEach(r => {
    if (!byProduct[r.product]) byProduct[r.product] = { product:r.product, revenue:0, units:0 };
    byProduct[r.product].revenue += r.revenue;
    byProduct[r.product].units   += r.units;
  });
  const productData = Object.values(byProduct).sort((a,b) => b.revenue - a.revenue);

  const byCategory = {};
  filtered.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = { category:r.category, revenue:0 };
    byCategory[r.category].revenue += r.revenue;
  });
  const categoryData = Object.values(byCategory);

  const byRegion = {};
  filtered.forEach(r => {
    if (!byRegion[r.region]) byRegion[r.region] = { region:r.region, revenue:0 };
    byRegion[r.region].revenue += r.revenue;
  });
  const regionData = Object.values(byRegion).sort((a,b) => b.revenue - a.revenue);

  const handleFile = useCallback(e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (!parsed.length) throw new Error("No valid rows found");
        setData(parsed);
        setFilters({ region:"All", category:"All", product:"All" });
        setImportMsg(`Loaded ${parsed.length} rows from ${file.name}`);
      } catch(err) {
        setImportMsg("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  const resetData = () => {
    setData(SAMPLE_DATA);
    setFilters({ region:"All", category:"All", product:"All" });
    setImportMsg("Sample dataset loaded");
  };

  const Tooltip2 = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 14px",fontSize:13}}>
        <p style={{margin:"0 0 6px",fontWeight:600}}>{label}</p>
        {payload.map((p,i) => (
          <p key={i} style={{margin:"2px 0",color:p.color}}>
            {p.name}: {p.name.toLowerCase().includes("unit") ? fmtNum(p.value) : fmt(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const card = { background:"#f9fafb", borderRadius:10, padding:"1rem", marginBottom:0 };
  const chartCard = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"1rem 1.25rem" };

  return (
    <div style={{fontFamily:"Segoe UI, sans-serif",maxWidth:960,margin:"0 auto",padding:"2rem 1rem",color:"#111"}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{margin:0,fontSize:24,fontWeight:600}}>Sales Dashboard</h1>
          <p style={{margin:"4px 0 0",fontSize:13,color:"#6b7280"}}>{importMsg} · {filtered.length} transactions</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()}
            style={{fontSize:13,padding:"7px 16px",borderRadius:8,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer"}}>
            ⬆ Import CSV
          </button>
          <button onClick={resetData}
            style={{fontSize:13,padding:"7px 16px",borderRadius:8,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer"}}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:12,marginBottom:"1.5rem",padding:"12px 16px",background:"#f3f4f6",borderRadius:10,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:13,color:"#6b7280",fontWeight:500}}>Filters:</span>
        {[["Region","region",regions],["Category","category",categories],["Product","product",products]].map(([label,key,opts]) => (
          <div key={key} style={{display:"flex",alignItems:"center",gap:6}}>
            <label style={{fontSize:12,color:"#6b7280"}}>{label}</label>
            <select value={filters[key]} onChange={e => setFilters(f => ({...f,[key]:e.target.value}))}
              style={{fontSize:13,padding:"4px 8px",borderRadius:6,border:"1px solid #d1d5db",background:"#fff"}}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        {Object.values(filters).some(v => v !== "All") && (
          <button onClick={() => setFilters({region:"All",category:"All",product:"All"})}
            style={{fontSize:12,padding:"4px 10px",borderRadius:6,border:"1px solid #fca5a5",color:"#dc2626",background:"#fff",cursor:"pointer"}}>
            Clear all
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:"1.5rem"}}>
        {[
          {label:"Total Revenue", value:fmt(totalRevenue), icon:"💰"},
          {label:"Units Sold",    value:fmtNum(totalUnits), icon:"📦"},
          {label:"Gross Profit",  value:fmt(grossProfit),   icon:"📈"},
          {label:"Profit Margin", value:fmtPct(margin),     icon:"🎯"},
        ].map(k => (
          <div key={k.label} style={{...card,display:"flex",flexDirection:"column",gap:6}}>
            <span style={{fontSize:12,color:"#6b7280"}}>{k.icon} {k.label}</span>
            <span style={{fontSize:26,fontWeight:600,letterSpacing:"-0.5px"}}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"2px solid #e5e7eb",marginBottom:"1.25rem"}}>
        {["overview","trends","products","regions"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontSize:13,padding:"8px 20px",background:"none",border:"none",cursor:"pointer",
            borderBottom: activeTab===t ? "2px solid #3266ad" : "2px solid transparent",
            color: activeTab===t ? "#3266ad" : "#6b7280",
            fontWeight: activeTab===t ? 600 : 400,
            textTransform:"capitalize", marginBottom:"-2px"
          }}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={chartCard}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Revenue by Category</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                  {categoryData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",marginTop:8}}>
              {categoryData.map((d,i) => (
                <span key={d.category} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#6b7280"}}>
                  <span style={{width:8,height:8,borderRadius:2,background:CHART_COLORS[i%CHART_COLORS.length]}} />
                  {d.category}
                </span>
              ))}
            </div>
          </div>

          <div style={chartCard}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Revenue by Region</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionData} layout="vertical" margin={{left:0,right:16}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={v => "$"+(v/1000).toFixed(0)+"k"} tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="region" tick={{fontSize:12,fill:"#6b7280"}} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<Tooltip2 />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0,4,4,0]}>
                  {regionData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{...chartCard, gridColumn:"1/-1"}}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Monthly Revenue</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{left:0,right:8,top:4,bottom:0}}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3266ad" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3266ad" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => "$"+(v/1000).toFixed(0)+"k"} tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<Tooltip2 />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3266ad" strokeWidth={2} fill="url(#g1)" dot={{fill:"#3266ad",r:3}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trends */}
      {activeTab === "trends" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={chartCard}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Revenue vs Profit</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{left:0,right:8,top:4,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => "$"+(v/1000).toFixed(0)+"k"} tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<Tooltip2 />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3266ad" strokeWidth={2} dot={{r:4}} />
                <Line type="monotone" dataKey="profit"  name="Profit"  stroke="#1D9E75" strokeWidth={2} dot={{r:4}} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:16,marginTop:8}}>
              {[["Revenue","#3266ad","solid"],["Profit","#1D9E75","dashed"]].map(([l,c,s]) => (
                <span key={l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#6b7280"}}>
                  <span style={{width:20,height:2,background:c,borderBottom:s==="dashed"?"2px dashed "+c:"none",display:"inline-block"}} />
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div style={chartCard}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Monthly Units Sold</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{left:0,right:8,top:4,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<Tooltip2 />} />
                <Bar dataKey="units" name="Units sold" fill="#7F77DD" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Products */}
      {activeTab === "products" && (
        <div style={chartCard}>
          <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Top Products by Revenue</p>
          <ResponsiveContainer width="100%" height={productData.length * 50 + 60}>
            <BarChart data={productData} layout="vertical" margin={{left:8,right:40,top:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tickFormatter={v => "$"+(v/1000).toFixed(0)+"k"} tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="product" tick={{fontSize:12,fill:"#6b7280"}} axisLine={false} tickLine={false} width={140} />
              <Tooltip content={<Tooltip2 />} />
              <Bar dataKey="revenue" name="Revenue" radius={[0,4,4,0]}>
                {productData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <table style={{width:"100%",borderCollapse:"collapse",marginTop:24,fontSize:13}}>
            <thead>
              <tr style={{borderBottom:"2px solid #e5e7eb"}}>
                {["Product","Category","Revenue","Units","Avg Price"].map(h => (
                  <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:12,color:"#6b7280",fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productData.map((p,i) => (
                <tr key={p.product} style={{borderBottom:"1px solid #f3f4f6",background: i%2===0?"#fff":"#fafafa"}}>
                  <td style={{padding:"8px 12px",fontWeight:500}}>{p.product}</td>
                  <td style={{padding:"8px 12px",color:"#6b7280"}}>{filtered.find(r=>r.product===p.product)?.category}</td>
                  <td style={{padding:"8px 12px"}}>{fmt(p.revenue)}</td>
                  <td style={{padding:"8px 12px"}}>{fmtNum(p.units)}</td>
                  <td style={{padding:"8px 12px"}}>{fmt(p.revenue/p.units)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Regions */}
      {activeTab === "regions" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
            {regionData.map((r,i) => (
              <div key={r.region} style={{...card,borderLeft:`4px solid ${CHART_COLORS[i%CHART_COLORS.length]}`}}>
                <p style={{margin:"0 0 4px",fontSize:12,color:"#6b7280"}}>{r.region}</p>
                <p style={{margin:0,fontSize:22,fontWeight:600}}>{fmt(r.revenue)}</p>
                <p style={{margin:"4px 0 0",fontSize:12,color:"#9ca3af"}}>{fmtPct(r.revenue/totalRevenue*100)} of total</p>
              </div>
            ))}
          </div>

          <div style={chartCard}>
            <p style={{margin:"0 0 12px",fontSize:13,fontWeight:600}}>Region Comparison</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={regionData} margin={{left:0,right:8,top:4,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="region" tick={{fontSize:12,fill:"#6b7280"}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => "$"+(v/1000).toFixed(0)+"k"} tick={{fontSize:11,fill:"#9ca3af"}} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<Tooltip2 />} />
                <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]}>
                  {regionData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
