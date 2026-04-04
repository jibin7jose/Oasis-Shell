import os
import re

path = r'd:\myproject\new\oasis-shell\src\components\overlays\CommandPalette.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State Injection
if 'const [chronosResults' not in content:
    old_st = "  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);"
    new_st = "  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);\n  const [chronosResults, setChronosResults] = useState<any[]>([]);"
    content = content.replace(old_st, new_st)

# 2. Effect Update for /seek
search_v2 = """  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setSemanticResults([]);
      setChronosResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (q.startsWith('/seek ')) {
          const seekQ = q.slice(6).trim();
          if (seekQ.length >= 2) {
            const results = await invoke<any[]>("seek_chronos", { query: seekQ, limit: 10 });
            setChronosResults(results);
          }
        } else {
          const results = await invoke<SearchResult[]>("search_semantic_nodes", { query: q });
          setSemanticResults(results);
        }
      } catch (e) {
        console.error("Cortex Search Failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);"""

old_eff_pattern = r'  useEffect\(\(\) => \{[\s\S]+?\}, \[query\]\);'
content = re.sub(old_eff_pattern, search_v2, content)

# 3. UI Display for Chronos Results
if '{chronosResults.length > 0 && (' not in content:
    # After semanticResults
    sem_dis_pattern = r'\{semanticResults\.length > 0 && \([\s\S]+?\}\s+\)\}'
    chronos_dis = """{chronosResults.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-6 px-4">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chronos ledger Insights</h3>
              </div>
              <div className="space-y-4">
                {chronosResults.map((res, i) => (
                  <div key={i} className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border",
                        res.source === 'PINNED_CONTEXT' ? "bg-amber-500/10 border-amber-500/20" : "bg-indigo-500/10 border-indigo-500/20"
                      )}>
                        <Activity className={cn("w-5 h-5", res.source === 'PINNED_CONTEXT' ? "text-amber-400" : "text-indigo-400")} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.source}</span>
                        <h4 className="text-sm font-bold text-white transition-colors group-hover:text-amber-400">{res.title || res.message}</h4>
                        <span className="text-[9px] font-mono text-slate-600 mt-0.5">{res.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}"""
    # Finding a good place to inject. Let's find semanticResults end
    content = content.replace("          {semanticResults.length > 0 && (", chronos_dis + "\n          {semanticResults.length > 0 && (")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Chronos Search Injection Successful.")
