import { Layout } from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { FrequencyGraph } from './components/graph/FrequencyGraph';
import { FavoriteBar } from './components/community/FavoriteBar';
import { BandControls } from './components/controls/BandControls';
import { DevicePanel } from './components/device/DevicePanel';
import { PresetPanel } from './components/presets/PresetPanel';
import { CommunityEQModal } from './components/community/CommunityEQModal';
import { useDevice } from './hooks/useDevice';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  useDevice();
  useKeyboardShortcuts();

  return (
    <>
      <Layout
        header={<Header />}
        graph={<FrequencyGraph />}
        favorites={<FavoriteBar />}
        controls={<BandControls />}
        device={<DevicePanel />}
        presets={<PresetPanel />}
      />
      <CommunityEQModal />
    </>
  );
}
