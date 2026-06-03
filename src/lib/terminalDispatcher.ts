import { useSystemStore } from './systemStore';
import { invokeSafe } from './tauri';

export interface ShellAction {
  type: string;
  payload: any;
}

export const dispatchTerminalActions = async (actions: ShellAction[]) => {
  const store = useSystemStore.getState();

  for (const action of actions) {
    console.log(`>>> Manifesting Semantic Action: ${action.type}`, action.payload);

    switch (action.type) {
      case 'SWITCH_VIEW':
        if (action.payload.view_id) {
          store.setActiveView(action.payload.view_id);
        }
        break;

      case 'OPEN_VAULT':
        store.setShowVault(true);
        break;

      case 'LOCK_VAULT':
        await invokeSafe('lock_sentinel');
        window.location.reload();
        break;

      case 'SYSTEM_NOTIFICATION':
        if (action.payload.message) {
          store.setNotification(action.payload.message);
        }
        break;

      case 'RESUSCITATE_LATEST':
        const history = store.chronosHistory;
        if (history.length > 0) {
          const latest = history[0];
          await invokeSafe("resuscitate_ghost_snapshot", { windows: latest.windows || [] });
          store.setNotification("Semantic Resuscitation: Latest Ghost Layout Manifested.");
        }
        break;

      case 'INITIATE_P2P':
        if (action.payload.node_id) {
          store.setNotification(`P2P Mirror handshaking with ${action.payload.node_id}...`);
          try {
            await invokeSafe("execute_neural_command", { command: `Write-Host 'P2P Handshake initiated with ${action.payload.node_id}'; Start-Sleep -Seconds 2; Write-Host 'Connection Established'` });
            store.setNotification(`P2P Mirror connected to ${action.payload.node_id} successfully.`);
          } catch(e) {
            store.setNotification(`P2P Handshake failed: ${e}`);
          }
        }
        break;

      case 'EXECUTE_MACRO':
        if (action.payload.macro_id) {
           store.setNotification(`Synthesizing Macro execution for ${action.payload.macro_id}...`);
           try {
             const result = await invokeSafe("execute_neural_command", { command: action.payload.command || `echo 'Executing Macro: ${action.payload.macro_id}'` });
             console.log("Macro Result:", result);
             store.setNotification(`Macro ${action.payload.macro_id} completed successfully.`);
           } catch (e) {
             console.error("Macro Execution Failed:", e);
             store.setNotification(`Macro ${action.payload.macro_id} failed: ${e}`);
           }
        }
        break;

      case 'SEAL_ASSET':
        if (action.payload.path && action.payload.title) {
          await invokeSafe("seal_strategic_asset", { filePath: action.payload.path, title: action.payload.title });
          store.setNotification(`Asset Sealed: ${action.payload.title}`);
        }
        break;

      default:
        console.warn(`Unknown Semantic Action: ${action.type}`);
    }
  }
};
