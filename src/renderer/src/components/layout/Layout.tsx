import type { ReactNode } from 'react';

interface Props {
  header: ReactNode;
  graph: ReactNode;
  favorites?: ReactNode;
  controls: ReactNode;
  device: ReactNode;
  presets: ReactNode;
}

export function Layout({ header, graph, favorites, controls, device, presets }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {header}

      <main className="flex-1 px-4 pb-6 flex flex-col gap-4 max-w-[1400px] mx-auto w-full">
        {/* Graph - full width */}
        {graph}

        {/* Favorite EQ quick-access */}
        {favorites}

        {/* Bottom section: Controls left, Device+Presets right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {controls}

          <div className="flex flex-col gap-4">
            {device}
            {presets}
          </div>
        </div>
      </main>
    </div>
  );
}
