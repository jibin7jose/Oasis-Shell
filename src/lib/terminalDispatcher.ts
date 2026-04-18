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
          // This would ideally call the mirror sync logic
          store.setNotification(`P2P Mirror handshaking with ${action.payload.node_id}...`);
        }
        break;

      case 'EXECUTE_MACRO':
        if (action.payload.macro_id) {
           store.setNotification(`Synthesizing Macro execution for ${action.payload.macro_id}...`);
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
