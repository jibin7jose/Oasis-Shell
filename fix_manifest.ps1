
$path = "d:\myproject\new\oasis-shell\src\App.tsx"
$content = Get-Content $path -Raw
$fractured = '<span className="text-[10px] font-bold text-indigo-400">{asset.authorizer}</span></span><button onClick={() => handleSealAsset(asset.file_path, asset.file_path.split(" / \).pop() || \Strategic Asset\)} className=\w-full mt-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-amber-500/20 flex items-center justify-center gap-2\><Lock className=\w-3 h-3\ /> Seal within Sentinel</button>'
$replacement = '<span className="text-[10px] font-bold text-indigo-400">{asset.authorizer}</span>\n                          </div>\n                       </div>\n                       <button onClick={() => handleSealAsset(asset.file_path, asset.file_path.split(\"/\").pop() || \"Strategic Asset\")} className=\"w-full mt-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-amber-500/20 flex items-center justify-center gap-2\">\n                          <Lock className=\"w-3 h-3\" /> Seal within Sentinel\n                       </button>\n                    </motion.div>'

$c = $content -replace [regex]::Escape($fractured), $replacement
$c | Set-Content $path -NoNewline
