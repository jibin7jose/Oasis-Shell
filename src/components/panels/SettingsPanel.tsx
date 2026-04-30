import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Shield, 
  Lock, 
  Cloud, 
  Save, 
  Trash2,
  RefreshCcw,
  Terminal,
  BrainCircuit,
  Fingerprint,
  Activity,
  KeyRound
} from 'lucide-react';
import { useSystemStore } from '../../lib/systemStore';
import { cn } from '../../lib/utils';
import { invokeSafe } from '../../lib/tauri';

export const SettingsPanel: React.FC = () => {
  type SecretMetadata = { name: string; updated_at: string; status: string };
  type SecretHealth = { name: string; required: boolean; present: boolean; stale: boolean; updated_at?: string; status: string };
  type SecretEvent = { timestamp: string; message: string };
  type KeyCustodyStatus = { hardware_backed: boolean; vault_unlocked: boolean; auth_fresh_seconds: number; biometric_fresh: boolean };
  const { 
    sparklinesEnabled, setSparklinesEnabled,
    performanceOptimized, setPerformanceOptimized,
    isVaultAuthenticated,
    hardwareAnchorActive, setHardwareAnchorActive,
    logEvent
  } = useSystemStore();
  const [secretName, setSecretName] = useState("DEEPSEEK_API_KEY");
  const [secretValue, setSecretValue] = useState("");
  const [secretFeedback, setSecretFeedback] = useState("");
  const [storedSecrets, setStoredSecrets] = useState<SecretMetadata[]>([]);
  const [secretHealth, setSecretHealth] = useState<SecretHealth[]>([]);
  const [secretEvents, setSecretEvents] = useState<SecretEvent[]>([]);
  const [backupPath, setBackupPath] = useState("./vault/secrets-backup.oasisbak");
  const [restorePath, setRestorePath] = useState("./vault/secrets-backup.oasisbak");
  const [replaceOnRestore, setReplaceOnRestore] = useState(true);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");
  const [revokeConfirmArmed, setRevokeConfirmArmed] = useState(false);
  const [revokeConfirmText, setRevokeConfirmText] = useState("");
  const [custodyStatus, setCustodyStatus] = useState<KeyCustodyStatus | null>(null);

  useEffect(() => {
    const syncSecrets = async () => {
      try {
        const metadata = await invokeSafe<SecretMetadata[]>("vault_list_secrets_metadata");
        setStoredSecrets(Array.isArray(metadata) ? metadata : []);
        const health = await invokeSafe<SecretHealth[]>("get_secret_health");
        setSecretHealth(Array.isArray(health) ? health : []);
        const events = await invokeSafe<SecretEvent[]>("get_secret_security_events", { limit: 8 });
        setSecretEvents(Array.isArray(events) ? events : []);
        const custody = await invokeSafe<KeyCustodyStatus>("get_key_custody_status");
        setCustodyStatus(custody ?? null);
      } catch {
        setStoredSecrets([]);
        setSecretHealth([]);
        setSecretEvents([]);
        setCustodyStatus(null);
      }
    };
    syncSecrets();
  }, []);

  const handleClearCache = () => {
    localStorage.clear();
    logEvent("System Cache Purged", "system");
    window.location.reload();
  };

  const handleLockVault = async () => {
    try {
      await invokeSafe("lock_sentinel");
      window.location.reload(); // Force lock state UI refresh
    } catch (e) {
      console.error(e);
    }
  };

  const handleProvisionSecret = async () => {
    if (!isVaultAuthenticated) {
      setSecretFeedback("Unlock Sentinel Vault before provisioning secrets.");
      return;
    }
    if (!secretName.trim() || !secretValue.trim()) {
      setSecretFeedback("Secret name and value are required.");
      return;
    }
    try {
      await invokeSafe("provision_secret", { name: secretName.trim(), value: secretValue.trim() });
      const metadata = await invokeSafe<SecretMetadata[]>("vault_list_secrets_metadata");
      setStoredSecrets(Array.isArray(metadata) ? metadata : []);
      const health = await invokeSafe<SecretHealth[]>("get_secret_health");
      setSecretHealth(Array.isArray(health) ? health : []);
      setSecretValue("");
      setSecretFeedback("Encrypted secret provisioned.");
      logEvent(`Secret provisioned: ${secretName.trim()}`, "system");
    } catch (e) {
      setSecretFeedback(`Provision failed: ${String(e)}`);
    }
  };

  const handleRotateSecret = async () => {
    if (!isVaultAuthenticated) {
      setSecretFeedback("Unlock Sentinel Vault before rotating secrets.");
      return;
    }
    if (!secretName.trim() || !secretValue.trim()) {
      setSecretFeedback("Secret name and new value are required.");
      return;
    }
    try {
      await invokeSafe("rotate_secret", { name: secretName.trim(), value: secretValue.trim() });
      const metadata = await invokeSafe<SecretMetadata[]>("vault_list_secrets_metadata");
      setStoredSecrets(Array.isArray(metadata) ? metadata : []);
      const health = await invokeSafe<SecretHealth[]>("get_secret_health");
      setSecretHealth(Array.isArray(health) ? health : []);
      setSecretValue("");
      setSecretFeedback("Encrypted secret rotated.");
      logEvent(`Secret rotated: ${secretName.trim()}`, "system");
    } catch (e) {
      setSecretFeedback(`Rotate failed: ${String(e)}`);
    }
  };

  const handleDeleteSecret = async (name: string) => {
    if (!isVaultAuthenticated) {
      setSecretFeedback("Unlock Sentinel Vault before deleting secrets.");
      return;
    }
    try {
      const removed = await invokeSafe<boolean>("delete_secret", { name });
      const metadata = await invokeSafe<SecretMetadata[]>("vault_list_secrets_metadata");
      setStoredSecrets(Array.isArray(metadata) ? metadata : []);
      const health = await invokeSafe<SecretHealth[]>("get_secret_health");
      setSecretHealth(Array.isArray(health) ? health : []);
      setSecretFeedback(removed ? `Secret deleted: ${name}` : `Secret not found: ${name}`);
      if (removed) {
        logEvent(`Secret deleted: ${name}`, "system");
      }
    } catch (e) {
      setSecretFeedback(`Delete failed: ${String(e)}`);
    }
  };

  const handleExportBackup = async () => {
    if (!isVaultAuthenticated) {
      setSecretFeedback("Unlock Sentinel Vault before exporting backup.");
      return;
    }
    try {
      const out = await invokeSafe<string>("export_secrets_backup", { target_path: backupPath });
      setSecretFeedback(`Backup exported: ${out}`);
    } catch (e) {
      setSecretFeedback(`Backup failed: ${String(e)}`);
    }
  };

  const handleRestoreBackup = async () => {
    if (!isVaultAuthenticated) {
      setSecretFeedback("Unlock Sentinel Vault before restoring backup.");
      return;
    }
    if (restoreConfirmText.trim().toUpperCase() !== "RESTORE") {
      setSecretFeedback("Type RESTORE to confirm backup recovery.");
      return;
    }
    if (!restorePath.endsWith(".oasisbak")) {
      setSecretFeedback("Restore aborted: backup file must use .oasisbak extension.");
      return;
    }
    try {
      const restored = await invokeSafe<number>("restore_secrets_backup", {
        source_path: restorePath,
        replace_existing: replaceOnRestore,
      });
      const metadata = await invokeSafe<SecretMetadata[]>("vault_list_secrets_metadata");
      setStoredSecrets(Array.isArray(metadata) ? metadata : []);
      const health = await invokeSafe<SecretHealth[]>("get_secret_health");
      setSecretHealth(Array.isArray(health) ? health : []);
      setSecretFeedback(`Backup restored: ${restored} secrets`);
      setRestoreConfirmText("");
    } catch (e) {
      setSecretFeedback(`Restore failed: ${String(e)}`);
    }
  };

  const handleRevokeAllSecrets = async () => {
    if (!isVaultAuthenticated) {
      setSecretFeedback("Unlock Sentinel Vault before revoking all secrets.");
      return;
    }
    if (!revokeConfirmArmed) {
      setRevokeConfirmArmed(true);
      setSecretFeedback("Confirmation step armed. Type REVOKE ALL and confirm.");
      return;
    }
    if (revokeConfirmText.trim().toUpperCase() !== "REVOKE ALL") {
      setSecretFeedback("Confirmation phrase mismatch. Type REVOKE ALL.");
      return;
    }
    try {
      const removed = await invokeSafe<number>("revoke_all_secrets");
      const metadata = await invokeSafe<SecretMetadata[]>("vault_list_secrets_metadata");
      setStoredSecrets(Array.isArray(metadata) ? metadata : []);
      const health = await invokeSafe<SecretHealth[]>("get_secret_health");
      setSecretHealth(Array.isArray(health) ? health : []);
      setSecretFeedback(`All secrets revoked: ${removed}`);
      setRevokeConfirmArmed(false);
      setRevokeConfirmText("");
    } catch (e) {
      setSecretFeedback(`Revoke-all failed: ${String(e)}`);
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">System Configuration</h2>
        <p className="text-slate-500 font-medium tracking-widest text-[10px] uppercase">Kernel Parameters & Neural Engine Permissions</p>
      </div>

      {/* Security & Access Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Security & Authentication</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass rounded-[2rem] border border-white/5 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black text-white">Sentinel Vault</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master Lockdown</span>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                isVaultAuthenticated ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {isVaultAuthenticated ? "Unlocked" : "Locked"}
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When locked, strategic assets are AES-256 encrypted and inaccessible to the host OS.
            </p>
            {isVaultAuthenticated && (
              <button 
                onClick={handleLockVault}
                className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Immediate Lockdown
              </button>
            )}
          </div>

          <div className="glass rounded-[2rem] border border-white/5 p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-indigo-400" />
                  <span className="text-lg font-black text-white">Hardware Anchor</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Biometric (Windows Hello/TPM)</span>
              </div>
              <button 
                onClick={() => setHardwareAnchorActive(!hardwareAnchorActive)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-500 p-1",
                  hardwareAnchorActive ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-all duration-500",
                  hardwareAnchorActive ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">
              Bind high-signature strategic manifestations to physical biometric presence check.
            </p>
          </div>

          <div className="glass rounded-[2rem] border border-white/5 p-8 flex flex-col gap-5 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">Encrypted Secret Provisioning</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Founder-only key ingestion</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Stored: {storedSecrets.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                placeholder="DEEPSEEK_API_KEY"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-mono outline-none focus:border-indigo-500/40 transition-all font-bold"
              />
              <input
                type="password"
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="Paste secret value"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-mono outline-none focus:border-indigo-500/40 transition-all font-bold"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleProvisionSecret}
                className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20"
              >
                Encrypt and Store Secret
              </button>
              <button
                onClick={handleRotateSecret}
                className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-amber-500/20"
              >
                Rotate Selected Secret
              </button>
            </div>
            {secretFeedback && <p className="text-[10px] text-slate-400">{secretFeedback}</p>}
            <p className="text-[10px] text-slate-500">
              Active keys: {storedSecrets.length ? storedSecrets.map((s) => s.name).join(", ") : "None provisioned"}
            </p>
            {storedSecrets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {storedSecrets.map((secret) => (
                  <div key={secret.name} className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
                    <button
                      onClick={() => setSecretName(secret.name)}
                      className="text-[10px] text-slate-300 font-mono hover:text-white transition-colors"
                    >
                      {secret.name}
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-500">
                        {new Date(secret.updated_at).toLocaleString()} · {secret.status}
                      </span>
                      <button
                        onClick={() => handleDeleteSecret(secret.name)}
                        className="text-[9px] uppercase tracking-widest font-black text-rose-400 hover:text-rose-300"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={backupPath}
                onChange={(e) => setBackupPath(e.target.value)}
                placeholder="./vault/secrets-backup.json"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[10px] text-white font-mono outline-none"
              />
              <button onClick={handleExportBackup} className="py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20">
                Export Backup
              </button>
            </div>
            {!backupPath.endsWith(".oasisbak") && (
              <p className="text-[10px] text-amber-400">Warning: use `.oasisbak` extension for encrypted backup manifests.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={restorePath}
                onChange={(e) => setRestorePath(e.target.value)}
                placeholder="./vault/secrets-backup.json"
                className="md:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[10px] text-white font-mono outline-none"
              />
              <button onClick={handleRestoreBackup} className="py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-cyan-500/20">
                Restore Backup
              </button>
            </div>
            {!restorePath.endsWith(".oasisbak") && (
              <p className="text-[10px] text-rose-400">Restore blocked risk: selected file does not use `.oasisbak` extension.</p>
            )}
            <label className="flex items-center gap-2 text-[10px] text-slate-400">
              <input type="checkbox" checked={replaceOnRestore} onChange={(e) => setReplaceOnRestore(e.target.checked)} />
              Replace existing secrets during restore
            </label>
            <input
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="Type RESTORE to confirm"
              className="w-full bg-white/5 border border-cyan-500/20 rounded-xl py-2 px-3 text-[10px] text-white font-mono outline-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={revokeConfirmText}
                onChange={(e) => setRevokeConfirmText(e.target.value)}
                placeholder="Type REVOKE ALL"
                className="md:col-span-2 w-full bg-white/5 border border-rose-500/20 rounded-xl py-2 px-3 text-[10px] text-white font-mono outline-none"
              />
              <button onClick={handleRevokeAllSecrets} className="py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-500/20">
                {revokeConfirmArmed ? "Confirm Revoke All" : "Arm Revoke All"}
              </button>
            </div>
            {secretHealth.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Secret Health</p>
                {secretHealth.map((h) => (
                  <div key={h.name} className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{h.name}</span>
                    <span>{h.status}{h.updated_at ? ` · ${new Date(h.updated_at).toLocaleDateString()}` : ""}</span>
                  </div>
                ))}
              </div>
            )}
            {secretEvents.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Recent Secret Events</p>
                {secretEvents.map((ev, i) => (
                  <div key={`${ev.timestamp}-${i}`} className="text-[10px] text-slate-400">
                    {new Date(ev.timestamp).toLocaleString()} · {ev.message}
                  </div>
                ))}
              </div>
            )}
            {custodyStatus && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Key Custody</p>
                <div className="text-[10px] text-slate-400">Storage: {custodyStatus.hardware_backed ? "Hardware-backed (DPAPI)" : "In-memory fallback"}</div>
                <div className="text-[10px] text-slate-400">Vault Session: {custodyStatus.vault_unlocked ? "Unlocked" : "Locked"}</div>
                <div className="text-[10px] text-slate-400">Auth Freshness: {custodyStatus.auth_fresh_seconds < 0 ? "N/A" : `${custodyStatus.auth_fresh_seconds}s ago`}</div>
                <div className="text-[10px] text-slate-400">Biometric Fresh: {custodyStatus.biometric_fresh ? "Yes" : "No (re-auth required for backup/restore/revoke-all)"}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Performance Tuning</h3>
        </div>

        <div className="glass rounded-[2.5rem] border border-white/5 divide-y divide-white/5 overflow-hidden">
          <div className="p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Real-time Sparklines</p>
                <p className="text-[10px] text-slate-500 font-medium">Render live micro-graphs for process load</p>
              </div>
            </div>
            <button 
              onClick={() => setSparklinesEnabled(!sparklinesEnabled)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-500 p-1",
                sparklinesEnabled ? "bg-amber-500" : "bg-white/10"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all duration-500",
                sparklinesEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="p-8 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Extreme Performance Mode</p>
                <p className="text-[10px] text-slate-500 font-medium">Bypass animation smoothing for maximum throughput</p>
              </div>
            </div>
            <button 
              onClick={() => setPerformanceOptimized(!performanceOptimized)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-500 p-1",
                performanceOptimized ? "bg-indigo-500" : "bg-white/10"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all duration-500",
                performanceOptimized ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>
      </section>

      {/* Sensory Bridge Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Sensory Feedback Bridge</h3>
        </div>

        <div className="glass rounded-[2.5rem] border border-white/5 p-8 space-y-8">
           <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Active Sensory Feedback</p>
                  <p className="text-[10px] text-slate-500 font-medium">Enable hardware RGB sync and dynamic audio engine</p>
                </div>
              </div>
              <button 
                onClick={() => setSensoryFeedbackEnabled(!sensoryFeedbackEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-500 p-1",
                  sensoryFeedbackEnabled ? "bg-indigo-500" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-all duration-500",
                  sensoryFeedbackEnabled ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Aura IP (WLED/Philips Hue)</label>
              <div className="relative group">
                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                <input 
                  type="text" 
                  value={auraIp}
                  onChange={(e) => setAuraIp(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-6 text-xs text-white font-mono outline-none focus:border-indigo-500/40 transition-all font-bold"
                />
              </div>
           </div>
        </div>
      </section>

      {/* Neural Config Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Neural Engine config</h3>
        </div>

        <div className="glass rounded-[2.5rem] border border-white/5 p-8 space-y-8">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ollama Endpoint</label>
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase">Connected</span>
              </div>
              <div className="relative group">
                <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                <input 
                  type="text" 
                  defaultValue="http://localhost:11434"
                  readOnly
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-6 text-xs text-white font-mono outline-none focus:border-indigo-500/40 transition-all font-bold"
                />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Model</label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                   <span className="text-xs font-black text-white tracking-widest uppercase">Gemma3:4b</span>
                   <RefreshCcw className="w-3 h-3 text-slate-600 cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Context Window</label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white tracking-widest uppercase text-center">
                   4096 Tokens
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* System Maintenance Section */}
      <section className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Save className="w-5 h-5 text-rose-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Foundation Maintenance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <button 
             onClick={handleClearCache}
             className="glass rounded-3xl border border-white/5 p-8 flex items-center gap-6 group hover:border-rose-500/30 transition-all text-left"
           >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Purge Cache</p>
                <p className="text-[10px] text-slate-500 font-medium">Clear local state and neural context</p>
              </div>
           </button>
           
           <button className="glass rounded-3xl border border-white/5 p-8 flex items-center gap-6 group hover:border-indigo-500/30 transition-all text-left cursor-not-allowed opacity-50">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">Sync Cloud</p>
                <p className="text-[10px] text-slate-500 font-medium italic">Pending distributed sync implementation</p>
              </div>
           </button>
        </div>
      </section>
    </div>
  );
};

